const util = require("../util");

const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const jsStringEscape = require('js-string-escape');
const obfuscator = require('javascript-obfuscator');

const TEMPLATE_DIR = path.join(__dirname,'../../templates/function');


module.exports = async function(data, options) {
    "use strict";

    if (Array.isArray(data.src)) {
        if (data.src.length !== 1) {
            throw new Error("Invalid flow json - expected a single Function node");
        }
        var f = data.src[0];
        if (!f.name || f.name.length ==0) {
            throw new Error('Error: No function name supplied.');
        }
        data.name = f.name.toLowerCase();
        data.icon = f.icon;
        data.info = f.info;
        data.outputs = f.outputs;
        data.inputLabels = f.inputLabels;
        data.outputLabels = f.outputLabels;
        data.src = Buffer.from(f.func);
    } else if (typeof data.src === "string" && /\.js$/.test(data.src)) {
        data.src = await util.skipBom(await fs.promises.readFile(data.src));
    }

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
        data.version = '0.0.1';
    }

    if (data.icon) {
        if (!data.icon.match(/\.(png|gif)$/) && !data.icon.match(/^(node-red|font-awesome)/)) {
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

    if (data.name === 'function') {
        throw new Error('\'function\' is duplicated node name. Use another name.');
    } else if (!data.name.match(/^[a-z0-9\-]+$/)) {
        throw new Error('invalid node name');
    } else {
        var params = {
            nodeName: data.name,
            projectName: data.module,
            projectVersion: data.version,
            keywords: util.extractKeywords(data.keywords),
            category: data.category || 'function',
            icon: function () {
                if (data.icon ) {
                    if (!data.icon.match(/^(node-red|font-awesome)/)) {
                        return path.basename(data.icon);
                    }
                    else { return data.icon; }
                } else {
                    return 'icon.png';
                }
            },
            color: data.color || '#C0DEED',
            func: jsStringEscape(data.src),
            outputs: meta.outputs || data.outputs,
            inputLabels: JSON.stringify(data.inputLabels || []),
            outputLabels: JSON.stringify(data.outputLabels || []),
            nodeInfo: jsStringEscape(data.info || ""),
            nodeRead: data.info || ""
        };

        util.createCommonFiles(TEMPLATE_DIR, data);

        // Create package.json
        var packageTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, 'package.json.mustache'), 'utf-8');
        var packageSourceCode = mustache.render(packageTemplate, params);
        fs.writeFileSync(path.join(data.dst, data.module, 'package.json'), packageSourceCode);

        // Create node.js
        var nodeTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, 'node.js.mustache'), 'utf-8');
        var nodeSourceCode = mustache.render(nodeTemplate, params);
        if (options.obfuscate) {
            nodeSourceCode = obfuscator.obfuscate(nodeSourceCode, { stringArrayEncoding: 'rc4' }).getObfuscatedCode();
        }
        fs.writeFileSync(path.join(data.dst, data.module, 'node.js'), nodeSourceCode);

        // Create node.html
        var htmlTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, 'node.html.mustache'), 'utf-8');
        var htmlSourceCode = mustache.render(htmlTemplate, params);
        fs.writeFileSync(path.join(data.dst, data.module, 'node.html'), htmlSourceCode);

        // Create flow.json
        var flowTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, 'examples/flow.json.mustache'), 'utf-8');
        var flowSourceCode = mustache.render(flowTemplate, params);
        fs.writeFileSync(path.join(data.dst, data.module, 'examples/flow.json'), flowSourceCode);

        // Create node_spec.js
        var nodeSpecTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, 'test/node_spec.js.mustache'), 'utf-8');
        var nodeSpecSourceCode = mustache.render(nodeSpecTemplate, params);
        fs.writeFileSync(path.join(data.dst, data.module, 'test/node_spec.js'), nodeSpecSourceCode);

        // Create README.md
        var readmeTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, 'README.md.mustache'), 'utf-8');
        var readmeSourceCode = mustache.render(readmeTemplate, params);
        fs.writeFileSync(path.join(data.dst, data.module, 'README.md'), readmeSourceCode);

        // Create LICENSE file
        var licenseTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, 'LICENSE.mustache'), 'utf-8');
        var licenseSourceCode = mustache.render(licenseTemplate, params);
        fs.writeFileSync(path.join(data.dst, data.module, 'LICENSE'), licenseSourceCode);

        if (options.tgz) {
            util.runNpmPack(data);
            return path.join(data.dst, data.module + '-' + data.version + '.tgz');
        } else {
            return path.join(data.dst, data.module);
        }
    }
}
