import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Capsule, CapsuleType } from '@/types'

// ---------------------------------------------------------------------------
// Persisted UI preferences (localStorage)
// ---------------------------------------------------------------------------

interface UIPreferences {
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
}

export const useUIPreferences = create<UIPreferences>()(
  persist(
    (set) => ({
      viewMode: 'grid',
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    { name: 'nuclea-ui-preferences' }
  )
)

// ---------------------------------------------------------------------------
// Main app store (non-persisted)
// ---------------------------------------------------------------------------

interface AppState {
  // User state
  user: User | null
  setUser: (user: User | null) => void

  // Sidebar
  sidebarOpen: boolean
  toggleSidebar: () => void

  // Modal state — generic modal id OR specific boolean helpers
  modalOpen: string | null
  openModal: (modalId: string) => void
  closeModal: () => void

  // Create-capsule modal (dashboard)
  createModalOpen: boolean
  setCreateModalOpen: (open: boolean) => void

  // Dashboard search
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Capsule creation
  newCapsuleType: CapsuleType | null
  setNewCapsuleType: (type: CapsuleType | null) => void

  // Selected capsule
  selectedCapsule: Capsule | null
  setSelectedCapsule: (capsule: Capsule | null) => void

  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // Notifications
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

export const useAppStore = create<AppState>((set) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),

  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Modal state
  modalOpen: null,
  openModal: (modalId) => set({ modalOpen: modalId }),
  closeModal: () => set({ modalOpen: null }),

  // Create-capsule modal
  createModalOpen: false,
  setCreateModalOpen: (open) => set({ createModalOpen: open }),

  // Dashboard search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Capsule creation
  newCapsuleType: null,
  setNewCapsuleType: (type) => set({ newCapsuleType: type }),

  // Selected capsule
  selectedCapsule: null,
  setSelectedCapsule: (capsule) => set({ selectedCapsule: capsule }),

  // Loading states
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Notifications
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: crypto.randomUUID() }
      ]
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }))
}))
