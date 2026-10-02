export interface BranchItem {
  id: string;
  name: string;
  nameEn?: string;
  shortName: string;
  shortNameEn?: string;
  tagline: string;
  taglineEn?: string;
  district: string;
  districtEn?: string;
  address: string;
  addressEn?: string;
  phone: string;
  emergencyPhone: string;
  openHours: string;
  managerDoctor: string;
  managerDoctorEn?: string;
  doctorDegree: string;
  doctorDegreeEn?: string;
  parkingInfo: string;
  parkingInfoEn?: string;
  mapEmbedUrl: string;
  googleMapsAppUrl: string;
  weeklySchedule?: { day: string; hours: string }[];
  features: string[];
  featuresEn?: string[];
}

export const branchesData: BranchItem[] = [
  {
    id: 'branch-thuduc',
    name: 'Phòng Khám Thú Cưng PetM&M',
    shortName: 'Cơ sở TP. Thủ Đức',
    tagline: '',
    district: 'TP. Thủ Đức',
    address: '19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh',
    phone: '0903 599 339',
    emergencyPhone: '0903 599 339',
    openHours: '08:00 - 20:00',
    weeklySchedule: [
      { day: 'Thứ Hai', hours: '08:00 - 20:00' },
      { day: 'Thứ Ba', hours: '08:00 - 20:00' },
      { day: 'Thứ Tư', hours: '08:00 - 20:00' },
      { day: 'Thứ Năm', hours: '08:00 - 20:00' },
      { day: 'Thứ Sáu', hours: '08:00 - 20:00' },
      { day: 'Thứ Bảy', hours: '08:00 - 20:00' },
      { day: 'Chủ Nhật', hours: '08:00 - 20:00' },
    ],
    managerDoctor: 'BS. CKI Nguyễn Minh Tuấn',
    doctorDegree: 'Bác sĩ chuyên khoa Phẫu thuật & Hồi sức cấp cứu',
    parkingInfo: 'Có bãi đỗ xe ô tô và xe máy rộng rãi, bảo vệ hỗ trợ',
    mapEmbedUrl: 'https://maps.google.com/maps?q=Ph%C3%B2ng+kh%C3%A1m+Th%C3%BA+c%C6%B0ng+PetM%26M,+19+%C4%90.+S%E1%BB%91+1,+Ph%C6%B0%E1%BB%9Bc+Long,+H%E1%BB%93+Ch%C3%AD+Minh&t=&z=16&ie=UTF8&iwloc=&output=embed',
    googleMapsAppUrl: 'https://www.google.com/maps/place/Ph%C3%B2ng+kh%C3%A1m+Th%C3%BA+c%C6%B0ng+PetM%26M/@10.825,106.765,17z',
    features: [
      'Phòng mổ vô trùng áp lực dương',
      'Máy chụp X-quang kỹ thuật số & Siêu âm Doppler',
      'Khu nội trú cách ly chuyên biệt Chó - Mèo',
      'Đội ngũ cấp cứu ngoại viện Pet Ambulance'
    ]
  }
];
