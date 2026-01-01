'use client';

import { useState } from 'react';
import Link from 'next/link';

interface RegistrationInfo {
  registrationCode: string;
  soldierName: string;
  relativeName: string;
  relationship: string;
  visitDate: string;
  status: string;
  submittedAt: string;
  unit: {
    name: string;
  };
}

export default function LookupPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registration, setRegistration] = useState<RegistrationInfo | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRegistration(null);

    try {
      const response = await fetch(`/api/lookup?code=${encodeURIComponent(code)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Không tìm thấy đơn đăng ký');
        return;
      }

      setRegistration(data.registration);
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ duyệt';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Banner */}
      <div className="relative z-10 w-full flex justify-center bg-white">
        <img
          src="/images/banner.jpg"
          alt="Logo"
          className="max-w-full h-auto"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 relative"
        style={{
          backgroundImage: 'url(/images/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>

        
        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Logo */}
          {/* <div className="text-center mb-6">
            <img
              src="/images/logo.jpeg"
              alt="Logo"
              className="h-[120px] w-[120px] mx-auto mb-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div> */}

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Tra cứu đơn đăng ký
            </h1>

            <form onSubmit={handleSubmit} className="mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập mã số đăng ký (7 ký tự)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={7}
                    value={code}
                    onChange={(e) => setCode(e.target.value.trim())}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 uppercase tracking-wider"
                    placeholder="VD: Ab3X9kL"
                  />
                  <button
                    type="submit"
                    disabled={loading || code.length !== 7}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    {loading ? 'Đang tìm...' : 'Tra cứu'}
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <svg
                  className="w-16 h-16 text-red-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
                <p className="text-sm text-red-600 mt-2">
                  Vui lòng kiểm tra lại mã số đăng ký
                </p>
              </div>
            )}

            {registration && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Thông tin đơn đăng ký</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      registration.status
                    )}`}
                  >
                    {getStatusText(registration.status)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Mã số đăng ký:</span>
                    <span className="font-semibold text-indigo-600 tracking-wider">
                      {registration.registrationCode}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Quân nhân:</span>
                    <span className="font-medium text-gray-900">{registration.soldierName}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Đơn vị:</span>
                    <span className="font-medium text-gray-900">{registration.unit.name}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Người thăm:</span>
                    <span className="font-medium text-gray-900">
                      {registration.relativeName} ({registration.relationship})
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Ngày thăm:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(registration.visitDate).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Ngày gửi:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(registration.submittedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                {registration.status === 'PENDING' && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      ⏳ Đơn đăng ký của bạn đang chờ xét duyệt. Vui lòng kiểm tra lại sau.
                    </p>
                  </div>
                )}

                {registration.status === 'APPROVED' && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      ✅ Đơn đăng ký của bạn đã được phê duyệt. Vui lòng đến đúng ngày giờ đã đăng ký.
                    </p>
                  </div>
                )}

                {registration.status === 'REJECTED' && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">
                      ❌ Đơn đăng ký của bạn đã bị từ chối. Vui lòng liên hệ đơn vị để biết thêm chi tiết.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 text-center">
              <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                ← Quay về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}