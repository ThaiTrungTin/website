import { redirect } from 'next/navigation';

export default function DanhGiaDichVuIndexPage() {
  // Khi người dùng hoặc duyệt viên Zalo vào trực tiếp /danhgiadichvu -> chuyển hướng sang bản demo
  redirect('/danhgiadichvu/demo');
}
