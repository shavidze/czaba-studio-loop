# Blog - Feature Specification

> სტატუსი: 📋 დაგეგმილი
> პრიორიტეტი: 🔴 მაღალი
> სავარაუდო დრო: 1-2 კვირა

---

## Overview

Blog subdomain (`blog.czaba.com`) სადაც გამოქვეყნდება სტატიები sound design-ზე, production tips, tutorials და სიახლეები.

---

## User Stories

### US-1: Blog-ის მონახულება

```
როგორც: ვიზიტორი
მინდა: წავიკითხო სტატიები sound design-ზე
რათა: ვისწავლო ახალი ტექნიკები და შევიძინო პროდუქტები
```

**Acceptance Criteria:**
- [ ] blog.czaba.com ან czaba.com/blog
- [ ] სტატიების სია (thumbnail, title, date)
- [ ] სრული სტატიის გვერდი
- [ ] კატეგორიები/tags ფილტრაცია

---

### US-2: SEO Optimization

```
როგორც: საიტის მფლობელი
მინდა: Blog სტატიები იყოს SEO-optimized
რათა: Google-დან მოვიზიდო ორგანული ტრაფიკი
```

**Acceptance Criteria:**
- [ ] Meta tags (title, description, og:image)
- [ ] Structured data (Article schema)
- [ ] Sitemap.xml
- [ ] Fast loading (Core Web Vitals)

---

### US-3: Newsletter Integration

```
როგორც: მკითხველი
მინდა: გამოვიწერო blog updates
რათა: მივიღო ახალი სტატიები email-ზე
```

**Acceptance Criteria:**
- [ ] Subscribe form სტატიის ბოლოს
- [ ] Brevo integration
- [ ] Same list as main newsletter ან ცალკე

---

## Platform Options

| პლატფორმა | Pros | Cons | ფასი |
|-----------|------|------|------|
| **Ghost** | SEO-friendly, სწრაფი, ლამაზი | ცალკე hosting | $9/თვე (self-host უფასო) |
| **WordPress** | Plugins, flexibility | შეიძლება ნელი იყოს | უფასო + hosting |
| **Hashnode** | უფასო, custom domain | ნაკლები control | უფასო |
| **Custom (Remix)** | სრული control, same stack | Development time | უფასო |

**რეკომენდაცია:** Ghost (self-hosted) ან Hashnode დასაწყისისთვის

---

## Content Ideas

### Tutorials
- "How to Layer Cinematic Percussion"
- "Creating Tension with Sound Design"
- "5 Ways to Use Ambient Textures in Film"
- "Lo-Fi Production Tips for Beginners"
- "Mixing Techniques for Cinematic Music"

### Behind the Scenes
- "How We Create Our Sound Packs"
- "Studio Tour"
- "Artist Spotlight: [Producer Name]"

### Industry
- "Best DAWs for Film Scoring in 2026"
- "Free vs Paid Sample Libraries"
- "Copyright and Licensing Explained"

### Product Related
- "New Release: [Pack Name] Overview"
- "How Customers Use Our Sounds"
- "Pack Walkthrough: [Pack Name]"

---

## Technical Setup (Ghost)

```bash
# Self-hosted Ghost on DigitalOcean/Railway
# Domain: blog.czaba.com

# DNS Setup:
blog.czaba.com → Ghost server IP
```

**Theme:** Custom CZABA theme ან modified Casper

---

## Integration with Main Site

- [ ] Header link: "Blog" → blog.czaba.com
- [ ] Footer link
- [ ] Homepage section: "Latest from Blog" (3 posts)
- [ ] Product pages: Related blog posts

---

## Launch Checklist

1. [ ] აირჩიე platform (Ghost/WordPress/Hashnode)
2. [ ] Setup subdomain DNS
3. [ ] Install/configure
4. [ ] Customize theme (CZABA branding)
5. [ ] Write first 3-5 სტატია
6. [ ] Add newsletter form
7. [ ] Connect Google Search Console
8. [ ] Add links from main site
9. [ ] Launch & promote

---

## Success Metrics

| Metric | Target (Month 3) |
|--------|------------------|
| Monthly visitors | 1,000 |
| Avg. time on page | 3 min |
| Newsletter signups from blog | 100 |
| Referral sales from blog | 5% |

---

*Created: 2026-01-10*
