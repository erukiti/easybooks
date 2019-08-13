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

