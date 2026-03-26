import fs from 'fs';
import path from 'path';
import axios from 'axios';

// --- CONFIGURATION ---
const SITE_URL = 'https://dev.vismaad.com/estore-frontend/'; // Your React frontend URL
const API_BASE = 'https://dev.vismaad.com/estore/wp-json/'; // Your WP backend URL
const OUTPUT_FILE = './public/sitemap.xml';

// Define your static routes
const staticRoutes = [
  '',
  'about',
  'products',
  'contact',
  'login',
  'account'
];

async function generateSitemap() {
  console.log('🚀 Generating sitemap...');

  try {
    const urls = [];

    // 1. Add static routes
    staticRoutes.forEach(route => {
      urls.push(`${SITE_URL}${route}`);
    });

    // 2. Fetch products from WordPress
    console.log('📦 Fetching products from backend...');
    const response = await axios.get(`${API_BASE}wc/store/products`);

    if (response.data && Array.isArray(response.data)) {
      response.data.forEach(product => {
        // Assuming your product route is /product/:id
        urls.push(`${SITE_URL}product/${product.id}`);
      });
      console.log(`✅ Found ${response.data.length} products.`);
    }

    // 3. Create XML content
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const xmlFooter = '\n</urlset>';

    const xmlBody = urls.map(url => `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === SITE_URL ? '1.0' : '0.8'}</priority>
  </url>`).join('');

    const finalXml = xmlHeader + xmlBody + xmlFooter;

    // 4. Save to public directory
    fs.writeFileSync(OUTPUT_FILE, finalXml);
    console.log(`✨ Sitemap successfully created: ${OUTPUT_FILE}`);

    // Also update robots.txt to point to sitemap
    const robotsPath = './public/robots.txt';
    let robotsContent = '';
    if (fs.existsSync(robotsPath)) {
      robotsContent = fs.readFileSync(robotsPath, 'utf8');
      if (!robotsContent.includes('Sitemap:')) {
        robotsContent += `\nSitemap: ${SITE_URL}sitemap.xml\n`;
        fs.writeFileSync(robotsPath, robotsContent);
        console.log('📝 Updated robots.txt with sitemap location.');
      }
    }

  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
  }
}

generateSitemap();
