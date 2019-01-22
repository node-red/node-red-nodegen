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

const schema = // feched from https://github.com/w3c/wot-thing-description/blob/master/validation/td-json-schema-validation.json
{
    "title": "WoT TD Schema - January 2019",
    "description": "JSON Schema representation of the TD serialisation format.",
    "$schema ": "http://json-schema.org/draft-06/schema#",
    "type": "object",
    "properties": {
        "id": {
            "type": "string"
        },
        "name": {
            "type": "string"
        },
        "properties": {
            "type": "object",
            "additionalProperties": {
                "$ref": "#/definitions/property_element"
            }
        },
        "actions": {
            "type": "object",
            "additionalProperties": {
                "$ref": "#/definitions/action_element"
            }
        },
        "descriptions": {
            "$ref": "#/definitions/descriptions"
        },
        "version": {
            "type": "object",
            "properties": {
                "instance": {
                    "type": "string"
                }
            },
            "required": [
                "instance"
            ]
        },
        "description": {
            "type": "string"
        },
        "links": {
            "type": "array",
            "items": {
                "$ref": "#/definitions/link_element"
            }
        },
        "forms": {
            "type": "array",
            "minItems": 1,
            "items": {
                "$ref": "#/definitions/form_element_root"
            }
        },
        "base": {
            "$ref": "#/definitions/url"
        },
        "securityDefinitions": {
            "type": "object",
            "additionalProperties": {
                "$ref": "#/definitions/securityScheme"
            }
        },
        "support": {
            "$ref": "#/definitions/url"
        },
        "created": {
            "type": "string"
        },
        "lastModified": {
            "type": "string"
        },
        "events": {
            "type": "object",
            "additionalProperties": {
                "$ref": "#/definitions/event_element"
            }
        },
        "security": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "@type": {
            "$ref": "#/definitions/type_declaration"
        },
        "@context": {
            "$ref": "#/definitions/context"
        }
    },
    "required": [
        "name",
        "id",
        "security",
        "securityDefinitions"
    ],
    "additionalProperties": true,
    "definitions": {
        "context": {
            "oneOf": [{
                    "type": "array",
                    "items": {
                        "anyOf": [{
                                "$ref": "#/definitions/url"
                            },
                            {
                                "type": "object"
                            }
                        ]
                    },
                    "contains": {
                        "type": "string",
                        "enum": [
                            "http://www.w3.org/ns/td"
                        ]
                    }
                },
                {
                    "type": "string",
                    "enum": [
                        "http://www.w3.org/ns/td"
                    ]
                }
            ]
        },
        "type_declaration": {
            "oneOf": [{
                    "type": "string"
                },
                {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            ]
        },
        "form_element_property": {
            "type": "object",
            "properties": {
                "href": {
                    "$ref": "#/definitions/url"
                },
                "op": {
                    "oneOf": [{
                            "type": "string",
                            "enum": [
                                "readproperty",
                                "writeproperty",
                                "observeproperty"
                            ]
                        },
                        {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "enum": [
                                    "readproperty",
                                    "writeproperty",
                                    "observeproperty"
                                ]
                            }
                        }
                    ]
                },
                "contentType": {
                    "type": "string"
                },
                "security": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "scopes": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "subProtocol": {
                    "type": "string",
                    "enum": [
                        "longpoll"
                    ]
                },
                "response": {
                    "type": "object",
                    "properties": {
                        "contentType": {
                            "type": "string"
                        }
                    }
                }
            },
            "required": [
                "href"
            ],
            "additionalProperties": true
        },
        "form_element_action": {
            "type": "object",
            "properties": {
                "href": {
                    "$ref": "#/definitions/url"
                },
                "op": {
                    "oneOf": [{
                            "type": "string",
                            "enum": [
                                "invokeaction"
                            ]
                        },
                        {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "enum": [
                                    "invokeaction"
                                ]
                            }
                        }
                    ]
                },
                "contentType": {
                    "type": "string"
                },
                "security": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "scopes": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "subProtocol": {
                    "type": "string",
                    "enum": [
                        "longpoll"
                    ]
                },
                "response": {
                    "type": "object",
                    "properties": {
                        "contentType": {
                            "type": "string"
                        }
                    }
                }
            },
            "required": [
                "href"
            ],
            "additionalProperties": true
        },
        "form_element_event": {
            "type": "object",
            "properties": {
                "href": {
                    "$ref": "#/definitions/url"
                },
                "op": {
                    "oneOf": [{
                            "type": "string",
                            "enum": [
                                "subscribeevent",
                                "unsubscribeevent"
                            ]
                        },
                        {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "enum": [
                                    "subscribeevent",
                                    "unsubscribeevent"
                                ]
                            }
                        }
                    ]
                },
                "contentType": {
                    "type": "string"
                },
                "security": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "scopes": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "subProtocol": {
                    "type": "string",
                    "enum": [
                        "longpoll"
                    ]
                },
                "response": {
                    "type": "object",
                    "properties": {
                        "contentType": {
                            "type": "string"
                        }
                    }
                }
            },
            "required": [
                "href"
            ],
            "additionalProperties": true
        },
        "form_element_root": {
            "type": "object",
            "properties": {
                "href": {
                    "$ref": "#/definitions/url"
                },
                "op": {
                    "oneOf": [{
                            "type": "string",
                            "enum": [
                                "readallproperties",
                                "writeallproperties",
                                "readmultipleproperties",
                                "writemultipleproperties"
                            ]
                        },
                        {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "enum": [
                                    "readallproperties",
                                    "writeallproperties",
                                    "readmultipleproperties",
                                    "writemultipleproperties"
                                ]
                            }
                        }
                    ]
                },
                "contentType": {
                    "type": "string"
                },
                "security": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "scopes": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "subProtocol": {
                    "type": "string",
                    "enum": [
                        "longpoll"
                    ]
                },
                "response": {
                    "type": "object",
                    "properties": {
                        "contentType": {
                            "type": "string"
                        }
                    }
                }
            },
            "required": [
                "href"
            ],
            "additionalProperties": true
        },
        "property_element": {
            "type": "object",
            "properties": {
                "description": {
                    "type": "string"
                },
                "descriptions": {
                    "$ref": "#/definitions/descriptions"
                },
                "title": {
                    "type": "string"
                },
                "titles": {
                    "$ref": "#/definitions/titles"
                },
                "uriVariables": {
                    "$ref": "#/definitions/dataSchema"
                },
                "@type": {
                    "$ref": "#/definitions/type_declaration"
                },
                "forms": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/form_element_property"
                    }
                },
                "observable": {
                    "type": "boolean"
                },
                "scopes": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "security": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "enum": {
                    "type": "array",
                    "minItems": 1,
                    "uniqueItems": true
                },
                "const": {},
                "type": {
                    "type": "string",
                    "enum": [
                        "boolean",
                        "integer",
                        "number",
                        "string",
                        "object",
                        "array",
                        "null"
                    ]
                },
                "writeOnly": {
                    "type": "boolean"
                },
                "readOnly": {
                    "type": "boolean"
                },
                "oneOf": {
                    "$ref": "#/definitions/dataSchema"
                },
                "unit": {
                    "$ref": "#/definitions/dataSchema"
                }
            },
            "required": [
                "forms"
            ],
            "additionalProperties": true
        },
        "action_element": {
            "type": "object",
            "properties": {
                "description": {
                    "type": "string"
                },
                "descriptions": {
                    "$ref": "#/definitions/descriptions"
                },
                "title": {
                    "type": "string"
                },
                "titles": {
                    "$ref": "#/definitions/titles"
                },
                "uriVariables": {
                    "$ref": "#/definitions/dataSchema"
                },
                "@type": {
                    "$ref": "#/definitions/type_declaration"
                },
                "forms": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/form_element_action"
                    }
                },
                "input": {
                    "$ref": "#/definitions/dataSchema"
                },
                "output": {
                    "$ref": "#/definitions/dataSchema"
                },
                "safe": {
                    "type": "boolean"
                },
                "idempotent": {
                    "type": "boolean"
                },
                "scopes": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "security": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            },
            "required": [
                "forms"
            ],
            "additionalProperties": true
        },
        "event_element": {
            "type": "object",
            "properties": {
                "description": {
                    "type": "string"
                },
                "descriptions": {
                    "$ref": "#/definitions/descriptions"
                },
                "titles": {
                    "$ref": "#/definitions/titles"
                },
                "uriVariables": {
                    "$ref": "#/definitions/dataSchema"
                },
                "title": {
                    "type": "string"
                },
                "@type": {
                    "$ref": "#/definitions/type_declaration"
                },
                "forms": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "$ref": "#/definitions/form_element_event"
                    }
                },
                "scopes": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "security": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "subscription": {
                    "$ref": "#/definitions/dataSchema"
                },
                "data": {
                    "$ref": "#/definitions/dataSchema"
                },
                "cancellation": {
                    "$ref": "#/definitions/dataSchema"
                },
                "type": {
                    "not": {}
                },
                "enum": {
                    "not": {}
                },
                "const": {
                    "not": {}
                }
            },
            "required": [
                "forms"
            ],
            "additionalProperties": true
        },
        "dataSchema": {
            "type": "object",
            "properties": {
                "description": {
                    "type": "string"
                },
                "title": {
                    "type": "string"
                },
                "enum": {
                    "type": "array",
                    "minItems": 1,
                    "uniqueItems": true
                },
                "const": {},
                "type": {
                    "type": "string",
                    "enum": [
                        "boolean",
                        "integer",
                        "number",
                        "string",
                        "object",
                        "array",
                        "null"
                    ]
                },
                "descriptions": {
                    "$ref": "#/definitions/descriptions"
                },
                "titles": {
                    "$ref": "#/definitions/titles"
                },
                "writeOnly": {
                    "type": "boolean"
                },
                "readOnly": {
                    "type": "boolean"
                },
                "oneOf": {
                    "$ref": "#/definitions/dataSchema"
                },
                "unit": {
                    "$ref": "#/definitions/dataSchema"
                }
            }
        },
        "link_element": {
            "type": "object",
            "properties": {
                "anchor": {
                    "$ref": "#/definitions/url"
                },
                "href": {
                    "$ref": "#/definitions/url"
                },
                "rel": {
                    "type": "string"
                },
                "type": {
                    "type": "string"
                }
            },
            "required": [
                "href"
            ],
            "additionalProperties": true
        },
        "securityScheme": {
            "oneOf": [{
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string"
                        },
                        "proxy": {
                            "$ref": "#/definitions/url"
                        },
                        "scheme": {
                            "type": "string",
                            "enum": [
                                "nosec"
                            ]
                        }
                    },
                    "required": [
                        "scheme"
                    ]
                },
                {
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string"
                        },
                        "proxy": {
                            "$ref": "#/definitions/url"
                        },
                        "scheme": {
                            "type": "string",
                            "enum": [
                                "basic"
                            ]
                        },
                        "in": {
                            "type": "string"
                        },
                        "name": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "scheme"
                    ]
                },
                {
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string"
                        },
                        "proxy": {
                            "$ref": "#/definitions/url"
                        },
                        "scheme": {
                            "type": "string",
                            "enum": [
                                "cert"
                            ]
                        },
                        "identity": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "scheme"
                    ]
                },
                {
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string"
                        },
                        "proxy": {
                            "$ref": "#/definitions/url"
                        },
                        "scheme": {
                            "type": "string",
                            "enum": [
                                "digest"
                            ]
                        },
                        "qop": {
                            "type": "string"
                        },
                        "in": {
                            "type": "string"
                        },
                        "name": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "scheme"
                    ]
                },
                {
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string"
                        },
                        "proxy": {
                            "$ref": "#/definitions/url"
                        },
                        "scheme": {
                            "type": "string",
                            "enum": [
                                "bearer"
                            ]
                        },
                        "authorization": {
                            "$ref": "#/definitions/url"
                        },
                        "alg": {
                            "type": "string"
                        },
                        "format": {
                            "type": "string"
                        },
                        "in": {
                            "type": "string"
                        },
                        "name": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "scheme"
                    ]
                },
                {
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string"
                        },
                        "proxy": {
                            "$ref": "#/definitions/url"
                        },
                        "scheme": {
                            "type": "string",
                            "enum": [
                                "psk"
                            ]
                        },
                        "identity": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "scheme"
                    ]
                },
                {
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string"
                        },
                        "proxy": {
                            "$ref": "#/definitions/url"
                        },
                        "scheme": {
                            "type": "string",
                            "enum": [
                                "public"
                            ]
                        },
                        "identity": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "scheme"
                    ]
                },
                {
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string"
                        },
                        "proxy": {
                            "$ref": "#/definitions/url"
                        },
                        "scheme": {
                            "type": "string",
                            "enum": [
                                "oath2"
                            ]
                        },
                        "authorization": {
                            "$ref": "#/definitions/url"
                        },
                        "token": {
                            "$ref": "#/definitions/url"
                        },
                        "refresh": {
                            "$ref": "#/definitions/url"
                        },
                        "scopes": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        },
                        "flow": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "scheme"
                    ]
                },
                {
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string"
                        },
                        "proxy": {
                            "$ref": "#/definitions/url"
                        },
                        "scheme": {
                            "type": "string",
                            "enum": [
                                "apikey"
                            ]
                        },
                        "in": {
                            "type": "string"
                        },
                        "name": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "scheme"
                    ]
                },
                {
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string"
                        },
                        "proxy": {
                            "$ref": "#/definitions/url"
                        },
                        "scheme": {
                            "type": "string",
                            "enum": [
                                "pop"
                            ]
                        },
                        "authorization": {
                            "$ref": "#/definitions/url"
                        },
                        "format": {
                            "type": "string"
                        },
                        "alg": {
                            "type": "string"
                        },
                        "in": {
                            "type": "string"
                        },
                        "name": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "scheme"
                    ]
                }
            ]
        },
        "url": {
            "type": "string",
            "format": "uri",
            "pattern": "(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(([^#]*))?(#(.*))?"
        },
        "descriptions": {
            "type": "object"
        },
        "titles": {
            "type": "object"
        }
    }
};

