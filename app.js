/* ═══════════════════════════════════════════════════
   Finoexpert – Complete Trading Dashboard Logic
   ═══════════════════════════════════════════════════ */

// ── Constants ─────────────────────────────────────
const STARTING_BALANCE = 100000;

// Bot simulation constants
const RSI_BASE  = 30;  // Simulated RSI lower bound (0–100 scale)
const RSI_RANGE = 50;  // Simulated RSI upper bound offset → values fall in [30, 80]
// MACD signal uses slight negative bias (0.48 vs 0.5) to produce marginally more
// bearish noise, reflecting typical real-world sell pressure.
const MACD_BIAS = 0.48;

const NSE_STOCKS = [
  { symbol: 'RELIANCE',   name: 'Reliance Industries',   price: 2856.40 },
  { symbol: 'TCS',        name: 'Tata Consultancy Svcs', price: 3712.15 },
  { symbol: 'INFY',       name: 'Infosys',                price: 1498.80 },
  { symbol: 'HDFC',       name: 'HDFC Bank',              price: 1672.35 },
  { symbol: 'ICICI',      name: 'ICICI Bank',             price: 1124.60 },
  { symbol: 'WIPRO',      name: 'Wipro',                  price: 478.90  },
  { symbol: 'LT',         name: 'Larsen & Toubro',        price: 3524.75 },
  { symbol: 'ITC',        name: 'ITC',                    price: 468.20  },
  { symbol: 'MARUTI',     name: 'Maruti Suzuki',          price: 12450.00},
  { symbol: 'BAJAJ',      name: 'Bajaj Finance',          price: 6840.55 },
  { symbol: 'SBIN',       name: 'State Bank of India',    price: 742.10  },
  { symbol: 'ASIANPAINT', name: 'Asian Paints',           price: 2860.30 },
  { symbol: 'DMART',      name: 'Avenue Supermarts',      price: 4720.00 },
  { symbol: 'SUNPHARMA',  name: 'Sun Pharmaceutical',     price: 1576.45 },
  { symbol: 'HCLTECH',    name: 'HCL Technologies',       price: 1342.70 },
];

const BOT_STRATEGIES = [
  'Moving Average Crossover',
  'RSI Strategy',
  'MACD Strategy',
  'Bollinger Bands',
  'Momentum Strategy',
  'Mean Reversion',
  'Trend Following',
  'Volume-based Strategy',
  'Breakout Strategy',
];

const ANNOUNCEMENTS = [
  {
    title: 'RBI keeps repo rate unchanged at 6.5%',
    meta: 'Apr 5, 2025 · RBI Monetary Policy',
    body: 'The Reserve Bank of India has decided to keep the repo rate unchanged at 6.5% for the seventh consecutive meeting, citing stable inflation and growth.',
  },
  {
    title: 'SEBI tightens F&O margin requirements',
    meta: 'Apr 3, 2025 · SEBI Circular',
    body: 'SEBI has mandated higher upfront margins for F&O positions effective May 1, 2025, to curb speculative trading and protect retail investors.',
  },
  {
    title: 'Nifty hits all-time high of 22,500',
    meta: 'Mar 28, 2025 · Market Update',
    body: 'Nifty 50 index touched a fresh all-time high of 22,500 driven by strong FII buying in banking and IT stocks.',
  },
  {
    title: 'TCS Q4 results beat estimates',
    meta: 'Apr 10, 2025 · Corporate Results',
    body: 'TCS reported a net profit of ₹12,434 crore for Q4 FY25, a 4.5% YoY rise, beating street estimates of ₹12,100 crore.',
  },
  {
    title: 'Reliance JioBP expands fuel retail network',
    meta: 'Apr 8, 2025 · Corporate News',
    body: 'Reliance Industries\' JioBP fuel retail JV plans to add 1,000 new outlets by December 2025 across tier-2 and tier-3 cities.',
  },
];

// ── State ──────────────────────────────────────────
let state = {
  balance:      STARTING_BALANCE,
  portfolio:    {},  // { symbol: { qty, avgPrice } }
  history:      [],  // [{ id, date, action, symbol, qty, price, total, balanceAfter }]
  prices:       {},  // { symbol: currentPrice }
  prevPrices:   {},  // { symbol: prevPrice } – for change calc
  settings: {
    volatility: 1.5,
    notify:     true,
    live:       true,
  },
};

