self.addEventListener('push', function(event) {
  console.log('Push event received!', event)
  
  let data = {}
  
  if (event.data) {
    try {
      data = event.data.json()
      console.log('Push data:', data)
    } catch (e) {
      console.error('Error parsing push data:', e)
      data = {
        title: 'The Drop',
        body: event.data.text() || 'New notification'
      }
    }
  }
  
  const options = {
    body: data.body || 'New notification from The Drop',
    icon: '/apple-touch-icon.png',
    badge: '/apple-touch-icon.png',
    data: {
      url: data.url || '/'
    },
    requireInteraction: false,
    tag: 'the-drop-notification'
  }
  
  console.log('Showing notification with options:', options)
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'The Drop', options)
      .then(() => console.log('Notification shown successfully'))
      .catch(err => console.error('Error showing notification:', err))
  )
})

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked')
  event.notification.close()
  
  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // If app is already open, focus it
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus()
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})