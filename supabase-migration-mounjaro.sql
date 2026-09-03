-- ============================================================
-- MIGRACAO: Adaptacao para Mounjaro + Ferramentas Comportamentais
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de Agendamento do Mounjaro
create table if not exists public.mounjaro_schedule (
    id uuid default uuid_generate_v4() primary key,
    dia_semana text not null check (dia_semana in ('dom','seg','ter','qua','qui','sex','sab')),
    ultima_aplicacao date,
    criado_em timestamp with time zone default now() not null
);

-- 2. Registro de Aplicacao Semanal do Mounjaro
create table if not exists public.mounjaro_applications (
    id uuid default uuid_generate_v4() primary key,
    data date default current_date unique not null,
    aplicado boolean default false not null,
    observacao text,
    criado_em timestamp with time zone default now() not null
);

-- 3. Rastreador de Efeitos Colaterais
create table if not exists public.side_effects (
    id uuid default uuid_generate_v4() primary key,
    data date default current_date unique not null,
    nauseas boolean default false not null,
    azia boolean default false not null,
    constipacao boolean default false not null,
    saciedade boolean default false not null,
    bem boolean default false not null,
    criado_em timestamp with time zone default now() not null
);

-- 4. Termometro da Fome
create table if not exists public.hunger_tracker (
    id uuid default uuid_generate_v4() primary key,
    data date default current_date unique not null,
    tipo text check (tipo in ('fisica', 'vontade', 'emocional')),
    criado_em timestamp with time zone default now() not null
);

-- 5. Proteina e Fibras
create table if not exists public.protein_fiber (
    id uuid default uuid_generate_v4() primary key,
    data date default current_date unique not null,
    proteina_ok boolean default false not null,
    fibras_ok boolean default false not null,
    agua_ok boolean default false not null,
    criado_em timestamp with time zone default now() not null
);

-- 6. Vitorias Alem da Balanca (semanal)
create table if not exists public.non_scale_victories (
    id uuid default uuid_generate_v4() primary key,
    semana date not null,
    roupas_folgadas boolean default false not null,
    folego_melhor boolean default false not null,
    comida_no_prato boolean default false not null,
    disposicao_alta boolean default false not null,
    criado_em timestamp with time zone default now() not null
);

-- 7. Missao do Dia
create table if not exists public.daily_missions (
    id uuid default uuid_generate_v4() primary key,
    data date default current_date unique not null,
    missao text not null,
    concluida boolean default false not null,
    criado_em timestamp with time zone default now() not null
);

-- 8. Registro de Pausa (Urge Surfing)
create table if not exists public.pause_tracker (
    id uuid default uuid_generate_v4() primary key,
    data date default current_date not null,
    horario time default current_time not null,
    duracao_segundos integer default 180 not null,
    concluida boolean default false not null,
    criado_em timestamp with time zone default now() not null
);

-- ============================================================
-- SEED: Missao do dia por dia da semana
-- ============================================================
-- As missoes sao definidas no frontend, mas podemos criar uma tabela auxiliar
-- ou usar o array no codigo. Manteremos no frontend para flexibilidade.

-- ============================================================
-- SEED: Agenda padrao do Mounjaro (Quinta-feira)
-- ============================================================
insert into public.mounjaro_schedule (dia_semana)
values ('qui')
on conflict do nothing;

-- ============================================================
-- 9. Notificacoes do Guardiao para o Paciente
-- ============================================================
create table if not exists public.guardian_notifications (
    id uuid default uuid_generate_v4() primary key,
    titulo text not null,
    mensagem text not null,
    horario time not null,
    ativa boolean default true not null,
    criado_em timestamp with time zone default now() not null
);

-- ============================================================
-- 10. Tokens FCM para Push Notifications
-- ============================================================
create table if not exists public.device_tokens (
    id uuid default uuid_generate_v4() primary key,
    token text not null unique,
    plataforma text default 'web' not null,
    ativo boolean default true not null,
    criado_em timestamp with time zone default now() not null
);

-- ============================================================
-- 11. Trigger: enviar push quando cria notificacao do guardiao
-- ============================================================
-- Habilitar extensao pg_net (necessaria pra HTTP assincrono)
create extension if not exists pg_net with schema extensions;

-- Funcao que chama a Edge Function
create or replace function public.notify_push()
returns trigger as $$
begin
    perform net.http_post(
        url    := current_setting('app.settings.supabase_url') || '/functions/v1/send-push',
        headers := jsonb_build_object(
            'Content-Type',  'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body   := jsonb_build_object(
            'record', row_to_json(NEW),
            'type',   TG_OP,
            'table',  TG_TABLE_NAME,
            'schema', TG_TABLE_SCHEMA
        )
    );
    return new;
end;
$$ language plpgsql security definer;

-- Trigger na tabela guardian_notifications
create trigger on_guardian_notification_insert
    after insert on public.guardian_notifications
    for each row
    execute function public.notify_push();

-- Configurar settings pra trigger acessar (substitua pelos valores reais)
-- alter database postgres set "app.settings.supabase_url" = 'https://SEU-PROJETO.supabase.co';
-- alter database postgres set "app.settings.service_role_key" = 'SUA-CHAVE-SERVICE-ROLE';
