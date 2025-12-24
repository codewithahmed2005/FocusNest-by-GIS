// features.js - All 14 features in one file

// ===== 1. BOOKMARKS MANAGER =====
const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [
    { name: "Gmail", url: "https://mail.google.com", icon: "📧" },
    { name: "Calendar", url: "https://calendar.google.com", icon: "📅" },
    { name: "Drive", url: "https://drive.google.com", icon: "💾" },
    { name: "GitHub", url: "https://github.com", icon: "💻" },
    { name: "YouTube", url: "https://youtube.com", icon: "🎬" },
    { name: "ChatGPT", url: "https://chat.openai.com", icon: "🤖" }
];

function renderBookmarks() {
    const container = document.getElementById('bookmarks-container');
    if (!container) return;
    
    container.innerHTML = bookmarks.map((bm, i) => `
        <div class="bookmark-card" onclick="window.open('${bm.url}', '_blank')">
            <div class="bookmark-icon">${bm.icon}</div>
            <h4>${bm.name}</h4>
            <button class="delete-btn" onclick="deleteBookmark(${i}); event.stopPropagation();">×</button>
        </div>
    `).join('');
}

function addBookmark() {
    const name = prompt("Bookmark name:");
    const url = prompt("URL (with https://):");
    if (name && url) {
        bookmarks.push({ name, url, icon: "🔗" });
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        renderBookmarks();
    }
}

function deleteBookmark(index) {
    if (confirm("Delete this bookmark?")) {
        bookmarks.splice(index, 1);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        renderBookmarks();
    }
}

// ===== 2. POMODORO TIMER =====
let pomodoroTime = 25 * 60;
let isPomodoroRunning = false;
let pomodoroInterval;
let sessionCount = 0;

function startPomodoro() {
    if (!isPomodoroRunning) {
        pomodoroInterval = setInterval(() => {
            pomodoroTime--;
            updatePomodoroDisplay();
            if (pomodoroTime <= 0) {
                clearInterval(pomodoroInterval);
                sessionCount++;
                alert(`🎉 Pomodoro ${sessionCount} completed! ${sessionCount % 4 === 0 ? 'Take a 15-minute break!' : 'Take a 5-minute break!'}`);
                resetPomodoro();
            }
        }, 1000);
        isPomodoroRunning = true;
        document.getElementById('pomodoro-btn').textContent = "Pause";
    } else {
        clearInterval(pomodoroInterval);
        isPomodoroRunning = false;
        document.getElementById('pomodoro-btn').textContent = "Resume";
    }
}

function resetPomodoro() {
    clearInterval(pomodoroInterval);
    pomodoroTime = 25 * 60;
    isPomodoroRunning = false;
    document.getElementById('pomodoro-btn').textContent = "Start";
    updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
    const display = document.getElementById('pomodoro-display');
    if (display) {
        const min = Math.floor(pomodoroTime / 60);
        const sec = pomodoroTime % 60;
        display.textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }
}

// ===== 3. HABIT TRACKER =====
const habits = JSON.parse(localStorage.getItem('habits')) || [
    { name: "Exercise", color: "#10b981", streak: 0, days: [] },
    { name: "Read", color: "#8b5cf6", streak: 0, days: [] },
    { name: "Meditate", color: "#3b82f6", streak: 0, days: [] },
    { name: "Code", color: "#f59e0b", streak: 0, days: [] }
];

function renderHabits() {
    const container = document.getElementById('habits-container');
    if (!container) return;
    
    const today = new Date().toDateString();
    
    container.innerHTML = habits.map((habit, i) => {
        const isDoneToday = habit.days.includes(today);
        return `
        <div class="habit-card" style="border-left: 4px solid ${habit.color}">
            <h4>${habit.name}</h4>
            <div class="habit-streak">🔥 ${habit.streak} days</div>
            <button class="${isDoneToday ? 'done' : ''}" 
                    onclick="markHabitDone(${i})">
                ${isDoneToday ? '✅ Done' : 'Mark Done'}
            </button>
        </div>
        `;
    }).join('');
}

function markHabitDone(index) {
    const today = new Date().toDateString();
    const habit = habits[index];
    
    if (!habit.days.includes(today)) {
        habit.days.push(today);
        habit.streak++;
        localStorage.setItem('habits', JSON.stringify(habits));
        renderHabits();
    }
}

// ===== 4. QUICK CALCULATOR =====
function appendToCalc(value) {
    const input = document.getElementById('calc-input');
    if (input) input.value += value;
}

function clearCalc() {
    const input = document.getElementById('calc-input');
    if (input) input.value = '';
}

function calculateResult() {
    const input = document.getElementById('calc-input');
    if (!input) return;
    
    try {
        input.value = eval(input.value) || 'Error';
    } catch {
        input.value = 'Error';
    }
}

