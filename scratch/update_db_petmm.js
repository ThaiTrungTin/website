const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const sb = createClient(url, key);

function replacePetMM(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/Pet\s+M\s*&\s*M/g, 'PetM&M')
    .replace(/PET\s+M\s*&\s*M/g, 'PETM&M')
    .replace(/pet\s+m\s*&\s*m/g, 'petm&m');
}

async function updateTable(tableName, idCol = 'id') {
  console.log(`Checking table: ${tableName}`);
  const { data, error } = await sb.from(tableName).select('*');
  if (error) {
    console.error(`Error reading ${tableName}:`, error.message);
    return;
  }
  if (!data) return;

  for (const row of data) {
    const updates = {};
    let hasChange = false;

    for (const [col, val] of Object.entries(row)) {
      if (typeof val === 'string' && /pet\s*m\s*&\s*m/i.test(val)) {
        const newVal = replacePetMM(val);
        if (newVal !== val) {
          updates[col] = newVal;
          hasChange = true;
        }
      }
    }

    if (hasChange) {
      console.log(`Updating ${tableName} [${row[idCol] || 'row'}]:`, Object.keys(updates));
      const { error: updateError } = await sb
        .from(tableName)
        .update(updates)
        .eq(idCol, row[idCol]);
      if (updateError) {
        console.error(`Error updating ${tableName} row ${row[idCol]}:`, updateError.message);
      } else {
        console.log(`Updated successfully.`);
      }
    }
  }
}

async function run() {
  await updateTable('cau_hinh');
  await updateTable('danh_gia');
  await updateTable('chi_nhanh');
  await updateTable('cau_hoi_thuong_gap');
  await updateTable('bai_viet');
  console.log('All tables updated!');
}

run();
