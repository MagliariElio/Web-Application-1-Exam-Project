'use strict';

const express = require('express');
const morgan = require('morgan');
const { validationResult, body } = require('express-validator');
const cors = require('cors');
const pagesDao = require('./dao/pages-dao');
const passport = require('passport');
const dayjs = require('dayjs');

const Page = require('./model/Page');
const Content = require('./model/Content');

const { inializeAuthentication, isLoggedIn } = require('./authentication');
const Image = require('./model/Image');

// init express
const app = new express();
const port = 3001;
const corsOption = {
  origin: 'http://localhost:5173',
  credentials: true
}

// set-up middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cors(corsOption));

inializeAuthentication(app, pagesDao);

/**
 * Get all pages
 * 
 * This is an open endpoint: non authenticated users can still access this
 */
app.get("/api/pages",
  async (req, res) => {
    try {
      let pages = await pagesDao.getAllPages();

      if (pages == undefined) {
        return res.status(404).json({ error: ['There is no page yet!'] });
      }

      let current_date = new Date();

      if (req.user === undefined) {   // if the user is not logged can not see all pages (front office)
        pages = pages.filter(page => ((page.release_date !== null) && (new Date(page.release_date) <= current_date)));
      }

      res.json(pages);
    } catch (err) {
      res.status(503).json({ error: [`Error in database while taking the pages: '${err}'`] });
    }
  });

/**
* Get all image paths
* 
* This is an open endpoint: non authenticated users can still access this
*/
app.get("/api/images",
  async (req, res) => {
    try {
      const images = await pagesDao.getAllImages();

      if (images == undefined) {
        return res.status(404).json({ error: ['There is no image yet!'] });
      }

      res.json(images);
    } catch (err) {
      res.status(503).json({ error: [`Error in database while taking the images: '${err}'`] });
    }
  });

/**
 * Get a page with a specified id
 * 
 * This is an open endpoint: non authenticated users can still access this
 */
app.get("/api/pages/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const page = await pagesDao.getPageById(id);

    if (page == undefined) {
      return res.status(404).json({ error: ['Page not found!'] });
    }

    res.json(page);
  } catch (err) {
    res.status(503).json({ error: [`Error in database while tak the page: '${err}'`] });
  }
});

/**
 * Add a new page
 */
app.post(
  "/api/pages",
  isLoggedIn,
  [
    body('title', 'It is not allowed to add a page without a Title!').exists(),
    body('title', 'The title can not be empty!').notEmpty().trim(),
    body('contents', 'It is not allowed to add a page without a content block!').isArray().isLength({ min: 1 }),
    body('contents.*.header', 'Each content block must have a header!').exists().notEmpty().trim(),
    body('contents.*.sort_number', 'Each content block must have a sort number!').exists().notEmpty().trim(),
    body('contents.*.paragraph', 'The paragraph field must be a string!').optional().isString().trim(),
    body('contents.*.image.id', 'The image id must be numeric!').optional().isNumeric(),
    body('contents.*').custom((value, { req }) => {
      if (!value.paragraph && !value.image) {
        throw new Error('Each content block must have at least a paragraph or an image!');
      }
      return true;
    })
  ],
  async (req, res) => {
    // Check if validation is correct
    const err = validationResult(req);
    const errList = [];
    if (!err.isEmpty()) {
      errList.push(...err.errors.map(e => e.msg));
      return res.status(400).json({ errors: errList });
    }

    try {
      const contentsList = req.body.contents;

      let page = new Page(
        -1,
        req.body.title,
        req.body.release_date,
        dayjs().format('YYYY-MM-DD'),     // creation_date
        0,                                // page deleted from db, 0: not deleted, 1: deleted
        req.user
      );

      // standard format of date in the system
      page.release_date = page.release_date !== undefined ? dayjs(page.release_date).format('YYYY-MM-DD') : undefined;

      // check if the release date is before than the creation date
      if (!page.release_date && !page.creation_date) {
        if (dayjs(page.release_date).isBefore(page.creation_date)) {
          page.release_date = page.creation_date;
        }
      }

      // linking all content blocks to the page
      contentsList.map(content =>
        page.contents.push(
          new Content(
            -1,
            content.header,
            content.paragraph,
            content.sort_number,
            content.image && content.image
          )
        )
      );

      // check if the image exists in the system
      let imagePromises = contentsList.map(content => {
        if (content.image) {
          return pagesDao.getImageById(content.image.id).catch(() => {
            throw new Error('Image Not Found');
          });
        }
      });

      await Promise.all(imagePromises).catch(err => {
        return res.status(404).json({ error: [err.message] });
      });

      /*// change the author if the logged user is an administrator
      if (req.user.role === 1) {
        page.user = req.body.user;
      }*/

      // change the author if the logged user is an administrator
      if (req.user.role === 1) {
        await pagesDao.getUserById(req.body.user.id)
          .then(user => page.user = user)                                                   // set the user
          .catch(() => { return res.status(404).json({ error: ['User Not Found'] }) });     // user not found
      }

      await pagesDao.createPage(page);
      //res.json('Page added successfully!');
      res.end();
    } catch (err) {
      res.status(503).json({ error: [`Database error during page creation: '${err}'`] });
    }
  });

