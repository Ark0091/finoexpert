const nseStocks = [
    { symbol: 'RELIANCE', price: 2860 },
    { symbol: 'TCS', price: 3935 },
    { symbol: 'INFY', price: 1542 },
    { symbol: 'HDFC', price: 1665 },
    { symbol: 'ICICI', price: 1178 },
    { symbol: 'WIPRO', price: 473 },
    { symbol: 'LT', price: 3612 },
    { symbol: 'ITC', price: 430 },
    { symbol: 'MARUTI', price: 12480 },
    { symbol: 'BAJAJ', price: 9150 },
    { symbol: 'SBIN', price: 812 },
    { symbol: 'ASIANPAINT', price: 2840 },
    { symbol: 'DMART', price: 4085 },
    { symbol: 'SUNPHARMA', price: 1673 },
    { symbol: 'HCLTECH', price: 1545 }
];

const strategies = [
    'Momentum',
    'RSI',
    'MACD',
    'Bollinger Bands',
    'SMA Cross',
    'Stochastic',
    'ADX',
    'CCI',
    'Williams %R'
];

const startingBalance = 100000;
let accountBalance = startingBalance;
let portfolio = {};
let tradeHistory = [];

function saveData() {
    localStorage.setItem('finoexpertData', JSON.stringify({ accountBalance, portfolio, tradeHistory }));
}

function loadData() {
    const data = JSON.parse(localStorage.getItem('finoexpertData') || '{}');
    accountBalance = Number.isFinite(data.accountBalance) ? data.accountBalance : startingBalance;
    portfolio = data.portfolio && typeof data.portfolio === 'object' ? data.portfolio : {};
    tradeHistory = Array.isArray(data.tradeHistory) ? data.tradeHistory : [];
}

function formatINR(value) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);
}

function nowTs() {
    return new Date().toLocaleString('en-IN');
}

