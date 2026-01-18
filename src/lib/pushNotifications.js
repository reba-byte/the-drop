export async function requestNotificationPermission() {
  // Wait for service worker to be ready first
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers not supported')
  }
  
  await navigator.serviceWorker.ready
  
  // Now check push support
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported')
  }
  
  if (!('PushManager' in window)) {
    throw new Error('Push notifications not supported')
  }

  // Request permission
  const permission = await Notification.requestPermission()
  
  if (permission !== 'granted') {
    throw new Error('Notification permission denied')
  }
  
  // Wait a moment for iOS to process
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Then subscribe
  return await subscribeUserToPush()
}

async function subscribeUserToPush() {
  const registration = await navigator.serviceWorker.ready
  
  let subscription = await registration.pushManager.getSubscription()
  
  if (subscription) {
    return subscription
  }
  
  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!vapidKey) {
    throw new Error('VAPID key not configured')
  }
  
  subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey)
  })
  
  return subscription
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function checkNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (!('serviceWorker' in navigator)) return 'unsupported'
  if (!('PushManager' in window)) return 'unsupported'
  
  return Notification.permission
}