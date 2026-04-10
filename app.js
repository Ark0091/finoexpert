/* ============================================================
   FINOEXPERT – app.js
   Complete finance dashboard application logic
   ============================================================ */

'use strict';

// ============================================================
// NSE STOCK DATA – 55 stocks with base prices & metadata
// ============================================================
const NSE_STOCKS = [
  { sym:'RELIANCE',  name:'Reliance Industries',      sector:'Energy',         base:2890, high52:3218, low52:2220 },
  { sym:'TCS',       name:'Tata Consultancy Svcs',    sector:'Technology',     base:3940, high52:4592, low52:3311 },
  { sym:'HDFCBANK',  name:'HDFC Bank',                sector:'Banking',        base:1680, high52:1880, low52:1364 },
  { sym:'INFY',      name:'Infosys',                  sector:'Technology',     base:1780, high52:2020, low52:1358 },
  { sym:'ICICIBANK', name:'ICICI Bank',               sector:'Banking',        base:1250, high52:1329, low52:936 },
  { sym:'SBIN',      name:'State Bank of India',      sector:'Banking',        base:810,  high52:912,  low52:543 },
  { sym:'BAJFINANCE',name:'Bajaj Finance',            sector:'NBFC',           base:6920, high52:8192, low52:5900 },
  { sym:'BHARTIARTL',name:'Bharti Airtel',            sector:'Telecom',        base:1580, high52:1779, low52:1030 },
  { sym:'LT',        name:'Larsen & Toubro',          sector:'Infrastructure', base:3520, high52:3963, low52:2685 },
  { sym:'WIPRO',     name:'Wipro',                    sector:'Technology',     base:478,  high52:572,  low52:364 },
  { sym:'KOTAKBANK', name:'Kotak Mahindra Bank',      sector:'Banking',        base:1920, high52:2063, low52:1544 },
  { sym:'ASIANPAINT',name:'Asian Paints',             sector:'FMCG',           base:2710, high52:3395, low52:2170 },
  { sym:'MARUTI',    name:'Maruti Suzuki',            sector:'Automobile',     base:12400,high52:13680,low52:9416 },
  { sym:'HCLTECH',   name:'HCL Technologies',         sector:'Technology',     base:1620, high52:1960, low52:1235 },
  { sym:'AXISBANK',  name:'Axis Bank',                sector:'Banking',        base:1148, high52:1340, low52:892 },
  { sym:'ITC',       name:'ITC Limited',              sector:'FMCG',           base:468,  high52:529,  low52:389 },
  { sym:'SUNPHARMA', name:'Sun Pharmaceutical',       sector:'Pharma',         base:1820, high52:2120, low52:1357 },
  { sym:'NESTLEIND', name:'Nestle India',             sector:'FMCG',           base:2278, high52:2778, low52:1923 },
  { sym:'TITAN',     name:'Titan Company',            sector:'FMCG',           base:3410, high52:3887, low52:2535 },
  { sym:'BAJAJFINSV',name:'Bajaj Finserv',            sector:'NBFC',           base:1680, high52:1957, low52:1419 },
  { sym:'ONGC',      name:'Oil and Natural Gas Corp', sector:'Energy',         base:278,  high52:345,  low52:191 },
  { sym:'NTPC',      name:'NTPC Limited',             sector:'Energy',         base:362,  high52:448,  low52:224 },
  { sym:'POWERGRID', name:'Power Grid Corp',          sector:'Energy',         base:328,  high52:366,  low52:211 },
  { sym:'ADANIPORTS',name:'Adani Ports & SEZ',        sector:'Infrastructure', base:1340, high52:1620, low52:868 },
  { sym:'TATAMOTORS',name:'Tata Motors',              sector:'Automobile',     base:980,  high52:1179, low52:635 },
  { sym:'HINDALCO',  name:'Hindalco Industries',      sector:'Metals',         base:618,  high52:772,  low52:422 },
  { sym:'TATASTEEL', name:'Tata Steel',               sector:'Metals',         base:152,  high52:185,  low52:119 },
  { sym:'JSWSTEEL',  name:'JSW Steel',                sector:'Metals',         base:895,  high52:1090, low52:696 },
  { sym:'ULTRACEMCO',name:'UltraTech Cement',         sector:'Infrastructure', base:10580,high52:11400,low52:7936 },
  { sym:'CIPLA',     name:'Cipla',                    sector:'Pharma',         base:1460, high52:1699, low52:1059 },
  { sym:'DRREDDY',   name:"Dr Reddy's Labs",          sector:'Pharma',         base:6210, high52:7175, low52:4955 },
  { sym:'DIVISLAB',  name:"Divi's Laboratories",      sector:'Pharma',         base:5180, high52:6200, low52:3430 },
  { sym:'EICHERMOT', name:'Eicher Motors',            sector:'Automobile',     base:4820, high52:5280, low52:3392 },
  { sym:'HEROMOTOCO',name:'Hero MotoCorp',            sector:'Automobile',     base:4280, high52:5235, low52:2978 },
  { sym:'BAJAJ-AUTO',name:'Bajaj Auto',               sector:'Automobile',     base:8950, high52:10200,low52:6350 },
  { sym:'GRASIM',    name:'Grasim Industries',        sector:'Infrastructure', base:2520, high52:2940, low52:1752 },
  { sym:'INDUSINDBK',name:'IndusInd Bank',            sector:'Banking',        base:1080, high52:1695, low52:968 },
  { sym:'BPCL',      name:'BPCL',                     sector:'Energy',         base:312,  high52:376,  low52:228 },
  { sym:'COALINDIA', name:'Coal India',               sector:'Energy',         base:468,  high52:544,  low52:335 },
  { sym:'TATACONSUM',name:'Tata Consumer Products',  sector:'FMCG',           base:1120, high52:1362, low52:823 },
  { sym:'APOLLOHOSP',name:'Apollo Hospitals',         sector:'Pharma',         base:6780, high52:7548, low52:4700 },
  { sym:'TECHM',     name:'Tech Mahindra',            sector:'Technology',     base:1560, high52:1745, low52:1030 },
  { sym:'SHREECEM',  name:'Shree Cement',             sector:'Infrastructure', base:25200,high52:29400,low52:19800 },
  { sym:'BRITANNIA', name:'Britannia Industries',     sector:'FMCG',           base:5380, high52:6120, low52:4326 },
  { sym:'HAVELLS',   name:'Havells India',            sector:'Infrastructure', base:1620, high52:1882, low52:1232 },
  { sym:'PIDILITIND',name:'Pidilite Industries',      sector:'FMCG',           base:2940, high52:3356, low52:2298 },
  { sym:'TORNTPHARM',name:'Torrent Pharmaceuticals',  sector:'Pharma',         base:3180, high52:3690, low52:2380 },
  { sym:'SIEMENS',   name:'Siemens',                  sector:'Infrastructure', base:5640, high52:7490, low52:4050 },
  { sym:'ZOMATO',    name:'Zomato',                   sector:'Technology',     base:218,  high52:304,  low52:143 },
  { sym:'PAYTM',     name:'One97 Communications',     sector:'Technology',     base:695,  high52:998,  low52:310 },
  { sym:'NYKAA',     name:'FSN E-Commerce (Nykaa)',   sector:'Technology',     base:168,  high52:236,  low52:118 },
  { sym:'IRCTC',     name:'Indian Railway Catering',  sector:'Infrastructure', base:780,  high52:1047, low52:607 },
  { sym:'TRENT',     name:'Trent',                    sector:'FMCG',           base:5620, high52:8345, low52:3492 },
  { sym:'VEDL',      name:'Vedanta',                  sector:'Metals',         base:440,  high52:527,  low52:268 },
  { sym:'MPHASIS',   name:'Mphasis',                  sector:'Technology',     base:2780, high52:3320, low52:2000 }
];

