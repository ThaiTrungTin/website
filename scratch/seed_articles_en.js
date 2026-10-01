const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let url = '', token = '';
for (const line of env.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_ACCESS_TOKEN=')) token = line.split('=')[1].trim();
}
const ref = url.replace('https://', '').replace('.supabase.co', '');

async function run() {
  // 1. Fetch current content of article 1 to keep its exact images
  const fetchRes = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: "SELECT id, noi_dung FROM public.bai_viet WHERE id = '0dfd2b2e-7dc9-4958-9c06-41841911ea95'"
    })
  });
  const [art1] = await fetchRes.json();
  
  // Replace text in art1 while preserving all <img> tags exactly
  let art1En = art1.noi_dung
    .replace('### <strong>Tầm quan trọng của việc tiêm phòng </strong>', '### <strong>The Importance of Timely Vaccination</strong>')
    .replace('ggggyujv', 'Comprehensive Immunity')
    .replace('vnugvgg', 'Lifelong Health')
    .replace('gugyg', 'Protection')
    .replace('<p>dsaqsqs</p>', '<p>Adhering to a standardized veterinary vaccination schedule is crucial for safeguarding puppies and kittens against fatal infectious diseases.</p>');

  const updates = [
    {
      id: '0dfd2b2e-7dc9-4958-9c06-41841911ea95',
      tieu_de_en: 'Standard Vaccination Schedule for Dogs & Cats from 2 Months Old',
      chuyen_muc_en: 'Preventive Medicine',
      mo_ta_ngan_en: 'Detailed tracking schedule for Parvo, Distemper, FPV, and Rabies vaccines helping your beloved pets build lifelong immunity.',
      thoi_gian_doc_en: '4 min read',
      tac_gia_en: 'Dr. Nguyen Minh Tuan, Specialist I',
      noi_dung_en: art1En,
    },
    {
      id: '8f9df8db-f9c8-44a6-bf65-391697e8b0f8',
      tieu_de_en: 'Early Warning Signs of Heatstroke in Pets During Hot Weather',
      chuyen_muc_en: 'Pet First Aid',
      mo_ta_ngan_en: 'Step-by-step emergency cooling instructions at home before heading to the nearest veterinary hospital to prevent brain injury.',
      thoi_gian_doc_en: '5 min read',
      tac_gia_en: 'MSc. DVM Tran Hoang Oanh',
      noi_dung_en: `### Why Are Pets Prone to Heatstroke?
Unlike humans who have sweat glands all over their body, dogs and cats primarily dissipate heat through heavy panting and a very small amount through their paw pads. When ambient temperatures exceed 32°C combined with high humidity, their self-cooling mechanism fails, and core body temperature can surge above 40.5°C in just 10–15 minutes.

### 5 Critical Warning Signs of Emergency Heatstroke
1. **Severe Panting:** Mouth wide open, tongue protruding dark red or cyanotic.
2. **Excessive Thick Drooling:** Viscous saliva clinging around the muzzle.
3. **Loss of Balance & Staggering:** Shivering legs, uncoordinated gait, or sudden collapse.
4. **Dazed Eyes & Rapid Heartbeat:** Frantic racing pulse felt distinctly against the chest wall.
5. **Vomiting, Seizures, or Coma:** Critical emergency requiring immediate resuscitation.

### Immediate At-Home First Aid Steps
* **Step 1:** Immediately move your pet into a cool room with a fan or air conditioner (around 24–26°C).
* **Step 2:** Use towels soaked in cool tap water (room temperature, NEVER use ice water) to gently wipe the abdomen, armpits, groin, and paw pads.
* **Step 3:** Offer small sips of cool water if the pet is conscious. Never force-feed water while they are panting heavily or seizuring.
* **Step 4:** Promptly contact Pet M&M's 24/7 Emergency Hotline and transport your pet to the nearest hospital facility equipped with hyperbaric oxygen therapy.`,
    },
    {
      id: 'c88f34c9-d46b-4273-ad69-728144b750db',
      tieu_de_en: 'Secrets to Silky Skin & Coat and Complete Flea & Tick Treatment',
      chuyen_muc_en: 'Pet Care & Spa',
      mo_ta_ngan_en: 'Omega-3 supplementation regimens, probiotics, and herbal jacuzzi bath cycles to eliminate itching and excessive shedding.',
      thoi_gian_doc_en: '3 min read',
      tac_gia_en: 'Pet M&M Dermatology & Grooming Specialist',
      noi_dung_en: `<p>A shiny, healthy coat and resilient skin are vital reflections of your pet's overall well-being. Proper maintenance requires a combination of clinical skincare, balanced nutrition, and preventive antiparasitic routines.</p>
<h3>1. Omega Fatty Acids & Skin Barrier Nutrition</h3>
<p>Supplementing high-grade EPA/DHA omega fatty acids alongside balanced probiotics strengthens the skin barrier, reduces dry flakes, and promotes thick, radiant fur.</p>
<h3>2. Targeted Flea & Tick Defense</h3>
<p>Regular preventive care with vet-recommended topical or chewable ectoparasiticides ensures full protection against fleas, ticks, and allergic dermatitis.</p>
<h3>3. Microbubble Spa & Hydrating Herbal Baths</h3>
<p>Pet M&M's therapeutic herbal jacuzzi baths deep-clean pores and hair follicles without stripping essential protective oils, leaving the coat exceptionally soft and revitalized.</p>`,
    }
  ];

  for (const item of updates) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          UPDATE public.bai_viet
          SET 
            tieu_de_en = $1,
            chuyen_muc_en = $2,
            mo_ta_ngan_en = $3,
            thoi_gian_doc_en = $4,
            tac_gia_en = $5,
            noi_dung_en = $6,
            updated_at = NOW()
          WHERE id = $7
        `,
        parameters: [
          item.tieu_de_en,
          item.chuyen_muc_en,
          item.mo_ta_ngan_en,
          item.thoi_gian_doc_en,
          item.tac_gia_en,
          item.noi_dung_en,
          item.id,
        ]
      })
    });
    const result = await res.json();
    console.log(`Updated ${item.id}:`, result);
  }
  console.log('Finished updating articles bilingual content!');
}

run().catch(console.error);
