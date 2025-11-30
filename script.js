// ========================
// Global State
// ========================
let counter = 0;
let target = 33;
let startTime = null;
let timestamps = [];
let currentDhikr = 'Subhanallah';
let beadCount = 33;
let currentBeadIndex = 0;
let isAnimating = false;

// Settings
let settings = {
    vibration: true,
    sound: false,
    darkMode: false
};

// ========================
// DOM Elements
// ========================
const countNumber = document.getElementById('countNumber');
const countTarget = document.getElementById('countTarget');
const tapArea = document.getElementById('tapArea');
const tasbihBeads = document.getElementById('tasbihBeads');
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const closeBtn = document.getElementById('closeBtn');
const overlay = document.getElementById('overlay');
const toast = document.getElementById('toast');

// Buttons
const minusBtn = document.getElementById('minusBtn');
const resetBtn = document.getElementById('resetBtn');
const saveBtn = document.getElementById('saveBtn');

// Custom Target
const customTargetBtn = document.getElementById('customTargetBtn');
const customTargetInput = document.getElementById('customTargetInput');
const customTargetValue = document.getElementById('customTargetValue');
const setTargetBtn = document.getElementById('setTargetBtn');

// Modals
const dhikrModal = document.getElementById('dhikrModal');
const historyModal = document.getElementById('historyModal');
const settingsModal = document.getElementById('settingsModal');

const dhikrBtn = document.getElementById('dhikrBtn');
const historyBtn = document.getElementById('historyBtn');
const settingsBtn = document.getElementById('settingsBtn');

const dhikrClose = document.getElementById('dhikrClose');
const historyClose = document.getElementById('historyClose');
const settingsClose = document.getElementById('settingsClose');

// Stats
const statTotal = document.getElementById('statTotal');
const statTime = document.getElementById('statTime');
const statSpeed = document.getElementById('statSpeed');
const statSessions = document.getElementById('statSessions');
const statEtc = document.getElementById('statEtc');

// Settings
const vibrationToggle = document.getElementById('vibrationToggle');
const soundToggle = document.getElementById('soundToggle');
const darkModeToggle = document.getElementById('darkModeToggle');
const clearDataBtn = document.getElementById('clearDataBtn');

// ========================
// Initialization
// ========================
window.addEventListener('load', () => {
    loadSettings();
    loadCounter();
    createBeads();
    updateDisplay();
    updateStats();
    loadSessions();
    
    // Start stats update interval
    setInterval(updateStats, 1000);
    
    // Start bead animation loop
    startBeadAnimation();
});

// ========================
// Load/Save Functions
// ========================
function loadSettings() {
    const saved = localStorage.getItem('tasbihSettings');
    if (saved) {
        settings = JSON.parse(saved);
    }
    
    vibrationToggle.checked = settings.vibration;
    soundToggle.checked = settings.sound;
    darkModeToggle.checked = settings.darkMode;
    
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    }
}

function saveSettings() {
    localStorage.setItem('tasbihSettings', JSON.stringify(settings));
}

function loadCounter() {
    const saved = localStorage.getItem('currentCounter');
    if (saved) {
        const data = JSON.parse(saved);
        counter = data.counter || 0;
        target = data.target || 33;
        startTime = data.startTime || null;
        timestamps = data.timestamps || [];
        currentDhikr = data.dhikr || 'Subhanallah';
        beadCount = target;
    }
}

function saveCounter() {
    const data = {
        counter,
        target,
        startTime,
        timestamps,
        dhikr: currentDhikr
    };
    localStorage.setItem('currentCounter', JSON.stringify(data));
}

// ========================
// Create Tasbih Beads - FIXED CIRCULAR POSITIONING
// ========================
function createBeads() {
    tasbihBeads.innerHTML = '';
    const containerWidth = 300;
    const containerHeight = 300;
    const radius = 140; // Distance from center
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    for (let i = 0; i < beadCount; i++) {
        const bead = document.createElement('div');
        bead.className = 'bead';
        bead.dataset.index = i;
        
        // Calculate angle for this bead (start from top, go clockwise)
        const angle = (i / beadCount) * 2 * Math.PI - Math.PI / 2;
        
        // Calculate position on circle using proper trigonometry
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        // Set position (beads are centered with transform in CSS)
        bead.style.left = x + 'px';
        bead.style.top = y + 'px';
        
        // Store position data for animation
        bead.dataset.x = x;
        bead.dataset.y = y;
        bead.dataset.angle = angle;
        
        tasbihBeads.appendChild(bead);
    }
}

// ========================
// Bead Animation Loop (Tik-Tik Effect)
// ========================
function startBeadAnimation() {
    setInterval(() => {
        if (!isAnimating) {
            animateNextBead();
        }
    }, 150); // Tik-tik rhythm interval
}

