import "./MixerPanel.css"

interface MixerPanelProps {
  onClose: () => void
  onShowCafeList: () => void
  onAreaSelect: (lng: number, lat: number) => void
  onShowNearbyCafes: () => void
}

export default function MixerPanel({ onClose, onShowCafeList, onAreaSelect, onShowNearbyCafes }: MixerPanelProps) {

  const areas = [
    { id: "uptown", name: "騎射場", lng: 130.5520733, lat: 31.5692252 },
    { id: "all", name: "中央駅", lng: 130.5439322, lat: 31.5826642 },
    { id: "central", name: "天文館", lng: 130.5548586, lat: 31.5901844 },
    { id: "riverside", name: "名山", lng: 130.5582345, lat: 31.5953913 },
    { id: "downtown", name: "谷山", lng: 130.5229738, lat: 31.5298778 },
    { id: "aira", name: "姶良", lng: 130.635556, lat: 31.728611 },
    { id: "kirisima", name: "国分", lng: 130.7645666, lat: 31.7429681 },
    { id: "ibusuki", name: "指宿", lng: 130.633333, lat: 31.251111 },
    { id: "sendai", name: "川内", lng: 130.301944, lat: 31.814167 },
  ]

  const handleAreaClick = (area: typeof areas[0]) => {
    onAreaSelect(area.lng, area.lat)
    onClose() // エリア選択後にパネルを閉じる
  }

  return (

    <div className="mixer-panel">
      <div className="mixer-panel__header">
        <h2 className="mixer-panel__title">表示設定</h2>
        <button
          className="mixer-panel__close"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>
      </div>

      {/* 表示オプションセクション */}
      <div className="mixer-panel__section">
        <h3 className="mixer-panel__section-title">表示オプション</h3>
        <div className="mixer-panel__options">
          <button
            className="mixer-panel__option-button"
            onClick={onShowCafeList}
          >
            <div className="mixer-panel__option-content">
              <div className="mixer-panel__option-title">リスト表示</div>
              <div className="mixer-panel__option-desc">ご飯屋さんを一覧で表示</div>
            </div>
          </button>

          <button
            className="mixer-panel__option-button"
            onClick={onShowNearbyCafes}
          >
            <div className="mixer-panel__option-content">
              <div className="mixer-panel__option-title">近くのお店を表示</div>
              <div className="mixer-panel__option-desc">500m内のご飯屋さんを表示</div>
            </div>
          </button>
        </div>
      </div>

      <div className="mixer-panel__body">
        {/* エリア選択セクション */}
        <div className="mixer-panel__section">
          <h3 className="mixer-panel__section-title">エリアに移動</h3>

          {/* インタラクティブマップ */}
          <div className="mixer-panel__interactive-map">
            <img
              src="/information_map.png"
              alt="エリアマップ"
              className="mixer-panel__area-map"
            />

            {/* 地図上のクリック可能なエリア */}
            <button
              className="mixer-panel__map-hotspot"
              style={{ top: '1%', left: '55%', width: '20%', height: '10%' }}
              onClick={() => handleAreaClick(areas.find(a => a.id === 'aira')!)}
              title="姶良"
              aria-label="姶良エリアに移動"
            />
            <button
              className="mixer-panel__map-hotspot"
              style={{ top: '1%', left: '78%', width: '20%', height: '10%' }}
              onClick={() => handleAreaClick(areas.find(a => a.id === 'kirisima')!)}
              title="国分"
              aria-label="国分エリアに移動"
            />
            <button
              className="mixer-panel__map-hotspot"
              style={{ top: '58%', left: '30%', width: '20%', height: '10%' }}
              onClick={() => handleAreaClick(areas.find(a => a.id === 'uptown')!)}
              title="騎射場"
              aria-label="騎射場エリアに移動"
            />
            <button
              className="mixer-panel__map-hotspot"
              style={{ top: '30%', left: '20%', width: '20%', height: '10%' }}
              onClick={() => handleAreaClick(areas.find(a => a.id === 'all')!)}
              title="中央駅"
              aria-label="中央駅エリアに移動"
            />
            <button
              className="mixer-panel__map-hotspot"
              style={{ top: '20%', left: '45%', width: '20%', height: '10%' }}
              onClick={() => handleAreaClick(areas.find(a => a.id === 'central')!)}
              title="天文館"
              aria-label="天文館エリアに移動"
            />
            <button
              className="mixer-panel__map-hotspot"
              style={{ top: '13%', left: '58%', width: '20%', height: '10%' }}
              onClick={() => handleAreaClick(areas.find(a => a.id === 'riverside')!)}
              title="名山"
              aria-label="名山エリアに移動"
            />
            <button
              className="mixer-panel__map-hotspot"
              style={{ top: '89%', left: '25%', width: '20%', height: '10%' }}
              onClick={() => handleAreaClick(areas.find(a => a.id === 'downtown')!)}
              title="谷山"
              aria-label="谷山エリアに移動"
            />
            <button
              className="mixer-panel__map-hotspot"
              style={{ top: '89%', left: '50%', width: '20%', height: '10%' }}
              onClick={() => handleAreaClick(areas.find(a => a.id === 'ibusuki')!)}
              title="指宿"
              aria-label="指宿エリアに移動"
            />
            <button
              className="mixer-panel__map-hotspot"
              style={{ top: '1%', left: '1%', width: '20%', height: '10%' }}
              onClick={() => handleAreaClick(areas.find(a => a.id === 'sendai')!)}
              title="川内"
              aria-label="川内エリアに移動"
            />
          </div>
        </div>
      </div>
    </div>
  )
}