/**
 * Helper gọi API quản trị nội dung an toàn qua máy chủ Server
 * Đảm bảo chỉ Quản trị viên đã đăng nhập mới có quyền Thêm/Sửa/Xóa
 */
export async function mutateAdminContent(
  table: 'bai_viet' | 'chi_nhanh' | 'dich_vu' | 'doi_ngu_y_te' | 'danh_gia' | 'cau_hoi_thuong_gap' | 'hinh_anh',
  action: 'insert' | 'update' | 'delete' | 'set_main_branch',
  id?: string,
  payload?: any
) {
  const res = await fetch('/api/admin/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, action, id, payload }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Lỗi thao tác dữ liệu qua máy chủ');
  }

  return data;
}
