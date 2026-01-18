export async function requestNotificationPermission() {
  // Check if notifications are supported
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications not supported in this browser')
  }

  const permission = await Notification.requestPermission()
  
  if (permission === 'granted') {
    return await subscribeUserToPush()
  }
  
  throw new Error('Notification permission denied')
}

async function subscribeUserToPush() {
  const registration = await navigator.serviceWorker.ready
  
  // Get the subscription
  let subscription = await registration.pushManager.getSubscription()
  
  if (!subscription) {
    // Create new subscription
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
    })
  }
  
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
  // More thorough check for Safari
  if (!('Notification' in window)) return 'unsupported'
  if (!('serviceWorker' in navigator)) return 'unsupported'
  if (!('PushManager' in window)) return 'unsupported'
  
  // Return the actual permission state
  return Notification.permission
}