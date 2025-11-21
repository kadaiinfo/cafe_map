import os
import re

target_file = "../cafe_map_backend/update_media_urls.py"

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update __init__ to include token file and load logic
init_pattern = r"self\.instagram_posts_file = \"instagram_posts\.json\""
init_replacement = """self.instagram_posts_file = "instagram_posts.json"
        self.instagram_token_file = "instagram_token.json"
        
        # トークンファイルがあればそこから読み込む
        if os.path.exists(self.instagram_token_file):
            try:
                with open(self.instagram_token_file, 'r', encoding='utf-8') as f:
                    token_data = json.load(f)
                    self.ACCESS_TOKEN = token_data.get('access_token', self.ACCESS_TOKEN)
                    logger.info("instagram_token.json からトークンを読み込みました")
            except Exception as e:
                logger.warning(f"トークンファイル読み込みエラー: {e}")"""

content = content.replace('self.instagram_posts_file = "instagram_posts.json"', init_replacement)

# 2. Add refresh_access_token method
refresh_method = """
    def refresh_access_token(self) -> None:
        \"\"\"アクセストークンを更新（60日延長）\"\"\"
        logger.info("アクセストークンの更新チェック開始")
        
        refresh_url = f"https://{self.HOST}/refresh_access_token"
        params = {
            "grant_type": "ig_refresh_token",
            "access_token": self.ACCESS_TOKEN
        }
        
        try:
            resp = requests.get(refresh_url, params=params)
            payload = resp.json()
            
            if "access_token" in payload:
                new_token = payload["access_token"]
                expires_in = payload.get("expires_in", 0)
                
                # トークンが更新された場合のみ保存
                if new_token != self.ACCESS_TOKEN:
                    self.ACCESS_TOKEN = new_token
                    logger.info(f"アクセストークンを更新しました。有効期限: {expires_in}秒")
                    
                    # ファイルに保存
                    with open(self.instagram_token_file, 'w', encoding='utf-8') as f:
                        json.dump({
                            "access_token": new_token,
                            "updated_at": datetime.now().isoformat(),
                            "expires_in": expires_in
                        }, f, indent=2)
                    logger.info(f"新しいトークンを {self.instagram_token_file} に保存しました")
                else:
                    logger.info("アクセストークンはまだ有効です（変更なし）")
            elif "error" in payload:
                logger.warning(f"トークン更新エラー: {payload['error'].get('message')}")
                # エラーでも処理は続行（古いトークンで試行）
            
        except Exception as e:
            logger.error(f"トークン更新処理中にエラー: {e}")
"""

# Insert refresh_method before fetch_instagram_data
content = content.replace('    def fetch_instagram_data(self) -> List[Dict]:', refresh_method + '\n    def fetch_instagram_data(self) -> List[Dict]:')

# 3. Call refresh_access_token in run method
run_pattern = r"# 1\. Instagram APIからデータ取得"
run_replacement = """# 0. アクセストークンを更新
            self.refresh_access_token()
            
            # 1. Instagram APIからデータ取得"""

content = content.replace("# 1. Instagram APIからデータ取得", run_replacement)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated update_media_urls.py")
