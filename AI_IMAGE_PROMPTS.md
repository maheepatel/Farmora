# Farmora - AI Image Generation Prompts

Run these in **ChatGPT Images** (or Ideogram / Midjourney / Flux) using the imagegen skill rules. Generate **one separate horizontal image per prompt**. Save each to `frontend/public/images/` with the exact filename given. The site is built so you only drop files in and the design picks them up automatically.

**Design language to keep consistent across ALL images:** Editorial light luxury. Off-white / cream paper background, muted sage green accents, warm natural sunlight, film-grain feel, premium agricultural real-estate photography. Avoid beige+brass cliches, avoid AI-purple, keep it calm and expensive.

## 1. Hero (landing page) - `hero.jpg` (16:9)
Breathtaking aerial drone photograph of vast Indian farmland at golden hour, geometric patchwork of green crop fields and amber wheat, a small farmhouse and tree line, soft warm sunlight, gentle atmospheric haze. Editorial, cinematic, calm, premium. No text, no people close-up. High detail, real photography look.

## 2. Featured parcel - `parcel-1.jpg` (4:3)
Direct overhead aerial photo of a single rectangular farm parcel, lush green soybean crop, neat boundary hedge, one small water tank, warm midday light, isolated on a pale paper-toned backdrop edge. Real photography, premium agri-asset photography.

## 3. Parcel - paddy rice - `parcel-2.jpg` (4:3)
Aerial view of a terraced rice paddy parcel in the Indian plains, vibrant green terraces with water reflections, soft cloud shadows. Editorial photography, warm natural grade.

## 4. Parcel - wheat - `parcel-3.jpg` (4:3)
Golden wheat field parcel at harvest, aerial 3/4 angle, wind rows visible, late afternoon warm light, small tractor at the edge. Premium agricultural photography.

## 5. Parcel - vineyard/orchard - `parcel-4.jpg` (4:3)
Aerial view of a young mango orchard parcel, neat rows of trees, red-brown soil, morning mist, one farm worker walking. Editorial, atmospheric.

## 6. Parcel - millet/organic - `parcel-5.jpg` (4:3)
Organic millet field parcel, tall grass-like crop, morning dew, soft warm light, minimal, calm, cinematic. Real photography.

## 7. Parcel - vegetable - `parcel-6.jpg` (4:3)
Neat vegetable farm parcel with drip irrigation rows visible from low aerial, vibrant greens, water droplets, fresh, premium farm-to-market feel.

## 8. How-it-works section image - `process.jpg` (16:10)
Split editorial image: left side shows a farmer handing over a land document; right side shows a person on a phone viewing a digital plot map. Soft paper tones, sage green accents, calm premium flat illustration style mixed with editorial photo. Consistent with site palette.

## 9. Farmer profile photo (testimonial) - `farmer-1.jpg` (1:1)
Portrait of a smiling Indian farmer (50s), wheat field background softly blurred, warm golden light, dignified, premium editorial portrait.

## 10. Farmer profile photo - `farmer-2.jpg` (1:1)
Portrait of a young Indian agri-tech founder or second-gen farmer (30s), standing in a green field at dusk, calm confident expression, editorial premium portrait.

## 11. CTA / community section - `cta-farm.jpg` (16:9)
Wide aerial of a green farm community with windbreak trees and a water body, late afternoon sun rays through clouds, tranquil, premium, hopeful. No text.

## 12. Parcel detail map mock - `map.jpg` (4:3)
A clean, minimal digital farm map of one parcel with soft sage-green boundary overlay on a satellite-style aerial base, faint grid, premium fintech-meets-agri UI illustration. Flat, minimal, no cluttered UI.

---

**File naming note:** The code reads from `frontend/lib/images.ts`. Place files into `frontend/public/images/`. If you rename or miss one, the site falls back to a working stock placeholder so nothing breaks.
