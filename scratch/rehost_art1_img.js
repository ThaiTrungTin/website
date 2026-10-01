const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let url = '', serviceKey = '', token = '';
for (const line of env.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) serviceKey = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_ACCESS_TOKEN=')) token = line.split('=')[1].trim();
}
const ref = url.replace('https://', '').replace('.supabase.co', '');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, serviceKey);

async function run() {
  console.log('Fetching article 1...');
  const { data: art, error } = await supabase
    .from('bai_viet')
    .select('id, noi_dung, noi_dung_en')
    .eq('id', '0dfd2b2e-7dc9-4958-9c06-41841911ea95')
    .single();

  if (error || !art) {
    console.error('Error fetching article:', error);
    return;
  }

  const match = art.noi_dung.match(/src="(data:image\/(png|jpeg|jpg|webp);base64,([^"]+))"/);
  if (!match) {
    console.log('No base64 image found in article 1');
    return;
  }

  const mimeType = match[2];
  const base64Data = match[3];
  const buffer = Buffer.from(base64Data, 'base64');
  console.log('Base64 image size in bytes:', buffer.length);

  const fileName = `articles/vaccine_guide_${Date.now()}.${mimeType === 'jpeg' ? 'jpg' : mimeType}`;
  console.log('Uploading to Supabase storage as:', fileName);

  const { error: uploadError } = await supabase.storage
    .from('hinh_anh')
    .upload(fileName, buffer, {
      contentType: `image/${mimeType}`,
      cacheControl: '31536000',
      upsert: true,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return;
  }

  const { data: urlData } = supabase.storage.from('hinh_anh').getPublicUrl(fileName);
  const publicUrl = urlData.publicUrl;
  console.log('Uploaded public URL:', publicUrl);

  // Replace base64 with public URL in both noi_dung and noi_dung_en
  const newVi = art.noi_dung.replace(match[1], publicUrl);
  const newEn = (art.noi_dung_en || '').replace(match[1], publicUrl);

  console.log('Old VI length:', art.noi_dung.length, '-> New VI length:', newVi.length);
  console.log('Old EN length:', (art.noi_dung_en || '').length, '-> New EN length:', newEn.length);

  const { error: updateError } = await supabase
    .from('bai_viet')
    .update({
      noi_dung: newVi,
      noi_dung_en: newEn,
      updated_at: new Date().toISOString(),
    })
    .eq('id', '0dfd2b2e-7dc9-4958-9c06-41841911ea95');

  if (updateError) {
    console.error('Update error:', updateError);
  } else {
    console.log('Successfully replaced base64 with CDN image URL in article 1!');
  }
}

run().catch(console.error);
