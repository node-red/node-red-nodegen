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
var yamljs = require('yamljs');
var argv = require('minimist')(process.argv.slice(2));
var colors = require('colors');
var nodegen = require('../lib/nodegen.js');

// Command options
var options = {};
options.tgz = argv.tgz;
options.obfuscate = argv.obfuscate;

var data = {
    prefix: argv.prefix || argv.p,
    name: argv.name || argv.n,
    module: argv.module,
    version: argv.version || argv.v,
    keywords: argv.keywords || argv.k,
    category: argv.category || argv.c,
    dst: argv.output || argv.o || '.'
};

function help() {
    var helpText = 'Usage:'.bold + '\n' +
        '   node-red-nodegen <source file or URL>' +
        ' [-o <path to save>]' +
        ' [--prefix <prefix string>]' +
        ' [--name <node name>]' +
        ' [--module <module name>]' +
        ' [--version <version number>' +
        ' [--keywords <keywords list>' +
        ' [--category <node category>' +
        //' [--icon <png or gif file>' +
        //' [--color <node color>' +
        ' [--tgz]' +
        ' [--help]\n' +
        '\n' +
        'Description:'.bold + '\n' +
        '   Node generator for Node-RED\n' +
        '\n' +
        'Supported source:'.bold + '\n' +
        '   - Function node (js file in library, "~/.node-red/lib/function/")\n' +
        // '   - Subflow node (json file of subflow)\n' +
        '   - Swagger definition\n' +
        '\n' +
        'Options:\n'.bold +
        '   -o : Destination path to save generated node (default: current directory)\n' +
        '   --prefix : Prefix of npm module (default: "node-red-contrib-")\n' +
        '   --name : Node name (default: name defined in source)\n' +
        '   --module : Module name (default: "node-red-contrib-<node name>")\n' +
        '   --version : Node version (format: "number.number.number" like "4.5.1")\n' +
        '   --keywords : Additional keywords (format: comma separated string, default: "node-red-nodegen")\n' +
        '   --category : Node category (default: "function")\n' +
        //'   --icon : png or gif file for node appearance (image size should be 10x20)\n';
        //'   --color : color for node appearance (format: color hexadecimal numbers like "#A6BBCF")\n';
        '   --tgz : Save node as tgz file\n' +
        '   --help : Show help\n';
    console.log(helpText);
}

if (!argv.h && !argv.help) {
    var sourcePath = argv._[0];
    if (sourcePath) {
        if (sourcePath.startsWith('http://') || sourcePath.startsWith('https://')) {
            request(sourcePath, function (error, response, body) {
                if (!error) {
                    data.src = JSON.parse(body);
                    var filename = nodegen.swagger2node(data, options);
                    console.log('Success: ' + filename);
                } else {
                    console.error(error);
                }
            });
        } else if (sourcePath.endsWith('.json')) {
            data.src = JSON.parse(fs.readFileSync(sourcePath));
            var filename = nodegen.swagger2node(data, options);
            console.log('Success: ' + filename);
        } else if (sourcePath.endsWith('.yaml')) {
            data.src = yamljs.load(sourcePath);
            var filename = nodegen.swagger2node(data, options);
            console.log('Success: ' + filename);
        } else if (sourcePath.endsWith('.js')) {
            data.src = fs.readFileSync(sourcePath);
            var filename = nodegen.function2node(data, options);
            console.log('Success: ' + filename);
        } else {
            console.error('error: Unsupported file type');
        }
    } else {
        help();
    }
} else {
    help();
}

