// main.js — Hearth's behaviour. One job: wire the pages together.
// Reads the numbers from data.js, renders the dashboard, planner, expense
// tracker and savings goals, and keeps everything in localStorage.
import { HOUSEHOLD, PLAN_CATEGORIES, GROUP_LABELS, SEED_EXPENSES, SEED_GOALS, PRESETS, TIPS } from "./data.js";

const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money0 = (n) => "$" + Math.round(n).toLocaleString("en-US");
const $ = (id) => document.getElementById(id);
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const STORE_EXPENSES = "hearth-expenses-v1";
const STORE_PLAN = "hearth-plan-v1";
const STORE_GOALS = "hearth-goals-v1";

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch { return fallback; }
}
function saveJson(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ } }

let expenses = loadJson(STORE_EXPENSES, null);
if (!Array.isArray(expenses) || expenses.length === 0) { expenses = SEED_EXPENSES.map((e) => ({ ...e })); saveJson(STORE_EXPENSES, expenses); }
let plan = loadJson(STORE_PLAN, null);
if (!plan || !Array.isArray(plan.categories)) { plan = { income: HOUSEHOLD.monthlyIncome, categories: PLAN_CATEGORIES.map((c) => ({ ...c })) }; }
let goals = loadJson(STORE_GOALS, null);
if (!Array.isArray(goals) || goals.length === 0) { goals = SEED_GOALS.map((g) => ({ ...g })); saveJson(STORE_GOALS, goals); }
let selectedPreset = "p503020";

const catById = (id) => plan.categories.find((c) => c.id === id) || PLAN_CATEGORIES.find((c) => c.id === id);
const groupTotal = (group) => plan.categories.filter((c) => c.group === group).reduce((s, c) => s + c.amount, 0);
const planTotal = () => plan.categories.reduce((s, c) => s + c.amount, 0);
const spentByCat = (id) => expenses.filter((e) => e.category === id).reduce((s, e) => s + e.amount, 0);
const totalSpent = () => expenses.reduce((s, e) => s + e.amount, 0);

