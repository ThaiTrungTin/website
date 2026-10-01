import { NextResponse } from 'next/server';

// Từ điển tinh chỉnh chuyên ngành Thú y & Y khoa (Veterinary Domain Tuning)
const DOMAIN_REPLACEMENTS: [RegExp, string][] = [
  [/By German Heart & Medicine/gi, 'With Compassion & Medical Ethics'],
  [/German Heart & Medicine/gi, 'Compassion & Medical Ethics'],
  [/German medicine/gi, 'Medical ethics'],
  [/By German/gi, 'With Heart'],
  [/children's eyes/gi, "our patients' eyes"],
  [/the children/gi, 'the pets'],
  [/Advancement of Medical Care/gi, 'Elevating Veterinary Care'],
  [/Medical Gold Pledge/gi, 'Golden Medical Commitment'],
  [/Professional Director/gi, 'Chief Medical Director'],
  [/Dr\. CKI/gi, 'Dr.'],
  [/pet health standard/gi, 'veterinary healthcare standard'],
];

function refineVeterinaryTranslation(text: string): string {
  let result = text;
  for (const [regex, replacement] of DOMAIN_REPLACEMENTS) {
    result = result.replace(regex, replacement);
  }
  return result;
}

// Dịch bằng Google Gemini API nếu có cấu hình GEMINI_API_KEY
async function translateWithGemini(text: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Translate the following Vietnamese veterinary hospital text into fluent, professional, high-end English suitable for an international 5-star veterinary clinic website. Output ONLY the translated result without any commentary, markdown quotes, or preamble:\n\n${text}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
      },
    }),
  });

  if (res.ok) {
    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText && typeof candidateText === 'string') {
      return candidateText.trim();
    }
  }
  throw new Error('Gemini API returned unsuccessful status');
}

// Dịch một đoạn văn bản bằng Google Neural Machine Translation
async function translateGtxChunk(chunk: string): Promise<string> {
  if (!chunk || !chunk.trim()) return chunk;

  const clients = ['dict-chrome-ex', 'gtx'];
  for (const client of clients) {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=${client}&sl=vi&tl=en&dt=t&q=${encodeURIComponent(chunk)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
        next: { revalidate: 0 },
      });

      if (res.ok) {
        const data = await res.json();
        return (data[0] || []).map((item: any) => item[0]).join('');
      }
    } catch {
      // Tiếp tục thử client dự phòng
    }
  }

  // Fallback MyMemory cho các đoạn ngắn nếu các client trên gặp sự cố
  try {
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk.slice(0, 500).trim())}&langpair=vi|en`;
    const mmRes = await fetch(mmUrl);
    if (mmRes.ok) {
      const mmData = await mmRes.json();
      return mmData?.responseData?.translatedText || chunk;
    }
  } catch {}

  return chunk;
}

// Dịch bằng Google Neural Machine Translation + Fallback (Hỗ trợ toàn bộ bài viết dài)
async function translateWithGoogleNmt(text: string): Promise<string> {
  if (!text || !text.trim()) return '';

  try {
    // Nếu văn bản dưới 1200 ký tự, dịch 1 lượt
    if (text.length <= 1200) {
      const raw = await translateGtxChunk(text);
      return refineVeterinaryTranslation(raw);
    }

    // Nếu văn bản dài (bài viết chi tiết nhiều đoạn), chia theo đoạn văn bản hoặc thẻ HTML
    const splitRegex = /(<\/p>|<\/h[1-6]>|<\/li>|<\/div>|\n\n)/i;
    const parts = text.split(splitRegex);
    const chunks: string[] = [];
    let currentChunk = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if ((currentChunk + part).length > 800 && currentChunk.trim()) {
        chunks.push(currentChunk);
        currentChunk = part;
      } else {
        currentChunk += part;
      }
    }
    if (currentChunk.trim()) {
      chunks.push(currentChunk);
    }

    const translatedChunks = await Promise.all(
      chunks.map(async (c) => {
        try {
          return await translateGtxChunk(c);
        } catch {
          return c;
        }
      })
    );

    return refineVeterinaryTranslation(translatedChunks.join(''));
  } catch (err) {
    console.error('Translation error:', err);
    return text;
  }
}

// Hàm dịch đa tầng (Hybrid Translation Pipeline)
async function translateSingle(text: string): Promise<string> {
  if (!text || !text.trim()) return '';

  // Bảo vệ thẻ <img> để không bị Google NMT bóp méo đường dẫn src hoặc thuộc tính
  const imgTokens: string[] = [];
  let preparedText = text;
  if (text.includes('<img')) {
    preparedText = text.replace(/<img[^>]*>/gi, (match) => {
      imgTokens.push(match);
      return ` [[IMG_TAG_${imgTokens.length - 1}]] `;
    });
  }

  let translated = '';
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const geminiResult = await translateWithGemini(preparedText, geminiKey);
      if (geminiResult) translated = geminiResult;
    } catch (err) {
      console.warn('Gemini translation fallback to NMT:', err);
    }
  }

  if (!translated) {
    translated = await translateWithGoogleNmt(preparedText);
  }

  // Khôi phục lại toàn bộ thẻ <img> nguyên vẹn
  if (imgTokens.length > 0) {
    translated = translated.replace(/\[\[\s*IMG_TAG_(\d+)\s*\]\]/gi, (match, idx) => {
      const num = parseInt(idx, 10);
      return imgTokens[num] !== undefined ? imgTokens[num] : match;
    });
  }

  return translated;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Dịch danh sách các đoạn văn bản: { texts: ["...", "..."] }
    if (Array.isArray(body.texts)) {
      const translations = await Promise.all(
        body.texts.map(async (t: any) => {
          if (typeof t === 'string' && t.trim()) {
            return await translateSingle(t);
          }
          return '';
        })
      );
      return NextResponse.json({ success: true, translations });
    }

    // 2. Dịch đơn lẻ: { text: "..." }
    if (typeof body.text === 'string') {
      const translated = await translateSingle(body.text);
      return NextResponse.json({ success: true, translation: translated });
    }

    // Tự động map nếu body.texts được truyền dưới dạng đối tượng { key: "value" }
    const fieldMap = (body.fields && typeof body.fields === 'object')
      ? body.fields
      : (body.texts && typeof body.texts === 'object' && !Array.isArray(body.texts))
      ? body.texts
      : null;

    // 3. Dịch hàng loạt các trường đối tượng: { fields: { key1: "val1", key2: "val2" } }
    if (fieldMap) {
      const translatedFields: Record<string, string> = {};
      const entries = Object.entries(fieldMap);

      await Promise.all(
        entries.map(async ([key, val]) => {
          if (typeof val === 'string' && val.trim()) {
            translatedFields[key] = await translateSingle(val);
          } else {
            translatedFields[key] = '';
          }
        })
      );

      return NextResponse.json({ success: true, translations: translatedFields });
    }

    return NextResponse.json({ success: false, error: 'Thiếu dữ liệu dịch (texts, text hoặc fields)' }, { status: 400 });
  } catch (error: any) {
    console.error('API Translate Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Lỗi xử lý dịch thuật' }, { status: 500 });
  }
}
