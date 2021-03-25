const util = require("../util");

const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const obfuscator = require('javascript-obfuscator');
const CodeGen = require('swagger-js-codegen-formdata').CodeGen;
const axios = require('axios');
const yamljs = require('yamljs');
const Converter = require('api-spec-converter');

const TEMPLATE_DIR = path.join(__dirname,'../../templates/swagger');

async function getSpec(src, data) {
    let spec;
    if (typeof src === "string") {
        if (/^https?:/.test(src)) {
            let requestOptions = {};
            if (data.lang) {
                requestOptions.headers = {
                    'Accept-Language': data.lang
                }
            }
            let response = await axios.get(src, requestOptions);
            spec = response.data;
        } else if (/\.yaml$/.test(src)) {
            spec = yamljs.load(util.skipBom(await fs.promises.readFile(src)));
        } else if (/\.json/.test(src)) {
            spec = JSON.parse(util.skipBom(await fs.promises.readFile(src)));
        } else {
            throw new Error("Unsupported file type: "+src)
        }
    } else {
        spec = src;
    }
    return Converter.convert({
        from: spec.openapi && spec.openapi.startsWith('3.0') ? 'openapi_3' : 'swagger_2',
        to: 'swagger_2',
        source: spec,
    }).then(res => res.spec)
}

/*
 * data.src : String : url or path to json/yaml file
 *                   : Spec JSON
 *            Object : Spec Object
 */
module.exports = async function(data, options) {
    "use strict";

    let spec = await getSpec(data.src, data);
    // Modify swagger data
    var swagger = JSON.parse(JSON.stringify(spec), function (key, value) {
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

    if (swagger.swagger !== '2.0') {
        throw new Error('unsupported version of OpenAPI document');
    }

    if (!swagger.info.title) {
        throw new Error('No title is specified in OpenAPI document');
    }

    var className = swagger.info.title.toLowerCase().replace(/(^|[^a-z0-9]+)[a-z0-9]/g,
        function (str) {
            return str.replace(/^[^a-z0-9]+/, '').toUpperCase();
        });

    if (!data.name || data.name === '') {
        data.name = className.replace(/([A-Z])/g, '-$1').slice(1).toLowerCase();
    }

    if (data.module) {
        if (data.prefix) {
            throw new Error('module name and prefix are conflicted.');
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
            throw new Error('invalid icon file name');
        }
    }

    if (data.color) {
        if (data.color.match(/^[a-zA-Z0-9]{6}$/)) {
            data.color = '#' + data.color;
        } else {
            throw new Error('invalid color');
        }
    }

    util.createCommonFiles(TEMPLATE_DIR, data);

    // Create Node.js SDK
    var nodejsSourceCode = CodeGen.getNodeCode({
        className: className,
        swagger: swagger,
        lint: false,
        beautify: false
    });
    if (options.obfuscate) {
        nodejsSourceCode = obfuscator.obfuscate(nodejsSourceCode, { stringArrayEncoding: 'rc4' }).getObfuscatedCode();
    }
    fs.writeFileSync(path.join(data.dst, data.module, 'lib.js'), nodejsSourceCode);

    // Create package.json
    var packageSourceCode = CodeGen.getCustomCode({
        className: className,
        swagger: swagger,
        template: {
            class: fs.readFileSync(path.join(TEMPLATE_DIR, 'package.json.mustache'), 'utf-8'),
            method: '',
            type: ''
        },
        mustache: {
            nodeName: data.name,
            projectName: data.module,
            projectVersion: data.version,
            keywords: util.extractKeywords(data.keywords),
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
            class: fs.readFileSync(path.join(TEMPLATE_DIR, 'node.js.mustache'), 'utf-8'),
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
        nodeSourceCode = obfuscator.obfuscate(nodeSourceCode, { stringArrayEncoding: 'rc4' }).getObfuscatedCode();
    }
    fs.writeFileSync(path.join(data.dst, data.module, 'node.js'), nodeSourceCode);

    // Create node.html
    var htmlSourceCode = CodeGen.getCustomCode({
        className: className,
        swagger: swagger,
        template: {
            class: fs.readFileSync(path.join(TEMPLATE_DIR, 'node.html.mustache'), 'utf-8'),
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
    var languages = fs.readdirSync(path.join(TEMPLATE_DIR, 'locales'));
    languages.forEach(function (language) {
        var languageFileSourceCode = CodeGen.getCustomCode({
            className: className,
            swagger: swagger,
            template: {
                class: fs.readFileSync(path.join(TEMPLATE_DIR, 'locales', language, 'node.json.mustache'), 'utf-8'),
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
            class: fs.readFileSync(path.join(TEMPLATE_DIR, 'test/node_spec.js.mustache'), 'utf-8'),
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
            class: fs.readFileSync(path.join(TEMPLATE_DIR, 'README.md.mustache'), 'utf-8'),
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
            class: fs.readFileSync(path.join(TEMPLATE_DIR, 'LICENSE.mustache'), 'utf-8'),
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
        util.runNpmPack(data);
        return path.join(data.dst, data.module + '-' + data.version + '.tgz');
    } else {
        return  path.join(data.dst, data.module);
    }
}

