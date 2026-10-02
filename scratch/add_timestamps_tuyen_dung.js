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
  ALTER TABLE public.tuyen_dung 
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS ngay_cap_nhat TIMESTAMPTZ DEFAULT NOW();

  UPDATE public.tuyen_dung 
    SET created_at = ngay_tao 
    WHERE created_at IS NULL AND ngay_tao IS NOT NULL;
`;

req.write(JSON.stringify({ query: sql }));
req.end();
