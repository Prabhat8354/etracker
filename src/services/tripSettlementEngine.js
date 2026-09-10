/**
 * Trip Settlement Engine
 * Pure calculations for splits, net balances, debt simplification, and settle-up.
 */

export const round2 = (num) => {
  const val = Math.round((Number(num || 0) + Number.EPSILON) * 100) / 100
  if (Math.abs(val) < 0.00001 || Object.is(val, -0)) return 0
  return val
}

/**
 * Calculates equal shares across participants, distributing rounding cents cleanly.
 * @param {number} amount Total amount
 * @param {string[]} participantIds Array of participant IDs
 * @returns {Record<string, number>} Map of participantId -> share amount
 */
export const calculateEqualShares = (amount, participantIds) => {
  if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0 || !amount) return {}

  const num = Number(amount)
  if (num <= 0) return {}

  const count = participantIds.length
  const baseShare = Math.floor((num / count) * 100) / 100
  const remainder = round2(num - baseShare * count)
  const remainderCents = Math.round(remainder * 100)

  const shares = {}
  participantIds.forEach((id, index) => {
    // Distribute remainder cents to first few participants so sum is exact
    const extra = index < remainderCents ? 0.01 : 0
    shares[id] = round2(baseShare + extra)
  })

  return shares
}

/**
 * Validates custom shares against the total expense amount.
 * @param {number} totalAmount Total expense amount
 * @param {Record<string, number|string>} shares Map of participantId -> share
 * @param {string[]} participantIds Array of selected participant IDs
 * @returns {{ isValid: boolean, sum: number, remaining: number }}
 */
export const validateCustomShares = (totalAmount, shares = {}, participantIds = []) => {
  const total = Number(totalAmount) || 0
  let sum = 0

  participantIds.forEach((id) => {
    const val = parseFloat(shares[id]) || 0
    sum += val
  })

  sum = round2(sum)
  const remaining = round2(total - sum)
  const isValid = Math.abs(remaining) < 0.01 && total > 0

  return {
    isValid,
    sum,
    remaining,
  }
}

/**
 * Normalizes an expense's shares and participant IDs across all Firestore schema variations.
 * Supports:
 * - Array of objects: shares: [{ userId, amount }] (or uid, id, participantId, share, value)
 * - Map/Object: shares: { [userId]: amount }
 * - Array or Map customSplits
 * - Array of participants: string[] or object[]
 * - Equal split fallback across ONLY selected participants (never all trip members).
 * @param {Object} exp Expense object
 * @returns {{ participantIds: string[], sharesMap: Record<string, number> }}
 */
export const getExpenseSharesAndParticipants = (exp) => {
  if (!exp) return { participantIds: [], sharesMap: {} }

  const amount = Number(exp.amount) || 0
  const sharesMap = {}
  const participantIdsSet = new Set()

  const parseEntry = (item) => {
    if (!item) return
    if (typeof item === 'string') {
      participantIdsSet.add(item)
      return
    }
    if (typeof item === 'object') {
      const uid = item.userId || item.uid || item.id || item.participantId
      const val = Number(item.amount ?? item.share ?? item.value)
      if (uid) {
        participantIdsSet.add(uid)
        if (!isNaN(val) && val > 0) {
          sharesMap[uid] = round2(val)
        }
      }
    }
  }

  // 1. Process exp.shares (array or map)
  if (Array.isArray(exp.shares)) {
    exp.shares.forEach(parseEntry)
  } else if (exp.shares && typeof exp.shares === 'object') {
    Object.entries(exp.shares).forEach(([uid, val]) => {
      const numVal = Number(val)
      if (uid) {
        participantIdsSet.add(uid)
        if (!isNaN(numVal) && numVal > 0) {
          sharesMap[uid] = round2(numVal)
        }
      }
    })
  }

  // 2. Process exp.customSplits if sharesMap is empty
  if (Object.keys(sharesMap).length === 0) {
    if (Array.isArray(exp.customSplits)) {
      exp.customSplits.forEach(parseEntry)
    } else if (exp.customSplits && typeof exp.customSplits === 'object') {
      Object.entries(exp.customSplits).forEach(([uid, val]) => {
        const numVal = Number(val)
        if (uid) {
          participantIdsSet.add(uid)
          if (!isNaN(numVal) && numVal > 0) {
            sharesMap[uid] = round2(numVal)
          }
        }
      })
    }
  }

  // 3. Process exp.participants (strings or objects)
  if (Array.isArray(exp.participants)) {
    exp.participants.forEach(parseEntry)
  }

  const participantIds = Array.from(participantIdsSet)

  // 4. Equal split dynamic calculation if sharesMap is empty and participants are known
  if (Object.keys(sharesMap).length === 0 && participantIds.length > 0 && amount > 0) {
    const computed = calculateEqualShares(amount, participantIds)
    Object.assign(sharesMap, computed)
  }

  return {
    participantIds,
    sharesMap,
  }
}