const Ajv = require('ajv');
const url = require('url');

function validateTd(td) {
    const ajv = new Ajv();
    const valid = ajv.validate(schema, td);
    
    return { result: valid, errorText: valid?"":ajv.errorsText()};
}

function setdefault(obj, propname, dflt) {
    return obj.hasOwnProperty(propname) ? obj[propname] : dflt;
}

function normalizeTd(td) {

    const baseUrl = td.base || "";

    function formconv(intr, f) {
        if (f.hasOwnProperty("href")) {
            f.href = decodeURIComponent(url.resolve(baseUrl, f.href));
        }
        if (!f.hasOwnProperty("security")) {
            if (intr.hasOwnProperty("security")) {
                f.security = intr.security;
            } else if (td.hasOwnProperty("security")) {
                f.security = td.security;
            }
        }
        f.contentType = setdefault(f, "contentType", "application/json");

        return f;
    }

    // Set default values in security definition
    for (const sd in td.securityDefinitions) {
        sdef = td.securityDefinitions[sd];
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
        pdef.readOnly = setdefault(pdef, "readOnly", false);
        pdef.writeOnly = setdefault(pdef, "writeOnly", false);
        pdef.observable = setdefault(pdef, "observable", false);
        if (pdef.forms) {
            pdef.forms = pdef.forms.map((f) => formconv(pdef, f));
            // no filtering based on protocol
        }
    }
    
    // Set default values in actions
    for (const a in td.actions) {
        const adef = td.actions[a];
        adef.safe = setdefault(adef, "safe", false);
        adef.idempotent = setdefault(adef, "idempotent", false);
        if (adef.forms) {
            adef.forms = adef.forms.map((f) => formconv(adef, f));
            // no filtering based on protocol
        }
    }

    // Set default values in events
    for (const e in td.events) {
        const edef = td.events[e];
        if (edef.forms) {
            edef.forms = edef.forms.map((f) => formconv(edef, f));
            // no filtering based on protocol
        }
    }

    // Set default values in toplevel forms
    if (td.forms) {
        td.forms = td.forms.map((f) => formconv(edef, f));
    }

    return td;
}

function filterFormTd(td) {
    for (const p in td.properties) {
        let forms = td.properties[p].forms;
        if (forms) {
            forms = forms.filter((f) => (f.hasOwnProperty("href") && 
                                         (f.href.match(/^https?:/) || f.href.match(/^wss?:/))));                       
        }
    }
    for (const a in td.actions) {
        let forms = td.actions[a].forms;
        if (forms) {
            forms = forms.filter((f) => (f.hasOwnProperty("href") && 
                                         (f.href.match(/^https?:/) || f.href.match(/^wss?:/))));
        }
    }
    for (const e in td.events) {
        let forms = td.events[e].forms;
        if (forms) {
            forms = forms.filter((f) => (f.hasOwnProperty("href") && 
                                         (f.href.match(/^https?:/) || f.href.match(/^wss?:/))));
        }
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

module.exports = {
    validateTd: validateTd,
    normalizeTd: normalizeTd,
    filterFormTd: filterFormTd,
    makeformsel: makeformsel
}