// ===== 5. DAILY QUOTE =====
const quotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Productivity is never an accident. - Paul J. Meyer",
    "Focus on being productive instead of busy. - Tim Ferriss",
    "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
    "The future depends on what you do today. - Mahatma Gandhi",
    "Do what you can, with what you have, where you are. - Theodore Roosevelt",
    "Small daily improvements lead to stunning results. - Unknown",
    "Don't count the days, make the days count. - Muhammad Ali"
];

function getDailyQuote() {
    const today = new Date().getDate();
    return quotes[today % quotes.length];
}

// ===== 6. EXPENSE TRACKER =====
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

function addExpense() {
    const amount = parseFloat(prompt("Amount:"));
    const category = prompt("Category (Food/Transport/Entertainment/Bills):");
    const note = prompt("Note (optional):");
    
    if (amount && category) {
        const expense = {
            date: new Date().toLocaleDateString(),
            amount,
            category,
            note: note || ""
        };
        
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateExpenseSummary();
    }
}

function updateExpenseSummary() {
    const summary = document.getElementById('expense-summary');
    if (!summary) return;
    
    const today = new Date().toLocaleDateString();
    const todayExpenses = expenses.filter(e => e.date === today);
    const total = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    summary.innerHTML = `
        <h4>💰 Today's Expenses</h4>
        <div class="expense-total">₹${total.toFixed(2)}</div>
        <small>${todayExpenses.length} transactions</small>
        <button onclick="addExpense()">Add Expense</button>
        <button onclick="viewAllExpenses()" class="secondary">View All</button>
    `;
}

function viewAllExpenses() {
    alert(expenses.map(e => `${e.date}: ₹${e.amount} - ${e.category}`).join('\n') || 'No expenses yet');
}

// ===== 7. SCREEN TIME TRACKER =====
let screenTime = parseInt(localStorage.getItem('screenTime')) || 0;

function startScreenTimeTracker() {
    setInterval(() => {
        screenTime++;
        localStorage.setItem('screenTime', screenTime);
        
        if (screenTime % 60 === 0) {
            showNotification("⏰ Screen Time Alert", `You've been active for ${screenTime/60} hours. Take a break!`);
        }
    }, 60000); // Update every minute
}

// ===== 8. UNIT CONVERTER =====
function convertUnit() {
    const value = parseFloat(document.getElementById('unit-value')?.value) || 0;
    const fromUnit = document.getElementById('unit-from')?.value;
    const toUnit = document.getElementById('unit-to')?.value;
    
    const conversions = {
        km_mi: 0.621371,
        kg_lb: 2.20462,
        cm_in: 0.393701,
        l_gal: 0.264172
    };
    
    let result = value;
    if (fromUnit === 'km' && toUnit === 'mi') result = value * conversions.km_mi;
    if (fromUnit === 'mi' && toUnit === 'km') result = value / conversions.km_mi;
    if (fromUnit === 'kg' && toUnit === 'lb') result = value * conversions.kg_lb;
    if (fromUnit === 'lb' && toUnit === 'kg') result = value / conversions.kg_lb;
    
    document.getElementById('unit-result').textContent = result.toFixed(2);
}

// ===== 9. DAILY JOURNAL =====
function saveJournal() {
    const entry = document.getElementById('journal-entry')?.value;
    if (entry) {
        const date = new Date().toISOString().split('T')[0];
        const journals = JSON.parse(localStorage.getItem('journals')) || {};
        journals[date] = entry;
        localStorage.setItem('journals', JSON.stringify(journals));
        alert('Journal saved!');
    }
}

function loadTodayJournal() {
    const date = new Date().toISOString().split('T')[0];
    const journals = JSON.parse(localStorage.getItem('journals')) || {};
    const textarea = document.getElementById('journal-entry');
    if (textarea) {
        textarea.value = journals[date] || '';
    }
}

// ===== 10. FOCUS MODE =====
let focusMode = false;

function toggleFocusMode() {
    focusMode = !focusMode;
    const btn = document.getElementById('focus-btn');
    
    if (focusMode) {
        document.body.classList.add('focus-mode');
        btn.textContent = "Disable Focus Mode";
        showNotification("🔕 Focus Mode Enabled", "Distractions minimized!");
    } else {
        document.body.classList.remove('focus-mode');
        btn.textContent = "Enable Focus Mode";
    }
}

