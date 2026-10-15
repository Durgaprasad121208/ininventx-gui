import { NextRequest } from 'next/server';
import { forwardToSpringBoot } from '@/lib/api/springBootProxy';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/ideas/{id}/like
 * Idempotent like for an idea
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return forwardToSpringBoot(req, {
    targetPath: `/api/ideas/${id}/like`,
  });
}

/**
 * DELETE /api/ideas/{id}/like
 * Idempotent unlike for an idea
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return forwardToSpringBoot(req, {
    targetPath: `/api/ideas/${id}/like`,
  });
}
