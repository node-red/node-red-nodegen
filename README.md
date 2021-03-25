
# Node generator for Node-RED

Node generator is a command line tool to generate Node-RED nodes based on various sources such as an OpenAPI (Swagger) document, a Node-RED Function node, or a Web Of Things Thing description.
It helps developers dramatically reduce the time to implement Node-RED nodes.

## Installation

Install node generator globally to make the `node-red-nodegen` command available on your path:

    npm install -g node-red-nodegen

You may need to run this with `sudo`, or from within an Administrator command shell.

## Usage

    Usage:
       node-red-nodegen <source file or URL> [-o <path to save>] [--prefix <prefix string>] [--name <node name>] [--module <module name>] [--version <version number>] [--keywords <keywords list>] [--category <node category>] [--icon <png or gif file>] [--color <node color>] [--tgz] [--help] [--wottd] [--lang <accept-language>] [-v]

    Description:
       Node generator for Node-RED

    Supported source:
       - OpenAPI document
       - Function node (js file in library, "~/.node-red/lib/function/")
       - (Beta) Thing Description of W3C Web of Things (jsonld file or URL that points jsonld file)

    Options:
       -o : Destination path to save generated node (default: current directory)
       --prefix : Prefix of npm module (default: "node-red-contrib-")
       --name : Node name (default: name defined in source)
       --module : Module name (default: "node-red-contrib-<node name>")
       --version : Node version (format: "number.number.number" like "4.5.1")
       --keywords : Additional keywords (format: comma separated string, default: "node-red-nodegen")
       --category : Node category (default: "function")
       --icon : PNG file for node appearance (image size should be 10x20)
       --color : Color for node appearance (format: color hexadecimal numbers like "A6BBCF")
       --tgz : Save node as tgz file
       --help : Show help
       --wottd : explicitly instruct source file/URL points a Thing Description
       --lang : Language negotiation information when retrieve a Thing Description
       -v : Show node generator version

### Example 1. Create an original node from OpenAPI document

- node-red-nodegen http://petstore.swagger.io/v2/swagger.json
- cd node-red-contrib-swagger-petstore
- sudo npm link
- cd ~/.node-red
- npm link node-red-contrib-swagger-petstore
- node-red

-> You can use swagger-petstore node on Node-RED flow editor.

### Example 2. Create an original node from function node (JavaScript code)

- In Node-RED flow editor, edit the function node and to the right of the 'name' option, click on the book icon and select 'Save to library'. Then fill in the 'Export as' with the file name (lower-case.js).
- node-red-nodegen ~/.node-red/lib/functions/lower-case.js
- cd node-red-contrib-lower-case
- sudo npm link
- cd ~/.node-red
- npm link node-red-contrib-lower-case
- node-red

-> You can use lower-case node on Node-RED flow editor.

### Example 3. Create original node from Thing Description

- node-red-nodegen example.jsonld
- cd node-red-contrib-example-thing
- sudo npm link
- cd ~/.node-red
- npm link node-red-contrib-example-thing
- node-red

-> You can use Example Thing node on Node-RED flow editor.

### Example 4. Create original node from Thing Description via HTTP

- node-red-nodegen http://example.com/td.jsonld --wottd --lang "en-US,en;q=0.5"
- cd node-red-contrib-example-thing
- sudo npm link
- cd ~/.node-red
- npm link node-red-contrib-example-thing
- node-red

-> You can use Example Thing node on Node-RED flow editor.

## Documentation
- [Use cases](https://github.com/node-red/node-red-nodegen/blob/0.1.1/docs/index.md#use-cases) ([Japanese](https://github.com/node-red/node-red-nodegen/blob/0.1.1/docs/index_ja.md#use-cases))
- [How to use Node generator](https://github.com/node-red/node-red-nodegen/blob/0.1.1/docs/index.md#how-to-use-node-generator) ([Japanese](https://github.com/node-red/node-red-nodegen/blob/0.1.1/docs/index_ja.md#how-to-use-node-generator))
- [Generated files which node package contains](https://github.com/node-red/node-red-nodegen/blob/0.1.1/docs/index.md#generated-files-which-node-package-contains) ([Japanese](https://github.com/node-red/node-red-nodegen/blob/0.1.1/docs/index_ja.md#generated-files-which-node-package-contains))
- [How to create a node from OpenAPI document](https://github.com/node-red/node-red-nodegen/blob/0.1.1/docs/index.md#how-to-create-a-node-from-openapi-document) ([Japanese](https://github.com/node-red/node-red-nodegen/blob/0.1.1/docs/index_ja.md#how-to-create-a-node-from-openapi-document))
- [How to create a node from function node](https://github.com/node-red/node-red-nodegen/blob/0.1.1/docs/index.md#how-to-create-a-node-from-function-node) ([Japanese](https://github.com/node-red/node-red-nodegen/blob/0.1.1/docs/index_ja.md#how-to-create-a-node-from-function-node))

Note: Currently node generator supports GET and POST methods using JSON format without authentication.
