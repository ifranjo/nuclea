# RLS Policies

Politicas de Row Level Security para Supabase/PostgreSQL.

## Principios

1. Usuario solo accede a sus recursos.
2. Colaboradores acceden segun rol.
3. Destinatarios solo acceden a contenido entregado.
4. Operaciones sensibles pasan por `auth.uid()`.

## Matriz por tabla

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| `users` | `id = auth.uid()` | self | self | soft-delete self |
| `capsules` | owner o collaborator | owner | owner/editor | owner |
| `collaborators` | owner + miembros de capsula | owner | owner | owner |
| `contents` | owner/editor/viewer segun colaboracion | owner/editor | owner/editor | owner/editor |
| `future_messages` | owner de capsula | owner/editor | owner/editor (hasta entrega) | owner/editor (hasta entrega) |
| `subscriptions` | self | service role/webhook | service role/webhook | service role/webhook |

## SQL base (ejemplo)

```sql
alter table users enable row level security;
alter table capsules enable row level security;
alter table collaborators enable row level security;
alter table contents enable row level security;
alter table future_messages enable row level security;
alter table subscriptions enable row level security;
```

### Policy ejemplo - `capsules`

```sql
create policy "capsules_select_owner_or_collab"
on capsules for select
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from collaborators c
    where c.capsule_id = capsules.id
      and c.user_id = auth.uid()
      and c.accepted_at is not null
  )
);

create policy "capsules_insert_owner"
on capsules for insert
with check (owner_id = auth.uid());
```

### Policy ejemplo - `contents`

```sql
create policy "contents_select_if_member"
on contents for select
using (
  exists (
    select 1
    from capsules cp
    left join collaborators c
      on c.capsule_id = cp.id and c.user_id = auth.uid() and c.accepted_at is not null
    where cp.id = contents.capsule_id
      and (cp.owner_id = auth.uid() or c.user_id = auth.uid())
  )
);
```

## Notas de implementacion

- Mantener soft delete para auditoria (`deleted_at`) en vez de `delete` duro.
- Para webhooks/pagos usar `service_role` fuera de RLS usuario final.
- Revisar impacto de indices en subconsultas de policies.

