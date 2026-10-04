import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tạo Đánh Giá Dịch Vụ — PetM&M',
  description: 'Tạo liên kết khảo sát và mã QR đánh giá dịch vụ cho khách hàng tại Bệnh Viện Thú Y PetM&M.',
  robots: { index: false, follow: false },
};

export default function TaoDanhGiaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
