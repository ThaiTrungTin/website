import { notFound } from 'next/navigation';

export default function DanhGiaDichVuIndexPage() {
  // Khi người dùng cố tình truy cập /danhgiadichvu mà không có mã đánh giá -> Trả về 404
  notFound();
}
