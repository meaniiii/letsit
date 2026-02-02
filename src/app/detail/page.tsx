import { Suspense } from 'react';
import DetailContent from './DetailContent';
import { CardSkeleton } from '@/components/ui';

export default function DetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-400">←</span>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </header>
          <div className="flex-1 px-6 py-6">
            <CardSkeleton />
          </div>
        </div>
      }
    >
      <DetailContent />
    </Suspense>
  );
}
