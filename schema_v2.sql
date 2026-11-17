-- Brand-supplied store lists (e.g. Navada). Run after schema.sql.
create table if not exists brand_stores(
  id uuid primary key default gen_random_uuid(),
  brand text not null, name text not null, address text,
  lat double precision not null, lng double precision not null, phone text, hours text
);
alter table brand_stores enable row level security;
create policy "public reads brand stores" on brand_stores for select using (true);
-- Add rows from the Supabase dashboard (insert is not public).
