const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const https = require('https');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.+)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.+)/);
const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

const GAIA_URL = 'https://gaialifestyle.vn/wp-content/uploads/2026/04/BLUESKY-MEDIA-138-1024x683.jpg';

function downloadImage() {
  return new Promise((resolve, reject) => {
    const agent = new https.Agent({ rejectUnauthorized: false });
    https.get(GAIA_URL, { agent }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error('Status: ' + res.statusCode));
      }
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function rehost() {
  console.log('Downloading image from gaialifestyle...');
  const buffer = await downloadImage();
  console.log('Downloaded size:', buffer.length);

  const filename = `branches/bluesky_facility_${Date.now()}.jpg`;
  console.log('Uploading to Supabase Storage bucket hinh_anh as', filename);
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('hinh_anh')
    .upload(filename, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from('hinh_anh')
    .getPublicUrl(filename);

  const newUrl = publicUrlData.publicUrl;
  console.log('New Supabase URL:', newUrl);

  // Update chi_nhanh
  const { data: branch } = await supabase
    .from('chi_nhanh')
    .select('id, bai_viet_chi_tiet, bai_viet_chi_tiet_en')
    .eq('id', 'a7186fc4-3f00-46ce-a3d3-5179b46ee0f4')
    .single();

  const updatedVi = branch.bai_viet_chi_tiet.replaceAll(GAIA_URL, newUrl);
  const updatedEn = (branch.bai_viet_chi_tiet_en || '').replaceAll(GAIA_URL, newUrl);

  const { error: updateError } = await supabase
    .from('chi_nhanh')
    .update({
      bai_viet_chi_tiet: updatedVi,
      bai_viet_chi_tiet_en: updatedEn,
      ngay_cap_nhat: new Date().toISOString()
    })
    .eq('id', 'a7186fc4-3f00-46ce-a3d3-5179b46ee0f4');

  if (updateError) {
    console.error('Update error:', updateError);
  } else {
    console.log('SUCCESS! Updated branch article image URL to clean Supabase Storage.');
  }
}

rehost().catch(console.error);
