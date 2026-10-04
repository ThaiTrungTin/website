import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Tạo mã đánh giá ngẫu nhiên 6 chữ số không trùng lặp
async function generateUniqueReviewCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const { data } = await supabaseAdmin
      .from('yeu_cau_danh_gia')
      .select('id')
      .eq('ma_danh_gia', code)
      .limit(1);

    if (!data || data.length === 0) {
      return code;
    }
  }
  // Fallback nếu số 6 chữ số bị trùng nhiều: dùng timestamp + random 4 số
  return `${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const { data, error } = await supabaseAdmin
      .from('yeu_cau_danh_gia')
      .select('*')
      .order('ngay_tao', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[API Review Requests GET] Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const mapped = (data || []).map((item) => {
      let nguoi_tao = 'Nhân viên';
      let cleanHinhAnh = item.hinh_anh;
      if (item.hinh_anh && item.hinh_anh.startsWith('{')) {
        try {
          const parsed = JSON.parse(item.hinh_anh);
          if (parsed?.nguoi_tao) nguoi_tao = parsed.nguoi_tao;
          cleanHinhAnh = parsed?.img || null;
        } catch {}
      }
      return {
        ...item,
        nguoi_tao,
        hinh_anh: cleanHinhAnh,
      };
    });

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    console.error('[API Review Requests GET] Exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      ten_khach_hang,
      so_dien_thoai,
      email,
      co_so,
      ma_hoa_don,
      nguoi_tao,
    } = body;

    const cleanTenKH = typeof ten_khach_hang === 'string' ? ten_khach_hang.trim() : '';
    if (!cleanTenKH) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập tên khách hàng' },
        { status: 400 }
      );
    }

    const cleanMaHD = typeof ma_hoa_don === 'string' ? ma_hoa_don.trim() : '';
    const cleanNguoiTao = typeof nguoi_tao === 'string' && nguoi_tao.trim() ? nguoi_tao.trim() : 'Nhân viên lễ tân';
    let finalReviewCode = '';

    // Nếu có Mã Hóa Đơn -> Lấy Mã Hóa Đơn làm mã đánh giá và kiểm tra không trùng lặp
    if (cleanMaHD) {
      // Kiểm tra xem mã hóa đơn đã tồn tại trong DB chưa
      const { data: existingHD, error: checkErr } = await supabaseAdmin
        .from('yeu_cau_danh_gia')
        .select('id, ma_hoa_don, ma_danh_gia')
        .or(`ma_hoa_don.eq."${cleanMaHD}",ma_danh_gia.eq."${cleanMaHD}"`)
        .limit(1);

      if (checkErr) {
        console.error('[API Review Requests POST] Check HD error:', checkErr);
      }

      if (existingHD && existingHD.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Mã hóa đơn "${cleanMaHD}" đã tồn tại trong hệ thống. Vui lòng kiểm tra lại!`,
          },
          { status: 400 }
        );
      }

      finalReviewCode = cleanMaHD;
    } else {
      // Tự động tạo mã ngẫu nhiên không trùng lặp
      finalReviewCode = await generateUniqueReviewCode();
    }

    const newRecord = {
      ma_danh_gia: finalReviewCode,
      ma_hoa_don: cleanMaHD || null,
      ten_khach_hang: cleanTenKH,
      so_dien_thoai: typeof so_dien_thoai === 'string' ? so_dien_thoai.trim() || null : null,
      email: typeof email === 'string' ? email.trim() || null : null,
      co_so: typeof co_so === 'string' ? co_so.trim() || null : null,
      trang_thai: 'cho_danh_gia',
      hinh_anh: JSON.stringify({ nguoi_tao: cleanNguoiTao }),
      ngay_tao: new Date().toISOString(),
      ngay_cap_nhat: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('yeu_cau_danh_gia')
      .insert([newRecord])
      .select()
      .single();

    if (insertError) {
      console.error('[API Review Requests POST] Insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Không thể tạo yêu cầu đánh giá: ' + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: inserted,
      message: 'Tạo mã đánh giá thành công',
    });
  } catch (err: any) {
    console.error('[API Review Requests POST] Exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
