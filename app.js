const http = require('http');
const fs = require('fs');
// const express = require('express');
const port = 3000;

const server = http.createServer(function(req, res) {
    // console.log(req.url);

    if (req.url == "/") {
        fs.readFile('index.html', function(error, data) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            if (error) {
                res.writeHead(404);
                res.write('Error: File Not Found');
            } else {
                // console.log('about to load html');
                res.write(data);
            }
            res.end();
        });
    } else if (req.url == "/css/style.css") {
        fs.readFile('css/style.css', function(error, data) {
            res.writeHead(200, { 'Content-Type': 'text/css' });
            if (error) {
                res.writeHead(404);
                res.write('Error: File Not Found');
            } else {
                // console.log('about to load css');
                res.write(data);
            }
            res.end();
        });
    } else if (req.url == "/js/main.js") {
        fs.readFile('js/main.js', function(error, data) {
            res.writeHead(200, { 'Content-Type': 'text/js' });
            if (error) {
                res.writeHead(404);
                res.write('Error: File Not Found');
            } else {
                // console.log('about to load js');
                res.write(data);
            }
            res.end();
        });
    }
});

server.listen(port, 'localhost', function(error) {
    if (error) {
        console.log('Uh Oh!', error);
    } else {
        console.log('Server is listening on port ' + port)
    }
});