const fs = require('fs');
const path = require('path');

const csv = require('csv-string');
const child_process = require('child_process');
const jimp = require("jimp");


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

    var isStockIcon = data.icon && (data.icon.match(/^(alert|arduino|arrow-in|batch|bluetooth|bridge-dash|bridge|cog|comment|db|debug|envelope|feed|file-in|file-out|file|function|hash|inject|join|leveldb|light|link-out|mongodb|mouse|node-changed|node-error|parser-csv|parser-html|parser-json|parser-xml|parser-yaml|range|redis|rpi|serial|sort|split|subflow|swap|switch|template|timer|trigger|twitter|watch|white-globe)\.png$/) || data.icon.match(/^(node-red|font-awesome)/));
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
        fs.mkdirSync(path.join(data.dst, data.module, 'examples'));
    } catch (error) {
        if (error.code !== 'EEXIST') {
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

function skipBom(body) {
    if (body[0]===0xEF &&
        body[1]===0xBB &&
        body[2]===0xBF) {
        return body.slice(3);
    } else {
        return body;
    }
}

module.exports = {
    createCommonFiles,
    runNpmPack,
    extractKeywords,
    skipBom
}
