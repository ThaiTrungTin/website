const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'dist' || file === 'brain') return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (/\.(tsx?|jsx?|json|md|sql)$/.test(file)) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('src');
let count = 0;
const matchingFiles = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('Pet M&M')) {
    count++;
    matchingFiles.push(f);
  }
});

console.log('Total files containing "Pet M&M":', count);
console.log(matchingFiles);