// Market indices base values
const INDICES = {
  nifty:  { val: 23280, label: 'NIFTY 50',   base: 23280 },
  sensex: { val: 76550, label: 'SENSEX',      base: 76550 },
  bank:   { val: 50120, label: 'NIFTY BANK',  base: 50120 },
  vix:    { val: 14.32, label: 'INDIA VIX',   base: 14.32, isVix: true }
};

// Announcements data
const ANNOUNCEMENTS_DATA = [
  { type:'Earnings',      company:'TCS',        sym:'TCS',       date:'10 Apr 2025', title:'Q4 FY25 Results – Net Profit ₹12,380 Cr', body:'TCS reported a net profit of ₹12,380 crore for Q4FY25, up 4.5% YoY. Revenue grew 5.1% to ₹63,973 crore. The board declared a final dividend of ₹28/share.' },
  { type:'Dividend',      company:'HDFC Bank',  sym:'HDFCBANK',  date:'09 Apr 2025', title:'Final Dividend of ₹19.50 per share', body:'HDFC Bank declared a final dividend of ₹19.50 per equity share. Record date is 18 April 2025. Payment date is 05 May 2025.' },
  { type:'Board-Meeting', company:'Reliance',   sym:'RELIANCE',  date:'08 Apr 2025', title:'Board Meeting to consider Q4 FY25 Results', body:'A meeting of the Board of Directors of Reliance Industries Limited is scheduled on 25 April 2025 to consider and approve the audited financial results for Q4/FY25.' },
  { type:'Bonus',         company:'Infosys',    sym:'INFY',      date:'07 Apr 2025', title:'Bonus Issue 1:1 Approved', body:'Infosys board has approved a bonus issue of one equity share for every one share held. Record date will be announced separately. This is subject to shareholder approval.' },
  { type:'Earnings',      company:'ICICI Bank', sym:'ICICIBANK', date:'07 Apr 2025', title:'Q4 FY25 PAT up 14% at ₹11,792 Cr', body:'ICICI Bank posted a standalone net profit of ₹11,792 crore for Q4FY25, up 14.5% YoY. Net NPA fell to 0.39%. NII grew 11.2% to ₹21,193 crore.' },
  { type:'Split',         company:'Maruti',     sym:'MARUTI',    date:'06 Apr 2025', title:'Stock Split 5:1 – Record Date 22 April', body:'Maruti Suzuki has fixed 22 April 2025 as the record date for the 5:1 stock split. Post-split face value changes from ₹5 to ₹1 per share.' },
  { type:'Buyback',       company:'Wipro',      sym:'WIPRO',     date:'05 Apr 2025', title:'Buyback of ₹12,000 Cr at ₹590/share', body:'Wipro Limited announced a buyback of up to 2,03,38,983 equity shares at ₹590 per share aggregating up to ₹12,000 crore via the tender offer route.' },
  { type:'Corporate',     company:'Bajaj Finance',sym:'BAJFINANCE',date:'04 Apr 2025',title:'Acquires 26% stake in PayNow Fintech', body:'Bajaj Finance Limited announced the acquisition of a 26% strategic stake in PayNow Fintech Pvt Ltd for ₹320 crore. This will strengthen its digital lending vertical.' },
  { type:'Dividend',      company:'ITC',        sym:'ITC',       date:'03 Apr 2025', title:'Interim Dividend of ₹6.75 per share', body:'ITC Limited declared an interim dividend of ₹6.75 per equity share. The record date is 15 April 2025. Dividend will be paid within 30 days of record date.' },
  { type:'Earnings',      company:'Wipro',      sym:'WIPRO',     date:'02 Apr 2025', title:'Q4 FY25 IT Services Revenue $2.63 Bn', body:'Wipro reported IT Services revenue of $2.63 billion for Q4FY25, up 1.3% QoQ. The company guided for 1.5–3.5% QoQ growth for Q1FY26. PAT at ₹3,570 crore.' },
  { type:'Board-Meeting', company:'SBI',        sym:'SBIN',      date:'01 Apr 2025', title:'AGM Scheduled for 28 June 2025', body:'State Bank of India has convened its Annual General Meeting on Saturday, 28 June 2025 at 11:00 AM. Shareholders to vote on dividend and board appointments.' },
  { type:'Corporate',     company:'Tata Motors',sym:'TATAMOTORS',date:'31 Mar 2025',title:'JLR EV Sales Cross 50,000 Units in FY25', body:"Jaguar Land Rover, Tata Motors' subsidiary, achieved a landmark with over 50,000 EV deliveries in FY25. The Defender PHEV and Range Rover Electric drove the surge." },
];

// Algo Strategies data
const STRATEGIES = [
  { id:'momentum',     name:'Momentum',        risk:'Medium', desc:'Buys stocks breaking above 20-day high. Sells on reversal. Trend-following with ATR-based stop loss.' },
  { id:'mean_rev',     name:'Mean Reversion',   risk:'Low',    desc:'Exploits temporary price deviations. Buys RSI < 30 oversold conditions; sells RSI > 70.' },
  { id:'ai_decided',   name:'AI Decided',       risk:'High',   desc:'ML model analyses volume, price patterns, and news sentiment to autonomously pick trades.' },
  { id:'scalping',     name:'Scalping',         risk:'High',   desc:'High-frequency micro trades on 1-min chart. 5–15 point targets with tight stop loss.' },
  { id:'swing',        name:'Swing Trading',    risk:'Medium', desc:'Holds positions 2–5 days. Uses MACD and Bollinger Bands for entry/exit signals.' },
  { id:'breakout',     name:'Breakout',         risk:'Medium', desc:'Identifies 52-week high/low breakouts with volume confirmation before entering.' },
  { id:'pairs',        name:'Pairs Trading',    risk:'Low',    desc:'Market-neutral strategy. Trades correlated pairs (e.g., RELIANCE–ONGC) on spread divergence.' },
  { id:'vwap',         name:'VWAP Strategy',    risk:'Low',    desc:'Uses Volume Weighted Average Price as fair-value benchmark. Buys dips below VWAP in uptrend.' },
  { id:'overnight',    name:'Overnight Carry',  risk:'Medium', desc:'Holds overnight positions based on FII/DII data, SGX NIFTY, and gap-up probability models.' }
];

// ============================================================
// APPLICATION STATE
// ============================================================
let state = {
  balance: 0,
  portfolio: {},   // { sym: { qty, avgPrice, sector, name } }
  trades: [],      // array of trade objects
  prices: {},      // { sym: { price, open, high, low, vol, prev } }
  indices: {},
  activeBot: null,
  botTrades: 0,
  botWins: 0,
  botPnl: 0,
  totalDeposited: 0,
  perfHistory: [],  // [{ date, value }]
  refreshInterval: 2000,
  _refreshTimer: null,
  _botTimer: null
};

