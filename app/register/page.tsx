'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PROVINCES,
  RELATIONSHIPS,
  VEHICLE_TYPES,
  MAIN_UNITS,
  UNIT_STRUCTURE,
  getUpcomingWeekends,
} from '@/lib/constants';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    soldierName: '',
    mainUnit: '',
    subUnit: '',
    relativeName: '',
    relationship: '',
    visitDate: '',
    province: '',
    ward: '',
    numberOfVisitors: 1,
    vehicleType: '',
    vehicleCount: 1,
    phoneNumber: '',
  });

  const upcomingWeekends = getUpcomingWeekends();
  const selectedMainUnit = formData.mainUnit;
  const subUnits = selectedMainUnit ? UNIT_STRUCTURE[selectedMainUnit as keyof typeof UNIT_STRUCTURE]?.subUnits || [] : [];

  const handleMainUnitChange = (value: string) => {
    setFormData({
      ...formData,
      mainUnit: value,
      subUnit: '', // Reset subunit khi đổi main unit
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Xác định unitId cuối cùng
      let finalUnitId = formData.mainUnit;
      
      // Nếu có subUnit, dùng subUnit làm finalUnitId
      if (formData.subUnit) {
        finalUnitId = formData.subUnit;
      }

      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soldierName: formData.soldierName,
          unitCode: finalUnitId,
          mainUnitCode: formData.mainUnit,
          relativeName: formData.relativeName,
          relationship: formData.relationship,
          visitDate: formData.visitDate,
          province: formData.province,
          ward: formData.ward,
          numberOfVisitors: parseInt(formData.numberOfVisitors.toString()),
          vehicleType: formData.vehicleType,
          vehicleCount: parseInt(formData.vehicleCount.toString()),
          phoneNumber: formData.phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng ký thành công!</h2>
          <p className="text-gray-600 mb-4">
            Đơn đăng ký của bạn đã được gửi. Vui lòng chờ đơn vị xét duyệt.
          </p>
          <p className="text-sm text-gray-500">Đang chuyển về trang chủ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Đơn đăng ký thăm Quân nhân</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tên quân nhân */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên quân nhân <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.soldierName}
                onChange={(e) => setFormData({ ...formData, soldierName: e.target.value })}
                className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Đơn vị */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn vị <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.mainUnit}
                  onChange={(e) => handleMainUnitChange(e.target.value)}
                  className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="">Chọn đơn vị</option>
                  {MAIN_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>

              {subUnits.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đại đội/Trung đội <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.subUnit}
                    onChange={(e) => setFormData({ ...formData, subUnit: e.target.value })}
                    className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Chọn đại đội/trung đội</option>
                    {subUnits.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Thông tin người thân */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên người thân <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.relativeName}
                  onChange={(e) => setFormData({ ...formData, relativeName: e.target.value })}
                  className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quan hệ <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                <option value="">Chọn quan hệ</option>
                  {RELATIONSHIPS.map((rel) => (
                    <option key={rel} value={rel}>
                      {rel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ngày thăm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày thăm (Chỉ T7 hoặc CN) <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Chọn ngày thăm</option>
                {upcomingWeekends.map((date) => (
                  <option key={date.toISOString()} value={date.toISOString()}>
                    {date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>

            {/* Địa chỉ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="">Chọn tỉnh/thành phố</option>
                  {PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phường/Xã <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Số người thăm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số người thăm (1-50) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                max="50"
                value={formData.numberOfVisitors}
                onChange={(e) => setFormData({ ...formData, numberOfVisitors: parseInt(e.target.value) || 1 })}
                className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Phương tiện */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương tiện <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Chọn phương tiện</option>
                  {VEHICLE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng phương tiện <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.vehicleCount}
                  onChange={(e) => setFormData({ ...formData, vehicleCount: parseInt(e.target.value) || 1 })}
                  className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0912345678"
              />
            </div>

            {/* Submit button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Đang gửi...' : 'Gửi đăng ký'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}