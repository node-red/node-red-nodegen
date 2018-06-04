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
var functionNode = require("../../../nodegen/node-red-contrib-handle-set-timeout");

describe('node-red-contrib-handle-set-timeout', function () {

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
        var flow = [{id: "n1", type: "handle-set-timeout", name: "handle-set-timeout" }];
        helper.load(functionNode, flow, function () {
            var n1 = helper.getNode('n1');
            n1.should.have.property('name', 'handle-set-timeout');
            done();
        });
    });
    it('should handle setTimeout()', function (done) {
        var flow = [{id: "n1", type: "handle-set-timeout", wires: [["n2"]]},
        {id:"n2", type:"helper"}];
        helper.load(functionNode, flow, function () {
            var n1 = helper.getNode("n1");
            var n2 = helper.getNode("n2");
            n2.on("input", function(msg) {
                var endTime = process.hrtime(startTime);
                var nanoTime = endTime[0] * 1000000000 + endTime[1];
                msg.should.have.property('topic', 'bar');
                msg.should.have.property('payload', 'foo');
                if (900000000 < nanoTime && nanoTime < 1100000000) {
                    done();
                } else {
                    try {
                        should.fail(null, null, "Delayed time was not between 900 and 1100 ms");
                    } catch (err) {
                        done(err);
                    }
                }
            });
            var startTime = process.hrtime();
            n1.receive({payload:"foo",topic: "bar"});
        });
    });
});
