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

    after(function (done) {
        helper.stopServer(done);
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
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "addPet"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
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
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "updatePet"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
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
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "findPetsByStatus", findPetsByStatus_status: "available"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
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
    it('should handle getPetById()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "getPetById", getPetById_petId: "4513"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
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
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "updatePetWithForm", updatePetWithForm_petId: "4513", updatePetWithForm_name: "pending doggie", updatePetWithForm_status: "pending"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
                try {
                    msg.payload.should.eql({ code: 200, type: 'unknown', message: '4513' });
                    msg.should.have.property('topic', 'bar');
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: "foo", topic: "bar" });
        });
    });
    it('should handle deletePet()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "deletePet", deletePet_petId: "4513"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
                try {
                    msg.payload.should.eql({ code: 200, type: 'unknown', message: '4513' });
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
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "getInventory"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
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
    it('should handle placeOrder()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "placeOrder"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
                try {
                    msg.payload.should.eql({
                        "id": 4147,
                        "petId": 4513,
                        "quantity": 1,
                        "shipDate": "1983-09-12T09:03:00.000+0000",
                        "status": "placed",
                        "complete": false
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({
                payload: {
                    "id": 4147,
                    "petId": 4513,
                    "quantity": 1,
                    "shipDate": "1983-09-12T09:03:00.000Z",
                    "status": "placed",
                    "complete": false
                }
            });
        });
    });
    it('should handle getOrderById()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "getOrderById", getOrderById_orderId: "4147"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
                try {
                    msg.payload.should.eql({
                        "id": 4147,
                        "petId": 4513,
                        "quantity": 1,
                        "shipDate": "1983-09-12T09:03:00.000+0000",
                        "status": "placed",
                        "complete": false
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({});
        });
    });
    it('should handle deleteOrder()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "deleteOrder", deleteOrder_orderId: "4147"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
                try {
                    msg.payload.should.eql({ code: 200, type: 'unknown', message: '4147' });
                    msg.should.have.property('topic', 'bar');
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: "foo", topic: "bar" });
        });
    });
    it('should handle createUser()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "createUser"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
                try {
                    msg.payload.should.eql({ code: 200, type: 'unknown', message: '8110' });
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
    it('should handle createUsersWithArrayInput()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "createUsersWithArrayInput"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
                try {
                    msg.payload.should.eql({ code: 200, type: 'unknown', message: 'ok' });
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({
                payload: [
                    {
                        "id": 8948,
                        "username": "My user name",
                        "firstName": "My first name",
                        "lastName": "My last name",
                        "email": "My e-mail address",
                        "password": "My password",
                        "phone": "My phone number",
                        "userStatus": 0
                    }
                ]
            });
        });
    });
    it('should handle createUsersWithListInput()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "createUsersWithListInput"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
                try {
                    msg.payload.should.eql({ code: 200, type: 'unknown', message: 'ok' });
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({
                payload: [
                    {
                        "id": 8808,
                        "username": "My user name",
                        "firstName": "My first name",
                        "lastName": "My last name",
                        "email": "My e-mail address",
                        "password": "My password",
                        "phone": "My phone number",
                        "userStatus": 0
                    }
                ]
            });
        });
    });
    it('should handle loginUser()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "loginUser", loginUser_username: "My user name", loginUser_password: "My password"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
                try {
                    msg.payload.should.containEql({ code: 200, type: 'unknown' });
                    msg.payload.message.should.startWith('logged in user session:');
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({});
        });
    });
    it('should handle logoutUser()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "logoutUser"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
                try {
                    msg.payload.should.eql({ code: 200, type: 'unknown', message: 'ok' });
                    msg.should.have.property('topic', 'bar');
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: "foo", topic: "bar" });
        });
    });
    it('should handle getUserByName()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "getUserByName", getUserByName_username: "My user name"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
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
            n1.receive({});
        });
    });
    it('should handle updateUser()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "updateUser", updateUser_username: "My user name"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
                try {
                    msg.payload.should.eql({ code: 200, type: 'unknown', message: '8808' });
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({
                payload: {
                    "id": 8808,
                    "username": "My user name2",
                    "firstName": "My first name2",
                    "lastName": "My last name2",
                    "email": "My e-mail address2",
                    "password": "My password2",
                    "phone": "My phone number2",
                    "userStatus": 0
                }
            });
        });
    });
    it('should handle deleteUser()', function (done) {
        var flow = [{id: "n1", type: "swagger-petstore", wires: [["n2"]], method: "deleteUser", deleteUser_username: "My user name2"},
                    {id: "n2", type: "helper"}];
        helper.load(swaggerNode, flow, function () {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
                try {
                    msg.payload.should.eql({ code: 200, type: 'unknown', message: 'My user name2' });
                    msg.should.have.property('topic', 'bar');
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: "foo", topic: "bar" });
        });
    });
});
