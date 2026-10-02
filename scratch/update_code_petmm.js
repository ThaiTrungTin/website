const fs = require('fs');
const path = require('path');

function walk(dir, list = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') walk(p, list);
    } else if (/\.(tsx?|jsx?|json)$/.test(f)) {
      list.push(p);
    }
  }
  return list;
}

const files = walk('src');
let totalChanges = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // We want to replace:
  // "Pet M&M" -> "PetM&M"
  // "PET M&M" -> "PETM&M"
  // "Pet M & M" -> "PetM&M"
  // "Pet M&amp;M" -> "PetM&amp;M"
  // "Pet  M&M" -> "PetM&M"
  // "pet m&m" -> "petm&m"
  
  // Note: We avoid replacing if it is already "PetM&M"
  content = content.replace(/Pet\s+M\s*&\s*M/g, 'PetM&M');
  content = content.replace(/PET\s+M\s*&\s*M/g, 'PETM&M');
  content = content.replace(/Pet\s+M&amp;M/g, 'PetM&amp;M');
  content = content.replace(/pet\s+m\s*&\s*m/g, 'petm&m');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
    totalChanges++;
  }
}

console.log(`Total files modified: ${totalChanges}`);
