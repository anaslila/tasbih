// ========================
// Global State & Variables
// ========================
let counter = 0;
let target = 11;
let startTime = null;
let timestamps = [];
let currentCounterId = 'default';
let currentView = 'counter';
let deferredPrompt = null;

// Settings
let settings = {
    vibration: true,
    sound: false,
    milestoneVibe: true,
    notifications: false,
    targetNotify: false,
    fullscreen: false
};

// ========================
// DOM Elements
// ========================
const mechanicalCounter = document.getElementById('mechanicalCounter');
const tapArea = document.getElementById('tapArea');
const resetBtn = document.getElementById('resetBtn');
const minusBtn = document.getElementById('minusBtn');
const saveSessionBtn = document.getElementById('saveSessionBtn');
const tasbihSelect = document.getElementById('tasbihSelect');
const customDhikr = document.getElementById('customDhikr');
const lapValue = document.getElementById('lapValue');
const counterLabel = document.getElementById('counterLabel');

// Navigation
const menuBtn = document.getElementById('menuBtn');
const closeMenu = document.getElementById('closeMenu');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');
const themeToggle = document.getElementById('themeToggle');
const themeCircle = document.getElementById('themeCircle');

// Stats
const progressStat = document.getElementById('progressStat');
const speedStat = document.getElementById('speedStat');
const timeStat = document.getElementById('timeStat');
const etcStat = document.getElementById('etcStat');

// Target buttons
const customTargetInput = document.getElementById('customTarget');

// Modal
const confirmModal = document.getElementById('confirmModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');

// Celebration
const celebration = document.getElementById('celebration');

// ========================
// Initialization
// ========================
window.addEventListener('load', () => {
    loadSettings();
    loadCounterData();
    loadAllCounters();
    initializeViews();
    initializeTargetButtons();
    initializeSettingsToggles();
    initializeTasbihSelect();
    load99Names();
    updateMechanicalDisplay(counter);
    updateStats();
    setInterval(updateStats, 1000);
});

// ========================
// Settings Management
// ========================
function loadSettings() {
    const saved = localStorage.getItem('tasbihSettings');
    if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };
    }
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function saveSettings() {
    localStorage.setItem('tasbihSettings', JSON.stringify(settings));
}

function initializeSettingsToggles() {
    document.getElementById('vibrationToggle').checked = settings.vibration;
    document.getElementById('soundToggle').checked = settings.sound;
    document.getElementById('milestoneVibeToggle').checked = settings.milestoneVibe;
    document.getElementById('notificationsToggle').checked = settings.notifications;
    document.getElementById('targetNotifyToggle').checked = settings.targetNotify;
    document.getElementById('fullscreenToggle').checked = settings.fullscreen;
    
    // Event listeners
    document.getElementById('vibrationToggle').addEventListener('change', (e) => {
        settings.vibration = e.target.checked;
        saveSettings();
    });
    
    document.getElementById('soundToggle').addEventListener('change', (e) => {
        settings.sound = e.target.checked;
        saveSettings();
    });
    
    document.getElementById('milestoneVibeToggle').addEventListener('change', (e) => {
        settings.milestoneVibe = e.target.checked;
        saveSettings();
    });
    
    document.getElementById('notificationsToggle').addEventListener('change', (e) => {
        settings.notifications = e.target.checked;
        saveSettings();
    });
    
    document.getElementById('targetNotifyToggle').addEventListener('change', (e) => {
        settings.targetNotify = e.target.checked;
        saveSettings();
    });
    
    document.getElementById('fullscreenToggle').addEventListener('change', (e) => {
        settings.fullscreen = e.target.checked;
        if (e.target.checked) {
            enterFullscreen();
        } else {
            exitFullscreen();
        }
        saveSettings();
    });
    
    document.getElementById('requestNotificationBtn').addEventListener('click', requestNotificationPermission);
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
    document.getElementById('enableLocationBtn').addEventListener('click', initQiblaFinder);
}

// ========================
// Tasbih Select Handler
// ========================
function initializeTasbihSelect() {
    tasbihSelect.addEventListener('change', () => {
        if (tasbihSelect.value === 'Custom') {
            customDhikr.style.display = 'block';
            customDhikr.focus();
        } else {
            customDhikr.style.display = 'none';
        }
        saveCounterData();
    });
    
    customDhikr.addEventListener('input', () => {
        saveCounterData();
    });
}

