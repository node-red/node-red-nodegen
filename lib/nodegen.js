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
var child_process = require('child_process');
var request = require('request');
var mustache = require('mustache');
var jsStringEscape = require('js-string-escape');
var obfuscator = require('javascript-obfuscator');
var csv = require('csv-string');
var CodeGen = require('swagger-js-codegen').CodeGen;

function createCommonFiles(templateDirectory, data) {
    // Make directories
    try {
        fs.mkdirSync(data.dst + '/' + data.module);
    } catch (error) {
        if (error.code !== 'EEXIST') {
            console.error(error);
        }
    }
    try {
        fs.mkdirSync(data.dst + '/' + data.module + '/icons');
    } catch (error) {
        if (error.code !== 'EEXIST') {
            console.error(error);
        }
    }
    try {
        var icons = fs.readdirSync(templateDirectory + '/icons');
        icons.forEach(function (icon) {
            try {
                var buf = fs.readFileSync(templateDirectory + '/icons/' + icon);
                fs.writeFileSync(data.dst + '/' + data.module + '/icons/' + icon, buf);
            } catch (error) {
                console.error(error);
            }
        });
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(error);
        }
    }
    try {
        fs.mkdirSync(data.dst + '/' + data.module + '/locales');
    } catch (error) {
        if (error.code !== 'EEXIST') {
            console.error(error);
        }
    }
    try {
        var languages = fs.readdirSync(templateDirectory + '/locales');
        languages.forEach(function (language) {
            try {
                fs.mkdirSync(data.dst + '/' + data.module + '/locales/' + language);
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
}

function runNpmPack(data) {
    var npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    try {
        child_process.execFileSync(npmCommand, ['pack', './' + data.module], { cwd: data.dst });
    } catch (error) {
        console.error(error);
    }
}

function extractKeywords(keywordsStr) {
    var keywords = ["node-red-nodegen"];
    keywords = keywordsStr ? keywords.concat(csv.parse(keywordsStr)[0]) : keywords;
    keywords = keywords.map(k => ({ name: k }));
    keywords[keywords.length - 1].last = true;
    return keywords;
}

function function2node(data, options) {
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
            console.error('error: module name and prefix are conflicted.');
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

    if (data.name === 'function') {
        console.error('\'function\' is duplicated node name. Use another name.');
    } else {
        var params = {
            nodeName: data.name,
            projectName: data.module,
            projectVersion: data.version,
            keywords: extractKeywords(data.keywords),
            category: data.category || 'function',
            func: jsStringEscape(data.src),
            outputs: meta.outputs
        };

        createCommonFiles(__dirname + '/../templates/function', data);

        // Create package.json
        var packageTemplate = fs.readFileSync(__dirname + '/../templates/function/package.json.mustache', 'utf-8');
        var packageSourceCode = mustache.render(packageTemplate, params);
        fs.writeFileSync(data.dst + '/' + data.module + '/package.json', packageSourceCode);

        // Create node.js
        var nodeTemplate = fs.readFileSync(__dirname + '/../templates/function/node.js.mustache', 'utf-8');
        var nodeSourceCode = mustache.render(nodeTemplate, params);
        if (options.obfuscate) {
            nodeSourceCode = obfuscator.obfuscate(nodeSourceCode, { stringArrayEncoding: 'rc4' });
        }
        fs.writeFileSync(data.dst + '/' + data.module + '/node.js', nodeSourceCode);

        // Create node.html
        var htmlTemplate = fs.readFileSync(__dirname + '/../templates/function/node.html.mustache', 'utf-8');
        var htmlSourceCode = mustache.render(htmlTemplate, params);
        fs.writeFileSync(data.dst + '/' + data.module + '/node.html', htmlSourceCode);

        // Create README.md
        var readmeTemplate = fs.readFileSync(__dirname + '/../templates/function/README.md.mustache', 'utf-8');
        var readmeSourceCode = mustache.render(readmeTemplate, params);
        fs.writeFileSync(data.dst + '/' + data.module + '/README.md', readmeSourceCode);

        // Create LICENSE file
        var licenseTemplate = fs.readFileSync(__dirname + '/../templates/function/LICENSE.mustache', 'utf-8');
        var licenseSourceCode = mustache.render(licenseTemplate, params);
        fs.writeFileSync(data.dst + '/' + data.module + '/LICENSE', licenseSourceCode);

        if (options.tgz) {
            runNpmPack(data);
            return data.dst + '/' + data.module + '-' + data.version + '.tgz';
        } else {
            return data.dst + '/' + data.module;
        }
    }
}

function swagger2node(data, options) {
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
            console.error('error: module name and prefix are conflicted.');
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

    createCommonFiles(__dirname + '/../templates/swagger', data);

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
    fs.writeFileSync(data.dst + '/' + data.module + '/lib.js', nodejsSourceCode);

    // Create package.json
    var packageSourceCode = CodeGen.getCustomCode({
        className: className,
        swagger: swagger,
        template: {
            class: fs.readFileSync(__dirname + '/../templates/swagger/package.json.mustache', 'utf-8'),
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
    fs.writeFileSync(data.dst + '/' + data.module + '/package.json', packageSourceCode);

    // Mustache helpers
    var isNotBodyParam = function () {
        return function (content, render) {
            return render('{{camelCaseName}}') !== 'body' ? render(content) : '';
        }
    };
    var isBodyParam = function () {
        return function (content, render) {
            return render('{{camelCaseName}}') === 'body' ? render(content) : '';
        }
    };
    var hasOptionalParams = function () {
        return function (content, render) {
            var params = render('{{#parameters}}{{^required}}{{camelCaseName}},{{/required}}{{/parameters}}');
            return params.split(',').filter(p => p).some(p => p !== 'body') ? render(content) : '';
        }
    };

    // Create node.js
    var nodeSourceCode = CodeGen.getCustomCode({
        className: className,
        swagger: swagger,
        template: {
            class: fs.readFileSync(__dirname + '/../templates/swagger/node.js.mustache', 'utf-8'),
            method: '',
            type: ''
        },
        mustache: {
            nodeName: data.name,
            isBodyParam: isBodyParam,
            isNotBodyParam: isNotBodyParam
        },
        lint: false,
        beautify: false
    });
    if (options.obfuscate) {
        nodeSourceCode = obfuscator.obfuscate(nodeSourceCode, { stringArrayEncoding: 'rc4' });
    }
    fs.writeFileSync(data.dst + '/' + data.module + '/node.js', nodeSourceCode);

    // Create node.html
    var htmlSourceCode = CodeGen.getCustomCode({
        className: className,
        swagger: swagger,
        template: {
            class: fs.readFileSync(__dirname + '/../templates/swagger/node.html.mustache', 'utf-8'),
            method: '',
            type: ''
        },
        mustache: {
            nodeName: data.name,
            category: data.category || 'function',
            isNotBodyParam: isNotBodyParam,
            hasOptionalParams: hasOptionalParams
        },
        lint: false,
        beautify: false
    });
    fs.writeFileSync(data.dst + '/' + data.module + '/node.html', htmlSourceCode);

    // Create language files
    var languages = fs.readdirSync(__dirname + '/../templates/swagger/locales');
    languages.forEach(function (language) {
        var languageFileSourceCode = CodeGen.getCustomCode({
            className: className,
            swagger: swagger,
            template: {
                class: fs.readFileSync(__dirname + '/../templates/swagger/locales/' + language + '/node.json.mustache', 'utf-8'),
                method: '',
                type: ''
            },
            mustache: {
                nodeName: data.name,
            },
            lint: false,
            beautify: false
        });
        fs.writeFileSync(data.dst + '/' + data.module + '/locales/' + language + '/node.json', JSON.stringify(JSON.parse(languageFileSourceCode), null, 4));
    });

    // Create README.md
    var readmeSourceCode = CodeGen.getCustomCode({
        className: className,
        swagger: swagger,
        template: {
            class: fs.readFileSync(__dirname + '/../templates/swagger/README.md.mustache', 'utf-8'),
            method: '',
            type: ''
        },
        mustache: {
            nodeName: data.name,
            projectName: data.module,
        },
        lint: false,
        beautify: false
    });
    fs.writeFileSync(data.dst + '/' + data.module + '/README.md', readmeSourceCode);

    // Create LICENSE file
    var licenseSourceCode = CodeGen.getCustomCode({
        projectName: data.module,
        className: className,
        swagger: swagger,
        template: {
            class: fs.readFileSync(__dirname + '/../templates/swagger/LICENSE.mustache', 'utf-8'),
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
    fs.writeFileSync(data.dst + '/' + data.module + '/LICENSE', licenseSourceCode);

    if (options.tgz) {
        runNpmPack(data);
        return data.dst + '/' + data.module + '-' + data.version + '.tgz';
    } else {
        return data.dst + '/' + data.module;
    }
}

module.exports = {
    function2node: function2node,
    swagger2node: swagger2node
};
