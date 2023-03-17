import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { RemoteContent } from 'nextra/data'

export function DocPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const showLoader = () => setLoading(true)
    const hideLoader = () => setLoading(false)

    router.events.on('routeChangeStart', showLoader)
    router.events.on('routeChangeComplete', hideLoader)

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', showLoader)
      router.events.off('routeChangeComplete', hideLoader)
    }
  }, [])

  return (
    (router.isFallback || loading)
      ? <div>Loading...</div>
      : <RemoteContent />
  )
}
