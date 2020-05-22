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
var path = require('path');
var request = require('request');
var yamljs = require('yamljs');
var argv = require('minimist')(process.argv.slice(2));
var colors = require('colors');
var Converter = require('api-spec-converter');
var nodegen = require('../lib/nodegen.js');

// Command options
var options = {};
options.tgz = argv.tgz;
options.obfuscate = argv.obfuscate;

var data = {
    prefix: argv.prefix || argv.p,
    name: argv.name || argv.n,
    module: argv.module,
    version: argv.version,
    keywords: argv.keywords || argv.k,
    category: argv.category || argv.c,
    icon: argv.icon,
    color: argv.color,
    dst: argv.output || argv.o || '.'
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
        ' [--lang <accept-language>]' +
        ' [-v]\n' +
        '\n' +
        'Description:'.bold + '\n' +
        '   Node generator for Node-RED\n' +
        '\n' +
        'Supported source:'.bold + '\n' +
        '   - OpenAPI document\n' +
        '   - Function node (js file in library, "~/.node-red/lib/function/")\n' +
        // '   - Subflow node (json file of subflow)\n' +
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

if (argv.help || argv.h) {
    help();
} else if (argv.v) {
    version();
} else {
    var sourcePath = argv._[0];
    if (sourcePath) {
        if (!argv.wottd && (sourcePath.startsWith('http://') || sourcePath.startsWith('https://'))) {
            request(sourcePath, function (error, response, body) {
                if (!error) {
                    data.src = JSON.parse(body);
                    Converter.convert({
                        from: data.src.openapi && data.src.openapi.startsWith('3.0') ? 'openapi_3' : 'swagger_2',
                        to: 'swagger_2',
                        source: data.src,
                    }).then(function (convertedData) {
                        data.src = convertedData.spec;
                        nodegen.swagger2node(data, options).then(function (result) {
                            console.log('Success: ' + result);
                        }).catch(function (error) {
                            console.log('Error: ' + error);
                        });
                    });
                } else {
                    console.error(error);
                }
            });
        } else if (argv.wottd && (sourcePath.startsWith('http://') || sourcePath.startsWith('https://'))) {
            const req = {
                url: sourcePath,
            }
            if (argv.lang) {
                req.headers = {
                    'Accept-Language': argv.lang
                }
            }
            request(req, function (error, response, body) {
                if (!error) {
                    data.src = JSON.parse(skipBom(body));
                    nodegen.wottd2node(data, options).then(function (result) {
                        console.log('Success: ' + result);
                    }).catch(function (error) {
                        console.log('Error: ' + error);
                    });
                } else {
                    console.error(error);
                }
            });
        } else if (sourcePath.endsWith('.json') && !argv.wottd) {
            data.src = JSON.parse(fs.readFileSync(sourcePath));
            // if it's a .json flow file with one function node in...
            if (Array.isArray(data.src) && data.src[0].hasOwnProperty("type") && data.src[0].type == "function") {
                var f = data.src[0];
                if (!f.name || f.name.length ==0) { console.log('Error: No function name supplied.'); return; }
                data.name = f.name.toLowerCase();
                data.icon = f.icon;
                data.info = f.info;
                data.outputs = f.outputs;
                data.inputLabels = f.inputLabels;
                data.outputLabels = f.outputLabels;
                data.src = Buffer.from(f.func);
                nodegen.function2node(data, options).then(function (result) {
                    console.log('Success: ' + result);
                }).catch(function (error) {
                    console.log('Error: ' + error);
                });
            }
            else {
                Converter.convert({
                    from: data.src.openapi && data.src.openapi.startsWith('3.0') ? 'openapi_3' : 'swagger_2',
                    to: 'swagger_2',
                    source: data.src,
                }).then(function (convertedData) {
                    data.src = convertedData.spec;
                    nodegen.swagger2node(data, options).then(function (result) {
                        console.log('Success: ' + result);
                    }).catch(function (error) {
                        console.log('Error: ' + error);
                    });
                });
            }
        } else if (sourcePath.endsWith('.yaml')) {
            data.src = yamljs.load(sourcePath);
            console.log(JSON.stringify(data.src, null, 4)); // hoge
            Converter.convert({
                from: data.src.openapi && data.src.openapi.startsWith('3.0') ? 'openapi_3' : 'swagger_2',
                to: 'swagger_2',
                source: data.src,
            }).then(function (convertedData) {
                data.src = convertedData.spec;
                nodegen.swagger2node(data, options).then(function (result) {
                    console.log('Success: ' + result);
                }).catch(function (error) {
                    console.log('Error: ' + error);
                });
            });
        } else if (sourcePath.endsWith('.js')) {
            data.src = fs.readFileSync(sourcePath);
            nodegen.function2node(data, options).then(function (result) {
                console.log('Success: ' + result);
            }).catch(function (error) {
                console.log('Error: ' + error);
            });
        } else if (sourcePath.endsWith('.jsonld') || argv.wottd) {
            data.src = JSON.parse(skipBom(fs.readFileSync(sourcePath)));
            nodegen.wottd2node(data, options).then(function (result) {
                console.log('Success: ' + result);
            }).catch(function (error) {
                console.log('Error: ' + error);
            });
        } else {
            console.error('error: Unsupported file type');
        }
    } else {
        help();
    }
}
