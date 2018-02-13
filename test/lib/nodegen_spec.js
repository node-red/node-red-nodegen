var fs = require('fs');
var request = require('request');
var should = require('should');
var del = require('del');
var nodegen = require('../../lib/nodegen');

describe('nodegen library', function () {
    describe('function node', function () {
        it('should have node files', function (done) {
            var options = {};
            var data = { dst: '.' };
            data.src = fs.readFileSync('samples/lower-case.js');
            var result = nodegen.function2node(data, options);
            var packageSourceCode = JSON.parse(fs.readFileSync(result + '/package.json'));
            packageSourceCode.name.should.equal('node-red-contrib-lowercase');
            packageSourceCode.version.should.equal('0.0.1');
            fs.statSync(result + '/node.html').size.should.be.above(0);
            fs.statSync(result + '/node.js').size.should.be.above(0);
            fs.statSync(result + '/icons/icon.png').size.should.be.above(0);
            fs.statSync(result + '/README.md').size.should.be.above(0);
            fs.statSync(result + '/LICENSE').size.should.be.above(0);
            del.sync(result);
            done();
        });
        it('should handle parameters (node and module name)', function (done) {
            var options = {};
            var data = {
                name: 'nodename',
                module: 'node-red-node-function-node',
                dst: '.'
            };
            data.src = fs.readFileSync('samples/lower-case.js');
            var result = nodegen.function2node(data, options);
            var packageSourceCode = JSON.parse(fs.readFileSync(result + '/package.json'));
            packageSourceCode.name.should.equal('node-red-node-function-node');
            packageSourceCode.version.should.equal('0.0.1');
            del.sync(result);
            done();
        });
        it('should handle parameters (prefix and node name)', function (done) {
            var options = {};
            var data = {
                prefix: 'node-red-prefix-',
                name: 'nodename',
                dst: '.'
            };
            data.src = fs.readFileSync('samples/lower-case.js');
            var result = nodegen.function2node(data, options);
            var packageSourceCode = JSON.parse(fs.readFileSync(result + '/package.json'));
            packageSourceCode.name.should.equal('node-red-prefix-nodename');
            packageSourceCode.version.should.equal('0.0.1');
            del.sync(result);
            done();
        });
        it('should handle parameters (version)', function (done) {
            var options = {};
            var data = {
                version: '4.5.1',
                dst: '.'
            };
            data.src = fs.readFileSync('samples/lower-case.js');
            var result = nodegen.function2node(data, options);
            var packageSourceCode = JSON.parse(fs.readFileSync(result + '/package.json'));
            packageSourceCode.name.should.equal('node-red-contrib-lowercase');
            packageSourceCode.version.should.equal('4.5.1');
            del.sync(result);
            done();
        });
        it('should handle parameters (keywords)', function (done) {
            var options = {};
            var data = {
                keywords: 'node-red,function,lowercase',
                dst: '.'
            };
            data.src = fs.readFileSync('samples/lower-case.js');
            var result = nodegen.function2node(data, options);
            var packageSourceCode = JSON.parse(fs.readFileSync(result + '/package.json'));
            packageSourceCode.name.should.equal('node-red-contrib-lowercase');
            packageSourceCode.keywords.should.eql(['node-red-nodegen', 'node-red', 'function', 'lowercase']);
            del.sync(result);
            done();
        });        
        it('should handle options', function (done) {
            var options = {
                tgz: true,
                obfuscate: true
            };
            var data = { dst: '.' };
            data.src = fs.readFileSync('samples/lower-case.js');
            var result = nodegen.function2node(data, options);
            fs.statSync(result).isFile().should.be.eql(true);
            del.sync(result);
            del.sync(result.replace(/-[0-9]+\.[0-9]+\.[0-9]+\.tgz$/, ''));
            done();
        });
    });

    describe('swagger node', function () {
        it('should have node files', function (done) {
            var options = {};
            var data = { dst: '.' };
            var sourcePath = 'http://petstore.swagger.io/v2/swagger.json';
            request(sourcePath, function (error, response, body) {
                data.src = JSON.parse(body);
                var result = nodegen.swagger2node(data, options);
                var packageSourceCode = JSON.parse(fs.readFileSync(result + '/package.json'));
                packageSourceCode.name.should.equal('node-red-contrib-swagger-petstore');
                packageSourceCode.version.should.equal('1.0.0');
                packageSourceCode.license.should.equal('Apache 2.0');
                fs.statSync(result + '/node.html').size.should.be.above(0);
                fs.statSync(result + '/node.js').size.should.be.above(0);
                fs.statSync(result + '/lib.js').size.should.be.above(0);
                fs.statSync(result + '/icons/icon.png').size.should.be.above(0);
                fs.statSync(result + '/locales/en-US/node.json').size.should.be.above(0);
                fs.statSync(result + '/locales/ja/node.json').size.should.be.above(0);
                fs.statSync(result + '/locales/zh-CN/node.json').size.should.be.above(0);
                fs.statSync(result + '/README.md').size.should.be.above(0);
                fs.statSync(result + '/LICENSE').size.should.be.above(0);
                del.sync(result);
                done();
            });
        });
    });

    describe('widget ndoe', function() {
        it('should generate widget files', function (done) {
            var options = {};
            var data = { dst: '.' };
            data.src = fs.readFileSync('samples/hello.html');
            data.conf = 'samples/hello-def.json';
            var result = nodegen.widget2node(data, options);
            var packageSourceCode = JSON.parse(fs.readFileSync(result + '/package.json'));
            packageSourceCode.name.should.equal('node-red-contrib-hello');
            packageSourceCode.version.should.equal('0.0.1');
            fs.statSync(result + '/node.html').size.should.be.above(0);
            fs.statSync(result + '/node.js').size.should.be.above(0);
            fs.statSync(result + '/icons/icon.png').size.should.be.above(0);
            fs.statSync(result + '/README.md').size.should.be.above(0);
            fs.statSync(result + '/LICENSE').size.should.be.above(0);
            del.sync(result);
            done();
        });
    });
});

