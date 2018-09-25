# Node generator for Node-RED

Node generator is command line tool to generate Node-RED node modules from several various sources including Swagger specification and function node's source.
Using this tool, node developers can dramatically reduce their time to implement Node-RED node modules.

## Installation

Install node generator globally to make the `node-red-nodegen` command available on your path:

    npm install -g node-red-nodegen

You may need to run this with `sudo`, or from within an Administrator command shell.

## Usage

    Usage:
       node-red-nodegen <source file or URL> [-o <path to save>] [--prefix <prefix string>] [--name <node name>] [--module <module name>] [--version <version number>] [--tgz] [--help]

    Description:
       Node generator for Node-RED

    Supported source:
       - Function node (js file in library, "~/.node-red/lib/function/")
       - Swagger definition

    Options:
       -o : Destination path to save generated node (default: current directory)
       --prefix : Prefix of npm module (default: "node-red-contrib-")
       --name : Node name (default: name defined in source)
       --module : Module name (default: "node-red-contrib-<node name>")
       --version : Node version (format: "number.number.number" like "4.5.1")
       --keywords : Additional keywords (format: comma separated string, default: "node-red-nodegen")
       --category : Node category (default: "function")
       --tgz : Save node as tgz file
       --help : Show help

### Example 1. Create original node from Swagger definition

- node-red-nodegen http://petstore.swagger.io/v2/swagger.json
- cd node-red-contrib-swagger-petstore
- sudo npm link
- cd ~/.node-red
- npm link node-red-contrib-swagger-petstore
- node-red

-> You can use swagger-petstore node on Node-RED flow editor.

### Example 2. Create original node from function node (JavaScript code)

- On Node-RED flow editor, save function node to library with file name (lower-case.js).
- node-red-nodegen ~/.node-red/lib/function/lower-case.js
- cd node-red-contrib-lower-case
- sudo npm link
- cd ~/.node-red
- npm link node-red-contrib-lower-case
- node-red

-> You can use lower-case node on Node-RED flow editor.

## Documentation
- [Use cases](docs/index.md#use-cases) ([Japanese](docs/index_ja.md#use-cases))
- [How to use Node generator](docs/index.md#how-to-use-node-generator) ([Japanese](docs/index_ja.md#how-to-use-node-generator))
- [Generated files which node package contains](docs/index.md#generated-files-which-node-package-contains) ([Japanese](docs/index_ja.md#generated-files-which-node-package-contains))
- [How to create node from Swagger definition](docs/index.md#how-to-create-node-from-swagger-definition) ([Japanese](docs/index_ja.md#how-to-create-node-from-swagger-definition))
- [How to create node from function node](docs/index.md#how-to-create-node-from-function-node) ([Japanese](docs/index_ja.md#how-to-create-node-from-function-node))

Note: Currently node generator supports GET and POST methods using JSON format without authentication.
