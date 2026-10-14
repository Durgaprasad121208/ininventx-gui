import { Suspense } from 'react';
import { IdeaInfo } from '@/features/idea-info/components/IdeaInfo';

export default function IdeaInfoPage() {
  return (
    <Suspense fallback={<div>Loading idea details...</div>}>
      <IdeaInfo />
    </Suspense>
  );
}
