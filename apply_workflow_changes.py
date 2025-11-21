target_file = "../cafe_map_backend/.github/workflows/update-media-urls.yml"

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Add instagram_token.json to git add command
old_cmd = "git add cafe_data_kv.json instagram_posts.json"
new_cmd = "git add cafe_data_kv.json instagram_posts.json instagram_token.json"

if old_cmd in content:
    content = content.replace(old_cmd, new_cmd)
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully updated update-media-urls.yml")
else:
    print("Target string not found in update-media-urls.yml")
