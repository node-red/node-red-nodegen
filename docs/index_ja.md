ノードジェネレータ
----
ノードジェネレータは、OpenAPIドキュメントやfunctionノードなどのソースコードからNode-REDのノードを生成するためのコマンドラインツールです。
このツールを使用すると、ノード開発者はNode-REDノードの実装時間を大幅に短縮できます。

<a name="use-cases"></a>
## 利用ケース
Node-REDには、[フローライブラリ](https://flows.nodered.org)に存在するノードを使用し、コーディングすることなく迅速な開発ができるという利点があります。
しかし、独自の処理を実現するために、Node-REDユーザがノードを開発すると、JavaScriptとHTMLのコーディングに時間がかかり、迅速な開発ができるNode-REDの利点が薄れてしまいます。
この問題を解決するために、ノードジェネレータはコーディングなしで独自のノードを自動生成し、パッケージ化します。
以下の通り、ノードジェネレータには4つの利用ケースがあります。

#### (1) クラウドサービスへの接続
http requestノードは、REST API経由でクラウドサービスに簡単に接続できます。
しかし、マーケティングの観点から考えると、http requestノードの代替として、クラウドサービス向けに専用に独自に開発したノードを公開することは、クラウドサービスのユーザ数を増やすために効果的です。
なぜなら、クラウドサービスとの接続方法を詳細に解説したノードプロパティ、ノード情報、ドキュメントがユーザビリティに貢献するためです。
一般的に、クラウドサービスプロバイダは、ユーザがSwagger UIでREST APIをテストできる様、OpenAPIドキュメントを公開します。
ノードジェネレータは、このOpenAPIドキュメントを使用して、クラウドサービスへの接続用のノードを生成します。
したがって、クラウドサービスプロバイダは、ノード開発コストなしで独自のノードを公開できる様になります。

#### (2) functionノードを独自のノードとして再利用
Node-REDユーザは、functionノードにJavaScriptコードを記述し、簡単な処理を動作させています。
しかし、試行錯誤を繰り返す開発を行い、フローを徐々に改善すると、大量のJavaScriptコードをfunctionノードに追加してしまうことがあります。
この時、functionノードに便利な機能が備わっている場合、他のNode-REDユーザにこのfunctionノードを共有し、再利用をしてほしいというニーズがあがってきます。
なぜなら、ノードを再利用することで、他のNode-REDユーザは同じ機能を開発する必要なく、フローの開発に集中できるためです。
ノードジェネレータは、この様なニーズを満たすために、既存のfunctionノードから独自のノードの開発する作業を助けます。

#### (3) サブフローを独自のノードとして再利用（将来機能）
他のNode-REDユーザとフローを共有するには、サブフローの単位で行うのが最適です。
将来、ノードジェネレータは、サブフローから独自のノードを生成する機能をサポートします。
Node-REDユーザは、サブフローを独自のノードとしてカプセル化できる様になります。
例えば、認証ヘッダを持つtemplateノードとURLを持つhttp requestノードは、多くのNode-REDユーザがクラウドサービスに接続するために使用する典型的なペアです。
ノードジェネレータは、この様なフローを含むサブフローから独自のノードを生成できます。
そして、Node-REDユーザは、フローライブラリを介して、生成したノードを他のNode-REDユーザと容易に共有できます。

#### (4) デバイスへの接続（将来機能）
Web of Things (WoT)は、IoTデバイスを接続するための標準仕様です。
ノードジェネレータはWeb of Thingsの定義から独自のノードを開発することを支援します。
現在のところ、GitHub上にプロトタイプ実装の[スライド](https://github.com/w3c/wot/blob/master/plugfest/2018-bundang/images/Plugfest-Bundang-WoT.pdf)と[スクリーンショット](https://github.com/w3c/wot/blob/master/plugfest/2018-bundang/result-hitachi.md)があります。

<a name="how-to-use-node-generator"></a>
## ノードジェネレータの使い方
ノードジェネレータをローカル環境にインストールするには、コマンドプロンプト(Windows)又はターミナル(macOS/Linux)で次の「npm install」コマンドを入力します。 
コマンド実行にはroot権限が必要なため、macOS又はLinux環境では "npm install"コマンドの前に "sudo"が必要です。

    npm install -g node-red-nodegen

ノードジェネレータの現在のバージョンは、functionノードとOpenAPIドキュメントをソースファイルとしてサポートしています。
ノードジェネレータのコマンドであるnode-red-nodegenは、以下の様にコマンドの引数で指定したファイルをノードに変換します。

    node-red-nodegen <source file> -> コマンドツールは、ソースファイルからノードを出力します

以降のドキュメントでは、2種類のソースファイルからノードを生成する方法の詳細について説明します。

 - [OpenAPIドキュメントからノードを生成する方法](#how-to-create-a-node-from-openapi-document)
 - [functionノードからノードを生成する方法](#how-to-create-a-node-from-function-node)

<a name="generated-files-which-node-package-contains"></a>
## ノードパッケージ内のファイル
ノードジェネレータによって自動生成したノードパッケージの典型的なディレクトリ構造は以下の通りです。
Node-REDユーザは、自動生成したノードをローカルNode-RED環境にインストールしたり、追加開発なくフローライブラリに公開したりできます。

    - node.js         <- ノード処理用のJavaScriptファイル
    - node.html       <- ノードプロパティUIのHTMLファイル
    - icons
       |-icon.png     <- ノードのアイコンファイル
    - package.json    <- ノードパッケージ情報
    - README.md       <- ノードパッケージの説明ファイル
    - LICENSE         <- ノードのライセンス情報
    - test
       |-node_spec.js <- ノードのテストケース
    - locales
       |-en-US
          |-node.json <- 英語のメッセージカタログ
       |-ja
          |-node.json <- 日本語のメッセージカタログ
       |-zh-CN
          |-node.json <- 中国語のメッセージカタログ
       |-de-DE
          |-node.json <- ドイツ語のメッセージカタログ

<a name="how-to-create-a-node-from-openapi-document"></a>
## OpenAPIドキュメントからノードを生成する方法
node-red-nodegenコマンドの最初の引数として、OpenAPIドキュメントのURL又はファイルパスを指定できます。

(1) node-red-nodegenコマンドを使用してノードを生成

    node-red-nodegen http://petstore.swagger.io/v2/swagger.json

Node-REDユーザは通常、以下の手順で生成したノードをNode-REDフローエディタのパレットにインポートします。

(2) 生成したノードのディレクトリにディレクトリを変更

    cd node-red-contrib-swagger-petstore

(3) シンボリックリンクを準備

    sudo npm link

(4) カレントディレクトリをNode-REDのホームディレクトリに変更（通常、Node-REDのホームディレクトリは、ホームディレクトリの下の".node-red"です）

    cd ~/.node-red

(5) シンボリックリンクを作成

    npm link node-red-contrib-swagger-petstore

(6) Node-REDを起動

    node-red

(7) Node-REDフローエディタにアクセス (http://localhost:1880)

-> 生成されたノードがNode-REDフローエディタのパレットに表示されます。

(8) 生成されたノードをワークスペースにドラッグアンドドロップ

(9) ノードプロパティ設定でメソッドを選択

(OpenAPIドキュメントにホスト名が含まれていないか、認証設定がある場合、ノードプロパティ設定にてホスト名と認証設定を設定します)

(10) Node-REDフローエディタでフローを作成

-> injectノード、生成されたノード、debugノードからなるフローが、最初のステップに適しています。(生成されたノードがPOSTメソッドを使用する場合は、injectノードのmsg.payloadにJSONデータを設定する必要があります)

(11) フローを実行

-> この例では、injectノードのボタンをクリックすると、受信したデータをデバッグタブに表示します。

### コマンドラインオプション
生成したノードをカスタマイズする場合は、次の手順やコマンドラインオプションが役立ちます。

#### モジュール名
ノードジェネレータは、モジュール名のデフォルトのプレフィックスとして "node-red-contrib-"を使用します。
したがって、ノード名が "swagger-petstore"の場合、モジュール名は "node-red-contrib-swagger-petstore"となります。
デフォルトのモジュール名を変更したい場合は、--module又は--prefixオプションを使用してモジュール名を指定できます。

    node-red-nodegen http://petstore.swagger.io/v2/swagger.json --module node-red-node-swagger-petstore
    node-red-nodegen http://petstore.swagger.io/v2/swagger.json --prefix node-red-node

#### ノード名
OpenAPIドキュメントから生成したノードの場合、OpenAPIドキュメントの "info.title"値が生成ノードの名前として使用します。
ノードジェネレータは、npmモジュールとNode-REDノードで利用できる適切な名前を変換するために、大文字とスペースをハイフンに置き換えます。

##### OpenAPIドキュメントの例
```
{
  "swagger": "2.0",
  "info": {
    "description": "This is a sample server Petstore server.",
    "version": "1.0.0",
    "title": "Swagger Petstore",  <- ノードジェネレータは、この値を「swagger-petstore」に変換し、ノード名として使用します。
    "license": {
      "name": "Apache 2.0",
      "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
    }
  },
  "host": "petstore.swagger.io",
  "basePath": "/v2",
  "schemes": [
    "https"
  ],
  ...
}
```

デフォルト名を変更する場合は、--nameオプションを使用してノード名を設定できます。
特に、"info.title"の値にアルファベットと数字の代わりに2バイト文字を含む場合、ノードジェネレータがノードを正しく生成できないため、--nameオプションを使用してノード名を指定します。

    node-red-nodegen http://petstore.swagger.io/v2/swagger.json --name new-node-name

#### バージョン
デフォルトでは、ノードジェネレータはモジュールのバージョン番号として "info.version"値を使用します。

##### OpenAPIドキュメントの例
```
{
  "swagger": "2.0",
  "info": {
    "description": "This is a sample server Petstore server.",
    "version": "1.0.0",  <- ノードジェネレータはこのバージョン番号をモジュールバージョン番号として使用します。
    "title": "Swagger Petstore",
    "license": {
      "name": "Apache 2.0",
      "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
    }
  },
  "host": "petstore.swagger.io",
  "basePath": "/v2",
  "schemes": [
    "https"
  ],
  ...
}
```

OpenAPIドキュメントのバージョン番号をインクリメントせずにモジュールのバージョン番号を更新する場合は、--versionオプションを指定します。
特に、"npm publish"コマンドを使用して、以前公開したモジュールと同じバージョン番号を持つモジュールを公開すると、競合エラーが発生します。
この場合、モジュールのバージョン番号を更新するには、--versionオプションを指定します。

    node-red-nodegen http://petstore.swagger.io/v2/swagger.json --version 0.0.2

#### キーワード
--keywordsは、モジュールのキーワードのために用いる便利なオプションです。
フローライブラリのWebサイトで、訪問者はこのキーワードを使用してモジュールを検索します。
例えば、 "petstore"をキーワードとして使用する場合は、--keywordsオプションを使用して単語を指定できます。
デフォルトでは、ノードジェネレータは "node-red-nodegen"をキーワードとして使用します。

    node-red-nodegen http://petstore.swagger.io/v2/swagger.json --keywords petstore

2つ以上のキーワードを追加するには、コンマ区切りのキーワードを使用することもできます。

    node-red-nodegen http://petstore.swagger.io/v2/swagger.json --keywords petstore,petshop

生成したノードを公開する前に"--keywords node-red"を指定すると、ノードはフローライブラリに登録でき、Node-REDフローエディタでノードをインストールできます。

    node-red-nodegen http://petstore.swagger.io/v2/swagger.json --keywords petstore,petshop,node-red

#### カテゴリ
Node-REDフローエディタのパレットでは、生成したノードはデフォルトとして機能カテゴリに入ります。
カテゴリを変更したり、カテゴリ名に製品名を使用したりしたい場合は、--categoryオプションを用います。
例えば、次のコマンドが出力するノードは、Node-REDフローエディタの「分析」カテゴリに入ります。

    node-red-nodegen http://petstore.swagger.io/v2/swagger.json --category analysis

#### ノードアイコン
ノードジェネレータのコマンドは、生成されるノードのアイコンファイルを指定するための--iconオプションをサポートしています。
オプションにはPNGファイルパス、または[ストックアイコンのファイル名](https://nodered.org/docs/creating-nodes/appearance)を使用できます。アイコンは透明な背景上に白色で表示したPNGファイルである必要があります。

    node-red-nodegen http://petstore.swagger.io/v2/swagger.json --icon <PNGファイル、またはストックアイコン>

#### ノードの色
ノードジェネレータはデフォルトでノードテンプレートで定義されたノードの色を使用します。変更する必要がある場合は、コマンドラインの--colorオプションを使用できます。オプションには、ノードの色を表す16進数("RRGGBB"形式)の文字列を指定できます。

    node-red-nodegen http://petstore.swagger.io/v2/swagger.json --color FFFFFF

#### 情報タブ内のノードの情報
ノードジェネレータは、OpenAPIドキュメントの次の値を使用して、情報タブにノードの情報を自動的に生成します。

- info.description : ノードの説明
- paths.[path].[http method].summary : メソッドの説明
- paths.[path].[http method].operationId : メソッド名

##### OpenAPIドキュメントの例
```
{
  "swagger": "2.0",
  "info": {
    "description": "This is a sample server Petstore server.",  <- ノードジェネレータは、この値をノードの説明として使用
    "version": "1.0.0",
    "title": "Swagger Petstore",
    "license": {
      "name": "Apache 2.0",
      "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
    }
  },
  "host": "petstore.swagger.io",
  "basePath": "/v2",
  "schemes": [
    "https"
  ],
  ...
  "paths": {
    "/pet": {
      "post": {
        "tags": [
          "pet"
        ],
        "summary": "Add a new pet to the store",  <- ノードジェネレータは、この値をメソッドの説明として使用
        "description": "",
        "operationId": "addPet",  <- ノードジェネレータはこの値をメソッド名として使用します。
  ...
}
```

情報タブのノード情報を変更したい場合は、手動でノードのHTMLファイルの最後のセクションを編集します。

    vi node-red-contrib-swagger-petstore/node.html

```html:
<script type="text/x-red" data-help-name="swagger-petstore">

    <p>This is a sample server Petstore server.</p>   <- ノードの説明を変更
    <h2>Methods</h2>
        <h3>addPet</h3>                               <- メソッド名を変更
        <h4>Add a new pet to the store</h4>           <- メソッドの説明を変更
        ...
        <h3>deleteUser</h3>
        <h4>This can only be done by the logged in user.</h4>
</script>
```

#### README
ノードの詳細を説明は、README.mdというファイルに書きます。 
フローライブラリにノードを公開すると、フローライブラリのWebサイトは、ノードのページで本ファイルを表示します。
ノードジェネレータはREADME.mdのテンプレートを出力するので、ファイルを変更するだけです。

    vi node-red-contrib-swagger-petstore/README.md

```
node-red-contrib-swagger-petstore
=====================

Node-RED node for swagger-petstore

This is a sample server Petstore server.

Install
-------

Run the following command in your Node-RED user directory - typically `~/.node-red`

        npm install node-red-contrib-swagger-petstore
```

#### テストケース
テストケースは、本番環境で利用するノードの品質を維持するために最も重要です。
ノードジェネレータは、生成したディレクトリの下にあるファイル "test/node_spec.js"にテストケースのテンプレートファイルを出力します。
テストケースファイルでは、以下の（1）、（2）、（3）の3行を変更します。
もし、OpenAPIドキュメントの"info"値にホスト名を含まない場合は、各テストケースに手動でホスト名を（4）に記述します。

    vi node-red-contrib-swagger-petstore/test/node_spec.js

```JavaScript:
    it('should handle addPet()', function (done) {
        var flow = [
            { id: 'n1', type: 'swagger-petstore', name: 'swagger-petstore',
                method: 'addPet',
                addPet_body: '<node property>', // (1) ノードのプロパティを定義
                wires: [['n3']]
            },
            { id: 'n3', type: 'helper' }
        ];
        helper.load(node, flow, function () {
            var n3 = helper.getNode('n3');
            var n1 = helper.getNode('n1');
            n3.on('input', function (msg) {
                try {
                    msg.should.have.property('payload', { "id": 4513 }); // (3) 出力メッセージを定義
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: { "id": 4513 } }); // (2) 入力メッセージを定義
        });
    });
```

この例では、生成したノードはペットストアのREST APIにデータ"{ "id": 4513 }"を送信します。
そして、REST APIは同じデータ"{ "id": 4513 }"を戻します。
したがって、入力メッセージと出力メッセージは同じです。
テストケースを実行したい場合は、ノードが生成したディレクトリの下で"npm test"コマンドを実行します。

    cd node-red-contrib-swagger-petstore
    npm install
    npm test

#### メッセージカタログ
デフォルトでは、ノードジェネレータは英語、日本語、中国語、ドイツ語のテンプレートファイルを出力します。
ノードプロパティの多言語対応をしたい場合は、パラメータの言語メッセージをこれらのファイルに追加します。

    vi node-red-contrib-swagger-petstore/locales/ja/node.json

```
{
    "SwaggerPetstore": {
        "label": {
            "service": "サービス",
            "method": "メソッド",
            "host": "ホスト",
            "header": "ヘッダ",
            "value": "値",
            "isQuery": "クエリ"
        },
        "status": {
            "requesting": "要求中"
        },
        "parameters": {
            "addPet": "addPet",
            "body": "body",
            "updatePet": "updatePet",
            "findPetsByStatus": "findPetsByStatus",
            ...
            "optionalParameters": "任意項目"
        }
    }
}
```

ノードが一部の言語をサポートしない場合は、言語ディレクトリを削除します。
（例えば、中国語をサポートしたくない場合は、「zh-CN」ディレクトリごと削除してください）

### エンドポイントを指定するための設定ノード
設定ノードを使用することで、生成されたノードがアクセスするREST APIのエンドポイントをフローの作成中に変更できるようになります。
設定ノードを有効にするには、ノードを生成する前にOpenAPIドキュメントから`host`、`basePath`、`schemes`の各プロパティを削除する必要があります。

##### OpenAPIドキュメントの例
```
{
  "swagger": "2.0",
  "info": {
    "description": "This is a sample server Petstore server.",
    "version": "1.0.0",
    "title": "Swagger Petstore",
    "license": {
      "name": "Apache 2.0",
      "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
    }
  },
  "host": "petstore.swagger.io",  <- この行を削除
  "basePath": "/v2",              <- この行を削除
  "schemes": [                    <- この行を削除
    "https"                       <- この行を削除
  ],                              <- この行を削除
  ...
}
```

この設定ノードは、クラウドサービス上のデータセンターのリージョン毎に異なるURLを持つREST APIに適しています。
その他、クラウドサービスのエンドポイントから、クラウドサービスと同じ機能を持つローカルのエンドポイントへ切り替えることができるため、エッジコンピューティングのユースケースでも役立ちます。

### OpenAPI Specification 3.0
OpenAPI Specification 3.0を使用してノードを生成する場合は、[api-spec-converter](https://www.npmjs.com/package/api-spec-converter)コマンドを使用してデータ形式を3.0から2.0に変換する必要があります。

(1) api-spec-converterコマンドをインストール

    npm install -g api-spec-converter

(2) データ形式を変換

     api-spec-converter -f openapi_3 -t swagger_2 https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/uspto.yaml > swagger.json

(3) ノードを生成

    node-red-nodegen swagger.json

<a name="how-to-create-a-node-from-function-node"></a>
## functionノードからノードを生成する方法
functionノードにJavaScriptコードを記述した後、functionノードの "ライブラリへ保存..."メニューを使用して、JavaScriptコードをjsファイルとして書き出します。
ノードジェネレータはfunctionノード名を生成ノードの名前として使用するため、functionノードをエクスポートする前にノード名を入力する方がよいでしょう。
Node-REDは、jsファイルを"<Home directory>/.node-red/lib/functions/"ディレクトリに保存します。
したがって、このディレクトリとファイルパスをコマンドラインの引数として指定します。

(1) functionノードをjsファイルとしてエクスポート

![Export function node](https://raw.githubusercontent.com/node-red/node-red-nodegen/master/docs/library_ja.png)

(2) node-red-nodegenコマンドを使用してノードを生成

    node-red-nodegen ~/.node-red/lib/functions/lower-case.js

Node-REDユーザは通常、以下の手順で生成したノードをNode-REDフローエディタのパレットにインポートします。

(3) 生成したノードのディレクトリにディレクトリを変更

    cd node-red-contrib-lower-case

(4) シンボリックリンクを準備

    sudo npm link

(5) カレントディレクトリをNode-REDのホームディレクトリに変更します（通常、Node-REDのホームディレクトリは、ホームディレクトリの下の".node-red"です）

    cd ~/.node-red

(6) シンボリックリンクを作成

    npm link node-red-contrib-lower-case

(7) Node-REDを起動

    node-red

(8) Node-REDフローエディタにアクセス (http://localhost:1880)

-> 生成されたノードがNode-REDフローエディタのパレットに表示されます。

(9) 生成されたノードをワークスペースにドラッグアンドドロップ

(10) Node-REDフローエディタでフローを作成

-> injectノード、生成されたノードおよびdebugノードからなるフローが、最初のステップに適しています。

(11) フローを実行

-> この例では、injectノードのボタンをクリックすると、受信したデータをデバッグタブに表示します。

### コマンドラインオプション
生成したノードをカスタマイズする場合は、次の手順やコマンドラインオプションが役立ちます。

#### モジュール名
ノードジェネレータは、モジュール名のデフォルトのプレフィックスとして "node-red-contrib-"を使用します。
したがって、ノード名が "lower-case"の場合、モジュール名は "node-red-contrib-lower-case"になります。
デフォルトのモジュール名を変更したい場合は、--module又は--prefixオプションを使用してモジュール名を指定できます。

    node-red-nodegen ~/.node-red/lib/functions/lower-case.js --module node-red-node-lower-case
    node-red-nodegen ~/.node-red/lib/functions/lower-case.js --prefix node-red-node

#### ノード名
functionノードの場合、functionノード内のノード名を、生成されるノードのノード名として使用します。
もしデフォルトのノード名を変更したい場合は、--nameオプションを使用してノード名を設定します。

    node-red-nodegen ~/.node-red/lib/functions/lower-case.js --name new-node-name

#### バージョン
デフォルトでは、モジュールのバージョン番号は常に"0.0.1"です。
モジュールのバージョン番号を更新するときは、--versionオプションを指定します。
特に、"npm publish"コマンドを使用して、以前公開したモジュールと同じバージョン番号を持つモジュールを公開すると、競合エラーが発生します。
この場合、モジュールのバージョン番号を更新するには、--versionオプションを指定します。

    node-red-nodegen ~/.node-red/lib/functions/lower-case.js --version 0.0.2

#### キーワード
--keywordsは、フローライブラリ上のモジュールのキーワードを指定できる便利なオプションです。
フローライブラリのWebサイトでは、訪問者はこのキーワードを使用してモジュールを検索します。
例えば、キーワードとして"lower-case"を使用する場合は、--keywordsオプションを使用してこの単語を指定できます。
デフォルトでは、ノードジェネレータは"node-red-nodegen"をキーワードとして使用します。

    node-red-nodegen ~/.node-red/lib/functions/lower-case.js --keywords lower-case  

2つ以上のキーワードを追加するには、コンマ区切りのキーワードを使用することもできます。

    node-red-nodegen ~/.node-red/lib/functions/lower-case.js --keywords lower-case,function

生成したノードを公開する前に "--keywords node-red"を指定すると、ノードはフローライブラリに登録でき、Node-REDフローエディタでノードをインストールできます。

    node-red-nodegen ~/.node-red/lib/functions/lower-case.js --keywords lower-case,function,node-red

#### カテゴリ
Node-REDフローエディタのパレットでは、生成したノードはデフォルトとして機能カテゴリに入ります。
カテゴリを変更したり、カテゴリ名に製品名を使用したりしたい場合は、--categoryオプションを用います。
例えば、次のコマンドが出力するノードは、Node-REDフローエディタの「分析」カテゴリに入ります。

    node-red-nodegen ~/.node-red/lib/functions/lower-case.js --category analysis

#### ノードアイコン
ノードジェネレータのコマンドは、生成されるノードのアイコンファイルを指定するための--iconオプションをサポートしています。
オプションにはPNGファイルパス、または[ストックアイコンのファイル名](https://nodered.org/docs/creating-nodes/appearance)を使用できます。アイコンは透明な背景上に白色で表示したPNGファイルである必要があります。

    node-red-nodegen ~/.node-red/lib/functions/lower-case.js --icon <PNGファイル、またはストックアイコン>

#### ノードの色
ノードジェネレータはデフォルトでノードテンプレートで定義されたノードの色を使用します。変更する必要がある場合は、コマンドラインの--colorオプションを使用できます。オプションには、ノードの色を表す16進数("RRGGBB"形式)の文字列を指定できます。

    node-red-nodegen ~/.node-red/lib/functions/lower-case.js --color FFFFFF

#### 情報タブ内のノードの情報
ノードジェネレータはノード情報のテンプレートをnode.htmlファイルに出力します。
ノードとともにテンプレートを変更します。
（将来のバージョンのNode-REDとノードジェネレータでは、ノード開発者はノード記述プロパティを使用して、ノード情報を指定できます）

    vi node-red-contrib-lower-case/node.html

```html:
<script type="text/x-red" data-help-name="lower-case">
    <p>Summary of the node.</p>
    <h3>Inputs</h3>
    <dl class="message-properties">
       <dt>payload<span class="property-type">object</span></dt>
       <dd>Explanation of payload.</dd>
       <dt class="optional">topic <span class="property-type">string</span></dt>
       <dd>Explanation of topic.</dd>
    </dl>
    <h3>Outputs</h3>
    <dl class="message-properties">
        <dt>payload<span class="property-type">object</span></dt>
        <dd>Explanation of payload.</dd>
        <dt class="optional">topic<span class="property-type">string</span></dt>
        <dd>Explanation of topic.</dd>
    </dl>
    <h3>Details</h3>
    <p>Explanation of the details.</p>
    <p><b>Note</b>: Note of the node.</p>
</script>
```

テンプレートには、ノードの説明と3つのセクションのサマリーがあります。
Inputセクションには、入力するメッセージの情報を記載します。
Outputセクションには、出力したメッセージの情報を記載します。
Detailsセクションには、生成したノードの追加情報を記載します。

#### README
ノードの詳細を説明は、README.mdというファイルに書きます。
フローライブラリにノードを公開すると、フローライブラリのWebサイトは、ノードのページで本ファイルを表示します。
ノードジェネレータはREADME.mdのテンプレートを出力するので、ファイルを変更するだけです。

    vi node-red-contrib-lower-case/README.md

```
node-red-contrib-lower-case
=====================

Node-RED node for lower case

Install
-------

Run the following command in your Node-RED user directory - typically `~/.node-red`

        npm install node-red-contrib-lower-case
```

#### テストケース
テストケースは、本番環境で使用するノードの品質を維持するために最も重要です。
ノードジェネレータは、生成したディレクトリの下にあるファイル"test/node_spec.js"にテストケースのテンプレートファイルを出力します。
テストケースファイルでは、（1）と（2）の2行を修正します。

    vi node-red-contrib-lower-case/test/node_spec.js

```JavaScript:
    it('should have payload', function (done) {
        var flow = [
            { id: "n1", type: "lower-case", name: "lower-case", wires: [["n2"]] },
            { id: "n2", type: "helper" }
        ];
        helper.load(node, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            n2.on("input", function (msg) {
                msg.should.have.property('payload', 'abcd'); // (2) 出力メッセージを定義
                done();
            });
            n1.receive({ payload: "AbCd" }); // (1) 入力メッセージを定義
        });
    });
```

この例では、生成したノードは大文字を小文字に変換します。
したがって、入力メッセージは「AbCd」であり、出力メッセージは「abcd」です。
テストケースを実行したい場合は、ノードが生成したディレクトリの下で"npm test"コマンドを実行します。

    cd node-red-contrib-lower-case
    npm install
    npm test

### 外部モジュールの利用
functionノードに外部モジュールをロードする場合、Node-REDユーザーは通常、モジュールをsettings.jsファイルの `functionGlobalContext`セクションに追加します。
現在のノードジェネレータは、この設定を生成されたノードにエクスポートする機能をサポートしていません。
したがって、生成されたノードを他のノード-RED環境と共有する前に、node.jsファイルとpackage.jsonファイルを変更する必要があります。

次の例は、momentモジュールを使用するfunctionノードからノードを生成する手順です。

(1) 外部モジュールをsettings.jsファイルに追加（行番号214付近）

    vi ~/.node-red/settings.js

```
    functionGlobalContext: {
        // os:require('os'),
        // jfive:require("johnny-five"),
        // j5board:require("johnny-five").Board({repl:false})
        moment: require('moment')    <- 外部モジュールの定義を追加
    },
```

(2) 外部モジュールをインストール

    cd ~/.node-red/
    npm install moment
    cd

(3) Node-REDを起動

    node-red

(4) 外部モジュールを使用するJavaScriptコードをfunctionノードに記述

| 項目 | functionノードのプロパティ値 |
|---|---|
| 名前 | Format date |
| コード | var moment = global.get('moment');<br>msg.payload = moment().format('MMMM Do YYYY, h:mm:ss a');<br>return msg; |

(5) functionノードプロパティUIの"ライブラリへ保存"メニューからjsファイルとしてfunctionノードを保存

(6) ノードを生成

    node-red-nodegen ~/.node-red/lib/functions/Format-date.js

(7) jsファイルに定義を追加（行番号206付近）

    vi node-red-contrib-format-date/node.js

```
        }
        sandbox.global.set("moment", require('moment'));  <- vm.createContext()の前に定義を追加
        var context = vm.createContext(sandbox);
        try {
            this.script = vm.createScript(functionText, {
```

(8) package.jsonファイルに依存関係を追加（行番号17付近）

    vi node-red-contrib-format-date/package.json

```
  "keywords": [
    "node-red-nodegen"
  ],
  "dependencies": {     <- 依存関係を追加
    "moment": "2.23.0"  <- 依存関係を追加
  },                    <- 依存関係を追加
  "devDependencies": {
    "node-red": "0.18.7",
```

(9) シンボリックリンクを準備

    sudo npm link

(10) シンボリックリンクを作成

    cd ~/.node-red/
    npm link node-red-contrib-format-date

(11) Node-REDを再起動

    node-red

   -> Node-REDフローエディタ上でformat-dateノードを使用できます。

## 既知の問題点
- ノードジェネレータのコマンドでは、非同期の問題があるため、--tgzオプションと--iconオプションを同時に使用することはできません。
- OpenAPIドキュメントの値`info.title`は生成されたコードの変数名として使われるため、アルファベットの文字（数字ではない）で始める必要があります。