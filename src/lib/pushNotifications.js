export async function requestNotificationPermission() {
  // Check if notifications are supported
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications not supported in this browser')
  }

  // First, just request permission
  const permission = await Notification.requestPermission()
  
  if (permission !== 'granted') {
    throw new Error('Notification permission denied')
  }
  
  // Wait a moment for iOS to process the permission
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Then subscribe
  return await subscribeUserToPush()
}

async function subscribeUserToPush() {
  // Make sure service worker is ready
  const registration = await navigator.serviceWorker.ready
  
  // Check if already subscribed
  let subscription = await registration.pushManager.getSubscription()
  
  if (subscription) {
    return subscription
  }
  
  // Get the VAPID key
  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!vapidKey) {
    throw new Error('VAPID key not configured')
  }
  
  // Create new subscription
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