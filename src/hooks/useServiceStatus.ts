'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ServiceStatus {
  available: boolean;
  remaining: number;
}

export const useServiceStatus = () => {
  const router = useRouter();
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const data: ServiceStatus = await res.json();
        setStatus(data);

        if (!data.available) {
          router.replace('/unavailable');
        }
      } catch {
        // 에러 시 서비스 사용 가능으로 처리
        setStatus({ available: true, remaining: 30000 });
      } finally {
        setIsChecking(false);
      }
    };

    checkStatus();
  }, [router]);

  return { status, isChecking };
};
