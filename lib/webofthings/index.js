const util = require("../util");

const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const obfuscator = require('javascript-obfuscator');
const axios = require('axios').default;

const wotutils = require('./wotutils');

const TEMPLATE_DIR = path.join(__dirname,'../../templates/webofthings');

async function getSpec(src) {
    let spec;
    if (typeof src === "string") {
        if (/^https?:/.test(src)) {
            const response = await axios.get(src);
            spec = response.data;
        } else {
            spec = JSON.parse(util.skipBom(await fs.promises.readFile(src)));
        }
    } else {
        spec = src;
    }
    return spec;
}

module.exports = async function(data, options) {

    let td = await getSpec(data.src);

    // validate TD
    const validateResult = wotutils.validateTd(td);
    if (validateResult.result === false) {
        console.warn(`Invalid Thing Description:\n${validateResult.errorText}`);
    } else {
        console.info(`Schema validation succeeded.`);
    }

    // if there is no title but titles, put one of titles to title.
    if (!td.title) {
        if (td.titles) {
            if (td.titles.en) {
                td.title = td.titles.en
            } else {
                td.title = Object.values(td.titles)[0];
            }
        } else {
            td.title = "notitle";
        }
    }

    // if name is not specified, use td.title for module name.
    if (!data.name || data.name === '') {
        // filtering out special characters
        data.name = 'wot' + td.title.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
    }

    if (data.module) {
        if (data.prefix) {
            throw new Error('module name and prefix are conflicted');
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
    data.keywords = util.extractKeywords(data.keywords);
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

    util.createCommonFiles(TEMPLATE_DIR, data);

    // Create package.json
    const packageTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, 'package.json.mustache'), 'utf-8');
    const packageSourceCode = mustache.render(packageTemplate, data);
    fs.writeFileSync(path.join(data.dst, data.module, 'package.json'), packageSourceCode);

    // Create node.js
    const nodeTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, 'node.js.mustache'), 'utf-8');
    let nodeSourceCode = mustache.render(nodeTemplate, data);
    if (options.obfuscate) {
        nodeSourceCode = obfuscator.obfuscate(nodeSourceCode, { stringArrayEncoding: 'rc4' }).getObfuscatedCode();
    }
    fs.writeFileSync(path.join(data.dst, data.module, 'node.js'), nodeSourceCode);

    // Create node.html
    const htmlTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, 'node.html.mustache'), 'utf-8');
    const htmlSourceCode = mustache.render(htmlTemplate, data);
    fs.writeFileSync(path.join(data.dst, data.module, 'node.html'), htmlSourceCode);

    // Create README.html
    const readmeTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, 'README.md.mustache'), 'utf-8');
    const readmeSourceCode = mustache.render(readmeTemplate, data);
    fs.writeFileSync(path.join(data.dst, data.module, 'README.md'), readmeSourceCode);

    // Create LICENSE
    const licenseTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, 'LICENSE.mustache'), 'utf-8');
    const licenseSourceCode = mustache.render(licenseTemplate, data);
    fs.writeFileSync(path.join(data.dst, data.module, 'LICENSE'), licenseSourceCode);

    if (options.tgz) {
        util.runNpmPack(data);
        return path.join(data.dst, data.module + '-' + data.version + '.tgz');
    } else {
        return path.join(data.dst, data.module);
    }
}