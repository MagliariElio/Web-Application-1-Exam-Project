'use strict';

const crypto = require('crypto');
const db = require('./db');
const User = require('../model/User');
const Page = require('../model/Page');
const Image = require('../model/Image');
const Content = require('../model/Content');


// UTILITIES

/**
 * It helps to convert an object user from the database to object user used in the system
 * 
 * @param user user obj retrieved from the database 
 * @returns obj user
 */
const mapObjToUser = async (user) => {
    const statistics = await calculateStatisticPagesUser(user.id);
    const { number_pages_published, number_pages_created, number_pages_removed, number_pages_programmed, number_pages_draft } = statistics;

    return new User(user.id, user.email, user.username, user.name, user.surname, user.role, number_pages_published,
        number_pages_created, number_pages_removed, number_pages_programmed, number_pages_draft);
};

/**
 * It helps to convert an object user from the database to object user used in the system
 * 
 * @param user user obj retrieved from the database 
 * @returns obj user
 */
const mapObjToPage = async (page) => {
    const user = await this.getUserById(page.user_id);
    const contents = await this.getAllContentsOfPageById(page.id);  // add all contents of the page
    await Promise.all(contents);

    return new Page(
        page.id,
        page.title,
        page.release_date,
        page.creation_date,
        page.deleted,
        user,
        contents);
};

/**
 * It helps to convert an object content from the database to object content used in the system
 * 
 * @param content content obj retrieved from the database 
 * @returns obj content
 */
const mapObjToContent = async (content) => {
    content.paragraph = content.paragraph === null ? undefined : content.paragraph;
    content.image = content.image_id === null ? undefined : content.image_id;
    content.image = await this.getImageById(content.image);

    return new Content(
        content.id,
        content.header,
        content.paragraph,
        content.sort_number,
        content.image);
}

/**
 * It helps to convert an object content from the database to object content used in the system
 * 
 * @param images list of images retrieved from the database
 * @returns list of images
 */
const mapObjToImage = (image) => {
    return new Image(image.id, image.src, image.alt, image.title, image.website_name);
}

/**
 * This allow you to know a simple user statistics
 * 
 * @param user_id user id to calculate statistics 
 */
const calculateStatisticPagesUser = async (user_id) => {
    let pages = await dbAllAsync("SELECT * FROM page WHERE user_id = ?", [user_id]);         // it can not use getAllPages because it goes in loop, getAllPages -> mapObjToPage -> getUserById -> mapObjToUser -> calculateStatisticPagesUser -> getAllPages

    const current_date = new Date();

    const number_pages_removed = pages.filter(page => page.deleted === 1).length;
    const number_pages_created = pages.length;
    pages = pages.filter(page => page.deleted !== 1);       // remove all pages deleted in order to calculate statistics about page published and programmed
    
    const number_pages_draft = pages.filter(page => page.release_date === undefined || page.release_date === null).length;
    pages = pages.filter(page => (page.release_date !== undefined && page.release_date !== null));      // remove all draft pages

    const number_pages_published = pages.filter(page => new Date(page.release_date) <= current_date).length;
    const number_pages_programmed = pages.filter(page => new Date(page.release_date) > current_date).length;

    return ({ number_pages_published, number_pages_created, number_pages_removed, number_pages_programmed, number_pages_draft });
}

/**
 * Wrapper around db.all
 */
const dbAllAsync = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

/**
 * Wrapper around db.run
 */
const dbRunAsync = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
    });
});

/**
 * Wrapper around db.get
 */
const dbGetAsync = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
    });
});


// DAO FUNCTIONS

/**
 * Get all users from the system
 */
exports.getAllUsers = async () => {
    let users = await dbAllAsync("SELECT * FROM user");
    users = users.map(user => mapObjToUser(user));
    users = await Promise.all(users);
    return users;
}

/**
 * Retrieve the user with the specified id
 * 
 * @param id the id of the user
 * @returns Promise that resolves to the user
 */
exports.getUserById = async (id) => {
    const user = await dbGetAsync("SELECT * FROM user WHERE id = ?", [id]);
    return mapObjToUser(user);
};

/**
 * Retrieve all images
 * 
 * @returns list of images 
 */
exports.getAllImages = async () => {
    let images = await dbAllAsync("SELECT * FROM image");
    images = images.map(image => mapObjToImage(image));
    return images;
}

/**
 * Retrieve an image by id
 * 
 * @returns image
 */
exports.getImageById = async (id) => {
    let image = undefined;

    if (id !== undefined) {
        const images = await this.getAllImages();
        image = images.filter(image => image.id == id).shift();
    }
    return image;
}

/**
 * Add all content blocks of a page
 * 
 * @param page_id id of the page to link all content blocks
 * @param contentsList list of content blocks 
 * @returns page with all information added
 */
exports.createContents = async (page_id, contentsList) => {
    const contents = contentsList.map(content =>
        dbRunAsync("INSERT INTO content (header, paragraph, sort_number, page_id, image_id) VALUES (?, ?, ?, ?, ?)",
            [content.header, content.paragraph, content.sort_number, page_id, content.image && content.image.id])
    );
    await Promise.all(contents);
    return await this.getPageById(page_id);
};

