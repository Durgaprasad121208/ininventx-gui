import { NextRequest } from 'next/server';
import { forwardToSpringBoot } from '@/lib/api/springBootProxy';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return forwardToSpringBoot(req, {
    targetPath: `/api/organizer/users/${id}`,
  });
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return forwardToSpringBoot(req, {
    targetPath: `/api/organizer/users/${id}`,
  });
}
