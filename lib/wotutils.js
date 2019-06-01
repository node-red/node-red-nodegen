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

const Ajv = require('ajv');
const url = require('url');
const fs = require('fs');
const path = require('path');

function validateTd(td) {
    const TDSchema =
        JSON.parse(fs.readFileSync(path.join(__dirname, './td-json-schema-validation.json'), 'utf-8'));
    const ajv = new Ajv({allErrors: true});
    const valid = ajv.validate(TDSchema, td);
    
    return { result: valid, errorText: valid?"":ajv.errorsText()};
}

function setdefault(obj, propname, dflt) {
    return obj.hasOwnProperty(propname) ? obj[propname] : dflt;
}

function isOpInForms(op, forms) {
    return forms && forms
        .map(e=>(e.op && typeof e.op === 'string') ? [e.op] : e.op)
        .reduce((a,v)=>a.concat(v),[])
        .some(e=>e === op);
}

function normalizeTd(td) {

    const baseUrl = td.base || "";

    function formconv(intr, f, affordance) {
        if (f.hasOwnProperty("href")) {
            f.href = decodeURIComponent(url.resolve(baseUrl, f.href));
        }
        if (f.hasOwnProperty("security") && typeof f.security === 'string') {
            f.security = [f.security];
        }
        if (!f.hasOwnProperty("security")) {
            if (intr.hasOwnProperty("security")) {
                f.security = intr.security;
            } else if (td.hasOwnProperty("security")) {
                f.security = td.security;
            }
        }
        f.contentType = setdefault(f, "contentType", "application/json");
        switch (affordance) {
            case "PropertyAffordance":
                f.op = setdefault(f, "op", ["readproperty", "writeproperty"]);
                break;
            case "ActionAffordance":
                f.op = setdefault(f, "op", "invokeaction");
                break;
            case "EventAffordance":
                f.op = setdefault(f, "op", "subscribeevent");
                break;
        }

        return f;
    }

    // normalize 'security' as Array of String.
    if (td.hasOwnProperty("security") && typeof td.security === "string") {
        td.security = [td.security];
    }

    // Set default values in security definition
    for (const sd in td.securityDefinitions) {
        const sdef = td.securityDefinitions[sd];
        switch (sdef.scheme) {
            case "basic":
                sdef.in = setdefault(sdef, "in", "header");
                break;
            case "digest":
                sdef.in = setdefault(sdef, "in", "header");
                sdef.qop = setdefault(sdef, "qop", "auth");
                break;
            case "bearer":
                sdef.in = setdefault(sdef, "in", "header");
                sdef.alg = setdefault(sdef, "alg", "ES256");
                sdef.format = setdefault(sdef, "format", "jwt");
                break;
            case "pop":
                sdef.in = setdefault(sdef, "in", "header");
                sdef.alg = setdefault(sdef, "alg", "ES256");
                sdef.format = setdefault(sdef, "format", "jwt");
                break;
            case "oauth2":
                sdef.flow = setdefault(sdef, "flow", "implicit");
                break;
            case "apikey":
                sdef.in = setdefault(sdef, "in", "query");
                break;
        }
    }

    // Set default values in properties
    for (const p in td.properties) {    
        const pdef = td.properties[p];
        if (pdef.forms) {
            pdef.forms = pdef.forms.map((f) => formconv(pdef, f, "PropertyAffordance"));
            // no filtering based on protocol
        }
        
        // if there is forms which have readproperty in op, writeOnly is false, otherwise true
        pdef.writeOnly = setdefault(pdef, "writeOnly", !isOpInForms("readproperty", pdef.forms));
        // if there is forms which have writeproperty in op, readOnly is false, otherwise true
        pdef.readOnly = setdefault(pdef, "readOnly", !isOpInForms("writeproperty", pdef.forms));
        // if there is forms which have observeproperty in op, observable is true, otherwise false
        pdef.observable = setdefault(pdef, "observable", isOpInForms("observeproperty", pdef.forms));
        // in any cases, if it explicitly stated by writeOnly/readOnly/observable, use it.

    }
    
    // Set default values in actions
    for (const a in td.actions) {
        const adef = td.actions[a];
        adef.safe = setdefault(adef, "safe", false);
        adef.idempotent = setdefault(adef, "idempotent", false);
        if (adef.forms) {
            adef.forms = adef.forms.map((f) => formconv(adef, f, "ActionAffordance"));
            // no filtering based on protocol
        }
    }

    // Set default values in events
    for (const e in td.events) {
        const edef = td.events[e];
        if (edef.forms) {
            edef.forms = edef.forms.map((f) => formconv(edef, f, "EventAffordance"));
            // no filtering based on protocol
        }
    }

    // Set default values in toplevel forms --- TODO: make this work
    if (td.forms) {
        const pdef = td;
        td.forms = td.forms.map((f) => formconv(pdef, f, "TopPropertyAffordance"));
    }

    // Set default value in toplevel context
    td["@context"] = setdefault(td, "@context", "https://www.w3.org/2019/wot/td/v1");

    // Convert top level forms ({read/write}allproperties) to "ALLPROPERTIES" property.
    if (td.forms) {
        const convforms = td.forms
            .map(f => {
                if (f.op && typeof f.op === 'string') {
                    f.op = [f.op];
                }
                f.op = f.op.map(o => {
                    let res = o;
                    switch (o) {
                        case 'readallproperties':
                            res = 'readproperty';
                            break;
                        case 'writeallproperties':
                            res = 'writeproperty';
                    }
                    return res;
                });
                return f;
            });
        td.properties['__ALLPROPERTIES'] = {
            title: "All Properties",
            description: "all properties of this Thing",
            forms: convforms, 
            type: "object",
            writeOnly: !isOpInForms("readproperty", convforms),
            readOnly: !isOpInForms("writeproperty", convforms),
            observable: false
        };
    }

    return td;
}

