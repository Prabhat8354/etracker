import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebaseConfig.js'
import { useAuthContext } from './AuthContext.jsx'
import { useExpenseContext } from './ExpenseContext.jsx'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendBrowserNotification,
  getNotificationStatus
} from '../services/notificationService.js'
import { loadFromStorage, saveToStorage, parseLocalDate, formatCurrency } from '../utils/helpers.jsx'

const NotificationContext = createContext(null)

const defaultNotificationSettings = {
  enabled: false,
  billReminders: true,
  savingsReminders: true,
  transactionAlerts: false,
  updatedAt: null
}

const userStorageKey = (uid, key) => `etracker_${uid}_${key}`

export function NotificationProvider({ children }) {
  const { user, authLoading } = useAuthContext()
  const { bills, savingsGoal, summary, settings: expenseSettings } = useExpenseContext()

  const [notificationSettings, setNotificationSettings] = useState(defaultNotificationSettings)
  const [permission, setPermission] = useState(() => getNotificationPermission())
  const [loading, setLoading] = useState(true)
  const [inAppNotifications, setInAppNotifications] = useState([])

  const isSupported = useMemo(() => isNotificationSupported(), [])

  // In-memory ref to deduplicate reminders within the active session / StrictMode
  const notifiedRemindersRef = useRef(new Set())

  // Keep browser permission in sync (check on mount & window focus)
  const refreshPermission = useCallback(() => {
    const current = getNotificationPermission()
    setPermission(current)
    return current
  }, [])

  useEffect(() => {
    refreshPermission()
    const handleFocus = () => refreshPermission()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refreshPermission])

  // Load in-app notifications from local storage on user change
  useEffect(() => {
    if (!user) {
      setInAppNotifications([])
      return
    }
    const stored = loadFromStorage(userStorageKey(user.uid, 'in_app_notifications')) || []
    setInAppNotifications(stored)
  }, [user])

  // Realtime Firestore synchronization for notification preferences: users/{uid}/settings/notifications
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setNotificationSettings(defaultNotificationSettings)
      setLoading(false)
      return
    }

    if (!db) {
      console.warn('Firestore is not configured. Falling back to local storage for notifications.')
      const local = loadFromStorage(userStorageKey(user.uid, 'notification_settings'))
      if (local) setNotificationSettings(local)
      setLoading(false)
      return
    }

    const docRef = doc(db, 'users', user.uid, 'settings', 'notifications')
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        const merged = {
          enabled: Boolean(data.enabled),
          billReminders: data.billReminders ?? true,
          savingsReminders: data.savingsReminders ?? true,
          transactionAlerts: Boolean(data.transactionAlerts),
          updatedAt: data.updatedAt || null
        }
        setNotificationSettings(merged)
        saveToStorage(userStorageKey(user.uid, 'notification_settings'), merged)
      } else {
        // Document does not exist yet. Check if local settings exist or keep default.
        const local = loadFromStorage(userStorageKey(user.uid, 'notification_settings'))
        if (local) {
          setNotificationSettings(local)
        } else {
          setNotificationSettings(defaultNotificationSettings)
        }
      }
      setLoading(false)
    }, (error) => {
      console.error('Firestore notification settings listener failed:', error)
      toast.error('Unable to synchronize notification settings from cloud.')
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [user, authLoading])

  // Helper to persist in-app notifications
  const pushInAppNotification = useCallback((notification) => {
    if (!user) return
    setInAppNotifications((prev) => {
      const exists = prev.some((n) => n.id === notification.id)
      if (exists) return prev
      const updated = [notification, ...prev].slice(0, 30) // Keep last 30
      saveToStorage(userStorageKey(user.uid, 'in_app_notifications'), updated)
      return updated
    })
  }, [user])

  const markAllNotificationsRead = useCallback(() => {
    if (!user) return
    setInAppNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }))
      saveToStorage(userStorageKey(user.uid, 'in_app_notifications'), updated)
      return updated
    })
    toast.success('All notifications marked as read')
  }, [user])

  const clearNotification = useCallback((id) => {
    if (!user) return
    setInAppNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id)
      saveToStorage(userStorageKey(user.uid, 'in_app_notifications'), updated)
      return updated
    })
  }, [user])

  const clearAllNotifications = useCallback(() => {
    if (!user) return
    setInAppNotifications([])
    saveToStorage(userStorageKey(user.uid, 'in_app_notifications'), [])
    toast.success('Notification history cleared')
  }, [user])

  // Computed status indicator based on permission & setting
  const status = useMemo(() => {
    return getNotificationStatus(notificationSettings.enabled, permission)
  }, [notificationSettings.enabled, permission])

  /**
   * Toggle master notifications on/off.
   * Handles browser permission prompts on user click when turning ON.
   */
  const toggleMasterNotifications = async (targetState) => {
    if (!user) {
      toast.error('You must be signed in to manage notifications.')
      return
    }

    if (targetState === false) {
      // User turning OFF
      const updated = {
        ...notificationSettings,
        enabled: false,
        updatedAt: serverTimestamp()
      }
      setNotificationSettings(updated)
      saveToStorage(userStorageKey(user.uid, 'notification_settings'), {
        ...updated,
        updatedAt: new Date().toISOString()
      })

      if (db) {
        try {
          await setDoc(doc(db, 'users', user.uid, 'settings', 'notifications'), updated, { merge: true })
        } catch (err) {
          console.error('Failed to disable notifications in Firestore:', err)
          toast.error('Failed to update cloud notification settings.')
        }
      }

      toast.success('Notifications disabled.')
      return
    }

    // User turning ON
    if (!isSupported) {
      toast.error('Your browser does not support notifications.')
      return
    }

    let currentPerm = refreshPermission()

    // If permission is currently default, request permission now on direct user click
    if (currentPerm === 'default') {
      try {
        currentPerm = await requestNotificationPermission()
        setPermission(currentPerm)
      } catch (err) {
        console.error('Error requesting notification permission:', err)
        toast.error('Failed to request notification permission.')
        return
      }
    }

    if (currentPerm === 'denied') {
      toast.error('Notifications are blocked for this site. Please allow them in your browser settings.')
      return
    }

    if (currentPerm === 'granted') {
      const updated = {
        ...notificationSettings,
        enabled: true,
        updatedAt: serverTimestamp()
      }
      setNotificationSettings(updated)
      saveToStorage(userStorageKey(user.uid, 'notification_settings'), {
        ...updated,
        updatedAt: new Date().toISOString()
      })

      if (db) {
        try {
          await setDoc(doc(db, 'users', user.uid, 'settings', 'notifications'), updated, { merge: true })
        } catch (err) {
          console.error('Failed to enable notifications in Firestore:', err)
          toast.error('Failed to update cloud notification settings.')
        }
      }

      toast.success('Notifications are enabled.')
    } else {
      toast.error('Please allow notifications in your browser.')
    }
  }

  /**
   * Request permission directly from UI if permission is required or blocked
   */
  const requestPermissionDirectly = async () => {
    if (!isSupported) {
      toast.error('Your browser does not support notifications.')
      return
    }

    const currentPerm = refreshPermission()
    if (currentPerm === 'denied') {
      toast.error('Notifications are blocked. Please click the lock icon next to the URL to enable notifications.')
      return
    }

    const result = await requestNotificationPermission()
    setPermission(result)

    if (result === 'granted') {
      toast.success('Browser notification permission granted!')
      // If master toggle wasn't on yet, enable it
      if (!notificationSettings.enabled) {
        await toggleMasterNotifications(true)
      }
    } else if (result === 'denied') {
      toast.error('Notifications permission was denied.')
    }
  }

  /**
   * Update granular sub-preference (billReminders, savingsReminders, transactionAlerts)
   */
  const updateNotificationPreference = async (key, value) => {
    if (!user) return

    const updated = {
      ...notificationSettings,
      [key]: value,
      updatedAt: serverTimestamp()
    }

    setNotificationSettings(updated)
    saveToStorage(userStorageKey(user.uid, 'notification_settings'), {
      ...updated,
      updatedAt: new Date().toISOString()
    })

    if (db) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'settings', 'notifications'), updated, { merge: true })
      } catch (err) {
        console.error(`Failed to update ${key} in Firestore:`, err)
        toast.error('Failed to update setting in cloud.')
      }
    }

    const labels = {
      billReminders: 'Bill reminders',
      savingsReminders: 'Savings reminders',
      transactionAlerts: 'Transaction alerts'
    }
    toast.success(`${labels[key] || key} ${value ? 'enabled' : 'disabled'}`)
  }

  /**
   * Send test notification with thorough validation
   */
  const sendTestNotification = () => {
    if (!isSupported) {
      toast.error('Your browser does not support notifications.')
      return
    }

    const currentPerm = refreshPermission()

    if (currentPerm === 'denied') {
      toast.error('Notifications are blocked in your browser. Please allow them in site settings.')
      return
    }

    if (currentPerm === 'default') {
      toast.error('Permission required. Please enable notifications first.')
      return
    }

    if (currentPerm === 'granted') {
      const dispatched = sendBrowserNotification('eTracker', {
        body: 'Test notification from eTracker',
        icon: '/favicon.svg'
      })

      if (dispatched) {
        pushInAppNotification({
          id: `test-${Date.now()}`,
          title: 'eTracker Test Alert',
          body: 'Test notification received successfully.',
          type: 'test',
          timestamp: Date.now(),
          read: false
        })
        toast.success('Test notification sent!')
      } else {
        toast.error('Browser rejected the notification. Check system notification settings.')
      }
    }
  }

  /**
   * Transaction Alert Trigger
   */
  const triggerTransactionAlert = useCallback((transaction) => {
    if (!notificationSettings.enabled || !notificationSettings.transactionAlerts) return
    if (permission !== 'granted') return

    const currencySymbol = transaction.currency || expenseSettings?.currency || 'USD'
    const sign = transaction.type === 'income' ? '+' : '-'
    const formatted = formatCurrency(transaction.amount, currencySymbol)
    const title = transaction.type === 'income' ? 'Income Logged' : 'Expense Logged'
    const body = `${sign}${formatted} for "${transaction.title || 'Untitled'}" (${transaction.category || 'General'})`

    sendBrowserNotification(title, {
      body,
      tag: `tx-${transaction.id || Date.now()}`
    })

    pushInAppNotification({
      id: `tx-${transaction.id || Date.now()}`,
      title,
      body,
      type: 'transaction',
      timestamp: Date.now(),
      read: false
    })
  }, [notificationSettings.enabled, notificationSettings.transactionAlerts, permission, expenseSettings, pushInAppNotification])

  /**
   * Trip Event Notification Trigger (invitation, member joined, expense added)
   */
  const triggerTripNotification = useCallback(({ title, body, id, type = 'trip' }) => {
    const dedupeKey = `trip-${id || body}`
    if (notifiedRemindersRef.current.has(dedupeKey)) return
    notifiedRemindersRef.current.add(dedupeKey)

    if (notificationSettings.enabled && permission === 'granted') {
      sendBrowserNotification(title, {
        body,
        tag: dedupeKey,
      })
    }

    pushInAppNotification({
      id: dedupeKey,
      title,
      body,
      type,
      timestamp: Date.now(),
      read: false,
    })
  }, [notificationSettings.enabled, permission, pushInAppNotification])

  /**
   * Bill Reminders Dispatcher with stable deduplication and StrictMode resilience
   */
  useEffect(() => {
    if (!user || loading) return
    if (!notificationSettings.enabled || !notificationSettings.billReminders) return
    if (permission !== 'granted') return
    if (!bills || bills.length === 0) return

    const todayStr = new Date().toISOString().slice(0, 10)
    const notifiedKey = userStorageKey(user.uid, 'notified_bills')
    const storedNotified = loadFromStorage(notifiedKey) || {}

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    bills.forEach((bill) => {
      if (bill.status === 'paid') return

      const rawDate = bill.dueDate || bill.date
      if (!rawDate) return

      const billDate = parseLocalDate(rawDate)
      billDate.setHours(0, 0, 0, 0)
      const diffTime = billDate.getTime() - now.getTime()
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Notify if overdue or due within 3 days
      if (daysLeft <= 3) {
        const dedupeKey = `${bill.id}_${rawDate}_${daysLeft <= 0 ? 'overdue' : 'upcoming'}_${todayStr}`

        // StrictMode / session deduplication guard
        if (notifiedRemindersRef.current.has(dedupeKey)) return
        if (storedNotified[dedupeKey]) return

        notifiedRemindersRef.current.add(dedupeKey)
        storedNotified[dedupeKey] = todayStr
        saveToStorage(notifiedKey, storedNotified)

        let title = 'Upcoming Bill Reminder'
        let message = ''
        const formattedAmount = formatCurrency(bill.amount, expenseSettings?.currency || 'USD')

        if (daysLeft < 0) {
          title = 'Overdue Bill Alert'
          message = `Bill "${bill.name}" is overdue by ${Math.abs(daysLeft)} day(s) (${formattedAmount}).`
        } else if (daysLeft === 0) {
          title = 'Bill Due Today'
          message = `Bill "${bill.name}" is due today (${formattedAmount}).`
        } else {
          title = 'Upcoming Bill Reminder'
          message = `Bill "${bill.name}" is due in ${daysLeft} day(s) (${formattedAmount}).`
        }

        sendBrowserNotification(title, {
          body: message,
          tag: `bill-${bill.id}`
        })

        pushInAppNotification({
          id: `bill-${bill.id}-${todayStr}`,
          title,
          body: message,
          type: 'bill',
          timestamp: Date.now(),
          read: false
        })
      }
    })
  }, [bills, user, loading, notificationSettings.enabled, notificationSettings.billReminders, permission, expenseSettings?.currency, pushInAppNotification])

  /**
   * Savings Goal Reminder & Milestone Celebration with stable deduplication
   */
  useEffect(() => {
    if (!user || loading) return
    if (!notificationSettings.enabled || !notificationSettings.savingsReminders) return
    if (permission !== 'granted') return
    if (!savingsGoal || !savingsGoal.amount || Number(savingsGoal.amount) <= 0) return

    const period = savingsGoal.frequency || 'monthly'
    const now = new Date()
    const periodKey = `${period}_${now.getFullYear()}_${period === 'yearly' ? 'year' : now.getMonth()}`
    const dedupeKey = `savings_milestone_${periodKey}`

    const storageKey = userStorageKey(user.uid, 'notified_savings')
    const storedNotified = loadFromStorage(storageKey) || {}

    // Check if goal reached
    if (summary && summary.savings >= savingsGoal.amount) {
      if (notifiedRemindersRef.current.has(dedupeKey) || storedNotified[dedupeKey]) return

      notifiedRemindersRef.current.add(dedupeKey)
      storedNotified[dedupeKey] = true
      saveToStorage(storageKey, storedNotified)

      const title = 'Savings Target Reached! 🎉'
      const message = `Outstanding job! You hit your ${period} savings goal of ${formatCurrency(savingsGoal.amount, savingsGoal.currency || expenseSettings?.currency || 'USD')}!`

      sendBrowserNotification(title, {
        body: message,
        tag: 'savings-goal-reached'
      })

      pushInAppNotification({
        id: `savings-${Date.now()}`,
        title,
        body: message,
        type: 'savings',
        timestamp: Date.now(),
        read: false
      })
    }
  }, [summary, savingsGoal, user, loading, notificationSettings.enabled, notificationSettings.savingsReminders, permission, expenseSettings?.currency, pushInAppNotification])

  const unreadCount = useMemo(() => {
    return inAppNotifications.filter((n) => !n.read).length
  }, [inAppNotifications])

  return (
    <NotificationContext.Provider
      value={{
        notificationSettings,
        permission,
        isSupported,
        status,
        loading,
        inAppNotifications,
        unreadCount,
        toggleMasterNotifications,
        requestPermissionDirectly,
        updateNotificationPreference,
        sendTestNotification,
        triggerTransactionAlert,
        triggerTripNotification,
        markAllNotificationsRead,
        clearNotification,
        clearAllNotifications,
        refreshPermission
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotificationContext = () => useContext(NotificationContext)
