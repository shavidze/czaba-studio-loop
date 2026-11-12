import { createHash } from 'node:crypto';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { generateR2Token, isSafeR2FileName, STUDIO_TOKEN_EXPIRY_MS } from '~/lib/r2-tokens.server';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5199';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const productHandle = url.searchParams.get('product');
  const fileNames = url.searchParams.getAll('file');
  if (
    !productHandle ||
    !/^[a-z0-9-]+$/.test(productHandle) ||
    fileNames.length === 0 ||
    fileNames.length > 100 ||
    !fileNames.every(isSafeR2FileName)
  ) {
    return json({ error: 'Invalid product or file parameters' }, { status: 400 });
  }
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ') || authHeader.length <= 7) {
    return json({ error: 'Please sign in to access Studio.' }, { status: 401 });
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/downloads`, {
      headers: { Authorization: authHeader },
    });
    if (!response.ok) return json({ error: 'Unable to verify ownership' }, { status: 403 });
    const result: {
      success: boolean;
      data?: {
        products: Array<{
          handle: string;
          licenseType: string;
          category: string;
          isAvailable: boolean;
        }>;
      };
    } = await response.json();
    const owned =
      result.success &&
      result.data?.products.some(
        (product) =>
          product.handle === productHandle &&
          product.isAvailable &&
          product.category.toLowerCase() === 'track' &&
          ['standard', 'premium'].includes(product.licenseType.toLowerCase()),
      );
    if (!owned)
      return json({ error: 'Purchase this music product to access Studio' }, { status: 403 });
    const userId = createUserReference(authHeader);
    const token = generateR2Token(productHandle, userId, 'studio', fileNames);
    return json(
      { token, expiresIn: STUDIO_TOKEN_EXPIRY_MS },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return json({ error: 'Unable to prepare Studio access' }, { status: 500 });
  }
}

function createUserReference(authorization: string): string {
  return createHash('sha256').update(authorization).digest('hex');
}