// ============================================================
// INIT
// ============================================================
function init() {
  loadState();
  initPrices();
  renderAll();
  startPriceFeed();
  updateDashDate();
  updateThemeUI();

  // sidebar toggle
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Setup radio change listener for order type
  document.querySelectorAll('input[name="orderType"]').forEach(r => {
    r.addEventListener('change', function() {
      document.getElementById('limitPriceGroup').style.display =
        this.value === 'LIMIT' ? 'block' : 'none';
      updateTradeValue();
    });
  });
}

function initPrices() {
  NSE_STOCKS.forEach(s => {
    const noise = (Math.random() - 0.5) * 0.04;
    const price = +(s.base * (1 + noise)).toFixed(2);
    const open  = +(s.base * (1 + (Math.random()-0.5)*0.015)).toFixed(2);
    const high  = +(Math.max(price, open) * (1 + Math.random()*0.012)).toFixed(2);
    const low   = +(Math.min(price, open) * (1 - Math.random()*0.012)).toFixed(2);
    const vol   = Math.floor(Math.random() * 8000000 + 500000);
    state.prices[s.sym] = { price, open, high, low, vol, prev: open };
  });

  Object.keys(INDICES).forEach(k => {
    const idx = INDICES[k];
    state.indices[k] = {
      val:  +(idx.base * (1 + (Math.random()-0.5)*0.02)).toFixed(2),
      prev: idx.base
    };
  });
}

// ============================================================
// NAVIGATION
// ============================================================
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');

  // Re-render page
  switch (page) {
    case 'dashboard':     renderDashboard(); break;
    case 'portfolio':     renderPortfolio(); break;
    case 'market':        renderMarket();    break;
    case 'bot':           renderBotPage();   break;
    case 'history':       renderHistory();   break;
    case 'announcements': renderAnnouncements(); break;
    case 'account':       renderAccount();   break;
    case 'settings':      renderSettings();  break;
  }

  // Close mobile sidebar
  if (window.innerWidth <= 480) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

function renderAll() {
  renderDashboard();
  renderMarket();
  renderBotPage();
  renderAnnouncements();
  updateTopBar();
}

// ============================================================
// PRICE FEED
// ============================================================
function startPriceFeed() {
  if (state._refreshTimer) clearInterval(state._refreshTimer);
  state._refreshTimer = setInterval(tickPrices, state.refreshInterval);
}

function tickPrices() {
  // Update stock prices (random walk)
  NSE_STOCKS.forEach(s => {
    const p = state.prices[s.sym];
    const sigma = 0.003;
    const drift = (Math.random() - 0.499) * sigma * p.price;
    let newPrice = +(p.price + drift).toFixed(2);
    // Clamp price within 52-week range
    newPrice = Math.max(s.low52 * 0.9, Math.min(s.high52 * 1.1, newPrice));
    p.prev  = p.price;
    p.price = newPrice;
    p.high  = Math.max(p.high, newPrice);
    p.low   = Math.min(p.low, newPrice);
    p.vol  += Math.floor(Math.random() * 20000);
  });

  // Update indices
  ['nifty','sensex','bank','vix'].forEach(k => {
    const idx = INDICES[k];
    const sigma = idx.isVix ? 0.008 : 0.0015;
    const drift = (Math.random() - 0.499) * sigma * state.indices[k].val;
    state.indices[k].prev = state.indices[k].val;
    state.indices[k].val  = +(state.indices[k].val + drift).toFixed(2);
  });

  updateTopBar();
  updateLiveMarketPrices();
  updatePortfolioPrices();
  updateDashboardStats();
}

// ============================================================
// TOP BAR UPDATE
// ============================================================
function updateTopBar() {
  const isOpen = isMarketOpen();
  const dot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  if (dot && statusText) {
    dot.className = 'status-dot ' + (isOpen ? 'open' : 'closed');
    statusText.textContent = isOpen ? 'Market Open' : 'Market Closed';
  }

  ['nifty','sensex','bank','vix'].forEach(k => {
    const idx = state.indices[k];
    const baseVal = INDICES[k].base;
    const chg = +(idx.val - baseVal).toFixed(2);
    const chgPct = +((chg / baseVal) * 100).toFixed(2);
    const isVix = INDICES[k].isVix;

    const valEl = document.getElementById(k + 'Val');
    const chgEl = document.getElementById(k + 'Chg');
    if (valEl) valEl.textContent = isVix ? idx.val.toFixed(2) : fmtNum(idx.val);
    if (chgEl) {
      chgEl.textContent = (chg >= 0 ? '+' : '') + (isVix ? chg.toFixed(2) : fmtNum(Math.abs(chg))) + ' (' + (chgPct >= 0 ? '+' : '') + chgPct + '%)';
      chgEl.className = 'tick-chg ' + (chg >= 0 ? 'up' : 'down');
    }
  });

  // Update balance/pnl in topbar
  const totalPnl = calcTotalPnl();
  setEl('topBalance', fmt(state.balance));
  const pnlEl = document.getElementById('topPnl');
  if (pnlEl) {
    pnlEl.textContent = fmtPnl(totalPnl);
    pnlEl.style.color = totalPnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
  }
}

function isMarketOpen() {
  const now = new Date();
  // IST = UTC+5:30
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 3600000);
  const day = ist.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;
  const h = ist.getHours(), m = ist.getMinutes();
  const mins = h * 60 + m;
  // 555 = 9:15 AM (market open), 930 = 3:30 PM (market close) in IST
  return mins >= 555 && mins <= 930; // 9:15 AM – 3:30 PM
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  updateDashboardStats();
  renderPerfChart();
  renderSectorChart();
  renderTopMovers();
  renderRecentTrades();
  renderActiveStrategies();
}

function updateDashboardStats() {
  const { portfolioVal, invested, pnl, pnlPct } = calcPortfolioStats();
  setEl('statPortfolio', fmt(portfolioVal));
  setEl('statCash',      fmt(state.balance));
  setEl('statPnl',       fmtPnl(pnl));
  setEl('statReturn',    (pnlPct >= 0 ? '+' : '') + pnlPct.toFixed(2) + '%');
  setEl('statTrades',    state.trades.length.toString());
  setEl('statBotStatus', state.activeBot ? '● Running' : 'Idle');

  const pnlIcon = document.getElementById('pnlIcon');
  if (pnlIcon) pnlIcon.className = 'stat-icon ' + (pnl >= 0 ? 'green' : 'red');
  const retEl = document.getElementById('statReturn');
  if (retEl) retEl.style.color = pnlPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
  const pnlEl = document.getElementById('statPnl');
  if (pnlEl) pnlEl.style.color = pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
}

function calcPortfolioStats() {
  let invested = 0, portfolioVal = 0;
  Object.entries(state.portfolio).forEach(([sym, h]) => {
    const price = state.prices[sym]?.price || h.avgPrice;
    invested    += h.qty * h.avgPrice;
    portfolioVal += h.qty * price;
  });
  const pnl    = portfolioVal - invested;
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
  return { portfolioVal, invested, pnl, pnlPct };
}

function calcTotalPnl() {
  const { pnl } = calcPortfolioStats();
  const realisedPnl = state.trades
    .filter(t => t.type === 'SELL' && t.pnl !== undefined)
    .reduce((s, t) => s + (t.pnl || 0), 0);
  return pnl + realisedPnl;
}

