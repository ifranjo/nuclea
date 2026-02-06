# Modelo de Datos NUCLEA

Especificación del schema de base de datos para Supabase (PostgreSQL).

## Diagrama ER simplificado

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    users     │──1:N─│   capsules   │──1:N─│   contents   │
└──────────────┘      └──────────────┘      └──────────────┘
       │                     │                     │
       │                     │                     │
       │              ┌──────┴──────┐              │
       │              │             │              │
       │              ▼             ▼              │
       │     ┌──────────────┐ ┌──────────────┐    │
       │     │ collaborators│ │future_messages│    │
       │     └──────────────┘ └──────────────┘    │
       │                                          │
       └─────────────────┬────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ subscriptions│
                  └──────────────┘
```

## Tablas principales

### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  country_code TEXT DEFAULT 'ES',

  -- Legal
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### capsules

```sql
CREATE TYPE capsule_type AS ENUM (
  'legacy',
  'together',
  'social',
  'pet',
  'life_chapter',
  'origin'
);

CREATE TYPE capsule_status AS ENUM (
  'draft',
  'active',
  'closed',
  'downloaded',
  'expired',
  'archived'
);

CREATE TABLE capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Tipo y estado
  type capsule_type NOT NULL,
  status capsule_status DEFAULT 'draft',

  -- Metadata
  title TEXT,
  description TEXT,
  cover_image_url TEXT,

  -- Configuración
  settings JSONB DEFAULT '{}',
  -- Ejemplo settings:
  -- {
  --   "delivery_trigger": "manual" | "date" | "inactivity",
  --   "delivery_date": "2030-01-01",
  --   "inactivity_days": 365,
  --   "allow_ai_avatar": true
  -- }

  -- Storage
  storage_used_bytes BIGINT DEFAULT 0,
  storage_limit_bytes BIGINT DEFAULT 524288000, -- 500MB default

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  downloaded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_capsules_owner ON capsules(owner_id);
CREATE INDEX idx_capsules_type ON capsules(type);
CREATE INDEX idx_capsules_status ON capsules(status);
```

### collaborators

```sql
CREATE TYPE collaborator_role AS ENUM (
  'owner',
  'editor',
  'viewer'
);

CREATE TABLE collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  role collaborator_role DEFAULT 'viewer',

  -- Invitación
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  -- Para invitaciones pendientes
  invite_email TEXT,
  invite_token TEXT UNIQUE,
  invite_expires_at TIMESTAMPTZ,

  UNIQUE(capsule_id, user_id)
);

-- Índices
CREATE INDEX idx_collaborators_capsule ON collaborators(capsule_id);
CREATE INDEX idx_collaborators_user ON collaborators(user_id);
CREATE INDEX idx_collaborators_token ON collaborators(invite_token);
```

### contents

```sql
CREATE TYPE content_type AS ENUM (
  'photo',
  'video',
  'audio',
  'text',
  'drawing'
);

CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),

  type content_type NOT NULL,

  -- Archivo (para photo, video, audio, drawing)
  file_path TEXT, -- Path en Supabase Storage
  file_size_bytes BIGINT,
  mime_type TEXT,

  -- Texto (para text)
  text_content TEXT,

  -- Metadata común
  title TEXT,
  description TEXT,
  captured_at TIMESTAMPTZ, -- Fecha original del contenido
  location JSONB, -- {"lat": 40.4168, "lng": -3.7038, "name": "Madrid"}

  -- Ordenamiento
  sort_order INTEGER DEFAULT 0,
  chapter TEXT, -- Para Life Chapter

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_contents_capsule ON contents(capsule_id);
CREATE INDEX idx_contents_type ON contents(type);
CREATE INDEX idx_contents_created_at ON contents(created_at);
```

### future_messages

```sql
CREATE TYPE message_status AS ENUM (
  'scheduled',
  'delivered',
  'downloaded',
  'expired',
  'cancelled'
);

CREATE TABLE future_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),

  -- Contenido (cifrado)
  content_type content_type NOT NULL,
  encrypted_content BYTEA, -- Contenido cifrado
  encryption_key_id TEXT, -- Referencia a key en vault

  -- Destinatario
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  recipient_user_id UUID REFERENCES users(id), -- Si ya es usuario

  -- Programación
  scheduled_date DATE NOT NULL,
  status message_status DEFAULT 'scheduled',

  -- Entrega
  delivered_at TIMESTAMPTZ,
  download_deadline TIMESTAMPTZ, -- scheduled_date + 30 días
  downloaded_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Audit
  delivery_attempts INTEGER DEFAULT 0,
  last_delivery_attempt TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_future_messages_capsule ON future_messages(capsule_id);
CREATE INDEX idx_future_messages_scheduled ON future_messages(scheduled_date);
CREATE INDEX idx_future_messages_status ON future_messages(status);
CREATE INDEX idx_future_messages_recipient ON future_messages(recipient_email);
```

### subscriptions

```sql
CREATE TYPE subscription_status AS ENUM (
  'active',
  'past_due',
  'cancelled',
  'expired'
);

