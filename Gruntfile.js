module.exports = function (grunt) {
    grunt.initConfig({
        shell: {
            generateNode_handleClearInterval: {
                command: 'node bin/node-red-nodegen.js samples/handle-clearInterval.js -o ./nodegen'
            },
            generateNode_handleSetInterval: {
                command: 'node bin/node-red-nodegen.js samples/handle-setInterval.js -o ./nodegen'
            },
            generateNode_handleSetTimeout: {
                command: 'node bin/node-red-nodegen.js samples/handle-setTimeout.js -o ./nodegen'
            },
            generateNode_logAWarningMessage: {
                command: 'node bin/node-red-nodegen.js samples/log-a-Warning-Message.js -o ./nodegen'
            },
            generateNode_logAnErrorMessage: {
                command: 'node bin/node-red-nodegen.js samples/log-an-Error-Message.js -o ./nodegen'
            },
            generateNode_logAnInfoMessage: {
                command: 'node bin/node-red-nodegen.js samples/log-an-Info-Message.js -o ./nodegen'
            },
            generateNode_lowerCase: {
                command: 'node bin/node-red-nodegen.js samples/lower-case.js -o ./nodegen'
            },
            generateNode_swaggerPetstore: {
                command: 'node bin/node-red-nodegen.js http://petstore.swagger.io/v2/swagger.json -o ./nodegen'
            }
        },
        simplemocha: {
            options: {
                timeout: 3000
            },
            all: {
                src: [ 'test/**/*_spec.js' ]
            }
        },
        mocha_istanbul: {
            options: {
                timeout: 3000
            },
            coverage: {
                src: [ 'test/**/*_spec.js' ]
            }
        }
    });
    grunt.file.mkdir('nodegen');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.registerTask('default', ['shell', 'simplemocha']);
    grunt.registerTask('coverage', 'Run Istanbul code test coverage task', ['shell', 'mocha_istanbul']);
};