// ========================
// Counter Management
// ========================
function loadCounterData() {
    const counterData = getCounterData(currentCounterId);
    counter = counterData.count;
    target = counterData.target;
    startTime = counterData.startTime;
    timestamps = counterData.timestamps;
    tasbihSelect.value = counterData.dhikr;
    counterLabel.textContent = counterData.name;
    
    if (counterData.customDhikrText && counterData.dhikr === 'Custom') {
        customDhikr.value = counterData.customDhikrText;
        customDhikr.style.display = 'block';
    }
    
    updateMechanicalDisplay(counter);
    updateTargetButtons();
}

function getCounterData(id) {
    const saved = localStorage.getItem(`counter_${id}`);
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        id: id,
        name: 'General Counter',
        count: 0,
        target: 11,
        dhikr: 'Subhanallah',
        customDhikrText: '',
        startTime: null,
        timestamps: []
    };
}

function saveCounterData() {
    const counterData = {
        id: currentCounterId,
        name: counterLabel.textContent,
        count: counter,
        target: target,
        dhikr: tasbihSelect.value,
        customDhikrText: customDhikr.value,
        startTime: startTime,
        timestamps: timestamps
    };
    localStorage.setItem(`counter_${currentCounterId}`, JSON.stringify(counterData));
}

// ========================
// Mechanical Counter Display
// ========================
function updateMechanicalDisplay(number) {
    const digits = String(number).padStart(4, '0').split('');
    const slots = mechanicalCounter.querySelectorAll('.digit-slot');
    
    slots.forEach((slot, index) => {
        const currentDigit = parseInt(slot.querySelector('.digit-top').textContent);
        const newDigit = parseInt(digits[index]);
        
        if (currentDigit !== newDigit) {
            flipDigit(slot, newDigit);
        }
    });
}

function flipDigit(slot, newDigit) {
    const flipper = slot.querySelector('.digit-flipper');
    const topDigit = slot.querySelector('.digit-top');
    const bottomDigit = slot.querySelector('.digit-bottom');
    
    // Create next digit elements
    const nextTop = document.createElement('div');
    nextTop.className = 'digit-next-top';
    nextTop.textContent = newDigit;
    
    const nextBottom = document.createElement('div');
    nextBottom.className = 'digit-next-bottom';
    nextBottom.textContent = newDigit;
    
    flipper.appendChild(nextTop);
    flipper.appendChild(nextBottom);
    
    // Trigger flip animation
    flipper.classList.add('flipping');
    
    setTimeout(() => {
        topDigit.textContent = newDigit;
        bottomDigit.textContent = newDigit;
        flipper.classList.remove('flipping');
        nextTop.remove();
        nextBottom.remove();
    }, 400);
}

// ========================
// Counter Actions
// ========================
tapArea.addEventListener('click', (e) => {
    if (e.target.closest('.controls') || e.target.closest('.target-section') || 
        e.target.closest('.stats-section') || e.target.closest('.tasbih-select') ||
        e.target.closest('.custom-dhikr')) {
        return;
    }
    
    if (!startTime) {
        startTime = Date.now();
    }
    
    counter++;
    timestamps.push(Date.now());
    
    updateMechanicalDisplay(counter);
    vibrate();
    
    if (settings.milestoneVibe && [33, 66, 99].includes(counter % 100)) {
        vibrateMilestone();
    }
    
    if (counter === target) {
        showCelebration();
        if (settings.targetNotify && settings.notifications) {
            sendNotification('Target Reached!', `You completed ${target} counts!`);
        }
    }
    
    saveCounterData();
    updateLapCounter();
    updateStats();
});

minusBtn.addEventListener('click', () => {
    if (counter > 0) {
        counter--;
        timestamps.pop();
        updateMechanicalDisplay(counter);
        vibrate(50);
        saveCounterData();
        updateLapCounter();
        updateStats();
    }
});

resetBtn.addEventListener('click', () => {
    showModal('Reset Counter?', 'Are you sure you want to reset the counter? This cannot be undone.', () => {
        counter = 0;
        startTime = null;
        timestamps = [];
        updateMechanicalDisplay(counter);
        saveCounterData();
        updateLapCounter();
        updateStats();
    });
});

saveSessionBtn.addEventListener('click', () => {
    saveSession();
});

// ========================
// Lap Counter
// ========================
function updateLapCounter() {
    const laps = Math.floor(counter / target);
    animateTextChange(lapValue, laps);
}

