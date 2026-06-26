-- ============================================================
-- SCHEMA DO BANCO — rode isto no SQL Editor do Supabase
-- (Dashboard > SQL Editor > New query > cole tudo > Run)
-- ============================================================

-- CAMADA 2: perfil individual do criador
create table if not exists perfis (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nicho text,
  tom text,
  abordagem text,
  estilo text,
  formato text,
  aparece boolean default false,
  duracao int default 60,
  publico text default 'neutro',
  dna jsonb,                       -- DNA editorial (atualizado com o tempo)
  criado_em timestamptz default now()
);

-- Biblioteca pessoal: roteiros gerados
create table if not exists roteiros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  tema text,
  conteudo jsonb,                  -- headline, hook, blocos, cta...
  check_resultado jsonb,           -- resultado da verificação automática
  passou boolean default false,
  -- métricas reais informadas após publicar (ciclo de aprendizado)
  views int,
  retencao numeric,
  compartilhamentos int,
  seguidores_gerados int,
  publicado boolean default false,
  criado_em timestamptz default now()
);

-- ============================================================
-- RLS (Row Level Security): cada usuário só vê os próprios dados
-- ============================================================
alter table perfis enable row level security;
alter table roteiros enable row level security;

create policy "perfil proprio - select" on perfis for select using (auth.uid() = user_id);
create policy "perfil proprio - insert" on perfis for insert with check (auth.uid() = user_id);
create policy "perfil proprio - update" on perfis for update using (auth.uid() = user_id);

create policy "roteiro proprio - select" on roteiros for select using (auth.uid() = user_id);
create policy "roteiro proprio - insert" on roteiros for insert with check (auth.uid() = user_id);
create policy "roteiro proprio - update" on roteiros for update using (auth.uid() = user_id);
create policy "roteiro proprio - delete" on roteiros for delete using (auth.uid() = user_id);
