"use strict";
var fs = require('fs');

module.exports = {
    '/': {
        methods: {
            GET: {
                responseHeaders: {
                  'Set-Cookie': 'mycookie=test',
                  'Content-Type': 'text/html'
                },
                callback: function(req, res) {
                    var ip = req.connection.remoteAddress;

                    res.write('<h1>Welcome</h1>Your IP: ' + ip);
                    res.end('<pre>' + JSON.stringify(req.cookies) + '</pre>');
                }
            }            
        }
    },

    '/person': {
        methods: {
            GET: {
                callback: function(req, res) {
                    fs.readFile('./person.json', function(err, data) {
                        if (!err) {
                            res.send(200,data);
                        } else {
                            res.send(500, 'Read error');
                        }
                    });
                }
            },
            POST: {
                callback: function(req, res) {
                    // Receiving POST data
                    fs.writeFile('./person.json', JSON.stringify(req.body), function(err) {
                        if (!err) {
                            res.send(200, 'File saved');
                        } else {
                            res.send(500, 'Write error');
                        }
                    });
                }
            } 
        }
    },
};