function updateDashDate() {
  const el = document.getElementById('dashDate');
  if (!el) return;
  const d = new Date();
  el.textContent = d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}

// ---- Performance Chart ----
let perfChart = null;
let perfPeriod = '7d';

function setPerfPeriod(p, btn) {
  perfPeriod = p;
  document.querySelectorAll('.chart-actions .chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderPerfChart();
}

function renderPerfChart() {
  const canvas = document.getElementById('perfChart');
  if (!canvas) return;
  if (perfChart) { perfChart.destroy(); perfChart = null; }

  const { portfolioVal } = calcPortfolioStats();
  const base = state.totalDeposited || 100000;
  const points = perfPeriod === '7d' ? 7 : perfPeriod === '1m' ? 30 : 90;
  const labels = [], data = [];

  for (let i = points; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-IN', { day:'numeric', month:'short' }));
    if (i === 0) {
      data.push(+(state.balance + portfolioVal).toFixed(2));
    } else {
      const noise = (Math.random() - 0.48) * 0.02;
      const v = base * (1 + noise * (points - i) / points);
      data.push(+v.toFixed(2));
    }
  }

  // smooth it out
  for (let i = 1; i < data.length - 1; i++) {
    data[i] = +((data[i-1] + data[i] + data[i+1]) / 3).toFixed(2);
  }
  data[data.length - 1] = +(state.balance + portfolioVal).toFixed(2);

  const isUp = data[data.length-1] >= data[0];
  const color = isUp ? '#3fb950' : '#f85149';

  perfChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: color,
        backgroundColor: color + '18',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: {
        label: ctx => ' ₹' + fmtNum(ctx.parsed.y)
      }}},
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8b949e', maxTicksLimit: 8, font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8b949e', font: { size: 11 },
          callback: v => '₹' + fmtNum(v) } }
      }
    }
  });
}

// ---- Sector Chart ----
let sectorChart = null;

function renderSectorChart() {
  const canvas = document.getElementById('sectorChart');
  if (!canvas) return;
  if (sectorChart) { sectorChart.destroy(); sectorChart = null; }

  // Aggregate portfolio by sector
  const sectorMap = {};
  Object.entries(state.portfolio).forEach(([sym, h]) => {
    const price = state.prices[sym]?.price || h.avgPrice;
    const val = h.qty * price;
    const sector = h.sector || 'Other';
    sectorMap[sector] = (sectorMap[sector] || 0) + val;
  });

  // If empty, show sample
  if (Object.keys(sectorMap).length === 0) {
    const sample = { Technology:35, Banking:25, Energy:20, FMCG:10, Pharma:10 };
    Object.assign(sectorMap, sample);
  }

  const labels = Object.keys(sectorMap);
  const data   = Object.values(sectorMap);
  const colors = ['#1f6feb','#3fb950','#d29922','#8957e5','#39d3bb','#f85149','#e3b341','#388bfd','#2ea043','#da3633'];

  sectorChart = new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors.slice(0, labels.length), borderWidth: 0, hoverOffset: 8 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: { legend: { display: false }, tooltip: { callbacks: {
        label: ctx => ctx.label + ': ₹' + fmtNum(ctx.parsed)
      }}}
    }
  });

  // Legend
  const legendEl = document.getElementById('sectorLegend');
  if (legendEl) {
    legendEl.innerHTML = labels.map((l, i) =>
      `<div class="legend-item"><div class="legend-dot" style="background:${colors[i]}"></div>${l}</div>`
    ).join('');
  }
}

function renderTopMovers() {
  const el = document.getElementById('topMovers');
  if (!el) return;

  const movers = NSE_STOCKS.map(s => {
    const p = state.prices[s.sym];
    const chgPct = ((p.price - p.open) / p.open * 100);
    return { sym: s.sym, chgPct };
  }).sort((a, b) => Math.abs(b.chgPct) - Math.abs(a.chgPct)).slice(0, 6);

  el.innerHTML = movers.map(m => `
    <div class="mover-row">
      <span class="mover-sym">${m.sym}</span>
      <span class="mover-pct ${m.chgPct >= 0 ? 'up' : 'down'}">
        ${m.chgPct >= 0 ? '▲' : '▼'} ${Math.abs(m.chgPct).toFixed(2)}%
      </span>
    </div>
  `).join('');
}

function renderRecentTrades() {
  const el = document.getElementById('recentTradesList');
  if (!el) return;
  const recent = [...state.trades].reverse().slice(0, 6);
  if (!recent.length) {
    el.innerHTML = '<div class="empty-state">No trades yet.</div>';
    return;
  }
  el.innerHTML = recent.map(t => `
    <div class="rt-row">
      <span class="rt-badge ${t.type}">${t.type}</span>
      <span>${t.sym}</span>
      <span>${t.qty} × ${fmt(t.price)}</span>
      <span class="text-muted" style="font-size:11px;color:var(--text-muted)">${fmtDate(t.date)}</span>
    </div>
  `).join('');
}

function renderActiveStrategies() {
  const el = document.getElementById('activeStrategiesList');
  if (!el) return;
  if (!state.activeBot) {
    el.innerHTML = '<div class="empty-state">No active strategies. Start a bot from the Algo Bot page.</div>';
    return;
  }
  const strat = STRATEGIES.find(s => s.id === state.activeBot);
  el.innerHTML = `
    <div class="strategy-row">
      <span class="sr-dot"></span>
      <span>${strat ? strat.name : state.activeBot}</span>
      <span style="color:var(--accent-green);font-weight:600">${fmtPnl(state.botPnl)}</span>
    </div>
  `;
}

// ============================================================
// PORTFOLIO PAGE
// ============================================================
function renderPortfolio() {
  const { portfolioVal, invested, pnl, pnlPct } = calcPortfolioStats();
  setEl('portInvested', fmt(invested));
  setEl('portCurrent',  fmt(portfolioVal));
  setEl('portPnl',      fmtPnl(pnl));
  setEl('portDayChg',   (pnlPct >= 0 ? '+' : '') + pnlPct.toFixed(2) + '%');

  const pnlEl = document.getElementById('portPnl');
  if (pnlEl) pnlEl.style.color = pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
  const portPnlIcon = document.getElementById('portPnlIcon');
  if (portPnlIcon) portPnlIcon.className = 'stat-icon ' + (pnl >= 0 ? 'green' : 'red');

  const holdings = Object.entries(state.portfolio);
  setEl('holdingsCount', holdings.length + ' position' + (holdings.length !== 1 ? 's' : ''));

  const tbody = document.getElementById('holdingsTbody');
  if (!tbody) return;

  if (!holdings.length) {
    tbody.innerHTML = '<tr><td colspan="10" class="empty-row">No holdings yet. Buy stocks from Live Market.</td></tr>';
    return;
  }

  tbody.innerHTML = holdings.map(([sym, h]) => {
    const price = state.prices[sym]?.price || h.avgPrice;
    const val   = h.qty * price;
    const cost  = h.qty * h.avgPrice;
    const pl    = val - cost;
    const plPct = ((pl / cost) * 100).toFixed(2);
    return `
      <tr>
        <td><span class="sym-pill">${sym}</span></td>
        <td>${h.name}</td>
        <td><span class="sector-badge sb-${h.sector}">${h.sector}</span></td>
        <td>${h.qty}</td>
        <td>${fmt(h.avgPrice)}</td>
        <td class="price-cell" id="port-price-${sym}" style="font-weight:700">${fmt(price)}</td>
        <td>${fmt(val)}</td>
        <td class="${pl >= 0 ? 'up-text' : 'down-text'}">${fmtPnl(pl)}</td>
        <td class="${pl >= 0 ? 'up-text' : 'down-text'}">${pl >= 0 ? '+' : ''}${plPct}%</td>
        <td>
          <button class="btn-success" style="padding:4px 10px;font-size:12px" onclick="openTradeModal('${sym}','BUY')">Buy</button>
          &nbsp;
          <button class="btn-danger" style="padding:4px 10px;font-size:12px" onclick="openTradeModal('${sym}','SELL')">Sell</button>
        </td>
      </tr>
    `;
  }).join('');
}