// ── Live price update interval handle ─────────────
let priceIntervalHandle = null;
let botIntervalHandle   = null;
let currentSection      = 'dashboard';

// ════════════════════════════════════════════════════
//  INITIALISATION
// ════════════════════════════════════════════════════
function init() {
  loadState();
  seedPrices();
  populateStockSelects();
  renderAnnouncements();
  setupNavigation();
  setupMarketOrderPreview();
  startLivePrices();
  renderAll();
}

function seedPrices() {
  NSE_STOCKS.forEach(s => {
    if (!state.prices[s.symbol]) state.prices[s.symbol] = s.price;
    if (!state.prevPrices[s.symbol]) state.prevPrices[s.symbol] = s.price;
  });
}

function populateStockSelects() {
  const ids = ['qt-stock', 'mkt-stock', 'bot-stock'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = NSE_STOCKS.map(s =>
      `<option value="${s.symbol}">${s.symbol}</option>`
    ).join('');
  });
}

function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const sec = item.dataset.section;
      switchSection(sec);
    });
  });
}

function setupMarketOrderPreview() {
  const stockSel = document.getElementById('mkt-stock');
  const typeSel  = document.getElementById('mkt-type');
  const qtyInput = document.getElementById('mkt-qty');
  const limitWrap= document.getElementById('mkt-limit-wrap');
  const preview  = document.getElementById('mkt-preview');

  function refresh() {
    const sym = stockSel && stockSel.value;
    const qty = parseInt((qtyInput && qtyInput.value) || 0);
    const price = state.prices[sym] || 0;
    if (typeSel && typeSel.value === 'limit') {
      limitWrap.style.display = '';
    } else {
      limitWrap.style.display = 'none';
    }
    if (sym && qty > 0) {
      const total = price * qty;
      if (preview) preview.textContent =
        `Estimated cost: ₹${fmt(total)} @ ₹${fmt(price)} per share`;
    }
  }

  [stockSel, typeSel, qtyInput].forEach(el => {
    if (el) el.addEventListener('change', refresh);
    if (el) el.addEventListener('input', refresh);
  });
  refresh();
}

// ════════════════════════════════════════════════════
//  SECTION SWITCHING
// ════════════════════════════════════════════════════
function switchSection(sec) {
  currentSection = sec;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const sectionEl = document.getElementById('section-' + sec);
  if (sectionEl) sectionEl.classList.add('active');

  const navEl = document.querySelector(`.nav-item[data-section="${sec}"]`);
  if (navEl) navEl.classList.add('active');

  renderSection(sec);
}

function renderSection(sec) {
  switch (sec) {
    case 'dashboard':    renderDashboard();    break;
    case 'portfolio':    renderPortfolio();    break;
    case 'market':       renderMarket();       break;
    case 'history':      renderHistory();      break;
    case 'account':      renderAccount();      break;
  }
}

function renderAll() {
  renderDashboard();
  renderPortfolio();
  renderMarket();
  renderHistory();
  renderAccount();
  updateTickers();
}

// ════════════════════════════════════════════════════
//  LIVE PRICES
// ════════════════════════════════════════════════════
function startLivePrices() {
  if (priceIntervalHandle) clearInterval(priceIntervalHandle);
  if (!state.settings.live) return;
  priceIntervalHandle = setInterval(() => {
    tickPrices();
    updateTickers();
    if (currentSection === 'dashboard') renderDashboard();
    if (currentSection === 'market')    renderMarket();
    if (currentSection === 'portfolio') renderPortfolio();
  }, 3000);
}

function tickPrices() {
  const vol = state.settings.volatility / 100;
  NSE_STOCKS.forEach(s => {
    state.prevPrices[s.symbol] = state.prices[s.symbol];
    const change = state.prices[s.symbol] * (Math.random() * vol * 2 - vol);
    state.prices[s.symbol] = Math.max(1, +(state.prices[s.symbol] + change).toFixed(2));
  });

  // Tick index values (stored in state for ticker bar)
  tickIndex('sensex', 73412, 0.008);
  tickIndex('nifty',  22186, 0.007);
  tickIndex('vix',    13.42, 0.015);
}

const indexState = {};
function tickIndex(key, base, vol) {
  if (!indexState[key]) indexState[key] = { val: base, prev: base };
  indexState[key].prev = indexState[key].val;
  const change = indexState[key].val * (Math.random() * vol * 2 - vol);
  indexState[key].val = Math.max(0.01, +(indexState[key].val + change).toFixed(2));
}