// ========================
// Text Animation
// ========================
function animateTextChange(element, newValue) {
    const oldValue = element.textContent;
    
    if (oldValue === String(newValue)) return;
    
    element.style.position = 'relative';
    element.style.display = 'inline-block';
    
    const oldSpan = document.createElement('span');
    oldSpan.textContent = oldValue;
    oldSpan.style.position = 'absolute';
    oldSpan.style.left = '0';
    oldSpan.style.animation = 'slideUp 0.3s ease forwards';
    
    const newSpan = document.createElement('span');
    newSpan.textContent = newValue;
    newSpan.style.animation = 'slideDown 0.3s ease forwards';
    
    element.innerHTML = '';
    element.appendChild(oldSpan);
    element.appendChild(newSpan);
    
    setTimeout(() => {
        element.innerHTML = newValue;
    }, 300);
}

// ========================
// Vibration & Haptics
// ========================
function vibrate(duration = 30) {
    if (settings.vibration && 'vibrate' in navigator) {
        navigator.vibrate(duration);
    }
}

function vibrateMilestone() {
    if (settings.milestoneVibe && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 100]);
    }
}

// ========================
// Target Management
// ========================
function initializeTargetButtons() {
    document.querySelectorAll('.target-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.target-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.dataset.target === 'custom') {
                customTargetInput.style.display = 'block';
                customTargetInput.focus();
            } else {
                customTargetInput.style.display = 'none';
                target = parseInt(btn.dataset.target);
                saveCounterData();
                updateStats();
            }
        });
    });
    
    customTargetInput.addEventListener('input', () => {
        const value = parseInt(customTargetInput.value);
        if (value > 0) {
            target = value;
            saveCounterData();
            updateStats();
        }
    });
}

function updateTargetButtons() {
    const predefinedTargets = [11, 33, 66, 99];
    if (predefinedTargets.includes(target)) {
        document.querySelectorAll('.target-btn').forEach(btn => {
            if (btn.dataset.target == target) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        customTargetInput.style.display = 'none';
    } else {
        document.querySelectorAll('.target-btn').forEach(btn => {
            if (btn.dataset.target === 'custom') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        customTargetInput.style.display = 'block';
        customTargetInput.value = target;
    }
}

// ========================
// Time Formatting
// ========================
function formatTime(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    } else if (seconds < 2592000) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        return `${days}d ${hours}h`;
    } else if (seconds < 31536000) {
        const months = Math.floor(seconds / 2592000);
        const days = Math.floor((seconds % 2592000) / 86400);
        return `${months}mo ${days}d`;
    } else {
        const years = Math.floor(seconds / 31536000);
        const months = Math.floor((seconds % 31536000) / 2592000);
        return `${years}y ${months}mo`;
    }
}

// ========================
// Statistics
// ========================
function updateStats() {
    const newProgress = `${counter}/${target}`;
    if (progressStat.textContent !== newProgress) {
        animateTextChange(progressStat, newProgress);
    }
    
    if (startTime && timestamps.length > 0) {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (timeStat.textContent !== timeStr) {
            animateTextChange(timeStat, timeStr);
        }
        
        const avgSpeed = (counter / (elapsed / 60000)).toFixed(1);
        const speedStr = isFinite(avgSpeed) && avgSpeed > 0 ? `${avgSpeed}/min` : '0/min';
        
        if (speedStat.textContent !== speedStr) {
            animateTextChange(speedStat, speedStr);
        }
        
        if (counter > 0 && counter < target) {
            const remaining = target - counter;
            const etcSeconds = Math.floor((elapsed / counter) * remaining / 1000);
            const etcStr = formatTime(etcSeconds);
            
            if (etcStat.textContent !== etcStr) {
                animateTextChange(etcStat, etcStr);
            }
        } else if (counter >= target) {
            if (etcStat.textContent !== 'Complete!') {
                animateTextChange(etcStat, 'Complete!');
            }
        } else {
            if (etcStat.textContent !== '--:--') {
                animateTextChange(etcStat, '--:--');
            }
        }
    } else {
        if (timeStat.textContent !== '00:00') animateTextChange(timeStat, '00:00');
        if (speedStat.textContent !== '0/min') animateTextChange(speedStat, '0/min');
        if (etcStat.textContent !== '--:--') animateTextChange(etcStat, '--:--');
    }
}

// ========================
// Show Celebration
// ========================
function showCelebration() {
    celebration.classList.add('active');
    vibrateMilestone();
    
    setTimeout(() => {
        celebration.classList.remove('active');
    }, 3000);
}

// ========================
// Theme Toggle
// ========================
themeToggle.addEventListener('click', (e) => {
    const rect = themeToggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const maxDistance = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
    );
    
    themeCircle.style.width = maxDistance * 2 + 'px';
    themeCircle.style.height = maxDistance * 2 + 'px';
    themeCircle.style.left = x - maxDistance + 'px';
    themeCircle.style.top = y - maxDistance + 'px';
    
    const isDark = document.body.classList.contains('dark-mode');
    themeCircle.style.backgroundColor = isDark ? '#f5f5f5' : '#000000';
    
    themeCircle.classList.add('expanding');
    
    // Add theme transitioning class
    document.body.classList.add('theme-transitioning');
    
    setTimeout(() => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        
        setTimeout(() => {
            themeCircle.classList.remove('expanding');
            document.body.classList.remove('theme-transitioning');
        }, 800);
    }, 400);
});

