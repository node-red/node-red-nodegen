const fs = require('fs');
const path = require('path');
const should = require('should');
const del = require('del');
const subflow2node = require('../../lib/subflow');

describe('subflow node', function () {
    it('should have node files', function (done) {
        var options = {};
        var data = { dst: '.' };
        data.src = JSON.parse(fs.readFileSync('samples/qrcode.json'));
        subflow2node(data, options).then(function (result) {
            try {
                var packageSourceCode = JSON.parse(fs.readFileSync(result + '/package.json'));
                packageSourceCode.name.should.equal('node-red-contrib-qrcode');
                packageSourceCode.version.should.equal('0.1.0');
                fs.statSync(result + '/subflow.json').size.should.be.above(0);
                fs.statSync(result + '/subflow.js').size.should.be.above(0);
                fs.statSync(result + '/README.md').size.should.be.above(0);
                fs.statSync(result + '/LICENSE').size.should.be.above(0);
                del.sync(result);
                done();
            }
            catch (e) {
                done(e);
            }
        });
    });
    it('should handle encoding option', function (done) {
        var options = {
            encoding: "AES",
            encodekey: "Node-RED"
        };
        var data = { dst: '.' };
        data.src = JSON.parse(fs.readFileSync('samples/qrcode.json'));
        subflow2node(data, options).then(function (result) {
            try {
                var packageSourceCode = JSON.parse(fs.readFileSync(result + '/package.json'));
                packageSourceCode.name.should.equal('node-red-contrib-qrcode');
                packageSourceCode.version.should.equal('0.1.0');
                fs.statSync(result + '/subflow.json').size.should.be.above(0);
                fs.statSync(result + '/subflow.js').size.should.be.above(0);
                fs.statSync(result + '/README.md').size.should.be.above(0);
                fs.statSync(result + '/LICENSE').size.should.be.above(0);
                var sf = JSON.parse(fs.readFileSync(result + "/subflow.json"));
                sf.should.have.property("flow");
                sf.flow.should.have.property("encoding", "AES");
                del.sync(result);
                done();
            }
            catch (e) {
                done(e);
            }
        });
    });
    it('should create tgz', function (done) {
        var options = {
            tgz: true
        };
        var data = { dst: '.' };
        data.src = JSON.parse(fs.readFileSync('samples/qrcode.json'));
        subflow2node(data, options).then(function (result) {
            try {
                fs.statSync(result).isFile().should.be.eql(true);
                del.sync(result);
                del.sync("./node-red-contrib-qrcode");
                done();
            }
            catch (e) {
                done(e);
            }
        });
    });
});
