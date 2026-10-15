import { NextRequest } from 'next/server';
import { forwardToSpringBoot } from '@/lib/api/springBootProxy';

export async function GET(req: NextRequest) {
  return forwardToSpringBoot(req, {
    targetPath: '/api/organizer/overview',
  });
}
