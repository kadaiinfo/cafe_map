// src/features/map/components/information.tsx
import { useState, useCallback, useEffect, useRef} from "react"
import "./Information.css"
import { getCafeDetail, type LightCafe, type DetailedCafe } from "../../lib/dataClient"
  
type InformationProps = {
    cafe: LightCafe
    onClose?: () => void
}
  
export default function Information({ cafe, onClose }: InformationProps) {
const [detailedCafe, setDetailedCafe] = useState<DetailedCafe | null>(null)
const [isExpanded, setIsExpanded] = useState(false)
const [isClosing, setIsClosing] = useState(false)
const [isMobile, setIsMobile] = useState(false)
const infoDetailRef = useRef<HTMLDivElement>(null)

// 詳細データを遅延読み込み
useEffect(() => {
    if (cafe) {
        // 新しいカフェが選択されたら詳細データを取得
        const detail = getCafeDetail(cafe.id)
        setDetailedCafe(detail)
        
        // 展開状態をリセット（モバイルの場合）
        setIsExpanded(false)
        setIsClosing(false)
        
        // 新しいカフェが選択された時のスクロールリセット
        if (infoDetailRef.current) {
            infoDetailRef.current.scrollTop = 0
        }
    }
}, [cafe])

// 画像は VIDEO の場合は thumbnail を優先
const imgSrc = detailedCafe 
    ? (detailedCafe.media_type === "VIDEO" ? detailedCafe.thumbnail_url : detailedCafe.media_url) ?? ""
    : cafe.media_url ?? ""

// 画面サイズを監視
useEffect(() => {
    const checkIsMobile = () => {
        setIsMobile(window.innerWidth <= 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => {
        window.removeEventListener('resize', checkIsMobile)
    }
}, [])

// クリックで展開/折りたたみ
const handleToggle = useCallback(() => {
    if (isClosing) return // アニメーション中は操作を無効化
    
    if (isExpanded) {
        // 閉じる際のアニメーション
        setIsClosing(true)
        // アニメーション完了後に状態を更新
        setTimeout(() => {
            setIsExpanded(false)
            setIsClosing(false)
        }, 350) // アニメーション時間に合わせる
    } else {
        // 開く際はすぐに展開
        setIsExpanded(true)
        
        // スライドを開く際にスクロールを一番上にリセット
        setTimeout(() => {
            if (infoDetailRef.current) {
                infoDetailRef.current.scrollTop = 0
                infoDetailRef.current.scrollTo(0, 0)
            }
        }, 0)
    }
}, [isExpanded, isClosing])

// 閉じるボタンの処理
const handleClose = useCallback(() => {
    if (isClosing) return // アニメーション中は操作を無効化
    
    if (isMobile) {
        // スマホ版では展開状態から折りたたみ状態に戻す
        if (isExpanded) {
            setIsClosing(true)
            setTimeout(() => {
                setIsExpanded(false)
                setIsClosing(false)
            }, 350) // アニメーション完了後に折りたたみ状態に
        }
    } else {
        // デスクトップ版では完全に閉じる
        if (onClose) {
            onClose()
        }
    }
}, [isClosing, isExpanded, isMobile, onClose])

return (
    <aside className={`info ${isExpanded ? 'info--expanded' : 'info--collapsed'} ${isClosing ? 'info--closing' : ''}`}>
        {/* スマホ版：下部に固定表示される簡易情報 */}
        <div className="info__preview" onClick={handleToggle}>
            <div className="info__preview-content">
                <h3 className="info__preview-title">{cafe.store_name ?? "—"}</h3>
                <p className="info__preview-address">{cafe.address ?? "—"}</p>
            </div>
            <div className="info__preview-arrow">
                {isExpanded || isClosing ? '▼' : '▲'}
            </div>
        </div>

        {/* 全画面表示される詳細情報 */}
        <div className="info__detail" ref={infoDetailRef}>
            <div className="info__header">
                {onClose && (
                <button className="info__close" onClick={handleClose} aria-label="閉じる">
                    {isMobile ? '▼' : '×'}
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
                    <dt>店舗名</dt>
                    <dd>{cafe.store_name ?? "—"}</dd>
                    </div>
                    <div>
                    <dt>住所</dt>
                    <dd>{cafe.address ?? "—"}</dd>
                    </div>
                </dl>

                {detailedCafe?.caption && (
                <p className="info__caption">
                  {detailedCafe.caption.split('\n').map((line, index, arr) => (
                    <span key={index}>
                      {line}
                      {index < arr.length - 1 && <br />}
                    </span>
                  ))}
                </p>
                )}

                {detailedCafe?.timestamp && (
                <p className="info__date">
                  取材日：{new Date(detailedCafe.timestamp).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')}
                </p>
                )}

                {detailedCafe?.permalink && (
                <a
                    className="info__link"
                    href={detailedCafe.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Instagramで見る
                </a>
                )}
                <a
                    className="info__link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    情報修正の依頼はこちら
                </a>
            </div>
        </div>
    </aside>
)
}
  