// ========================
// Navigation & Menu
// ========================
menuBtn.addEventListener('click', () => {
    sideMenu.classList.add('active');
    overlay.classList.add('active');
});

closeMenu.addEventListener('click', () => {
    sideMenu.classList.remove('active');
    overlay.classList.remove('active');
});

overlay.addEventListener('click', () => {
    sideMenu.classList.remove('active');
    overlay.classList.remove('active');
});

function initializeViews() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            switchView(view);
            
            document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
            item.classList.add('active');
            
            sideMenu.classList.remove('active');
            overlay.classList.remove('active');
        });
    });
}

function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    
    const views = {
        'counter': document.getElementById('counterView'),
        'counters': document.getElementById('countersView'),
        'history': document.getElementById('historyView'),
        'stats': document.getElementById('statsView'),
        'settings': document.getElementById('settingsView'),
        'names': document.getElementById('namesView'),
        'qibla': document.getElementById('qiblaView')
    };
    
    if (views[viewName]) {
        views[viewName].classList.add('active');
    }
    
    if (viewName === 'counters') loadAllCounters();
    if (viewName === 'history') loadHistory();
    if (viewName === 'stats') loadStatistics();
    
    currentView = viewName;
}

// ========================
// Multiple Counters
// ========================
function loadAllCounters() {
    const countersList = document.getElementById('countersList');
    countersList.innerHTML = '';
    
    const counters = getAllCounters();
    
    if (counters.length === 0) {
        countersList.innerHTML = '<p style="text-align: center; color: var(--text-color); opacity: 0.7;">No saved counters yet</p>';
        return;
    }
    
    counters.forEach(c => {
        const item = document.createElement('div');
        item.className = 'counter-item';
        item.innerHTML = `
            <h3>${c.name}</h3>
            <p>${c.dhikr} - ${c.count}/${c.target}</p>
        `;
        item.addEventListener('click', () => {
            currentCounterId = c.id;
            loadCounterData();
            switchView('counter');
        });
        countersList.appendChild(item);
    });
}

function getAllCounters() {
    const counters = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('counter_')) {
            counters.push(JSON.parse(localStorage.getItem(key)));
        }
    }
    return counters;
}

document.getElementById('addCounterBtn').addEventListener('click', () => {
    const id = Date.now().toString();
    const name = prompt('Enter counter name:', 'New Counter');
    if (name) {
        const newCounter = {
            id: id,
            name: name,
            count: 0,
            target: 33,
            dhikr: 'Subhanallah',
            customDhikrText: '',
            startTime: null,
            timestamps: []
        };
        localStorage.setItem(`counter_${id}`, JSON.stringify(newCounter));
        currentCounterId = id;
        loadCounterData();
        switchView('counter');
    }
});

// ========================
// Session History
// ========================
function saveSession() {
    if (counter === 0) {
        alert('No data to save!');
        return;
    }
    
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    const session = {
        id: Date.now(),
        date: new Date().toISOString(),
        dhikr: tasbihSelect.value === 'Custom' ? customDhikr.value : tasbihSelect.value,
        count: counter,
        target: target,
        duration: startTime ? Date.now() - startTime : 0,
        completed: counter >= target
    };
    
    sessions.unshift(session);
    localStorage.setItem('sessions', JSON.stringify(sessions));
    
    alert('Session saved successfully!');
    vibrate(100);
}

function loadHistory() {
    const historyList = document.getElementById('historyList');
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    
    historyList.innerHTML = '';
    
    if (sessions.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-color); opacity: 0.7;">No history yet</p>';
        return;
    }
    
    sessions.forEach(session => {
        const date = new Date(session.date);
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <h3>${session.dhikr}</h3>
            <p>Count: ${session.count}/${session.target} ${session.completed ? '✓' : ''}</p>
            <p style="font-size: 12px; opacity: 0.6;">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</p>
        `;
        historyList.appendChild(item);
    });
}

document.getElementById('exportBtn').addEventListener('click', () => {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    if (sessions.length === 0) {
        alert('No data to export!');
        return;
    }
    
    const csv = 'Date,Dhikr,Count,Target,Duration(ms),Completed\n' +
        sessions.map(s => `${s.date},${s.dhikr},${s.count},${s.target},${s.duration},${s.completed}`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasbih-history-${Date.now()}.csv`;
    a.click();
});

