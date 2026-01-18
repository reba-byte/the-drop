self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  
  const options = {
    body: data.body || 'New notification from The Drop',
    icon: '/vite.svg',
    badge: '/vite.svg',
    data: data.url || '/',
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'The Drop', options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data)
  )
})