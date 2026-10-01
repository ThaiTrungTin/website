const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
let url = '', token = '';
for (const line of env.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_ACCESS_TOKEN=')) token = line.split('=')[1].trim();
}
const ref = url.replace('https://', '').replace('.supabase.co', '');

async function run() {
  const sql = `
    ALTER TABLE public.bai_viet 
      ADD COLUMN IF NOT EXISTS tac_gia_en TEXT,
      ADD COLUMN IF NOT EXISTS thoi_gian_doc_en TEXT;
  `;
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json();
  console.log('Result:', data);
}

run().catch(console.error);
