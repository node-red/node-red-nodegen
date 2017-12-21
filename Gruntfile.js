module.exports = function (grunt) {
    grunt.initConfig({
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
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.registerTask('default', ['simplemocha']);
    grunt.registerTask('coverage', 'Run Istanbul code test coverage task', ['mocha_istanbul']);
};

