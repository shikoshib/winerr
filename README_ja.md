<div style="text-align: center">
  <a href="https://github.com/shikoshib/winerr/blob/main/README.md">English</a> | <a href="https://github.com/shikoshib/winerr/blob/main/README_ru.md">Русский</a> | <a href="https://github.com/shikoshib/winerr/blob/main/README_uk.md">Українська</a> | <strong>日本語</strong>
</div>

# winerr（ウィネール）
Windowsエラーメッセージの高速で正確な生成ツールです。HTML5 Canvasを使って作成されました。

ℹ️ 根本的には、winerrはただWindowsエラーメッセージに似せて作られた、あらかじめ用意されたルールと計算式に基づく画像生成ツールです。生成されたエラーメッセージ画像は、必ずしもWindowsの実際なエラーメッセージの完全な再現ではありません。尚且つ、実装の複雑さ（アラビア語やヘブライ語などの右から左へのテキストレンダリング、ClearTypeの見た目の完全な再現、フォントのカーニングなど）を理由に、実装できないまたは実装する予定のない機能もありますので、その点もご了承ください。

## インストール仕方（Windows）
1. [Node.js](https://nodejs.org/en/download)が既にインストールされていない場合、ダウンロードしてください。
2. すべてのリポジトリのファイルを展開してください。
3. 展開したフォルダーをコマンドプロンプト（`cmd`）かPowerShellを使って開いてください。
4. `npm i`を実行してすべてのパッケージをインストールします。
5. インストール処理の後、`npm start`を実行してください。
6. スプライトシートをビルドが完了するまで待ってください (コンソールに「✅ BUILD DONE」と表示されます)。
7. http://localhost:3004/ を開いてください。

## インストール仕方（Linux）
```bash
# Node.jsとGitをインストール
sudo apt update
sudo apt install nodejs npm git

# このリポジトリをダウンロード
git clone https://github.com/shikoshib/winerr

# このリポジトリのディレクトリを開く
cd winerr

# すべてのパッケージをインストール
npm i

# 実行
npm start
```

## クレジット

* shikoshib - ウェブデザイン、プログラミング、アセット
* [NickHammerich](https://github.com/nickhammerich) - アイコン、アセット、テスト
* [DmytroYastrubiv](https://github.com/DimaYastrebov) - プログラミング、テスト
* Pugum - アセット

## ライセンス
[ISC](https://github.com/shikoshib/winerr/blob/main/LICENSE)

---
[翻訳者一覧](https://github.com/shikoshib/winerr/tree/main/winerr-lang)