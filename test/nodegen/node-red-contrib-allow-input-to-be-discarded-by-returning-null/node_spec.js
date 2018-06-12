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
var functionNode = require("../../../nodegen/node-red-contrib-allow-input-to-be-discarded-by-returning-null");

describe('node-red-contrib-allow-input-to-be-discarded-by-returning-null', function () {

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
        var flow = [{id: "n1", type: "allow-input-to-be-discarded-by-returning-null", name: "allow-input-to-be-discarded-by-returning-null"}];
        helper.load(functionNode, flow, function () {
            var n1 = helper.getNode('n1');
            n1.should.have.property('name', 'allow-input-to-be-discarded-by-returning-null');
            done();
        });
    });
    it('should allow input to be discarded by returning null', function (done) {
        var flow = [{id: "n1", type: "allow-input-to-be-discarded-by-returning-null", wires: [["n2"]]},
                    {id: "n2", type: "helper"}];
        helper.load(functionNode, flow, function () {
            var n1 = helper.getNode("n1");
            var n2 = helper.getNode("n2");
            setTimeout(function () {
                done();
            }, 20);
            n2.on("input", function (msg) {
                should.fail(null, null, "unexpected message");
            });
            n1.receive({payload: "foo", topic: "bar"});
        });
    });
});
