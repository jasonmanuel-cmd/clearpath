-- ClearPath AI — Knowledge Base + Orchestrator Memory

-- Static knowledge base: 30 years of FCRA case law, bureau patterns, dispute strategies
create table public.dispute_knowledge_base (
  id uuid primary key default uuid_generate_v4(),
  category text not null check (category in (
    'fcra_law', 'case_law', 'bureau_behavior', 'dispute_strategy',
    'cfpb_enforcement', 'collection_violations', 'metro2_errors',
    'identity_theft', 'statute_of_limitations', 'creditor_patterns'
  )),
  subcategory text,
  title text not null,
  content text not null,
  source text,
  year int,
  dispute_types text[],
  bureaus text[],
  tags text[],
  effectiveness_score numeric default 0.5 check (effectiveness_score between 0 and 1),
  created_at timestamptz default now()
);

create index idx_kb_category on public.dispute_knowledge_base(category);
create index idx_kb_dispute_types on public.dispute_knowledge_base using gin(dispute_types);
create index idx_kb_bureaus on public.dispute_knowledge_base using gin(bureaus);
create index idx_kb_tags on public.dispute_knowledge_base using gin(tags);

-- Living orchestrator memory: built from real outcomes over time
create table public.orchestrator_memory (
  id uuid primary key default uuid_generate_v4(),
  dispute_type text not null,
  bureau text not null,
  legal_basis_used text not null,
  strategy_summary text not null,
  letter_tone text,
  outcome text not null check (outcome in ('removed', 'modified', 'verified', 'no_response')),
  avg_days_to_response numeric,
  round int not null default 1,
  insight text not null,
  confidence_score numeric default 0.5 check (confidence_score between 0 and 1),
  sample_count int default 1,
  success_rate numeric default 0 check (success_rate between 0 and 1),
  last_updated timestamptz default now(),
  created_at timestamptz default now(),
  unique (dispute_type, bureau, legal_basis_used, outcome, round)
);

create index idx_mem_dispute_bureau on public.orchestrator_memory(dispute_type, bureau);
create index idx_mem_outcome on public.orchestrator_memory(outcome);

-- Trigger to keep last_updated fresh
create trigger orchestrator_memory_updated
  before update on public.orchestrator_memory
  for each row execute function update_updated_at();

-- Allow service role full access (used by server-side agents)
alter table public.dispute_knowledge_base enable row level security;
create policy "Service role full access to knowledge base"
  on public.dispute_knowledge_base for all
  using (true)
  with check (true);

alter table public.orchestrator_memory enable row level security;
create policy "Service role full access to orchestrator memory"
  on public.orchestrator_memory for all
  using (true)
  with check (true);
