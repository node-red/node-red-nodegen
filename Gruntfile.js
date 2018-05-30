module.exports = function (grunt) {
    grunt.initConfig({
        shell: {
            generate_nodes: {
                command: [
                    'mkdir nodegen',
                    'node bin/node-red-nodegen.js samples/handle-clearInterval.js -o ./nodegen',
                    'node bin/node-red-nodegen.js samples/handle-setInterval.js -o ./nodegen',
                    'node bin/node-red-nodegen.js samples/handle-setTimeout.js -o ./nodegen',
                    'node bin/node-red-nodegen.js samples/log-a-Warning-Message.js -o ./nodegen',
                    'node bin/node-red-nodegen.js samples/log-an-Error-Message.js -o ./nodegen',
                    'node bin/node-red-nodegen.js samples/log-an-Info-Message.js -o ./nodegen',
                    'node bin/node-red-nodegen.js samples/lower-case.js -o ./nodegen',
                    'node bin/node-red-nodegen.js http://petstore.swagger.io/v2/swagger.json -o ./nodegen'
                ].join(';')
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
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.registerTask('default', ['shell', 'simplemocha']);
    grunt.registerTask('coverage', 'Run Istanbul code test coverage task', ['shell', 'mocha_istanbul']);
};

