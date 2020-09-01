module.exports = function (grunt) {
    grunt.initConfig({
        shell: {
            generateNode_lowerCase: {
                command: 'node bin/node-red-nodegen.js samples/lower-case.js -o ./nodegen'
            },
            generateNode_swaggerPetstore: {
                command: 'node bin/node-red-nodegen.js samples/swagger.json -o ./nodegen'
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
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.registerTask('default', ['shell', 'mocha_istanbul:all']);
    grunt.registerTask('coverage', 'Run Istanbul code test coverage task', ['shell', 'mocha_istanbul:all']);
};
