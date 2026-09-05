/**
 * Safe utility service for Web Notification API interactions.
 * Handles permission states ('default', 'granted', 'denied', 'unsupported'),
 * browser support detection, safe notification dispatching, and status resolution.
 */

export const isNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window
}

export const getNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return 'unsupported'
  }
  return Notification.permission
}

export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    return 'unsupported'
  }

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return Notification.permission || 'denied'
  }
}

export const sendBrowserNotification = (title, options = {}) => {
  if (!isNotificationSupported()) {
    console.warn('Browser does not support notifications.')
    return false
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted. Current permission:', Notification.permission)
    return false
  }

  try {
    const notification = new Notification(title, {
      ...options,
    })

    if (typeof options.onClick === 'function') {
      notification.onclick = (event) => {
        try {
          window.focus()
        } catch {
          // ignore focus errors
        }
        options.onClick(event)
      }
    }

    return true
  } catch (error) {
    console.error('Failed to create browser notification:', error)
    return false
  }
}

export const getNotificationStatus = (enabled, permission) => {
  if (permission === 'unsupported') {
    return {
      key: 'unsupported',
      label: '— Notifications unsupported',
      shortLabel: 'Unsupported',
      badgeClass: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
      description: 'Your browser or device does not support the Web Notification API.'
    }
  }

  if (permission === 'denied') {
    return {
      key: 'blocked',
      label: '✕ Notifications blocked',
      shortLabel: 'Blocked',
      badgeClass: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40',
      description: 'Notifications are blocked in your browser. Please allow notifications from your browser site settings.'
    }
  }

  if (permission === 'default') {
    return {
      key: 'permission_required',
      label: '⚠ Permission required',
      shortLabel: 'Permission Required',
      badgeClass: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40',
      description: 'Browser permission is required before notifications can be shown.'
    }
  }

  if (permission === 'granted' && enabled) {
    return {
      key: 'enabled',
      label: '✓ Notifications enabled',
      shortLabel: 'Enabled',
      badgeClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40',
      description: 'Notifications are active and will alert you for important updates.'
    }
  }

  return {
    key: 'disabled',
    label: '○ Notifications paused',
    shortLabel: 'Paused',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
    description: 'Notifications are currently disabled in settings.'
  }
}