function switchSection(sectionId) {
    document.querySelectorAll('.section').forEach((section) => section.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach((btn) => btn.classList.remove('active'));
    document.getElementById(sectionId)?.classList.add('active');
    document.querySelector(`.nav-btn[data-section="${sectionId}"]`)?.classList.add('active');
    renderAll();
}

function getStock(symbol) {
    return nseStocks.find((stock) => stock.symbol === symbol);
}

function buy(symbol, quantity) {
    const qty = Number(quantity);
    const stock = getStock(symbol);
    if (!stock || !Number.isInteger(qty) || qty <= 0) {
        return { ok: false, message: 'Enter a valid stock and quantity.' };
    }

    const totalCost = stock.price * qty;
    if (totalCost > accountBalance) {
        return { ok: false, message: 'Insufficient balance.' };
    }

    const existing = portfolio[symbol] || { quantity: 0, avgPrice: 0 };
    const newQuantity = existing.quantity + qty;
    const newAvg = ((existing.quantity * existing.avgPrice) + totalCost) / newQuantity;

    portfolio[symbol] = { quantity: newQuantity, avgPrice: newAvg };
    accountBalance -= totalCost;
    tradeHistory.unshift({
        action: 'BUY',
        symbol,
        quantity: qty,
        price: stock.price,
        amount: totalCost,
        pnl: 0,
        timestamp: nowTs()
    });

    saveData();
    renderAll();
    return { ok: true, message: `Bought ${qty} ${symbol} @ ${formatINR(stock.price)}` };
}

function sell(symbol, quantity) {
    const qty = Number(quantity);
    const stock = getStock(symbol);
    const holding = portfolio[symbol];
    if (!stock || !holding || !Number.isInteger(qty) || qty <= 0) {
        return { ok: false, message: 'Invalid sell request.' };
    }
    if (holding.quantity < qty) {
        return { ok: false, message: 'Not enough shares to sell.' };
    }

    const revenue = stock.price * qty;
    const costBasis = holding.avgPrice * qty;
    const pnl = revenue - costBasis;

    holding.quantity -= qty;
    if (holding.quantity === 0) {
        delete portfolio[symbol];
    }

    accountBalance += revenue;
    tradeHistory.unshift({
        action: 'SELL',
        symbol,
        quantity: qty,
        price: stock.price,
        amount: revenue,
        pnl,
        timestamp: nowTs()
    });

    saveData();
    renderAll();
    return { ok: true, message: `Sold ${qty} ${symbol} | P&L ${formatINR(pnl)}` };
}

function handleBuy(symbolId, qtyId) {
    const symbol = document.getElementById(symbolId).value;
    const qty = document.getElementById(qtyId).value;
    setTradeMessage(buy(symbol, qty));
}

function handleSell(symbolId, qtyId) {
    const symbol = document.getElementById(symbolId).value;
    const qty = document.getElementById(qtyId).value;
    setTradeMessage(sell(symbol, qty));
}

function setTradeMessage(result) {
    const el = document.getElementById('tradeMessage');
    if (!el) return;
    el.textContent = result.message;
    el.className = result.ok ? 'success' : 'danger';
}

function getPortfolioStats() {
    let invested = 0;
    let value = 0;

    Object.keys(portfolio).forEach((symbol) => {
        const hold = portfolio[symbol];
        const currentPrice = getStock(symbol)?.price || 0;
        invested += hold.avgPrice * hold.quantity;
        value += currentPrice * hold.quantity;
    });

    return {
        invested,
        value,
        pnl: value - invested,
        positions: Object.keys(portfolio).length
    };
}

function renderTickers() {
    document.getElementById('sensexTicker').textContent = '79,842.30 (+0.52%)';
    document.getElementById('niftyTicker').textContent = '24,295.20 (+0.47%)';
    document.getElementById('vixTicker').textContent = '12.68 (-0.30%)';
}

function renderMarket() {
    const rows = nseStocks.map((stock, index) => `
        <tr>
            <td>${stock.symbol}</td>
            <td>${formatINR(stock.price)}</td>
            <td>
                <input id="qty-${index}" type="number" min="1" value="1" style="width:80px;" />
                <button class="use-market-btn" data-index="${index}">Use</button>
            </td>
        </tr>`).join('');

    document.getElementById('marketTable').innerHTML = `<table><thead><tr><th>Stock</th><th>Price</th><th>Trade</th></tr></thead><tbody>${rows}</tbody></table>`;
    document.querySelectorAll('.use-market-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const index = Number(button.dataset.index);
            const stock = nseStocks[index];
            if (stock) {
                setQuickFromMarket(stock.symbol, `qty-${index}`);
            }
        });
    });
}

function setQuickFromMarket(symbol, qtyInputId) {
    document.getElementById('quickSymbol').value = symbol;
    document.getElementById('quickQty').value = document.getElementById(qtyInputId).value || 1;
    switchSection('dashboard');
}

