import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Only allow downloading from trusted Supabase storage origins (prevents SSRF)
function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    if (supabaseUrl) {
      try {
        const supabaseHost = new URL(supabaseUrl).hostname;
        if (parsed.hostname === supabaseHost || parsed.hostname.endsWith('.' + supabaseHost)) return true;
      } catch { /* ignore */ }
    }
    return parsed.hostname.endsWith('.supabase.co') || parsed.hostname.endsWith('.supabase.in');
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  // Require authenticated session
  const cookieStore = await cookies();
  if (!cookieStore.get('auth_session')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'download';

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: 'URL غير مسموح به' }, { status: 403 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error: any) {
    console.error('Download proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
