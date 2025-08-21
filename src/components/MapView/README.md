# MapView コンポーネント

地図表示とマーカー管理を担当するメインコンポーネントです。

## 📁 ファイル構成

```
MapView/
├── MapView.tsx          # メインコンポーネント
├── MapView.css          # スタイル定義
├── CafeMarker.ts        # マーカー要素生成
├── CafeMarker.css       # マーカースタイル
├── utils/               # ヘルパー関数群
│   ├── mapState.ts      # 地図状態の永続化
│   ├── visibleCafes.ts  # 表示範囲フィルタリング
│   ├── popupManager.ts  # ポップアップ管理
│   ├── mapPosition.ts   # 位置計算とカフェ選択
│   ├── markerManager.ts # マーカーの表示/更新制御
│   └── searchHandler.ts # 検索処理
└── README.md           # このファイル
```

## 🔧 リファクタリングの目的

元々450行以上あった`MapView.tsx`から複雑なロジックを分離し、以下を実現：

- **可読性の向上** - メインコンポーネントが240行程度に削減
- **責任の分離** - 各機能が独立したファイルで管理
- **再利用性** - ヘルパー関数が他のコンポーネントでも使用可能
- **テスト容易性** - 個別機能のユニットテストが可能
- **保守性** - 修正時の影響範囲を限定

## 📄 各ファイルの役割

### MapView.tsx
**役割**: メインコンポーネント、状態管理、UIレンダリング

- 地図の初期化とMapLibre GLの設定
- React状態管理（カフェデータ、選択状態、ズーム等）
- useEffectによるライフサイクル管理
- イベントハンドラーの定義
- 子コンポーネント（Information、Search等）の配置

**主要な状態**:
- `allCafes`: 全カフェデータ
- `selected`: 選択中のカフェ
- `currentZoom`: 現在のズームレベル
- `mapCenter`: 地図中心位置

### utils/mapState.ts
**役割**: 地図状態の永続化

```typescript
export const saveMapState = (center: [number, number], zoom: number)
export const loadMapState = (): MapState | null
```

- localStorage への地図位置・ズームレベル保存
- ページリロード時の地図状態復元
- 24時間の有効期限管理

### utils/visibleCafes.ts
**役割**: 表示範囲内のカフェフィルタリング

```typescript
export const getVisibleCafes = (
  map: maplibregl.Map | null,
  allCafes: Cafe[],
  cafeDataLoaded: boolean
): Cafe[]
```

- 地図の表示範囲（bounds）内のカフェを抽出
- パフォーマンス最適化（画面外マーカーの除外）

### utils/popupManager.ts
**役割**: ポップアップの表示・非表示制御

```typescript
export const showPopup = (cafe: Cafe, map: maplibregl.Map | null, currentPopupRef: React.MutableRefObject<maplibregl.Popup | null>)
export const hidePopup = (currentPopupRef: React.MutableRefObject<maplibregl.Popup | null>)
```

- マーカー選択時のポップアップ表示
- 既存ポップアップの削除処理
- DOM更新の遅延処理とデバッグログ

### utils/mapPosition.ts
**役割**: 地図位置計算とカフェ選択処理

```typescript
export const calculateMapPosition = (cafe: Cafe, map: maplibregl.Map, isMobile: boolean, maintainZoom?: boolean)
export const handleCafeSelection = (cafe: Cafe, map: maplibregl.Map | null, setSelected: (cafe: Cafe) => void, maintainZoom?: boolean)
```

- **レスポンシブ対応**: モバイル/デスクトップで異なる位置計算
- **デスクトップ**: カフェを画面左側1/4の位置に配置（Informationパネル考慮）
- **モバイル**: カフェを画面中央に配置
- **ズーム維持**: マーカークリック時は現在のズーム維持、検索時はズーム17

### utils/markerManager.ts
**役割**: マーカーの生成・更新・削除制御

```typescript
export const updateMarkersWithZoom = (
  zoom: number,
  map: maplibregl.Map | null,
  cafeDataLoaded: boolean,
  allCafes: Cafe[],
  ZOOM_THRESHOLD: number,
  markersRef: React.MutableRefObject<Map<string, maplibregl.Marker>>,
  setSelected: (cafe: Cafe) => void
)
```

- **ズーム閾値制御**: ズーム14以下ではマーカー非表示
- **表示範囲最適化**: 画面内マーカーのみ表示
- **マーカー管理**: 追加・削除の効率的な制御
- **イベント処理**: マーカークリック時のカフェ選択
- **レイヤリング**: 最新カフェ情報を前面表示（reverse処理）

### utils/searchHandler.ts
**役割**: 検索機能の処理

```typescript
export const handleSearch = (
  query: string,
  searchCafes: (query: string) => Promise<Cafe[]>,
  map: maplibregl.Map | null,
  mapLoaded: boolean,
  setSelected: (cafe: Cafe | null) => void,
  updateMarkers: () => void
)
```

- 検索クエリの処理
- 検索結果の最初のカフェへの自動移動
- 検索時のズームレベル設定（固定17）
- マーカー更新のトリガー

## 🔄 データフロー

```
MapView.tsx
    ↓ (地図移動/ズーム)
mapState.ts → localStorage保存
    ↓
markerManager.ts → visibleCafes.ts → 表示マーカーを計算
    ↓
CafeMarker.ts → マーカー要素生成
    ↓ (マーカークリック)
mapPosition.ts → 位置計算 → 地図移動
    ↓
popupManager.ts → ポップアップ表示
    ↓
Information.tsx → カフェ詳細表示
```
