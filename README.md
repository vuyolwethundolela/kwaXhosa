# KwaXhosa (demo build)

Static PWA. No build step.

## Host on GitHub Pages
1. Create a repo and upload everything in this folder (keep `img/` and `index.html` at the repo root).
2. Settings > Pages > Deploy from branch > `main` / root.
3. Open `https://<user>.github.io/<repo>/`. Open it on a phone and choose Add to Home screen.

## Notes
- The site starts with no events. Events come only from Supabase. `TOWNS` and `POSTAL` (place lookup) live in `index.html`.
- All UI text sits in the `I18N` object so isiXhosa can be added.
- Next: stockist finder, ad system, gallery lightbox, admin, Supabase/PostGIS, Next.js port.

## Connect Supabase
1. Supabase > SQL Editor: run `supabase/schema.sql`, (there is no demo data).
2. Project Settings > API: copy the Project URL and the anon public key into `config.js`. Never use the service_role key.
3. Commit and push. With config.js empty the site shows no events and posts are not saved.

Current rule: anyone can post an event (no sign-in yet). Add phone/email sign-in, CAPTCHA and rate limiting before public launch.

## v2 additions
- Where to buy: retail chains (Spar/Tops, Shoprite, Checkers, Boxer, Pick n Pay and their liquor stores) found live from OpenStreetMap within 10-100 km of any place, postal code or event. Results say "Likely stocked" until a brand confirms; brand-supplied lists go in the `brand_stores` table (`supabase/schema_v2.sql`).
- Live Google map: put your Maps JavaScript API key in `config.js` (`gmapsKey`) and restrict it to your site address.
- Place search uses the Google Geocoder when a key is set, otherwise OpenStreetMap Nominatim.
- Not built yet: photo upload, sign-in and CAPTCHA, admin dashboard, advertiser analytics, real brand logos.
