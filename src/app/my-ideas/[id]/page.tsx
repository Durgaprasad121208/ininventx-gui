import { Suspense } from 'react';
import { MyIdeaInfo } from '@/features/my-ideas/components/MyIdeaInfo';

export default async function MyIdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<div>Loading idea details...</div>}>
      <MyIdeaInfo ideaId={id} />
    </Suspense>
  );
}
