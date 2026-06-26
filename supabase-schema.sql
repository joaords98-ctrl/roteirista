-- ============================================================
-- RoterizAI — SCHEMA V1 (Missões no centro)
-- Rode no SQL Editor do Supabase. Compatível com o schema antigo:
-- adiciona o que falta sem apagar dados existentes.
-- ============================================================

-- CAMADA 2: perfil individual do criador
create table if not exists perfis (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nicho text, tom text, abordagem text, estilo text, formato text,
  aparece boolean default false, duracao int default 60,
  publico text default 'neutro', dna jsonb,
  criado_em timestamptz default now()
);

-- NÚCLEO DO SISTEMA: Missões (objetivos grandes)
create table if not exists missoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  titulo text not null,
  objetivo text,
  publico text,
  plataforma text,
  status text default 'ativa',
  criado_em timestamptz default now()
);

-- Roteiros — agora vinculados a uma missão
create table if not exists roteiros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  missao_id uuid references missoes(id) on delete cascade,
  tema text, conteudo jsonb, check_resultado jsonb, passou boolean default false,
  views int, retencao numeric, compartilhamentos int, seguidores_gerados int,
  publicado boolean default false,
  criado_em timestamptz default now()
);
alter table roteiros add column if not exists missao_id uuid references missoes(id) on delete cascade;

-- RLS
alter table perfis enable row level security;
alter table missoes enable row level security;
alter table roteiros enable row level security;

do $$ begin create policy "perfil - select" on perfis for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "perfil - insert" on perfis for insert with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "perfil - update" on perfis for update using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "missao - all" on missoes for all using (auth.uid() = user_id) with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "roteiro - all" on roteiros for all using (auth.uid() = user_id) with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
