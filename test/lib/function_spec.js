const fs = require('fs');
const path = require('path');
const should = require('should');
const del = require('del');
const function2node = require('../../lib/function');

describe('Function node', function () {
    it('should have node files', function (done) {
        var options = {};
        var data = { dst: '.' };
        data.src = fs.readFileSync('samples/lower-case.js');
        function2node(data, options).then(function (result) {
            var packageSourceCode = JSON.parse(fs.readFileSync(result + '/package.json'));
            packageSourceCode.name.should.equal('node-red-contrib-lowercase');
            packageSourceCode.version.should.equal('0.0.1');
            fs.statSync(result + '/node.html').size.should.be.above(0);
            fs.statSync(result + '/node.js').size.should.be.above(0);
            fs.statSync(result + '/test/node_spec.js').size.should.be.above(0);
            fs.statSync(result + '/icons/icon.svg').size.should.be.above(0);
            fs.statSync(result + '/README.md').size.should.be.above(0);
            fs.statSync(result + '/LICENSE').size.should.be.above(0);
            fs.statSync(result + '/.travis.yml').size.should.be.above(0);
            del.sync(result);
            done();
        });
    });
    it('should handle parameters (node and module name)', function (done) {
        var options = {};
        var data = {
            name: 'nodename',
            module: 'node-red-node-function-node',
            dst: '.'
        };
        data.src = fs.readFileSync('samples/lower-case.js');
        function2node(data, options).then(function (result) {
            var packageSourceCode = JSON.parse(fs.readFileSync(result + '/package.json'));
            packageSourceCode.name.should.equal('node-red-node-function-node');
            packageSourceCode.version.should.equal('0.0.1');
            del.sync(result);
            done();
        });
    });
    it('should handle parameters (prefix and node name)', function (done) {
        var options = {};
        var data = {
            prefix: 'node-red-prefix-',
            name: 'nodename',
            dst: '.'
        };
        data.src = fs.readFileSync('samples/lower-case.js');
        function2node(data, options).then(function (result) {
            var packageSourceCode = JSON.parse(fs.readFileSync(result + '/package.json'));
            packageSourceCode.name.should.equal('node-red-prefix-nodename');
            packageSourceCode.version.should.equal('0.0.1');
            del.sync(result);
            done();
        });
    });
    it('should handle parameters (version)', function (done) {
        var options = {};
        var data = {
            version: '4.5.1',
            dst: '.'
        };
        data.src = fs.readFileSync('samples/lower-case.js');
        function2node(data, options).then(function (result) {
            var packageSourceCode = JSON.parse(fs.readFileSync(result + '/package.json'));
            packageSourceCode.name.should.equal('node-red-contrib-lowercase');
            packageSourceCode.version.should.equal('4.5.1');
            del.sync(result);
            done();
        });
    });
    it('should handle parameters (keywords)', function (done) {
        var options = {};
        var data = {
            keywords: 'node-red,function,lowercase',
            dst: '.'
        };
        data.src = fs.readFileSync('samples/lower-case.js');
        function2node(data, options).then(function (result) {
            var packageSourceCode = JSON.parse(fs.readFileSync(result + '/package.json'));
            packageSourceCode.name.should.equal('node-red-contrib-lowercase');
            packageSourceCode.keywords.should.eql(['node-red-nodegen', 'node-red', 'function', 'lowercase']);
            del.sync(result);
            done();
        });
    });
    it('should handle options', function (done) {
        var options = {
            tgz: true,
            obfuscate: true
        };
        var data = { dst: '.' };
        data.src = fs.readFileSync('samples/lower-case.js');
        function2node(data, options).then(function (result) {
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
