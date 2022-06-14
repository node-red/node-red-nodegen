#!/usr/bin/env node

/**
 * Copyright OpenJS Foundation and other contributors
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
var path = require('path');

var argv = require('minimist')(process.argv.slice(2));
var colors = require('colors');
var nodegen = require('../lib/nodegen.js');

// Command options
var options = {};
options.tgz = argv.tgz;
options.obfuscate = argv.obfuscate;
options.encoding = argv.encoding;
options.encodekey = argv.encodekey;

var data = {
    prefix: argv.prefix || argv.p,
    name: argv.name || argv.n,
    module: argv.module,
    version: argv.version,
    keywords: argv.keywords || argv.k,
    category: argv.category || argv.c,
    icon: argv.icon,
    color: argv.color,
    dst: argv.output || argv.o || '.',
    lang: argv.lang
};

function help() {
    "use strict";
    var helpText = 'Usage:'.bold + '\n' +
        '   node-red-nodegen <source file or URL>' +
        ' [-o <path to save>]' +
        ' [--prefix <prefix string>]' +
        ' [--name <node name>]' +
        ' [--module <module name>]' +
        ' [--version <version number>]' +
        ' [--keywords <keywords list>]' +
        ' [--category <node category>]' +
        ' [--icon <png or gif file>]' +
        ' [--color <node color>]' +
        ' [--tgz]' +
        ' [--help]' +
        ' [--wottd]' +
        ' [--encoding <encoding>]' +
        ' [--encodekey <encoding key>]' +
        ' [--lang <accept-language>]' +
        ' [-v]\n' +
        '\n' +
        'Description:'.bold + '\n' +
        '   Node generator for Node-RED\n' +
        '\n' +
        'Supported source:'.bold + '\n' +
        '   - OpenAPI document\n' +
        '   - Function node (js file in library, "~/.node-red/lib/function/")\n' +
        '   - Subflow node (json file of subflow)\n' +
        '   - (Beta) Thing Description of W3C Web of Things (jsonld file or URL that points jsonld file)\n' +
        '\n' +
        'Options:\n'.bold +
        '   -o : Destination path to save generated node (default: current directory)\n' +
        '   --prefix : Prefix of npm module (default: "node-red-contrib-")\n' +
        '   --name : Node name (default: name defined in source)\n' +
        '   --module : Module name (default: "node-red-contrib-<node name>")\n' +
        '   --version : Node version (format: "number.number.number" like "4.5.1")\n' +
        '   --keywords : Additional keywords (format: comma separated string, default: "node-red-nodegen")\n' +
        '   --category : Node category (default: "function")\n' +
        '   --icon : PNG file for node appearance (image size should be 10x20)\n' +
        '   --color : Color for node appearance (format: color hexadecimal numbers like "A6BBCF")\n' +
        '   --tgz : Save node as tgz file\n' +
        '   --help : Show help\n' +
        '   --wottd : explicitly instruct source file/URL points a Thing Description\n' +
        '   --encoding : Encoding scheme of subflow (none or AES)\n' +
        '   --encodekey : Encoding key of subflow\n' +
        '   --lang : Language negotiation information when retrieve a Thing Description\n' +
        '   -v : Show node generator version\n';
    console.log(helpText);
}

function version() {
    var packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));
    console.log(packageJson.version);
}

function skipBom(body) {
    if (body[0]===0xEF &&
        body[1]===0xBB &&
        body[2]===0xBF) {
        return body.slice(3);
    } else {
        return body;
    }
}

function isSubflowDefinition(data) {
    return data.find((item) => {
        return item.type === "subflow";
    });
}

if (argv.help || argv.h) {
    help();
} else if (argv.v) {
    version();
} else {
    var promise;
    var sourcePath = argv._[0];
    if (sourcePath) {
        data.src = sourcePath;
        if (argv.wottd || /\.jsonld$/.test(sourcePath)) {
            // Explicitly a Web Of Things request
            promise = nodegen.WebOfThingsGenerator(data, options);
        } else if (/^https?:/.test(sourcePath) || /.yaml$/.test(sourcePath)) {
            // URL/yaml -> swagger
            promise = nodegen.SwaggerNodeGenerator(data, options);
        } else if (/\.json$/.test(sourcePath)) {
            // JSON could be a Function node, or Swagger
            var content = JSON.parse(fs.readFileSync(sourcePath));
            if (Array.isArray(content)) {
                data.src = content;
                if (isSubflowDefinition(content)) {
                    promise = nodegen.SubflowNodeGenerator(data, options);
                }
                else {
                    promise = nodegen.FunctionNodeGenerator(data, options);
                }
            } else {
                promise = nodegen.SwaggerNodeGenerator(data, options);
            }
        } else if (/\.js$/.test(sourcePath)) {
            // .js -> Function node
            promise = nodegen.FunctionNodeGenerator(data, options);
        } else {
            console.error('error: Unsupported file type');
            help();
            return;
        }
        if (promise) {
            promise.then(function (result) {
                console.log('Success: ' + result);
            }).catch(function (error) {
                console.log(error.stack);
            });
        }
    } else {
        help();
    }
}
