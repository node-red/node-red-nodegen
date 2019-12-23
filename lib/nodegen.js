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

var when = require("when");
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var request = require('request');
var mustache = require('mustache');
var jsStringEscape = require('js-string-escape');
var obfuscator = require('javascript-obfuscator');
var csv = require('csv-string');
var CodeGen = require('swagger-js-codegen-formdata').CodeGen;
var jimp = require("jimp");

var wotutils = require('./wotutils');

function createCommonFiles(templateDirectory, data) {
    "use strict";
    // Make directories
    try {
        fs.mkdirSync(path.join(data.dst, data.module));
    } catch (error) {
        if (error.code !== 'EEXIST') {
            console.error(error);
        }
    }

    var isStockIcon = data.icon && data.icon.match(/^(alert|arduino|arrow-in|batch|bluetooth|bridge-dash|bridge|cog|comment|db|debug|envelope|feed|file-in|file-out|file|function|hash|inject|join|leveldb|light|link-out|mongodb|mouse|node-changed|node-error|parser-csv|parser-html|parser-json|parser-xml|parser-yaml|range|redis|rpi|serial|sort|split|subflow|swap|switch|template|timer|trigger|twitter|watch|white-globe)\.png$/);
    if (!isStockIcon) {
        try {
            fs.mkdirSync(path.join(data.dst, data.module, 'icons'));
        } catch (error) {
            if (error.code !== 'EEXIST') {
                console.error(error);
            }
        }
    }
    if (data.icon) {
        if (!isStockIcon) {
            try {
                jimp.read(data.icon, function (error2, image) {
                    if (!error2) {
                        var outputPath = path.join(data.dst, data.module, 'icons', path.basename(data.icon));
                        if (image.bitmap.width === 40 && image.bitmap.height === 60) {
                            var buf = fs.readFileSync(data.icon);
                            fs.writeFileSync(outputPath, buf);
                        } else {
                            image.background(0xFFFFFFFF).resize(40, 60).write(outputPath);
                        }
                    } else {
                        console.log('error occurs while converting icon file.');
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }
    } else {
        var icons = fs.readdirSync(path.join(templateDirectory, 'icons'));
        icons.forEach(function (icon) {
            try {
                var buf = fs.readFileSync(path.join(templateDirectory, 'icons', icon));
                fs.writeFileSync(path.join(data.dst, data.module, 'icons', icon), buf);
            } catch (error) {
                console.error(error);
            }
        });
    }

    try {
        fs.mkdirSync(path.join(data.dst, data.module, 'locales'));
    } catch (error) {
        if (error.code !== 'EEXIST') {
            console.error(error);
        }
    }
    try {
        var languages = fs.readdirSync(path.join(templateDirectory, 'locales'));
        languages.forEach(function (language) {
            try {
                fs.mkdirSync(path.join(data.dst, data.module, 'locales', language));
            } catch (error) {
                if (error.code !== 'EEXIST') {
                    console.error(error);
                }
            }
        });
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(error);
        }
    }
    try {
        fs.mkdirSync(path.join(data.dst, data.module, 'test'));
    } catch (error) {
        if (error.code !== 'EEXIST') {
            console.error(error);
        }
    }
    try {
        var buf = fs.readFileSync(path.join(templateDirectory, '.travis.yml.mustache'));
        fs.writeFileSync(path.join(data.dst, data.module, '.travis.yml'), buf);
    } catch (error) {
        if (error.code !== 'EEXIST') {
            console.error(error);
        }
    }


}

function runNpmPack(data) {
    "use strict";
    var npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    try {
        child_process.execFileSync(npmCommand, ['pack', './' + data.module], { cwd: data.dst });
    } catch (error) {
        console.error(error);
    }
}

function extractKeywords(keywordsStr) {
    "use strict";
    var keywords = ["node-red-nodegen"];
    keywords = keywordsStr ? keywords.concat(csv.parse(keywordsStr)[0]) : keywords;
    keywords = keywords.map(k => ({ name: k }));
    keywords[keywords.length - 1].last = true;
    return keywords;
}

function function2node(data, options) {
    "use strict";
    return when.promise(function (resolve, reject) {
        // Read meta data in js file
        var meta = {};
        var parts = new String(data.src).split('\n');
        parts.forEach(function (part) {
            var match = /^\/\/ (\w+): (.*)/.exec(part.toString());
            if (match) {
                if (match[1] === 'name') {
                    meta.name = match[2].replace(/([A-Z])/g, ' $1').toLowerCase().replace(/[^ a-z0-9]+/g, '').replace(/^ | $/, '').replace(/ +/g, '-');
                } else {
                    meta[match[1]] = match[2];
                }
            }
        });

        if (!data.name || data.name === '') {
            data.name = meta.name;
        }

        if (data.module) {
            if (data.prefix) {
                reject('module name and prefix are conflicted.');
                return;
            }
        } else {
            if (data.prefix) {
                data.module = data.prefix + data.name;
            } else {
                data.module = 'node-red-contrib-' + data.name;
            }
        }

        if (!data.version || data.version === '') {
            data.version = '0.0.1';
        }

        if (data.icon) {
            if (!data.icon.match(/\.(png|gif)$/)) {
                data.icon = data.icon + '.png';
            }
            if (!data.icon.match(/^[a-zA-Z0-9\-\./]+$/)) {
                reject('invalid icon file name');
                return;
            }
        }

        if (data.color) {
            if (data.color.match(/^[a-zA-Z0-9]{6}$/)) {
                data.color = '#' + data.color;
            } else {
                reject('invalid color');
                return;
            }
        }

        if (data.name === 'function') {
            reject('\'function\' is duplicated node name. Use another name.');
            return;
        } else if (!data.name.match(/^[a-z0-9\-]+$/)) {
            reject('invalid node name');
            return;
        } else {
            var params = {
                nodeName: data.name,
                projectName: data.module,
                projectVersion: data.version,
                keywords: extractKeywords(data.keywords),
                category: data.category || 'function',
                icon: function () {
                    if (data.icon) {
                        return path.basename(data.icon);
                    } else {
                        return 'icon.png';
                    }
                },
                color: data.color || '#C0DEED',
                func: jsStringEscape(data.src),
                outputs: meta.outputs
            };

            createCommonFiles(__dirname + '/../templates/function', data);

            // Create package.json
            var packageTemplate = fs.readFileSync(path.join(__dirname, '../templates/function/package.json.mustache'), 'utf-8');
            var packageSourceCode = mustache.render(packageTemplate, params);
            fs.writeFileSync(path.join(data.dst, data.module, 'package.json'), packageSourceCode);

            // Create node.js
            var nodeTemplate = fs.readFileSync(path.join(__dirname, '../templates/function/node.js.mustache'), 'utf-8');
            var nodeSourceCode = mustache.render(nodeTemplate, params);
            if (options.obfuscate) {
                nodeSourceCode = obfuscator.obfuscate(nodeSourceCode, { stringArrayEncoding: 'rc4' });
            }
            fs.writeFileSync(path.join(data.dst, data.module, 'node.js'), nodeSourceCode);

            // Create node.html
            var htmlTemplate = fs.readFileSync(path.join(__dirname, '../templates/function/node.html.mustache'), 'utf-8');
            var htmlSourceCode = mustache.render(htmlTemplate, params);
            fs.writeFileSync(path.join(data.dst, data.module, 'node.html'), htmlSourceCode);

            // Create node_spec.js
            var nodeSpecTemplate = fs.readFileSync(path.join(__dirname, '../templates/function/test/node_spec.js.mustache'), 'utf-8');
            var nodeSpecSourceCode = mustache.render(nodeSpecTemplate, params);
            fs.writeFileSync(path.join(data.dst, data.module, 'test/node_spec.js'), nodeSpecSourceCode);

            // Create README.md
            var readmeTemplate = fs.readFileSync(path.join(__dirname, '../templates/function/README.md.mustache'), 'utf-8');
            var readmeSourceCode = mustache.render(readmeTemplate, params);
            fs.writeFileSync(path.join(data.dst, data.module, 'README.md'), readmeSourceCode);

            // Create LICENSE file
            var licenseTemplate = fs.readFileSync(path.join(__dirname, '../templates/function/LICENSE.mustache'), 'utf-8');
            var licenseSourceCode = mustache.render(licenseTemplate, params);
            fs.writeFileSync(path.join(data.dst, data.module, 'LICENSE'), licenseSourceCode);

            if (options.tgz) {
                runNpmPack(data);
                resolve(path.join(data.dst, data.module + '-' + data.version + '.tgz'));
            } else {
                resolve(path.join(data.dst, data.module));
            }
        }
    });
}

function swagger2node(data, options) {
    "use strict";
    return when.promise(function (resolve, reject) {
        // Modify swagger data
        var swagger = JSON.parse(JSON.stringify(data.src), function (key, value) {
            if (key === 'consumes' || key === 'produces') { // Filter type of 'Content-Type' and 'Accept' in request header
                if (value.indexOf('application/json') >= 0) {
                    return ['application/json'];
                } else if (value.indexOf('application/xml') >= 0) {
                    return ['application/xml'];
                } else if (value.indexOf('text/csv') >= 0) {
                    return ['text/csv'];
                } else if (value.indexOf('text/plain') >= 0) {
                    return ['text/plain'];
                } else if (value.indexOf('multipart/form-data') >= 0) {
                    return ['multipart/form-data'];
                } else if (value.indexOf('application/octet-stream') >= 0) {
                    return ['application/octet-stream'];
                } else {
                    return undefined;
                }
            } else if (key === 'default') { // Handle swagger-js-codegen bug
                return undefined;
            } else if (key === 'operationId') { // Sanitize 'operationId' (remove special chars)
                return value.replace(/(?!\w|\s)./g, '');
            } else {
                return value;
            }
        });

        var className = swagger.info.title.toLowerCase().replace(/(^|[^a-z0-9]+)[a-z0-9]/g,
            function (str) {
                return str.replace(/^[^a-z0-9]+/, '').toUpperCase();
            });

        if (!data.name || data.name === '') {
            data.name = className.replace(/([A-Z])/g, '-$1').slice(1).toLowerCase();
        }

        if (data.module) {
            if (data.prefix) {
                reject('error: module name and prefix are conflicted.');
                return;
            }
        } else {
            if (data.prefix) {
                data.module = data.prefix + data.name;
            } else {
                data.module = 'node-red-contrib-' + data.name;
            }
        }

        if (!data.version || data.version === '') {
            if (swagger.info.version) {
                var version = swagger.info.version.replace(/[^0-9\.]/g, '');
                if (version.match(/^[0-9]+$/)) {
                    data.version = version + '.0.0';
                } else if (version.match(/^[0-9]+\.[0-9]+$/)) {
                    data.version = version + '.0';
                } else if (version.match(/^[0-9]+\.[0-9]+\.[0-9]+$/)) {
                    data.version = version;
                } else {
                    data.version = '0.0.1';
                }
            } else {
                data.version = '0.0.1';
            }
        }

        if (data.icon) {
            if (!data.icon.match(/\.(png|gif)$/)) {
                data.icon = data.icon + '.png';
            }
            if (!data.icon.match(/^[a-zA-Z0-9\-\./]+$/)) {
                reject('invalid icon file name');
                return;
            }
        }

        if (data.color) {
            if (data.color.match(/^[a-zA-Z0-9]{6}$/)) {
                data.color = '#' + data.color;
            } else {
                reject('invalid color');
                return;
            }
        }

        createCommonFiles(path.join(__dirname, '../templates/swagger'), data);

        // Create Node.js SDK
        var nodejsSourceCode = CodeGen.getNodeCode({
            className: className,
            swagger: swagger,
            lint: false,
            beautify: false
        });
        if (options.obfuscate) {
            nodejsSourceCode = obfuscator.obfuscate(nodejsSourceCode, { stringArrayEncoding: 'rc4' });
        }
        fs.writeFileSync(path.join(data.dst, data.module, 'lib.js'), nodejsSourceCode);

        // Create package.json
        var packageSourceCode = CodeGen.getCustomCode({
            className: className,
            swagger: swagger,
            template: {
                class: fs.readFileSync(path.join(__dirname, '../templates/swagger/package.json.mustache'), 'utf-8'),
                method: '',
                type: ''
            },
            mustache: {
                nodeName: data.name,
                projectName: data.module,
                projectVersion: data.version,
                keywords: extractKeywords(data.keywords),
                licenseName: function () {
                    if (swagger.info.license && swagger.info.license.name) {
                        return swagger.info.license.name;
                    } else {
                        return 'Apache-2.0';
                    }
                },
                projectAuthor: swagger.info.contact && swagger.info.contact.name ? swagger.info.contact.name : ''
            },
            lint: false,
            beautify: false
        });
        fs.writeFileSync(path.join(data.dst, data.module, 'package.json'), packageSourceCode);

        // Mustache helpers
        var isNotBodyParam = function () {
            return function (content, render) {
                return render('{{camelCaseName}}') !== 'body' ? render(content) : '';
            };
        };
        var isBodyParam = function () {
            return function (content, render) {
                return render('{{camelCaseName}}') === 'body' ? render(content) : '';
            };
        };
        var hasOptionalParams = function () {
            return function (content, render) {
                var params = render('{{#parameters}}{{^required}}{{camelCaseName}},{{/required}}{{/parameters}}');
                return params.split(',').filter(p => p).some(p => p !== 'body') ? render(content) : '';
            };
        };
        var hasServiceParams = swagger.host === undefined || swagger.securityDefinitions !== undefined;

        // Create node.js
        var nodeSourceCode = CodeGen.getCustomCode({
            className: className,
            swagger: swagger,
            template: {
                class: fs.readFileSync(path.join(__dirname, '../templates/swagger/node.js.mustache'), 'utf-8'),
                method: '',
                type: ''
            },
            mustache: {
                nodeName: data.name,
                isBodyParam: isBodyParam,
                isNotBodyParam: isNotBodyParam,
                hasServiceParams: hasServiceParams 
            },
            lint: false,
            beautify: false
        });
        if (options.obfuscate) {
            nodeSourceCode = obfuscator.obfuscate(nodeSourceCode, { stringArrayEncoding: 'rc4' });
        }
        fs.writeFileSync(path.join(data.dst, data.module, 'node.js'), nodeSourceCode);

        // Create node.html
        var htmlSourceCode = CodeGen.getCustomCode({
            className: className,
            swagger: swagger,
            template: {
                class: fs.readFileSync(path.join(__dirname, '../templates/swagger/node.html.mustache'), 'utf-8'),
                method: '',
                type: ''
            },
            mustache: {
                nodeName: data.name,
                category: data.category || 'function',
                icon: function () {
                    if (data.icon) {
                        return path.basename(data.icon);
                    } else {
                        return 'icon.png';
                    }
                },
                color: data.color || '#89bf04',
                isNotBodyParam: isNotBodyParam,
                hasOptionalParams: hasOptionalParams,
                hasServiceParams: hasServiceParams 
            },
            lint: false,
            beautify: false
        });
        fs.writeFileSync(path.join(data.dst, data.module, 'node.html'), htmlSourceCode);

        // Create language files
        var languages = fs.readdirSync(path.join(__dirname, '../templates/swagger/locales'));
        languages.forEach(function (language) {
            var languageFileSourceCode = CodeGen.getCustomCode({
                className: className,
                swagger: swagger,
                template: {
                    class: fs.readFileSync(path.join(__dirname, '../templates/swagger/locales', language, 'node.json.mustache'), 'utf-8'),
                    method: '',
                    type: ''
                },
                mustache: {
                    nodeName: data.name,
                },
                lint: false,
                beautify: false
            });
            fs.writeFileSync(path.join(data.dst, data.module, 'locales', language, 'node.json'),
                             JSON.stringify(JSON.parse(languageFileSourceCode), null, 4));
        });

        // Create node_spec.js
        var nodeSpecSourceCode = CodeGen.getCustomCode({
            className: className,
            swagger: swagger,
            template: {
                class: fs.readFileSync(path.join(__dirname, '../templates/swagger/test/node_spec.js.mustache'), 'utf-8'),
                method: '',
                type: ''
            },
            mustache: {
                nodeName: data.name,
                projectName: data.module,
                hasServiceParams: hasServiceParams 
            },
            lint: false,
            beautify: false
        });
        fs.writeFileSync(path.join(data.dst, data.module, 'test/node_spec.js'), nodeSpecSourceCode);

        // Create README.md
        var readmeSourceCode = CodeGen.getCustomCode({
            className: className,
            swagger: swagger,
            template: {
                class: fs.readFileSync(path.join(__dirname, '../templates/swagger/README.md.mustache'), 'utf-8'),
                method: '',
                type: ''
            },
            mustache: {
                nodeName: data.name,
                projectName: data.module,
                licenseName: function () {
                    if (swagger.info.license && swagger.info.license.name) {
                        return swagger.info.license.name;
                    } else {
                        return 'Apache-2.0';
                    }
                },
                licenseUrl: function () {
                    if (swagger.info.license && swagger.info.license.url) {
                        return swagger.info.license.url;
                    } else {
                        return '';
                    }
                }
            },
            lint: false,
            beautify: false
        });
        fs.writeFileSync(path.join(data.dst, data.module, 'README.md'), readmeSourceCode);

        // Create LICENSE file
        var licenseSourceCode = CodeGen.getCustomCode({
            projectName: data.module,
            className: className,
            swagger: swagger,
            template: {
                class: fs.readFileSync(path.join(__dirname, '../templates/swagger/LICENSE.mustache'), 'utf-8'),
                method: '',
                type: ''
            },
            mustache: {
                licenseName: function () {
                    if (swagger.info.license && swagger.info.license.name) {
                        return swagger.info.license.name;
                    } else {
                        return 'Apache-2.0';
                    }
                },
                licenseUrl: function () {
                    if (swagger.info.license && swagger.info.license.url) {
                        return swagger.info.license.url;
                    } else {
                        return '';
                    }
                }
            },
            lint: false,
            beautify: false
        });
        fs.writeFileSync(path.join(data.dst, data.module, 'LICENSE'), licenseSourceCode);

        if (options.tgz) {
            runNpmPack(data);
            resolve(path.join(data.dst, data.module + '-' + data.version + '.tgz'));
        } else {
            resolve(path.join(data.dst, data.module));
        }
    });
}


function wottd2node(data, options) {
    return when.promise(function (resolve, reject) {
        let td = data.src;

        // validate TD
        const validateResult = wotutils.validateTd(td);
        if (validateResult.result === false) {
            console.warn(`Invalid Thing Description:\n${validateResult.errorText}`);
        } else {
            console.info(`Schema validation succeeded.`);
        }

        // if name is not specified, use td.title for module name.
        if (!data.name || data.name === '') {
            // filtering out special characters
            data.name = 'wot' + td.title.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
        }

        if (data.module) {
            if (data.prefix) {
                reject('error: module name and prefix are conflicted');
                return;
            }
        } else {
            if (data.prefix) {
                data.module = data.prefix + data.name;
            } else {
                data.module = 'node-red-contrib-' + data.name;
            }
        }
        
        if (!data.version || data.version === '') {
            if (td.version && td.version.instance) {
                data.version = td.version.instance;
            } else {
                data.version = '0.0.1';
            }
        }

        data.tdstr = JSON.stringify(td);
        td = wotutils.normalizeTd(td);
        td = wotutils.filterFormTd(td);
        data.normtd = JSON.stringify(td);
        data.properties = [];
        const rwo = {};
        for (const p in td.properties) {  // convert to array
            if (td.properties.hasOwnProperty(p)) {
                const q = td.properties[p];
                q.name = p;
                if (!q.title || q.title === '') {
                    q.title = q.name;
                }
                if (q.forms) {
                    for (var i = 0; i < q.forms.length; i++) {
                        q.forms[i].index = i;
                    }
                }
                data.properties.push(q);
                rwo[p] = {
                    readable: !q.writeOnly,
                    writable: !q.readOnly,
                    observable: q.observable
                };

            }
        }
        data.actions = [];
        for (const a in td.actions) { 
            if (td.actions.hasOwnProperty(a)) {
                const q = td.actions[a];
                q.name = a;
                if (!q.title || q.title === '') {
                    q.title = q.name;
                }
                if (q.forms) {
                    for (var i = 0; i < q.forms.length; i++) {
                        q.forms[i].index = i;
                    }
                }
                data.actions.push(q);
            }
        }
        data.events = [];
        for (const e in td.events) {
            if (td.events.hasOwnProperty(e)) {
                const q = td.events[e];
                q.name = e;
                if (!q.title || q.title === '') {
                    q.title = q.name;
                }
                if (q.forms) {
                    for (var i = 0; i < q.forms.length; i++) {
                        q.forms[i].index = i;
                    }
                }
                data.events.push(q);
            }
        }

        const wotmeta = [];
        if (td.hasOwnProperty('lastModified')) { 
            wotmeta.push({name: "lastModified", value: td.lastModified}); 
        }
        if (td.hasOwnProperty('created')) { 
            wotmeta.push({name: "created", value: td.created}); 
        }
        if (td.hasOwnProperty('support')) { 
            wotmeta.push({name: "support", value: JSON.stringify(td.support)}); 
        }
        if (td.hasOwnProperty("id")) {
            wotmeta.push({name: "id", value: td.id, last: true});
        }

        const formsel = wotutils.makeformsel(td);
        
        data.genformsel = JSON.stringify(formsel);
        data.genproprwo = JSON.stringify(rwo);

        data.ufName = td.title.replace(/[^A-Za-z0-9]/g, ' ').trim();
        data.nodeName = data.name;
        data.projectName = data.module;
        data.projectVersion = data.version;
        data.keywords = extractKeywords(data.keywords);
        data.category = data.category || 'Web of Things';
        data.description = td.description;
        data.licenseName = 'Apache-2.0';
        data.licenseUrl = '';
        data.links = td.links;
        data.support = td.support;
        data.iconpath = wotutils.woticon(td);
        data.wotmeta = wotmeta;

        let lang = null;
        if (td.hasOwnProperty('@context') && Array.isArray(td['@context'])) {
            td['@context'].forEach(e => {
                if (e.hasOwnProperty("@language")) {
                    lang = e['@language'];
                }
            });
        }
        if (lang === null) {
            data.textdir = "auto";
        } else {
            data.textdir = wotutils.textDirection(lang);
        }

        createCommonFiles(path.join(__dirname, '../templates/webofthings'), data);

        // Create package.json
        const packageTemplate = fs.readFileSync(path.join(__dirname, '../templates/webofthings/package.json.mustache'), 'utf-8');
        const packageSourceCode = mustache.render(packageTemplate, data);
        fs.writeFileSync(path.join(data.dst, data.module, 'package.json'), packageSourceCode);

        // Create node.js
        const nodeTemplate = fs.readFileSync(path.join(__dirname, '../templates/webofthings/node.js.mustache'), 'utf-8');
        let nodeSourceCode = mustache.render(nodeTemplate, data);
        if (options.obfuscate) {
            nodeSourceCode = obfuscator.obfuscate(nodeSourceCode, { stringArrayEncoding: 'rc4' });
        }
        fs.writeFileSync(path.join(data.dst, data.module, 'node.js'), nodeSourceCode);

        // Create node.html
        const htmlTemplate = fs.readFileSync(path.join(__dirname, '../templates/webofthings/node.html.mustache'), 'utf-8');
        const htmlSourceCode = mustache.render(htmlTemplate, data);
        fs.writeFileSync(path.join(data.dst, data.module, 'node.html'), htmlSourceCode);

        // Create README.html
        const readmeTemplate = fs.readFileSync(path.join(__dirname, '../templates/webofthings/README.md.mustache'), 'utf-8');
        const readmeSourceCode = mustache.render(readmeTemplate, data);
        fs.writeFileSync(path.join(data.dst, data.module, 'README.md'), readmeSourceCode);

        // Create LICENSE
        const licenseTemplate = fs.readFileSync(path.join(__dirname, '../templates/webofthings/LICENSE.mustache'), 'utf-8');
        const licenseSourceCode = mustache.render(licenseTemplate, data);
        fs.writeFileSync(path.join(data.dst, data.module, 'LICENSE'), licenseSourceCode);

        if (options.tgz) {
            runNpmPack(data);
            resolve(path.join(data.dst, data.module + '-' + data.version + '.tgz'));
        } else {
            resolve(path.join(data.dst, data.module));
        }
    });
}

module.exports = {
    function2node: function2node,
    swagger2node: swagger2node,
    wottd2node: wottd2node
};
