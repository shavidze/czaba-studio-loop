# Czaba Music Store - Storefront

A custom Shopify storefront built with Hydrogen/Remix for selling music, presets, and connecting with your audience.

## Features

- **Music Showcase**: Display your latest music releases
- **Presets Gallery**: Showcase production presets for sale
- **Email Newsletter**: Collect emails from fans who want updates
- **Shopify Integration**: Full e-commerce capabilities with Shopify backend
- **Modern UI**: Beautiful, responsive design with smooth animations

## Getting Started

### Prerequisites

- Node.js v18 or higher
- A Shopify Developer Store
- Storefront API access token

### Installation

Dependencies are already installed! Skip to running the dev server.

### Configuration

Your store is already configured with:
- Store Domain: `czaba.myshopify.com`
- Storefront API credentials in `.env` file

### Running the Development Server

```bash
cd music-store
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
music-store/
├── app/
│   ├── routes/
│   │   └── _index.tsx        # Homepage
│   ├── lib/
│   │   └── shopify.server.ts # Shopify API client
│   ├── styles/
│   │   └── app.css           # Global styles
│   ├── entry.client.tsx      # Client entry point
│   ├── entry.server.tsx      # Server entry point
│   └── root.tsx              # Root component
├── .env                       # Environment variables
├── vite.config.ts            # Vite configuration
├── remix.config.js           # Remix configuration
└── package.json              # Dependencies
```

## Adding Products to Your Store

1. Go to your Shopify admin: https://czaba.myshopify.com/admin
2. Navigate to **Products** → **Add product**
3. Add your music or presets with:
   - Title and description
   - Price
   - Images
   - **Important**: Set the **Product type** to either "Music" or "Preset"
   - Or add tags: "music" or "preset"

The homepage will automatically categorize products based on their type or tags.

## Customization

### Colors and Branding

Edit `app/styles/app.css` and modify the CSS variables:

```css
:root {
  --color-primary: #6366f1;      /* Main brand color */
  --color-primary-dark: #4f46e5; /* Darker variant */
  /* ... other variables */
}
```

### Hero Section

Edit the hero text in `app/routes/_index.tsx`:

```tsx
<h1 className="hero-title">Welcome to My Music World</h1>
<p className="hero-subtitle">Your custom message here</p>
```

## Next Steps

1. **Add Products**: Add your music and presets in Shopify admin
2. **Customize Design**: Update colors, fonts, and layout to match your brand
3. **Add More Pages**: Create product detail pages, about page, etc.
4. **Set Up Cart**: Add shopping cart functionality
5. **Deploy**: Deploy to Shopify Oxygen or your preferred hosting

## Deployment

To deploy to Shopify Oxygen:

```bash
npm run build
shopify hydrogen deploy
```

## Support

For issues or questions:
- Shopify Hydrogen Docs: https://shopify.dev/docs/custom-storefronts/hydrogen
- Remix Docs: https://remix.run/docs
