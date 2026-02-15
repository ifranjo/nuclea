# NUCLEA TypeScript Types

Central type definitions for the entire application.

## Enums

```typescript
// Capsule Types
export type CapsuleType =
  | 'legacy'
  | 'together'
  | 'social'
  | 'pet'
  | 'life-chapter'
  | 'origin';

// Capsule Status
export type CapsuleStatus =
  | 'active'
  | 'closed'
  | 'downloaded'
  | 'deleted';

// Content Types
export type ContentType =
  | 'photo'
  | 'video'
  | 'audio'
  | 'note'
  | 'drawing';

// Subscription Tiers
export type SubscriptionTier =
  | 'free'
  | 'esencial'
  | 'familiar'
  | 'premium'
  | 'everlife'; // legacy label kept for historical compatibility

// Future Message Status
export type FutureMessageStatus =
  | 'scheduled'
  | 'unlocked'
  | 'downloaded'
  | 'expired';

// Invitation Status
export type InvitationStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'expired';

// Payment Provider
export type PaymentProvider =
  | 'stripe'
  | 'apple_pay'
  | 'bizum';

// Social Reactions
export type ReactionEmoji =
  | '❤️'
  | '😂'
  | '😢'
  | '🔥'
  | '👏'
  | '🤗';
```

Compatibility note:
- UI/runtime slug standard: `life-chapter`.
- Legacy alias still found in existing data: `everlife` (normalize to `legacy` at app boundary).
- SQL enum naming may use underscore variants (for example `life_chapter`) and should be mapped in data-access layers.

---

## Core Entities

### User
```typescript
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt: Date | null;
  language: string;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

export interface UserProfile extends User {
  capsuleCount: number;
  storageUsed: number;  // bytes
  storageLimit: number; // bytes
}
```

### Capsule
```typescript
export interface Capsule {
  id: string;
  ownerId: string;
  type: CapsuleType;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  status: CapsuleStatus;
  closedAt: Date | null;
  downloadedAt: Date | null;
  metadata: CapsuleMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface CapsuleWithOwner extends Capsule {
  owner: User;
}

export interface CapsuleWithContents extends Capsule {
  contents: Content[];
  contentCount: number;
}
```

### Capsule Metadata (by type)
```typescript
// Base metadata interface
export interface BaseCapsuleMetadata {
  [key: string]: any;
}

// Legacy Capsule
export interface LegacyCapsuleMetadata extends BaseCapsuleMetadata {
  inactivityMonths: 6 | 12;
  lastVerificationSent: Date | null;
  trustedContacts: TrustedContact[];
  aiAvatarEnabled: boolean;
  aiAvatarConsentAt: Date | null;
  deliveryStatus: 'pending' | 'warning_sent' | 'triggered' | 'delivered';
}

// Together Capsule
export interface TogetherCapsuleMetadata extends BaseCapsuleMetadata {
  mode: 'share' | 'gift';
  originalCreatorId: string;
  partnerInvitedAt: Date | null;
  partnerAcceptedAt: Date | null;
  closureRequest: {
    initiatedBy: string;
    initiatedAt: Date;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    expiresAt: Date;
  } | null;
  giftMessage: string | null;
  giftCoverTemplate: string | null;
  giftScheduledAt: Date | null;
  giftDeliveredAt: Date | null;
}

// Social Capsule
export interface SocialCapsuleMetadata extends BaseCapsuleMetadata {
  maxSocials: number;
  reactionsEnabled: boolean;
  closureShareWithFriends: boolean;
  viewingModeDefault: 'timeline' | 'calendar';
}

// Pet Capsule
export interface PetCapsuleMetadata extends BaseCapsuleMetadata {
  petName: string;
  species: string;
  breed: string | null;
  birthDate: Date | null;
  passingDate: Date | null;
  traits: string[];
  memorialMode: boolean;
  familySharingEnabled: boolean;
  familyCanAdd: boolean;
  reminders: {
    birthAnniversary: boolean;
    passingAnniversary: boolean;
  };
}

// Life Chapter Capsule
export interface LifeChapterCapsuleMetadata extends BaseCapsuleMetadata {
  chapterType: string;
  chapterTitle: string;
  startDate: Date;
  expectedEndDate: Date | null;
  actualEndDate: Date | null;
  milestones: Milestone[];
  closingReflection: string | null;
  giftRecipientId: string | null;
  giftMessage: string | null;
  suggestionsEnabled: boolean;
  lastSuggestionAt: Date | null;
}

// Origin Capsule
export interface OriginCapsuleMetadata extends BaseCapsuleMetadata {
  childName: string;
  birthDate: Date;
  startedDuringPregnancy: boolean;
  pregnancyStartDate: Date | null;
  targetGiftAge: number;
  coParentId: string | null;
  milestones: OriginMilestone[];
  closingLetter: string | null;
  giftPreparedAt: Date | null;
  giftDeliveredAt: Date | null;
  promptsEnabled: boolean;
  lastPromptAt: Date | null;
}

// Union type for all metadata
export type CapsuleMetadata =
  | LegacyCapsuleMetadata
  | TogetherCapsuleMetadata
  | SocialCapsuleMetadata
  | PetCapsuleMetadata
  | LifeChapterCapsuleMetadata
  | OriginCapsuleMetadata;
```

