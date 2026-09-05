import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDocs,
  getDoc,
  writeBatch
} from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'
import { db } from '../firebase/firebaseConfig.js'
import { useAuthContext } from './AuthContext.jsx'
import { useExpenseContext } from './ExpenseContext.jsx'
import { useNotificationContext } from './NotificationContext.jsx'

const TripContext = createContext()

export function TripProvider({ children }) {
  const { user } = useAuthContext()
  const { addTransaction } = useExpenseContext() || {}
  const { triggerTripNotification } = useNotificationContext() || {}

  const [trips, setTrips] = useState([])
  const [loadingTrips, setLoadingTrips] = useState(true)
  const [invitations, setInvitations] = useState([])
  const [loadingInvitations, setLoadingInvitations] = useState(true)

  // Track notified invitations to avoid re-render spam
  const notifiedInvitesRef = useRef(new Set())

  /**
   * Real-time listener for trips:
   * Query top-level trips where user.uid is in participantIds
   */
  useEffect(() => {
    if (!user) {
      setTrips([])
      setLoadingTrips(false)
      return
    }

    setLoadingTrips(true)

    const tripsCol = collection(db, 'trips')
    // Primary query on participantIds
    const qParticipant = query(tripsCol, where('participantIds', 'array-contains', user.uid))

    let unsubLegacy = null
    const unsubscribe = onSnapshot(
      qParticipant,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))

        // Sort descending by updatedAt or createdAt
        list.sort((a, b) => {
          const timeA = a.updatedAt?.toMillis?.() || (a.createdAt?.toMillis?.() || 0)
          const timeB = b.updatedAt?.toMillis?.() || (b.createdAt?.toMillis?.() || 0)
          return timeB - timeA
        })

        setTrips(list)
        setLoadingTrips(false)
      },
      (error) => {
        console.warn('Error fetching collaborative trips (participantIds):', error.message)
        // Fallback query on legacy memberIds if any
        try {
          const qLegacy = query(tripsCol, where('memberIds', 'array-contains', user.uid))
          unsubLegacy = onSnapshot(
            qLegacy,
            (legacySnap) => {
              const list = legacySnap.docs.map((d) => ({ id: d.id, ...d.data() }))
              setTrips(list)
              setLoadingTrips(false)
            },
            (legacyErr) => {
              console.warn('Legacy trips query error:', legacyErr.message)
              setLoadingTrips(false)
            }
          )
        } catch {
          setLoadingTrips(false)
        }
      }
    )

    return () => {
      if (unsubscribe) unsubscribe()
      if (unsubLegacy) unsubLegacy()
    }
  }, [user])

  /**
   * Real-time listener for pending trip invitations:
   * Listens to users/{uid}/tripInvites (with tripInvitations fallback)
   */
  useEffect(() => {
    if (!user) {
      setInvitations([])
      setLoadingInvitations(false)
      return
    }

    setLoadingInvitations(true)
    const invCol = collection(db, 'users', user.uid, 'tripInvites')
    const qInv = query(invCol, where('status', '==', 'pending'))

    let unsubLegacyInv = null
    const unsubscribeInv = onSnapshot(
      qInv,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))

        // Trigger notifications for new invites
        list.forEach((inv) => {
          if (!notifiedInvitesRef.current.has(inv.id)) {
            notifiedInvitesRef.current.add(inv.id)
            if (triggerTripNotification) {
              triggerTripNotification({
                title: 'Trip Invitation',
                body: `${inv.invitedByName || 'A friend'} invited you to join "${inv.tripName}".`,
                id: `inv-${inv.id}`,
                type: 'trip',
              })
            }
          }
        })

        setInvitations(list)
        setLoadingInvitations(false)
      },
      (error) => {
        console.warn('Error fetching trip invitations from tripInvites:', error.message)
        // Check legacy tripInvitations
        try {
          const legacyCol = collection(db, 'users', user.uid, 'tripInvitations')
          unsubLegacyInv = onSnapshot(
            query(legacyCol, where('status', '==', 'pending')),
            (legSnap) => {
              setInvitations(legSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
              setLoadingInvitations(false)
            },
            (legErr) => {
              console.warn('Legacy trip invitations error:', legErr.message)
              setLoadingInvitations(false)
            }
          )
        } catch {
          setLoadingInvitations(false)
        }
      }
    )

    return () => {
      if (unsubscribeInv) unsubscribeInv()
      if (unsubLegacyInv) unsubLegacyInv()
    }
  }, [user, triggerTripNotification])

  /**
   * Create a new top-level trip document in trips/{tripId}
   */
  const createTrip = async (tripData) => {
    if (!user) {
      toast.error('You must be signed in to create a trip.')
      return null
    }

    try {
      const tripRef = doc(collection(db, 'trips'))
      const tripId = tripRef.id

      const creatorName = user.displayName || user.email?.split('@')[0] || 'User'
      const creatorEmail = (user.email || '').toLowerCase()

      const newTripDoc = {
        name: tripData.name.trim(),
        destination: tripData.destination?.trim() || '',
        description: tripData.description?.trim() || '',
        startDate: tripData.startDate || new Date().toISOString().slice(0, 10),
        endDate: tripData.endDate || new Date().toISOString().slice(0, 10),
        currency: tripData.currency || 'INR',
        createdBy: user.uid,
        createdByName: creatorName,
        createdByEmail: creatorEmail,
        participantIds: [user.uid],
        memberIds: [user.uid], // backward-compatibility alias
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await setDoc(tripRef, newTripDoc)

      // Add creator as first member in members subcollection
      const memberRef = doc(db, 'trips', tripId, 'members', user.uid)
      await setDoc(memberRef, {
        uid: user.uid,
        displayName: creatorName,
        email: creatorEmail,
        photoURL: user.photoURL || null,
        role: 'creator',
        joinedAt: serverTimestamp(),
      })

      toast.success(`Trip "${newTripDoc.name}" created!`)
      return tripId
    } catch (error) {
      console.error('Error creating collaborative trip:', error)
      toast.error('Failed to create trip.')
      return null
    }
  }

  /**
   * Search for an existing registered eTracker user by email
   */
  const searchUserByEmail = async (email) => {
    if (!email || !email.trim()) return null
    const searchEmail = email.trim().toLowerCase()

    if (user && searchEmail === (user.email || '').toLowerCase()) {
      return { error: 'You cannot invite yourself.' }
    }

    try {
      const q = query(
        collection(db, 'users'),
        where('email', '==', searchEmail),
        limit(1)
      )
      const snap = await getDocs(q)
      if (snap.empty) {
        return null
      }
      const userDoc = snap.docs[0]
      return {
        uid: userDoc.id,
        ...userDoc.data(),
      }
    } catch (error) {
      console.error('Error searching user by email:', error)
      toast.error('Error searching for user.')
      return null
    }
  }

  /**
   * Invite an existing user to a trip at users/{targetUser.uid}/tripInvites/{inviteId}
   */
  const inviteUserToTrip = async (trip, targetUser) => {
    if (!user || !trip || !targetUser) return false

    // Check if user is already in participantIds
    const participants = trip.participantIds || trip.memberIds || []
    if (participants.includes(targetUser.uid)) {
      toast.error(`${targetUser.displayName || targetUser.email} is already a participant in this trip.`)
      return false
    }

    try {
      const invRef = doc(collection(db, 'users', targetUser.uid, 'tripInvites'))
      await setDoc(invRef, {
        tripId: trip.id,
        tripName: trip.name,
        destination: trip.destination || '',
        currency: trip.currency || 'INR',
        invitedBy: user.uid,
        invitedByName: user.displayName || user.email?.split('@')[0] || 'A friend',
        invitedByEmail: user.email,
        invitedUserId: targetUser.uid,
        invitedUserEmail: targetUser.email,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      toast.success(`Invitation sent to ${targetUser.displayName || targetUser.email}!`)
      return true
    } catch (error) {
      console.error('Error inviting user:', error)
      toast.error('Failed to send invitation.')
      return false
    }
  }

  /**
   * Accept an invitation:
   * Adds user.uid to trips/{tripId}.participantIds and creates member record
   */
  const acceptInvitation = async (invitation) => {
    if (!user || !invitation) return false

    try {
      const tripRef = doc(db, 'trips', invitation.tripId)
      const tripSnap = await getDoc(tripRef)

      if (!tripSnap.exists()) {
        toast.error('This trip no longer exists.')
        // Mark invitation declined
        try {
          await updateDoc(doc(db, 'users', user.uid, 'tripInvites', invitation.id), {
            status: 'declined',
            updatedAt: serverTimestamp(),
          })
        } catch {}
        return false
      }

      const batch = writeBatch(db)

      // 1. Add user UID to trip's participantIds & memberIds
      batch.update(tripRef, {
        participantIds: arrayUnion(user.uid),
        memberIds: arrayUnion(user.uid),
        updatedAt: serverTimestamp(),
      })

      // 2. Add member document to trips/{tripId}/members/{user.uid}
      const memberRef = doc(db, 'trips', invitation.tripId, 'members', user.uid)
      batch.set(memberRef, {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email,
        photoURL: user.photoURL || null,
        role: 'member',
        joinedAt: serverTimestamp(),
      })

      // 3. Mark invitation accepted in tripInvites
      const invRef = doc(db, 'users', user.uid, 'tripInvites', invitation.id)
      batch.update(invRef, {
        status: 'accepted',
        updatedAt: serverTimestamp(),
      })

      await batch.commit()

      toast.success(`You joined "${invitation.tripName}"!`)
      return true
    } catch (error) {
      console.error('Error accepting invitation:', error)
      toast.error('Failed to join trip.')
      return false
    }
  }

  /**
   * Decline an invitation
   */
  const declineInvitation = async (invitationId) => {
    if (!user || !invitationId) return false
    try {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'tripInvites', invitationId), {
          status: 'declined',
          updatedAt: serverTimestamp(),
        })
      } catch {
        await updateDoc(doc(db, 'users', user.uid, 'tripInvitations', invitationId), {
          status: 'declined',
          updatedAt: serverTimestamp(),
        })
      }
      toast.success('Invitation declined.')
      return true
    } catch (error) {
      console.error('Error declining invitation:', error)
      toast.error('Failed to decline invitation.')
      return false
    }
  }

  /**
   * Hook to subscribe to an active collaborative trip and its subcollections
   */
  const useActiveTrip = (tripId) => {
    const [trip, setTrip] = useState(null)
    const [members, setMembers] = useState([])
    const [expenses, setExpenses] = useState([])
    const [settlements, setSettlements] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      if (!user || !tripId) {
        setTrip(null)
        setMembers([])
        setExpenses([])
        setSettlements([])
        setLoading(false)
        return
      }

      setLoading(true)

      const tripDocRef = doc(db, 'trips', tripId)
      const membersCol = collection(db, 'trips', tripId, 'members')
      const expensesCol = collection(db, 'trips', tripId, 'expenses')
      const settlementsCol = collection(db, 'trips', tripId, 'settlements')

      // Listen to trip metadata
      const unsubTrip = onSnapshot(
        tripDocRef,
        (snap) => {
          if (snap.exists()) {
            setTrip({ id: snap.id, ...snap.data() })
          } else {
            setTrip(null)
          }
        },
        (err) => {
          console.warn('Trip document sync error:', err.message)
          setLoading(false)
        }
      )

      // Listen to members
      const unsubMembers = onSnapshot(
        membersCol,
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            name: d.data().displayName || d.data().email?.split('@')[0] || 'Member',
            isCurrentUser: d.data().uid === user.uid,
          }))
          // Sort creator first, then current user, then alphabetically
          list.sort((a, b) => {
            if (a.role === 'creator') return -1
            if (b.role === 'creator') return 1
            if (a.isCurrentUser) return -1
            if (b.isCurrentUser) return 1
            return (a.name || '').localeCompare(b.name || '')
          })
          setMembers(list)
        },
        (err) => {
          console.warn('Trip members sync error:', err.message)
          setLoading(false)
        }
      )

      // Listen to expenses
      const unsubExpenses = onSnapshot(
        query(expensesCol, orderBy('date', 'desc')),
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
          setExpenses(list)
        },
        (err) => {
          console.warn('Trip expenses sync error:', err.message)
          setLoading(false)
        }
      )

      // Listen to settlements
      const unsubSettlements = onSnapshot(
        query(settlementsCol, orderBy('date', 'desc')),
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
          setSettlements(list)
          setLoading(false)
        },
        (err) => {
          console.warn('Trip settlements sync error:', err.message)
          setLoading(false)
        }
      )

      return () => {
        unsubTrip()
        unsubMembers()
        unsubExpenses()
        unsubSettlements()
      }
    }, [tripId, user])

    return { trip, members, expenses, settlements, loading }
  }

  /**
   * Add an Expense to trips/{tripId}/expenses
   */
  const addExpense = async (tripId, expenseData) => {
    if (!user || !tripId) return null
    try {
      const expRef = doc(collection(db, 'trips', tripId, 'expenses'))
      const payload = {
        tripId,
        description: expenseData.description.trim(),
        amount: Number(expenseData.amount),
        currency: expenseData.currency,
        category: expenseData.category || 'Food',
        paidBy: expenseData.paidBy || user.uid,
        paidByName: expenseData.paidByName || user.displayName || user.email?.split('@')[0] || 'Member',
        splitType: expenseData.splitType || 'equal',
        participants: expenseData.participants || [],
        shares: expenseData.shares || {},
        date: expenseData.date || new Date().toISOString().slice(0, 10),
        notes: expenseData.notes?.trim() || '',
        isPersonal: Boolean(expenseData.isPersonal),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await setDoc(expRef, payload)

      // Optionally sync to personal transactions if personal expense
      if (expenseData.isPersonal && expenseData.syncToPersonal && addTransaction) {
        addTransaction({
          title: `[Trip] ${payload.description}`,
          amount: payload.amount,
          currency: payload.currency,
          category: 'Travel',
          type: 'expense',
          date: payload.date,
          notes: `From trip expense: ${payload.notes || ''}`.trim(),
        })
      }

      toast.success(payload.isPersonal ? 'Personal expense added!' : 'Trip expense added!')
      return expRef.id
    } catch (error) {
      console.error('Error adding expense:', error)
      toast.error('Failed to add expense.')
      return null
    }
  }

  /**
   * Update an Expense
   */
  const updateExpense = async (tripId, expenseId, expenseData, existingExpense) => {
    if (!user || !tripId || !expenseId) return false

    // Authorization check
    const canEdit =
      existingExpense?.createdBy === user.uid ||
      existingExpense?.paidBy === user.uid

    if (!canEdit) {
      toast.error('You can only edit expenses you created or paid for.')
      return false
    }

    try {
      const expRef = doc(db, 'trips', tripId, 'expenses', expenseId)
      const payload = {
        description: expenseData.description.trim(),
        amount: Number(expenseData.amount),
        currency: expenseData.currency,
        category: expenseData.category || 'Food',
        paidBy: expenseData.paidBy,
        paidByName: expenseData.paidByName,
        splitType: expenseData.splitType || 'equal',
        participants: expenseData.participants || [],
        shares: expenseData.shares || {},
        date: expenseData.date,
        notes: expenseData.notes?.trim() || '',
        isPersonal: Boolean(expenseData.isPersonal),
        updatedAt: serverTimestamp(),
      }

      await updateDoc(expRef, payload)
      toast.success('Expense updated!')
      return true
    } catch (error) {
      console.error('Error updating expense:', error)
      toast.error('Failed to update expense.')
      return false
    }
  }

  /**
   * Delete an Expense
   */
  const deleteExpense = async (tripId, expenseId, existingExpense) => {
    if (!user || !tripId || !expenseId) return false

    const canDelete =
      existingExpense?.createdBy === user.uid ||
      existingExpense?.paidBy === user.uid

    if (!canDelete) {
      toast.error('You can only delete expenses you created or paid for.')
      return false
    }

    try {
      await deleteDoc(doc(db, 'trips', tripId, 'expenses', expenseId))
      toast.success('Expense deleted.')
      return true
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Failed to delete expense.')
      return false
    }
  }

  /**
   * Add Settlement to trips/{tripId}/settlements
   */
  const addSettlement = async (tripId, settlementData) => {
    if (!user || !tripId) return null
    try {
      const settRef = doc(collection(db, 'trips', tripId, 'settlements'))
      const payload = {
        tripId,
        from: settlementData.from,
        fromName: settlementData.fromName,
        to: settlementData.to,
        toName: settlementData.toName,
        amount: Number(settlementData.amount),
        currency: settlementData.currency || 'INR',
        date: settlementData.date || new Date().toISOString().slice(0, 10),
        notes: settlementData.notes?.trim() || '',
        createdBy: user.uid,
        settledAt: serverTimestamp(),
      }

      await setDoc(settRef, payload)
      toast.success('Payment recorded as settled! ✓')
      return settRef.id
    } catch (error) {
      console.error('Error recording settlement:', error)
      toast.error('Failed to record settlement.')
      return null
    }
  }

  /**
   * Delete Settlement
   */
  const deleteSettlement = async (tripId, settlementId) => {
    if (!user || !tripId || !settlementId) return false
    try {
      await deleteDoc(doc(db, 'trips', tripId, 'settlements', settlementId))
      toast.success('Settlement record removed.')
      return true
    } catch (error) {
      console.error('Error deleting settlement:', error)
      toast.error('Failed to delete settlement.')
      return false
    }
  }

  /**
   * Update Trip Details (creator only)
   */
  const updateTrip = async (tripId, tripData) => {
    if (!user || !tripId) return false
    try {
      const tripRef = doc(db, 'trips', tripId)
      await updateDoc(tripRef, {
        name: tripData.name.trim(),
        destination: tripData.destination?.trim() || '',
        description: tripData.description?.trim() || '',
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        currency: tripData.currency,
        updatedAt: serverTimestamp(),
      })
      toast.success('Trip details updated!')
      return true
    } catch (error) {
      console.error('Error updating trip:', error)
      toast.error('Failed to update trip.')
      return false
    }
  }

  /**
   * Delete Trip (creator only)
   */
  const deleteTrip = async (tripId) => {
    if (!user || !tripId) return false
    try {
      // Subcollections cleanup
      const subcollections = ['members', 'expenses', 'settlements']
      for (const sub of subcollections) {
        const subSnap = await getDocs(collection(db, 'trips', tripId, sub))
        if (!subSnap.empty) {
          const batch = writeBatch(db)
          subSnap.forEach((d) => batch.delete(d.ref))
          await batch.commit()
        }
      }

      await deleteDoc(doc(db, 'trips', tripId))
      toast.success('Trip deleted successfully.')
      return true
    } catch (error) {
      console.error('Error deleting trip:', error)
      toast.error('Failed to delete trip.')
      return false
    }
  }

  /**
   * Leave Trip (member only):
   * Removes user.uid from participantIds and deletes trips/{tripId}/members/{user.uid}
   */
  const leaveTrip = async (tripId) => {
    if (!user || !tripId) return false
    try {
      const batch = writeBatch(db)
      batch.update(doc(db, 'trips', tripId), {
        participantIds: arrayRemove(user.uid),
        memberIds: arrayRemove(user.uid),
        updatedAt: serverTimestamp(),
      })
      batch.delete(doc(db, 'trips', tripId, 'members', user.uid))
      await batch.commit()

      toast.success('You have left the trip.')
      return true
    } catch (error) {
      console.error('Error leaving trip:', error)
      toast.error('Failed to leave trip.')
      return false
    }
  }

  const value = {
    trips,
    loadingTrips,
    invitations,
    loadingInvitations,
    createTrip,
    updateTrip,
    deleteTrip,
    leaveTrip,
    searchUserByEmail,
    inviteUserToTrip,
    acceptInvitation,
    declineInvitation,
    useActiveTrip,
    addExpense,
    updateExpense,
    deleteExpense,
    addSettlement,
    deleteSettlement,
  }

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

export const useTripContext = () => {
  const context = useContext(TripContext)
  if (!context) {
    throw new Error('useTripContext must be used within a TripProvider')
  }
  return context
}