function updatePortfolioPrices() {
  Object.keys(state.portfolio).forEach(sym => {
    const el = document.getElementById('port-price-' + sym);
    if (!el) return;
    const p = state.prices[sym];
    if (!p) return;
    const prev = +el.dataset.prev || p.prev;
    el.textContent = fmt(p.price);
    el.dataset.prev = p.price;
    el.parentElement.classList.remove('flash-up', 'flash-down');
    void el.parentElement.offsetWidth; // reflow
    el.parentElement.classList.add(p.price >= prev ? 'flash-up' : 'flash-down');
  });
}

// ============================================================
// LIVE MARKET PAGE
// ============================================================
let marketFilter = '';
let sectorFilterVal = '';

function renderMarket() {
  renderMarketTable('');
}

function filterStocks(val) {
  marketFilter = val.toLowerCase();
  sectorFilterVal = document.getElementById('sectorFilter')?.value || '';
  renderMarketTable(marketFilter);
}

function renderMarketTable(search) {
  const tbody = document.getElementById('marketTbody');
  if (!tbody) return;

  let stocks = NSE_STOCKS;
  if (search) stocks = stocks.filter(s =>
    s.sym.toLowerCase().includes(search) ||
    s.name.toLowerCase().includes(search)
  );
  if (sectorFilterVal) stocks = stocks.filter(s => s.sector === sectorFilterVal);

  tbody.innerHTML = stocks.map(s => {
    const p = state.prices[s.sym];
    const chg = +(p.price - p.open).toFixed(2);
    const chgPct = +((chg / p.open) * 100).toFixed(2);
    const held = state.portfolio[s.sym]?.qty || 0;
    return `
      <tr>
        <td><span class="sym-pill">${s.sym}</span></td>
        <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis">${s.name}</td>
        <td><span class="sector-badge sb-${s.sector}">${s.sector}</span></td>
        <td class="price-cell" id="mkt-${s.sym}" data-prev="${p.prev}" style="font-weight:700">${fmt(p.price)}</td>
        <td class="${chg >= 0 ? 'up-text' : 'down-text'}">${chg >= 0 ? '+' : ''}${fmt(Math.abs(chg))}</td>
        <td class="${chgPct >= 0 ? 'up-text' : 'down-text'}">${chgPct >= 0 ? '+' : ''}${chgPct}%</td>
        <td>${fmt(p.open)}</td>
        <td class="up-text">${fmt(p.high)}</td>
        <td class="down-text">${fmt(p.low)}</td>
        <td>${fmtVol(p.vol)}</td>
        <td>${fmt(s.high52)}</td>
        <td>${fmt(s.low52)}</td>
        <td>
          <button class="btn-success" style="padding:4px 10px;font-size:12px" onclick="openTradeModal('${s.sym}','BUY')">Buy</button>
          &nbsp;
          <button class="btn-danger" style="padding:4px 10px;font-size:12px;${held === 0 ? 'opacity:0.5;cursor:not-allowed' : ''}" onclick="openTradeModal('${s.sym}','SELL')" ${held === 0 ? 'disabled' : ''}>Sell${held > 0 ? ' ('+held+')' : ''}</button>
        </td>
      </tr>
    `;
  }).join('');
}

function updateLiveMarketPrices() {
  const page = document.getElementById('page-market');
  if (!page || !page.classList.contains('active')) return;

  NSE_STOCKS.forEach(s => {
    const el = document.getElementById('mkt-' + s.sym);
    if (!el) return;
    const p = state.prices[s.sym];
    const prev = +el.dataset.prev || p.prev;
    el.textContent = fmt(p.price);
    el.dataset.prev = p.price;
    const row = el.parentElement;
    row.classList.remove('flash-up', 'flash-down');
    void row.offsetWidth;
    row.classList.add(p.price >= prev ? 'flash-up' : 'flash-down');
  });
}

// ============================================================
// TRADE MODAL
// ============================================================
let tradeSym = '', tradeType = 'BUY';

function openTradeModal(sym, type) {
  tradeSym = sym;
  tradeType = type;

  const stock = NSE_STOCKS.find(s => s.sym === sym);
  const price = state.prices[sym]?.price || 0;
  const held  = state.portfolio[sym]?.qty || 0;

  setEl('tradeModalTitle', (type === 'BUY' ? 'Buy ' : 'Sell ') + sym);
  setEl('tm-symbol',  sym);
  setEl('tm-company', stock?.name || '');
  setEl('tm-ltp',     fmt(price));
  setEl('tm-balance', fmt(state.balance));

  const holdRow = document.getElementById('tm-holdingRow');
  if (holdRow) {
    holdRow.style.display = type === 'SELL' ? 'flex' : 'none';
    setEl('tm-holdings', held + ' shares');
  }

  const submitBtn = document.getElementById('tradeSubmitBtn');
  if (submitBtn) {
    submitBtn.textContent = type;
    submitBtn.className   = type === 'BUY' ? 'btn-success' : 'btn-danger';
  }

  // Reset form
  const qtyInput = document.getElementById('tradeQty');
  if (qtyInput) qtyInput.value = '1';
  document.querySelectorAll('input[name="orderType"]').forEach(r => { if(r.value==='MARKET') r.checked=true; });
  document.getElementById('limitPriceGroup').style.display = 'none';

  updateTradeValue();
  openModal('tradeModal');
}

function updateTradeValue() {
  const qty   = +(document.getElementById('tradeQty')?.value) || 0;
  const otype = document.querySelector('input[name="orderType"]:checked')?.value;
  const price = otype === 'LIMIT'
    ? +(document.getElementById('limitPrice')?.value) || 0
    : state.prices[tradeSym]?.price || 0;
  setEl('tm-value',   fmt(qty * price));
  setEl('tm-balance', fmt(state.balance));
}

function adjustQty(delta) {
  const input = document.getElementById('tradeQty');
  if (!input) return;
  const newVal = Math.max(1, +(input.value || 1) + delta);
  input.value = newVal;
  updateTradeValue();
}

function submitTrade() {
  const qty   = +(document.getElementById('tradeQty')?.value) || 0;
  const otype = document.querySelector('input[name="orderType"]:checked')?.value;
  const price = otype === 'LIMIT'
    ? +(document.getElementById('limitPrice')?.value) || 0
    : state.prices[tradeSym]?.price || 0;

  if (qty <= 0) { showToast('error', 'Invalid Qty', 'Enter a valid quantity.'); return; }
  if (price <= 0) { showToast('error', 'Invalid Price', 'Enter a valid price.'); return; }

  const ok = executeTrade(tradeSym, tradeType, qty, price, 'Manual');
  if (ok) closeModal('tradeModal');
}

