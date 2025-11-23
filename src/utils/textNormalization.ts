/**
 * テキスト正規化ユーティリティ
 * 検索時の表記揺れ（ひらがな/カタカナ、全角/半角）を吸収するために使用します。
 */

export const normalizeText = (text: string): string => {
    if (!text) return "";

    return text
        // 全角英数字を半角に変換
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        })
        // ひらがなをカタカナに変換
        .replace(/[\u3041-\u3096]/g, (s) => {
            return String.fromCharCode(s.charCodeAt(0) + 0x60);
        })
        // 大文字を小文字に変換
        .toLowerCase();
};
