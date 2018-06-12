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
var functionNode = require("../../../nodegen/node-red-contrib-send-to-multiple-outputs");

describe('node-red-contrib-send-to-multiple-outputs', function () {

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
        var flow = [{id: "n1", type: "send-to-multiple-outputs", name: "send-to-multiple-outputs"}];
        helper.load(functionNode, flow, function () {
            var n1 = helper.getNode('n1');
            n1.should.have.property('name', 'send-to-multiple-outputs');
            done();
        });
    });
    it('should send to multiple outputs', function (done) {
        var flow = [{id: "n1", type: "send-to-multiple-outputs", wires: [["n2"], ["n3"]]},
                    {id: "n2", type: "helper"},
                    {id: "n3", type: "helper"} ];
        helper.load(functionNode, flow, function () {
            var n1 = helper.getNode("n1");
            var n2 = helper.getNode("n2");
            var n3 = helper.getNode("n3");
            var count = 0;
            n2.on("input", function (msg) {
                should(msg).have.property('payload', '1');
                count++;
                if (count == 2) {
                    done();
                }
            });
            n3.on("input", function (msg) {
                should(msg).have.property('payload', '2');
                count++;
                if (count == 2) {
                    done();
                }
            });
            n1.receive({payload: "foo", topic: "bar"});
        });
    });
});
