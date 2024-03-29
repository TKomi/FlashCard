# FlashCard(仮)

FlashCardはWebブラウザ上で動作する、登録不要で軽量な単語帳アプリです。
ReactとTypeScriptを使って開発されています。
[別リポジトリ](https://github.com/TKomi/FlashCard-Data)で管理されている単語データを参照しながら動作します。

Notionのプロジェクトページは[こちら](https://royal-lifter-ad9.notion.site/FlashCard-085a4d2bec714be69aa161dc9bd4e183)です。

## インストール方法

FlashCardをセットアップするには、以下のステップに従ってください。

1. 事前にNode.jsとnpmをインストールします。
2. このリポジトリをクローンします。
3. `npm install` コマンドを実行して依存パッケージをインストールします。

## 利用方法

ローカルでFlashCardを起動するには、以下のコマンドを実行してください。

```bash
npm start
```

起動後、表示されるURLにお好みのウェブブラウザからアクセスします。

デモサイトは[こちら](https://flash-card.sumomo.ne.jp/)です。

## 主な機能

- **問題セットの一覧表示**: 複数の問題セットから選択し、学習を開始できます。
- **学習画面**: 単語と4つの選択肢を提示し、正しい和訳を選びます。進捗はバーで表示されます。
- **リザルト画面**: 学習結果の確認と、間違えた単語やチェックした単語の復習が可能です。
- **データ管理**: 学習の進捗はLocalStorageに保存され、単語はユーザーの学習履歴に基づいてステータスが更新されます。

## コントリビュート

バグや機能改善のためのフィードバックを歓迎します。デモサイトでの体験をもとにイシュー報告をしていただければ幸いです。

### 単語データに関するコントリビュート

単語データ(問題や解答)は[別リポジトリ](https://github.com/TKomi/FlashCard-Data)で管理していますので、
お手数ですがそちらからご報告をお願いいたします。

## ライセンス

本プロジェクトはAll Rights Reservedであり、ソースコードはGitHubで公開されていますが、著者の許可なく商用利用や再配布を行うことは禁止されています。 (→ [LICENSE](./LICENSE.md))

[別リポジトリ](https://github.com/TKomi/FlashCard-Data)で管理している単語データベースのライセンスは、当該リポジトリのページをご確認ください。

## 著者

- TomK

## 依存関係

このプロジェクトは以下のオープンソースソフトウェアを使用しています。

| ライブラリ名 | バージョン | ライセンス                                             |
|--------------|------------|--------------------------------------------------------|
| React        | ^18.2      | Copyright (c) Meta Platforms, Inc. and affiliates. <br> [MIT License](https://opensource.org/license/mit/)      |
| UIKit        | ^3.18      | Copyright (c) 2013-2020 YOOtheme GmbH, getuikit.com <br> [MIT License](https://opensource.org/license/mit/)      |

各ライブラリの著作権者に感謝します。

## バージョン情報

Notionのプロジェクトページ内の[リリースノート](https://royal-lifter-ad9.notion.site/a40312265dd34aa9a1da308889366e5c?v=7cb46ff17f5a44bc937720bf76c557e3)をご確認ください。

## お問い合わせ

何かご不明な点がありましたら、以下の連絡先までお問い合わせください。

- Author(TomK): (t.komi2580○gmail.com)

