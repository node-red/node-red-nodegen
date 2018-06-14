/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var should = require("should");
var helper = require("node-red-node-test-helper");
var functionNode = require("../../../nodegen/node-red-contrib-drop-and-log-nonobject-message-types-buffer");

describe('node-red-contrib-drop-and-log-nonobject-message-types-buffer', function () {

    before(function (done) {
        helper.startServer(done);
    });

    after(function (done) {
        helper.stopServer(done);
    });

    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [{id: "n1", type: "drop-and-log-nonobject-message-types-buffer", name: "drop-and-log-nonobject-message-types-buffer"}];
        helper.load(functionNode, flow, function () {
            var n1 = helper.getNode('n1');
            n1.should.have.property('name', 'drop-and-log-nonobject-message-types-buffer');
            done();
        });
    });
    it('should drop and log non-object message types - buffer', function (done) {
        var flow = [{id: "n1", type: "drop-and-log-nonobject-message-types-buffer", wires: [["n2"]]},
                    {id: "n2", type: "helper"}];
        helper.load(functionNode, flow, function () {
            var n1 = helper.getNode("n1");
            var n2 = helper.getNode("n2");
            var n2MsgCount = 0;
            n2.on("input", function (msg) {
                n2MsgCount++;
            });
            n1.receive({});
            setTimeout(function () {
                try {
                    n2MsgCount.should.equal(0);
                    var logEvents = helper.log().args.filter(function (evt) {
                        return evt[0].type == "drop-and-log-nonobject-message-types-buffer";
                    });
                    logEvents.should.have.length(1);
                    var msg = logEvents[0][0];
                    msg.should.have.property('level', helper.log().ERROR);
                    msg.should.have.property('id', 'n1');
                    msg.should.have.property('type', 'drop-and-log-nonobject-message-types-buffer');
                    msg.should.have.property('msg', 'function.error.non-message-returned');
                    done();
                } catch (err) {
                    done(err);
                }
            }, 20);
        });
    });
});
