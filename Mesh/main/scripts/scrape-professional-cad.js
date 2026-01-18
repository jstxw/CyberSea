/**
 * PROFESSIONAL CAD MODEL SCRAPER
 * Searches and downloads high-quality military models from CAD libraries
 * Sources: GrabCAD, TurboSquid, Sketchfab, Free3D
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  outputDir: path.join(__dirname, '../downloads/professional-models'),
  sources: {
    grabcad: 'https://grabcad.com/library',
    sketchfab: 'https://sketchfab.com/search',
    free3d: 'https://free3d.com/3d-models',
    cgtrader: 'https://www.cgtrader.com/free-3d-models'
  },
  searchTerms: [
    'a-10 thunderbolt military',
    'a-10 warthog detailed',
    'f-18 super hornet detailed',
    'military aircraft cockpit',
    'fighter jet high poly'
  ]
};

/**
 * Search GrabCAD for professional CAD models
 */
async function searchGrabCAD(query) {
  console.log(`\n🔍 Searching GrabCAD: "${query}"`);
  
  try {
    const searchUrl = `https://grabcad.com/library?page=1&time=all_time&sort=recent&query=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const results = [];
    
    $('.library-item').each((i, elem) => {
      const title = $(elem).find('.library-item__title').text().trim();
      const link = $(elem).find('a').attr('href');
      const downloads = $(elem).find('.library-item__downloads').text().trim();
      const formats = $(elem).find('.library-item__formats').text().trim();
      
      if (title && link) {
        results.push({
          title,
          url: `https://grabcad.com${link}`,
          downloads,
          formats,
          source: 'GrabCAD'
        });
      }
    });
    
    return results;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return [];
  }
}

/**
 * Search Sketchfab for high-quality models
 */
async function searchSketchfab(query) {
  console.log(`\n🔍 Searching Sketchfab: "${query}"`);
  
  try {
    // Sketchfab has an API!
    const apiUrl = `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(query)}&downloadable=true&sort_by=-likeCount`;
    
    const response = await axios.get(apiUrl);
    const results = [];
    
    if (response.data && response.data.results) {
      response.data.results.slice(0, 10).forEach(model => {
        results.push({
          title: model.name,
          url: model.viewerUrl,
          uid: model.uid,
          downloads: model.likeCount,
          formats: 'GLB, FBX, OBJ',
          source: 'Sketchfab',
          isDownloadable: model.isDownloadable,
          faceCount: model.faceCount
        });
      });
    }
    
    return results;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return [];
  }
}

/**
 * Search Free3D
 */
async function searchFree3D(query) {
  console.log(`\n🔍 Searching Free3D: "${query}"`);
  
  try {
    const searchUrl = `https://free3d.com/3d-models/${encodeURIComponent(query.replace(/\s+/g, '-'))}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const results = [];
    
    $('.model-item, .item').each((i, elem) => {
      const title = $(elem).find('h3, .title').text().trim();
      const link = $(elem).find('a').attr('href');
      
      if (title && link) {
        results.push({
          title,
          url: link.startsWith('http') ? link : `https://free3d.com${link}`,
          formats: 'Multiple',
          source: 'Free3D'
        });
      }
    });
    
    return results;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return [];
  }
}

/**
 * Main search aggregator
 */
async function searchAllSources(query) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔎 SEARCHING FOR: "${query}"`);
  console.log('='.repeat(80));
  
  const [grabcadResults, sketchfabResults, free3dResults] = await Promise.all([
    searchGrabCAD(query),
    searchSketchfab(query),
    searchFree3D(query)
  ]);
  
  return {
    query,
    total: grabcadResults.length + sketchfabResults.length + free3dResults.length,
    grabcad: grabcadResults,
    sketchfab: sketchfabResults,
    free3d: free3dResults
  };
}

/**
 * Display results
 */
function displayResults(results) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 FOUND ${results.total} MODELS FOR: "${results.query}"`);
  console.log('='.repeat(80)\n`);
  
  if (results.sketchfab.length > 0) {
    console.log('🎨 SKETCHFAB MODELS (Downloadable):\n');
    results.sketchfab.forEach((model, i) => {
      console.log(`   ${i + 1}. ${model.title}`);
      console.log(`      URL: ${model.url}`);
      console.log(`      Faces: ${model.faceCount?.toLocaleString() || 'Unknown'}`);
      console.log(`      Likes: ${model.downloads}`);
      console.log(`      Downloadable: ${model.isDownloadable ? '✅ YES' : '❌ NO'}`);
      console.log(``);
    });
  }
  
  if (results.grabcad.length > 0) {
    console.log('🔧 GRABCAD MODELS (Professional CAD):\n');
    results.grabcad.forEach((model, i) => {
      console.log(`   ${i + 1}. ${model.title}`);
      console.log(`      URL: ${model.url}`);
      console.log(`      Downloads: ${model.downloads}`);
      console.log(`      Formats: ${model.formats}`);
      console.log(``);
    });
  }
  
  if (results.free3d.length > 0) {
    console.log('🆓 FREE3D MODELS:\n');
    results.free3d.slice(0, 5).forEach((model, i) => {
      console.log(`   ${i + 1}. ${model.title}`);
      console.log(`      URL: ${model.url}`);
      console.log(``);
    });
  }
  
  // Save to JSON
  const outputFile = path.join(CONFIG.outputDir, `search-results-${Date.now()}.json`);
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  
  console.log(`✅ Results saved to: ${outputFile}\n`);
}

/**
 * Main execution
 */
async function main() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('🌐 PROFESSIONAL CAD MODEL SEARCH ENGINE');
  console.log('='.repeat(80)\n`);
  
  const query = process.argv[2] || 'a-10 thunderbolt military';
  
  console.log('📋 Search Strategy:');
  console.log('   1. Sketchfab - High-poly models with downloadable GLB');
  console.log('   2. GrabCAD - Professional CAD files (STEP, IGES)');
  console.log('   3. Free3D - Free 3D models\n');
  
  const results = await searchAllSources(query);
  displayResults(results);
  
  console.log('💡 RECOMMENDATIONS:\n');
  console.log('For BEST quality with component names:');
  console.log('   1. GrabCAD - Real CAD files with assemblies');
  console.log('   2. Download STEP files');
  console.log('   3. Use our extraction pipeline\n');
  
  console.log('For QUICK setup (no extraction needed):');
  console.log('   1. Sketchfab - Pre-converted GLB files');
  console.log('   2. Often have named parts already');
  console.log('   3. Instant use in viewer\n');
  
  console.log('🎯 Next steps:');
  console.log('   - Visit URLs above to download');
  console.log('   - Or use: node scripts/download-from-sketchfab.js <model-uid>');
  console.log('   - Or use: node scripts/download-from-grabcad.js <model-url>\n');
}

main().catch(console.error);