function executeTrade(sym, type, qty, price, source = 'Manual') {
  const stock = NSE_STOCKS.find(s => s.sym === sym);
  const value = qty * price;

  if (type === 'BUY') {
    if (value > state.balance) {
      showToast('error', 'Insufficient Balance', `Need ${fmt(value)}, have ${fmt(state.balance)}`);
      return false;
    }
    state.balance -= value;
    if (state.portfolio[sym]) {
      const h = state.portfolio[sym];
      h.avgPrice = +((h.avgPrice * h.qty + value) / (h.qty + qty)).toFixed(2);
      h.qty += qty;
    } else {
      state.portfolio[sym] = { qty, avgPrice: price, sector: stock?.sector || 'Other', name: stock?.name || sym };
    }
    state.trades.push({ id: Date.now(), date: new Date().toISOString(), sym, type: 'BUY', qty, price, value, source });
    showToast('success', 'Order Executed', `Bought ${qty} ${sym} @ ${fmt(price)}`);
  } else {
    const held = state.portfolio[sym]?.qty || 0;
    if (qty > held) {
      showToast('error', 'Insufficient Holdings', `Hold ${held} shares, selling ${qty}`);
      return false;
    }
    const avgBuy = state.portfolio[sym]?.avgPrice || price;
    const pnl    = +(qty * (price - avgBuy)).toFixed(2);
    state.balance += value;
    state.portfolio[sym].qty -= qty;
    if (state.portfolio[sym].qty <= 0) delete state.portfolio[sym];
    state.trades.push({ id: Date.now(), date: new Date().toISOString(), sym, type: 'SELL', qty, price, value, source, pnl });
    showToast('success', 'Order Executed', `Sold ${qty} ${sym} @ ${fmt(price)} | P&L: ${fmtPnl(pnl)}`);
  }

  saveState();
  updateDashboardStats();
  return true;
}

// ============================================================
// ALGO BOT PAGE
// ============================================================
function renderBotPage() {
  const grid = document.getElementById('strategiesGrid');
  if (!grid) return;

  grid.innerHTML = STRATEGIES.map(s => {
    const isRunning = state.activeBot === s.id;
    return `
      <div class="strategy-card ${isRunning ? 'running' : ''}" id="sc-${s.id}">
        <div class="sc-header">
          <span class="sc-name">${s.name}</span>
          <span class="sc-badge ${isRunning ? 'running' : 'idle'}">${isRunning ? '● Running' : '○ Idle'}</span>
        </div>
        <p class="sc-desc">${s.desc}</p>
        <div class="sc-stats">
          <div class="sc-stat">
            <span class="sc-stat-label">Risk</span>
            <span class="sc-stat-val" style="color:${riskColor(s.risk)}">${s.risk}</span>
          </div>
          <div class="sc-stat">
            <span class="sc-stat-label">Trades</span>
            <span class="sc-stat-val" id="sc-trades-${s.id}">${isRunning ? state.botTrades : 0}</span>
          </div>
          <div class="sc-stat">
            <span class="sc-stat-label">P&L</span>
            <span class="sc-stat-val" id="sc-pnl-${s.id}" style="color:${state.botPnl>=0?'var(--accent-green)':'var(--accent-red)'}">${isRunning ? fmtPnl(state.botPnl) : '₹0.00'}</span>
          </div>
        </div>
        <div class="sc-controls">
          ${isRunning
            ? `<button class="btn-stop" onclick="stopBot()">■ Stop</button>`
            : `<button class="btn-start" onclick="startBot('${s.id}')">▶ Start</button>`
          }
        </div>
      </div>
    `;
  }).join('');

  updateBotStats();
}

function riskColor(r) {
  return r === 'Low' ? 'var(--accent-green)' : r === 'Medium' ? 'var(--accent-orange)' : 'var(--accent-red)';
}

function startBot(stratId) {
  if (state.balance < 5000) {
    showToast('warning', 'Insufficient Balance', 'Add at least ₹5,000 to run the bot.');
    return;
  }
  if (state.activeBot) stopBot();

  state.activeBot  = stratId;
  state.botTrades  = 0;
  state.botWins    = 0;
  state.botPnl     = 0;

  const strat = STRATEGIES.find(s => s.id === stratId);
  addBotLog(`[BOT] Started strategy: ${strat.name}`, 'info');

  state._botTimer = setInterval(() => botTick(), 4000);
  renderBotPage();
  updateBotStats();
  showToast('success', 'Bot Started', strat.name + ' is now running');
}

function stopBot() {
  if (state._botTimer) { clearInterval(state._botTimer); state._botTimer = null; }
  const strat = STRATEGIES.find(s => s.id === state.activeBot);
  addBotLog(`[BOT] Stopped strategy: ${strat ? strat.name : state.activeBot}`, 'warn');
  state.activeBot = null;
  renderBotPage();
  updateBotStats();
  showToast('info', 'Bot Stopped', 'Trading bot has been stopped');
}

function botTick() {
  if (!state.activeBot || state.balance < 500) return;

  const stratId = state.activeBot;
  const sym = NSE_STOCKS[Math.floor(Math.random() * NSE_STOCKS.length)].sym;
  const price = state.prices[sym]?.price || 100;
  const decision = makeBotDecision(stratId, sym);

  if (!decision) return;

  const { action, reason } = decision;
  const qty = Math.max(1, Math.floor((state.balance * 0.05) / price));

  if (action === 'BUY') {
    if (state.balance >= qty * price) {
      executeTrade(sym, 'BUY', qty, price, 'Bot');
      state.botTrades++;
      addBotLog(`[BOT BUY] ${sym} × ${qty} @ ${fmt(price)} — ${reason}`, 'buy');
    }
  } else if (action === 'SELL') {
    const held = state.portfolio[sym]?.qty || 0;
    if (held > 0) {
      const sellQty = Math.min(held, qty);
      const avgBuy  = state.portfolio[sym]?.avgPrice || price;
      const pnl = sellQty * (price - avgBuy);
      executeTrade(sym, 'SELL', sellQty, price, 'Bot');
      state.botTrades++;
      state.botPnl += pnl;
      if (pnl > 0) state.botWins++;
      addBotLog(`[BOT SELL] ${sym} × ${sellQty} @ ${fmt(price)} | P&L: ${fmtPnl(pnl)} — ${reason}`, 'sell');
    }
  }

  updateBotStats();
  saveState();
}