/**
 * Calculates financial balances for all participants in a trip.
 * @param {Array<{ id: string, name: string, isCurrentUser?: boolean }>} participants
 * @param {Array<{ amount: number, paidBy: string, participants: string[], shares: Record<string, number>, isPersonal?: boolean, splitType?: string }>} expenses
 * @param {Array<{ from: string, to: string, amount: number }>} settlements
 */
export const calculateParticipantBalances = (participants = [], expenses = [], settlements = []) => {
  const balanceMap = {}

  // Initialize balance records
  participants.forEach((p) => {
    balanceMap[p.id] = {
      id: p.id,
      name: p.name,
      isCurrentUser: Boolean(p.isCurrentUser),
      totalPaid: 0,
      totalShare: 0,
      settlementsPaid: 0,
      settlementsReceived: 0,
      rawNetBalance: 0,
      netBalance: 0,
    }
  })

  // Calculate shared expenses paid & shares
  expenses.forEach((exp) => {
    // Ignore personal expenses in shared settlement calculations
    if (exp.isPersonal) return

    const amount = Number(exp.amount) || 0
    if (amount <= 0) return

    const payerId = exp.paidBy

    // Accumulate total paid
    if (payerId && balanceMap[payerId]) {
      balanceMap[payerId].totalPaid = round2(balanceMap[payerId].totalPaid + amount)
    }

    // Determine participants and shares strictly from the expense
    const { participantIds, sharesMap } = getExpenseSharesAndParticipants(exp)

    // Accumulate shares ONLY for participants included in this expense
    participantIds.forEach((pId) => {
      if (balanceMap[pId]) {
        const shareAmount = Number(sharesMap[pId]) || 0
        if (shareAmount > 0) {
          balanceMap[pId].totalShare = round2(balanceMap[pId].totalShare + shareAmount)
        }
      }
    })
  })

  // Calculate settlements
  settlements.forEach((st) => {
    const amount = Number(st.amount) || 0
    if (amount <= 0) return

    if (st.from && balanceMap[st.from]) {
      balanceMap[st.from].settlementsPaid = round2(balanceMap[st.from].settlementsPaid + amount)
    }
    if (st.to && balanceMap[st.to]) {
      balanceMap[st.to].settlementsReceived = round2(balanceMap[st.to].settlementsReceived + amount)
    }
  })

  // Compute final net balances
  return Object.values(balanceMap).map((record) => {
    let rawNetBalance = round2(record.totalPaid - record.totalShare)

    // Expected behavior: If a participant has paid ₹0 and shared/owed ₹0 across all shared expenses,
    // their net balance MUST be exactly ₹0.00. They must not owe anyone anything and must not be
    // transformed into an artificial debtor by rogue or mistaken settlements.
    let netBalance = 0
    if (record.totalPaid === 0 && record.totalShare === 0) {
      netBalance = 0
    } else {
      netBalance = round2(
        (record.totalPaid + record.settlementsPaid) -
        (record.totalShare + record.settlementsReceived)
      )
    }

    // Floating point threshold normalization: clamp values within 1 cent to 0.00
    if (Math.abs(netBalance) < 0.01) {
      netBalance = 0
    }
    if (Math.abs(rawNetBalance) < 0.01) {
      rawNetBalance = 0
    }

    return {
      ...record,
      rawNetBalance: Object.is(rawNetBalance, -0) ? 0 : rawNetBalance,
      netBalance: Object.is(netBalance, -0) ? 0 : netBalance,
    }
  })
}