// ---------- routing ----------
const PAGES = ["dashboard", "planner", "expenses", "goals", "guide"];
function route() {
  const name = (location.hash.replace(/^#\/?/, "") || "dashboard").split("/")[0];
  const page = PAGES.includes(name) ? name : "dashboard";
  for (const p of PAGES) {
    $("page-" + p).classList.toggle("active", p === page);
    document.querySelector(`[data-nav="${p}"]`)?.classList.toggle("active", p === page);
  }
  window.scrollTo(0, 0);
  if (page === "dashboard") renderDashboard();
  if (page === "planner") renderPlanner();
  if (page === "expenses") renderExpenses();
  if (page === "goals") renderGoals();
}
window.addEventListener("hashchange", route);

// ---------- donut chart (canvas, no library) ----------
const GROUP_COLORS = { needs: "#14532d", wants: "#d97706", savings: "#16a34a" };
function drawDonut(canvas, groups) {
  const ctx = canvas.getContext("2d");
  const cx = canvas.width / 2, cy = canvas.height / 2, r = Math.min(cx, cy) - 8;
  const total = groups.reduce((s, g) => s + g.value, 0) || 1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let start = -Math.PI / 2;
  for (const g of groups) {
    const sweep = (g.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + sweep);
    ctx.closePath();
    ctx.fillStyle = g.color;
    ctx.fill();
    start += sweep;
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.58, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.fillStyle = "#1c2420";
  ctx.font = "800 22px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(money0(total), cx, cy - 2);
  ctx.font = "600 12px sans-serif";
  ctx.fillStyle = "#5b6b60";
  ctx.fillText("per month", cx, cy + 16);
}
function groupSlices() {
  return ["needs", "wants", "savings"].map((g) => ({ group: g, value: groupTotal(g), color: GROUP_COLORS[g] }));
}

// ---------- dashboard ----------
function renderDashboard() {
  const spent = totalSpent();
  const left = plan.income - spent;
  $("stat-income").textContent = money0(plan.income);
  $("stat-spent").textContent = money(spent);
  $("stat-spent-sub").textContent = "of " + money0(plan.income) + " planned";
  $("stat-left").textContent = money(left);
  $("stat-left-sub").textContent = Math.max(0, Math.round((left / plan.income) * 100)) + "% of income unspent";
  $("stat-saved").textContent = money0(groupTotal("savings"));
  drawDonut($("donut"), groupSlices());

  // Envelopes: top 6 categories by budget, spent vs planned.
  const top = [...plan.categories].sort((a, b) => b.amount - a.amount).slice(0, 6);
  $("envelope-list").innerHTML = top.map((c) => {
    const spentCat = spentByCat(c.id);
    const pct = c.amount ? Math.min(100, Math.round((spentCat / c.amount) * 100)) : 0;
    const over = spentCat > c.amount;
    const cls = over ? "bar-fill over" : pct > 85 ? "bar-fill warnfill" : "bar-fill";
    return `<div class="cat-row"><div class="cat-head"><span>${esc(c.label)}</span><span class="amt">${money(spentCat)} / ${money0(c.amount)}</span></div>
      <div class="cat-sub">${over ? "Over budget by " + money(spentCat - c.amount) + " — pull back this week." : pct + "% used"}</div>
      <div class="bar-track"><div class="${cls}" style="width:${pct}%"></div></div></div>`;
  }).join("");

  const recent = [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 5);
  $("recent-list").innerHTML = recent.map((e) => `<div class="cat-row"><div class="cat-head"><span>${esc(e.description)}</span><span class="amt">${money(e.amount)}</span></div><div class="cat-sub">${e.date} · ${esc(catById(e.category)?.label || e.category)}</div></div>`).join("");

  $("goals-preview").innerHTML = goals.slice(0, 3).map((g) => {
    const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
    return `<div class="cat-row"><div class="cat-head"><span>${esc(g.name)}</span><span class="amt">${money0(g.saved)} / ${money0(g.target)}</span></div>
      <div class="progress-wrap"><div class="progress-fill" style="width:${pct}%"></div></div><div class="cat-sub">${pct}% there — ${money0(g.target - g.saved)} to go</div></div>`;
  }).join("");

  const groceries = plan.categories.find((c) => c.id === "groceries");
  const gLeft = groceries ? groceries.amount - spentByCat("groceries") : 0;
  const tip = $("dashboard-tip");
  if (left < 0) {
    tip.className = "callout red";
    tip.innerHTML = `<strong>Over budget.</strong> Spending is ${money(-left)} past income this month. Pause wants spending and move money from the travel envelope first.`;
  } else {
    tip.className = "callout green";
    tip.innerHTML = `<strong>On track.</strong> With 5 days left in November, ${money(left)} remains and no envelope is over budget. Groceries have ${money(gLeft)} left — keep the last shop under that and the month lands exactly on plan.`;
  }
}

// ---------- planner ----------
function renderPresets() {
  $("preset-row").innerHTML = PRESETS.map((p) =>
    `<button class="btn ghost preset-btn ${p.id === selectedPreset ? "selected" : ""}" type="button" data-preset="${p.id}">${esc(p.name)}</button>`).join("");
  document.querySelectorAll(".preset-btn").forEach((b) => b.addEventListener("click", () => applyPreset(b.dataset.preset)));
}
function applyPreset(id) {
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) return;
  selectedPreset = id;
  const income = plan.income;
  // Scale each group to the preset share, keeping each category's share inside its group.
  for (const group of ["needs", "wants", "savings"]) {
    const target = Math.round((income * preset[group] / 100) / 10) * 10;
    const cats = plan.categories.filter((c) => c.group === group);
    const oldTotal = cats.reduce((s, c) => s + c.amount, 0) || 1;
    let assigned = 0;
    cats.forEach((c, i) => {
      c.amount = i === cats.length - 1 ? target - assigned : Math.round(((c.amount / oldTotal) * target) / 10) * 10;
      assigned += c.amount;
    });
  }
  $("preset-blurb").textContent = preset.blurb;
  renderPresets();
  renderPlanner();
}
function renderPlanner() {
  $("income-input").value = plan.income;
  $("slider-list").innerHTML = plan.categories.map((c) => {
    const pct = plan.income ? ((c.amount / plan.income) * 100).toFixed(1) : "0.0";
    return `<div class="slider-row"><span class="cat-label slider-label">${esc(c.label)} <span class="cat-note">· ${esc(GROUP_LABELS[c.group])} · ${esc(c.note)}</span></span>
      <input type="range" min="0" max="${Math.max(2000, plan.income)}" step="10" value="${c.amount}" data-cat="${c.id}" aria-label="${esc(c.label)} amount">
      <span class="pct" id="pct-${c.id}">${money0(c.amount)} · ${pct}%</span></div>`;
  }).join("");
  document.querySelectorAll("#slider-list input[type=range]").forEach((input) => {
    input.addEventListener("input", () => {
      const cat = plan.categories.find((c) => c.id === input.dataset.cat);
      cat.amount = Number(input.value);
      selectedPreset = "";
      renderPresets();
      updatePlannerTotals();
      const pct = plan.income ? ((cat.amount / plan.income) * 100).toFixed(1) : "0.0";
      $("pct-" + cat.id).textContent = `${money0(cat.amount)} · ${pct}%`;
    });
  });
  updatePlannerTotals();
}
function updatePlannerTotals() {
  const total = planTotal();
  const unassigned = plan.income - total;
  $("plan-total").textContent = money0(total);
  $("plan-income").textContent = money0(plan.income);
  $("plan-unassigned").textContent = money0(unassigned);
  $("leg-needs").textContent = `Needs — ${money0(groupTotal("needs"))}`;
  $("leg-wants").textContent = `Wants — ${money0(groupTotal("wants"))}`;
  $("leg-savings").textContent = `Savings — ${money0(groupTotal("savings"))}`;
  drawDonut($("donut-planner"), groupSlices());
  const warn = $("plan-warning");
  if (unassigned === 0) {
    warn.className = "callout green";
    warn.innerHTML = "<strong>Balanced.</strong> Every dollar has a job — income minus plan is $0.";
  } else if (unassigned > 0) {
    warn.className = "callout";
    warn.innerHTML = `<strong>${money0(unassigned)} unassigned.</strong> Give it a job — add it to savings or a goal before the month starts.`;
  } else {
    warn.className = "callout red";
    warn.innerHTML = `<strong>Over by ${money0(-unassigned)}.</strong> The plan spends more than the income. Trim a want first — dining out or travel.`;
  }
}
$("income-input").addEventListener("input", (e) => {
  plan.income = Math.max(0, Number(e.target.value) || 0);
  selectedPreset = "";
  renderPresets();
  updatePlannerTotals();
});
$("save-plan").addEventListener("click", () => {
  saveJson(STORE_PLAN, plan);
  $("plan-message").textContent = "Plan saved — the dashboard and expense tracker now use these numbers.";
});
$("reset-plan").addEventListener("click", () => {
  plan = { income: HOUSEHOLD.monthlyIncome, categories: PLAN_CATEGORIES.map((c) => ({ ...c })) };
  selectedPreset = "p503020";
  $("preset-blurb").textContent = PRESETS[0].blurb;
  saveJson(STORE_PLAN, plan);
  renderPresets();
  renderPlanner();
  $("plan-message").textContent = "Reset to the 50/30/20 plan for $5,200 a month.";
});

// ---------- expenses ----------
function expenseOptions(select, withAll) {
  select.innerHTML = (withAll ? `<option value="">All categories</option>` : "") +
    plan.categories.map((c) => `<option value="${c.id}">${esc(c.label)} — budget ${money0(c.amount)}</option>`).join("");
}
function renderExpenses() {
  expenseOptions($("exp-cat"), false);
  expenseOptions($("filter-cat"), true);
  renderExpenseTable();
  renderExpenseSummary();
}
function renderExpenseSummary() {
  const rows = plan.categories.map((c) => {
    const spent = spentByCat(c.id);
    const pct = c.amount ? Math.min(100, Math.round((spent / c.amount) * 100)) : 0;
    const over = spent > c.amount;
    const badge = over ? `<span class="pill over">Over by ${money(spent - c.amount)}</span>` : pct >= 100 ? `<span class="pill">Fully used</span>` : pct > 85 ? `<span class="pill amber">Almost full</span>` : `<span class="pill">On track</span>`;
    return `<div class="cat-row"><div class="cat-head"><span>${esc(c.label)}</span><span class="amt">${money(spent)} / ${money0(c.amount)}</span></div>
      <div class="bar-track" style="margin:6px 0"><div class="${over ? "bar-fill over" : pct > 85 ? "bar-fill warnfill" : "bar-fill"}" style="width:${pct}%"></div></div>
      <div class="cat-sub">${pct}% used · ${money(Math.max(0, c.amount - spent))} left ${badge}</div></div>`;
  }).join("");
  $("expense-summary").innerHTML = rows;
  $("expense-total").textContent = money(totalSpent());
  $("expense-count").textContent = expenses.length + " expenses";
}
function renderExpenseTable() {
  const filter = $("filter-cat").value;
  const list = [...expenses]
    .filter((e) => !filter || e.category === filter)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  $("expense-empty").hidden = list.length > 0;
  $("expense-rows").innerHTML = list.map((e) => {
    const over = spentByCat(e.category) > (catById(e.category)?.amount ?? 0);
    return `<tr class="${over ? "over-row" : ""}"><td>${e.date}</td><td>${esc(e.description)}</td><td>${esc(catById(e.category)?.label || e.category)}</td><td class="num">${money(e.amount)}</td><td><button class="btn small danger" type="button" data-del="${e.id}">Delete</button></td></tr>`;
  }).join("");
  document.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
    expenses = expenses.filter((e) => e.id !== b.dataset.del);
    saveJson(STORE_EXPENSES, expenses);
    renderExpenseTable();
    renderExpenseSummary();
    renderDashboard();
  }));
}
$("filter-cat").addEventListener("change", renderExpenseTable);
$("expense-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = Number($("exp-amount").value);
  if (!amount || amount <= 0) { $("expense-message").textContent = "Enter an amount above $0."; return; }
  const desc = $("exp-desc").value.trim();
  if (!desc) { $("expense-message").textContent = "Describe the expense."; return; }
  const entry = { id: "e" + Date.now().toString(36), date: $("exp-date").value || "2026-11-26", description: desc, category: $("exp-cat").value, amount };
  expenses.push(entry);
  saveJson(STORE_EXPENSES, expenses);
  $("expense-message").textContent = `Added ${money(amount)} for ${desc}.`;
  $("expense-form").reset();
  $("exp-date").value = "2026-11-26";
  renderExpenseTable();
  renderExpenseSummary();
});

