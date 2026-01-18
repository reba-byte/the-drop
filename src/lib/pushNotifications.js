export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported')
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
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}