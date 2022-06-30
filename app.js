const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Fact = require('./js/models/fact');

// set connection port
const port = 3000;

// express app
const app = express();

// activate mongodb
mongoose.connect('mongodb://localhost:27017/fact-ory')
.then(() => {
    console.log('connection successful');

    // below tests adding a fact to db
    // const fact = new Fact({ key: 420, fact: "Rats never stop growing", views: 0, likes: 0 });
    // fact.save()
    // .then((fact) => {
    //     // res.status(201).send(fact);
    //     console.log("Fact " + fact.key + " stored!");
    // })
    // .catch((err) => {
    //     // res.status(400).send(err);
    // })
}).catch((err) => {
    console.log(err);
});

// listens for requests
app.listen(port);

// middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.get('/', (req, res) => {
//     const fact = new Fact({ key: 1, fact: "12 is the largest one-syllable number", views: 0, likes: 0 });
//     fact.save()
//     .then((fact) => {
//         res.status(201).send(fact);
//         console.log(fact);
//     })
//     .catch((err) => {
//         res.status(400).send(err);
//     })
// });

// looks for fact in db
app.post('/search', function (req, res) {
    Fact.findOne({ key: req.body.key }, function (err, fact) {
        if (err) res.status(400).send(err);

        if (fact) {
            // display fact
            console.log("Found! Fact " + fact.key + ": " + fact.fact);
            res.sendFile('./existingFact.html', {root: __dirname});
        } else {
            // show new fact
            console.log("New fact #" + req.body.key);
            res.sendFile('./newFact.html', {root: __dirname});
        }
    });
});

// gets webpage, css, and js files
app.get('/', (req, res) => {
    res.sendFile('./index.html', {root: __dirname});
});

app.get('/css/style.css', (req, res) => {
    res.sendFile('./css/style.css', {root: __dirname});
});

app.get('/js/main.js', (req, res) => {
    res.sendFile('./js/main.js', {root: __dirname});
});

// redirects all extensions to main webpage
app.use((req, res) => {
    res.sendFile('./index.html', {root: __dirname});
});
