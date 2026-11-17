-- KwaXhosa schema. Run in Supabase: SQL Editor > New query > Run.
create extension if not exists postgis;

create table if not exists events(
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('umgidi','umcimbi','umsebenzi','intonjane','umbhaco','memorial','other')),
  title text not null check (char_length(title) between 3 and 80),
  description text not null check (char_length(description) <= 300),
  host_name text check (char_length(host_name) <= 60),
  event_date date not null,
  start_time time not null,
  end_time time,
  town text not null,
  province text,
  lat double precision not null check (lat between -35 and -22),
  lng double precision not null check (lng between 16 and 33),
  geo geography(point,4326) generated always as (st_point(lng,lat,4326)::geography) stored,
  directions text check (char_length(directions) <= 250),
  phone text not null,
  consent boolean not null check (consent),
  status text not null default 'live' check (status in ('live','flagged','removed')),
  owner uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists events_geo_idx on events using gist(geo);
create index if not exists events_date_idx on events(event_date);

create table if not exists reports(
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  reason text not null check (char_length(reason) <= 300),
  created_at timestamptz not null default now()
);

alter table events enable row level security;
alter table reports enable row level security;
create policy "public reads live events" on events for select using (status = 'live');
create policy "anyone can post an event" on events for insert with check (status = 'live' and consent and owner is null);
create policy "hosts edit own events" on events for update using (auth.uid() = owner);
create policy "hosts delete own events" on events for delete using (auth.uid() = owner);
create policy "anyone can report" on reports for insert with check (true);

-- Radius search for later use: select * from nearby_events(-33.73, 18.96, 50);
create or replace function nearby_events(p_lat double precision, p_lng double precision, radius_km int default 100)
returns table(event_id uuid, event_title text, distance_km double precision)
language sql stable as $$
  select id, title, st_distance(geo, st_point(p_lng, p_lat, 4326)::geography) / 1000
  from events
  where status = 'live' and event_date >= current_date
    and st_dwithin(geo, st_point(p_lng, p_lat, 4326)::geography, radius_km * 1000)
  order by 3
$$;