/**
 * Edit an existing page
 */
app.put(
  "/api/pages/:id",
  isLoggedIn,
  [
    body('title', 'It is not allowed to add a page without a title!').exists(),
    body('title', 'The title can not be empty!').notEmpty().trim(),
    body('contents', 'It is not allowed to add a page without a content block!').isArray().isLength({ min: 1 }),
    body('contents.*.header', 'Each content block must have a header!').exists().notEmpty().trim(),
    body('contents.*.sort_number', 'Each content block must have a sort number!').exists().notEmpty().trim(),
    body('contents.*.paragraph', 'The paragraph field must be a string!').optional().isString().trim(),
    body('contents.*.image.id', 'The image id must be numeric!').optional().isNumeric(),
    body('contents.*').custom((value, { req }) => {
      if (!value.paragraph && !value.image) {
        throw new Error('Each content block must have at least a paragraph or an image!');
      }
      return true;
    })
  ],
  async (req, res) => {
    try {
      /* 
        In this case, we will first make an authorization check.
        It checks if the user authenticated is an administrator or is the author of the page
      */
      const id = req.params.id;
      const page = await pagesDao.getPageById(id);

      if (page == undefined) {
        return res.status(404).json({ error: ['Page not found!'] });
      }

      if (req.user.id !== page.user.id && req.user.role !== 1) {
        return res.status(401).json({ error: ['This page can not be edited if you are not the author!'] });
      }

      // Check if validation is correct
      const err = validationResult(req);
      const errList = [];
      if (!err.isEmpty()) {
        errList.push(...err.errors.map(e => e.msg));
        return res.status(400).json({ errors: errList });
      }

      // it retrieves all content blocks from the body
      let contentsList = req.body.contents.map(async content => {
        if (content.image != undefined || content.image != null) {
          content.paragraph = undefined; // default behaviour, if the image exists then the paragraph is undefined
          try {
            content.image = await pagesDao.getImageById(content.image.id); // set the content image
          } catch (err) {
            return res.status(404).json({ error: ['Image Not Found'] }); // return the error
          }
        }
        return new Content(
          content.id,
          content.header,
          content.paragraph,
          content.sort_number,
          content.image
        );
      });

      await Promise.all(contentsList).then(list => {
        contentsList = list;
      }).catch(err => {
        return res.status(404).json({ error: [err.message] });
      });

      // get all information from the body request and the database
      let pageFromBody = new Page(
        page.id,
        req.body.title,
        req.body.release_date,
        page.creation_date,
        page.deleted,                        // page deleted from db, 0: not deleted, 1: deleted
        page.user,
        contentsList
      );

      let listContentsBlockToRemove = [];     // list of content blocks to remove from the page

      // get all contents block removed
      page.contents.forEach(content => {
        // it finds the right index of content blocks inside pageFromBody.contents
        const index = pageFromBody.contents.findIndex(contentFromPage => { return ((contentFromPage.id >= 0) && (contentFromPage.id === content.id)); });

        if (index === -1) { // it is not found in the system so it has been deleted from the user
          listContentsBlockToRemove.push(content);
        }
      })

      // change the author if the logged user is an administrator
      if (req.user.role === 1) {
        await pagesDao.getUserById(req.body.user.id)
          .then(user => pageFromBody.user = user)                                           // set the user
          .catch(() => { return res.status(404).json({ error: ['User Not Found'] }) });     // user not found
      }

      const result = await pagesDao.editPage(pageFromBody, listContentsBlockToRemove);
      res.json(result);
    } catch (err) {
      res.status(503).json({ error: [`Database error during editing page: '${err}'`] });
    }
  });

