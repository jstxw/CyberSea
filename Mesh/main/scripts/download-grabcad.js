/**
 * GrabCAD Model Downloader
 * Downloads military vehicle CAD models from GrabCAD
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Target military models with direct download info
const MODELS = [
  {
    name: 'T-90 Main Battle Tank',
    id: 't-90-tank',
    url: 'https://grabcad.com/library/t-90-tank-1',
    category: 'tank',
    priority: 1
  },
  {
    name: 'F-16 Fighting Falcon',
    id: 'f-16-falcon',
    url: 'https://grabcad.com/library/f-16-fighting-falcon-21',
    category: 'aircraft',
    priority: 1
  },
  {
    name: 'AH-64 Apache Helicopter',
    id: 'ah-64-apache',
    url: 'https://grabcad.com/library/ah-64-apache-helicopter-8',
    category: 'helicopter',
    priority: 1
  },
  {
    name: 'M1 Abrams Tank',
    id: 'm1-abrams',
    url: 'https://grabcad.com/library/m1-abrams-6',
    category: 'tank',
    priority: 2
  },
  {
    name: 'HMMWV Complete',
    id: 'hmmwv',
    url: 'https://grabcad.com/library/hmmwv-complete-1',
    category: 'vehicle',
    priority: 1
  },
  {
    name: 'MIG-29 Fulcrum',
    id: 'mig-29',
    url: 'https://grabcad.com/library/mig-29-fulcrum-3',
    category: 'aircraft',
    priority: 2
  },
  {
    name: 'Leopard 2A6',
    id: 'leopard-2a6',
    url: 'https://grabcad.com/library/leopard-2a6-2',
    category: 'tank',
    priority: 2
  },
  {
    name: 'DDG-51 Arleigh Burke Destroyer',
    id: 'ddg-51',
    url: 'https://grabcad.com/library/arleigh-burke-class-destroyer-3',
    category: 'naval',
    priority: 2
  }
];

// Create directories
const DOWNLOAD_DIR = path.join(__dirname, '../downloads/cad');
const OUTPUT_DIR = path.join(__dirname, '../public/models/cad');

function ensureDirectories() {
  [DOWNLOAD_DIR, OUTPUT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
}

function generateModelList() {
  console.log('\n🎖️  GRABCAD MILITARY MODELS TO DOWNLOAD:\n');
  console.log('═'.repeat(80));
  
  MODELS.forEach((model, idx) => {
    console.log(`\n${idx + 1}. ${model.name}`);
    console.log(`   Category: ${model.category.toUpperCase()}`);
    console.log(`   URL: ${model.url}`);
    console.log(`   Priority: ${'⭐'.repeat(model.priority)}`);
  });
  
  console.log('\n' + '═'.repeat(80));
  console.log('\n📋 DOWNLOAD INSTRUCTIONS:\n');
  console.log('Since GrabCAD requires authentication, follow these steps:');
  console.log('\n1. Go to https://grabcad.com/');
  console.log('2. Sign up/login (free account)');
  console.log('3. Visit each URL above');
  console.log('4. Click "Download" → Select "STEP" format');
  console.log('5. Save to: ' + DOWNLOAD_DIR);
  console.log('\n💡 TIP: Download priority 1 models first (marked with ⭐)\n');
  
  // Save list to file
  const listFile = path.join(__dirname, 'DOWNLOAD_LIST.txt');
  let content = 'GRABCAD MILITARY MODELS - DOWNLOAD LIST\n';
  content += '=' .repeat(80) + '\n\n';
  
  MODELS.forEach((model, idx) => {
    content += `${idx + 1}. ${model.name}\n`;
    content += `   URL: ${model.url}\n`;
    content += `   Format: STEP (.stp or .step)\n`;
    content += `   Save to: ${DOWNLOAD_DIR}\n\n`;
  });
  
  fs.writeFileSync(listFile, content);
  console.log(`📄 Download list saved to: ${listFile}\n`);
}

function checkDownloadedFiles() {
  console.log('\n🔍 CHECKING FOR DOWNLOADED FILES:\n');
  
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    console.log('❌ Download directory not found. Creating...');
    ensureDirectories();
    return [];
  }
  
  const files = fs.readdirSync(DOWNLOAD_DIR);
  const cadFiles = files.filter(f => 
    f.endsWith('.step') || 
    f.endsWith('.stp') || 
    f.endsWith('.iges') || 
    f.endsWith('.igs')
  );
  
  if (cadFiles.length === 0) {
    console.log('❌ No CAD files found in download directory');
    console.log(`   Directory: ${DOWNLOAD_DIR}`);
    console.log('   Please download models from GrabCAD first\n');
    return [];
  }
  
  console.log(`✅ Found ${cadFiles.length} CAD file(s):\n`);
  cadFiles.forEach((file, idx) => {
    const stats = fs.statSync(path.join(DOWNLOAD_DIR, file));
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`   ${idx + 1}. ${file} (${sizeMB} MB)`);
  });
  console.log('');
  
  return cadFiles;
}

function generateQuickLinks() {
  console.log('\n🔗 QUICK DOWNLOAD LINKS:\n');
  console.log('Copy and paste these into your browser:\n');
  
  MODELS.filter(m => m.priority === 1).forEach(model => {
    console.log(`${model.name}:`);
    console.log(`${model.url}\n`);
  });
}

// Main execution
console.log('\n🎖️  GRABCAD MILITARY MODEL DOWNLOADER\n');

ensureDirectories();
generateModelList();
checkDownloadedFiles();
generateQuickLinks();

console.log('═'.repeat(80));
console.log('\n✅ Script complete!');
console.log('\n📌 NEXT STEPS:');
console.log('   1. Download models from GrabCAD (links above)');
console.log('   2. Save to: ' + DOWNLOAD_DIR);
console.log('   3. Run: node scripts/convert-cad.js');
console.log('\n');

module.exports = { MODELS, DOWNLOAD_DIR, OUTPUT_DIR };