// ========================
// Statistics View
// ========================
function loadStatistics() {
    const statsContent = document.getElementById('statsContent');
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    
    const totalSessions = sessions.length;
    const totalCount = sessions.reduce((sum, s) => sum + s.count, 0);
    const completedSessions = sessions.filter(s => s.completed).length;
    const avgCount = totalSessions > 0 ? (totalCount / totalSessions).toFixed(1) : 0;
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const avgDuration = totalSessions > 0 ? Math.floor(totalDuration / totalSessions / 1000) : 0;
    const longestSession = sessions.length > 0 ? Math.max(...sessions.map(s => s.count)) : 0;
    const completionRate = totalSessions > 0 ? ((completedSessions / totalSessions) * 100).toFixed(1) : 0;
    
    // Most used dhikr
    const dhikrCounts = {};
    sessions.forEach(s => {
        dhikrCounts[s.dhikr] = (dhikrCounts[s.dhikr] || 0) + 1;
    });
    const mostUsedDhikr = Object.keys(dhikrCounts).length > 0 
        ? Object.entries(dhikrCounts).sort((a, b) => b[1] - a[1])[0][0] 
        : 'None';
    
    statsContent.innerHTML = `
        <div class="stats-card">
            <h3>Overall Statistics</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Total Sessions</span>
                    <span class="stat-value">${totalSessions}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Count</span>
                    <span class="stat-value">${totalCount}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Completed</span>
                    <span class="stat-value">${completedSessions}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Avg per Session</span>
                    <span class="stat-value">${avgCount}</span>
                </div>
            </div>
        </div>
        
        <div class="stats-card">
            <h3>Performance Metrics</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Completion Rate</span>
                    <span class="stat-value">${completionRate}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Longest Session</span>
                    <span class="stat-value">${longestSession}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Avg Duration</span>
                    <span class="stat-value">${formatTime(avgDuration)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Most Used</span>
                    <span class="stat-value" style="font-size: 14px;">${mostUsedDhikr}</span>
                </div>
            </div>
        </div>
    `;
}

