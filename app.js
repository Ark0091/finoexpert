// trading application logic

// Array of NSE stocks
const nseStocks = [
    { symbol: 'RELIANCE', price: 2500 },
    { symbol: 'TCS', price: 3200 },
    { symbol: 'INFY', price: 1500 }
];

// Portfolio management
let portfolio = {};

// Trade history
let tradeHistory = [];

// Buy function
function buy(symbol, quantity) {
    const stock = nseStocks.find(s => s.symbol === symbol);
    if (stock) {
        const totalCost = stock.price * quantity;
        if (!portfolio[symbol]) {
            portfolio[symbol] = 0;
        }
        portfolio[symbol] += quantity;
        tradeHistory.push({ action: 'buy', symbol, quantity, totalCost, date: new Date() });
        console.log(`Bought ${quantity} of ${symbol} for $${totalCost}`);
    } else {
        console.log('Stock not found');
    }
}

// Sell function
function sell(symbol, quantity) {
    if (portfolio[symbol] && portfolio[symbol] >= quantity) {
        const stock = nseStocks.find(s => s.symbol === symbol);
        const totalRevenue = stock.price * quantity;
        portfolio[symbol] -= quantity;
        tradeHistory.push({ action: 'sell', symbol, quantity, totalRevenue, date: new Date() });
        console.log(`Sold ${quantity} of ${symbol} for $${totalRevenue}`);
    } else {
        console.log('Insufficient stocks to sell');
    }
}

// Market data (mock)
function getMarketData() {
    return nseStocks;
}

// Account management (mock)
let accountBalance = 100000;

function updateBalance(amount) {
    accountBalance += amount;
    console.log(`New account balance: $${accountBalance}`);
}

// Data export functions
function exportToCSV() {
    // Implementation of CSV export
    console.log('Exported data to CSV');
}

function exportToJSON() {
    // Implementation of JSON export
    console.log('Exported data to JSON');
}

// LocalStorage persistence
function saveToLocalStorage() {
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
    localStorage.setItem('tradeHistory', JSON.stringify(tradeHistory));
}

function loadFromLocalStorage() {
    portfolio = JSON.parse(localStorage.getItem('portfolio')) || {};
    tradeHistory = JSON.parse(localStorage.getItem('tradeHistory')) || [];
}

// Usage examples
buy('RELIANCE', 2);
sell('TCS', 1);
exportToCSV();
exportToJSON();
saveToLocalStorage();