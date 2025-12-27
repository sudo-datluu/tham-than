// lib/constants.ts

export const PROVINCES = [
  'Hà Nội',
  'Hồ Chí Minh',
  'Hải Phòng',
  'Đà Nẵng',
  'Cần Thơ',
  'Huế',
  'Quảng Ninh',
  'Cao Bằng',
  'Lạng Sơn',
  'Lai Châu',
  'Điện Biên',
  'Sơn La',
  'Thanh Hóa',
  'Nghệ An',
  'Hà Tĩnh',
  'Tuyên Quang',
  'Lào Cai',
  'Thái Nguyên',
  'Phú Thọ',
  'Bắc Ninh',
  'Hưng Yên',
  'Ninh Bình',
  'Quảng Trị',
  'Quảng Ngãi',
  'Gia Lai',
  'Khánh Hòa',
  'Lâm Đồng',
  'Đắk Lắk',
  'Đồng Nai',
  'Tây Ninh',
  'Vĩnh Long',
  'Đồng Tháp',
  'Cà Mau',
  'An Giang',
];

export const RELATIONSHIPS = [
  'Bố',
  'Mẹ',
  'Anh',
  'Chị',
  'Em',
  'Ông',
  'Bà',
  'Cô',
  'Dì',
  'Chú',
  'Bác',
  'Cậu',
  'Mợ',
  'Thím',
];

export const VEHICLE_TYPES = [
  { value: 'car', label: 'Ô tô' },
  { value: 'motorbike', label: 'Xe máy' },
];

// Cấu trúc đơn vị
export const UNIT_STRUCTURE = {
  '901': {
    name: 'Tiểu đoàn 901',
    subUnits: [
      { value: '901-D1', label: 'Đại đội 1' },
      { value: '901-D2', label: 'Đại đội 2' },
    ],
  },
  '902': {
    name: 'Tiểu đoàn 902',
    subUnits: [
      { value: '902-D4', label: 'Đại đội 4' },
      { value: '902-D5', label: 'Đại đội 5' },
    ],
  },
  '903': {
    name: 'Tiểu đoàn 903',
    subUnits: [
      { value: '903-D7', label: 'Đại đội 7' },
      { value: '903-D8', label: 'Đại đội 8' },
    ],
  },
  'D66': {
    name: 'Đại đội 66',
    subUnits: [], // Không có subunit
  },
  'CQLDB': {
    name: 'Cơ quan lữ đoàn bộ',
    subUnits: [
      { value: 'CQLDB-VB', label: 'Trung đội vệ binh' },
      { value: 'CQLDB-TT', label: 'Đại đội thông tin' },
    ],
  },
};

export const MAIN_UNITS = [
  { value: '901', label: 'Tiểu đoàn 901' },
  { value: '902', label: 'Tiểu đoàn 902' },
  { value: '903', label: 'Tiểu đoàn 903' },
  { value: 'D66', label: 'Đại đội 66' },
  { value: 'CQLDB', label: 'Cơ quan lữ đoàn bộ' },
];

// Helper function để lấy T7, CN tiếp theo trong 7 ngày
export function getUpcomingWeekends(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i <= 6; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();
    
    // 0 = Chủ nhật, 6 = Thứ 7
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      dates.push(date);
    }
  }

  return dates;
}