CREATE TYPE plan_type AS ENUM (
  'free',
  'esencial',
  'familiar',
  'everlife'
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  plan plan_type NOT NULL,
  status subscription_status DEFAULT 'active',

  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,

  -- Período
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,

  -- Cancelación
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
```

### designated_persons

```sql
CREATE TABLE designated_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE,

  -- Datos de contacto
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  relationship TEXT, -- "Hijo", "Esposa", "Amigo", etc.

  -- Verificación
  verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verified_at TIMESTAMPTZ,

  -- Configuración de entrega
  delivery_priority INTEGER DEFAULT 1, -- Orden de entrega

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_designated_user ON designated_persons(user_id);
CREATE INDEX idx_designated_capsule ON designated_persons(capsule_id);
```

### audit_logs

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Quién
  user_id UUID REFERENCES users(id),

  -- Qué
  action TEXT NOT NULL, -- 'capsule.created', 'content.uploaded', etc.
  resource_type TEXT, -- 'capsule', 'content', 'message'
  resource_id UUID,

  -- Detalles
  details JSONB DEFAULT '{}',

  -- Contexto
  ip_address INET,
  user_agent TEXT,

  -- Cuándo
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

## Supabase Storage Buckets

```sql
-- Bucket para contenido de cápsulas
INSERT INTO storage.buckets (id, name, public)
VALUES ('capsule-contents', 'capsule-contents', false);

-- Bucket para avatares de usuario
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Bucket para mensajes futuros (cifrados)
INSERT INTO storage.buckets (id, name, public)
VALUES ('future-messages', 'future-messages', false);
```

### Estructura de paths en Storage

```
capsule-contents/
├── {user_id}/
│   ├── {capsule_id}/
│   │   ├── photos/
│   │   │   ├── {content_id}.jpg
│   │   │   └── {content_id}_thumb.jpg
│   │   ├── videos/
│   │   │   ├── {content_id}.mp4
│   │   │   └── {content_id}_thumb.jpg
│   │   ├── audios/
│   │   │   └── {content_id}.m4a
│   │   └── drawings/
│   │       └── {content_id}.png

future-messages/
├── {message_id}/
│   └── encrypted_content.bin

avatars/
├── {user_id}.jpg
```

## Row Level Security (RLS)

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE future_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de users
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Políticas de capsules
CREATE POLICY "Users can view own capsules"
  ON capsules FOR SELECT
  USING (
    owner_id = auth.uid()
    OR id IN (
      SELECT capsule_id FROM collaborators
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create capsules"
  ON capsules FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update capsules"
  ON capsules FOR UPDATE
  USING (owner_id = auth.uid());

-- Políticas de contents
CREATE POLICY "Collaborators can view contents"
  ON contents FOR SELECT
  USING (
    capsule_id IN (
      SELECT id FROM capsules WHERE owner_id = auth.uid()
      UNION
      SELECT capsule_id FROM collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create contents"
  ON contents FOR INSERT
  WITH CHECK (
    capsule_id IN (
      SELECT id FROM capsules WHERE owner_id = auth.uid()
      UNION
      SELECT capsule_id FROM collaborators
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );
```

## Funciones de base de datos

```sql
-- Función para calcular storage usado
CREATE OR REPLACE FUNCTION calculate_capsule_storage(capsule_uuid UUID)
RETURNS BIGINT AS $$
  SELECT COALESCE(SUM(file_size_bytes), 0)
  FROM contents
  WHERE capsule_id = capsule_uuid AND deleted_at IS NULL;
$$ LANGUAGE SQL;

-- Trigger para actualizar storage
CREATE OR REPLACE FUNCTION update_capsule_storage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE capsules
  SET storage_used_bytes = calculate_capsule_storage(
    COALESCE(NEW.capsule_id, OLD.capsule_id)
  )
  WHERE id = COALESCE(NEW.capsule_id, OLD.capsule_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_storage_trigger
AFTER INSERT OR UPDATE OR DELETE ON contents
FOR EACH ROW EXECUTE FUNCTION update_capsule_storage();

-- Función para verificar límite de storage
CREATE OR REPLACE FUNCTION check_storage_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_storage BIGINT;
  storage_limit BIGINT;
BEGIN
  SELECT storage_used_bytes, storage_limit_bytes
  INTO current_storage, storage_limit
  FROM capsules WHERE id = NEW.capsule_id;

  IF (current_storage + NEW.file_size_bytes) > storage_limit THEN
    RAISE EXCEPTION 'Storage limit exceeded';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_storage_before_insert
BEFORE INSERT ON contents
FOR EACH ROW EXECUTE FUNCTION check_storage_limit();
```

---

*Schema optimizado para Supabase con RLS habilitado*
