'use strict';

/** 
 * Page DAO used to identify a Page in the system
 */
module.exports = function Page(id = -1, title = '', release_date = undefined, creation_date = undefined, deleted = 0, user = undefined, contents = []) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.creation_date = creation_date;
    this.deleted = deleted;
    this.user = user;

    if (this.release_date === undefined || this.release_date === null) {
        this.status = "Draft";                                  // release date is undefined for default 
    } else if (new Date(this.release_date) > new Date()) {
        this.status = "Programmed";
    } else if (new Date(this.release_date) <= new Date()) {
        this.status = "Published";
    }

    this.contents = contents;
}