// ========================
// 99 Names of Allah
// ========================
function load99Names() {
    const names = [
        { arabic: 'ٱلرَّحْمَٰنُ', transliteration: 'Ar-Rahman', meaning: 'The Most Merciful' },
        { arabic: 'ٱلرَّحِيمُ', transliteration: 'Ar-Raheem', meaning: 'The Bestower of Mercy' },
        { arabic: 'ٱلْمَلِكُ', transliteration: 'Al-Malik', meaning: 'The King' },
        { arabic: 'ٱلْقُدُّوسُ', transliteration: 'Al-Quddus', meaning: 'The Most Holy' },
        { arabic: 'ٱلسَّلَامُ', transliteration: 'As-Salam', meaning: 'The Source of Peace' },
        { arabic: 'ٱلْمُؤْمِنُ', transliteration: 'Al-Mu\'min', meaning: 'The Granter of Security' },
        { arabic: 'ٱلْمُهَيْمِنُ', transliteration: 'Al-Muhaymin', meaning: 'The Controller' },
        { arabic: 'ٱلْعَزِيزُ', transliteration: 'Al-Aziz', meaning: 'The Almighty' },
        { arabic: 'ٱلْجَبَّارُ', transliteration: 'Al-Jabbar', meaning: 'The Compeller' },
        { arabic: 'ٱلْمُتَكَبِّرُ', transliteration: 'Al-Mutakabbir', meaning: 'The Supreme' },
        { arabic: 'ٱلْخَالِقُ', transliteration: 'Al-Khaliq', meaning: 'The Creator' },
        { arabic: 'ٱلْبَارِئُ', transliteration: 'Al-Bari', meaning: 'The Evolver' },
        { arabic: 'ٱلْمُصَوِّرُ', transliteration: 'Al-Musawwir', meaning: 'The Fashioner' },
        { arabic: 'ٱلْغَفَّارُ', transliteration: 'Al-Ghaffar', meaning: 'The Ever-Forgiving' },
        { arabic: 'ٱلْقَهَّارُ', transliteration: 'Al-Qahhar', meaning: 'The Subduer' },
        { arabic: 'ٱلْوَهَّابُ', transliteration: 'Al-Wahhab', meaning: 'The Bestower' },
        { arabic: 'ٱلرَّزَّاقُ', transliteration: 'Ar-Razzaq', meaning: 'The Provider' },
        { arabic: 'ٱلْفَتَّاحُ', transliteration: 'Al-Fattah', meaning: 'The Opener' },
        { arabic: 'ٱلْعَلِيمُ', transliteration: 'Al-Aleem', meaning: 'The All-Knowing' },
        { arabic: 'ٱلْقَابِضُ', transliteration: 'Al-Qabid', meaning: 'The Withholder' },
        { arabic: 'ٱلْبَاسِطُ', transliteration: 'Al-Basit', meaning: 'The Extender' },
        { arabic: 'ٱلْخَافِضُ', transliteration: 'Al-Khafid', meaning: 'The Reducer' },
        { arabic: 'ٱلرَّافِعُ', transliteration: 'Ar-Rafi', meaning: 'The Exalter' },
        { arabic: 'ٱلْمُعِزُّ', transliteration: 'Al-Mu\'izz', meaning: 'The Honorer' },
        { arabic: 'ٱلْمُذِلُّ', transliteration: 'Al-Muzil', meaning: 'The Humiliator' },
        { arabic: 'ٱلسَّمِيعُ', transliteration: 'As-Semi', meaning: 'The All-Hearing' },
        { arabic: 'ٱلْبَصِيرُ', transliteration: 'Al-Baseer', meaning: 'The All-Seeing' },
        { arabic: 'ٱلْحَكَمُ', transliteration: 'Al-Hakam', meaning: 'The Judge' },
        { arabic: 'ٱلْعَدْلُ', transliteration: 'Al-Adl', meaning: 'The Just' },
        { arabic: 'ٱللَّطِيفُ', transliteration: 'Al-Lateef', meaning: 'The Subtle One' },
        { arabic: 'ٱلْخَبِيرُ', transliteration: 'Al-Khabeer', meaning: 'The All-Aware' },
        { arabic: 'ٱلْحَلِيمُ', transliteration: 'Al-Haleem', meaning: 'The Forbearing' },
        { arabic: 'ٱلْعَظِيمُ', transliteration: 'Al-Azeem', meaning: 'The Magnificent' },
        { arabic: 'ٱلْغَفُورُ', transliteration: 'Al-Ghafoor', meaning: 'The Forgiving' },
        { arabic: 'ٱلشَّكُورُ', transliteration: 'Ash-Shakoor', meaning: 'The Grateful' },
        { arabic: 'ٱلْعَلِيُّ', transliteration: 'Al-Aliyy', meaning: 'The Most High' },
        { arabic: 'ٱلْكَبِيرُ', transliteration: 'Al-Kabeer', meaning: 'The Most Great' },
        { arabic: 'ٱلْحَفِيظُ', transliteration: 'Al-Hafeedh', meaning: 'The Preserver' },
        { arabic: 'ٱلْمُقِيتُ', transliteration: 'Al-Muqeet', meaning: 'The Sustainer' },
        { arabic: 'ٱلْحَسِيبُ', transliteration: 'Al-Haseeb', meaning: 'The Reckoner' },
        { arabic: 'ٱلْجَلِيلُ', transliteration: 'Al-Jaleel', meaning: 'The Majestic' },
        { arabic: 'ٱلْكَرِيمُ', transliteration: 'Al-Kareem', meaning: 'The Generous' },
        { arabic: 'ٱلرَّقِيبُ', transliteration: 'Ar-Raqeeb', meaning: 'The Watchful' },
        { arabic: 'ٱلْمُجِيبُ', transliteration: 'Al-Mujeeb', meaning: 'The Responsive' },
        { arabic: 'ٱلْوَاسِعُ', transliteration: 'Al-Wasi', meaning: 'The All-Encompassing' },
        { arabic: 'ٱلْحَكِيمُ', transliteration: 'Al-Hakeem', meaning: 'The Wise' },
        { arabic: 'ٱلْوَدُودُ', transliteration: 'Al-Wadud', meaning: 'The Loving' },
        { arabic: 'ٱلْمَجِيدُ', transliteration: 'Al-Majeed', meaning: 'The Glorious' },
        { arabic: 'ٱلْبَاعِثُ', transliteration: 'Al-Ba\'ith', meaning: 'The Resurrector' },
        { arabic: 'ٱلشَّهِيدُ', transliteration: 'Ash-Shaheed', meaning: 'The Witness' },
        { arabic: 'ٱلْحَقُّ', transliteration: 'Al-Haqq', meaning: 'The Truth' },
        { arabic: 'ٱلْوَكِيلُ', transliteration: 'Al-Wakeel', meaning: 'The Trustee' },
        { arabic: 'ٱلْقَوِيُّ', transliteration: 'Al-Qawiyy', meaning: 'The Strong' },
        { arabic: 'ٱلْمَتِينُ', transliteration: 'Al-Mateen', meaning: 'The Firm' },
        { arabic: 'ٱلْوَلِيُّ', transliteration: 'Al-Waliyy', meaning: 'The Protecting Friend' },
        { arabic: 'ٱلْحَمِيدُ', transliteration: 'Al-Hameed', meaning: 'The Praiseworthy' },
        { arabic: 'ٱلْمُحْصِي', transliteration: 'Al-Muhsee', meaning: 'The Reckoner' },
        { arabic: 'ٱلْمُبْدِئُ', transliteration: 'Al-Mubdi', meaning: 'The Originator' },
        { arabic: 'ٱلْمُعِيدُ', transliteration: 'Al-Mu\'id', meaning: 'The Restorer' },
        { arabic: 'ٱلْمُحْيِي', transliteration: 'Al-Muhyi', meaning: 'The Giver of Life' },
        { arabic: 'ٱلْمُمِيتُ', transliteration: 'Al-Mumeet', meaning: 'The Bringer of Death' },
        { arabic: 'ٱلْحَيُّ', transliteration: 'Al-Hayy', meaning: 'The Ever-Living' },
        { arabic: 'ٱلْقَيُّومُ', transliteration: 'Al-Qayyoom', meaning: 'The Self-Subsisting' },
        { arabic: 'ٱلْوَاجِدُ', transliteration: 'Al-Wajid', meaning: 'The Finder' },
        { arabic: 'ٱلْمَاجِدُ', transliteration: 'Al-Majid', meaning: 'The Noble' },
        { arabic: 'ٱلْوَاحِدُ', transliteration: 'Al-Wahid', meaning: 'The Unique' },
        { arabic: 'ٱلصَّمَدُ', transliteration: 'As-Samad', meaning: 'The Eternal' },
        { arabic: 'ٱلْقَادِرُ', transliteration: 'Al-Qadir', meaning: 'The Able' },
        { arabic: 'ٱلْمُقْتَدِرُ', transliteration: 'Al-Muqtadir', meaning: 'The Powerful' },
        { arabic: 'ٱلْمُقَدِّمُ', transliteration: 'Al-Muqaddim', meaning: 'The Expediter' },
        { arabic: 'ٱلْمُؤَخِّرُ', transliteration: 'Al-Mu\'akhkhir', meaning: 'The Delayer' },
        { arabic: 'ٱلْأَوَّلُ', transliteration: 'Al-Awwal', meaning: 'The First' },
        { arabic: 'ٱلْآخِرُ', transliteration: 'Al-Akhir', meaning: 'The Last' },
        { arabic: 'ٱلظَّاهِرُ', transliteration: 'Az-Zahir', meaning: 'The Manifest' },
        { arabic: 'ٱلْبَاطِنُ', transliteration: 'Al-Batin', meaning: 'The Hidden' },
        { arabic: 'ٱلْوَالِي', transliteration: 'Al-Wali', meaning: 'The Governor' },
        { arabic: 'ٱلْمُتَعَالِي', transliteration: 'Al-Muta\'ali', meaning: 'The Most Exalted' },
        { arabic: 'ٱلْبَرُّ', transliteration: 'Al-Barr', meaning: 'The Source of Goodness' },
        { arabic: 'ٱلتَّوَّابُ', transliteration: 'At-Tawwab', meaning: 'The Acceptor of Repentance' },
        { arabic: 'ٱلْمُنْتَقِمُ', transliteration: 'Al-Muntaqim', meaning: 'The Avenger' },
        { arabic: 'ٱلْعَفُوُّ', transliteration: 'Al-Afuww', meaning: 'The Pardoner' },
        { arabic: 'ٱلرَّءُوفُ', transliteration: 'Ar-Ra\'oof', meaning: 'The Most Kind' },
        { arabic: 'مَالِكُ ٱلْمُلْكِ', transliteration: 'Malik-ul-Mulk', meaning: 'Master of the Kingdom' },
        { arabic: 'ذُو ٱلْجَلَالِ وَٱلْإِكْرَامِ', transliteration: 'Dhul-Jalali wal-Ikram', meaning: 'Lord of Majesty and Bounty' },
        { arabic: 'ٱلْمُقْسِطُ', transliteration: 'Al-Muqsit', meaning: 'The Equitable' },
        { arabic: 'ٱلْجَامِعُ', transliteration: 'Al-Jami', meaning: 'The Gatherer' },
        { arabic: 'ٱلْغَنِيُّ', transliteration: 'Al-Ghaniyy', meaning: 'The Self-Sufficient' },
        { arabic: 'ٱلْمُغْنِي', transliteration: 'Al-Mughni', meaning: 'The Enricher' },
        { arabic: 'ٱلْمَانِعُ', transliteration: 'Al-Mani', meaning: 'The Preventer' },
        { arabic: 'ٱلضَّارُّ', transliteration: 'Ad-Darr', meaning: 'The Distresser' },
        { arabic: 'ٱلنَّافِعُ', transliteration: 'An-Nafi', meaning: 'The Benefactor' },
        { arabic: 'ٱلنُّورُ', transliteration: 'An-Nur', meaning: 'The Light' },
        { arabic: 'ٱلْهَادِي', transliteration: 'Al-Hadi', meaning: 'The Guide' },
        { arabic: 'ٱلْبَدِيعُ', transliteration: 'Al-Badi', meaning: 'The Incomparable' },
        { arabic: 'ٱلْبَاقِي', transliteration: 'Al-Baqi', meaning: 'The Everlasting' },
        { arabic: 'ٱلْوَارِثُ', transliteration: 'Al-Warith', meaning: 'The Inheritor' },
        { arabic: 'ٱلرَّشِيدُ', transliteration: 'Ar-Rasheed', meaning: 'The Guide to the Right Path' },
        { arabic: 'ٱلصَّبُورُ', transliteration: 'As-Saboor', meaning: 'The Patient' }
    ];
    
    const namesList = document.getElementById('namesList');
    namesList.innerHTML = '';
    
    names.forEach((name, index) => {
        const item = document.createElement('div');
        item.className = 'name-item';
        item.innerHTML = `
            <div class="name-arabic">${name.arabic}</div>
            <div class="name-transliteration">${index + 1}. ${name.transliteration}</div>
            <div class="name-meaning">${name.meaning}</div>
        `;
        namesList.appendChild(item);
    });
}

