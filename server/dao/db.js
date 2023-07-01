'use strict';

const sqlite = require('sqlite3');

// Open the database
const db = new sqlite.Database('./dao/pagesdb.db', (err) => {
    if(err) throw err;
});

module.exports = db;