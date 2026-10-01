const fs = require('fs');

const content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes("activeTab === 'articles'") || line.includes("activeTab === 'articles'") || line.includes("bai_viet") || line.includes("Bài Viết") || line.includes("Cẩm Nang")) {
    console.log((idx + 1) + ':', line.trim().slice(0, 100));
  }
});