// ========================
// Qibla Finder
// ========================
function initQiblaFinder() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const qiblaAngle = calculateQibla(lat, lon);
            
            document.getElementById('qiblaInfo').innerHTML = `
                <p>Qibla direction: ${qiblaAngle.toFixed(2)}° from North</p>
                <p>Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}</p>
            `;
            
            if ('DeviceOrientationEvent' in window) {
                window.addEventListener('deviceorientation', (e) => {
                    const heading = e.alpha;
                    const needle = document.getElementById('compassNeedle');
                    if (needle && heading !== null) {
                        needle.style.transform = `translateX(-50%) translateY(-100%) rotate(${qiblaAngle - heading}deg)`;
                    }
                });
            }
        }, (error) => {
            alert('Unable to get location. Please enable location services.');
        });
    } else {
        alert('Geolocation is not supported by your device.');
    }
}

function calculateQibla(lat, lon) {
    const meccaLat = 21.4225;
    const meccaLon = 39.8262;
    
    const latRad = lat * Math.PI / 180;
    const lonRad = lon * Math.PI / 180;
    const meccaLatRad = meccaLat * Math.PI / 180;
    const meccaLonRad = meccaLon * Math.PI / 180;
    
    const dLon = meccaLonRad - lonRad;
    
    const y = Math.sin(dLon);
    const x = Math.cos(latRad) * Math.tan(meccaLatRad) - Math.sin(latRad) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    return bearing;
}

