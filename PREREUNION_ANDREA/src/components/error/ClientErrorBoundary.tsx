'use client'

import { Component, ReactNode } from 'react'

interface ClientErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
}

interface ClientErrorBoundaryState {
  hasError: boolean
}

export default class ClientErrorBoundary extends Component<ClientErrorBoundaryProps, ClientErrorBoundaryState> {
  state: ClientErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ClientErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('Client error boundary caught:', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}