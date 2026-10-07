import { NextRequest, NextResponse } from 'next/server';
import { sendZaloZnsReviewNotification } from '@/lib/zalo';
import { verifyToken } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Bạn chưa đăng nhập hệ thống!' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { phone, customerName, orderId, reviewCode } = body;

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { success: false, message: 'Số điện thoại của khách không được để trống!' },
        { status: 400 }
      );
    }

    if (!reviewCode || !reviewCode.trim()) {
      return NextResponse.json(
        { success: false, message: 'Mã đánh giá không hợp lệ!' },
        { status: 400 }
      );
    }

    let branchAddress = (body.address || body.shop_address || '').trim();
    let branchName = (body.shopName || body.shop_name || body.coSo || '').trim();

    // Nếu chưa có địa chỉ cụ thể, tìm kiếm theo cơ sở trong yêu cầu đánh giá hoặc chi_nhanh
    if (!branchAddress || !branchName) {
      try {
        let coSoName = branchName;
        if (!coSoName) {
          const { data: revRec } = await supabaseAdmin
            .from('yeu_cau_danh_gia')
            .select('co_so')
            .eq('ma_danh_gia', reviewCode.trim())
            .maybeSingle();
          if (revRec?.co_so) coSoName = revRec.co_so;
        }

        if (coSoName) {
          branchName = branchName || coSoName;
          const { data: cnRec } = await supabaseAdmin
            .from('chi_nhanh')
            .select('dia_chi, ten_chi_nhanh')
            .ilike('ten_chi_nhanh', `%${coSoName}%`)
            .maybeSingle();
          if (cnRec?.dia_chi) {
            branchAddress = cnRec.dia_chi;
          }
        }
      } catch (err) {
        console.warn('[send-review] Lookup branch address error:', err);
      }
    }

    if (!branchAddress) {
      branchAddress = '19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức';
    }
    if (!branchName) {
      branchName = 'Bệnh viện Thú y PetM&M';
    }

    const result = await sendZaloZnsReviewNotification({
      phone: phone.trim(),
      customerName: (customerName || 'Quý khách').trim(),
      orderId: (orderId || reviewCode).trim(),
      reviewCode: reviewCode.trim(),
      shopName: branchName,
      address: branchAddress,
    });

    if (result.success) {
      // Cập nhật số lần gửi và trạng thái thành công trong yeu_cau_danh_gia
      try {
        const { data: currentRec } = await supabaseAdmin
          .from('yeu_cau_danh_gia')
          .select('so_lan_gui_zalo')
          .eq('ma_danh_gia', reviewCode.trim())
          .limit(1)
          .single();

        const currentCount = currentRec?.so_lan_gui_zalo || 0;
        await supabaseAdmin
          .from('yeu_cau_danh_gia')
          .update({
            so_lan_gui_zalo: currentCount + 1,
            trang_thai_zalo: 'thanh_cong',
            ngay_cap_nhat: new Date().toISOString(),
          })
          .eq('ma_danh_gia', reviewCode.trim());
      } catch (dbErr) {
        console.warn('Lỗi cập nhật số lần gửi Zalo vào yeu_cau_danh_gia:', dbErr);
      }

      return NextResponse.json({
        success: true,
        message: result.message || 'Đã gửi tin nhắn Zalo OA ZNS tới khách hàng!',
        data: result.data,
      });
    } else {
      // Đánh dấu trạng thái lỗi
      try {
        await supabaseAdmin
          .from('yeu_cau_danh_gia')
          .update({
            trang_thai_zalo: 'that_bai',
            ngay_cap_nhat: new Date().toISOString(),
          })
          .eq('ma_danh_gia', reviewCode.trim());
      } catch {}

      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Gửi Zalo ZNS thất bại.',
          error: result.error,
          data: result.data,
        },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error('[API Send Zalo Review Error]:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi xử lý gửi Zalo OA' },
      { status: 500 }
    );
  }
}
