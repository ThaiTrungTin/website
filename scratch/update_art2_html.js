const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let url = '', token = '';
for (const line of env.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_ACCESS_TOKEN=')) token = line.split('=')[1].trim();
}
const ref = url.replace('https://', '').replace('.supabase.co', '');

async function run() {
  const viHtml = `<h3>Vì sao thú cưng dễ bị sốc nhiệt?</h3>
<p>Không giống như con người có tuyến mồ hôi trên toàn bộ cơ thể, chó và mèo chỉ thoát nhiệt chủ yếu qua việc thở dốc bằng miệng và một lượng rất nhỏ qua đệm bàn chân. Khi nhiệt độ môi trường vượt quá 32°C kèm độ ẩm cao, cơ chế tự làm mát bị tê liệt, thân nhiệt có thể vọt lên trên 40.5°C chỉ trong 10-15 phút.</p>

<h3>5 dấu hiệu cảnh báo sốc nhiệt khẩn cấp</h3>
<ol>
  <li><strong>Thở dốc dữ dội:</strong> Miệng mở to, lưỡi thè dài đỏ sẫm hoặc tím tái.</li>
  <li><strong>Chảy nhiều dãi quánh:</strong> Nước bọt đặc quánh, dính quanh miệng.</li>
  <li><strong>Mất thăng bằng, lảo đảo:</strong> Chân run rẩy, đi đứng loạng choạng hoặc ngã quỵ.</li>
  <li><strong>Mắt đờ đẫn, nhịp tim đập loạn:</strong> Nhịp tim đập dồn dập, sờ vào ngực cảm nhận mạch rất nhanh.</li>
  <li><strong>Nôn mửa, co giật hoặc hôn mê:</strong> Tình trạng cực kỳ nguy kịch cần cấp cứu ngay.</li>
</ol>

<h3>Các bước sơ cứu tức thì tại nhà</h3>
<ul>
  <li><strong>Bước 1:</strong> Đưa ngay thú cưng vào phòng mát có quạt hoặc điều hòa nhiệt độ phòng (khoảng 24-26°C).</li>
  <li><strong>Bước 2:</strong> Dùng khăn thấm nước mát (nhiệt độ phòng, tuyệt đối KHÔNG dùng nước đá lạnh) lau vào vùng bụng, nách, háng và đệm chân.</li>
  <li><strong>Bước 3:</strong> Cho uống từng ngụm nước nhỏ nếu bé còn tỉnh táo. Không ép uống khi bé đang thở gấp hoặc co giật.</li>
  <li><strong>Bước 4:</strong> Nhanh chóng liên hệ Hotline Cấp Cứu 24/7 của Pet M&M và vận chuyển bé đến bệnh viện gần nhất có phòng thở oxy áp lực.</li>
</ul>`;

  const enHtml = `<h3>Why Are Pets Prone to Heatstroke?</h3>
<p>Unlike humans who have sweat glands all over their body, dogs and cats primarily dissipate heat through heavy panting and a very small amount through their paw pads. When ambient temperatures exceed 32°C combined with high humidity, their self-cooling mechanism fails, and core body temperature can surge above 40.5°C in just 10–15 minutes.</p>

<h3>5 Critical Warning Signs of Emergency Heatstroke</h3>
<ol>
  <li><strong>Severe Panting:</strong> Mouth wide open, tongue protruding dark red or cyanotic.</li>
  <li><strong>Excessive Thick Drooling:</strong> Viscous saliva clinging around the muzzle.</li>
  <li><strong>Loss of Balance & Staggering:</strong> Shivering legs, uncoordinated gait, or sudden collapse.</li>
  <li><strong>Dazed Eyes & Rapid Heartbeat:</strong> Frantic racing pulse felt distinctly against the chest wall.</li>
  <li><strong>Vomiting, Seizures, or Coma:</strong> Critical emergency requiring immediate resuscitation.</li>
</ol>

<h3>Immediate At-Home First Aid Steps</h3>
<ul>
  <li><strong>Step 1:</strong> Immediately move your pet into a cool room with a fan or air conditioner (around 24–26°C).</li>
  <li><strong>Step 2:</strong> Use towels soaked in cool tap water (room temperature, NEVER use ice water) to gently wipe the abdomen, armpits, groin, and paw pads.</li>
  <li><strong>Step 3:</strong> Offer small sips of cool water if the pet is conscious. Never force-feed water while they are panting heavily or seizuring.</li>
  <li><strong>Step 4:</strong> Promptly contact Pet M&M's 24/7 Emergency Hotline and transport your pet to the nearest hospital facility equipped with hyperbaric oxygen therapy.</li>
</ul>`;

  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        UPDATE public.bai_viet
        SET 
          noi_dung = $1,
          noi_dung_en = $2,
          updated_at = NOW()
        WHERE id = '8f9df8db-f9c8-44a6-bf65-391697e8b0f8'
      `,
      parameters: [viHtml, enHtml]
    })
  });
  const data = await res.json();
  console.log('Updated article 2 to clean HTML:', data);
}

run().catch(console.error);
