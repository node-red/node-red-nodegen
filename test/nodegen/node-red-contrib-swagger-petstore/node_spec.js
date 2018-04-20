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
var swaggerNode = require("../../../nodegen/node-red-contrib-swagger-petstore/node.js");

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
    it('should handle addPet()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n3"]], service: "n2", method: "addPet"},
                    {id: "n2", type: "swagger-petstore-service"},
                    {id: "n3", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n3 = helper.getNode('n3');
            n3.on('input', function (msg) {
                try {
                    msg.payload.should.eql({
                        "id": 4513,
                        "category": {
                            "id": 4649,
                            "name": "string"
                        },
                        "name": "doggie",
                        "photoUrls": [
                            "string"
                        ],
                        "tags": [
                            {
                                "id": 2525,
                                "name": "string"
                            }
                        ],
                        "status": "available"
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({
                payload: {
                    "id": 4513,
                    "category": {
                        "id": 4649,
                        "name": "string"
                    },
                    "name": "doggie",
                    "photoUrls": [
                        "string"
                    ],
                    "tags": [
                        {
                            "id": 2525,
                            "name": "string"
                        }
                    ],
                    "status": "available"
                }
            });
        });
    });
    it('should handle updatePet()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n3"]], service: "n2", method: "updatePet"},
                    {id: "n2", type: "swagger-petstore-service"},
                    {id: "n3", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n3 = helper.getNode('n3');
            n3.on('input', function (msg) {
                try {
                    msg.payload.should.eql({
                        "id": 4513,
                        "category": {
                            "id": 5963,
                            "name": "string"
                        },
                        "name": "doggie",
                        "photoUrls": [
                            "string"
                        ],
                        "tags": [
                            {
                                "id": 3341,
                                "name": "string"
                            }
                        ],
                        "status": "available"
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({
                payload: {
                    "id": 4513,
                    "category": {
                        "id": 5963,
                        "name": "string"
                    },
                    "name": "doggie",
                    "photoUrls": [
                        "string"
                    ],
                    "tags": [
                        {
                            "id": 3341,
                            "name": "string"
                        }
                    ],
                    "status": "available"
                }
            });
        });
    });
    it('should handle findPetsByStatus()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n3"]], service: "n2", method: "findPetsByStatus", findPetsByStatus_status: "available"},
                    {id: "n2", type: "swagger-petstore-service"},
                    {id: "n3", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n3 = helper.getNode('n3');
            n3.on('input', function (msg) {
                try {
                    msg.payload.should.containEql({
                        "id": 4513,
                        "category": {
                            "id": 5963,
                            "name": "string"
                        },
                        "name": "doggie",
                        "photoUrls": [
                            "string"
                        ],
                        "tags": [
                            {
                                "id": 3341,
                                "name": "string"
                            }
                        ],
                        "status": "available"
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({});
        });
    });
    it('should handle updatePetWithForm()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n3"]], service: "n2", method: "updatePetWithForm", updatePetWithForm_petId: "4513", updatePetWithForm_name: "pending doggie", updatePetWithForm_status: "pending"},
                    {id: "n2", type: "swagger-petstore-service"},
                    {id: "n3", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n3 = helper.getNode('n3');
            n3.on('input', function (msg) {
                try {
                    msg.should.have.property('payload', 'foo');
                    msg.should.have.property('topic', 'bar');
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: "foo", topic: "bar" });
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
    it('should handle createUser()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n3"]], service: "n2", method: "createUser"},
                    {id: "n2", type: "swagger-petstore-service"},
                    {id: "n3", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n3 = helper.getNode('n3');
            n3.on('input', function (msg) {
                try {
                    msg.payload.should.eql({
                        "id": 8110,
                        "username": "My user name",
                        "firstName": "My first name",
                        "lastName": "My last name",
                        "email": "My e-mail address",
                        "password": "My password",
                        "phone": "My phone number",
                        "userStatus": 0
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({
                payload: {
                    "id": 8110,
                    "username": "My user name",
                    "firstName": "My first name",
                    "lastName": "My last name",
                    "email": "My e-mail address",
                    "password": "My password",
                    "phone": "My phone number",
                    "userStatus": 0
                }
            });
        });
    });
    it('should handle loginUser()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n3"]], service: "n2", method: "loginUser", loginUser_username: "My user name", loginUser_password: "My password"},
                    {id: "n2", type: "swagger-petstore-service"},
                    {id: "n3", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n3 = helper.getNode('n3');
            n3.on('input', function (msg) {
                try {
                    msg.payload.should.startWith('logged in user session:');
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({});
        });
    });
});

