import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PetM&M - Đánh giá dịch vụ',
  description: 'Khảo sát chất lượng dịch vụ Bệnh Viện Thú Y PetM&M. Ý kiến của bạn giúp chúng tôi phục vụ tốt hơn.',
  robots: { index: false, follow: false },
};

export default function DanhGiaDichVuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