function updateTickers() {
  function setTicker(idVal, idChg, val, prev, decimals) {
    const el = document.getElementById(idVal);
    const elC = document.getElementById(idChg);
    if (!el || !elC) return;
    const pct = prev ? ((val - prev) / prev * 100) : 0;
    el.textContent = val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const up = pct >= 0;
    elC.textContent = (up ? '▲ ' : '▼ ') + Math.abs(pct).toFixed(2) + '%';
    elC.className = 't-chg ' + (up ? 'up' : 'down');
  }
  const s = indexState;
  if (s.sensex) setTicker('tk-sensex', 'tk-sensex-chg', s.sensex.val, s.sensex.prev, 0);
  if (s.nifty)  setTicker('tk-nifty',  'tk-nifty-chg',  s.nifty.val,  s.nifty.prev,  0);
  if (s.vix)    setTicker('tk-vix',    'tk-vix-chg',    s.vix.val,    s.vix.prev,    2);
}

// ════════════════════════════════════════════════════
//  TRADING FUNCTIONS
// ════════════════════════════════════════════════════
function quickTrade(action) {
  const sym = document.getElementById('qt-stock').value;
  const qty = parseInt(document.getElementById('qt-qty').value);
  executeTrade(action, sym, qty);
}

function placeTrade(action) {
  const sym  = document.getElementById('mkt-stock').value;
  const qty  = parseInt(document.getElementById('mkt-qty').value);
  const type = document.getElementById('mkt-type').value;
  let price  = state.prices[sym];

  if (type === 'limit') {
    const lp = parseFloat(document.getElementById('mkt-limit').value);
    if (!lp || lp <= 0) { showToast('Enter a valid limit price', true); return; }
    price = lp;
  }

  executeTrade(action, sym, qty, price);
}

function executeTrade(action, symbol, qty, priceOverride) {
  if (!symbol)       { showToast('Select a stock', true); return; }
  if (!qty || qty < 1){ showToast('Enter valid quantity', true); return; }

  const price = priceOverride || state.prices[symbol];
  const total = +(price * qty).toFixed(2);

  if (action === 'buy') {
    if (total > state.balance) {
      showToast(`Insufficient balance. Need ₹${fmt(total)}, have ₹${fmt(state.balance)}`, true);
      return;
    }
    state.balance = +(state.balance - total).toFixed(2);
    if (!state.portfolio[symbol]) {
      state.portfolio[symbol] = { qty: 0, avgPrice: 0 };
    }
    const holding = state.portfolio[symbol];
    const prevInvested = holding.qty * holding.avgPrice;
    holding.qty += qty;
    holding.avgPrice = +((prevInvested + total) / holding.qty).toFixed(2);
  } else {
    const holding = state.portfolio[symbol];
    if (!holding || holding.qty < qty) {
      showToast(`Insufficient shares. You hold ${holding ? holding.qty : 0} of ${symbol}`, true);
      return;
    }
    state.balance = +(state.balance + total).toFixed(2);
    holding.qty -= qty;
    if (holding.qty === 0) delete state.portfolio[symbol];
  }

  const record = {
    id:          state.history.length + 1,
    date:        new Date().toLocaleString('en-IN'),
    action,
    symbol,
    qty,
    price:       +price.toFixed(2),
    total,
    balanceAfter: state.balance,
  };
  state.history.unshift(record);

  saveState();
  renderAll();

  const msg = `${action === 'buy' ? '✅ Bought' : '🔴 Sold'} ${qty} × ${symbol} @ ₹${fmt(price)} = ₹${fmt(total)}`;
  showToast(msg, false);

  if (botIntervalHandle) {
    botLog(`[Trade] ${action.toUpperCase()} ${qty} ${symbol} @ ₹${fmt(price)}`);
  }
}

// ════════════════════════════════════════════════════
//  RENDER FUNCTIONS
// ════════════════════════════════════════════════════

