create schema if not exists "api";


alter table "galaxy"."roles" enable row level security;

alter table "galaxy"."user_roles" enable row level security;


