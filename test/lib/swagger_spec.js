var fs = require('fs');
var path = require('path');
var should = require('should');
var del = require('del');
var swagger2node = require('../../lib/swagger');

describe('swagger node', function () {
    var swaggerDoc;
    before(function() {
        swaggerDoc = JSON.parse(fs.readFileSync(path.join(__dirname,"../../samples/swagger.json")));
    });

    it('should have node files', function (done) {
        var options = {};
        var data = { src: swaggerDoc, dst: '.' };
        swagger2node(data, options).then(function (result) {
            var packageSourceCode = JSON.parse(fs.readFileSync(result + '/package.json'));
            packageSourceCode.name.should.equal('node-red-contrib-swagger-petstore');
            packageSourceCode.version.should.equal('1.0.5');
            packageSourceCode.license.should.equal('Apache 2.0');
            fs.statSync(result + '/node.html').size.should.be.above(0);
            fs.statSync(result + '/node.js').size.should.be.above(0);
            fs.statSync(result + '/lib.js').size.should.be.above(0);
            fs.statSync(result + '/test/node_spec.js').size.should.be.above(0);
            fs.statSync(result + '/icons/icon.png').size.should.be.above(0);
            fs.statSync(result + '/locales/en-US/node.json').size.should.be.above(0);
            fs.statSync(result + '/locales/ja/node.json').size.should.be.above(0);
            fs.statSync(result + '/locales/zh-CN/node.json').size.should.be.above(0);
            fs.statSync(result + '/README.md').size.should.be.above(0);
            fs.statSync(result + '/LICENSE').size.should.be.above(0);
            fs.statSync(result + '/.travis.yml').size.should.be.above(0);
            del.sync(result);
            done();
        });
    });
    it('should handle options', function (done) {
        var options = {
            tgz: true,
            obfuscate: true
        };
        var data = { src: swaggerDoc, dst: '.' };
        swagger2node(data, options).then(function (result) {
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