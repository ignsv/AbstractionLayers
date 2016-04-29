"use strict";

var http = require('http');
var fs = require('fs');

var endpoints = require('./view.js');

var cache = {};

var buisness_logic=function(obj){
    console.log(obj);
    console.log(2+2);
}

var behavior = {
    GET: function(req,res, handler) {
        if(cache[req.url]) {
            buisness_logic(cache[req.url]);
            res.send(200, JSON.stringify(cache[req.url]));
        } else {
            if (handler.responseHeaders) {
                var responseHeaders = handler.responseHeaders;
                res.writeHead(200, responseHeaders);
            }
            handler.callback(req,res);
        }
    },
    POST: function(req, res, handler) {
        var callback = handler.callback;
        var body = [];

        req.on('data', function(chunk) {
            body.push(chunk);
        }).on('end', function() {
            var data = Buffer.concat(body).toString();
            var obj = JSON.parse(data);
            cache[req.url] = obj;
            req.body = obj;

            callback(req, res);
        });
    }
}


var wrapCookies = function(req) {
    var cookies = {}

    // Parse cookies
    var cookie = req.headers.cookie;

    if (cookie) {
        cookie.split(';').forEach((item) => {
            var parts = item.split('=');
            cookies[(parts[0]).trim()] = (parts[1] || '').trim();
        });
    }

    req.cookies = cookies;
}

var wrapLogg =function(req){
    //logging
    var date = new Date().toISOString();
    console.log([date, req.method, req.url].join('  '));
    fs.writeFile('./log.txt',[date, req.method, req.url].join('  ')+'\n' ,
    {
    flag: "a"},
    function(err) {
                if (!err) {
                    
                } else {
                    console.log("Error");
                }
            });
}

var Server = function(endpoints) {
    this.endpoints = endpoints;

    this.serve = (req, res) => {
        if(req.url in this.endpoints) {
            var handler = this.endpoints[req.url];
            handler = handler.methods[req.method];
            
            wrapCookies(req);
            wrapLogg(req);
            
            res.send = function(status, value) {
                res.writeHead(status);
                res.end(value);
            }
            if(req.method in behavior) behavior[req.method](req, res, handler);
            else res.send(405, 'Method not allowed')
        } else {
            res.send(404, 'Path not found');
        }
    }
    http.createServer(this.serve).listen(80);
};

var a = new Server(endpoints);
