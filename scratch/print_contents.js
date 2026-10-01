const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let url = '', token = '';
for (const line of env.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_ACCESS_TOKEN=')) token = line.split('=')[1].trim();
}
const ref = url.replace('https://', '').replace('.supabase.co', '');

async function run() {
  const sql = "SELECT id, tieu_de, noi_dung FROM public.bai_viet ORDER BY thu_tu ASC";
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql })
  });
  const data = await res.json();
  for (const d of data) {
    console.log(`\n================== ${d.tieu_de} (${d.id}) ==================`);
    if (d.id === '0dfd2b2e-7dc9-4958-9c06-41841911ea95') {
      // replace base64 for readability
      console.log(d.noi_dung.replace(/data:image\/[^;]+;base64,[^"]+/g, '[BASE64_IMAGE_DATA]'));
    } else {
      console.log(d.noi_dung);
    }
  }
}
run();
