// src/features/map/components/information.tsx
import { useState, useCallback, useEffect, useRef } from "react"
import "./Information.css"
import { getCafeDetail, type Cafe, type DetailedCafe } from "../../lib/dataClient"

// Instagram埋め込みスクリプトの型定義
declare global {
    interface Window {
        instgrm?: {
            Embeds: {
                process: () => void
            }
        }
    }
}

type InformationProps = {
    cafe: Cafe
    onClose?: () => void
}

export default function Information({ cafe, onClose }: InformationProps) {
    const [detailedCafe, setDetailedCafe] = useState<DetailedCafe | null>(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const [isClosing, setIsClosing] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [hasBeenExpanded, setHasBeenExpanded] = useState(false)
    const infoDetailRef = useRef<HTMLDivElement>(null)
    const embedContainerRef = useRef<HTMLDivElement>(null)

    // 詳細データを遅延読み込み
    useEffect(() => {
        if (cafe) {
            // 新しいカフェが選択されたら詳細データを取得
            const loadDetail = async () => {
                try {
                    const detail = await getCafeDetail(cafe.id)
                    setDetailedCafe(detail)
                } catch (error) {
                    console.error('Failed to load cafe detail:', error)
                    setDetailedCafe(null)
                }
            }
            loadDetail()

            // 展開状態をリセット(モバイルの場合)
            setIsExpanded(false)
            setIsClosing(false)
            setHasBeenExpanded(false)

            // 新しいカフェが選択された時のスクロールリセット
            if (infoDetailRef.current) {
                infoDetailRef.current.scrollTop = 0
            }
        }
    }, [cafe])

    // Instagram埋め込みスクリプトを読み込む
    useEffect(() => {
        // スクリプトが既に読み込まれているかチェック
        if (!document.querySelector('script[src="//www.instagram.com/embed.js"]')) {
            const script = document.createElement('script')
            script.src = '//www.instagram.com/embed.js'
            script.async = true
            document.body.appendChild(script)
        }
    }, [])

    // 店舗が変更されたらInstagram埋め込みを再処理
    useEffect(() => {
        if (detailedCafe?.permalink && window.instgrm) {
            // 少し遅延させてから埋め込みを処理(DOMの更新を待つ)
            const timer = setTimeout(() => {
                if (window.instgrm) {
                    window.instgrm.Embeds.process()
                }
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [detailedCafe])



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
            setHasBeenExpanded(true)

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
            {/* スマホ版:下部に固定表示される簡易情報 */}
            <div className="info__preview" onClick={handleToggle}>
                {!hasBeenExpanded && <img src="/tap.png" className="info__preview-tap" alt="tap" />}
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
                    {/* Instagram埋め込み */}
                    {detailedCafe?.permalink ? (
                        <div
                            key={detailedCafe.id}
                            className="info__instagram-embed"
                            ref={embedContainerRef}
                        >
                            <blockquote
                                className="instagram-media"
                                data-instgrm-captioned
                                data-instgrm-permalink={detailedCafe.permalink}
                                data-instgrm-version="14"
                                style={{
                                    background: '#FFF',
                                    border: 0,
                                    borderRadius: '3px',
                                    boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                                    margin: '1px auto',
                                    maxWidth: '540px',
                                    minWidth: '326px',
                                    padding: 0,
                                    width: 'calc(100% - 2px)'
                                }}
                            >
                            </blockquote>
                        </div>
                    ) : imgSrc && (
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
                    <div className="info__details">
                        <h4 className="info__section-title">基本情報</h4>
                        <dl className="info__details-list">
                            <div className="info__detail-row">
                                <dt>店名</dt>
                                <dd>
                                    <div className="info__text-with-copy">
                                        <span>{cafe.store_name ?? "—"}</span>
                                        {cafe.store_name && <CopyButton text={cafe.store_name} />}
                                    </div>
                                </dd>
                            </div>
                            <div className="info__detail-row">
                                <dt>住所</dt>
                                <dd>
                                    <div className="info__text-with-copy">
                                        <span>{cafe.address ?? "—"}</span>
                                        {cafe.address && <CopyButton text={cafe.address} />}
                                    </div>
                                </dd>
                            </div>
                            <div className="info__detail-row">
                                <dt>営業時間</dt>
                                <dd>{detailedCafe?.opening_hours ?? "店舗に直接お問い合わせください"}</dd>
                            </div>
                            <div className="info__detail-row">
                                <dt>定休日</dt>
                                <dd>{detailedCafe?.regular_holiday ?? "店舗に直接お問い合わせください"}</dd>
                            </div>
                        </dl>
                        <p className="info__note">
                            ※上記は取材時の情報に基づきます。正確な情報は店舗に直接お問い合わせください。
                            {detailedCafe?.timestamp && (
                                <span>
                                    (取材日:{new Date(detailedCafe.timestamp).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')})
                                </span>
                            )}

                            <a
                                className="info__correction-link"
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://kadaiinfo.com/contact"
                            >
                                情報修正の依頼はこちら
                            </a>
                        </p>
                    </div>



                </div>
            </div>
        </aside >
    )
}

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <button className="info__copy-button" onClick={handleCopy} aria-label="コピー">
            {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            )}
        </button>
    );
};
