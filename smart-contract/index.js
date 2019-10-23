'use strict'
const getStdin = require('get-stdin');
const handler = require('./contract/handler');

getStdin().then(val => {
    handler(val, (err, res) => {        
        if (res) {
            process.stdout.write(JSON.stringify(res));
        }
        if (err) {
            return console.error(err);
        }
    });
}).catch(e => {
    console.error(e.stack);
});
