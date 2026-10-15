import { NextRequest } from 'next/server';
import { forwardToSpringBoot } from '@/lib/api/springBootProxy';

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

async function handleProxy(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const targetPath = `/api/${path.join('/')}`;
  return forwardToSpringBoot(req, { targetPath });
}

export async function GET(req: NextRequest, context: RouteContext) {
  return handleProxy(req, context);
}

export async function POST(req: NextRequest, context: RouteContext) {
  return handleProxy(req, context);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return handleProxy(req, context);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return handleProxy(req, context);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return handleProxy(req, context);
}

export async function HEAD(req: NextRequest, context: RouteContext) {
  return handleProxy(req, context);
}