function makeBotDecision(stratId, sym) {
  const p = state.prices[sym];
  if (!p) return null;
  const chgPct = ((p.price - p.open) / p.open) * 100;
  const held = state.portfolio[sym]?.qty || 0;
  const r = Math.random();

  const STRATEGIES_LOGIC = {
    momentum:  () => {
      if (chgPct > 1.5 && r > 0.4) return { action:'BUY',  reason:'Momentum breakout above +1.5%' };
      if (chgPct < -1.5 && held > 0) return { action:'SELL', reason:'Momentum reversal below -1.5%' };
      return null;
    },
    mean_rev:  () => {
      if (chgPct < -2 && r > 0.3)  return { action:'BUY',  reason:'RSI oversold, mean reversion entry' };
      if (chgPct > 2  && held > 0)  return { action:'SELL', reason:'RSI overbought, take profit' };
      return null;
    },
    ai_decided:() => {
      if (r > 0.6) return { action: held > 0 ? 'SELL' : 'BUY', reason:'AI signal confidence 82%' };
      return null;
    },
    scalping:  () => {
      if (r > 0.5) return { action: held > 0 && r > 0.7 ? 'SELL' : 'BUY', reason:'Scalp signal on 1-min chart' };
      return null;
    },
    swing:     () => {
      if (chgPct > 0.8 && r > 0.5) return { action:'BUY',  reason:'MACD crossover, swing entry' };
      if (held > 0 && r > 0.7)      return { action:'SELL', reason:'Bollinger upper band reached' };
      return null;
    },
    breakout:  () => {
      if (p.price >= p.high * 0.998 && r > 0.4) return { action:'BUY',  reason:'Intraday high breakout' };
      if (held > 0 && chgPct < -1)               return { action:'SELL', reason:'Breakdown below support' };
      return null;
    },
    pairs:     () => {
      if (r > 0.6) return { action: held > 0 ? 'SELL' : 'BUY', reason:'Spread deviation signal' };
      return null;
    },
    vwap:      () => {
      if (chgPct < -0.5 && r > 0.5) return { action:'BUY',  reason:'Price below VWAP, long entry' };
      if (chgPct > 1.2  && held > 0) return { action:'SELL', reason:'Price above VWAP, exit' };
      return null;
    },
    overnight: () => {
      if (r > 0.7) return { action: held > 0 ? 'SELL' : 'BUY', reason:'SGX NIFTY overnight signal' };
      return null;
    }
  };

  const fn = STRATEGIES_LOGIC[stratId];
  return fn ? fn() : null;
}

function addBotLog(msg, cls = '') {
  const log = document.getElementById('botLog');
  if (!log) return;
  const ts = new Date().toLocaleTimeString('en-IN');
  const el = document.createElement('div');
  el.className = 'log-entry ' + cls;
  el.textContent = `[${ts}] ${msg}`;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
}

function clearBotLog() {
  const log = document.getElementById('botLog');
  if (log) log.innerHTML = '<div class="log-entry">Log cleared.</div>';
}

function updateBotStats() {
  setEl('botTrades', state.botTrades.toString());
  const pnlEl = document.getElementById('botPnl');
  if (pnlEl) {
    pnlEl.textContent = fmtPnl(state.botPnl);
    pnlEl.style.color = state.botPnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
  }
  const winRate = state.botTrades > 0 ? Math.round((state.botWins / state.botTrades) * 100) : 0;
  setEl('botWinRate', winRate + '%');
  const strat = STRATEGIES.find(s => s.id === state.activeBot);
  setEl('botActiveStrategy', strat ? strat.name : 'None');

  // Update botGlobalStatus dot
  const dot = document.getElementById('botStatusDot');
  const txt = document.getElementById('botStatusText');
  if (dot) dot.className = 'status-dot ' + (state.activeBot ? 'open' : 'closed');
  if (txt) txt.textContent = state.activeBot ? '● Bot Running' : '○ Bot Idle';
}

// ============================================================
// TRADE HISTORY PAGE
// ============================================================
function renderHistory() {
  const search  = (document.getElementById('histSearch')?.value || '').toLowerCase();
  const type    = document.getElementById('histType')?.value    || '';
  const source  = document.getElementById('histSource')?.value  || '';
  const fromStr = document.getElementById('histFrom')?.value    || '';
  const toStr   = document.getElementById('histTo')?.value      || '';

  let trades = [...state.trades].reverse();
  if (search) trades = trades.filter(t => t.sym.toLowerCase().includes(search));
  if (type)   trades = trades.filter(t => t.type === type);
  if (source) trades = trades.filter(t => t.source === source);
  if (fromStr) { const d = new Date(fromStr); trades = trades.filter(t => new Date(t.date) >= d); }
  if (toStr)   { const d = new Date(toStr); d.setHours(23,59,59); trades = trades.filter(t => new Date(t.date) <= d); }

  // Stats
  const buys   = trades.filter(t => t.type === 'BUY').length;
  const sells  = trades.filter(t => t.type === 'SELL').length;
  const pnl    = trades.filter(t => t.type === 'SELL' && t.pnl).reduce((s,t) => s + t.pnl, 0);
  setEl('histTotal', trades.length.toString());
  setEl('histBuys',  buys.toString());
  setEl('histSells', sells.toString());
  const histPnlEl = document.getElementById('histPnl');
  if (histPnlEl) {
    histPnlEl.textContent = fmtPnl(pnl);
    histPnlEl.style.color = pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
  }

  const tbody = document.getElementById('historyTbody');
  if (!tbody) return;

  if (!trades.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-row">No trades match the filter.</td></tr>';
    return;
  }

  tbody.innerHTML = trades.map((t, i) => `
    <tr>
      <td style="color:var(--text-muted)">${i + 1}</td>
      <td style="font-size:12px">${new Date(t.date).toLocaleString('en-IN')}</td>
      <td><span class="sym-pill">${t.sym}</span></td>
      <td><span class="rt-badge ${t.type}">${t.type}</span></td>
      <td>${t.qty}</td>
      <td>${fmt(t.price)}</td>
      <td>${fmt(t.value)}</td>
      <td style="font-size:12px;color:var(--text-muted)">${t.source}</td>
      <td class="${t.pnl !== undefined ? (t.pnl >= 0 ? 'up-text' : 'down-text') : 'neutral-text'}">
        ${t.pnl !== undefined ? fmtPnl(t.pnl) : '–'}
      </td>
    </tr>
  `).join('');
}

