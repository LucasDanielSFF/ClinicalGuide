const { createHash } = require('crypto');
const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, filesList = []) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  files.forEach(file => {
    const fullPath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      getAllFiles(fullPath, filesList);
    } else {
      filesList.push(fullPath);
    }
  });

  return filesList;
}

const directoryToHash = '../public';
const filesToHash = getAllFiles(directoryToHash).sort();
let hash = createHash('sha256');

const currentDate = new Date().toISOString();
hash.update(currentDate);

filesToHash.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  hash.update(content);
});

const dynamicHash = hash.digest('hex').slice(0, 12);

const swContent = fs.readFileSync('service-worker.js', 'utf8');
const updatedSwContent = swContent.replace(
  /const CACHE_NAME = "[^"]+";/,
  `const CACHE_NAME = "clinicalguide-pwa-${dynamicHash}";`
);
fs.writeFileSync('service-worker.js', updatedSwContent, 'utf8');

console.log('Service Worker atualizado com hash:', dynamicHash, 'Gerado em:', currentDate);