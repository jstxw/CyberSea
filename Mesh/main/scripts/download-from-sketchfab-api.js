/**
 * SKETCHFAB PROFESSIONAL DOWNLOADER
 * Downloads high-quality GLB models with component structure
 * Requires: Sketchfab API key (free)
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  apiKey: process.env.SKETCHFAB_API_KEY || '', // Get free key at https://sketchfab.com/settings/password
  outputDir: path.join(__dirname, '../public/models/professional'),
  
  // Pre-vetted high-quality military models on Sketchfab
  recommendedModels: {
    'a10-warthog-1': {
      uid: 'search-needed',
      name: 'A-10 Warthog',
      query: 'a-10 warthog detailed',
      minFaces: 100000
    },
    'f18-hornet-1': {
      uid: 'search-needed',
      name: 'F-18 Super Hornet',
      query: 'f-18 super hornet cockpit',
      minFaces: 150000
    }
  }
};

/**
 * Search Sketchfab for best matching model
 */
async function searchBestModel(query, minFaces = 50000) {
  console.log(`\n🔍 Searching Sketchfab for: "${query}"`);
  console.log(`   Minimum quality: ${minFaces.toLocaleString()} polygons\n`);
  
  try {
    const url = `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(query)}&downloadable=true&sort_by=-likeCount&count=20`;
    
    const response = await axios.get(url);
    
    if (!response.data || !response.data.results) {
      console.log('❌ No results found');
      return null;
    }
    
    // Filter by quality
    const highQuality = response.data.results.filter(model => 
      model.isDownloadable && 
      model.faceCount >= minFaces
    );
    
    console.log(`✅ Found ${highQuality.length} high-quality downloadable models:\n`);
    
    highQuality.slice(0, 10).forEach((model, i) => {
      console.log(`   ${i + 1}. ${model.name}`);
      console.log(`      UID: ${model.uid}`);
      console.log(`      Polygons: ${model.faceCount.toLocaleString()}`);
      console.log(`      Likes: ${model.likeCount}`);
      console.log(`      URL: https://sketchfab.com/3d-models/${model.uid}`);
      console.log(``);
    });
    
    return highQuality;
    
  } catch (error) {
    console.error(`❌ Search error: ${error.message}`);
    return null;
  }
}

/**
 * Get download link for a Sketchfab model
 */
async function getDownloadLink(uid) {
  if (!CONFIG.apiKey) {
    console.log('\n⚠️  SKETCHFAB API KEY REQUIRED');
    console.log('Get your free API key:');
    console.log('1. Go to: https://sketchfab.com/settings/password');
    console.log('2. Scroll to "API Token"');
    console.log('3. Copy your token');
    console.log('4. Set: $env:SKETCHFAB_API_KEY="your-token-here"\n');
    return null;
  }
  
  try {
    const url = `https://api.sketchfab.com/v3/models/${uid}/download`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Token ${CONFIG.apiKey}`
      }
    });
    
    if (response.data && response.data.gltf) {
      return response.data.gltf.url;
    }
    
    return null;
    
  } catch (error) {
    console.error(`❌ Download link error: ${error.message}`);
    return null;
  }
}

/**
 * Download model file
 */
async function downloadModel(url, outputPath) {
  console.log(`\n📥 Downloading model...`);
  
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        const stats = fs.statSync(outputPath);
        console.log(`✅ Downloaded: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
        resolve(outputPath);
      });
      writer.on('error', reject);
    });
    
  } catch (error) {
    console.error(`❌ Download error: ${error.message}`);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  const query = process.argv[2] || 'a-10 warthog military detailed';
  const minFaces = parseInt(process.argv[3]) || 100000;
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('🎨 SKETCHFAB PROFESSIONAL MODEL DOWNLOADER');
  console.log(`${'='.repeat(80)}\n`);
  
  // Ensure output directory
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  
  // Search for models
  const models = await searchBestModel(query, minFaces);
  
  if (!models || models.length === 0) {
    console.log('\n❌ No suitable models found');
    console.log('Try:');
    console.log('   - Lowering minimum faces');
    console.log('   - Different search terms');
    console.log('   - Manual search at sketchfab.com\n');
    return;
  }
  
  // Show top recommendation
  const bestModel = models[0];
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('🏆 RECOMMENDED MODEL');
  console.log(`${'='.repeat(80)}\n`);
  console.log(`Name: ${bestModel.name}`);
  console.log(`UID: ${bestModel.uid}`);
  console.log(`Quality: ${bestModel.faceCount.toLocaleString()} polygons`);
  console.log(`Popularity: ${bestModel.likeCount} likes`);
  console.log(`URL: https://sketchfab.com/3d-models/${bestModel.uid}\n`);
  
  console.log('💡 TO DOWNLOAD THIS MODEL:\n');
  console.log('OPTION 1: Manual Download (Easier)');
  console.log(`   1. Visit: https://sketchfab.com/3d-models/${bestModel.uid}`);
  console.log('   2. Click "Download 3D Model"');
  console.log('   3. Select "Auto-detected glTF" format');
  console.log('   4. Download and extract');
  console.log(`   5. Move .glb file to: public/models/professional/\n`);
  
  console.log('OPTION 2: API Download (Requires free API key)');
  console.log('   1. Get API key: https://sketchfab.com/settings/password');
  console.log('   2. Set: $env:SKETCHFAB_API_KEY="your-key"');
  console.log(`   3. Run: node scripts/download-model.js ${bestModel.uid}\n`);
  
  // Save recommendations to file
  const recommendationsFile = path.join(CONFIG.outputDir, 'recommendations.json');
  fs.writeFileSync(recommendationsFile, JSON.stringify({
    query,
    searchDate: new Date().toISOString(),
    topModels: models.slice(0, 5).map(m => ({
      name: m.name,
      uid: m.uid,
      url: `https://sketchfab.com/3d-models/${m.uid}`,
      polygons: m.faceCount,
      likes: m.likeCount,
      downloadUrl: `Manual download from Sketchfab (requires login)`
    }))
  }, null, 2));
  
  console.log(`✅ Recommendations saved to: ${recommendationsFile}\n`);
  
  console.log(`${'='.repeat(80)}`);
  console.log('🎯 NEXT STEPS');
  console.log(`${'='.repeat(80)}\n`);
  console.log('1. Visit the model URL above');
  console.log('2. Download the GLB file');
  console.log('3. Check if it has named components (open in Blender/viewer)');
  console.log('4. If components are named → Perfect!');
  console.log('5. If not → We have other strategies!\n');
}

main().catch(console.error);
