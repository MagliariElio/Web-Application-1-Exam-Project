'use strict';


/**
 * Content of a Page
 */
module.exports = function Content(id = -1, header = '', paragraph = undefined, sort_number = -1, image = undefined) {
    this.id = id;
    this.header = header;
    this.paragraph = paragraph;
    this.sort_number = sort_number;
    this.image = image;

    // it is not allowed to have a paragraph and an image in the same Content block
    if(paragraph !== undefined) {
        this.image = undefined;
    }
};
