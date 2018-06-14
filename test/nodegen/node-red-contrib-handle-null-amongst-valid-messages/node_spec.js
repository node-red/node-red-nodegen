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
var functionNode = require("../../../nodegen/node-red-contrib-handle-null-amongst-valid-messages");

describe('node-red-contrib-handle-null-amongst-valid-messages', function () {

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
        var flow = [{id: "n1", type: "handle-null-amongst-valid-messages", name: "handle-null-amongst-valid-messages"}];
        helper.load(functionNode, flow, function () {
            var n1 = helper.getNode('n1');
            n1.should.have.property('name', 'handle-null-amongst-valid-messages');
            done();
        });
    });
    it('should handle null amongst valid messages', function (done) {
        var flow = [{id: "n1", type: "handle-null-amongst-valid-messages", wires: [["n2"]]},
                    {id: "n2", type: "helper"},
                    {id: "n3", type: "helper"}];
        helper.load(functionNode, flow, function () {
            var n1 = helper.getNode("n1");
            var n2 = helper.getNode("n2");
            var n3 = helper.getNode("n3");
            var n2MsgCount = 0;
            var n3MsgCount = 0;
            n2.on("input", function (msg) {
                n2MsgCount++;
            });
            n3.on("input", function (msg) {
                n3MsgCount++;
            });
            n1.receive({payload: "foo", topic: "bar"});
            setTimeout(function () {
                n2MsgCount.should.equal(2);
                n3MsgCount.should.equal(0);
                done();
            }, 20);
        });
    });
});
