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
var swaggerNode = require("../../../nodegen/node-red-contrib-swagger-petstore/node.js");
var helper = require("../helper.js");

describe('node-red-contrib-swagger-petstore', function () {

    before(function (done) {
        helper.startServer(done);
    });

    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", name: "swagger-petstore" }];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            n1.should.have.property('name', 'swagger-petstore');
            done();
        });
    });
    it('should handle getInventory()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n3"]], service: "n2", method: "getInventory"},
                    {id: "n2", type: "swagger-petstore-service"},
                    {id: "n3", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n3 = helper.getNode('n3');
            n3.on('input', function (msg) {
                try {
                    msg.payload.should.have.property('available');
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({});
        });
    });
});

