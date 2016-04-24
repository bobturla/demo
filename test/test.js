var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var db = require('./db');
var Hero = db.Hero;

describe('getNextHeroId', function() {
    it('getNextHeroId() should output an id', function() {
        var result = db.getNextHeroId();

        return expect(result).to.eventually.be.a('number');
    })
});

describe('setHeroHash', function() {
    it('setHeroHash() should output OK', function() {
        var result = db.setHeroHash(1, 'bobman');

        return expect(result).to.eventually.equal('OK');
    })
});

describe('setNameLookup', function() {
    it('setNameLookup() should output 0 or 1', function() {
        var result = db.setNameLookup(1, 'bobman');

        return expect(result).to.eventually.be.oneOf([0, 1]);
    })
})

describe('saveHero', function() {
    it('saveHero() should output 0 or 1', function() {
        var hero = new Hero('bobman')
        var result = db.saveHero(hero);

        return expect(result).to.eventually.be.oneOf([0, 1]);
    })
})

describe('getHeroId', function() {
    it('getHeroId() should output the id of a hero', function() {
        var hero = new Hero('bobman')
        var result = db.getHeroId(hero);

        return expect(result).to.eventually.be.a('string');
    })
})