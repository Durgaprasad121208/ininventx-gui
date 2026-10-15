import { NextRequest } from 'next/server';
import { forwardToSpringBoot } from '@/lib/api/springBootProxy';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return forwardToSpringBoot(req, {
    targetPath: `/api/organizer/announcements/${id}/state`,
  });
}
