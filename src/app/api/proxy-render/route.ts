import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const product = searchParams.get('product');
  const timestamp = searchParams.get('timestamp');
  let url = searchParams.get('url');

  if (!url) {
      if (product && timestamp) {
          url = `http://localhost:3003/renders/download?product=${product}&timestamp=${timestamp}`;
      } else {
          return new NextResponse("Missing parameters", { status: 400 });
      }
  }

  try {
      const response = await fetch(url);
      if (!response.ok) {
          return new NextResponse(`Upstream error: ${response.statusText}`, { status: response.status });
      }

      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.delete('cross-origin-resource-policy');
      headers.delete('content-security-policy');

      return new NextResponse(response.body, {
          status: response.status,
          headers: headers
      });

  } catch (error) {
      console.error("Proxy error:", error);
      return new NextResponse("Proxy Error", { status: 502 });
  }
}
