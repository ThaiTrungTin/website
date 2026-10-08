import { NextRequest, NextResponse } from 'next/server';
import { sendZaloZnsBookingNotification } from '@/lib/zalo';
import { verifyToken } from '@/lib/adminAuth';
import { getTranslatedBranch, getTranslatedServices } from '@/lib/mailer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logAuditServer } from '@/lib/auditLogger';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Bạn chưa đăng nhập quản trị!' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      bookingId,
      phone,
      bookingCode,
      ownerName,
      petName,
      service,
      dateTime,
      branchName,
      isEn = false,
    } = body;

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { success: false, message: 'Số điện thoại không được để trống!' },
        { status: 400 }
      );
    }

    // Nếu người dùng chọn Tiếng Anh (isEn = true), tự động dịch cơ sở và dịch vụ sang tiếng Anh
    const finalBranchName = isEn
      ? await getTranslatedBranch(branchName || '', true)
      : (branchName || 'Bệnh Viện Thú Y PetM&M').trim();

    const finalService = isEn
      ? await getTranslatedServices(service || '', true)
      : (service || 'Tư vấn & Chăm sóc').trim();

    const finalPetName = isEn && (!petName || petName === 'Bé cưng')
      ? 'Beloved Pet'
      : (petName || 'Bé cưng').trim();

    const result = await sendZaloZnsBookingNotification({
      phone: phone.trim(),
      bookingCode: bookingCode || 'PMM-000000',
      ownerName: (ownerName || (isEn ? 'Valued Customer' : 'Quý khách')).trim(),
      petName: finalPetName,
      service: finalService,
      dateTime: dateTime || (isEn ? 'Today' : 'Hôm nay'),
      branchName: finalBranchName,
    });

    const targetQuery = bookingId
      ? supabaseAdmin.from('lich_hen').select('id, so_lan_gui_zalo').eq('id', bookingId).single()
      : bookingCode
      ? supabaseAdmin.from('lich_hen').select('id, so_lan_gui_zalo').eq('ma_lich_hen', bookingCode).single()
      : null;

    let targetBooking: any = null;
    if (targetQuery) {
      const { data } = await targetQuery;
      targetBooking = data;
    }

    if (result.success) {
      let newCount = 1;
      if (targetBooking?.id) {
        newCount = (targetBooking.so_lan_gui_zalo || 0) + 1;
        await supabaseAdmin
          .from('lich_hen')
          .update({
            so_lan_gui_zalo: newCount,
            trang_thai_zalo: 'thanh_cong',
            trang_thai: 'da_kham',
            ngay_cap_nhat: new Date().toISOString(),
          })
          .eq('id', targetBooking.id);
      }

      await logAuditServer({
        nguoi_thuc_hien: currentUser.ho_ten || currentUser.username,
        vai_tro: currentUser.vai_tro,
        hanh_dong: 'XU_LY',
        chuyen_muc: 'Lịch hẹn',
        chi_tiet: `Gửi tin Zalo ZNS lần ${newCount} cho khách "${ownerName || 'Khách'}" (SĐT: ${phone})`,
        du_lieu_thay_doi: {
          loai_thao_tac: 'gui_zalo',
          lan_gui: `Lần ${newCount}`,
          so_dien_thoai: phone,
          khach_hang: ownerName,
          ma_lich_hen: bookingCode,
          co_so: finalBranchName,
          dich_vu: finalService,
          ket_qua: result.mock ? 'Mô phỏng thành công' : 'Thành công',
          diffs: {
            so_lan_gui_zalo: {
              cu: (targetBooking?.so_lan_gui_zalo || 0) > 0 ? `Lần ${targetBooking.so_lan_gui_zalo}` : 'Chưa gửi',
              moi: `Lần ${newCount}`,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        so_lan_gui_zalo: newCount,
        trang_thai_zalo: 'thanh_cong',
        mock: result.mock,
        message: result.mock
          ? `Mô phỏng gửi tin Zalo ZNS thành công tới ${phone} (Chưa gắn Zalo OA Secret Key)`
          : `Đã gửi tin nhắn Zalo ZNS thành công tới ${phone}!`,
      });
    } else {
      if (targetBooking?.id) {
        await supabaseAdmin
          .from('lich_hen')
          .update({
            trang_thai_zalo: 'that_bai',
            ngay_cap_nhat: new Date().toISOString(),
          })
          .eq('id', targetBooking.id);
      }

      await logAuditServer({
        nguoi_thuc_hien: currentUser.ho_ten || currentUser.username,
        vai_tro: currentUser.vai_tro,
        hanh_dong: 'XU_LY',
        chuyen_muc: 'Lịch hẹn',
        chi_tiet: `Gửi tin Zalo ZNS thất bại tới khách "${ownerName || 'Khách'}" (SĐT: ${phone}): ${result.error || 'Lỗi gửi tin'}`,
        du_lieu_thay_doi: {
          loai_thao_tac: 'gui_zalo_that_bai',
          so_dien_thoai: phone,
          khach_hang: ownerName,
          ma_lich_hen: bookingCode,
          ly_do: result.error,
        },
      });

      return NextResponse.json({
        success: false,
        trang_thai_zalo: 'that_bai',
        message: result.message || 'Không thể gửi tin Zalo ZNS.',
      });
    }
  } catch (err: any) {
    console.error('Lỗi API gửi Zalo ZNS từ Admin:', err);
    return NextResponse.json(
      { success: false, message: `Lỗi máy chủ: ${err.message || 'Không xác định'}` },
      { status: 500 }
    );
  }
}
