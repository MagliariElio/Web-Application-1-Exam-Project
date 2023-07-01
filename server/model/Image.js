'use strict';

/**
 * This represent how is seen an "image" in the system.
 * @param id id of the image
 * @param src path of image in the filesystem
 * @param alt description of the image
 * @param title title of the image
 * @param website_name website name
 */
module.exports = function Image(id = -1, src = '', alt = '', title = '', website_name = '') {
    this.id = id;
    this.src = src;
    this.alt = alt;
    this.title = title;
    this.website_name = website_name;
};