-- ClearPath AI — Database Schema

create extension if not exists "uuid-ossp";

-- User profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'consumer' check (role in ('consumer', 'partner', 'admin')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Partner to consumer relationships
create table public.partner_clients (
  id uuid primary key default uuid_generate_v4(),
  partner_id uuid references public.profiles(id) on delete cascade not null,
  consumer_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (partner_id, consumer_id)
);

alter table public.partner_clients enable row level security;
create policy "Partners can view own clients" on public.partner_clients for select using (auth.uid() = partner_id);

-- Cases (one per credit report submission)
create table public.cases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'analyzing' check (status in ('analyzing', 'routing', 'active', 'monitoring', 'completed', 'escalated')),
  credit_report_text text,
  credit_report_url text,
  orchestrator_output jsonb,
  round int not null default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.cases enable row level security;
create policy "Users can view own cases" on public.cases for select using (auth.uid() = user_id);
create policy "Partners can view client cases" on public.cases for select using (
  exists (select 1 from public.partner_clients pc where pc.partner_id = auth.uid() and pc.consumer_id = user_id)
);

-- Individual dispute items within a case
create table public.dispute_items (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references public.cases(id) on delete cascade not null,
  type text not null check (type in ('bankruptcy', 'credit_card', 'mortgage', 'auto', 'collections', 'public_record', 'fraud', 'inquiry')),
  account_name text not null,
  account_number text,
  bureau text check (bureau in ('equifax', 'experian', 'transunion', 'all')),
  amount numeric,
  dispute_reason text,
  legal_basis text,
  specialist_output jsonb,
  status text not null default 'pending' check (status in ('pending', 'letter_drafted', 'dispatched', 'filed', 'under_review', 'received', 'removed', 'modified', 'verified', 'no_response')),
  round int not null default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.dispute_items enable row level security;
create policy "Users can view own dispute items" on public.dispute_items for select using (
  exists (select 1 from public.cases c where c.id = case_id and c.user_id = auth.uid())
);

-- Generated dispute letters
create table public.letters (
  id uuid primary key default uuid_generate_v4(),
  dispute_item_id uuid references public.dispute_items(id) on delete cascade not null,
  bureau text not null check (bureau in ('equifax', 'experian', 'transunion', 'data_furnisher')),
  content text not null,
  round int not null default 1,
  is_cfpb_complaint boolean default false,
  created_at timestamptz default now()
);

alter table public.letters enable row level security;
create policy "Users can view own letters" on public.letters for select using (
  exists (
    select 1 from public.dispute_items di
    join public.cases c on c.id = di.case_id
    where di.id = dispute_item_id and c.user_id = auth.uid()
  )
);

-- Dispatch records (one per letter per bureau)
create table public.dispatch_records (
  id uuid primary key default uuid_generate_v4(),
  letter_id uuid references public.letters(id) on delete cascade not null,
  bureau text not null check (bureau in ('equifax', 'experian', 'transunion', 'data_furnisher')),
  tracking_number text,
  status text not null default 'queued' check (status in ('queued', 'sent', 'delivered', 'response_received', 'no_response')),
  sent_at timestamptz,
  response_due_at timestamptz,
  response_received_at timestamptz,
  created_at timestamptz default now()
);

alter table public.dispatch_records enable row level security;
create policy "Users can view own dispatch records" on public.dispatch_records for select using (
  exists (
    select 1 from public.letters l
    join public.dispute_items di on di.id = l.dispute_item_id
    join public.cases c on c.id = di.case_id
    where l.id = letter_id and c.user_id = auth.uid()
  )
);

-- Outcomes (result of each dispatch)
create table public.outcomes (
  id uuid primary key default uuid_generate_v4(),
  dispatch_record_id uuid references public.dispatch_records(id) on delete cascade not null,
  result text not null check (result in ('removed', 'modified', 'verified', 'no_response')),
  score_impact_points int,
  notes text,
  recorded_at timestamptz default now()
);

alter table public.outcomes enable row level security;
create policy "Users can view own outcomes" on public.outcomes for select using (
  exists (
    select 1 from public.dispatch_records dr
    join public.letters l on l.id = dr.letter_id
    join public.dispute_items di on di.id = l.dispute_item_id
    join public.cases c on c.id = di.case_id
    where dr.id = dispatch_record_id and c.user_id = auth.uid()
  )
);

-- Intelligence layer — outcome dataset for model improvement
create table public.intelligence_records (
  id uuid primary key default uuid_generate_v4(),
  dispute_type text not null,
  bureau text not null,
  legal_basis text,
  round int not null,
  result text not null,
  days_to_response int,
  recorded_at timestamptz default now()
);

-- Trigger: update updated_at on cases and dispute_items
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cases_updated_at before update on public.cases
  for each row execute function update_updated_at();

create trigger dispute_items_updated_at before update on public.dispute_items
  for each row execute function update_updated_at();

-- Trigger: auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'consumer')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
