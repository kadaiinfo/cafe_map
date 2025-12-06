# おすすめ記事の管理

このフォルダには、MixerPanel（設定画面）に表示されるおすすめ記事のデータが含まれています。

## 記事の更新方法（簡単！）

`articles.json` ファイルに記事のURLを追加するだけで、タイトルと画像は自動取得されます。

### 1. articles.json を編集

URLの配列として記事を管理します：

```json
[
  "https://kadaiinfo.com/posts/kagoshima_panyasan",
  "https://kadaiinfo.com/posts/kagoshima_kissatenn",
  "https://kadaiinfo.com/posts/riceball_kagoshima"
]
```

### 2. OGP情報を取得

記事を追加・削除・並び替えたら、以下のコマンドを実行してOGP情報（タイトル・画像）を取得します：

```bash
npm run fetch-ogp
```

これで `articles-ogp.json` が自動生成され、アプリに反映されます。

## ファイル説明

- **articles.json**: 記事URLのリスト（これを編集する）
- **articles-ogp.json**: OGP情報を含む記事データ（自動生成、編集不要）

## 記事の追加

1. `articles.json`にURLを追加
2. `npm run fetch-ogp`を実行
3. 完了！

## 記事の削除

1. `articles.json`からURLを削除
2. `npm run fetch-ogp`を実行
3. 完了！

## 記事の並び替え

1. `articles.json`内のURLの順序を変更（最初のURLが左上に表示されます）
2. `npm run fetch-ogp`を実行
3. 完了！

## 注意事項

- `articles-ogp.json`は手動で編集しないでください（`npm run fetch-ogp`で上書きされます）
- `production-os-assets`バケットの画像は自動的に`studio-cms-assets`の画像に置き換えられます
- 推奨記事数: 2〜6記事
- PC: 2列グリッド表示
- モバイル: 1列表示
