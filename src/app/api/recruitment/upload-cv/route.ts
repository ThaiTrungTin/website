import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// Rate limiter chống spam tải file CV (tối đa 10 file / IP trong 15 phút)
const uploadRateLimit = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const now = Date.now();
    const rate = uploadRateLimit.get(ip);

    if (rate && rate.resetAt > now) {
      if (rate.count >= 10) {
        return NextResponse.json(
          { success: false, message: 'Bạn đã tải lên quá nhiều file. Vui lòng thử lại sau 15 phút!' },
          { status: 429 }
        );
      }
      rate.count += 1;
    } else {
      uploadRateLimit.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy file để tải lên!' },
        { status: 400 }
      );
    }

    // Giới hạn 15MB
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Dung lượng file vượt quá giới hạn 15MB!' },
        { status: 400 }
      );
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExts = ['pdf', 'doc', 'docx'];
    if (!allowedExts.includes(fileExt)) {
      return NextResponse.json(
        { success: false, message: 'Chỉ chấp nhận file định dạng PDF, DOC, hoặc DOCX!' },
        { status: 400 }
      );
    }

    const cleanBaseName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);

    const uniqueFileName = `${Date.now()}_${cleanBaseName}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    let contentType = file.type || 'application/pdf';
    if (fileExt === 'pdf') contentType = 'application/pdf';
    else if (fileExt === 'doc') contentType = 'application/msword';
    else if (fileExt === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    // Đảm bảo bucket cv_files tồn tại
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const hasBucket = buckets?.some((b) => b.name === 'cv_files');
    if (!hasBucket) {
      await supabaseAdmin.storage.createBucket('cv_files', {
        public: true,
        fileSizeLimit: 20971520,
      });
    }

    // Tải lên Supabase Storage thông qua Service Role (vượt qua hoàn toàn RLS)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('cv_files')
      .upload(uniqueFileName, buffer, {
        contentType,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Lỗi Supabase Admin Storage khi upload CV:', uploadError);
      return NextResponse.json(
        { success: false, message: `Lỗi lưu trữ: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('cv_files')
      .getPublicUrl(uniqueFileName);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error('Lỗi route upload CV tuyển dụng:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Lỗi khi xử lý file tải lên' },
      { status: 500 }
    );
  }
}
