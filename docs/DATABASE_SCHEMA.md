# NUCLEA Database Schema

**Database:** PostgreSQL (Supabase)
**Version:** 1.0
**Last Updated:** Feb 2026

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────────┐
│   users     │──────<│  capsules   │──────<│    contents     │
└─────────────┘   1:N └─────────────┘   1:N └─────────────────┘
      │                     │
      │                     │
      │               ┌─────┴─────┐
      │               │           │
      │         ┌─────────┐ ┌───────────────┐
      └────────<│recipients│ │future_messages│
            1:N └─────────┘ └───────────────┘
                      │
                ┌─────────────┐
                │collaborators│  (Together capsule only)
                └─────────────┘
```

## Tables

### users
Primary user account table (extends Supabase auth.users).

```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    phone TEXT,

    -- Subscription
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'esencial', 'familiar', 'everlife')),
    subscription_expires_at TIMESTAMPTZ,

    -- Preferences
    language TEXT DEFAULT 'es',
    notifications_enabled BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for inactivity checks (Legacy capsule)
CREATE INDEX idx_users_last_active ON users(last_active_at);
```

### capsules
Core capsule entity. Type determines available features.

```sql
CREATE TYPE capsule_type AS ENUM (
    'legacy',       -- Post-mortem inheritance
    'together',     -- Couples/shared
    'social',       -- Private diary
    'pet',          -- Pet memorial
    'life_chapter', -- Life stages
    'origin'        -- Parents→children
);

CREATE TYPE capsule_status AS ENUM (
    'active',       -- Currently being edited
    'closed',       -- Finalized, no more edits
    'downloaded',   -- User has downloaded archive
    'deleted'       -- Marked for deletion
);

CREATE TABLE public.capsules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Core fields
    type capsule_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,

    -- Status
    status capsule_status DEFAULT 'active',
    closed_at TIMESTAMPTZ,
    downloaded_at TIMESTAMPTZ,

    -- Type-specific metadata (JSONB for flexibility)
    metadata JSONB DEFAULT '{}',
    -- Examples:
    -- legacy: { "inactivity_months": 12, "trusted_contacts": [...] }
    -- pet: { "pet_name": "Max", "species": "dog", "birth_date": "2020-01-15" }
    -- life_chapter: { "chapter_name": "Erasmus", "start_date": "2024-09-01" }
    -- origin: { "child_name": "Lucas", "birth_date": "2025-03-20" }

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_capsules_owner ON capsules(owner_id);
CREATE INDEX idx_capsules_type ON capsules(type);
CREATE INDEX idx_capsules_status ON capsules(status);
```

### contents
Individual content items within capsules.

```sql
CREATE TYPE content_type AS ENUM (
    'photo',
    'video',
    'audio',
    'note',
    'drawing'  -- Only for Origin capsule
);

CREATE TABLE public.contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,

    -- Content info
    type content_type NOT NULL,
    title TEXT,
    description TEXT,

    -- Storage
    storage_path TEXT NOT NULL,  -- Path in Supabase Storage
    file_size_bytes BIGINT,
    mime_type TEXT,
    thumbnail_url TEXT,

    -- Timeline (calendar-based organization)
    content_date DATE NOT NULL,  -- When this memory happened

    -- Metadata
    metadata JSONB DEFAULT '{}',
    -- Examples:
    -- photo: { "width": 1920, "height": 1080, "location": "Barcelona" }
    -- audio: { "duration_seconds": 120 }
    -- video: { "duration_seconds": 300, "width": 1920, "height": 1080 }

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_contents_capsule ON contents(capsule_id);
CREATE INDEX idx_contents_date ON contents(content_date);
CREATE INDEX idx_contents_type ON contents(type);
```

### recipients
People designated to receive capsules (especially Legacy type).

```sql
CREATE TABLE public.recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,

    -- Recipient info (may not be registered user)
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    relationship TEXT,  -- "hijo", "esposa", "amigo", etc.

    -- Permissions
    can_view BOOLEAN DEFAULT false,
    can_download BOOLEAN DEFAULT false,

    -- Delivery settings (Legacy capsule)
    notify_on_closure BOOLEAN DEFAULT true,
    notify_on_inactivity BOOLEAN DEFAULT false,  -- If owner inactive X months

    -- Status
    invitation_sent_at TIMESTAMPTZ,
    invitation_accepted_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_recipients_capsule ON recipients(capsule_id);
