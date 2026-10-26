/**
 * Email Service
 * Brevo transactional emails
 */

import { debug } from './debug';
import { getDownloadUrl } from './r2-tokens.server';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const APP_URL = process.env.APP_URL || 'https://czaba.store';

interface OrderLineItem {
  productId: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: { amount: string; currencyCode: string };
}

interface OrderEmailData {
  orderName: string;
  customerEmail: string;
  customerName: string;
  lineItems: OrderLineItem[];
  totalPrice: { amount: string; currencyCode: string };
}

/**
 * გაგზავნე Order Paid email download link-ებით
 */
export async function sendOrderPaidEmail(order: OrderEmailData): Promise<boolean> {
  if (!BREVO_API_KEY) {
    debug.error('Brevo API key missing for order email');
    return false;
  }

  const downloadLinks = order.lineItems.map((item) => {
    const productHandle = extractHandleFromId(item.productId);
    const downloadUrl = getDownloadUrl(productHandle, 'premium.zip', order.customerEmail);
    const accountUrl = `${APP_URL}/account/downloads`;

    return {
      title: item.title,
      variantTitle: item.variantTitle,
      downloadUrl,
      accountUrl,
    };
  });

  const htmlContent = generateOrderEmailHtml(order, downloadLinks);

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'CZABA', email: 'noreply@czaba.store' },
        to: [{ email: order.customerEmail, name: order.customerName }],
        subject: `🎬 Your CZABA Downloads are Ready - ${order.orderName}`,
        htmlContent,
      }),
    });

    if (!response.ok) {
      debug.error('Order email failed:', response.status);
      return false;
    }

    debug.log(`Order email sent: ${order.orderName} to ${order.customerEmail}`);
    return true;
  } catch (error) {
    debug.error('Order email error:', error);
    return false;
  }
}

/**
 * Product ID-დან handle-ის ამოღება
 */
function extractHandleFromId(productId: string): string {
  const numericId = productId.replace(/\D/g, '');
  return numericId || productId;
}

/**
 * Order email HTML გენერაცია
 */
function generateOrderEmailHtml(
  order: OrderEmailData,
  downloadLinks: Array<{
    title: string;
    variantTitle?: string;
    downloadUrl: string;
    accountUrl: string;
  }>,
): string {
  const productsHtml = downloadLinks
    .map(
      (item) => `
        <tr>
          <td style="padding: 16px; border-bottom: 1px solid #333;">
            <div style="font-weight: 600; color: #fff; margin-bottom: 4px;">${item.title}</div>
            ${item.variantTitle ? `<div style="color: #888; font-size: 14px;">${item.variantTitle}</div>` : ''}
          </td>
          <td style="padding: 16px; border-bottom: 1px solid #333; text-align: right;">
            <a href="${item.downloadUrl}" style="display: inline-block; padding: 10px 20px; background: #13D9CC; color: #000; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Download
            </a>
          </td>
        </tr>
      `,
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #13D9CC; font-size: 28px; margin: 0;">CZABA</h1>
        </div>

        <!-- Main Content -->
        <div style="background: #111; border-radius: 12px; padding: 32px; border: 1px solid #222;">

          <h2 style="color: #fff; font-size: 24px; margin: 0 0 8px 0;">Thank You for Your Purchase!</h2>
          <p style="color: #888; margin: 0 0 24px 0;">Order ${order.orderName}</p>

          <p style="color: #ccc; line-height: 1.6; margin-bottom: 24px;">
            Your cinematic sound packs are ready to download. Click the buttons below to get your files, or access them anytime from your account.
          </p>

          <!-- Downloads Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr>
                <th style="padding: 12px 16px; text-align: left; color: #888; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #333;">Product</th>
                <th style="padding: 12px 16px; text-align: right; color: #888; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #333;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${productsHtml}
            </tbody>
          </table>

          <!-- Account Link -->
          <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; text-align: center;">
            <p style="color: #888; margin: 0 0 12px 0; font-size: 14px;">
              Download links expire in 30 minutes. For permanent access:
            </p>
            <a href="${APP_URL}/account/downloads" style="display: inline-block; padding: 12px 24px; background: transparent; color: #13D9CC; text-decoration: none; border: 1px solid #13D9CC; border-radius: 6px; font-weight: 600;">
              Go to My Downloads
            </a>
          </div>

        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px; color: #666; font-size: 12px;">
          <p style="margin: 0 0 8px 0;">
            Need help? Reply to this email or visit <a href="${APP_URL}/faq" style="color: #13D9CC;">our FAQ</a>
          </p>
          <p style="margin: 0;">
            © ${new Date().getFullYear()} CZABA. All rights reserved.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}
