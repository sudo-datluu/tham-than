'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FeedbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      setSuccess(true);
      setFormData({ name: '', phone: '', content: '' });
      
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
      <div
        className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 relative"
        style={{
          backgroundImage: 'url(/images/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
        <div className="relative z-10 bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Gửi thành công!</h2>
          <p className="text-gray-600 mb-4">
            Cảm ơn bạn đã gửi phản ánh. Chúng tôi sẽ xem xét và phản hồi sớm nhất.
          </p>
          <Link
            href="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

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
                src="/images/logo.png"
                alt="Logo"
                className="h-[120px] w-[120px] mx-auto mb-4"
                onError={(e) => {
                e.currentTarget.style.display = 'none';
                }}
            />
            </div> */}

            <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                Phản ánh / Góp ý
            </h1>
            <p className="text-gray-600 mb-6 text-center">
                Ý kiến của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn
            </p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    placeholder="Nguyễn Văn A"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    placeholder="0912345678"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung phản ánh/góp ý <span className="text-red-500">*</span>
                </label>
                <textarea
                    required
                    rows={6}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    placeholder="Nhập nội dung phản ánh hoặc góp ý của bạn..."
                />
                </div>

                <div className="flex gap-4">
                <Link
                    href="/"
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg text-center transition-colors"
                >
                    Hủy
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                    {loading ? 'Đang gửi...' : 'Gửi phản ánh'}
                </button>
                </div>
            </form>
            </div>
        </div>
        </div>
    </div>
  );
}