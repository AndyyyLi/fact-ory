const http = require('http');
const fs = require('fs');
const port = 3000;

const server = http.createServer(function(req, res) {
    console.log('about to request html');
    fs.readFile('index.html', function(error, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        if (error) {
            res.writeHead(404);
            res.write('Error: File Not Found');
        } else {
            console.log('about to load html');
            res.write(data);
        }
        res.end();
    });

    console.log('about to request css');
    fs.readFile('css/style.css', function(error, data) {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        if (error) {
            res.writeHead(404);
            res.write('Error: File Not Found');
        } else {
            console.log('about to load css');
            res.write(data);
        }
        res.end();
    });
    console.log('DONE');
});

server.listen(port, 'localhost', function(error) {
    if (error) {
        console.log('Uh Oh!', error);
    } else {
        console.log('Server is listening on port ' + port)
    }
});