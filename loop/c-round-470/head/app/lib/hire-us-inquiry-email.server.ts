export const HIRE_US_INQUIRY_EMAIL_PALETTE = {
  background: '#0e0d0c',
  surface: '#161412',
  foreground: '#ece6da',
  muted: '#a39b8e',
  outline: '#24211e',
  brand: '#c9a46a',
} as const;

export interface HireUsInquiryEmailFields {
  name: string;
  email: string;
  projectTypeLabel: string;
  budgetLabel: string;
  message: string;
}

export function escapeEmailHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildHireUsInquiryEmailHtml(fields: HireUsInquiryEmailFields): string {
  const color = HIRE_US_INQUIRY_EMAIL_PALETTE;
  const labelCell = `padding: 10px; border-bottom: 1px solid ${color.outline}; color: ${color.muted};`;
  const valueCell = `padding: 10px; border-bottom: 1px solid ${color.outline}; color: ${color.foreground};`;
  return `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${color.background}" style="width: 100%; background-color: ${color.background};">
          <tr>
          <td bgcolor="${color.background}" style="padding: 24px; background-color: ${color.background};">
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${color.background}; color: ${color.foreground};">
            <h2 style="color: ${color.foreground};">New Project Inquiry</h2>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="${labelCell}">Name</td>
                <td style="${valueCell}">${escapeEmailHtml(fields.name)}</td>
              </tr>
              <tr>
                <td style="${labelCell}">Email</td>
                <td style="${valueCell}"><a href="mailto:${escapeEmailHtml(fields.email)}" style="color: ${color.brand};">${escapeEmailHtml(fields.email)}</a></td>
              </tr>
              <tr>
                <td style="${labelCell}">Project Type</td>
                <td style="${valueCell}">${escapeEmailHtml(fields.projectTypeLabel)}</td>
              </tr>
              <tr>
                <td style="${labelCell}">Budget</td>
                <td style="${valueCell}">${escapeEmailHtml(fields.budgetLabel)}</td>
              </tr>
            </table>

            <h3 style="color: ${color.foreground}; margin-top: 30px;">Message</h3>
            <div style="background-color: ${color.surface}; padding: 20px; border-radius: 8px; color: ${color.foreground}; white-space: pre-wrap;">${escapeEmailHtml(fields.message)}</div>

            <p style="color: ${color.muted}; font-size: 12px; margin-top: 30px;">
              Sent from CZABA Hire Us form
            </p>
          </div>
          </td>
          </tr>
          </table>
        `;
}