// ---------- goals ----------
function renderGoals() {
  $("goals-grid").innerHTML = goals.map((g) => {
    const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
    const done = g.saved >= g.target;
    return `<div class="card"><h3>${esc(g.name)}</h3><p class="muted small">${esc(g.note)}</p>
      <div class="goal-amount">${money0(g.saved)} <span class="muted small">of ${money0(g.target)}</span></div>
      <div class="progress-wrap"><div class="progress-fill" style="width:${pct}%"></div></div>
      <p>${done ? `<span class="pill">Goal reached — well done!</span>` : `${pct}% there · ${money0(g.target - g.saved)} to go · at $200/month, about ${Math.ceil((g.target - g.saved) / 200)} months left`}</p></div>`;
  }).join("");
  $("goal-select").innerHTML = goals.map((g) => `<option value="${g.id}">${esc(g.name)} — ${money0(g.saved)} of ${money0(g.target)}</option>`).join("");
}
$("goal-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = Number($("goal-amount").value);
  const goal = goals.find((g) => g.id === $("goal-select").value);
  if (!goal || !amount || amount <= 0) { $("goal-message").textContent = "Enter an amount above $0."; return; }
  goal.saved += amount;
  saveJson(STORE_GOALS, goals);
  $("goal-message").textContent = `Added ${money(amount)} to ${goal.name} — now ${money0(goal.saved)} of ${money0(goal.target)}.`;
  $("goal-form").reset();
  renderGoals();
});
$("new-goal-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("new-goal-name").value.trim();
  const target = Number($("new-goal-target").value);
  if (!name || !target || target <= 0) return;
  goals.push({ id: "g" + Date.now().toString(36), name, target, saved: 0, note: "New goal — add money whenever you can." });
  saveJson(STORE_GOALS, goals);
  $("new-goal-form").reset();
  renderGoals();
});

// ---------- guide ----------
// The guide's example table always shows the canonical Alvarez plan from
// data.js, never the visitor's edited plan, so the guide stays consistent.
function renderGuide() {
  $("example-table").innerHTML = PLAN_CATEGORIES.map((c) => `<tr><td>${esc(c.label)}</td><td>${esc(GROUP_LABELS[c.group].split(" · ")[0])}</td><td class="num">${money0(c.amount)}</td><td class="num">${((c.amount / HOUSEHOLD.monthlyIncome) * 100).toFixed(1)}%</td><td class="muted small">${esc(c.note)}</td></tr>`).join("");
  $("tips-grid").innerHTML = TIPS.map((t, i) => `<div class="card tip"><div class="tip-num">${i + 1}</div><div><h3>${esc(t.title)}</h3><p class="muted">${esc(t.body)}</p></div></div>`).join("");
}

// ---------- boot ----------
renderPresets();
renderPlanner();
renderGuide();
route();
