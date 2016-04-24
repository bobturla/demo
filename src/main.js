var exports = module.exports = {};
var db = require('./db');
var Hero = require('./db').Hero;
var Q = require('q');
var helper = require('./helper');
var config = require('./config.json');
var querystring = require('querystring');

exports.saveHero = function(request, response) {
    console.log('saveHero', request.body)

    var hero = new Hero(request.body.name);
    db.saveHero(hero)
        .then(function() {
            var response_data = {
                result_code: '000',
                result_message: 'Hero saved successfully',
                data: null
            }
            response.json(response_data);
        }, function(error) {
            var response_data = {
                result_code: '500',
                result_message: error.message,
                data: null
            }
            response.json(response_data);
        });
}

exports.getHeroById = function(request, response) {
    console.log('getHero', request.params.id);

    db.getHeroData(request.params.id)
        .then(function(hero_data) {
            var response_data = {
                result_code: '000',
                result_message: 'Hero data found',
                data: hero_data
            }
            response.json(response_data);
        }, function(error) {
            var response_data = {
                result_code: '500',
                result_message: error.message,
                data: null
            }
            response.json(response_data);
        });
}

exports.getHeroes = function(request, response) {
    console.log('getHeroes')

    if (request.query.name) {
        var hero = new Hero(request.query.name)
        db.getHeroByName(hero)
            .then(function(hero_data) {
                var response_data = {
                    result_code: '000',
                    result_message: 'Hero data found',
                    data: hero_data
                }
                response.json(response_data);
            }, function(error) {
                var response_data = {
                    result_code: '500',
                    result_message: error.message,
                    data: null
                }
                response.json(response_data);
            });
    } else {
        db.getAllHeroes()
            .then(function(all_hero_data) {
                var response_data = {
                    result_code: '000',
                    result_message: 'All Heroes data found',
                    data: all_hero_data
                }
                response.json(response_data);
            }, function(error) {
                var response_data = {
                    result_code: '500',
                    result_message: error.message,
                    data: null
                }
                response.json(response_data);
            });
    }
}

exports.getDirections = function(request, response) {
    console.log('getDirections', request.body);
    var data = request.body;
    data.response = response;
    data.api_key = config.API_KEY;
    data.url = config.GOOGLE_MAPS_URL;

    createRequestUrl(data)
        .then(helper.sendGetRequest)
        .then(processData, function(data) {
            response.send('failed to get route ' + data.error_message)
        })

    // .then(function(data){
    //     response.json(data.post_response.routes[0].legs[0].steps);
    // }, console.error)
}

function createRequestUrl(data) {
    var deferred = Q.defer();

    data.request_data = {};
    data.request_data.origin = data.origin;
    data.request_data.destination = data.destination;
    data.request_data.key = data.api_key;
    var qstring = querystring.stringify(data.request_data);

    data.request_url = data.url + qstring;

    deferred.resolve(data);
    return deferred.promise;
}

function processData(data) {
    console.log('processData');
    if (data.post_response.status !== "ZERO_RESULTS") {
        var steps = data.post_response.routes[0].legs[0].steps;
        console.log(steps.length.toString() + ' steps');

        var response_data = [];
        var actions = steps.map(function(step) {
            return new Promise(resolve => resolve(step.html_instructions));
        });

        var results = Promise.all(actions);
        results.then(function(html_instruction) {
            data.response.json(html_instruction);
        })
    } else {
        data.response.send(data.post_response.status);
    }
}