### Content
```typescript
export interface Content {
  id: string;
  capsuleId: string;
  type: ContentType;
  title: string | null;
  description: string | null;
  storagePath: string;
  fileSizeBytes: number | null;
  mimeType: string | null;
  thumbnailUrl: string | null;
  contentDate: Date;
  metadata: ContentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentMetadata {
  originalName?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  location?: string;
  // Drawing-specific
  childAgeAtCreation?: string;
  titleByChild?: string;
  medium?: string;
  preservedOriginal?: boolean;
  context?: string;
  // Audio-specific
  soundType?: string;
}

export interface ContentWithUrl extends Content {
  url: string;  // Signed URL for access
}
```

### Recipient
```typescript
export interface Recipient {
  id: string;
  capsuleId: string;
  email: string;
  name: string | null;
  phone: string | null;
  relationship: string | null;
  canView: boolean;
  canDownload: boolean;
  notifyOnClosure: boolean;
  notifyOnInactivity: boolean;
  invitationSentAt: Date | null;
  invitationAcceptedAt: Date | null;
  createdAt: Date;
}
```

### Collaborator
```typescript
export interface Collaborator {
  id: string;
  capsuleId: string;
  userId: string | null;
  invitedEmail: string | null;
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  invitationSentAt: Date | null;
  invitationAcceptedAt: Date | null;
  createdAt: Date;
}

export interface CollaboratorWithUser extends Collaborator {
  user: User | null;
}
```

### Trusted Contact
```typescript
export interface TrustedContact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  relationship: string;
  canCancelDelivery: boolean;
  addedAt: Date;
  lastVerificationAt: Date | null;
}
```

### Future Message
```typescript
export interface FutureMessage {
  id: string;
  capsuleId: string;
  recipientId: string | null;
  title: string;
  messageText: string | null;
  contentIds: string[];
  unlockDate: Date;
  unlockTime: string;
  status: FutureMessageStatus;
  unlockedAt: Date | null;
  downloadedAt: Date | null;
  expiresAt: Date | null;
  notificationSent: boolean;
  createdAt: Date;
}

export interface FutureMessageWithContents extends FutureMessage {
  contents: Content[];
  recipient: Recipient | null;
}
```

### Milestone
```typescript
export interface Milestone {
  id: string;
  title: string;
  date: Date | null;
  completed: boolean;
  contentIds: string[];
  notes?: string;
}

export interface OriginMilestone extends Milestone {
  category: 'physical' | 'communication' | 'social' | 'education' | 'special';
  ageAtMilestone?: string;
}
```

### Reaction
```typescript
export interface Reaction {
  id: string;
  contentId: string;
  userId: string;
  emoji: ReactionEmoji;
  createdAt: Date;
}

export interface ReactionWithUser extends Reaction {
  user: Pick<User, 'id' | 'displayName' | 'avatarUrl'>;
}
```

### Subscription
```typescript
export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  provider: PaymentProvider | null;
  providerSubscriptionId: string | null;
  priceCents: number | null;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'one_time' | null;
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## API Types

### Request Types
```typescript
// Create Capsule
export interface CreateCapsuleRequest {
  type: CapsuleType;
  title: string;
  description?: string;
  metadata?: Partial<CapsuleMetadata>;
}

// Create Content
export interface CreateContentRequest {
  type: ContentType;
  contentDate: string;  // ISO date
  title?: string;
  description?: string;
  metadata?: ContentMetadata;
}

// Create Recipient
export interface CreateRecipientRequest {
  email: string;
  name: string;
  relationship?: string;
  permissions: {
    canView: boolean;
    canDownload: boolean;
  };
  deliveryPreferences?: {
    notifyOnClosure: boolean;
    notifyOnInactivity: boolean;
  };
}

// Create Future Message
export interface CreateFutureMessageRequest {
  title: string;
  messageText?: string;
  contentIds: string[];
  unlockDate: string;  // ISO date
  unlockTime?: string; // HH:MM
  recipientId: string;
}
```

### Response Types
```typescript
// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Error Response
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// Archive Response
export interface ArchiveResponse {
  archiveUrl?: string;
  archiveJobId?: string;
  status: 'ready' | 'processing' | 'queued';
}
```

---

## Store Types (Zustand)

```typescript
export interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // Capsules
  capsules: Capsule[];
  currentCapsule: CapsuleWithContents | null;

  // UI
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setCapsules: (capsules: Capsule[]) => void;
  setCurrentCapsule: (capsule: CapsuleWithContents | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
```

---

## Utility Types

```typescript
// Make all properties optional recursively
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Extract ID type
export type EntityId = string;

// Date or string (for API)
export type DateLike = Date | string;

// Nullable type
export type Nullable<T> = T | null;

// With required ID
export type WithId<T> = T & { id: EntityId };

// Omit ID for creation
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

// Update input (partial without timestamps)
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
```
