ごきげんよう。erukitiです。

皆さん、技術同人誌を書いていますか？

技術同人誌専門の大型イベントとしては年内に残り2つが予定されています。

2019年9月22日（日曜）に池袋で開催される[技術書典7](https://techbookfest.org/event/tbf07)と、2019年12月14日（土曜）に人形町で開催される[技書博2](https://gishohaku.dev/gishohaku2/)です。

技術同人誌の執筆には Re:VIEW+TeXLiveか、MarkdownやHTMLとCSS組版などといった組み合わせがよく使われています。

過去にQiitaでも[技術書同人誌を書きましょう！ \- Qiita](https://qiita.com/erukiti/items/6b7e85f760476a997161)という記事や[本文212Pの分厚い薄い本の共同執筆を支える技術 \- Qiita](https://qiita.com/erukiti/items/ddd8873cf8ea5b36d66c)という記事を書いたりしましたが、今回、新しく導入した執筆環境について解説します。

筆者も度々Re:VIEW+TeXLiveを使っていますが、2019年7月27日（日曜）に開催された技書博では、Markdown（正確には、Markdown+Re:VIEW+TeXLive）を使って原稿を書きました。

世界の標準言語はMarkdownです。QiitaもはてなブログもGitHubもMarkdownで文書をやりとりできますが、本という形にする場合、Re:VIEW形式に変換するか、未だ不完全で発展途上のCSS組版を使うしかありません。

Re:VIEWを使えばLaTeXを経由してPDFに変換されるため、印刷クォリティは圧倒的に高いです。ただし、MarkdownをRe:VIEW形式に変換しようとしても、Markdown側の機能不足によって、結局Re:VIEWソースを編集せざるを得ません。

そこで開発したのが、GFM（CommonMark）などの拡張記法を使ってRe:VIEWの持つフル機能をそのままMarkdownで記述し、なんならRe:VIEWのソースと混ぜてもかまわないという easybooks というソフトウェアです。

オリジナルの記法ではなく、既存の拡張記法に乗っかった形です。

## easybooks

easybooksはTypeScriptで書かれたnpmパッケージです。気が向いたら、Windows/Mac/Linux向けのワンバイナリも提供するかもしれません。

```sh
$ yarn add easybooks
$ yarn exec easybooks <設定JSON>

or 

$ npm i easybooks
$ npx easybooks <設定JSON>
```

で起動可能です。

Dockerを使う場合は、

```sh
docker run -t --rm -v $(pwd):/book vvakame/review /bin/bash -ci "cd /book && yarn && yarn build"
```

で可能です。

`.review`というディレクトリにRe:VIEWでコンパイルするときに必要なファイルが生成（もしくはコピー）されて、コンパイルされてPDFが生成されます。

さて、起動する前に設定ファイルを書く必要があります。この設定ファイルはRe:VIEWでいうconfig.ymlとcatalog.ymlを混ぜ合わせたようなものです。

```json
{
  "bookname": "Onestop-app-dev",
  "booktitle": "Onestopアプリ開発",
  "aut": [],
  "language": "ja",
  "toc": true,
  "rights": "(C) 2019　親方Project",
  "colophon": true,
  "history": [["2019-xx-xx xxxxxx"]],
  "prt": "株式会社　栄光",
  "pbl": "親方Project",
  "edt": "親方Project",
  "secnolevel": 3,
  "titlepage": true,
  "review_version": 3.0,
  "texstyle": ["reviewmacro"],
  "texdocumentclass": [
    "review-jsbook",
    "media=ebook,paper=b5,serial_pagination=true,hiddenfolio=nikko-pc,openany,fontsize=10pt,baselineskip=15.4pt,line_length=40zw,number_of_lines=35,head_space=30mm,headsep=10mm,headheight=5mm,footskip=10mm"
  ],
  "sty_templates": {
    "url": "https://github.com/TechBooster/ReVIEW-Template/archive/2cde584d33e8a6f5e6cf647e62fb6b3123ce4dfa.zip",
    "dir": "ReVIEW-Template-2cde584d33e8a6f5e6cf647e62fb6b3123ce4dfa/articles/sty/"
  },
  "templates": ["images"],
  "catalog": {
    "PREDEF": ["preface.re"],
    "CHAPS": ["chap-placeholder.md", "chap-software-design.md", "chap-ui-design.md"],
    "POSTDEF": ["contributors.re", "postscript.re"]
  }
}
```

これはちょうど先日リポジトリを作成した[ワンストップ！アプリケーションを開発しよう](https://github.com/onestop-techbook/app-dev)で使っている設定ファイルです。ちなみにまだリポジトリを作ったばかりでREADMEの修正などもまだですが、執筆者を絶賛募集中です。

`bookname`から`texdocumentclass`まではRe:VIEWの`config.yml`に書かれている内容です。

`sty_templates`は、Re:VIEWで使われるLaTeXのstyマクロのテンプレート指定です（ややこしい）。標準で使われるTechBooster様のReVIEW-TemplateのGitHubでのURLとリビジョンを指定しています。

男気のある人はmasterブランチをそのまま使ってもいいでしょう。ただしその場合は、テンプレートのアップデートの影響を受けてしまうので、URLの指定に関しては注意深く行った方がいいでしょう。

ただTeXは大体難儀なヤツで度々執筆者を悩ませているため、アップデートはなるべくした方がいいので、原稿の余裕があるタイミングでバージョン調査をしておくべきでしょう。

`templates`は、Re:VIEWでコンパイルするときに必要なファイルのあるディレクトリを指定します。このディレクトリはそのまま`.review`内にコピーされるため、参照する画像ファイルやTeXの独自マクロなどをコピーするといいでしょう。

`catalog`は、Re:VIEWのcatalog.ymlの設定そのままです。ここでは、`preface.re`というRe:VIEWファイルと`chap-placeholder.md`というMarkdownの双方のファイルが指定されています。

`.re`ファイルはそのまま`.review`ディレクトリにコピーされ、`.md`はMarkdownからRe:VIEW形式に変換されて`.review`ディレクトリに吐き出されます。

### easybooksにおけるMarkdown記法

ひとまず、https://github.com/onestop-techbook/app-dev/blob/master/chap-easybooks.md をご覧ください。今後、あれこれ追記していく予定です。

[Re:VIEWチートシート](https://gist.github.com/erukiti/c4e3189dda179a0f0b73299fb5787838)のeasybooksバージョンについても作成予定です。

### どうやって実現しているか？

JavaScriptでMarkdownを操作するときの定番パッケージが`remark`と`@types/mdast`および`unified`です。

`unified`は、テキストをAST（抽象構文木）で扱う汎用的な仕組みで、`remark`は、それを使ったMarkdownプラグインです。また`@types/mdast`は`remark`で使われているAST表現をTypeScriptの型で定義したものです。

大体のソフトが`remark`を使っているため互換性も高く、それなりに安全といえるでしょう。また、様々な拡張表現も利用可能です。

easybooksでは、Re:VIEWの`unified`プラグインを作成して変換をしています。正確には、`unified`のプラグインのうち、Re:VIEWへの書き出しの機能のみを実装したものです。

今回の記事は本を書くのがメインであるため、それ以上の説明は省略しますが、興味のある方は是非 easybooks のリポジトリをご覧ください。

### 今後の予定

easybooksは、筆者が使う機能を中心に実装しているため、Re:VIEWのフル機能を実装できているわけではありません。最終的にはフル機能対応を予定しています。

また、`unified`のRe:VIEWプラグインのうち、読み込みに関しても対応したいと考えています。

他にも書籍作成で便利な機能をあれこれ考えていますが、ちょうど今は、9月22日の技術書典7に向けて本を書いているところなので、そちらを優先しつつ、様々な機能を実装したいと考えています。

* QRコード生成
* [Markdown Preview Enhancedで対応してるシーケンス図](https://shd101wyy.github.io/markdown-preview-enhanced/#/diagrams)を直接記述できるようにする
* Dropboxへのデプロイ
* 画像をいい感じに変換する
* サンプルコードをいい感じに処理する
* ワンバイナリ提供

## 告知

easybooksを使って書いた、Effective React Hooks は、[Effective React Hooks \- 東京ラビットハウス \- BOOTH](https://tk-rabbit-house.booth.pm/items/1477000) にて、電子版を頒布中です。

ちなみに一部未完成な部分もあり、アップデート予定です。

技術書典7では、Effective React Hooks 第二版、（間に合えば）TypeScriptでクリーンアーキテクチャ本、を予定しています。

# easybooksとは

Re:VIEWフォーマット（`*.re`）およびMarkdown（`*.md`）で書かれた原稿を
まとめてコンパイルするプログラムです。

## 使い方

設定ファイルをJSONで記述して easybooksを起動するとPDF作成まで行います。

```json
{
  "bookname": "example-book",
  "booktitle": "Example Book",
  "aut": ["なまえ"],
  "language": "ja",
  "toc": true,
  "rights": "copyrights",
  "colophon": false,
  "history": [["発行日"]],
  "prt": "印刷所",
  "pbl": "サークル名",
  "secnolevel": 3,
  "titlepage": false,
  "review_version": 3.0,
  "texstyle": ["reviewmacro"],
  "texdocumentclass": [
    "review-jsbook",
    "media=ebook,paper=a5,serial_pagination=true,hiddenfolio=nikko-pc,openany,fontsize=10pt,baselineskip=15pt,line_length=40zw,number_of_lines=33,head_space=14mm,headsep=3mm,headheight=5mm,footskip=10mm"
  ],
  "sty_templates": {
    "url": "https://github.com/TechBooster/ReVIEW-Template/archive/2cde584d33e8a6f5e6cf647e62fb6b3123ce4dfa.zip",
    "dir": "ReVIEW-Template-2cde584d33e8a6f5e6cf647e62fb6b3123ce4dfa/articles/sty/"
  },
  "templates": ["images"],
  "catalog": {
    "CHAPS": ["about-easybooks.md", "sample.re"]
  }
}
```

折りたたみ関連はいまんところ、対応してません！！！！誰か対応して

このJSONで設定する項目は、Re:VIEWのconfig.ymlと同じ内容 + easybooks 専用の設定です。

|設定項目|設定内容|
|--------|--------|
|sty_templates|`url`からzipをダウンロードして、`dir`以下をTeX styとして利用します。|
|templates|画像や自分のカスタムstyファイルなどのあるディレクトリを指定します|
|catalog|Re:VIEWの`catalog.yml`に設定する項目をそのまま設定します|

```sh
$ npm i easybooks
$ easybooks example-book.json
```

## 動作条件

* RubyおよびRe:VIEWをインストールしていること
* TeXをインストールしていること
* 多分、Node.jsの最新版入れないとだめかも

## Markdownの書き方

FIXME: がんばって書く

### セクションとか

```md
### セクションとか

#### [column] コラム
#### [/column] コラム閉じる

## [notoc] ToCに出力しない（前書きとか）
```

### リスト

* ほげ
* ふが

```md
* ほげ
* ふが
```

### 表

|ひょう|ひょー|
|------|------|
|hoge|ほげ|
|fuga|ふが|

```md {caption="GFM table"}
|ひょう|ひょー|
|------|------|
|hoge|ほげ|
|fuga|ふが|
```

| Left-aligned | Center-aligned | Right-aligned |
| :---         |     :---:      |          ---: |
| git status   | git status     | git status    |
| git diff     | git diff       | git diff      |

```md caption={"left/center/right align"}
| Left-aligned | Center-aligned | Right-aligned |
| :---         |     :---:      |          ---: |
| git status   | git status     | git status    |
| git diff     | git diff       | git diff      |



### コード

```sh
$ yarn add easybooks
```

````md
```sh
$ yarn add easybooks
```
````

```js {caption="JavaScriptなコード"}
console.log('hoge')
```

````md
```js {caption="JavaScriptなコード"}
console.log('hoge')
```
````

```ts {id="typescript" caption="TypeScriptなコード"}
console.log('hoge')
```

本文からの参照は[list:typescript]で。

````md
```ts {id="typescript" caption="TypeScriptなコード"}
console.log('hoge')
```

本文からの参照は[list:typescript]で。
````

### 脚注

```md
ほげほげします[^hoge]。

[^hoge]: hogeはほげです。
```

ほげほげします[^hoge]。

[^hoge]: hogeはほげです。


### 画像

```md
![いちご](strawberries-4330211_640)
```

![いちご](strawberries-4330211_640)

* https://pixabay.com/ja/photos/%E3%82%A4%E3%83%81%E3%82%B4-%E3%83%95%E3%83%AB%E3%83%BC%E3%83%84-%E9%A3%9F%E5%93%81-%E9%A3%9F%E3%81%B9%E3%82%8B-4330211/

### コメント

```md
<!--
コメント！
-->
```

<!--
コメント！
-->

