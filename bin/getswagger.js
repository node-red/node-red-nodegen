#!/usr/bin/env node

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

var fs = require('fs');
var request = require('request');

request("http://petstore.swagger.io/v2/swagger.json", function (error, response, body) {
    if (!error) {
        try {
            var swagger = JSON.parse(body);
            swagger.schemes = ["http"];
            fs.writeFileSync(__dirname + "/../samples/swagger.json", JSON.stringify(swagger));
        } catch (error2) {
            console.error(error2);
        }
    } else {
        console.error(error);
    }
});
