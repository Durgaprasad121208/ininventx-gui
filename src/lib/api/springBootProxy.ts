import { NextRequest, NextResponse } from 'next/server';

const SPRING_BOOT_BASE_URL =
  process.env.SPRING_BOOT_API_URL ||
  process.env.NEXT_PUBLIC_SPRING_BOOT_API_URL ||
  'http://localhost:8080';

export interface ProxyOptions {
  targetPath: string;
  fallbackMock?: any;
}

/**
 * Forward an incoming Next.js API request to the Spring Boot backend.
 * Automatically forwards method, query params, headers, and request body.
 */
export async function forwardToSpringBoot(
  req: NextRequest,
  { targetPath, fallbackMock }: ProxyOptions
): Promise<NextResponse> {
  const url = new URL(req.url);
  const targetUrl = `${SPRING_BOOT_BASE_URL}${targetPath}${url.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    // Exclude host, connection, origin, and referer headers to avoid proxy/CORS mismatches with Spring Boot
    if (!['host', 'connection', 'content-length', 'origin', 'referer'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  let body: BodyInit | undefined = undefined;
  if (!['GET', 'HEAD'].includes(req.method)) {
    try {
      const buffer = await req.arrayBuffer();
      if (buffer.byteLength > 0) {
        body = buffer;
      }
    } catch {
      body = undefined;
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: 'no-store',
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await response.json().catch(() => ({}));
      return NextResponse.json(json, { status: response.status });
    }

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': contentType || 'text/plain',
      },
    });
  } catch (error: any) {
    console.warn(`[SpringBoot Proxy] Could not connect to Spring Boot at ${targetUrl}:`, error.message);

    // If a fallback mock is provided and backend is offline, return the mock gracefully
    if (fallbackMock !== undefined) {
      return NextResponse.json(fallbackMock, { status: 200 });
    }

    return NextResponse.json(
      {
        error: 'Backend Service Unavailable',
        message: `Could not reach Spring Boot service at ${SPRING_BOOT_BASE_URL}`,
        details: error?.message,
      },
      { status: 503 }
    );
  }
}
