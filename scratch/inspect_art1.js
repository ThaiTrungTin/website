const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let url = '', token = '';
for (const line of env.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_ACCESS_TOKEN=')) token = line.split('=')[1].trim();
}
const ref = url.replace('https://', '').replace('.supabase.co', '');

async function run() {
  const sql = "SELECT id, tieu_de, noi_dung FROM public.bai_viet";
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql })
  });
  const data = await res.json();
  data.forEach((d) => {
    console.log('===', d.tieu_de, '===');
    const content = d.noi_dung || '';
    console.log('Length:', content.length);
    console.log('Includes data:image?', content.includes('data:image'));
    const imgs = content.match(/<img[^>]+>/g) || [];
    console.log('Img count:', imgs.length);
    imgs.forEach((img, i) => console.log(`  Img ${i}: ${img.slice(0, 150)}...`));
    console.log('Text preview:', content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 200));
  });
}
run();