function filterFormTd(td) {
    for (const p in td.properties) {
        let forms = td.properties[p].forms;
        if (forms) {
            forms = forms.filter((f) => (f.hasOwnProperty("href") && 
                                         (f.href.match(/^https?:/) || f.href.match(/^wss?:/) || f.href.match(/^coaps?:/))));                       
        }
        td.properties[p].forms = forms;
    }
    for (const a in td.actions) {
        let forms = td.actions[a].forms;
        if (forms) {
            forms = forms.filter((f) => (f.hasOwnProperty("href") && 
                                         (f.href.match(/^https?:/) || f.href.match(/^wss?:/) || f.href.match(/^coaps?:/))));
        }
        td.actions[a].forms = forms;
    }
    for (const e in td.events) {
        let forms = td.events[e].forms;
        if (forms) {
            forms = forms.filter((f) => (f.hasOwnProperty("href") && 
                                         (f.href.match(/^https?:/) || f.href.match(/^wss?:/) || f.href.match(/^coaps?:/))));
        }
        td.events[e].forms = forms;
    }
    return td;
}

function makeformsel(td) {
    const formsel = {
        property: {},
        action: {},
        event: {}
    };

    for (const p in td.properties) {
        const forms = td.properties[p].forms;
        const readforms = [];
        const writeforms = [];
        const observeforms = [];
        for (let i = 0; i < forms.length; i++) {
            const secscheme = td.securityDefinitions[forms[i].security[0]].scheme;
            if (!forms[i].hasOwnProperty('op') || forms[i].op.includes("readproperty")) {
                readforms.push({index:i,secscheme:secscheme,title:forms[i].href});
            }
            if (!forms[i].hasOwnProperty('op') || forms[i].op.includes("writeproperty")) {
                writeforms.push({index:i,secscheme:secscheme,title:forms[i].href});
            }
            if (forms[i].hasOwnProperty('op') && forms[i].op.includes("observeproperty")) {
                observeforms.push({index:i,secscheme:secscheme,title:forms[i].href});
            }
        }
        formsel.property[p] = {read: readforms, write: writeforms, observe: observeforms};
    }
    for (const a in td.actions) {
        const forms = td.actions[a].forms;
        formsel.action[a] = [];
        for (let i = 0; i < forms.length; i++) {
            const secscheme = td.securityDefinitions[forms[i].security[0]].scheme;
            if (!forms[i].hasOwnProperty('op') || forms[i].op.includes("invokeaction")) {
                formsel.action[a].push({index:i,secscheme:secscheme,title:forms[i].href});
            }
        }
    }
    for (const e in td.events) {
        const forms = td.events[e].forms;
        formsel.event[e] = [];
        for (let i = 0; i < forms.length; i++) {
            const secscheme = td.securityDefinitions[forms[i].security[0]].scheme;
            if (!forms[i].hasOwnProperty('op') || forms[i].op.includes("subscribeevent")) {
                formsel.event[e].push({index:i,secscheme:secscheme,title:forms[i].href});
            }
        }
    }

    return formsel;
}

function woticon(td) {
    const iotschemaToIcon = {
        "Sensor": "font-awesome/fa-microchip",
        "BinarySwitch": "font-awesome/fa-toggle-on",
        "SwitchStatus": "font-awesome/fa-toggle-on",
        "Toggle": "font-awesome/fa-toggle-on",
        "Light": "font-awesome/fa-lightbulb-o",//"light.png",
        "Actuator": "font-awesome/fa-bolt",
        "CurrentColour": "font-awesome/fa-paint-brush",
        "ColourData": "font-awesome/fa-paint-brush",
        "LightControl": "font-awesome/fa-cogs",
        "Illuminance": "font-awesome/fa-sun-o",
        "IlluminanceSensing": "font-awesome/fa-sun-o",
        "MotionControl": "font-awesome/fa-arrows-alt",
        "Temperature": "font-awesome/fa-thermometer-half", 
        "TemperatureSensing": "font-awesome/fa-thermometer-half",
        "TemperatureData": "font-awesome/fa-thermometer-half",
        "Thermostat": "font-awesome/fa-thermometer-half",
        "Pump": "font-awesome/fa-tint",
        "AirConditioner": "font-awesome/fa-snowflake-o",
        "UltrasonicSensing": "font-awesome/fa-rss", 
        "HumiditySensing": "font-awesome/fa-umbrella",
        "SoundPressure": "font-awesome/fa-volume-up",
        "Valve": "font-awesome/fa-wrench",
        "ProximitySensing": "font-awesome/fa-crosshairs"
    };

    const iotschemaPrefix = 'iot';

    if (Array.isArray(td['@type'])) {
        const candidates = td['@type'].map((e) => {
            for (f in iotschemaToIcon) {
                if (`${iotschemaPrefix}:${f}` === e) {
                    return iotschemaToIcon[f];
                };
            };
        }).filter((e) => e);

        if (candidates.length > 0) {
            return candidates[0];
        }
    }
    return "white-globe.png";
}

module.exports = {
    validateTd: validateTd,
    normalizeTd: normalizeTd,
    filterFormTd: filterFormTd,
    makeformsel: makeformsel,
    woticon: woticon
}