function renderPortfolio() {
    const entries = Object.entries(portfolio);
    if (!entries.length) {
        document.getElementById('portfolioTable').innerHTML = '<p class="muted">No holdings yet.</p>';
        return;
    }

    const rows = entries.map(([symbol, hold]) => {
        const current = getStock(symbol)?.price || 0;
        const value = current * hold.quantity;
        const pnl = (current - hold.avgPrice) * hold.quantity;
        return `<tr>
            <td>${symbol}</td>
            <td>${hold.quantity}</td>
            <td>${formatINR(hold.avgPrice)}</td>
            <td>${formatINR(current)}</td>
            <td>${formatINR(value)}</td>
            <td class="${pnl >= 0 ? 'success' : 'danger'}">${formatINR(pnl)}</td>
        </tr>`;
    }).join('');

    document.getElementById('portfolioTable').innerHTML = `<table><thead><tr><th>Stock</th><th>Qty</th><th>Avg Buy</th><th>Current</th><th>Value</th><th>P&L</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderHistory() {
    if (!tradeHistory.length) {
        document.getElementById('historyTable').innerHTML = '<p class="muted">No trades yet.</p>';
        return;
    }

    const rows = tradeHistory.map((trade) => `<tr>
        <td>${trade.timestamp}</td>
        <td>${trade.action}</td>
        <td>${trade.symbol}</td>
        <td>${trade.quantity}</td>
        <td>${formatINR(trade.price)}</td>
        <td>${formatINR(trade.amount)}</td>
        <td class="${trade.pnl >= 0 ? 'success' : 'danger'}">${formatINR(trade.pnl)}</td>
    </tr>`).join('');

    document.getElementById('historyTable').innerHTML = `<table><thead><tr><th>Time</th><th>Action</th><th>Symbol</th><th>Qty</th><th>Price</th><th>Amount</th><th>P&L</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderBots() {
    const container = document.getElementById('botStrategies');
    container.innerHTML = '';
    strategies.forEach((name) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = name;
        button.addEventListener('click', () => runBotStrategy(name));
        container.appendChild(button);
    });
}

function runBotStrategy(strategy) {
    const pick = nseStocks[Math.floor(Math.random() * nseStocks.length)];
    document.getElementById('botOutput').textContent = `${strategy} signal: Watch ${pick.symbol} near ${formatINR(pick.price)} (${nowTs()})`;
}

function renderAnnouncements() {
    document.getElementById('announcementList').innerHTML = [
        'Welcome to Finoexpert live trading simulator.',
        'Risk alert: Always size positions responsibly.',
        'Export your trade history from the History tab.'
    ].map((item) => `<li>${item}</li>`).join('');
}

function renderSummary() {
    const stats = getPortfolioStats();
    document.getElementById('balanceDisplay').textContent = formatINR(accountBalance);
    document.getElementById('accountBalance').textContent = formatINR(accountBalance);
    document.getElementById('portfolioValue').textContent = formatINR(stats.value);
    document.getElementById('investedValue').textContent = formatINR(stats.invested);
    document.getElementById('positionsCount').textContent = String(stats.positions);
    const pnlEl = document.getElementById('overallPnl');
    pnlEl.textContent = formatINR(stats.pnl);
    pnlEl.className = stats.pnl >= 0 ? 'success' : 'danger';
}

function exportToCSV() {
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = ['timestamp,action,symbol,quantity,price,amount,pnl'];
    tradeHistory.forEach((t) => rows.push(
        [
            t.timestamp,
            t.action,
            t.symbol,
            t.quantity,
            t.price,
            t.amount,
            t.pnl
        ].map(escapeCsv).join(',')
    ));
    downloadFile('trade-history.csv', rows.join('\n'), 'text/csv');
}

function exportToJSON() {
    downloadFile('trade-history.json', JSON.stringify(tradeHistory, null, 2), 'application/json');
}

function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetData() {
    accountBalance = startingBalance;
    portfolio = {};
    tradeHistory = [];
    saveData();
    renderAll();
    setTradeMessage({ ok: true, message: 'Account reset successfully.' });
}

function setupQuickTradeSelect() {
    const options = nseStocks.map((stock) => `<option value="${stock.symbol}">${stock.symbol} (${formatINR(stock.price)})</option>`).join('');
    document.getElementById('quickSymbol').innerHTML = options;
}

function renderAll() {
    renderTickers();
    renderSummary();
    renderPortfolio();
    renderMarket();
    renderHistory();
    renderBots();
    renderAnnouncements();
}

loadData();
setupQuickTradeSelect();
renderAll();
window.switchSection = switchSection;
window.handleBuy = handleBuy;
window.handleSell = handleSell;
window.setQuickFromMarket = setQuickFromMarket;
window.runBotStrategy = runBotStrategy;
window.exportToCSV = exportToCSV;
window.exportToJSON = exportToJSON;
window.resetData = resetData;
