var fs = require('fs');
var path = require('path');
var should = require('should');
var del = require('del');
var wottd2node = require('../../lib/webofthings');

describe('Web of Things node', function () {
    it('should have node files', function (done) {
        const sourcePath = 'samples/MyLampThing.jsonld';
        const data = {
            src: JSON.parse(fs.readFileSync(sourcePath)),
            dst: '.'
        };
        const options = {};
        wottd2node(data, options).then(function (result) {
            const packageSourceCode = JSON.parse(fs.readFileSync(result + '/package.json'));
            packageSourceCode.name.should.equal('node-red-contrib-wotmylampthing');
            packageSourceCode.version.should.equal('0.0.1');
            fs.statSync(result + '/node.html').size.should.be.above(0);
            fs.statSync(result + '/node.js').size.should.be.above(0);
            fs.statSync(result + '/README.md').size.should.be.above(0);
            fs.statSync(result + '/LICENSE').size.should.be.above(0);
            del.sync(result);
            done();
        });
    });
    it('should handle options', function (done) {
        const sourcePath = 'samples/MyLampThing.jsonld';
        const data = {
            src: JSON.parse(fs.readFileSync(sourcePath)),
            dst: '.'
        };
        const options = {
            tgz: true,
            obfuscate: true
        };
        wottd2node(data, options).then(function (result) {
            fs.statSync(result).isFile().should.be.eql(true);
            del.sync(result);
            var jsfile = result.replace(/-[0-9]+\.[0-9]+\.[0-9]+\.tgz$/, '/node.js');
            fs.readFileSync(jsfile).toString().split('\n').length.should.be.eql(1);
            result = result.replace(/-[0-9]+\.[0-9]+\.[0-9]+\.tgz$/, '');
            del.sync(result);
            done();
        });
    });
});

