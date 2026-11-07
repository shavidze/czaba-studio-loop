import { createHash } from 'node:crypto';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { generateR2Token } from '~/lib/r2-tokens.server';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5199';
const R2_WORKER_URL =
  process.env.VITE_R2_WORKER_URL || 'https://czaba-r2-proxy.sabashavidze.workers.dev';

interface DownloadsResponse {
  success: boolean;
  data?: {
    products: Array<{
      productId: number;
      productTitle: string;
      handle: string;
      licenseType: string;
      isAvailable: boolean;
    }>;
  };
}

async function checkUserOwnership(
  accessToken: string,
  productHandle: string,
): Promise<{ owned: boolean; license: 'premium' | 'standard' | 'universal' | null }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/downloads`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { owned: false, license: null };
    }

    const result: DownloadsResponse = await response.json();

    if (!result.success || !result.data?.products) {
      return { owned: false, license: null };
    }

    const product = result.data.products.find((p) => p.handle === productHandle && p.isAvailable);

    if (!product) {
      return { owned: false, license: null };
    }

    const licenseType = product.licenseType.toLowerCase();
    let license: 'premium' | 'standard' | 'universal' | null = null;

    if (licenseType === 'universal') {
      license = 'universal';
    } else if (licenseType === 'premium') {
      license = 'premium';
    } else if (licenseType === 'standard') {
      license = 'standard';
    }

    return { owned: license !== null, license };
  } catch (error) {
    console.error('Error checking ownership:', error);
    return { owned: false, license: null };
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const productHandle = url.searchParams.get('product');
  const fileType = url.searchParams.get('type');

  if (!productHandle || !/^[a-z0-9-]+$/.test(productHandle)) {
    return json({ error: "The file couldn't be found. Please try again." }, { status: 400 });
  }

  if (!fileType || !['premium', 'standard', 'universal', 'license'].includes(fileType)) {
    return json({ error: 'This download option is not available.' }, { status: 400 });
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return json({ error: 'Please sign in to download this file.' }, { status: 401 });
  }

  const accessToken = authHeader.replace('Bearer ', '');

  const { owned, license } = await checkUserOwnership(accessToken, productHandle);

  if (!owned) {
    return json({ error: 'Product not purchased' }, { status: 403 });
  }

  if (fileType === 'universal' && license !== 'universal') {
    return json({ error: 'Universal license required for this download' }, { status: 403 });
  }

  if (fileType === 'premium' && license !== 'premium' && license !== 'universal') {
    return json({ error: 'Premium license required for this download' }, { status: 403 });
  }

  try {
    let fileName: string;
    if (fileType === 'license') {
      fileName = 'license.pdf';
    } else {
      fileName =
        fileType === 'premium' || fileType === 'universal' ? 'premium.zip' : 'standart.zip';
    }

    const userId = createHash('sha256').update(accessToken).digest('hex');
    const token = generateR2Token(productHandle, userId, 'download', [fileName]);

    const downloadUrl = `${R2_WORKER_URL}/download/${productHandle}/${encodeURIComponent(fileName)}?token=${encodeURIComponent(token)}`;

    return json({ downloadUrl }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return json(
      { error: 'Unable to prepare your download. Please try again later.' },
      { status: 500 },
    );
  }
}
