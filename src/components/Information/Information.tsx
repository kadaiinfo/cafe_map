// src/features/map/components/information.tsx
import "./Information.css"
type CafePost = {
    id: string
    store_name?: string | null
    address?: string | null
    caption?: string | null
    media_url?: string | null
    thumbnail_url?: string | null   // VIDEO用サムネがある場合
    permalink?: string | null
    username?: string | null
    lat: number
    lng: number
    media_type?: "IMAGE" | "VIDEO" | string
    like_count?: number
    comments_count?: number
    timestamp?: string
  }
  
  type InformationProps = {
    cafe: CafePost | null | undefined
    onClose?: () => void
  }
  
  export default function Information({ cafe, onClose }: InformationProps) {
    // 何も選択されていないときの表示
    if (!cafe) {
      return (
        <aside className="info">
          <div className="info__header">
            <strong>スポット情報</strong>
          </div>
          <div className="info__body">
            マーカーをクリックすると詳細を表示します．
          </div>
        </aside>
      )
    }
  
    // 画像は VIDEO の場合は thumbnail を優先
    const imgSrc =
      (cafe.media_type === "VIDEO" ? cafe.thumbnail_url : cafe.media_url) ?? ""
  
    return (
      <aside className="info">
        <div className="info__header">
          <strong>{cafe.store_name ?? "店舗"}</strong>
          {onClose && (
            <button className="info__close" onClick={onClose} aria-label="閉じる">
              ×
            </button>
          )}
        </div>
  
        <div className="info__body">
          {imgSrc && (
            <img
              className="info__image"
              src={imgSrc}
              alt={cafe.store_name ?? "cafe"}
              loading="lazy"
              onError={(e) => {
                // 画像取得に失敗したら非表示にする簡易処理
                (e.currentTarget as HTMLImageElement).style.display = "none"
              }}
            />
          )}
  
          <dl className="info__list">
            <div>
              <dt>住所</dt>
              <dd>{cafe.address ?? "—"}</dd>
            </div>
          </dl>
  
          {cafe.caption && (
            <p className="info__caption">{cafe.caption}</p>
          )}
  
          {cafe.permalink && (
            <a
              className="info__link"
              href={cafe.permalink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagramで見る
            </a>
          )}
        </div>
      </aside>
    )
  }
  