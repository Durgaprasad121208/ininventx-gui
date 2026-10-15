import { NextRequest } from 'next/server';
import { forwardToSpringBoot } from '@/lib/api/springBootProxy';

export async function GET(req: NextRequest) {
  return forwardToSpringBoot(req, {
    targetPath: '/api/v1/users',
  });
}

export async function POST(req: NextRequest) {
  return forwardToSpringBoot(req, {
    targetPath: '/api/v1/users',
  });
}
