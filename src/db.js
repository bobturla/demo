"use strict";
var exports = module.exports = {};
var Q = require('q');
var redis = require('redis');
var redis_db = redis.createClient();

// Class Hero
function Hero(name) {
    this.name = name;
}
exports.Hero = Hero;

function getNextHeroId() {
    var deferred = Q.defer();

    redis_db.INCR('next_hero_id', function(err, id) {
        if (err) {
            deferred.reject(new Error('failed to get hero id'));
        } else {
            deferred.resolve(id);
        }
    })
    return deferred.promise;
}
exports.getNextHeroId = getNextHeroId;

function setHeroHash(id, name) {
    var deferred = Q.defer();

    var hero_data = {
        id: id,
        name: name
    }

    var hero_key = 'hero:' + id.toString();

    redis_db.HMSET(hero_key, hero_data, function(err, res) {
        if (err) {
            deferred.reject(new Error('failed to set hero hash'));
        } else {
            deferred.resolve(res);
        }
    });
    return deferred.promise;
}
exports.setHeroHash = setHeroHash;

function setNameLookup(id, name) {
    var deferred = Q.defer();

    redis_db.HSET('heroes', name, id, function(err, res) {
        if (err) {
            deferred.reject(new Error('failed to add to heroes key'));
        } else {
            deferred.resolve(res);
        }
    });

    return deferred.promise;
}
exports.setNameLookup = setNameLookup;

function saveHero(hero) {
    return getNextHeroId()
        .then(function(id) {
            return setHeroHash(id, hero.name)
                .then(function() {
                    return setNameLookup(id, hero.name);
                })
        });
}
exports.saveHero = saveHero;

function getHeroId(hero) {
    var deferred = Q.defer();

    redis_db.HGET('heroes', hero.name, function(err, id) {
        if (err || id === null) {
            deferred.reject(new Error('failed to get hero id'));
        } else {
            deferred.resolve(id);
        }
    });
    return deferred.promise;
}
exports.getHeroId = getHeroId;

function getHeroData(id) {
    var deferred = Q.defer();

    redis_db.HGETALL('hero:' + id, function(err, hero_data) {
        if (err || hero_data === null) {
            deferred.reject(new Error('failed to get hero data'));
        } else {
            deferred.resolve(hero_data);
        }
    });

    return deferred.promise;
}
exports.getHeroData = getHeroData;

function getHeroByName(hero) {
    return getHeroId(hero)
        .then(function(id) {
            return getHeroData(id)
        });
}
exports.getHeroByName = getHeroByName;

function getAllHeroIds() {
    var deferred = Q.defer();

    redis_db.HVALS('heroes', function(err, hero_ids) {
        if (err || hero_ids === null) {
            deferred.reject(new Error('failed to get all hero ids'));
        } else {
            deferred.resolve(hero_ids);
        }
    });

    return deferred.promise;
}
exports.getAllHeroIds = getAllHeroIds;

function getAllHeroData(hero_ids) {
    var deferred = Q.defer();

    var promises = [];
    hero_ids.forEach(function(id) {
        promises.push(getHeroData(id));
    });

    Q.all(promises).done(function(values) {
        deferred.resolve(values);
    });
    return deferred.promise;
}
exports.getAllHeroData = getAllHeroData;

function getAllHeroes() {
    return getAllHeroIds()
        .then(getAllHeroData);
}
exports.getAllHeroes = getAllHeroes;