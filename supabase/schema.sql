-- ContentPilot cloud sync + subscription schema.
-- Run this once in the Supabase SQL Editor for your project.

-- ---------------------------------------------------------------------------
-- subscriptions: one row per user, tracks Stripe subscription status.
-- Only the Stripe webhook (using the service_role key, which bypasses RLS)
-- is ever allowed to write to this table. Users can only read their own row.
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'free', -- 'free' | 'active' | 'past_due' | 'canceled'
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- No insert/update/delete policies for regular users on purpose — the
-- service_role key (used only from the Stripe webhook) is the only writer.

-- ---------------------------------------------------------------------------
-- cloud_snapshots: one row per user holding their entire app state as JSON
-- (the same shape as the existing local export/import backup format). This
-- is what powers cross-device sync for Pro subscribers.
--
-- Writes are gated at the database level to users with an active
-- subscription — the paywall is enforced here, not just in the UI.
-- ---------------------------------------------------------------------------
create table if not exists public.cloud_snapshots (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.cloud_snapshots enable row level security;

create policy "Users can read their own snapshot"
  on public.cloud_snapshots for select
  using (auth.uid() = user_id);

create policy "Pro users can create their own snapshot"
  on public.cloud_snapshots for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.subscriptions s
      where s.user_id = auth.uid() and s.status = 'active'
    )
  );

create policy "Pro users can update their own snapshot"
  on public.cloud_snapshots for update
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.subscriptions s
      where s.user_id = auth.uid() and s.status = 'active'
    )
  );

-- Keep updated_at fresh on every write.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.cloud_snapshots;
create trigger set_updated_at
  before update on public.cloud_snapshots
  for each row execute function public.touch_updated_at();
