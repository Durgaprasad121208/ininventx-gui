import { NextRequest } from 'next/server';
import { forwardToSpringBoot } from '@/lib/api/springBootProxy';
import { mockUsers } from '@/features/users/services/usersApi';

export async function GET(req: NextRequest) {
  return forwardToSpringBoot(req, {
    targetPath: '/api/v1/users',
    fallbackMock: mockUsers,
  });
}

export async function POST(req: NextRequest) {
  return forwardToSpringBoot(req, {
    targetPath: '/api/v1/users',
  });
}