function animateNextBead() {
    const beads = document.querySelectorAll('.bead');
    if (beads.length === 0) return;
    
    // Remove active from all beads
    beads.forEach(b => b.classList.remove('active'));
    
    // Get current bead
    const currentBead = beads[currentBeadIndex];
    if (!currentBead) return;
    
    // Add ticking animation
    currentBead.classList.add('active', 'ticking');
    
    // Remove animation class after completion
    setTimeout(() => {
        currentBead.classList.remove('ticking');
    }, 300);
    
    // Move to next bead (circular motion)
    currentBeadIndex = (currentBeadIndex + 1) % beadCount;
}

// ========================
// Counter Functions
// ========================
tapArea.addEventListener('click', (e) => {
    if (e.target.closest('.controls') || 
        e.target.closest('.target-selector') ||
        e.target.closest('.custom-target-input')) {
        return;
    }
    
    incrementCounter();
});

function incrementCounter() {
    if (!startTime) {
        startTime = Date.now();
    }
    
    counter++;
    timestamps.push(Date.now());
    
    // Update display with pulse animation
    countNumber.classList.add('pulse');
    setTimeout(() => countNumber.classList.remove('pulse'), 300);
    
    // Highlight current bead based on counter
    highlightCounterBead();
    
    // Vibrate
    vibrate();
    
    // Play sound
    playSound();
    
    // Save and update
    saveCounter();
    updateDisplay();
    
    // Check if target reached
    if (counter === target) {
        showToast('🎉 Target reached! MashaAllah!');
        vibrate(200);
    }
}

function highlightCounterBead() {
    const beads = document.querySelectorAll('.bead');
    const beadIndex = (counter - 1) % beadCount;
    
    beads.forEach((bead, index) => {
        if (index === beadIndex) {
            bead.style.background = 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)';
            bead.style.transform = 'translate(-50%, -50%) scale(1.3)';
            
            setTimeout(() => {
                bead.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 300);
        }
    });
}

minusBtn.addEventListener('click', () => {
    if (counter > 0) {
        counter--;
        timestamps.pop();
        vibrate(50);
        saveCounter();
        updateDisplay();
    }
});

resetBtn.addEventListener('click', () => {
    if (counter === 0) return;
    
    if (confirm('Reset counter to 0?')) {
        counter = 0;
        startTime = null;
        timestamps = [];
        
        // Reset bead colors
        const beads = document.querySelectorAll('.bead');
        beads.forEach(bead => {
            bead.style.background = '';
            bead.style.transform = '';
        });
        
        saveCounter();
        updateDisplay();
        showToast('♻️ Counter reset');
    }
});

saveBtn.addEventListener('click', () => {
    saveSession();
});

function updateDisplay() {
    countNumber.textContent = counter;
    countTarget.textContent = `/ ${target}`;
    
    // Update beads if target changed
    if (beadCount !== target) {
        beadCount = target;
        createBeads();
    }
}

// ========================
// Target Selection
// ========================
document.querySelectorAll('.target-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.target-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const targetValue = btn.dataset.target;
        
        if (targetValue === 'custom') {
            // Show custom input
            customTargetInput.style.display = 'flex';
            customTargetValue.focus();
        } else {
            // Hide custom input and set predefined target
            customTargetInput.style.display = 'none';
            target = parseInt(targetValue);
            beadCount = target;
            
            createBeads();
            saveCounter();
            updateDisplay();
            showToast(`🎯 Target set to ${target}`);
        }
    });
});

// Custom Target Set Button
setTargetBtn.addEventListener('click', () => {
    const value = parseInt(customTargetValue.value);
    
    if (!value || value < 1 || value > 9999) {
        showToast('⚠️ Please enter a valid number (1-9999)');
        return;
    }
    
    target = value;
    beadCount = target;
    
    createBeads();
    saveCounter();
    updateDisplay();
    showToast(`🎯 Custom target set to ${target}`);
});

// Allow Enter key to set custom target
customTargetValue.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        setTargetBtn.click();
    }
});

// ========================
// Time Formatting Helper
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
    // Total count
    statTotal.textContent = counter;
    
    // Time elapsed
    if (startTime) {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        statTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Speed (per minute)
        const speed = counter > 0 ? Math.round((counter / (elapsed / 60000))) : 0;
        statSpeed.textContent = speed;
        
        // ETC (Estimated Time to Completion)
        if (counter > 0 && counter < target) {
            const remaining = target - counter;
            const avgTimePerCount = elapsed / counter;
            const etcMs = avgTimePerCount * remaining;
            const etcSeconds = Math.floor(etcMs / 1000);
            
            if (statEtc) {
                statEtc.textContent = formatTime(etcSeconds);
            }
        } else if (counter >= target) {
            if (statEtc) {
                statEtc.textContent = 'Done!';
            }
        } else {
            if (statEtc) {
                statEtc.textContent = '--';
            }
        }
    } else {
        statTime.textContent = '00:00';
        statSpeed.textContent = '0';
        if (statEtc) {
            statEtc.textContent = '--';
        }
    }
    
    // Sessions count
    const sessions = JSON.parse(localStorage.getItem('tasbihSessions') || '[]');
    statSessions.textContent = sessions.length;
}

