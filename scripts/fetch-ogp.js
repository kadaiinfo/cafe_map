import fs from 'fs';
import https from 'https';

const articlesUrls = JSON.parse(fs.readFileSync('./src/data/articles.json', 'utf-8'));

async function fetchOGP(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const ogTitle = data.match(/<meta property="og:title" content="([^"]+)"/)?.[1] || '';
        const ogImage = data.match(/<meta property="og:image" content="([^"]+)"/)?.[1] || '';

        // production-os-assets バケットの画像を避けるため、記事内の画像も取得
        let fallbackImage = '';
        if (ogImage.includes('production-os-assets')) {
          const imgMatch = data.match(/https:\/\/storage\.googleapis\.com\/studio-cms-assets\/[^"]+\.(?:jpg|png|webp)/);
          fallbackImage = imgMatch ? imgMatch[0] : '';
        }

        resolve({
          url,
          title: ogTitle,
          image: fallbackImage || ogImage,
        });
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching OGP information...');
  const articles = [];

  for (const url of articlesUrls) {
    try {
      console.log(`Fetching: ${url}`);
      const ogp = await fetchOGP(url);
      articles.push(ogp);
      console.log(`✓ ${ogp.title}`);
    } catch (error) {
      console.error(`✗ Failed to fetch ${url}:`, error.message);
    }
  }

  fs.writeFileSync(
    './src/data/articles-ogp.json',
    JSON.stringify(articles, null, 2)
  );

  console.log(`\nSuccessfully fetched ${articles.length} articles!`);
  console.log('Saved to src/data/articles-ogp.json');
}

main();
