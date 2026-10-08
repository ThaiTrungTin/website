import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';
import { logAuditServer } from '@/lib/auditLogger';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Bạn chưa đăng nhập quản trị!' },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('lich_hen')
      .select('*')
      .order('ngay_tao', { ascending: false });

    if (error) {
      console.error('Lỗi lấy danh sách lịch hẹn từ database:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err: any) {
    console.error('Lỗi API appointments GET:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Thiếu ID lịch hẹn!' },
        { status: 400 }
      );
    }

    // 1. Lấy dữ liệu cũ trước khi cập nhật để đối soát trạng thái và diff
    const { data: oldApp } = await supabaseAdmin
      .from('lich_hen')
      .select('*')
      .eq('id', id)
      .single();

    updates.ngay_cap_nhat = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('lich_hen')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Lỗi cập nhật lịch hẹn qua admin API:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Ghi nhật ký hoạt động
    const statusLabels: Record<string, string> = {
      cho_xac_nhan: 'Chờ xác nhận',
      da_xac_nhan: 'Đã xác nhận',
      da_kham: 'Đã hoàn thành khám',
      da_huy: 'Đã hủy',
    };

    const customerName =
      data?.ho_ten_chu ||
      data?.ten_khach_hang ||
      oldApp?.ho_ten_chu ||
      oldApp?.ten_khach_hang ||
      updates?.ho_ten_chu ||
      updates?.ten_khach_hang ||
      'Khách';
    const customerPhone = data?.so_dien_thoai || oldApp?.so_dien_thoai || updates?.so_dien_thoai || '—';
    const appointmentCode = data?.ma_lich_hen || oldApp?.ma_lich_hen || id.slice(0, 8);

    const normalizeVal = (val: any): string => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'string') return val.trim();
      if (typeof val === 'number' || typeof val === 'boolean') return String(val);
      return JSON.stringify(val);
    };

    let actionDesc = '';
    let duLieuThayDoi: any = { id, ma_lich_hen: appointmentCode, khach_hang: customerName };

    if (updates.so_lan_gui_zalo) {
      actionDesc = `Gửi tin Zalo ZNS lần ${updates.so_lan_gui_zalo} cho khách "${customerName}" (SĐT: ${customerPhone})`;
      duLieuThayDoi = {
        loai_thao_tac: 'gui_zalo',
        lan_gui: `Lần ${updates.so_lan_gui_zalo}`,
        so_dien_thoai: customerPhone,
        khach_hang: customerName,
        ma_lich_hen: appointmentCode,
        trang_thai_zalo: updates.trang_thai_zalo || 'thanh_cong',
        diffs: {
          so_lan_gui_zalo: {
            cu: (oldApp?.so_lan_gui_zalo || 0) > 0 ? `Lần ${oldApp.so_lan_gui_zalo}` : 'Chưa gửi',
            moi: `Lần ${updates.so_lan_gui_zalo}`,
          },
          ...(updates.trang_thai && oldApp && oldApp.trang_thai !== updates.trang_thai
            ? {
                trang_thai: {
                  cu: statusLabels[oldApp.trang_thai] || oldApp.trang_thai,
                  moi: statusLabels[updates.trang_thai] || updates.trang_thai,
                },
              }
            : {}),
        },
      };
    } else if (updates.so_lan_gui_email) {
      actionDesc = `Gửi email xác nhận lịch hẹn lần ${updates.so_lan_gui_email} cho khách "${customerName}"`;
      duLieuThayDoi = {
        loai_thao_tac: 'gui_email',
        lan_gui: `Lần ${updates.so_lan_gui_email}`,
        so_dien_thoai: customerPhone,
        khach_hang: customerName,
        ma_lich_hen: appointmentCode,
        diffs: {
          so_lan_gui_email: {
            cu: (oldApp?.so_lan_gui_email || 0) > 0 ? `Lần ${oldApp.so_lan_gui_email}` : 'Chưa gửi',
            moi: `Lần ${updates.so_lan_gui_email}`,
          },
          ...(updates.trang_thai && oldApp && oldApp.trang_thai !== updates.trang_thai
            ? {
                trang_thai: {
                  cu: statusLabels[oldApp.trang_thai] || oldApp.trang_thai,
                  moi: statusLabels[updates.trang_thai] || updates.trang_thai,
                },
              }
            : {}),
        },
      };
    } else if (updates.trang_thai && oldApp && oldApp.trang_thai !== updates.trang_thai) {
      const oldLabel = statusLabels[oldApp.trang_thai] || oldApp.trang_thai;
      const newLabel = statusLabels[updates.trang_thai] || updates.trang_thai;
      const isConfirm = updates.trang_thai === 'da_xac_nhan';
      const isCancel = updates.trang_thai === 'da_huy';
      const isCompleted = updates.trang_thai === 'da_kham';

      if (isConfirm) {
        actionDesc = `Xác nhận lịch hẹn khách "${customerName}" (Mã #${appointmentCode})`;
      } else if (isCancel) {
        actionDesc = `Hủy lịch hẹn của khách "${customerName}" (Mã #${appointmentCode})`;
      } else if (isCompleted) {
        actionDesc = `Hoàn thành khám cho bé cưng của khách "${customerName}" (Mã #${appointmentCode})`;
      } else {
        actionDesc = `Đổi trạng thái lịch hẹn khách "${customerName}" từ "${oldLabel}" sang "${newLabel}"`;
      }

      const diffs: Record<string, { cu: any; moi: any }> = {
        trang_thai: { cu: oldLabel, moi: newLabel },
      };

      for (const [k, v] of Object.entries(updates)) {
        if (k === 'id' || k === 'ngay_cap_nhat' || k === 'trang_thai') continue;
        const oldVal = (oldApp as any)?.[k];
        if (normalizeVal(oldVal) !== normalizeVal(v)) {
          diffs[k] = { cu: oldVal ?? null, moi: v ?? null };
        }
      }

      duLieuThayDoi = {
        loai_thao_tac: isConfirm ? 'xac_nhan_lich' : isCancel ? 'huy_lich' : 'doi_trang_thai',
        khach_hang: customerName,
        so_dien_thoai: customerPhone,
        ma_lich_hen: appointmentCode,
        dich_vu: data?.dich_vu || oldApp?.dich_vu,
        ngay_hen: data?.ngay_hen || oldApp?.ngay_hen,
        gio_hen: data?.gio_hen || oldApp?.gio_hen,
        diffs,
      };
    } else {
      const diffs: Record<string, { cu: any; moi: any }> = {};
      const changedKeys: string[] = [];
      for (const [k, v] of Object.entries(updates)) {
        if (k === 'id' || k === 'ngay_cap_nhat') continue;
        const oldVal = (oldApp as any)?.[k];
        if (normalizeVal(oldVal) !== normalizeVal(v)) {
          diffs[k] = { cu: oldVal ?? null, moi: v ?? null };
          changedKeys.push(k);
        }
      }
      actionDesc = `Cập nhật thông tin lịch hẹn khách "${customerName}"${changedKeys.length ? ` (${changedKeys.length} trường thay đổi)` : ''}`;
      duLieuThayDoi = {
        loai_thao_tac: 'chinh_sua_lich',
        khach_hang: customerName,
        so_dien_thoai: customerPhone,
        ma_lich_hen: appointmentCode,
        diffs,
      };
    }

    await logAuditServer({
      nguoi_thuc_hien: currentUser.ho_ten || currentUser.username,
      vai_tro: currentUser.vai_tro,
      hanh_dong: updates.trang_thai || updates.so_lan_gui_zalo || updates.so_lan_gui_email ? 'XU_LY' : 'SUA',
      chuyen_muc: 'Lịch hẹn',
      chi_tiet: actionDesc,
      du_lieu_thay_doi: duLieuThayDoi,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('Lỗi API appointments PATCH:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Bạn chưa đăng nhập quản trị!' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Thiếu ID lịch hẹn!' },
        { status: 400 }
      );
    }

    // Lấy thông tin lịch hẹn trước khi xóa để ghi nhật ký
    const { data: existingApp } = await supabaseAdmin
      .from('lich_hen')
      .select('ten_khach_hang, so_dien_thoai, ngay_hen, gio_hen, dich_vu')
      .eq('id', id)
      .single();

    const { error } = await supabaseAdmin.from('lich_hen').delete().eq('id', id);

    if (error) {
      console.error('Lỗi xóa lịch hẹn qua admin API:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Ghi nhật ký hoạt động
    await logAuditServer({
      nguoi_thuc_hien: currentUser.ho_ten || currentUser.username,
      vai_tro: currentUser.vai_tro,
      hanh_dong: 'XOA',
      chuyen_muc: 'Lịch hẹn',
      chi_tiet: `Xóa lịch hẹn của khách "${existingApp?.ten_khach_hang || 'Ẩn danh'}" (SĐT: ${existingApp?.so_dien_thoai || '—'}, Ngày: ${existingApp?.ngay_hen || '—'} ${existingApp?.gio_hen || ''})`,
      du_lieu_thay_doi: { id, deleted: existingApp },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Lỗi API appointments DELETE:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}

