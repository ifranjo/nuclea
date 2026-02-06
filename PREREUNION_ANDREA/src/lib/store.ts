import { create } from 'zustand'
import type { User, Capsule, CapsuleType } from '@/types'

interface AppState {
  // User state
  user: User | null
  setUser: (user: User | null) => void

  // UI state
  sidebarOpen: boolean
  toggleSidebar: () => void

  // Modal state
  modalOpen: string | null
  openModal: (modalId: string) => void
  closeModal: () => void

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

  // UI state
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Modal state
  modalOpen: null,
  openModal: (modalId) => set({ modalOpen: modalId }),
  closeModal: () => set({ modalOpen: null }),

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
