'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    // Tạo QR code URL (sử dụng API miễn phí)
    const registrationUrl = `${window.location.origin}/register`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registrationUrl)}`;
    setQrCodeUrl(qrUrl);
  }, []);

  const steps1 = [
    {
      number: 1,
      title: 'Quét mã QR',
      description: 'Sử dụng camera điện thoại để quét mã QR bên dưới',
    },
    {
      number: 2,
      title: 'Điền thông tin',
      description: 'Hoàn thành đơn đăng ký với đầy đủ thông tin',
    },
    {
      number: 3,
      title: 'Chờ duyệt',
      description: 'Đơn vị sẽ xem xét và phê duyệt đơn đăng ký',
    },
    {
      number: 4,
      title: 'Nhận thông báo',
      description: 'Bạn sẽ được thông báo khi đơn được duyệt',
    },
  ];

  const steps = [
    {
      number: 1,
      title: 'Mở camera điện thoại',
      description: 'Dùng ứng dụng camera có sẵn trên điện thoại của bạn iphone/android'
    },
    {
      number: 2,
      title: 'Quét mã QR',
      description: 'Sử dụng camera điện thoại để quét mã QR bên dưới'
    },
    {
      number: 3,
      title: 'Điền thông tin theo mẫu',
      description: 'Hoàn thành đơn đăng ký với đầy đủ thông tin'
    },
    {
      number: 4,
      title: 'Đợi phê duyệt',
      description: 'Đơn vị sẽ xem xét và phê duyệt đơn đăng ký',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Đăng ký thăm quân nhân
          </h1>
          <p className="text-lg text-gray-600">
            Hệ thống đăng ký thăm người thân trực tuyến
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row justify-between-center items-start md:items-center gap-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex-1">
                <div className="flex items-center gap-4">
                  {/* Step circle */}
                  <div className="flex-shrink-0 w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                    {step.number}
                  </div>
                  
                  {/* Connecting line (hidden on last item and mobile) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block flex-1 h-1 bg-indigo-300"></div>
                  )}
                </div>
                
                {/* Step content */}
                <div className="mt-4 md:mt-6">
                  <h3 className="font-semibold text-lg text-gray-800 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Quét mã để đăng ký
              </h2>
              <p className="text-gray-600">
                Hoặc nhấn vào nút bên dưới để đăng ký trực tiếp
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              {qrCodeUrl ? (
                <div className="bg-white p-4 rounded-xl border-4 border-indigo-600">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code đăng ký"
                    className="w-64 h-64"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-200 animate-pulse rounded-xl"></div>
              )}
            </div>

            {/* Button */}
            <Link
              href="/register"
              className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl text-center transition-colors shadow-lg"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>

        {/* Admin Login Link */}
        <div className="text-center mt-8">
          <Link
            href="/login"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Đăng nhập quản trị →
          </Link>
        </div>
      </div>
    </div>
  );
}