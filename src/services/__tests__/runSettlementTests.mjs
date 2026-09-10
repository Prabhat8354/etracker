import {
  calculateEqualShares,
  validateCustomShares,
  calculateParticipantBalances,
  calculateSimplifiedDebts,
  calculateUserSettlementSummary,
  calculateTripTotals,
  round2,
} from '../tripSettlementEngine.js'

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`)
    process.exit(1)
  }
  console.log(`✅ PASSED: ${message}`)
}

console.log('--- RUNNING TRIP SETTLEMENT ENGINE TESTS ---\n')

const members = [
  { id: 'u_prabhat', name: 'Prabhat', isCurrentUser: true },
  { id: 'u_shubham', name: 'Shubham', isCurrentUser: false },
  { id: 'u_hritik', name: 'Hritik', isCurrentUser: false },
]

// TEST CASE 1: 3 members, only 2 share expense -> 3rd member balance is exactly ₹0
{
  console.log('Test Case 1: 3 members, only 2 share expense -> 3rd member balance is exactly ₹0')
  const expenses = [
    {
      id: 'e1',
      amount: 10000,
      paidBy: 'u_prabhat',
      participants: ['u_prabhat', 'u_shubham'],
      shares: { u_prabhat: 5000, u_shubham: 5000 },
      splitType: 'equal',
    },
  ]
  const balances = calculateParticipantBalances(members, expenses, [])
  const hritik = balances.find((b) => b.id === 'u_hritik')
  const prabhat = balances.find((b) => b.id === 'u_prabhat')
  const shubham = balances.find((b) => b.id === 'u_shubham')

  assert(hritik.totalPaid === 0, 'Hritik totalPaid is 0')
  assert(hritik.totalShare === 0, 'Hritik totalShare is 0')
  assert(hritik.netBalance === 0, 'Hritik netBalance is exactly 0')
  assert(prabhat.netBalance === 5000, 'Prabhat netBalance is +5000')
  assert(shubham.netBalance === -5000, 'Shubham netBalance is -5000')

  const debts = calculateSimplifiedDebts(balances)
  assert(debts.length === 1, 'Only 1 debt transaction generated')
  assert(debts[0].from === 'u_shubham' && debts[0].to === 'u_prabhat' && debts[0].amount === 5000, 'Shubham owes Prabhat 5000')

  const hritikSummary = calculateUserSettlementSummary(debts, 'u_hritik')
  assert(hritikSummary.isSettled === true, 'Hritik isSettled is true')
  assert(hritikSummary.debtsToPay.length === 0, 'Hritik has 0 debts to pay')
  assert(hritikSummary.debtsToReceive.length === 0, 'Hritik has 0 debts to receive')
  console.log('')
}

// TEST CASE 2: 3 members, all 3 share equally
{
  console.log('Test Case 2: 3 members, all 3 share equally')
  const expenses = [
    {
      id: 'e1',
      amount: 3000,
      paidBy: 'u_prabhat',
      participants: ['u_prabhat', 'u_shubham', 'u_hritik'],
      shares: { u_prabhat: 1000, u_shubham: 1000, u_hritik: 1000 },
      splitType: 'equal',
    },
  ]
  const balances = calculateParticipantBalances(members, expenses, [])
  const prabhat = balances.find((b) => b.id === 'u_prabhat')
  const shubham = balances.find((b) => b.id === 'u_shubham')
  const hritik = balances.find((b) => b.id === 'u_hritik')

  assert(prabhat.netBalance === 2000, 'Prabhat netBalance is +2000')
  assert(shubham.netBalance === -1000, 'Shubham netBalance is -1000')
  assert(hritik.netBalance === -1000, 'Hritik netBalance is -1000')

  const debts = calculateSimplifiedDebts(balances)
  assert(debts.length === 2, '2 debt transactions generated')
  assert(debts.some((d) => d.from === 'u_shubham' && d.to === 'u_prabhat' && d.amount === 1000), 'Shubham pays Prabhat 1000')
  assert(debts.some((d) => d.from === 'u_hritik' && d.to === 'u_prabhat' && d.amount === 1000), 'Hritik pays Prabhat 1000')
  console.log('')
}

// TEST CASE 3: Custom split between only 2 members -> 3rd member remains ₹0
{
  console.log('Test Case 3: Custom split between only 2 members -> 3rd member remains ₹0')
  const expenses = [
    {
      id: 'e1',
      amount: 1500,
      paidBy: 'u_prabhat',
      participants: ['u_prabhat', 'u_shubham'],
      shares: { u_prabhat: 600, u_shubham: 900 },
      splitType: 'custom',
    },
  ]
  const balances = calculateParticipantBalances(members, expenses, [])
  const hritik = balances.find((b) => b.id === 'u_hritik')
  const prabhat = balances.find((b) => b.id === 'u_prabhat')
  const shubham = balances.find((b) => b.id === 'u_shubham')

  assert(hritik.totalPaid === 0 && hritik.totalShare === 0 && hritik.netBalance === 0, 'Hritik remains completely 0')
  assert(prabhat.netBalance === 900, 'Prabhat netBalance is +900 (1500 - 600)')
  assert(shubham.netBalance === -900, 'Shubham netBalance is -900 (0 - 900)')

  const debts = calculateSimplifiedDebts(balances)
  assert(debts.length === 1 && debts[0].from === 'u_shubham' && debts[0].to === 'u_prabhat' && debts[0].amount === 900, 'Shubham owes Prabhat 900')
  console.log('')
}

// TEST CASE 4: Participant pays but does not share -> positive balance reflects full paid amount
{
  console.log('Test Case 4: Participant pays but does not share -> positive balance reflects full paid amount')
  const expenses = [
    {
      id: 'e1',
      amount: 1000,
      paidBy: 'u_prabhat',
      participants: ['u_shubham', 'u_hritik'],
      shares: { u_shubham: 500, u_hritik: 500 },
      splitType: 'equal',
    },
  ]
  const balances = calculateParticipantBalances(members, expenses, [])
  const prabhat = balances.find((b) => b.id === 'u_prabhat')
  const shubham = balances.find((b) => b.id === 'u_shubham')
  const hritik = balances.find((b) => b.id === 'u_hritik')

  assert(prabhat.totalPaid === 1000, 'Prabhat totalPaid is 1000')
  assert(prabhat.totalShare === 0, 'Prabhat totalShare is 0')
  assert(prabhat.netBalance === 1000, 'Prabhat netBalance reflects full paid 1000')
  assert(shubham.netBalance === -500, 'Shubham netBalance is -500')
  assert(hritik.netBalance === -500, 'Hritik netBalance is -500')
  console.log('')
}

// TEST CASE 5: Participant shares but did not pay -> negative balance reflects share
{
  console.log('Test Case 5: Participant shares but did not pay -> negative balance reflects share')
  const expenses = [
    {
      id: 'e1',
      amount: 2000,
      paidBy: 'u_prabhat',
      participants: ['u_prabhat', 'u_shubham'],
      shares: { u_prabhat: 1000, u_shubham: 1000 },
      splitType: 'equal',
    },
  ]
  const balances = calculateParticipantBalances(members, expenses, [])
  const shubham = balances.find((b) => b.id === 'u_shubham')

  assert(shubham.totalPaid === 0, 'Shubham paid 0')
  assert(shubham.totalShare === 1000, 'Shubham share is 1000')
  assert(shubham.netBalance === -1000, 'Shubham netBalance is -1000')
  console.log('')
}

// TEST CASE 6: Multiple expenses with varying participant combinations
{
  console.log('Test Case 6: Multiple expenses with varying participant combinations')
  const expenses = [
    {
      id: 'e1',
      amount: 1200,
      paidBy: 'u_prabhat',
      participants: ['u_prabhat', 'u_shubham'],
      shares: { u_prabhat: 600, u_shubham: 600 },
    },
    {
      id: 'e2',
      amount: 600,
      paidBy: 'u_shubham',
      participants: ['u_shubham', 'u_hritik'],
      shares: { u_shubham: 300, u_hritik: 300 },
    },
    {
      id: 'e3',
      amount: 900,
      paidBy: 'u_hritik',
      participants: ['u_prabhat', 'u_hritik'],
      shares: { u_prabhat: 450, u_hritik: 450 },
    },
  ]
  const balances = calculateParticipantBalances(members, expenses, [])
  const prabhat = balances.find((b) => b.id === 'u_prabhat')
  const shubham = balances.find((b) => b.id === 'u_shubham')
  const hritik = balances.find((b) => b.id === 'u_hritik')

  assert(prabhat.netBalance === 150, `Prabhat net is +150 (got ${prabhat.netBalance})`)
  assert(shubham.netBalance === -300, `Shubham net is -300 (got ${shubham.netBalance})`)
  assert(hritik.netBalance === 150, `Hritik net is +150 (got ${hritik.netBalance})`)

  const sumNet = balances.reduce((sum, b) => sum + b.netBalance, 0)
  assert(Math.abs(sumNet) < 0.001, 'Sum of all net balances is exactly 0')

  const debts = calculateSimplifiedDebts(balances)
  assert(debts.length === 2, '2 simplified debts generated')
  assert(debts.some((d) => d.from === 'u_shubham' && d.to === 'u_prabhat' && d.amount === 150), 'Shubham pays Prabhat 150')
  assert(debts.some((d) => d.from === 'u_shubham' && d.to === 'u_hritik' && d.amount === 150), 'Shubham pays Hritik 150')
  console.log('')
}

// TEST CASE 7: Participant has no involvement in any expense -> ₹0 balance, absent from settlement recommendations
{
  console.log('Test Case 7: Participant has no involvement in any expense -> ₹0 balance, absent from settlement recommendations')
  const expenses = [
    {
      id: 'e1',
      amount: 5000,
      paidBy: 'u_prabhat',
      participants: ['u_prabhat', 'u_shubham'],
      shares: { u_prabhat: 2500, u_shubham: 2500 },
    },
    {
      id: 'e2',
      amount: 3000,
      paidBy: 'u_shubham',
      participants: ['u_prabhat', 'u_shubham'],
      shares: { u_prabhat: 1500, u_shubham: 1500 },
    },
  ]
  const balances = calculateParticipantBalances(members, expenses, [])
  const hritik = balances.find((b) => b.id === 'u_hritik')

  assert(hritik.totalPaid === 0, 'Hritik totalPaid is 0')
  assert(hritik.totalShare === 0, 'Hritik totalShare is 0')
  assert(hritik.netBalance === 0, 'Hritik netBalance is 0')

  const debts = calculateSimplifiedDebts(balances)
  assert(!debts.some((d) => d.from === 'u_hritik' || d.to === 'u_hritik'), 'Hritik absent from all simplified debts')

  const hritikSummary = calculateUserSettlementSummary(debts, 'u_hritik')
  assert(hritikSummary.isSettled === true, 'Hritik isSettled is true')
  assert(hritikSummary.totalOwed === 0, 'Hritik totalOwed is 0')
  assert(hritikSummary.debtsToPay.length === 0, 'Hritik debtsToPay is empty')
  console.log('')
}

// TEST CASE 8: All expenses settled -> everyone's balance is ₹0
{
  console.log('Test Case 8: All expenses settled -> everyone\'s balance is ₹0')
  const expenses = [
    {
      id: 'e1',
      amount: 10000,
      paidBy: 'u_prabhat',
      participants: ['u_prabhat', 'u_shubham'],
      shares: { u_prabhat: 5000, u_shubham: 5000 },
    },
  ]
  const settlements = [
    {
      id: 's1',
      from: 'u_shubham',
      to: 'u_prabhat',
      amount: 5000,
    },
  ]
  const balances = calculateParticipantBalances(members, expenses, settlements)
  balances.forEach((b) => {
    assert(b.netBalance === 0, `${b.name} netBalance is 0 after full settlement`)
  })

  const debts = calculateSimplifiedDebts(balances)
  assert(debts.length === 0, 'Simplified debts is empty after full settlement')

  members.forEach((m) => {
    const summary = calculateUserSettlementSummary(debts, m.id)
    assert(summary.isSettled === true, `${m.name} summary isSettled is true`)
  })
  console.log('')
}

// TEST CASE 9: Erroneous settlement recorded to a zero-expense participant
{
  console.log('Test Case 9: Erroneous settlement recorded to a zero-expense participant')
  const expenses = [
    {
      id: 'e1',
      amount: 20000,
      paidBy: 'u_prabhat',
      participants: ['u_prabhat', 'u_shubham'],
      shares: { u_prabhat: 10000, u_shubham: 10000 },
    },
  ]
  // Rogue settlement where receiver was erroneously selected as Hritik for ₹10,000
  const rogueSettlements = [
    {
      id: 's_rogue',
      from: 'u_prabhat',
      to: 'u_hritik',
      amount: 10000,
    },
  ]
  const balances = calculateParticipantBalances(members, expenses, rogueSettlements)
  const hritik = balances.find((b) => b.id === 'u_hritik')

  assert(hritik.totalPaid === 0, 'Hritik totalPaid is 0')
  assert(hritik.totalShare === 0, 'Hritik totalShare is 0')
  assert(hritik.netBalance === 0, 'Hritik netBalance is protected at ₹0.00 despite rogue settlement')

  const debts = calculateSimplifiedDebts(balances)
  assert(!debts.some((d) => d.from === 'u_hritik' || d.to === 'u_hritik'), 'Hritik is never made a debtor or creditor')

  const hritikSummary = calculateUserSettlementSummary(debts, 'u_hritik')
  assert(hritikSummary.isSettled === true, 'Hritik isSettled is true')
  assert(hritikSummary.debtsToPay.length === 0, 'Hritik has no debts to pay')
  console.log('')
}

// TEST CASE 11: CURRENT TRIP EXACT SCREENSHOT SCENARIO (Hotel 12k, Flight 14k, Food 16k with array shares schema)
{
  console.log('Test Case 11: CURRENT TRIP EXACT SCREENSHOT SCENARIO')
  const tripExpenses = [
    {
      id: 'e1_hotel',
      description: 'Hotel',
      amount: 12000,
      paidBy: 'u_shubham',
      splitType: 'equal',
      shares: [
        { userId: 'u_prabhat', amount: 6000 },
        { userId: 'u_shubham', amount: 6000 },
      ],
    },
    {
      id: 'e2_flight',
      description: 'Ticket flight',
      amount: 14000,
      paidBy: 'u_prabhat',
      splitType: 'equal',
      shares: [
        { userId: 'u_prabhat', amount: 7000 },
        { userId: 'u_shubham', amount: 7000 },
      ],
    },
    {
      id: 'e3_food',
      description: 'Food',
      amount: 16000,
      paidBy: 'u_shubham',
      splitType: 'custom',
      shares: [
        { userId: 'u_prabhat', amount: 10000 },
        { userId: 'u_shubham', amount: 6000 },
      ],
    },
  ]

  const balances = calculateParticipantBalances(members, tripExpenses, [])
  const prabhat = balances.find((b) => b.id === 'u_prabhat')
  const shubham = balances.find((b) => b.id === 'u_shubham')
  const hritik = balances.find((b) => b.id === 'u_hritik')

  // Prabhat: Paid = 14,000, Share = 23,000, Net = -9,000
  assert(prabhat.totalPaid === 14000, `Prabhat totalPaid is 14,000 (got ${prabhat.totalPaid})`)
  assert(prabhat.totalShare === 23000, `Prabhat totalShare is 23,000 (got ${prabhat.totalShare})`)
  assert(prabhat.netBalance === -9000, `Prabhat netBalance is -9,000 (got ${prabhat.netBalance})`)

  // Shubham: Paid = 28,000, Share = 19,000, Net = +9,000
  assert(shubham.totalPaid === 28000, `Shubham totalPaid is 28,000 (got ${shubham.totalPaid})`)
  assert(shubham.totalShare === 19000, `Shubham totalShare is 19,000 (got ${shubham.totalShare})`)
  assert(shubham.netBalance === 9000, `Shubham netBalance is +9,000 (got ${shubham.netBalance})`)

  // Hritik: Paid = 0, Share = 0, Net = 0
  assert(hritik.totalPaid === 0, `Hritik totalPaid is 0 (got ${hritik.totalPaid})`)
  assert(hritik.totalShare === 0, `Hritik totalShare is 0 (got ${hritik.totalShare})`)
  assert(hritik.netBalance === 0, `Hritik netBalance is 0 (got ${hritik.netBalance})`)

  // Simplified debts: Only 1 transaction: Prabhat owes Shubham ₹9,000
  const debts = calculateSimplifiedDebts(balances)
  assert(debts.length === 1, `Exactly 1 settlement transfer generated (got ${debts.length})`)
  assert(debts[0].from === 'u_prabhat' && debts[0].to === 'u_shubham' && debts[0].amount === 9000, 'Prabhat pays Shubham ₹9,000')

  // Verify Hritik is NOT asked to pay anyone
  const hritikSummary = calculateUserSettlementSummary(debts, 'u_hritik')
  assert(hritikSummary.isSettled === true, 'Hritik isSettled is true')
  assert(hritikSummary.totalOwed === 0, 'Hritik totalOwed is 0')
  assert(hritikSummary.totalToReceive === 0, 'Hritik totalToReceive is 0')
  assert(hritikSummary.debtsToPay.length === 0, 'Hritik debtsToPay is empty')
  assert(hritikSummary.debtsToReceive.length === 0, 'Hritik debtsToReceive is empty')
  console.log('')
}

// TEST CASE 12: 10 members in trip, expense shared by only 2 members
{
  console.log('Test Case 12: 10 members in trip, expense shared by only 2 members')
  const tenMembers = Array.from({ length: 10 }, (_, i) => ({
    id: `u_${i + 1}`,
    name: `Member ${i + 1}`,
    isCurrentUser: i === 0,
  }))

  const singleExpense = [
    {
      id: 'exp_10',
      amount: 10000,
      paidBy: 'u_1',
      participants: ['u_1', 'u_2'],
      shares: { u_1: 5000, u_2: 5000 },
      splitType: 'equal',
    },
  ]

  const balances = calculateParticipantBalances(tenMembers, singleExpense, [])
  assert(balances[0].netBalance === 5000, 'Member 1 net is +5000')
  assert(balances[1].netBalance === -5000, 'Member 2 net is -5000')

  for (let i = 2; i < 10; i++) {
    assert(balances[i].totalPaid === 0, `Member ${i + 1} totalPaid is 0`)
    assert(balances[i].totalShare === 0, `Member ${i + 1} totalShare is 0`)
    assert(balances[i].netBalance === 0, `Member ${i + 1} netBalance is 0`)
  }

  const debts = calculateSimplifiedDebts(balances)
  assert(debts.length === 1, 'Only 1 debt exists between Member 1 and Member 2')
  assert(debts[0].from === 'u_2' && debts[0].to === 'u_1' && debts[0].amount === 5000, 'Member 2 owes Member 1 5000')
  console.log('')
}

// TEST CASE 13: Add a new member after existing expenses -> existing expenses do NOT include new member
{
  console.log('Test Case 13: Add a new member after existing expenses')
  const initialExpenses = [
    {
      id: 'exp_init',
      amount: 4000,
      paidBy: 'u_prabhat',
      participants: ['u_prabhat', 'u_shubham'],
      splitType: 'equal',
    },
  ]

  // A 4th member joins the trip later
  const fourMembers = [...members, { id: 'u_new', name: 'New Member', isCurrentUser: false }]
  const balances = calculateParticipantBalances(fourMembers, initialExpenses, [])

  const newMember = balances.find((b) => b.id === 'u_new')
  assert(newMember.totalPaid === 0, 'New member totalPaid is 0')
  assert(newMember.totalShare === 0, 'New member totalShare is 0')
  assert(newMember.netBalance === 0, 'New member netBalance is 0')

  const prabhat = balances.find((b) => b.id === 'u_prabhat')
  const shubham = balances.find((b) => b.id === 'u_shubham')
  assert(prabhat.totalShare === 2000, 'Prabhat share is still 2000 (divided by 2, not 4)')
  assert(shubham.totalShare === 2000, 'Shubham share is still 2000 (divided by 2, not 4)')
  console.log('')
}

// TEST CASE 14: Edit an expense's participants and verify balances update correctly
{
  console.log('Test Case 14: Edit an expense\'s participants')
  // Before edit: Expense shared by Prabhat and Shubham (5000 each)
  const expBefore = {
    id: 'exp_edit',
    amount: 10000,
    paidBy: 'u_prabhat',
    participants: ['u_prabhat', 'u_shubham'],
    splitType: 'equal',
  }
  const balBefore = calculateParticipantBalances(members, [expBefore], [])
  assert(balBefore.find((b) => b.id === 'u_hritik').netBalance === 0, 'Hritik is 0 before edit')

  // After edit: Expense is updated to include Hritik equally (3333.34 / 3333.33 / 3333.33)
  const expAfter = {
    id: 'exp_edit',
    amount: 10000,
    paidBy: 'u_prabhat',
    participants: ['u_prabhat', 'u_shubham', 'u_hritik'],
    splitType: 'equal',
  }
  const balAfter = calculateParticipantBalances(members, [expAfter], [])
  const hritikAfter = balAfter.find((b) => b.id === 'u_hritik')
  assert(hritikAfter.totalShare === 3333.33, `Hritik totalShare updated to 3333.33 after being added (got ${hritikAfter.totalShare})`)
  assert(hritikAfter.netBalance === -3333.33, `Hritik netBalance updated to -3333.33 after being added (got ${hritikAfter.netBalance})`)
  console.log('')
}

console.log('🎉 ALL 14 SETTLEMENT ENGINE TESTS PASSED SUCCESSFULLY!')