// ========================
// Notifications
// ========================
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                alert('Notifications enabled!');
                settings.notifications = true;
                document.getElementById('notificationsToggle').checked = true;
                saveSettings();
            }
        });
    } else {
        alert('Notifications not supported on this device.');
    }
}

function sendNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'https://cdn-icons-png.flaticon.com/512/7113/7113227.png'
        });
    }
}

// ========================
// PWA Install
// ========================
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installBtn').style.display = 'block';
});

document.getElementById('installBtn').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        document.getElementById('installBtn').style.display = 'none';
    }
});

// ========================
// Modal
// ========================
let modalCallback = null;

function showModal(title, message, onConfirm) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalCallback = onConfirm;
    confirmModal.classList.add('active');
}

modalCancel.addEventListener('click', () => {
    confirmModal.classList.remove('active');
    modalCallback = null;
});

modalConfirm.addEventListener('click', () => {
    if (modalCallback) {
        modalCallback();
    }
    confirmModal.classList.remove('active');
    modalCallback = null;
});

// ========================
// Utilities
// ========================
function clearAllData() {
    showModal('Clear All Data?', 'This will delete all counters, history, and settings. This cannot be undone.', () => {
        localStorage.clear();
        location.reload();
    });
}

function enterFullscreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Prevent context menu
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Prevent gestures
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());
