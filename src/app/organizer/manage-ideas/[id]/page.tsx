import { IdeaInfo } from '@/features/idea-info/components/IdeaInfo';

export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <IdeaInfo ideaId={id} />;
}
