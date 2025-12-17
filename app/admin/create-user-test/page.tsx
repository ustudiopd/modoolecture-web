'use client';

import { useState } from 'react';

export default function CreateUserTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateUser = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@modoolecture.com',
          password: 'modoo@82',
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || '사용자 생성 실패');
        setResult(data);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">어드민 계정 생성 테스트</h1>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">이메일: admin@modoolecture.com</p>
          <p className="text-gray-600">비밀번호: modoo@82</p>
        </div>

        <button
          onClick={handleCreateUser}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '생성 중...' : '어드민 계정 생성'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="font-semibold text-red-800 mb-2">오류:</h3>
            <p className="text-red-600">{error}</p>
            {result && (
              <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}

        {result && !error && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-800 mb-2">성공:</h3>
            <p className="text-green-600">{result.message}</p>
            {result.user && (
              <div className="mt-2 text-sm">
                <p><strong>사용자 ID:</strong> {result.user.id}</p>
                <p><strong>이메일:</strong> {result.user.email}</p>
                <p><strong>역할:</strong> {result.user.role}</p>
              </div>
            )}
            <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}


