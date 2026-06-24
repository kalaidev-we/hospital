-- schema.sql
-- Run this in Supabase SQL editor to create the tokens table and policies.

create extension if not exists pgcrypto;

CREATE TABLE public.tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  token_no integer NOT NULL,
  name text NOT NULL,
  phone text,
  details text,
  room text,
  status text NOT NULL DEFAULT 'waiting',
  eta timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS tokens_token_no_idx ON public.tokens(token_no);

ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_authenticated_select ON public.tokens
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY allow_authenticated_insert ON public.tokens
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY allow_authenticated_update ON public.tokens
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
