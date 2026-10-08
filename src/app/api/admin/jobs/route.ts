import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';
import { logAuditServer } from '@/lib/auditLogger';

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
      .from('tuyen_dung')
      .select('*')
      .order('thu_tu', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Lỗi lấy danh sách tuyển dụng từ database:', error);
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
    console.error('Lỗi API jobs GET:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}

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
    if (!body || !body.tieu_de) {
      return NextResponse.json(
        { success: false, message: 'Tiêu đề tuyển dụng không được để trống!' },
        { status: 400 }
      );
    }

    // Xóa trường anh_goc nếu table trong DB chưa có cột này để tránh lỗi Supabase
    delete body.anh_goc;

    const { data, error } = await supabaseAdmin
      .from('tuyen_dung')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Lỗi thêm bài tuyển dụng:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Ghi nhật ký hoạt động
    await logAuditServer({
      nguoi_thuc_hien: currentUser.ho_ten || currentUser.username,
      vai_tro: currentUser.vai_tro,
      hanh_dong: 'THEM',
      chuyen_muc: 'Tuyển dụng',
      chi_tiet: `Thêm vị trí tuyển dụng mới: "${body.tieu_de}"`,
      du_lieu_thay_doi: { id: data.id, tieu_de: body.tieu_de },
    });

    return NextResponse.json({
      success: true,
      message: 'Đã thêm vị trí tuyển dụng mới thành công!',
      data,
    });
  } catch (err: any) {
    console.error('Lỗi API jobs POST:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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
        { success: false, message: 'Thiếu ID tuyển dụng!' },
        { status: 400 }
      );
    }

    delete updates.anh_goc;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('tuyen_dung')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Lỗi cập nhật bài tuyển dụng:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật vị trí tuyển dụng thành công!',
      data,
    });
  } catch (err: any) {
    console.error('Lỗi API jobs PUT:', err);
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
        { success: false, message: 'Thiếu ID tuyển dụng!' },
        { status: 400 }
      );
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('tuyen_dung')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Lỗi cập nhật trạng thái tuyển dụng:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật trạng thái tuyển dụng!',
      data,
    });
  } catch (err: any) {
    console.error('Lỗi API jobs PATCH:', err);
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
        { success: false, message: 'Thiếu ID tuyển dụng cần xóa!' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('tuyen_dung')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Lỗi xóa bài tuyển dụng:', error);
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
      chuyen_muc: 'Tuyển dụng',
      chi_tiet: `Xóa vị trí tuyển dụng (Mã #${id.slice(0, 8)})`,
      du_lieu_thay_doi: { deletedJobId: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Đã xóa vị trí tuyển dụng thành công!',
    });
  } catch (err: any) {
    console.error('Lỗi API jobs DELETE:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}
