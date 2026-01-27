import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  bgYellow: '\x1b[43m',
  bgGreen: '\x1b[42m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(`${colors.cyan}${query}${colors.reset}`, resolve));
}

function print(text, color = 'reset') {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function printBox(text, color = 'yellow') {
  const lines = text.split('\n');
  const maxLen = Math.max(...lines.map(l => l.length));
  const border = '═'.repeat(maxLen + 4);
  
  print(`╔${border}╗`, color);
  lines.forEach(line => {
    const padding = ' '.repeat(maxLen - line.length);
    print(`║  ${line}${padding}  ║`, color);
  });
  print(`╚${border}╝`, color);
}

async function main() {
  console.clear();
  printBox('🎬  MOVIE NIGHT ENTRY CREATOR  🎬', 'yellow');
  console.log();
  
  // Get basic info
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
  print('📝 BASIC INFORMATION', 'bright');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
  console.log();
  
  const title = await question('🎯 Title (e.g., Inception 2010): ');
  const type = await question('🎭 Type (movie/tv): ');
  const status = await question('📊 Status (watched/upcoming): ');
  const date = await question('📅 Date (YYYY-MM-DD) [today]: ') || new Date().toISOString().split('T')[0];
  
  console.log();
  let rating = '';
  if (status === 'watched') {
    rating = await question('⭐ Rating (1-5): ');
  }
  
  const genres = await question('🎬 Genres (comma separated): ');
  const duration = await question('⏱️  Duration (e.g., 2h 28m): ');
  
  console.log();
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
  print('📖 DESCRIPTION', 'bright');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
  console.log();
  
  let description = '';
  if (status === 'watched') {
    print('✍️  Enter story (press Enter twice when done):', 'cyan');
    description = await getMultilineInput();
  } else {
    print('✍️  Enter reason to watch (press Enter twice when done):', 'cyan');
    description = await getMultilineInput();
  }
  
  console.log();
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
  print('🎥 MEDIA', 'bright');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
  console.log();
  
  const videoUrl = await question('🔗 Video URL (optional): ');
  const videoType = videoUrl ? await question('📦 Video type (local/embed): ') : '';
  
  rl.close();
  
  console.log();
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
  print('⚙️  PROCESSING...', 'bright');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
  console.log();
  
  // Read storage.ts to get next ID
  const storagePath = path.join(__dirname, 'services', 'storage.ts');
  const storageContent = fs.readFileSync(storagePath, 'utf8');
  
  // Find highest ID
  const idMatches = storageContent.match(/id:\s*'(\d+)'/g);
  const ids = idMatches.map(match => parseInt(match.match(/\d+/)[0]));
  const nextId = Math.max(...ids) + 1;
  
  print(`🆔 Generated ID: ${nextId}`, 'green');
  
  // Create folder name (lowercase, spaces replaced with spaces)
  const folderName = title.toLowerCase();
  const assetsPath = path.join(__dirname, 'public', 'assets', folderName);
  const capturesPath = path.join(assetsPath, 'captures');
  
  // Create folders
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
    print(`📁 Created folder: ${folderName}`, 'green');
  }
  
  if (!fs.existsSync(capturesPath)) {
    fs.mkdirSync(capturesPath, { recursive: true });
    print(`📸 Created captures folder`, 'green');
  }
  
  // Generate entry object
  const entry = {
    id: String(nextId),
    title: title,
    type: type,
    status: status,
    date: date
  };
  
  if (status === 'watched' && rating) {
    entry.rating = parseInt(rating);
  }
  
  if (genres.trim()) {
    entry.genres = genres.split(',').map(g => g.trim());
  }
  
  if (duration) {
    entry.duration = duration;
  }
  
  if (description) {
    if (status === 'watched') {
      entry.story = description;
    } else {
      entry.reason = description;
    }
  }
  
  // Set poster and captures paths
  entry.posterUrl = `assets/${folderName}/captures/${folderName}.jpg`;
  entry.captures = [`assets/${folderName}/captures/${folderName}.jpg`];
  
  if (videoUrl) {
    entry.videos = [{
      title: 'Movie',
      url: videoUrl,
      type: videoType || 'local'
    }];
  }
  
  // Format entry as TypeScript
  const entryCode = '  ' + JSON.stringify(entry, null, 2)
    .split('\n')
    .join('\n  ') + ',';
  
  // Add entry to storage.ts
  const insertPosition = storageContent.lastIndexOf(']\n];');
  const beforeEntry = storageContent.slice(0, insertPosition);
  const afterEntry = storageContent.slice(insertPosition);
  
  // Add comma to previous entry if it doesn't have one
  const needsComma = !beforeEntry.trimEnd().endsWith(',');
  const newContent = beforeEntry + (needsComma ? ',' : '') + '\n' + entryCode + '\n' + afterEntry;
  
  fs.writeFileSync(storagePath, newContent, 'utf8');
  
  print('💾 Entry saved to storage.ts', 'green');
  
  console.log();
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
  print('✨ SUCCESS!', 'bright');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
  console.log();
  
  printBox(`Entry ID: ${nextId}\nTitle: ${title}\nFolder: public/assets/${folderName}/`, 'green');
  
  console.log();
  print('📋 NEXT STEPS:', 'yellow');
  print(`   1️⃣  Add poster → public/assets/${folderName}/captures/${folderName}.jpg`, 'cyan');
  print(`   2️⃣  Add captures → public/assets/${folderName}/captures/`, 'cyan');
  console.log();
  
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
  print('🎉 All done! Happy movie night! 🍿', 'green');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
  console.log();
}

async function getMultilineInput() {
  return new Promise(resolve => {
    let lines = [];
    let emptyLineCount = 0;
    
    const onLine = (line) => {
      if (line === '') {
        emptyLineCount++;
        if (emptyLineCount >= 2) {
          rl.removeListener('line', onLine);
          resolve(lines.join(' '));
        }
      } else {
        emptyLineCount = 0;
        lines.push(line);
      }
    };
    
    rl.on('line', onLine);
  });
}

main().catch(console.error);
