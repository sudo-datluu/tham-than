'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Feedback {
  id: string;
  name: string;
  phone: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export default function AdminFeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchFeedbacks();
    }
  }, [status, router]);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('/api/admin/feedback');
      const data = await response.json();

      if (response.ok) {
        setFeedbacks(data.feedbacks || []);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId: id, isRead: true }),
      });

      if (response.ok) {
        await fetchFeedbacks();
        setSelectedFeedback(null);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
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

  const unreadCount = feedbacks.filter(f => !f.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Phản ánh / Góp ý</h1>
              <p className="text-sm text-gray-600">
                {session.user.name} - {unreadCount} phản ánh chưa đọc
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {feedbacks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Chưa có phản ánh nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày gửi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Họ tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Số điện thoại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nội dung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {feedbacks.map((feedback) => (
                    <tr
                      key={feedback.id}
                      className={`hover:bg-gray-50 ${!feedback.isRead ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(feedback.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {feedback.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {feedback.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          {feedback.content}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            feedback.isRead
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {feedback.isRead ? 'Đã đọc' : 'Chưa đọc'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setSelectedFeedback(feedback)}
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
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Chi tiết phản ánh
                </h2>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Họ tên</p>
                  <p className="font-medium text-gray-900">{selectedFeedback.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium text-gray-900">{selectedFeedback.phone}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Ngày gửi</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedFeedback.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Nội dung</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedFeedback.content}</p>
                  </div>
                </div>

                {!selectedFeedback.isRead && (
                  <div className="pt-6">
                    <button
                      onClick={() => handleMarkAsRead(selectedFeedback.id)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Đánh dấu đã đọc
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