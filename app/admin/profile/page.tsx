'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: '',
    unitName: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchUserProfile();
    }
  }, [status, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/admin/profile');
      const data = await response.json();

      if (response.ok) {
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          role: data.user.role || '',
          unitName: data.user.unit?.name || 'N/A',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.phone) {
      setError('Tên và số điện thoại không được để trống');
      return;
    }

    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword.length < 6) {
        setError('Mật khẩu mới phải có ít nhất 6 ký tự');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return;
      }
    }

    setLoading(true);

    try {
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
      };

      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Cập nhật thông tin thành công!');
        
        await fetchUserProfile();

        setFormData((prev) => ({
          ...prev,
          newPassword: '',
          confirmPassword: '',
        }));

        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(data.error || 'Có lỗi xảy ra');
      }
    } catch (err: any) {
      console.error('Update error:', err);
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h1>
              <p className="text-sm text-gray-600">{formData.unitName}</p>
            </div>
            <Link
              href="/admin"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium"
            >
              ← Quay lại Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Thông tin tài khoản
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
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
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      placeholder="0912345678"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Số điện thoại dùng để đăng nhập
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vai trò
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đơn vị
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData.unitName}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Đổi mật khẩu
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Để nguyên trống nếu không muốn đổi mật khẩu
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, newPassword: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}