// ===== 11. QUICK SEARCH =====
function performSearch() {
    const query = document.getElementById('search-query')?.value;
    const engine = document.getElementById('search-engine')?.value;
    
    if (query) {
        const urls = {
            google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
            github: `https://github.com/search?q=${encodeURIComponent(query)}`,
            wikipedia: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`
        };
        
        window.open(urls[engine], '_blank');
    }
}

// ===== 12. AMBIENT SOUNDS =====
let currentAudio = null;

function playSound(sound) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    
    // Create audio elements dynamically
    currentAudio = new Audio();
    
    // For demo, we'll use Web Audio API to generate sounds
    if (sound === 'rain') playRainSound();
    if (sound === 'forest') playForestSound();
    if (sound === 'white') playWhiteNoise();
}

function playRainSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // Simplified rain sound simulation
    alert("🌧️ Rain sound playing (demo mode)");
}

function stopSound() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
}

// ===== 13. TIME ZONE CONVERTER =====
function updateWorldClocks() {
    const now = new Date();
    const timeZones = [
        { city: "New York", offset: -5 },
        { city: "London", offset: 0 },
        { city: "Tokyo", offset: +9 },
        { city: "Mumbai", offset: +5.5 },
        { city: "Sydney", offset: +11 }
    ];
    
    const clocksDiv = document.getElementById('world-clocks');
    if (clocksDiv) {
        clocksDiv.innerHTML = timeZones.map(tz => {
            const time = new Date(now.getTime() + (tz.offset * 60 * 60 * 1000));
            return `
                <div class="clock-card">
                    <div class="city">${tz.city}</div>
                    <div class="time">${time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
            `;
        }).join('');
    }
}

// ===== 14. GOAL TRACKER =====
const goals = JSON.parse(localStorage.getItem('goals')) || [
    { title: "Learn JavaScript", progress: 65, deadline: "2024-12-31" },
    { title: "Exercise Daily", progress: 30, deadline: "2024-11-30" },
    { title: "Read 12 Books", progress: 42, deadline: "2024-12-31" }
];

function renderGoals() {
    const container = document.getElementById('goals-container');
    if (!container) return;
    
    container.innerHTML = goals.map((goal, i) => `
        <div class="goal-card">
            <h4>${goal.title}</h4>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${goal.progress}%"></div>
            </div>
            <div class="progress-text">${goal.progress}% complete</div>
            <div class="deadline">📅 ${goal.deadline}</div>
            <button onclick="updateGoalProgress(${i})">+10%</button>
        </div>
    `).join('');
}

function updateGoalProgress(index) {
    if (goals[index].progress < 100) {
        goals[index].progress += 10;
        if (goals[index].progress > 100) goals[index].progress = 100;
        localStorage.setItem('goals', JSON.stringify(goals));
        renderGoals();
    }
}

// ===== INITIALIZE EVERYTHING =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    renderBookmarks();
    updatePomodoroDisplay();
    renderHabits();
    updateExpenseSummary();
    loadTodayJournal();
    updateWorldClocks();
    renderGoals();
    
    // Start background services
    startScreenTimeTracker();
    setInterval(updateWorldClocks, 60000);
    
    // Show daily quote
    const quoteEl = document.getElementById('daily-quote');
    if (quoteEl) {
        quoteEl.textContent = getDailyQuote();
    }
});

// ===== NOTIFICATION SYSTEM =====
function showNotification(title, message) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body: message });
    }
    
    // Fallback: alert
    console.log(`🔔 ${title}: ${message}`);
}

/* ===== THEME TOGGLE SYSTEM ===== */
function initTheme() {
    // Check saved theme or prefer color scheme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
    
    // Setup toggle button
    setupThemeToggle();
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeButton(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Optional: Add transition effect
    document.documentElement.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.documentElement.style.transition = '';
    }, 300);
}

function updateThemeButton(theme) {
    const themeIcon = document.getElementById('themeIcon');
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeIcon || !themeToggle) return;
    
    if (theme === 'dark') {
        themeIcon.textContent = '☀️';
        themeToggle.innerHTML = '<span id="themeIcon">☀️</span> Light';
    } else {
        themeIcon.textContent = '🌙';
        themeToggle.innerHTML = '<span id="themeIcon">🌙</span> Dark';
    }
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        // Remove any existing onclick
        themeToggle.onclick = null;
        
        // Add new event listener
        themeToggle.addEventListener('click', toggleTheme);
        
        // Also support Enter key
        themeToggle.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') toggleTheme();
        });
    }
    
    // Also add theme toggle to all pages if missing
    document.querySelectorAll('header .topbar div').forEach(headerDiv => {
        if (!headerDiv.querySelector('.theme-btn')) {
            const btn = document.createElement('button');
            btn.className = 'theme-btn';
            btn.id = 'themeToggle';
            btn.innerHTML = '<span id="themeIcon">🌙</span> Dark';
            btn.addEventListener('click', toggleTheme);
            headerDiv.appendChild(btn);
        }
    });
}

/* ===== PREFERS COLOR SCHEME DETECTION ===== */
function watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set theme
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

/* ===== INITIALIZE ON PAGE LOAD ===== */
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    watchSystemTheme();
    
    // Also check on window load
    window.addEventListener('load', initTheme);
});

// Make functions globally available
window.toggleTheme = toggleTheme;
window.setTheme = setTheme;