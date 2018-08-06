module.exports = function (grunt) {
    grunt.initConfig({
        shell: {
            generateNode_sendToMultipleOutputs : {
                command: 'node bin/node-red-nodegen.js samples/send-to-multiple-outputs.js -o ./nodegen'
            },
            generateNode_sendToMultipleMessages : {
                command: 'node bin/node-red-nodegen.js samples/send-to-multiple-messages.js -o ./nodegen'
            },
            generateNode_allowInputToBeDiscardedByReturningNull : {
                command: 'node bin/node-red-nodegen.js samples/allow-input-to-be-discarded-by-returning-null.js -o ./nodegen'
            },
            generateNode_handleNullAmongstValidMessages : {
                command: 'node bin/node-red-nodegen.js samples/handle-null-amongst-valid-messages.js -o ./nodegen'
            },
            generateNode_getKeysInGlobalContext : {
                command: 'node bin/node-red-nodegen.js samples/get-keys-in-global-context.js -o ./nodegen'
            },
            generateNode_dropAndLogNonObjectMessageTypesString : {
                command: 'node bin/node-red-nodegen.js samples/drop-and-log-nonobject-message-types-string.js -o ./nodegen'
            },
            generateNode_dropAndLogNonObjectMessageTypesBuffer : {
                command: 'node bin/node-red-nodegen.js samples/drop-and-log-nonobject-message-types-buffer.js -o ./nodegen'
            },
            generateNode_dropAndLogNonObjectMessageTypesArray : {
                command: 'node bin/node-red-nodegen.js samples/drop-and-log-nonobject-message-types-array.js -o ./nodegen'
            },
            generateNode_dropAndLogNonObjectMessageTypesBoolean : {
                command: 'node bin/node-red-nodegen.js samples/drop-and-log-nonobject-message-types-boolean.js -o ./nodegen'
            },
            generateNode_dropAndLogNonObjectMessageTypesNumber : {
                command: 'node bin/node-red-nodegen.js samples/drop-and-log-nonobject-message-types-number.js -o ./nodegen'
            },
            generateNode_handleNodeon : {
                command: 'node bin/node-red-nodegen.js samples/handle-nodeon.js -o ./nodegen'
            },
            generateNode_sendReturnedMessageUsingSend: {
                command: 'node bin/node-red-nodegen.js samples/send-returned-message-using-send.js -o ./nodegen'
            },
            generateNode_sendReturnedMessage: {
                command: 'node bin/node-red-nodegen.js samples/send-returned-message.js -o ./nodegen'
            },
            generateNode_passThroughTopic: {
                command: 'node bin/node-red-nodegen.js samples/pass-through-topic.js -o ./nodegen'
            },
            generateNode_setNodeContext: {
                command: 'node bin/node-red-nodegen.js samples/set-node-context.js -o ./nodegen'
            },
            getGlobalContext1: {
                command: 'node bin/node-red-nodegen.js samples/get-global-context1.js -o ./nodegen'
            },
            getGlobalContext2: {
                command: 'node bin/node-red-nodegen.js samples/get-global-context2.js -o ./nodegen'
            },
            generateNode_getFlowContext1: {
                command: 'node bin/node-red-nodegen.js samples/get-flow-context1.js -o ./nodegen'
            }, 
            generateNode_getFlowContext2: {
                command: 'node bin/node-red-nodegen.js samples/get-flow-context2.js -o ./nodegen'
            },            
            generateNode_setFlowContext: {
                command: 'node bin/node-red-nodegen.js samples/set-flow-context.js -o ./nodegen'
            },
            generateNode_setGlobalContext: {
                command: 'node bin/node-red-nodegen.js samples/set-global-context.js -o ./nodegen'
            },
            generateNode_getNodeContext: {
                command: 'node bin/node-red-nodegen.js samples/get-node-context.js -o ./nodegen'
            },
            generateNode_getKeysInNodeContext: {
                command: 'node bin/node-red-nodegen.js samples/get-keys-in-node-context.js -o ./nodegen'
            },
            generateNode_getKeysInFlowContext: {
                command: 'node bin/node-red-nodegen.js samples/get-keys-in-flow-context.js -o ./nodegen'
            },
            generateNode_handleClearInterval: {
                command: 'node bin/node-red-nodegen.js samples/handle-clearInterval.js -o ./nodegen'
            },
            generateNode_handleSetInterval: {
                command: 'node bin/node-red-nodegen.js samples/handle-setInterval.js -o ./nodegen'
            },
            generateNode_handleSetTimeout: {
                command: 'node bin/node-red-nodegen.js samples/handle-setTimeout.js -o ./nodegen'
            },
            generateNode_useTheSameDateObjectFromOutsideTheSandbox: {
                command: 'node bin/node-red-nodegen.js samples/use-the-same-Date-object-from-outside-the-sandbox.js -o ./nodegen'
            },
            generateNode_logADebugMessage: {
                command: 'node bin/node-red-nodegen.js samples/log-a-Debug-Message.js -o ./nodegen'
            },
            generateNode_logATraceMessage: {
                command: 'node bin/node-red-nodegen.js samples/log-a-Trace-Message.js -o ./nodegen'
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
            getSwagger_swaggerPetstore: {
                command: 'node bin/getswagger.js'
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
