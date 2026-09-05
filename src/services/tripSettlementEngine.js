/**
 * Trip Settlement Engine
 * Pure calculations for splits, net balances, debt simplification, and settle-up.
 */

export const round2 = (num) => {
  return Math.round((Number(num || 0) + Number.EPSILON) * 100) / 100
}

/**
 * Calculates equal shares across participants, distributing rounding cents cleanly.
 * @param {number} amount Total amount
 * @param {string[]} participantIds Array of participant IDs
 * @returns {Record<string, number>} Map of participantId -> share amount
 */
export const calculateEqualShares = (amount, participantIds) => {
  if (!participantIds || participantIds.length === 0 || !amount) return {}

  const num = Number(amount)
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
 * Calculates financial balances for all participants in a trip.
 * @param {Array<{ id: string, name: string, isCurrentUser?: boolean }>} participants
 * @param {Array<{ amount: number, paidBy: string, participants: string[], shares: Record<string, number>, isPersonal?: boolean }>} expenses
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
    const payerId = exp.paidBy

    // Accumulate total paid
    if (balanceMap[payerId]) {
      balanceMap[payerId].totalPaid = round2(balanceMap[payerId].totalPaid + amount)
    }

    // Accumulate shares
    const sharingIds = exp.participants || []
    const shares = exp.shares || {}

    sharingIds.forEach((pId) => {
      if (balanceMap[pId]) {
        const shareAmount = Number(shares[pId]) || 0
        balanceMap[pId].totalShare = round2(balanceMap[pId].totalShare + shareAmount)
      }
    })
  })

  // Calculate settlements
  settlements.forEach((st) => {
    const amount = Number(st.amount) || 0
    if (balanceMap[st.from]) {
      balanceMap[st.from].settlementsPaid = round2(balanceMap[st.from].settlementsPaid + amount)
    }
    if (balanceMap[st.to]) {
      balanceMap[st.to].settlementsReceived = round2(balanceMap[st.to].settlementsReceived + amount)
    }
  })

  // Compute final net balances
  return Object.values(balanceMap).map((record) => {
    const rawNetBalance = round2(record.totalPaid - record.totalShare)
    // When from pays to:
    // from's net balance increases (they paid their debt)
    // to's net balance decreases (they collected their credit)
    const netBalance = round2((record.totalPaid + record.settlementsPaid) - (record.totalShare + record.settlementsReceived))

    return {
      ...record,
      rawNetBalance,
      netBalance,
    }
  })
}

/**
 * Minimizes the number of transactions to settle all debts (Greedy Simplification Algorithm).
 * @param {Array<{ id: string, name: string, netBalance: number }>} balances
 * @returns {Array<{ from: string, fromName: string, to: string, toName: string, amount: number }>}
 */
export const calculateSimplifiedDebts = (balances = []) => {
  // Separate into debtors (netBalance < 0) and creditors (netBalance > 0)
  const debtors = []
  const creditors = []

  balances.forEach((b) => {
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

    if (transfer > 0) {
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
  const netUserBalance = round2(totalToReceive - totalOwed)
  const isSettled = totalOwed < 0.01 && totalToReceive < 0.01

  return {
    debtsToPay,
    debtsToReceive,
    totalOwed,
    totalToReceive,
    netUserBalance,
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
