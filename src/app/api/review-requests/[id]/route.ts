import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id || '').trim();

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: 'Mã đánh giá không hợp lệ' },
        { status: 404 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('yeu_cau_danh_gia')
      .select('*')
      .eq('ma_danh_gia', cleanId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[API Review Detail GET] Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy yêu cầu đánh giá' },
        { status: 404 }
      );
    }

    let cleanHinhAnh = data.hinh_anh;
    if (cleanHinhAnh && typeof cleanHinhAnh === 'string' && cleanHinhAnh.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanHinhAnh);
        cleanHinhAnh = parsed?.img || null;
      } catch {
        cleanHinhAnh = null;
      }
    }

    return NextResponse.json({ success: true, data: { ...data, hinh_anh: cleanHinhAnh } });
  } catch (err: any) {
    console.error('[API Review Detail GET] Exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id || '').trim();

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: 'Mã đánh giá không hợp lệ' },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // Hỗ trợ duyệt viên Zalo test gửi form đánh giá thử
    const isDemoId = cleanId.toLowerCase() === 'demo' || cleanId.toLowerCase() === 'test' || cleanId === '<demo>' || cleanId === '<review_code>' || cleanId.toLowerCase() === 'review_code' || cleanId.startsWith('demo-');
    if (isDemoId) {
      return NextResponse.json({
        success: true,
        data: {
          id: 'demo-sample-id',
          ma_danh_gia: cleanId,
          ten_khach_hang: 'Khách hàng Trải nghiệm (Bản xem trước Zalo)',
          so_sao: body.so_sao || 5,
          noi_dung_danh_gia: body.noi_dung_danh_gia || 'Dịch vụ rất tốt!',
          trang_thai: 'da_danh_gia',
          ngay_danh_gia: new Date().toISOString(),
        },
        message: 'Đánh giá thử nghiệm thành công!',
      });
    }

    // 1. Kiểm tra mã đánh giá có tồn tại trong hệ thống không
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('yeu_cau_danh_gia')
      .select('*')
      .eq('ma_danh_gia', cleanId)
      .limit(1)
      .maybeSingle();

    if (fetchErr) {
      console.error('[API Review Detail POST] Fetch error:', fetchErr);
      return NextResponse.json({ success: false, error: fetchErr.message }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy yêu cầu đánh giá' },
        { status: 404 }
      );
    }

    // 2. Nếu đã đánh giá rồi, trả về luôn để hiển thị màn hình cảm ơn (không cho gửi lại)
    if (existing.trang_thai === 'da_danh_gia') {
      return NextResponse.json({
        success: true,
        alreadySubmitted: true,
        data: existing,
        message: 'Đánh giá đã được ghi nhận trước đó',
      });
    }

    // 3. Nhận dữ liệu đánh giá từ body
    const so_sao = Number(body.so_sao);
    if (!so_sao || so_sao < 1 || so_sao > 5) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn số sao đánh giá (từ 1 đến 5 sao)' },
        { status: 400 }
      );
    }

    const cleanNoiDung = typeof body.noi_dung_danh_gia === 'string' ? body.noi_dung_danh_gia.trim() : '';
    const cleanHinhAnh = typeof body.hinh_anh === 'string' ? body.hinh_anh.trim() : null;

    let creatorName = 'Ban Quản Trị';
    if (existing.hinh_anh && existing.hinh_anh.startsWith('{')) {
      try {
        const parsed = JSON.parse(existing.hinh_anh);
        if (parsed?.nguoi_tao) creatorName = parsed.nguoi_tao;
      } catch {}
    }

    const updatePayload = {
      so_sao,
      noi_dung_danh_gia: cleanNoiDung || null,
      hinh_anh: JSON.stringify({ nguoi_tao: creatorName, img: cleanHinhAnh }),
      trang_thai: 'da_danh_gia',
      ngay_danh_gia: new Date().toISOString(),
      ngay_cap_nhat: new Date().toISOString(),
    };

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('yeu_cau_danh_gia')
      .update(updatePayload)
      .eq('id', existing.id)
      .select()
      .single();

    if (updateErr) {
      console.error('[API Review Detail POST] Update error:', updateErr);
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    // 4. Đồng bộ đánh giá vào bảng public.danh_gia
    try {
      const createdDate = existing.ngay_tao ? new Date(existing.ngay_tao) : new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timeStr = `${pad(createdDate.getDate())}/${pad(createdDate.getMonth() + 1)}/${createdDate.getFullYear()} ${pad(createdDate.getHours())}:${pad(createdDate.getMinutes())}:${pad(createdDate.getSeconds())}`;

      const fallbackVi = `Khách hàng đánh giá ${so_sao} sao ⭐`;
      const fallbackEn = `Customer rated ${so_sao} stars ⭐`;

      const publicReview = {
        ten_khach_hang: existing.ten_khach_hang || 'Khách hàng PetM&M',
        so_dien_thoai: existing.so_dien_thoai || '0903 *** ***',
        so_sao: so_sao,
        noi_dung: cleanNoiDung || fallbackVi,
        noi_dung_en: cleanNoiDung || fallbackEn,
        chi_nhanh: existing.co_so || 'Hệ Thống Thú Y PetM&M',
        hinh_anh_thu_cung: cleanHinhAnh || null,
        ngay_danh_gia: new Date().toISOString().split('T')[0],
        da_xac_thuc: true,
        kich_hoat: true,
        thu_tu: 1,
      };

      await supabaseAdmin.from('danh_gia').insert([publicReview]);
    } catch (syncErr) {
      console.warn('[API Review Detail POST] Sync public review warning:', syncErr);
    }

    const sanitizedUpdated = {
      ...updated,
      hinh_anh: cleanHinhAnh,
    };

    return NextResponse.json({
      success: true,
      data: sanitizedUpdated,
      message: 'Gửi đánh giá thành công',
    });
  } catch (err: any) {
    console.error('[API Review Detail POST] Exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
