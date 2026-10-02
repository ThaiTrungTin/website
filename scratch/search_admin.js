const fs = require('fs');
const content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);

lines.forEach((l, i) => {
  if (
    l.toLowerCase().includes('đội ngũ') ||
    l.includes('DoiNgu') ||
    l.includes('doi_ngu') ||
    l.includes('tab ===') ||
    l.includes('currentTab') ||
    l.includes('selectedTab')
  ) {
    console.log(`L${i + 1}: ${l.trim().slice(0, 120)}`);
  }
});
