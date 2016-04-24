var bodyParser = require('body-parser');
var express = require('express');
var main = require('./main');
var http = require('http');

var app = express();

var httpServer = http.createServer(app);

app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/heroes', function(req, res) {
    main.saveHero(req, res);
});

app.post('/directions', function(req, res) {
    main.getDirections(req, res);
});

app.get('/heroes/:id', function(req, res) {
    main.getHeroById(req, res);
});

app.get('/heroes', function(req, res) {
    main.getHeroes(req, res);
});

process.on('SIGINT', function() {
    process.exit();
});

process.on('SIGTERM', function() {
    process.exit();
});

httpServer.listen(50000);
console.log('API START', new Date());
