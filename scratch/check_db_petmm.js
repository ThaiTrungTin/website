const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
  const tables = ['cau_hinh', 'danh_gia', 'chi_nhanh', 'cau_hoi_thuong_gap', 'dich_vu', 'doi_ngu', 'bai_viet'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.log('Error in', table, error.message);
      continue;
    }
    const json = JSON.stringify(data);
    const count = (json.match(/Pet M&M/g) || []).length;
    console.log(`Table ${table}: ${count} occurrences of "Pet M&M"`);
  }
}
check();
