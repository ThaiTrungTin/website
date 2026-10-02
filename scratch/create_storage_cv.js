const fs = require('fs');
const https = require('https');
const env = fs.readFileSync('.env.local', 'utf8');
const token = env.match(/SUPABASE_ACCESS_TOKEN=(.*)/)[1].trim();

const options = {
  hostname: 'api.supabase.com',
  path: '/v1/projects/ntkpdadakcyugvivvsjw/database/query',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data));
});

const sql = `
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('cv_files', 'cv_files', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

  DROP POLICY IF EXISTS "Public upload cv_files" ON storage.objects;
  CREATE POLICY "Public upload cv_files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'cv_files');

  DROP POLICY IF EXISTS "Public select cv_files" ON storage.objects;
  CREATE POLICY "Public select cv_files" ON storage.objects
    FOR SELECT USING (bucket_id = 'cv_files');
`;

req.write(JSON.stringify({ query: sql }));
req.end();
