-- Expunge — Subscription & Billing Schema

create type public.plan_tier as enum ('free', 'basic', 'pro', 'partner');
create type public.sub_status as enum ('active', 'canceled', 'past_due', 'trialing', 'paused');

create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  plan public.plan_tier not null default 'free',
  status public.sub_status not null default 'active',
  square_customer_id text,
  square_subscription_id text unique,
  square_card_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;
create policy "Users can view own subscription"
  on public.subscriptions for select using (auth.uid() = user_id);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function update_updated_at();

-- Auto-create free subscription on user signup
create or replace function handle_new_subscription()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute function handle_new_subscription();

-- Plan limits lookup (used by API to gate features)
create table public.plan_limits (
  plan public.plan_tier primary key,
  max_cases int not null,
  max_items_per_case int not null,
  tri_bureau boolean not null default false,
  escalation_bot boolean not null default false,
  partner_dashboard boolean not null default false,
  monthly_price_cents int not null default 0
);

insert into public.plan_limits values
  ('free',    1,  3,  false, false, false,     0),
  ('basic',   5,  15, false, false, false,  4900),
  ('pro',     999, 999, true, true,  false,  9900),
  ('partner', 999, 999, true, true,  true,  29900);

alter table public.plan_limits enable row level security;
create policy "Anyone can read plan limits"
  on public.plan_limits for select using (true);
