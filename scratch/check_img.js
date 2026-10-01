const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.+)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.+)/);
const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function inspect() {
  const { data } = await supabase
    .from('chi_nhanh')
    .select('id, ten_chi_nhanh, bai_viet_chi_tiet, bai_viet_chi_tiet_en')
    .eq('id', 'a7186fc4-3f00-46ce-a3d3-5179b46ee0f4')
    .single();

  const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let m;
  console.log('--- IMAGES IN VI ---');
  while ((m = regex.exec(data.bai_viet_chi_tiet)) !== null) {
    console.log(m[1].slice(0, 100));
  }

  const regexEn = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  console.log('--- IMAGES IN EN ---');
  while ((m = regexEn.exec(data.bai_viet_chi_tiet_en)) !== null) {
    console.log(m[1].slice(0, 100));
  }
}

inspect();
