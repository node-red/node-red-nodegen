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
var functionNode = require("../../../nodegen/node-red-contrib-log-a-trace-message");

describe('node-red-contrib-log-a-trace-message', function () {

    before(function (done) {
        helper.startServer(done);
    });

    after(function(done) {
        helper.stopServer(done);
    });

    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [{id: "n1", type: "log-a-trace-message", name: "log-a-trace-message" }];
        helper.load(functionNode, flow, function () {
            var n1 = helper.getNode('n1');
            n1.should.have.property('name', 'log-a-trace-message');
            done();
        });
    });
    it('should log a Trace Message', function (done) {
        var flow = [{id: "n1", type: "log-a-trace-message", wires: [["n2"]]},
                    {id: "n2", type: "helper"}];
        helper.load(functionNode, flow, function () {
            var n1 = helper.getNode("n1");
            n1.receive({payload: "foo", topic: "bar"});
            try {
                helper.log().called.should.be.true();
                var logEvents = helper.log().args.filter(function (evt) {
                    return evt[0].type == "log-a-trace-message";
                });
                logEvents.should.have.length(1);
                var msg = logEvents[0][0];
                msg.should.have.property('level', helper.log().TRACE);
                msg.should.have.property('id', 'n1');
                msg.should.have.property('type', 'log-a-trace-message');
                msg.should.have.property('msg', 'test');
                done();
            } catch (err) {
                done(err);
            }
        });
    });
});