// ── Dashboard ──────────────────────────────────────
function renderDashboard() {
  const portfolioValue = calcPortfolioValue();
  const totalInvested  = calcTotalInvested();
  const pnl            = portfolioValue - totalInvested;
  const pnlPct         = totalInvested > 0 ? (pnl / totalInvested * 100) : 0;

  const stats = [
    { label: 'Available Balance', value: '₹' + fmt(state.balance), sub: '', subClass: '' },
    { label: 'Portfolio Value',   value: '₹' + fmt(portfolioValue), sub: '', subClass: '' },
    { label: 'Total Invested',    value: '₹' + fmt(totalInvested),  sub: '', subClass: '' },
    { label: 'Unrealised P&L',    value: '₹' + fmt(pnl),           sub: pnlPct.toFixed(2) + '%', subClass: pnl >= 0 ? 'up' : 'down' },
  ];

  document.getElementById('dashboard-stats').innerHTML = stats.map(s => `
    <div class="stat-card">
      <div class="sc-label">${s.label}</div>
      <div class="sc-value">${s.value}</div>
      ${s.sub ? `<div class="sc-sub ${s.subClass}">${s.sub}</div>` : ''}
    </div>
  `).join('');

  // Market snapshot table (first 8 stocks)
  const tbody = document.getElementById('dashboard-market-body');
  if (tbody) {
    tbody.innerHTML = NSE_STOCKS.slice(0, 8).map(s => {
      const cur  = state.prices[s.symbol];
      const prev = state.prevPrices[s.symbol] || cur;
      const chg  = +(cur - prev).toFixed(2);
      const pct  = prev ? (chg / prev * 100).toFixed(2) : '0.00';
      const cls  = chg >= 0 ? 'up' : 'down';
      return `<tr>
        <td style="font-weight:600">${s.symbol}</td>
        <td>₹${fmt(cur)}</td>
        <td class="${cls}">${chg >= 0 ? '+' : ''}${fmt(chg)}</td>
        <td class="${cls}">${chg >= 0 ? '▲' : '▼'} ${Math.abs(pct)}%</td>
      </tr>`;
    }).join('');
  }
}