/**
 * Edit all content blocks related a page
 * 
 * @param page_id page id of content blocks are related to 
 * @param contentsList list of content blocks
 * @returns page updated
 */
exports.editContents = async (page_id, contentsList) => {
    const contents = contentsList.map(content =>
        dbRunAsync("UPDATE content SET header = ?, paragraph = ?, sort_number = ?, image_id = ? WHERE id = ?",
            [content.header, content.paragraph, content.sort_number, content.image && content.image.id, content.id])
    );
    await Promise.all(contents);
    return await this.getPageById(page_id);
};

/**
 * Remove content blocks from the page
 * 
 * @param page_id page id of content blocks are related to 
 * @param contentsList list of content blocks
 * @returns page updated 
 */
exports.removeContents = async (page_id, contentsList) => {
    const contents = contentsList.map(content =>
        dbRunAsync("DELETE FROM content WHERE page_id = ? AND id = ?", [page_id, content.id]))
    await Promise.all(contents);
    return await this.getPageById(page_id);
}

/**
 * Get Website Name
 */
exports.getWebsiteName = async () => {
    return await dbGetAsync("SELECT DISTINCT website_name FROM image");
}

/**
 * Edit the website name
 * 
 * @param website_name website name to update
 */
exports.editWebsiteName = async (website_name) => {
    return await dbRunAsync("UPDATE image SET website_name = ?", [website_name]);
}

/**
 * Get all contents related to a page
 * 
 * @param page_id id page 
 */
exports.getAllContentsOfPageById = async (page_id) => {
    let contentsList = await dbAllAsync("SELECT * FROM content WHERE page_id = ? ORDER BY sort_number ASC", [page_id]);
    contentsList = contentsList.map(content => mapObjToContent(content));
    contentsList = await Promise.all(contentsList);
    return contentsList;
}

/**
 * Get all pages from the database
 */
exports.getAllPages = async () => {
    let pagesList = await dbAllAsync("SELECT * FROM page WHERE deleted == 0 ORDER BY release_date ASC");
    pagesList = pagesList.map(page => mapObjToPage(page));
    pagesList = await Promise.all(pagesList);
    return pagesList;
};

/**
 * Search a page with the specified id
 * 
 * @param id id of the page to search
 */
exports.getPageById = async (id) => {
    const pageList = await this.getAllPages();
    let page = pageList.filter(page => page.id == id).shift();
    return page;
};

/**
 * Add a new page
 * 
 * @param page page with information
 * @return new page with all information added
 */
exports.createPage = async (page) => {
    const page_id = await dbRunAsync("INSERT INTO page (title, release_date, creation_date, deleted, user_id) VALUES (?, ?, ?, ?, ?)",
        [page.title, page.release_date, page.creation_date, page.deleted, page.user.id]);

    return await this.createContents(page_id, page.contents);
};

/**
 * Edit an existing page with new information
 * 
 * @param page page with information to edit
 * @param listContentsBlockToRemove list of content blocks to remove from the page
 * @returns Promise
 */
exports.editPage = async (page, listContentsBlockToRemove) => {
    await dbRunAsync("UPDATE page SET title = ?, release_date = ?, user_id = ? WHERE id = ?",
        [page.title, page.release_date, page.user.id, page.id]);

    // it checks if all contents have an id field, just to be sure to add the contents in the system
    page.contents.forEach(content => {
        if (!content.hasOwnProperty('id')) {
            content.id = -1;
        }
    });

    const newContents = page.contents.filter(content => content.id < 0);            // these are the contents block to add
    const refreshContents = page.contents.filter(content => content.id >= 0);       // these are the contents block to edit

    this.createContents(page.id, newContents);
    this.editContents(page.id, refreshContents);
    this.removeContents(page.id, listContentsBlockToRemove);

    return this.getPageById(page.id);
};

/**
 * Delete a page with a specified id, but the deleting is done 
 * logically setting just the deleted field in the row that correspond to the id value
 * 
 * @param id id page to delete 
 * @returns Promise
 */
exports.deletePage = async (id) => {
    return dbRunAsync("UPDATE page SET deleted = 1 WHERE id = ?", [id]);
};

/**
   * Authenticate a user from their email and password
   * 
   * @param email email of the user to authenticate
   * @param password password of the user to authenticate
   * 
   * @returns a Promise that resolves to the user object
   */
exports.authUser = (email, password) => new Promise((resolve, reject) => {
    dbGetAsync(
        "SELECT * FROM user WHERE email = ?",
        [email]
    )
        .then(user => {
            // If there is not such user, resolve to false
            if (!user) resolve(false);

            // Verify the password
            crypto.scrypt(password, user.salt, 32, (err, hash) => {
                if (err) reject(err);

                if (crypto.timingSafeEqual(hash, Buffer.from(user.hash, 'hex'))) {
                    resolve(mapObjToUser(user));
                } else {
                    resolve(false);
                }
            });
        })
        .catch(e => reject(e));
});