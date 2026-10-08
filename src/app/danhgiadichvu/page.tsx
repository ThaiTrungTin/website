import { redirect } from 'next/navigation';

export default function DanhGiaDichVuIndexPage() {
  // Khi người dùng vào trực tiếp /danhgiadichvu mà không có mã -> chuyển hướng về trang chủ
  redirect('/');
}
