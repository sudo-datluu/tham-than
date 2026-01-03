'use client';

import * as XLSX from 'xlsx';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProvinceStats {
  province: string;
  totalVisitors: number;
  registrationCount: number;
}

interface MonthlyStats {
  totalVisitors: number;
  totalRegistrations: number;
  approvedRegistrations: number;
  pendingRegistrations: number;
  rejectedRegistrations: number;
  provinceStats: ProvinceStats[];
}

export default function StatisticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [firstTimeLoading, setFirstTimeLoading] = useState(true)
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, selectedMonth]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/statistics?month=${selectedMonth}`);
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      if (firstTimeLoading) {
        setFirstTimeLoading(false)
      }
      setLoading(false);
    }
  };

  // Generate month options (last 12 months)
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }

    return options;
  };

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const workbook = XLSX.utils.book_new();
      const monthOptions = getMonthOptions();

      for (const monthOption of monthOptions) {
        const response = await fetch(`/api/admin/statistics?month=${monthOption.value}`);
        const data = await response.json();

        if (response.ok && data.totalRegistrations > 0) {
          const wsData = [
            [`Thống kê tháng ${monthOption.label}`],
            [],
            ['Tổng số đơn đăng ký:', data.totalRegistrations],
            ['Tổng người thăm:', data.totalVisitors],
            ['Đơn đã duyệt:', data.approvedRegistrations],
            ['Đơn chờ duyệt:', data.pendingRegistrations],
            ['Đơn từ chối:', data.rejectedRegistrations],
            [],
            ['Thống kê theo tỉnh/thành phố'],
            ['Tỉnh/Thành phố', 'Số đơn đăng ký', 'Tổng người thăm'],
          ];

          data.provinceStats.forEach((stat: any) => {
            wsData.push([stat.province, stat.registrationCount, stat.totalVisitors]);
          });

          wsData.push(['Tổng cộng', data.totalRegistrations, data.totalVisitors]);

          const ws = XLSX.utils.aoa_to_sheet(wsData);
          ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }];

          XLSX.utils.book_append_sheet(workbook, ws, monthOption.label.substring(0, 31));
        }
      }

      const now = new Date();
      const fileName = `Thong_ke_tham_quan_nhan_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Export error:', error);
      alert('Có lỗi xảy ra khi xuất Excel');
    } finally {
      setExportLoading(false);
    }
  };

  if (status === 'loading' || firstTimeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (!session || !stats) {
    return null;
  }

  const maxVisitors = Math.max(...stats.provinceStats.map(p => p.totalVisitors), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Thống kê theo thời gian duyệt</h1>
              <p className="text-sm text-gray-600">
                {session.user.name} - {session.user.unitName || 'Toàn bộ hệ thống'}
              </p>
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
        {/* Month selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn tháng
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              >
                {getMonthOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                disabled={exportLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                {exportLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang xuất...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Xuất Excel
                  </>
                )}
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bảng
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'chart'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Biểu đồ
              </button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
            <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Tổng người thăm (đã duyệt)</div>
              <div className="text-3xl font-bold text-indigo-600">{stats.totalVisitors}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Tổng đơn đã duyệt</div>
              <div className="text-3xl font-bold text-green-600">{stats.approvedRegistrations}</div>
            </div>
          </div>
          {/* Province Statistics */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Thống kê theo tỉnh/thành phố</h2>
              <p className="text-sm text-gray-500 mt-1">Chỉ tính các đơn đã được phê duyệt</p>
            </div>

            {viewMode === 'table' ? (
              /* Table View */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tỉnh/Thành phố
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Số đơn đăng ký
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tổng người thăm
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats.provinceStats.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          Không có dữ liệu trong tháng này
                        </td>
                      </tr>
                    ) : (
                      stats.provinceStats.map((provinceStat) => (
                        <tr key={provinceStat.province} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {provinceStat.province}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {provinceStat.registrationCount}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {provinceStat.totalVisitors}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {stats.provinceStats.length > 0 && (
                    <tfoot className="bg-gray-50 font-bold">
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">Tổng cộng</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {stats.totalRegistrations}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {stats.totalVisitors}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            ) : (
              /* Chart View */
              <div className="p-6">
                {stats.provinceStats.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Không có dữ liệu trong tháng này
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.provinceStats.map((provinceStat) => (
                      <div key={provinceStat.province}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {provinceStat.province}
                          </span>
                          <span className="text-sm text-gray-600">
                            {provinceStat.totalVisitors} người ({provinceStat.registrationCount} đơn)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-8">
                          <div
                            className="bg-indigo-600 h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium transition-all duration-500"
                            style={{
                              width: `${(provinceStat.totalVisitors / maxVisitors) * 100}%`,
                              minWidth: provinceStat.totalVisitors > 0 ? '60px' : '0',
                            }}
                          >
                            {provinceStat.totalVisitors}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          </> 
        )}
        
      </div>
    </div>
  );
}