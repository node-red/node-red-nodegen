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
var functionNode = require("../../../nodegen/node-red-contrib-lowercase/node.js");

describe('node-red-contrib-lowercase', function () {

    before(function (done) {
        helper.startServer(done);
    });

    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [{id: "n1", type: "lowercase", name: "lowercase" }];
        helper.load(functionNode, flow, function () {
            var n1 = helper.getNode('n1');
            n1.should.have.property('name', 'lowercase');
            done();
        });
    });
    it('should handle toLowerCase()', function (done) {
        var flow = [{id: "n1", type: "lowercase", wires: [["n2"]]},
                    {id: "n2", type: "helper"}];
        helper.load(functionNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
                msg.should.have.property('payload', 'abcde');
                done();
            });
            n1.receive({payload: 'AbCdE'});
        });
    });
});

