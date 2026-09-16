export default async function handler(req, res) {
  try {
    const proj = "zedlinker-55555";
    const fetchCol = async (col) => {
      const r = await fetch(`https://firestore.googleapis.com/v1/projects/${proj}/databases/(default)/documents/${col}`);
      if (!r.ok) return [];
      const d = await r.json();
      return d.documents || [];
    };

    const getField = (doc, fieldName) => {
      const f = doc.fields?.[fieldName];
      if (!f) return null;
      return f.stringValue || null;
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += ` <url><loc>https://www.zedlinker.store/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
    xml += ` <url><loc>https://www.zedlinker.store/blog</loc><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;

    // 1. BLOGS
    const blogs = await fetchCol('blogs');
    blogs.forEach(doc => {
      const slug = getField(doc, 'slug') || doc.name.split('/').pop();
      xml += ` <url><loc>https://www.zedlinker.store/blog/${slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    });

    // 2. LINKS (Whatsapp/Telegram)
    const links = await fetchCol('links');
    links.forEach(doc => {
      const slug = getField(doc, 'slug') || doc.name.split('/').pop();
      xml += ` <url><loc>https://www.zedlinker.store/link/${slug}</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
    });

    // 3. PRODUCTS
    const products = await fetchCol('products');
    products.forEach(doc => {
      const slug = getField(doc, 'slug') || doc.name.split('/').pop();
      xml += ` <url><loc>https://www.zedlinker.store/product/${slug}</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
    });

    // 4. ADS (agar tumhare paas ads collection hai)
    const ads = await fetchCol('ads');
    ads.forEach(doc => {
      const slug = getField(doc, 'slug') || doc.name.split('/').pop();
      xml += ` <url><loc>https://www.zedlinker.store/ad/${slug}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>\n`;
    });

    xml += `</urlset>`;
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(xml);
  } catch (e) {
    res.status(500).send("Error: " + e.message);
  }
                }
