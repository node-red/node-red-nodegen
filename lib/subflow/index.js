const util = require("../util");

const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const crypt = require("crypto-js");

const TEMPLATE_DIR = path.join(__dirname,'../../templates/subflow');


// Extract Subflow definition from JSON data
function getSubflowDef(flow) {
    const newFlow = [];
    let sf = null;
    flow.forEach((item) => {
        if (item.hasOwnProperty("meta") &&
            item.meta.hasOwnProperty("module")) {
            if (sf !== null) {
                throw new Error("unexpected subflow definition");
            }
            sf = item;
        }
        else {
            newFlow.push(item);
        }
    });
    return [sf, newFlow];
}


// get flow encoding method
function getEncoder(encoding) {
    if (encoding === "AES") {
        return function (flow, key) {
            var data = JSON.stringify(flow);
            var enc = crypt.AES.encrypt(data, key);
            return enc.toString();
        }
    }
    throw new Error("encoding not defined:" +encoding);
}

// Create JSON data file 
function createJSON(dstPath, flow, encoding, key) {
    const [sf, newFlow] = getSubflowDef(flow);
    if (encoding && (encoding !== "none")) {
        const encode = getEncoder(encoding);
        const encStr = encode(newFlow, key);
        sf.flow = {
            encoding: encoding,
            flow: encStr
        };
    }
    else {
        sf.flow = newFlow;
    }
    const data = JSON.stringify(sf, null, "\t");
    fs.writeFileSync(dstPath, data);
}


module.exports = async function(data, options) {
    "use strict";

    const json = data.src;

    // Get subflow & flow definition
    const [sf, newFlow] = getSubflowDef(json);
    const meta = sf.meta;

    data.name = meta.type;
    data.module = meta.module;
    data.version = meta.version;
    data.desc = meta.desc;
    if (!data.desc || (data.desc === "")) {
        data.desc = "Node-RED node for " +data.name;
    }
    data.license = meta.license;
    if (!data.license || (data.license === "")) {
        data.license = "unknown";
    }
    data.info = meta.info;

    var params = {
        nodeName: data.name,
        projectName: data.module,
        projectVersion: data.version,
        keywords: util.extractKeywords(data.keywords),
        category: data.category || "subflow",
        description: data.desc,
        licenseName: data.license,
        nodeRead: sf.info || ""
    };

    // Make directory
    try {
        fs.mkdirSync(path.join(data.dst, data.module));
    } catch (error) {
        if (error.code !== "EEXIST") {
            throw error;
        }
    }

    // Create subflow.json
    createJSON(path.join(data.dst, data.module, "subflow.json"),
               json, (options.encoding || "none"), options.encodekey);
    
    // Create package.json
    var packageTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, "package.json.mustache"), "utf-8");
    var packageSourceCode = mustache.render(packageTemplate, params);
    fs.writeFileSync(path.join(data.dst, data.module, "package.json"), packageSourceCode);

    // Create subflow.js
    var nodeTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, "subflow.js.mustache"), "utf-8");
    var nodeSourceCode = mustache.render(nodeTemplate, params);
    fs.writeFileSync(path.join(data.dst, data.module, "subflow.js"), nodeSourceCode);

    // Create README.md
    var readmeTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, "README.md.mustache"), "utf-8");
    var readmeSourceCode = mustache.render(readmeTemplate, params);
    fs.writeFileSync(path.join(data.dst, data.module, "README.md"), readmeSourceCode);

    // Create LICENSE file
    var licenseTemplate = fs.readFileSync(path.join(TEMPLATE_DIR, "LICENSE.mustache"), "utf-8");
    var licenseSourceCode = mustache.render(licenseTemplate, params);
    fs.writeFileSync(path.join(data.dst, data.module, "LICENSE"), licenseSourceCode);

    if (options.tgz) {
        util.runNpmPack(data);
        return(path.join(data.dst, data.module + "-" + data.version + ".tgz"));
    } else {
        return(path.join(data.dst, data.module));
    }
}
