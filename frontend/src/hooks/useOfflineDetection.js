import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export function useOfflineDetection() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false)
    }

    function handleOffline() {
      setIsOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Monitor Supabase connection
    const channel = supabase.channel('heartbeat')
    channel.on('system', {}, (status) => {
      if (status === 'CHANNEL_ERROR') {
        setIsOffline(true)
      }
    })
    channel.subscribe()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      channel.unsubscribe()
    }
  }, [])

  return isOffline
}
