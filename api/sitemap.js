const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  try {
    // 1. Fetch Blogs Data
    const blogsSnapshot = await db.collection('blogs').get();
    let blogsXml = '';
    blogsSnapshot.forEach(doc => {
      const data = doc.data();
      const slug = data.slug || doc.id; 
      blogsXml += '\n  <url>\n    <loc>https://zedlinker.store' + slug + '</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>';
    });

    // 2. Fetch User Links (WhatsApp/Telegram Groups) Data
    const linksSnapshot = await db.collection('links').get();
    let linksXml = '';
    linksSnapshot.forEach(doc => {
      linksXml += '\n  <url>\n    <loc>https://zedlinker.store' + doc.id + '</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>';
    });

    // 3. Fetch Products Data
    const productsSnapshot = await db.collection('products').get();
    let productsXml = '';
    productsSnapshot.forEach(doc => {
      productsXml += '\n  <url>\n    <loc>https://zedlinker.store' + doc.id + '</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>';
    });

    // 4. Main Static URLs
    const staticUrls = '\n  <url>\n    <loc>https://zedlinker.store</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://zedlinker.storeindexing.html</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n  <url>\n    <loc>https://zedlinker.storeproduct.html</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>';

    // Combine All XML
    const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://sitemaps.org">' + staticUrls + blogsXml + linksXml + productsXml + '\n</urlset>';

    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating sitemap');
  }
};
      
