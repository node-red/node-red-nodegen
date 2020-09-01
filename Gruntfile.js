module.exports = function (grunt) {
    grunt.initConfig({
        shell: {
            generateNode_Function: {
                command: 'node bin/node-red-nodegen.js samples/lower-case.js -o ./nodegen'
            },
            generateNode_Swagger: {
                command: 'node bin/node-red-nodegen.js samples/swagger.json -o ./nodegen'
            },
            generateNode_WebOfThings: {
                command: 'node bin/node-red-nodegen.js samples/MyLampThing.jsonld -o ./nodegen'
            }
        },
        simplemocha: {
            options: {
                timeout: 10000
            },
            all: {
                src: [ 'test/**/*_spec.js' ]
            }
        },
        mocha_istanbul: {
            options: {
                timeout: 10000
            },
            all: {
                src: [ 'test/**/*_spec.js' ]
            }
        }
    });
    grunt.file.mkdir('nodegen');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.registerTask('default', ['shell', 'simplemocha']);
};
