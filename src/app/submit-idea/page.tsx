'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SubmitIdea } from '@/features/submit-idea/components/SubmitIdea';
import { Spin } from 'antd';

function SubmitIdeaWithKey() {
  const searchParams = useSearchParams();
  const editKey = searchParams?.get('edit') || searchParams?.get('id') || 'new';
  return <SubmitIdea key={editKey} />;
}

export default function SubmitIdeaPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spin size="large" />
        </div>
      }
    >
      <SubmitIdeaWithKey />
    </Suspense>
  );
}