// ========================
// Session Management
// ========================
function saveSession() {
    if (counter === 0) {
        showToast('⚠️ No data to save');
        return;
    }
    
    const sessions = JSON.parse(localStorage.getItem('tasbihSessions') || '[]');
    
    const session = {
        id: Date.now(),
        dhikr: currentDhikr,
        count: counter,
        target: target,
        duration: startTime ? Date.now() - startTime : 0,
        date: new Date().toISOString(),
        completed: counter >= target
    };
    
    sessions.unshift(session);
    
    // Keep only last 50 sessions
    if (sessions.length > 50) {
        sessions.pop();
    }
    
    localStorage.setItem('tasbihSessions', JSON.stringify(sessions));
    
    showToast('✅ Session saved');
    vibrate(100);
    
    updateStats();
}

function loadSessions() {
    const sessions = JSON.parse(localStorage.getItem('tasbihSessions') || '[]');
    updateStats();
    return sessions;
}

// ========================
// Menu & Modals
// ========================
menuBtn.addEventListener('click', () => {
    sideMenu.classList.add('active');
    overlay.classList.add('active');
});

closeBtn.addEventListener('click', () => {
    sideMenu.classList.remove('active');
    overlay.classList.remove('active');
});

overlay.addEventListener('click', () => {
    sideMenu.classList.remove('active');
    overlay.classList.remove('active');
    closeAllModals();
});

function closeAllModals() {
    dhikrModal.classList.remove('active');
    historyModal.classList.remove('active');
    settingsModal.classList.remove('active');
}

// Dhikr Modal
dhikrBtn.addEventListener('click', () => {
    sideMenu.classList.remove('active');
    dhikrModal.classList.add('active');
    overlay.classList.add('active');
});

dhikrClose.addEventListener('click', () => {
    dhikrModal.classList.remove('active');
    overlay.classList.remove('active');
});

document.querySelectorAll('.dhikr-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.dhikr-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        currentDhikr = item.dataset.dhikr;
        saveCounter();
        
        dhikrModal.classList.remove('active');
        overlay.classList.remove('active');
        
        showToast(`✨ ${currentDhikr} selected`);
    });
});

// History Modal
historyBtn.addEventListener('click', () => {
    sideMenu.classList.remove('active');
    displayHistory();
    historyModal.classList.add('active');
    overlay.classList.add('active');
});

historyClose.addEventListener('click', () => {
    historyModal.classList.remove('active');
    overlay.classList.remove('active');
});

function displayHistory() {
    const sessions = loadSessions();
    const historyList = document.getElementById('historyList');
    
    if (sessions.length === 0) {
        historyList.innerHTML = '<div class="history-empty">No saved sessions yet</div>';
        return;
    }
    
    historyList.innerHTML = sessions.map(session => {
        const date = new Date(session.date);
        const duration = Math.floor(session.duration / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        
        return `
            <div class="history-item">
                <div class="history-dhikr">${session.dhikr} ${session.completed ? '✅' : ''}</div>
                <div class="history-stats">${session.count}/${session.target} • ${minutes}m ${seconds}s</div>
                <div class="history-date">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>
            </div>
        `;
    }).join('');
}

// Settings Modal
settingsBtn.addEventListener('click', () => {
    sideMenu.classList.remove('active');
    settingsModal.classList.add('active');
    overlay.classList.add('active');
});

settingsClose.addEventListener('click', () => {
    settingsModal.classList.remove('active');
    overlay.classList.remove('active');
});

vibrationToggle.addEventListener('change', (e) => {
    settings.vibration = e.target.checked;
    saveSettings();
    if (settings.vibration) vibrate(50);
});

soundToggle.addEventListener('change', (e) => {
    settings.sound = e.target.checked;
    saveSettings();
    if (settings.sound) playSound();
});

darkModeToggle.addEventListener('change', (e) => {
    settings.darkMode = e.target.checked;
    saveSettings();
    
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    showToast(settings.darkMode ? '🌙 Dark mode ON' : '☀️ Light mode ON');
});

clearDataBtn.addEventListener('click', () => {
    if (confirm('Clear all data? This cannot be undone.')) {
        localStorage.clear();
        location.reload();
    }
});

// ========================
// Vibration & Sound
// ========================
function vibrate(duration = 30) {
    if (settings.vibration && 'vibrate' in navigator) {
        navigator.vibrate(duration);
    }
}

function playSound() {
    if (!settings.sound) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.08);
    } catch (e) {
        // Sound not supported
    }
}

// ========================
// Toast Notification
// ========================
function showToast(message, duration = 2500) {
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ========================
// Prevent Gestures
// ========================
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (window.lastTouchEnd && now - window.lastTouchEnd <= 300) {
        event.preventDefault();
    }
    window.lastTouchEnd = now;
}, false);

document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());

// ========================
// Service Worker
// ========================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('✅ Service Worker registered'))
        .catch(err => console.log('❌ SW registration failed:', err));
}
