// data.js — the household's real numbers. One job: hold the default budget,
// the example family's plan, the seeded November expenses and the savings goals.
// main.js reads this file and never hard-codes a figure of its own.
export const HOUSEHOLD = {
  name: "The Alvarez Family",
  members: 4,
  adults: 2,
  children: 2,
  monthlyIncome: 5200,
  month: "November 2026",
  currency: "USD",
};

// The 50/30/20 plan for $5,200 a month. Needs $2,600, wants $1,560, savings $1,040.
export const PLAN_CATEGORIES = [
  { id: "housing", label: "Housing & Rent", group: "needs", amount: 1400, note: "Rent, 3-bed home" },
  { id: "groceries", label: "Groceries", group: "needs", amount: 550, note: "Weekly shop for four" },
  { id: "transport", label: "Transport", group: "needs", amount: 350, note: "Fuel, bus fares, car upkeep" },
  { id: "utilities", label: "Utilities", group: "needs", amount: 200, note: "Power, water, internet, phone" },
  { id: "insurance", label: "Insurance", group: "needs", amount: 100, note: "Health top-up + home cover" },
  { id: "dining", label: "Dining Out", group: "wants", amount: 300, note: "Two family meals out a month" },
  { id: "entertainment", label: "Entertainment", group: "wants", amount: 250, note: "Streaming, games, outings" },
  { id: "subscriptions", label: "Subscriptions", group: "wants", amount: 120, note: "Music, apps, magazines" },
  { id: "personal", label: "Personal & Clothing", group: "wants", amount: 290, note: "Clothes, haircuts, gifts" },
  { id: "travel", label: "Travel Fund", group: "wants", amount: 300, note: "Weekend trips, holidays" },
  { id: "clothing2", label: "Kids' Activities", group: "wants", amount: 300, note: "Sports, classes, school trips" },
  { id: "emergency", label: "Emergency Fund", group: "savings", amount: 520, note: "Rainy-day cushion" },
  { id: "retirement", label: "Retirement", group: "savings", amount: 320, note: "Long-term investing" },
  { id: "vacation", label: "Vacation Savings", group: "savings", amount: 200, note: "Summer trip jar" },
];

export const GROUP_LABELS = {
  needs: "Needs · 50%",
  wants: "Wants · 30%",
  savings: "Savings · 20%",
};

// Real November spending so far, matching the plan above. Spent $3,859.09 of $5,200.
export const SEED_EXPENSES = [
  { id: "e01", date: "2026-11-01", description: "Monthly rent", category: "housing", amount: 1400 },
  { id: "e02", date: "2026-11-02", description: "Weekly grocery shop — Market Fresh", category: "groceries", amount: 148.20 },
  { id: "e03", date: "2026-11-03", description: "Electricity bill", category: "utilities", amount: 86.40 },
  { id: "e04", date: "2026-11-05", description: "Fuel — family car", category: "transport", amount: 62.00 },
  { id: "e05", date: "2026-11-07", description: "Dinner out — Pizza night", category: "dining", amount: 54.75 },
  { id: "e06", date: "2026-11-08", description: "Weekly grocery shop — Market Fresh", category: "groceries", amount: 132.60 },
  { id: "e07", date: "2026-11-09", description: "Internet bill", category: "utilities", amount: 59.00 },
  { id: "e08", date: "2026-11-10", description: "Cinema — family movie", category: "entertainment", amount: 48.00 },
  { id: "e09", date: "2026-11-12", description: "Kids' football fees", category: "clothing2", amount: 90.00 },
  { id: "e10", date: "2026-11-13", description: "Weekly grocery shop — Market Fresh", category: "groceries", amount: 131.70 },
  { id: "e11", date: "2026-11-14", description: "Streaming bundle", category: "subscriptions", amount: 42.99 },
  { id: "e12", date: "2026-11-15", description: "Bus passes — two adults", category: "transport", amount: 96.00 },
  { id: "e13", date: "2026-11-16", description: "Water bill", category: "utilities", amount: 41.30 },
  { id: "e14", date: "2026-11-18", description: "New school shoes", category: "personal", amount: 78.50 },
  { id: "e15", date: "2026-11-19", description: "Dinner out — Taco Tuesday", category: "dining", amount: 61.20 },
  { id: "e17", date: "2026-11-20", description: "Board games for family night", category: "entertainment", amount: 34.95 },
  { id: "e18", date: "2026-11-21", description: "Haircuts — whole family", category: "personal", amount: 64.00 },
  { id: "e19", date: "2026-11-22", description: "Car wash + oil top-up", category: "transport", amount: 45.50 },
  { id: "e20", date: "2026-11-23", description: "Birthday gift for Grandma", category: "personal", amount: 42.00 },
  { id: "e21", date: "2026-11-24", description: "Emergency fund transfer", category: "emergency", amount: 520.00 },
  { id: "e22", date: "2026-11-24", description: "Retirement contribution", category: "retirement", amount: 320.00 },
  { id: "e23", date: "2026-11-24", description: "Vacation jar transfer", category: "vacation", amount: 200.00 },
  { id: "e24", date: "2026-11-25", description: "Health insurance top-up", category: "insurance", amount: 100.00 },
];

// Savings goals with real progress.
export const SEED_GOALS = [
  { id: "g1", name: "Emergency Fund", target: 10000, saved: 6250, note: "Six months of essentials, for peace of mind." },
  { id: "g2", name: "Family Car Replacement", target: 8000, saved: 3200, note: "A reliable used car in about two years." },
  { id: "g3", name: "Summer Vacation", target: 2400, saved: 1800, note: "Beach week for four — almost there!" },
  { id: "g4", name: "Kids' Education Fund", target: 5000, saved: 950, note: "Started this year, $100 a month." },
];

export const PRESETS = [
  { id: "p503020", name: "50 / 30 / 20 — Balanced", needs: 50, wants: 30, savings: 20, blurb: "The classic rule: half for needs, a third for fun, a fifth saved." },
  { id: "p602020", name: "60 / 20 / 20 — Tight", needs: 60, wants: 20, savings: 20, blurb: "Higher rent or bills? Squeeze the fun, keep saving." },
  { id: "p703010", name: "70 / 20 / 10 — Starter", needs: 70, wants: 20, savings: 10, blurb: "Just getting started — save a little every month, no exceptions." },
];

export const TIPS = [
  { title: "Pay yourself first", body: "Move savings out on payday, before spending starts. The Alvarez family auto-transfers $1,040 on the 1st — $520 to emergency, $320 to retirement, $200 to vacation — so saving never depends on willpower." },
  { title: "Track every dollar for 30 days", body: "Small leaks sink budgets. A $4 coffee every workday is $88 a month. Write everything down for one month; most families find $150–$300 they did not know they spent." },
  { title: "Give every dollar a job", body: "Income minus plan must equal zero. If $5,200 comes in and $5,200 is assigned — rent, food, fun, savings — nothing drifts away unnoticed." },
  { title: "One fun budget, not five", body: "Merge dining, streaming and outings into one 'fun money' envelope of $1,560. When it is empty, fun waits until next month — no guilt, no arguments." },
  { title: "Review together, weekly", body: "Ten minutes every Sunday: check what is left in each envelope, move money between categories if life happened, and celebrate the wins. Budgets fail in silence, not in meetings." },
  { title: "Build the cushion first", body: "Before investing, hold $1,000, then one month of expenses, then three to six months. The Alvarez emergency fund at $6,250 of $10,000 covers almost five months of rent." },
];