function clearHistoryFilters() {
  ['histSearch','histType','histSource','histFrom','histTo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderHistory();
}

// ============================================================
// ANNOUNCEMENTS PAGE
// ============================================================
function renderAnnouncements() {
  const filter = document.getElementById('annFilter')?.value || '';
  let data = ANNOUNCEMENTS_DATA;
  if (filter) data = data.filter(a => a.type === filter);

  const grid = document.getElementById('announcementsGrid');
  if (!grid) return;

  grid.innerHTML = data.map(a => `
    <div class="ann-card">
      <div class="ann-header">
        <span class="ann-type-badge ann-${a.type}">${a.type}</span>
        <span class="ann-date">${a.date}</span>
      </div>
      <div class="ann-company">${a.company} (${a.sym})</div>
      <div class="ann-title">${a.title}</div>
      <p class="ann-body">${a.body}</p>
    </div>
  `).join('');
}

// ============================================================
// ACCOUNT PAGE
// ============================================================
function renderAccount() {
  const { portfolioVal, invested } = calcPortfolioStats();
  const realisedPnl = state.trades
    .filter(t => t.type === 'SELL' && t.pnl !== undefined)
    .reduce((s, t) => s + (t.pnl || 0), 0);
  const buys  = state.trades.filter(t => t.type === 'BUY').length;
  const sells = state.trades.filter(t => t.type === 'SELL').length;

  setEl('accBalance',   fmt(state.balance));
  setEl('accInvested',  fmt(invested));
  setEl('accPortfolio', fmt(portfolioVal));
  setEl('accWealth',    fmt(state.balance + portfolioVal));
  setEl('accTrades',    state.trades.length.toString());
  setEl('accBuys',      buys.toString());
  setEl('accSells',     sells.toString());

  const accPnlEl = document.getElementById('accPnl');
  if (accPnlEl) {
    accPnlEl.textContent = fmtPnl(realisedPnl);
    accPnlEl.style.color = realisedPnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
  }
}

// ---- Fund Modal ----
let fundMode = 'deposit';

function openFundModal(mode) {
  fundMode = mode;
  setEl('fundModalTitle', mode === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds');
  setEl('fm-balance', fmt(state.balance));
  const submitBtn = document.getElementById('fundSubmitBtn');
  if (submitBtn) {
    submitBtn.textContent = mode === 'deposit' ? 'Deposit' : 'Withdraw';
    submitBtn.className   = mode === 'deposit' ? 'btn-primary' : 'btn-danger';
  }
  const input = document.getElementById('fundAmount');
  if (input) input.value = '';
  openModal('fundModal');
}

function setFundAmount(amt) {
  const input = document.getElementById('fundAmount');
  if (input) input.value = amt;
}

function submitFund() {
  const amt = +(document.getElementById('fundAmount')?.value) || 0;
  if (amt <= 0) { showToast('error', 'Invalid Amount', 'Enter a valid amount'); return; }

  if (fundMode === 'deposit') {
    state.balance += amt;
    state.totalDeposited = (state.totalDeposited || 0) + amt;
    showToast('success', 'Funds Deposited', fmt(amt) + ' added to your account');
  } else {
    if (amt > state.balance) {
      showToast('error', 'Insufficient Balance', `Only ${fmt(state.balance)} available`);
      return;
    }
    state.balance -= amt;
    showToast('success', 'Funds Withdrawn', fmt(amt) + ' withdrawn from your account');
  }

  saveState();
  closeModal('fundModal');
  renderAccount();
  updateTopBar();
  updateDashboardStats();
}

function confirmResetBalance() {
  if (confirm('Reset balance to ₹0? This will clear your available cash only. Holdings and trades remain.')) {
    state.balance = 0;
    saveState();
    renderAccount();
    updateTopBar();
    showToast('info', 'Balance Reset', 'Available balance reset to ₹0');
  }
}

// ============================================================
// SETTINGS PAGE
// ============================================================
function renderSettings() {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const toggle = document.getElementById('themeToggleSettings');
  if (toggle) toggle.checked = theme === 'light';

  const interval = document.getElementById('refreshInterval');
  if (interval) interval.value = state.refreshInterval.toString();
}

function toggleThemeFromSettings(cb) {
  setTheme(cb.checked ? 'light' : 'dark');
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('finoexpert_theme', theme);
  updateThemeUI();
  const toggle = document.getElementById('themeToggleSettings');
  if (toggle) toggle.checked = theme === 'light';
}

function updateThemeUI() {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const icon  = document.getElementById('themeIcon');
  if (icon) {
    icon.className = theme === 'dark' ? 'fa fa-moon' : 'fa fa-sun';
  }
}

window.toggleThemeFromSettings = toggleThemeFromSettings;
document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(cur === 'dark' ? 'light' : 'dark');
    });
  }
});

function updateRefreshInterval(val) {
  state.refreshInterval = +val;
  startPriceFeed();
  saveState();
  showToast('info', 'Refresh Updated', 'Price feed now refreshes every ' + (val/1000) + 's');
}

// ============================================================
// EXPORT
// ============================================================
function exportTrades(format) {
  if (!state.trades.length) { showToast('warning', 'No Trades', 'No trades to export'); return; }

  let content, mime, ext;
  if (format === 'csv') {
    const header = ['#','Date','Symbol','Type','Qty','Price','Value','Source','P&L'].join(',');
    const rows = state.trades.map((t, i) =>
      [i+1, new Date(t.date).toLocaleString('en-IN'), t.sym, t.type, t.qty, t.price, t.value, t.source, t.pnl ?? ''].join(',')
    );
    content = [header, ...rows].join('\n');
    mime = 'text/csv';
    ext  = 'csv';
  } else {
    content = JSON.stringify(state.trades, null, 2);
    mime = 'application/json';
    ext  = 'json';
  }

  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `finoexpert_trades_${new Date().toISOString().split('T')[0]}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('success', 'Export Done', `Trades exported as ${ext.toUpperCase()}`);
}

function exportPortfolio() {
  if (!Object.keys(state.portfolio).length) { showToast('warning', 'No Holdings', 'Portfolio is empty'); return; }
  const content = JSON.stringify(state.portfolio, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `finoexpert_portfolio_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('success', 'Export Done', 'Portfolio exported as JSON');
}

// ============================================================
// DATA RESET
// ============================================================
function resetAllData() {
  if (!confirm('⚠️ This will delete ALL trades, portfolio positions, and reset balance to ₹0. Are you sure?')) return;
  if (!confirm('Last warning! ALL data will be permanently deleted.')) return;

  state.balance        = 0;
  state.portfolio      = {};
  state.trades         = [];
  state.botTrades      = 0;
  state.botWins        = 0;
  state.botPnl         = 0;
  state.activeBot      = null;
  state.totalDeposited = 0;
  if (state._botTimer) { clearInterval(state._botTimer); state._botTimer = null; }

  saveState();
  renderAll();
  renderAccount();
  showToast('info', 'Data Reset', 'All data has been cleared');
}

// ============================================================
// MODAL HELPERS
// ============================================================
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(type, title, body) {
  const icons = { success:'fa-circle-check', error:'fa-circle-xmark', info:'fa-circle-info', warning:'fa-triangle-exclamation' };
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa ${icons[type] || 'fa-circle-info'} toast-icon"></i>
    <div class="toast-msg">
      <div class="toast-title">${title}</div>
      <div class="toast-body">${body}</div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ============================================================
// LOCAL STORAGE
// ============================================================
const STORAGE_KEY = 'finoexpert_v2';

function saveState() {
  try {
    const data = {
      balance:        state.balance,
      portfolio:      state.portfolio,
      trades:         state.trades,
      botTrades:      state.botTrades,
      botWins:        state.botWins,
      botPnl:         state.botPnl,
      activeBot:      state.activeBot,
      totalDeposited: state.totalDeposited,
      refreshInterval:state.refreshInterval
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch(e) {
    // Storage may be full or unavailable (e.g. private browsing mode)
    console.warn('Finoexpert: localStorage save failed:', e.message);
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(state, data);
    }
    const theme = localStorage.getItem('finoexpert_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch(e) {
    // localStorage may be unavailable (private mode, quota exceeded, etc.)
    console.warn('Finoexpert: localStorage load failed:', e.message);
  }
}

// ============================================================
// HELPERS
// ============================================================
function fmt(v) {
  if (v === undefined || v === null || isNaN(v)) return '₹0.00';
  return '₹' + (+v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtNum(v) {
  return (+v).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
function fmtPnl(v) {
  v = +v || 0;
  return (v >= 0 ? '+' : '') + fmt(v);
}
function fmtVol(v) {
  if (v >= 10000000) return (v/10000000).toFixed(2) + 'Cr';
  if (v >= 100000)   return (v/100000).toFixed(2) + 'L';
  if (v >= 1000)     return (v/1000).toFixed(1) + 'K';
  return v.toString();
}
function fmtDate(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
}
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', init);
