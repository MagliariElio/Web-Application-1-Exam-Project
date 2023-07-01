'use strict';

/** 
 * User DAO used to identify an user in the system
 * @param role: it can assume 2 values: 0 simple user, 1 administrator user
 */
module.exports = function User(id = -1, email = '', /*hash = '', salt = '',*/ username = '', name = '', surname = '', role = 0, 
                                number_pages_published = 0, number_pages_created = 0, number_pages_removed = 0, number_pages_programmed = 0, number_pages_draft = 0) {
    this.id = id;
    this.email = email;
    /*this.hash = hash;
    this.salt = salt;*/
    this.username = username;
    this.name = name;
    this.surname = surname;
    this.role = role;
    this.number_pages_published = number_pages_published;
    this.number_pages_created = number_pages_created;
    this.number_pages_removed = number_pages_removed;
    this.number_pages_programmed = number_pages_programmed;
    this.number_pages_draft = number_pages_draft;
}