/**
 * Minimizes the number of transactions to settle all debts (Greedy Simplification Algorithm).
 * @param {Array<{ id: string, name: string, netBalance: number }>} balances
 * @returns {Array<{ from: string, fromName: string, to: string, toName: string, amount: number }>}
 */
export const calculateSimplifiedDebts = (balances = []) => {
  // Separate into debtors (netBalance < -0.01) and creditors (netBalance > 0.01)
  // Strictly exclude anyone with zero net balance or zero involvement
  const debtors = []
  const creditors = []

  balances.forEach((b) => {
    // Exclude zero-involvement participants explicitly
    if (b.totalPaid === 0 && b.totalShare === 0) return

    const net = round2(b.netBalance)
    if (net < -0.01) {
      debtors.push({ id: b.id, name: b.name, owed: Math.abs(net) })
    } else if (net > 0.01) {
      creditors.push({ id: b.id, name: b.name, toReceive: net })
    }
  })

  // Sort descending by value to minimize transfer count
  debtors.sort((a, b) => b.owed - a.owed)
  creditors.sort((a, b) => b.toReceive - a.toReceive)

  const transactions = []

  let dIdx = 0
  let cIdx = 0

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx]
    const creditor = creditors[cIdx]

    const transfer = round2(Math.min(debtor.owed, creditor.toReceive))

    if (transfer > 0.009) {
      transactions.push({
        from: debtor.id,
        fromName: debtor.name,
        to: creditor.id,
        toName: creditor.name,
        amount: transfer,
      })

      debtor.owed = round2(debtor.owed - transfer)
      creditor.toReceive = round2(creditor.toReceive - transfer)
    }

    if (debtor.owed < 0.01) {
      dIdx++
    }
    if (creditor.toReceive < 0.01) {
      cIdx++
    }
  }

  return transactions
}

/**
 * Generates user-specific settle up recommendations.
 * @param {Array<{ from: string, fromName: string, to: string, toName: string, amount: number }>} simplifiedDebts
 * @param {string} currentUserId
 */
export const calculateUserSettlementSummary = (simplifiedDebts = [], currentUserId) => {
  if (!currentUserId) {
    return {
      debtsToPay: [],
      debtsToReceive: [],
      totalOwed: 0,
      totalToReceive: 0,
      netUserBalance: 0,
      isSettled: true,
    }
  }

  const debtsToPay = simplifiedDebts.filter((d) => d.from === currentUserId)
  const debtsToReceive = simplifiedDebts.filter((d) => d.to === currentUserId)

  const totalOwed = round2(debtsToPay.reduce((sum, d) => sum + d.amount, 0))
  const totalToReceive = round2(debtsToReceive.reduce((sum, d) => sum + d.amount, 0))
  let netUserBalance = round2(totalToReceive - totalOwed)
  if (Math.abs(netUserBalance) < 0.01) {
    netUserBalance = 0
  }
  const isSettled = totalOwed < 0.01 && totalToReceive < 0.01

  return {
    debtsToPay,
    debtsToReceive,
    totalOwed: Object.is(totalOwed, -0) ? 0 : totalOwed,
    totalToReceive: Object.is(totalToReceive, -0) ? 0 : totalToReceive,
    netUserBalance: Object.is(netUserBalance, -0) ? 0 : netUserBalance,
    isSettled,
  }
}

/**
 * Calculates overall trip spend metrics.
 * @param {Array<{ amount: number, isPersonal?: boolean, paidBy?: string }>} expenses
 * @param {string} currentUserId
 */
export const calculateTripTotals = (expenses = [], currentUserId) => {
  let totalShared = 0
  let totalPersonal = 0
  let currentUserPersonal = 0

  expenses.forEach((exp) => {
    const amount = Number(exp.amount) || 0
    if (exp.isPersonal) {
      totalPersonal = round2(totalPersonal + amount)
      if (exp.paidBy === currentUserId) {
        currentUserPersonal = round2(currentUserPersonal + amount)
      }
    } else {
      totalShared = round2(totalShared + amount)
    }
  })

  return {
    totalShared,
    totalPersonal,
    totalAll: round2(totalShared + totalPersonal),
    currentUserPersonal,
  }
}
