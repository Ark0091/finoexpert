// app.js

// Fetch NSE prices from Yahoo Finance API
async function fetchNSEPrices() {
    const response = await fetch('https://finance.yahoo.com/quote/%5ENSEI', { method: 'GET' });
    const data = await response.json();
    return {  
        sensex: data.price.regularMarketPrice,
        nifty50: data.quoteSummary["NSE:NIFTY"]?.price?.regularMarketPrice || 0,
        vix: data.quoteSummary["NSE:VIX"]?.price?.regularMarketPrice || 0
    };
};

// Trading logic
let portfolio = [];
let tradeHistory = [];
let balance = 100000; // Starting balance

function buy(stock, amount) {
    portfolio.push({ stock, amount });
    tradeHistory.push({ type: 'buy', stock, amount, date: new Date() });
    balance -= amount;
}

function sell(stock, amount) {
    const index = portfolio.findIndex(item => item.stock === stock);
    if(index >= 0) {
        portfolio.splice(index, 1);
        tradeHistory.push({ type: 'sell', stock, amount, date: new Date() });
        balance += amount;
    }
}

// Algo bot strategies
const algoBots = {
    bot1: function() { /* strategy implementation */ },
    bot2: function() { /* strategy implementation */ },
    // Additional bots can be added here
};

// Data export
function exportData(format) {
    const data = { portfolio, tradeHistory, balance };
    let exportedData;  
    if(format === 'CSV') {
        exportedData = toCSV(data);
    } else {
        exportedData = JSON.stringify(data);
    }
    return exportedData;
}

function toCSV(data) {
    // Logic for converting JSON to CSV
    return ''; // Placeholder
}

// Local storage persistence
function saveToLocalStorage() {
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
    localStorage.setItem('tradeHistory', JSON.stringify(tradeHistory));
}

// Load data from local storage
function loadFromLocalStorage() {
    portfolio = JSON.parse(localStorage.getItem('portfolio')) || [];
    tradeHistory = JSON.parse(localStorage.getItem('tradeHistory')) || [];
}

// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Event handlers
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

// Fetching prices
fetchNSEPrices().then(prices => {
    console.log(prices);
    // Update UI with fetched prices
});

// Load existing data on startup
loadFromLocalStorage();