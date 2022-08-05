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
}).catch((err) => {
    console.log(err);
});

// listens for requests
app.listen(port);

// middleware
app.use(require('express-status-monitor')());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// looks for fact in db
app.get('/api/v1/facts', function (req, res) {
    let val = req.query.key;

    Fact.findOne({ key: val }, function (err, fact) {
        if (err) res.status(400).send(err);

        if (fact) {
            // display existing fact
            res.status(201).send(fact);
        } else {
            // show new fact
            res.status(204).send(fact);
        }
    });
});

// updates an existing fact in db
app.post('/update', function (req, res) {
    let liked = req.query.liked;
    let id = req.query.id;

    Fact.findById(id, function(err, fact) {
        if (err) res.status(400).send(err);

        if (fact) {
            if (liked == 'true') fact.likes++;
            fact.views++;
            fact.save();
            
            res.status(200).send();
        } else {
            res.status(404).send();
        }
    })
})

// creates a new fact in db
app.post('/create', function (req, res) {
    let key = req.query.key;
    let factBody = req.body.fact;

    let newFact = new Fact({
        key: key, 
        fact: factBody, 
        views: 0, 
        likes: 0
    });

    newFact.save()
    .then((fact) => {
        res.status(201).send(fact);
    })
    .catch((err) => {
        res.status(400).send(err);
    })
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