/**
 * Delete a page with a specified id from param
 */
app.delete("/api/pages/:id",
  isLoggedIn,
  async (req, res) => {
    try {
      const id = req.params.id;
      const page = await pagesDao.getPageById(id);

      if (page == undefined) {
        return res.status(404).json({ error: ['Page not found!'] });
      }

      // It checks if the user authenticated is an administrator or is the author of the page
      if (req.user.id !== page.user.id && req.user.role !== 1) {
        return res.status(401).json({ error: ['This page can not be deleted if you are not the author!'] });
      }

      await pagesDao.deletePage(id);
      //res.json('Page deleted successfully!');
      res.end();
    } catch (err) {
      res.status(503).json({ error: [`Database error during page deletion: '${err}'`] });
    }
  })

/**
 * Authenticate and login
 */
app.post(
  "/api/session",
  body("username", "Must be entered a valid email!").isEmail(),
  body("password", "Password can not be empty!").isString().notEmpty(),
  (req, res, next) => {
    // Check if validation is ok
    const err = validationResult(req);
    const errList = [];
    if (!err.isEmpty()) {
      errList.push(...err.errors.map(e => e.msg));
      return res.status(400).json({ errors: errList });
    }

    // Perform the actual authentication
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(err.status).json({ errors: [err.msg] });
      }

      if (!user) {
        return res.status(401).json(info);
      }

      req.login(user, err => {
        if (err) {
          return next(err);
        }

        // Send user information
        return res.json(req.user);
      });

    })(req, res, next);
  }
);

/**
 * Logout
 */
app.delete("/api/session", isLoggedIn, (req, res) => {
  req.logout(() => res.end());
});

/**
* Get the Website Name
* 
* This is an open endpoint: non authenticated users can still access this
*/
app.get("/api/websitename",
  async (req, res) => {
    try {
      const name = await pagesDao.getWebsiteName();
      res.json(name);
    } catch (err) {
      res.status(503).json({ error: [`Error in database while taking the images: '${err}'`] });
    }
  });

/**
 * Edit the website name
 */
app.put(
  "/api/websitename",
  isLoggedIn,
  [
    body('website_name', 'It is not allowed to edit the website name without information!').exists(),
    body('website_name', 'The name of website can not be empty!').notEmpty().trim(),
  ],
  async (req, res) => {
    try {
      /* 
        In this case, we will first make an authorization check.
        It checks if the user authenticated is an administrator
      */
      if (req.user.role !== 1) {
        return res.status(401).json({ error: ['The website name can not be edited if you are not an administrator!'] });
      }

      // Check if validation is correct
      const err = validationResult(req);
      const errList = [];
      if (!err.isEmpty()) {
        errList.push(...err.errors.map(e => e.msg));
        return res.status(400).json({ errors: errList });
      }

      await pagesDao.editWebsiteName(req.body.website_name);
      return res.end();
    } catch (err) {
      res.status(503).json({ error: [`Database error during saving the website name: '${err}'`] });
    }
  });


/**
 * Check if the user is logged in and return his info
 */
app.get("/api/session/current", isLoggedIn, async (req, res) => {
  let user = undefined;
  let error = false;

  await pagesDao.getUserById(req.user.id)
    .then(userInfo => user = userInfo)
    .catch(() => {
      error = true
      res.status(500).json({ errors: ["Database error"] })
    });

  if (!error) {
    res.json(user);
  }
});

/**
 * Get all users from the system
 */
app.get("/api/users",
  async (req, res) => {
    try {
      const users = await pagesDao.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(503).json({ error: [`Error in database while taking the users: '${err}'`] });
    }
  });

// activate the server
app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