CREATE INDEX idx_recipients_email ON recipients(email);
```

### collaborators
For Together capsule - shared editing permissions.

```sql
CREATE TABLE public.collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- If invited but not yet registered
    invited_email TEXT,

    -- Permissions
    can_edit BOOLEAN DEFAULT true,
    can_delete BOOLEAN DEFAULT false,
    can_invite BOOLEAN DEFAULT false,

    -- Status
    invitation_sent_at TIMESTAMPTZ,
    invitation_accepted_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_collaborators_capsule ON collaborators(capsule_id);
CREATE INDEX idx_collaborators_user ON collaborators(user_id);
```

### future_messages
Time-locked content for Legacy capsule.

```sql
CREATE TYPE future_message_status AS ENUM (
    'scheduled',    -- Waiting for unlock date
    'unlocked',     -- Date passed, ready for viewing
    'downloaded',   -- Recipient downloaded
    'expired'       -- 30-day window passed, deleted
);

CREATE TABLE public.future_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES recipients(id) ON DELETE SET NULL,

    -- Content
    title TEXT NOT NULL,
    message_text TEXT,
    content_ids UUID[] DEFAULT '{}',  -- Array of content IDs to include

    -- Scheduling
    unlock_date DATE NOT NULL,
    unlock_time TIME DEFAULT '09:00:00',

    -- Status
    status future_message_status DEFAULT 'scheduled',
    unlocked_at TIMESTAMPTZ,
    downloaded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,  -- 30 days after unlock

    -- Delivery
    notification_sent BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_future_messages_capsule ON future_messages(capsule_id);
CREATE INDEX idx_future_messages_unlock ON future_messages(unlock_date) WHERE status = 'scheduled';
CREATE INDEX idx_future_messages_expires ON future_messages(expires_at) WHERE status = 'unlocked';
```

### subscriptions
Payment and subscription tracking.

```sql
CREATE TYPE payment_provider AS ENUM (
    'stripe',
    'apple_pay',
    'bizum'
);

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Subscription details
    tier TEXT NOT NULL CHECK (tier IN ('free', 'esencial', 'familiar', 'everlife')),
    provider payment_provider,
    provider_subscription_id TEXT,

    -- Billing
    price_cents INTEGER,
    currency TEXT DEFAULT 'EUR',
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'one_time')),

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

## Row Level Security (RLS) Policies

### users table
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);
```

### capsules table
```sql
ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;

-- Owners can CRUD their capsules
CREATE POLICY "Owners can manage capsules" ON capsules
    FOR ALL USING (auth.uid() = owner_id);

-- Collaborators can view/edit Together capsules
CREATE POLICY "Collaborators can access shared capsules" ON capsules
    FOR SELECT USING (
        id IN (
            SELECT capsule_id FROM collaborators
            WHERE user_id = auth.uid() AND invitation_accepted_at IS NOT NULL
        )
    );

-- Recipients can view capsules they're invited to
CREATE POLICY "Recipients can view received capsules" ON capsules
    FOR SELECT USING (
        id IN (
            SELECT capsule_id FROM recipients
            WHERE email = auth.email() AND can_view = true
        )
    );
```

### contents table
```sql
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- Content follows capsule permissions
CREATE POLICY "Content access follows capsule" ON contents
    FOR ALL USING (
        capsule_id IN (
            SELECT id FROM capsules WHERE owner_id = auth.uid()
        )
    );
```

## Database Functions

### Update timestamps trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_capsules_updated_at BEFORE UPDATE ON capsules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON contents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Check future messages (daily cron)
```sql
CREATE OR REPLACE FUNCTION unlock_future_messages()
RETURNS void AS $$
BEGIN
    UPDATE future_messages
    SET
        status = 'unlocked',
        unlocked_at = NOW(),
        expires_at = NOW() + INTERVAL '30 days'
    WHERE
        status = 'scheduled'
        AND unlock_date <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
```

### Expire downloaded messages (daily cron)
```sql
CREATE OR REPLACE FUNCTION expire_old_messages()
RETURNS void AS $$
BEGIN
    UPDATE future_messages
    SET status = 'expired'
    WHERE
        status = 'unlocked'
        AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```