// ── Portfolio ──────────────────────────────────────
function renderPortfolio() {
  const holdings = Object.entries(state.portfolio);
  const portfolioValue = calcPortfolioValue();
  const totalInvested  = calcTotalInvested();
  const pnl            = portfolioValue - totalInvested;

  document.getElementById('portfolio-stats').innerHTML = `
    <div class="stat-card"><div class="sc-label">Holdings Count</div><div class="sc-value">${holdings.length}</div></div>
    <div class="stat-card"><div class="sc-label">Total Invested</div><div class="sc-value">₹${fmt(totalInvested)}</div></div>
    <div class="stat-card"><div class="sc-label">Current Value</div><div class="sc-value">₹${fmt(portfolioValue)}</div></div>
    <div class="stat-card"><div class="sc-label">Total P&L</div><div class="sc-value ${pnl >= 0 ? 'up' : 'down'}">₹${fmt(pnl)}</div></div>
  `;

  const empty = document.getElementById('portfolio-empty');
  const tbody = document.getElementById('portfolio-body');

  if (holdings.length === 0) {
    if (empty) empty.style.display = '';
    if (tbody) tbody.innerHTML = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  tbody.innerHTML = holdings.map(([sym, h]) => {
    const cur      = state.prices[sym] || 0;
    const invested = +(h.qty * h.avgPrice).toFixed(2);
    const value    = +(h.qty * cur).toFixed(2);
    const hPnl     = +(value - invested).toFixed(2);
    const hPct     = invested > 0 ? (hPnl / invested * 100).toFixed(2) : '0.00';
    const cls      = hPnl >= 0 ? 'up' : 'down';
    return `<tr>
      <td style="font-weight:600">${sym}</td>
      <td>${h.qty}</td>
      <td>₹${fmt(h.avgPrice)}</td>
      <td>₹${fmt(cur)}</td>
      <td>₹${fmt(invested)}</td>
      <td>₹${fmt(value)}</td>
      <td class="${cls}">${hPnl >= 0 ? '+' : ''}₹${fmt(Math.abs(hPnl))}</td>
      <td class="${cls}">${hPnl >= 0 ? '▲' : '▼'} ${Math.abs(hPct)}%</td>
    </tr>`;
  }).join('');
}

// ── Market ─────────────────────────────────────────
function renderMarket() {
  const q = (document.getElementById('market-search') || {}).value || '';
  const filtered = NSE_STOCKS.filter(s =>
    s.symbol.includes(q.toUpperCase()) || s.name.toUpperCase().includes(q.toUpperCase())
  );

  document.getElementById('market-cards').innerHTML = filtered.map(s => {
    const cur  = state.prices[s.symbol];
    const prev = state.prevPrices[s.symbol] || cur;
    const chg  = +(cur - prev).toFixed(2);
    const pct  = prev ? (chg / prev * 100).toFixed(2) : '0.00';
    const cls  = chg >= 0 ? 'up' : 'down';
    return `<div class="stock-card">
      <div class="sc-sym">${s.symbol}</div>
      <div style="font-size:0.72rem;color:#8b949e;">${s.name}</div>
      <div class="sc-price ${cls}">₹${fmt(cur)}</div>
      <div class="sc-chg ${cls}">${chg >= 0 ? '▲' : '▼'} ${Math.abs(chg)} (${Math.abs(pct)}%)</div>
      <div class="sc-btns">
        <button class="btn btn-primary btn-sm" onclick="quickBuyFromMarket('${s.symbol}')">Buy</button>
        <button class="btn btn-danger btn-sm"  onclick="quickSellFromMarket('${s.symbol}')">Sell</button>
      </div>
    </div>`;
  }).join('');
}

function quickBuyFromMarket(sym) {
  const qtyEl = document.getElementById('mkt-qty');
  const qty = parseInt((qtyEl && qtyEl.value) || 1);
  executeTrade('buy', sym, qty);
}

function quickSellFromMarket(sym) {
  const qtyEl = document.getElementById('mkt-qty');
  const qty = parseInt((qtyEl && qtyEl.value) || 1);
  executeTrade('sell', sym, qty);
}

// ── History ─────────────────────────────────────────
function renderHistory() {
  const empty = document.getElementById('history-empty');
  const tbody = document.getElementById('history-body');

  if (state.history.length === 0) {
    if (empty) empty.style.display = '';
    if (tbody) tbody.innerHTML = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  tbody.innerHTML = state.history.map(r => `
    <tr>
      <td>${r.id}</td>
      <td style="white-space:nowrap">${r.date}</td>
      <td><span style="color:${r.action === 'buy' ? '#3fb950' : '#f85149'};font-weight:600;">${r.action.toUpperCase()}</span></td>
      <td style="font-weight:600">${r.symbol}</td>
      <td>${r.qty}</td>
      <td>₹${fmt(r.price)}</td>
      <td>₹${fmt(r.total)}</td>
      <td>₹${fmt(r.balanceAfter)}</td>
    </tr>
  `).join('');
}

// ── Account ──────────────────────────────────────
function renderAccount() {
  const portfolioValue = calcPortfolioValue();
  document.getElementById('account-stats').innerHTML = `
    <div class="stat-card"><div class="sc-label">Available Balance</div><div class="sc-value">₹${fmt(state.balance)}</div></div>
    <div class="stat-card"><div class="sc-label">Portfolio Value</div><div class="sc-value">₹${fmt(portfolioValue)}</div></div>
    <div class="stat-card"><div class="sc-label">Net Worth</div><div class="sc-value">₹${fmt(+(state.balance + portfolioValue).toFixed(2))}</div></div>
    <div class="stat-card"><div class="sc-label">Trades Executed</div><div class="sc-value">${state.history.length}</div></div>
  `;
}

// ── Announcements ─────────────────────────────────
function renderAnnouncements() {
  document.getElementById('announcements-list').innerHTML = ANNOUNCEMENTS.map(a => `
    <div class="ann-item">
      <div class="ann-title">${a.title}</div>
      <div class="ann-meta">${a.meta}</div>
      <div class="ann-body">${a.body}</div>
    </div>
  `).join('');
}

// ════════════════════════════════════════════════════
//  ACCOUNT FUNCTIONS
// ════════════════════════════════════════════════════
function addFunds() {
  const amt = parseFloat(document.getElementById('add-funds-amt').value);
  if (!amt || amt < 1) { showToast('Enter a valid amount', true); return; }
  state.balance = +(state.balance + amt).toFixed(2);
  saveState();
  renderAll();
  showToast(`₹${fmt(amt)} added to your balance`);
}

// ════════════════════════════════════════════════════
//  SETTINGS
// ════════════════════════════════════════════════════
function applySettings() {
  const vol  = document.getElementById('setting-volatility');
  const notif = document.getElementById('setting-notify');
  const live  = document.getElementById('setting-live');

  if (vol)   state.settings.volatility = parseFloat(vol.value);
  if (notif) state.settings.notify     = notif.checked;
  if (live)  state.settings.live       = live.checked;

  saveState();

  // Restart or stop live price updates
  if (priceIntervalHandle) clearInterval(priceIntervalHandle);
  if (state.settings.live) startLivePrices();
}

function resetPortfolio() {
  if (!confirm('This will wipe all trades and reset your balance to ₹1,00,000. Continue?')) return;
  state.balance   = STARTING_BALANCE;
  state.portfolio = {};
  state.history   = [];
  // Reset prices to defaults
  NSE_STOCKS.forEach(s => {
    state.prices[s.symbol]     = s.price;
    state.prevPrices[s.symbol] = s.price;
  });
  saveState();
  renderAll();
  showToast('Portfolio reset. Starting fresh with ₹1,00,000!');
}

// ════════════════════════════════════════════════════
//  ALGO BOT
// ════════════════════════════════════════════════════
function startBot() {
  if (botIntervalHandle) return;
  const stratIdx  = parseInt(document.getElementById('bot-strategy').value);
  const sym       = document.getElementById('bot-stock').value;
  const qty       = parseInt(document.getElementById('bot-qty').value) || 5;
  const interval  = (parseInt(document.getElementById('bot-interval').value) || 5) * 1000;
  const stratName = BOT_STRATEGIES[stratIdx];

  document.getElementById('bot-start-btn').style.display = 'none';
  document.getElementById('bot-stop-btn').style.display  = '';
  document.getElementById('bot-status-txt').textContent   = `Status: Running — ${stratName} on ${sym}`;

  clearBotLog();
  botLog(`[Bot] Started: ${stratName} | Stock: ${sym} | Qty: ${qty}`);

  botIntervalHandle = setInterval(() => {
    runBotStrategy(stratIdx, sym, qty);
  }, interval);
}

function stopBot() {
  if (botIntervalHandle) {
    clearInterval(botIntervalHandle);
    botIntervalHandle = null;
  }
  document.getElementById('bot-start-btn').style.display = '';
  document.getElementById('bot-stop-btn').style.display  = 'none';
  document.getElementById('bot-status-txt').textContent  = 'Status: Idle';
  botLog('[Bot] Stopped.');
}

function runBotStrategy(stratIdx, sym, qty) {
  const cur  = state.prices[sym];
  const prev = state.prevPrices[sym] || cur;
  const pct  = prev ? (cur - prev) / prev * 100 : 0;
  const stratName = BOT_STRATEGIES[stratIdx];
  let action = null;
  let reason = '';

  switch (stratIdx) {
    case 0: // Moving Average Crossover – buy on short > long (simulated)
      action = pct > 0.1 ? 'buy' : pct < -0.1 ? 'sell' : null;
      reason = `MA crossover signal: ${pct.toFixed(3)}%`;
      break;
    case 1: // RSI – oversold/overbought via random RSI simulation
      { const rsi = RSI_BASE + Math.random() * RSI_RANGE;
        action = rsi < 35 ? 'buy' : rsi > 70 ? 'sell' : null;
        reason = `RSI=${rsi.toFixed(1)}`; }
      break;
    case 2: // MACD
      { const macd = (Math.random() - MACD_BIAS) * 10;
        action = macd > 2 ? 'buy' : macd < -2 ? 'sell' : null;
        reason = `MACD=${macd.toFixed(2)}`; }
      break;
    case 3: // Bollinger Bands
      { const z = (Math.random() - 0.5) * 4;
        action = z < -1.8 ? 'buy' : z > 1.8 ? 'sell' : null;
        reason = `BB z-score=${z.toFixed(2)}`; }
      break;
    case 4: // Momentum
      action = pct > 0.5 ? 'buy' : pct < -0.5 ? 'sell' : null;
      reason = `Momentum=${pct.toFixed(3)}%`;
      break;
    case 5: // Mean Reversion
      action = pct < -0.3 ? 'buy' : pct > 0.3 ? 'sell' : null;
      reason = `MR signal: ${pct.toFixed(3)}%`;
      break;
    case 6: // Trend Following
      { const trend = Array.from({length:5}, () => Math.random() - 0.48).reduce((a,b)=>a+b,0);
        action = trend > 0.5 ? 'buy' : trend < -0.5 ? 'sell' : null;
        reason = `Trend strength=${trend.toFixed(2)}`; }
      break;
    case 7: // Volume-based
      { const vol = Math.random() * 2;
        action = vol > 1.5 && pct > 0 ? 'buy' : vol > 1.5 && pct < 0 ? 'sell' : null;
        reason = `Volume ratio=${vol.toFixed(2)}, change=${pct.toFixed(3)}%`; }
      break;
    case 8: // Breakout
      { const breakout = Math.random();
        action = breakout > 0.85 ? 'buy' : breakout < 0.15 ? 'sell' : null;
        reason = `Breakout prob=${breakout.toFixed(3)}`; }
      break;
  }

  if (action) {
    botLog(`[${stratName}] Signal: ${action.toUpperCase()} ${sym} | ${reason}`);
    executeTrade(action, sym, qty);
  } else {
    botLog(`[${stratName}] No signal (${sym} ₹${fmt(cur)}) | ${reason}`);
  }
}

function botLog(msg) {
  const el = document.getElementById('bot-log');
  if (!el) return;
  const ts = new Date().toLocaleTimeString('en-IN');
  el.textContent += `\n[${ts}] ${msg}`;
  el.scrollTop = el.scrollHeight;
}

function clearBotLog() {
  const el = document.getElementById('bot-log');
  if (el) el.textContent = '';
}

// ════════════════════════════════════════════════════
//  EXPORT FUNCTIONS
// ════════════════════════════════════════════════════
function exportCSV() {
  if (state.history.length === 0) { showToast('No trade history to export', true); return; }
  const headers = ['#', 'Date', 'Action', 'Symbol', 'Qty', 'Price', 'Total', 'Balance After'];
  const rows = state.history.map(r =>
    [r.id, `"${r.date}"`, r.action, r.symbol, r.qty, r.price, r.total, r.balanceAfter].join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  downloadFile('finoexpert_trades.csv', csv, 'text/csv');
  showToast('Trade history exported as CSV');
}

function exportJSON() {
  if (state.history.length === 0) { showToast('No trade history to export', true); return; }
  const data = {
    exportedAt: new Date().toISOString(),
    balance:    state.balance,
    portfolio:  state.portfolio,
    history:    state.history,
  };
  downloadFile('finoexpert_data.json', JSON.stringify(data, null, 2), 'application/json');
  showToast('Data exported as JSON');
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function clearHistory() {
  if (!confirm('Clear all trade history? This cannot be undone.')) return;
  state.history = [];
  saveState();
  renderHistory();
  showToast('Trade history cleared');
}

// ════════════════════════════════════════════════════
//  LOCALSTORAGE
// ════════════════════════════════════════════════════
function saveState() {
  try {
    localStorage.setItem('fino_state', JSON.stringify({
      balance:    state.balance,
      portfolio:  state.portfolio,
      history:    state.history,
      prices:     state.prices,
      prevPrices: state.prevPrices,
      settings:   state.settings,
    }));
  } catch(e) { /* storage unavailable */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem('fino_state');
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.balance !== null && saved.balance !== undefined) state.balance = saved.balance;
    if (saved.portfolio)          state.portfolio  = saved.portfolio;
    if (saved.history)            state.history    = saved.history;
    if (saved.prices)             state.prices     = saved.prices;
    if (saved.prevPrices)         state.prevPrices = saved.prevPrices;
    if (saved.settings)           state.settings   = { ...state.settings, ...saved.settings };
  } catch(e) { /* ignore corrupt data */ }

  // Sync settings UI after load
  const vol   = document.getElementById('setting-volatility');
  const notif = document.getElementById('setting-notify');
  const live  = document.getElementById('setting-live');
  if (vol)   vol.value   = state.settings.volatility;
  if (notif) notif.checked = state.settings.notify;
  if (live)  live.checked  = state.settings.live;
}

// ════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════
function calcPortfolioValue() {
  return +Object.entries(state.portfolio).reduce((sum, [sym, h]) => {
    return sum + h.qty * (state.prices[sym] || 0);
  }, 0).toFixed(2);
}

function calcTotalInvested() {
  return +Object.entries(state.portfolio).reduce((sum, [sym, h]) => {
    return sum + h.qty * h.avgPrice;
  }, 0).toFixed(2);
}

function fmt(n) {
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

let toastTimeout;
function showToast(msg, isError = false) {
  if (!state.settings.notify && !isError) return;
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className   = isError ? 'err' : '';
  el.style.display = 'block';
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { el.style.display = 'none'; }, 3500);
}

// ════════════════════════════════════════════════════
//  BOOT
// ════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', init);