'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Registration {
  id: string;
  soldierName: string;
  relativeName: string;
  relationship: string;
  visitDate: string;
  province: string;
  ward: string;
  numberOfVisitors: number;
  vehicleType: string;
  vehicleCount: number;
  phoneNumber: string;
  status: string;
  adminNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  unit: {
    name: string;
    code: string;
  };
  reviewedBy: {
    name: string;
  } | null;
  registrationCode: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [fetchingData, setFetchingData] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRegistrations();
    }
  }, [status, filter, dateRange]);

  const fetchRegistrations = async () => {
    setFetchingData(true);
    try {
      const params = new URLSearchParams({ status: filter });
      
      if (dateRange.startDate) {
        params.append('startDate', dateRange.startDate);
      }
      if (dateRange.endDate) {
        params.append('endDate', dateRange.endDate);
      }
      
      const response = await fetch(`/api/admin/registrations?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setRegistrations(data.registrations || []);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setFetchingData(false)
      setLoading(false);
    }
  };

  const handleAction = async (registrationId: string, action: 'APPROVED' | 'REJECTED') => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId,
          status: action,
          adminNotes,
        }),
      });

      if (response.ok) {
        await fetchRegistrations();
        setSelectedRegistration(null);
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Error updating registration:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isSuperAdmin = session.user.role === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
              </h1>
              <p className="text-sm text-gray-600">
                {session.user.name} - {session.user.unitName || 'Toàn bộ hệ thống'}
              </p>
            </div>
            <div className="flex gap-4">
              {isSuperAdmin && (
                <Link
                  href="/admin/users"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Quản lý Admin
                </Link>
              )}
              <Link
                href="/admin/statistics"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Thống kê
              </Link>
              <Link
                href="/admin/profile"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Thông tin cá nhân
              </Link>
              <button
                onClick={() => signOut({redirect: true, callbackUrl: '/login' })}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Status filters */}
            <div className="flex gap-2">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'ALL' && 'Tất cả'}
                  {status === 'PENDING' && 'Chờ duyệt'}
                  {status === 'APPROVED' && 'Đã duyệt'}
                  {status === 'REJECTED' && 'Từ chối'}
                </button>
              ))}
            </div>

            {/* Date range filter */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  max={dateRange.endDate || undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => {
                    const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
                    const end = new Date(e.target.value);
                    
                    // Check if range is more than 7 days
                    if (start && end) {
                      const diffTime = Math.abs(end.getTime() - start.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      if (diffDays > 7) {
                        alert('Chỉ được chọn tối đa 7 ngày');
                        return;
                      }
                    }
                    
                    setDateRange({ ...dateRange, endDate: e.target.value });
                  }}
                  min={dateRange.startDate || undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                />
              </div>
              <button
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Registrations List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {fetchingData ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
              <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Không có đơn đăng ký nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mã đăng kí
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày gửi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quân nhân
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Đơn vị
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Người thăm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày thăm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {reg.registrationCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(reg.submittedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {reg.soldierName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {reg.unit.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {reg.relativeName} ({reg.relationship})
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(reg.visitDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reg.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : reg.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {reg.status === 'PENDING' && 'Chờ duyệt'}
                          {reg.status === 'APPROVED' && 'Đã duyệt'}
                          {reg.status === 'REJECTED' && 'Từ chối'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => setSelectedRegistration(reg)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Chi tiết đơn đăng ký {selectedRegistration.registrationCode}
                </h2>
                <button
                  onClick={() => {
                    setSelectedRegistration(null);
                    setAdminNotes('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Quân nhân</p>
                    <p className="font-medium text-gray-900">{selectedRegistration.soldierName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Đơn vị</p>
                    <p className="font-medium text-gray-900">{selectedRegistration.unit.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Người thăm</p>
                    <p className="font-medium text-gray-900">{selectedRegistration.relativeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quan hệ</p>
                    <p className="font-medium text-gray-900">{selectedRegistration.relationship}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày thăm</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedRegistration.visitDate).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số người thăm</p>
                    <p className="font-medium text-gray-900">{selectedRegistration.numberOfVisitors} người</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    <p className="font-medium text-gray-900">
                      {selectedRegistration.ward}, {selectedRegistration.province}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phương tiện</p>
                    <p className="font-medium text-gray-900">
                      {selectedRegistration.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'} ({selectedRegistration.vehicleCount})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium text-gray-900">{selectedRegistration.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày gửi</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedRegistration.submittedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                {selectedRegistration.status === 'PENDING' && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      placeholder="Nhập ghi chú nếu cần..."
                    />
                  </div>
                )}

                {selectedRegistration.adminNotes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Ghi chú từ admin</p>
                    <p className="text-gray-900">{selectedRegistration.adminNotes}</p>
                  </div>
                )}

                {selectedRegistration.status === 'PENDING' && (
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => handleAction(selectedRegistration.id, 'REJECTED')}
                      disabled={actionLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      {actionLoading ? 'Đang xử lý...' : 'Từ chối'}
                    </button>
                    <button
                      onClick={() => handleAction(selectedRegistration.id, 'APPROVED')}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      {actionLoading ? 'Đang xử lý...' : 'Phê duyệt'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}