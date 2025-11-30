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
let currentTheme = 'ocean';
let streakDays = 0;

// Settings
let settings = {
    vibration: true,
    sound: false,
    milestoneVibe: true,
    notifications: false,
    targetNotify: false,
    fullscreen: false,
    cloudSync: false
};

// ========================
// DOM Elements
// ========================
const mechanicalCounter = document.getElementById('mechanicalCounter');
const progressRing = document.getElementById('progressRing');
const tapArea = document.getElementById('tapArea');
const resetBtn = document.getElementById('resetBtn');
const minusBtn = document.getElementById('minusBtn');
const saveSessionBtn = document.getElementById('saveSessionBtn');
const tasbihSelect = document.getElementById('tasbihSelect');
const customDhikr = document.getElementById('customDhikr');
const lapValue = document.getElementById('lapValue');
const counterLabel = document.getElementById('counterLabel');
const splashScreen = document.getElementById('splashScreen');
const connectionStatus = document.getElementById('connectionStatus');
const installBanner = document.getElementById('installBanner');
const toast = document.getElementById('toast');
const streakNumber = document.getElementById('streakNumber');

// Navigation
const menuBtn = document.getElementById('menuBtn');
const closeMenu = document.getElementById('closeMenu');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');
const themeToggle = document.getElementById('themeToggle');
const themeBtn = document.getElementById('themeBtn');
const themePopup = document.getElementById('themePopup');
const themeCircle = document.getElementById('themeCircle');

// Stats
const progressStat = document.getElementById('progressStat');
const speedStat = document.getElementById('speedStat');
const timeStat = document.getElementById('timeStat');
const etcStat = document.getElementById('etcStat');

// Buttons
const customTargetInput = document.getElementById('customTarget');
const shareBtn = document.getElementById('shareBtn');
const soundBtn = document.getElementById('soundBtn');
const vibrateBtn = document.getElementById('vibrateBtn');

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
    setTimeout(() => {
        splashScreen.classList.add('hidden');
    }, 1500);
    
    loadSettings();
    loadCounterData();
    loadAllCounters();
    initializeViews();
    initializeTargetButtons();
    initializeSettingsToggles();
    initializeTasbihSelect();
    initializeThemeSelector();
    load99Names();
    loadAchievements();
    calculateStreak();
    updateMechanicalDisplay(counter);
    updateProgressRing();
    updateStats();
    checkOnlineStatus();
    checkInstallPrompt();
    
    setInterval(updateStats, 1000);
    setInterval(checkOnlineStatus, 5000);
});

// ========================
// Splash & Toast
// ========================
function showToast(message, duration = 3000) {
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ========================
// Online/Offline Detection
// ========================
function checkOnlineStatus() {
    if (!navigator.onLine) {
        connectionStatus.classList.add('show');
    } else {
        connectionStatus.classList.remove('show');
    }
}

window.addEventListener('online', () => {
    connectionStatus.classList.remove('show');
    showToast('✅ Back online');
    if (settings.cloudSync) {
        syncToCloud();
    }
});

window.addEventListener('offline', () => {
    connectionStatus.classList.add('show');
    showToast('⚠️ You are offline');
});

// ========================
// Install Prompt
// ========================
function checkInstallPrompt() {
    const installDismissed = localStorage.getItem('installDismissed');
    if (!installDismissed && deferredPrompt) {
        setTimeout(() => {
            installBanner.classList.add('show');
        }, 3000);
    }
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    checkInstallPrompt();
});

document.getElementById('installBannerBtn').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            showToast('✅ App installed successfully!');
        }
        deferredPrompt = null;
        installBanner.classList.remove('show');
    }
});

document.getElementById('installBannerClose').addEventListener('click', () => {
    installBanner.classList.remove('show');
    localStorage.setItem('installDismissed', 'true');
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
    
    const savedColorTheme = localStorage.getItem('colorTheme');
    if (savedColorTheme) {
        currentTheme = savedColorTheme;
        document.body.setAttribute('data-theme', currentTheme);
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
        showToast(e.target.checked ? '✅ Vibration enabled' : '❌ Vibration disabled');
    });
    
    document.getElementById('soundToggle').addEventListener('change', (e) => {
        settings.sound = e.target.checked;
        saveSettings();
        showToast(e.target.checked ? '🔊 Sound enabled' : '🔇 Sound disabled');
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
    document.getElementById('cloudSyncBtn').addEventListener('click', enableCloudSync);
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
    document.getElementById('enableLocationBtn').addEventListener('click', initQiblaFinder);
}

// ========================
// Theme Management
// ========================
function initializeThemeSelector() {
    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themePopup.classList.toggle('show');
    });
    
    document.addEventListener('click', (e) => {
        if (!themePopup.contains(e.target) && e.target !== themeBtn) {
            themePopup.classList.remove('show');
        }
    });
    
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            currentTheme = theme;
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('colorTheme', theme);
            
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            showToast(`✨ ${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied`);
            themePopup.classList.remove('show');
        });
    });
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
    updateProgressRing();
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
    
    if (settings.cloudSync) {
        queueSyncData(counterData);
    }
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
    }, 500);
}

// ========================
// Progress Ring
// ========================
function updateProgressRing() {
    if (!progressRing) return;
    
    const progress = counter / target;
    const circumference = 2 * Math.PI * 130;
    const offset = circumference - (progress * circumference);
    
    progressRing.style.strokeDashoffset = offset;
}

// Add SVG gradient for progress ring
if (progressRing) {
    const svg = progressRing.closest('svg');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.id = 'progressGradient';
    gradient.innerHTML = `
        <stop offset="0%" stop-color="#6cccbd" />
        <stop offset="100%" stop-color="#667eea" />
    `;
    defs.appendChild(gradient);
    svg.insertBefore(defs, svg.firstChild);
}

// ========================
// Counter Actions
// ========================
tapArea.addEventListener('click', (e) => {
    if (e.target.closest('.controls') || e.target.closest('.target-section') || 
        e.target.closest('.stats-section') || e.target.closest('.tasbih-select') ||
        e.target.closest('.custom-dhikr') || e.target.closest('.quick-actions')) {
        return;
    }
    
    if (!startTime) {
        startTime = Date.now();
    }
    
    counter++;
    timestamps.push(Date.now());
    
    updateMechanicalDisplay(counter);
    updateProgressRing();
    vibrate();
    playSound();
    
    if (settings.milestoneVibe && [33, 66, 99].includes(counter % 100)) {
        vibrateMilestone();
        showToast(`🎉 Milestone: ${counter % 100} reached!`);
    }
    
    if (counter === target) {
        showCelebration();
        checkAchievements();
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
        updateProgressRing();
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
        updateProgressRing();
        saveCounterData();
        updateLapCounter();
        updateStats();
        showToast('♻️ Counter reset');
    });
});

saveSessionBtn.addEventListener('click', () => {
    saveSession();
});

// ========================
// Quick Actions
// ========================
shareBtn.addEventListener('click', async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'My Tasbih Progress',
                text: `I've counted ${counter} times using Tasbih Counter! 🎉`,
                url: window.location.href
            });
            showToast('✅ Shared successfully!');
        } catch (err) {
            if (err.name !== 'AbortError') {
                showToast('❌ Share failed');
            }
        }
    } else {
        showToast('❌ Share not supported');
    }
});

soundBtn.addEventListener('click', () => {
    settings.sound = !settings.sound;
    saveSettings();
    showToast(settings.sound ? '🔊 Sound ON' : '🔇 Sound OFF');
});

vibrateBtn.addEventListener('click', () => {
    settings.vibration = !settings.vibration;
    saveSettings();
    vibrate(100);
    showToast(settings.vibration ? '📳 Vibration ON' : '📴 Vibration OFF');
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
// Vibration & Sound
// ========================
function vibrate(duration = 30) {
    if (settings.vibration && 'vibrate' in navigator) {
        navigator.vibrate(duration);
    }
}

function vibrateMilestone() {
    if (settings.milestoneVibe && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200]);
    }
}

function playSound() {
    if (settings.sound) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
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
                updateProgressRing();
                updateStats();
                showToast(`🎯 Target set to ${target}`);
            }
        });
    });
    
    customTargetInput.addEventListener('input', () => {
        const value = parseInt(customTargetInput.value);
        if (value > 0) {
            target = value;
            saveCounterData();
            updateProgressRing();
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
// Celebration
// ========================
function showCelebration() {
    celebration.classList.add('active');
    vibrateMilestone();
    
    setTimeout(() => {
        celebration.classList.remove('active');
    }, 3000);
}

// ========================
// Streak Calculation
// ========================
function calculateStreak() {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    if (sessions.length === 0) {
        streakDays = 0;
        streakNumber.textContent = streakDays;
        return;
    }
    
    const today = new Date().setHours(0, 0, 0, 0);
    let streak = 0;
    let currentDate = today;
    
    const sessionDates = sessions.map(s => new Date(s.date).setHours(0, 0, 0, 0));
    const uniqueDates = [...new Set(sessionDates)].sort((a, b) => b - a);
    
    for (let date of uniqueDates) {
        if (date === currentDate) {
            streak++;
            currentDate -= 86400000; // 1 day in ms
        } else {
            break;
        }
    }
    
    streakDays = streak;
    streakNumber.textContent = streakDays;
}

// ========================
// AI Insights
// ========================
function generateInsights() {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    const insightsContent = document.getElementById('insightsContent');
    
    if (sessions.length < 3) {
        insightsContent.innerHTML = `
            <div class="insight-card glass">
                <h3>🤖 AI Insights</h3>
                <p>Keep counting! We need at least 3 sessions to generate personalized insights.</p>
            </div>
        `;
        return;
    }
    
    // Analyze patterns
    const timeOfDayMap = {};
    const dhikrFrequency = {};
    let totalSpeed = 0;
    
    sessions.forEach(s => {
        const hour = new Date(s.date).getHours();
        const timeOfDay = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
        timeOfDayMap[timeOfDay] = (timeOfDayMap[timeOfDay] || 0) + 1;
        
        dhikrFrequency[s.dhikr] = (dhikrFrequency[s.dhikr] || 0) + 1;
        
        if (s.duration > 0 && s.count > 0) {
            const speed = (s.count / (s.duration / 60000));
            totalSpeed += speed;
        }
    });
    
    const avgSpeed = (totalSpeed / sessions.length).toFixed(1);
    const bestTime = Object.entries(timeOfDayMap).sort((a, b) => b[1] - a[1])[0][0];
    const favDhikr = Object.entries(dhikrFrequency).sort((a, b) => b[1] - a[1])[0][0];
    
    const insights = [
        {
            icon: '🌟',
            title: 'Peak Performance',
            description: `You're most active during ${bestTime}. Try scheduling your dhikr practice then.`
        },
        {
            icon: '⚡',
            title: 'Average Speed',
            description: `Your average counting speed is ${avgSpeed} per minute. Keep up the rhythm!`
        },
        {
            icon: '💚',
            title: 'Favorite Dhikr',
            description: `${favDhikr} is your most practiced dhikr. Consider exploring others too.`
        },
        {
            icon: '📈',
            title: 'Growth Trend',
            description: `You've completed ${sessions.filter(s => s.completed).length} sessions. Great progress!`
        }
    ];
    
    insightsContent.innerHTML = insights.map(insight => `
        <div class="insight-card glass scale-in">
            <div style="font-size: 48px; margin-bottom: 12px;">${insight.icon}</div>
            <h3>${insight.title}</h3>
            <p>${insight.description}</p>
        </div>
    `).join('');
}

// ========================
// Achievements System
// ========================
const achievements = [
    { id: 'first_count', icon: '🎯', title: 'First Count', desc: 'Complete your first tasbih', target: 1 },
    { id: 'century', icon: '💯', title: 'Century', desc: 'Count to 100', target: 100 },
    { id: 'marathon', icon: '🏃', title: 'Marathon', desc: 'Count to 1000', target: 1000 },
    { id: 'dedication', icon: '🔥', title: 'Dedication', desc: '7 day streak', target: 7 },
    { id: 'consistent', icon: '⭐', title: 'Consistent', desc: '30 day streak', target: 30 },
    { id: 'speed_demon', icon: '⚡', title: 'Speed Demon', desc: 'Count 100/min', target: 100 },
    { id: 'ten_sessions', icon: '📊', title: 'Ten Sessions', desc: 'Complete 10 sessions', target: 10 },
    { id: 'fifty_sessions', icon: '🎉', title: 'Half Century', desc: 'Complete 50 sessions', target: 50 }
];

function checkAchievements() {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    const unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    
    achievements.forEach(achievement => {
        if (unlockedAchievements.includes(achievement.id)) return;
        
        let unlocked = false;
        
        if (achievement.id === 'first_count' && counter >= 1) unlocked = true;
        if (achievement.id === 'century' && counter >= 100) unlocked = true;
        if (achievement.id === 'marathon' && counter >= 1000) unlocked = true;
        if (achievement.id === 'dedication' && streakDays >= 7) unlocked = true;
        if (achievement.id === 'consistent' && streakDays >= 30) unlocked = true;
        if (achievement.id === 'ten_sessions' && sessions.length >= 10) unlocked = true;
        if (achievement.id === 'fifty_sessions' && sessions.length >= 50) unlocked = true;
        
        if (unlocked) {
            unlockedAchievements.push(achievement.id);
            localStorage.setItem('achievements', JSON.stringify(unlockedAchievements));
            showToast(`🏆 Achievement Unlocked: ${achievement.title}!`, 4000);
            vibrateMilestone();
        }
    });
}

function loadAchievements() {
    const achievementsGrid = document.getElementById('achievementsGrid');
    const unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    
    achievementsGrid.innerHTML = achievements.map(achievement => {
        const isUnlocked = unlockedAchievements.includes(achievement.id);
        return `
            <div class="achievement-item glass ${isUnlocked ? '' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            </div>
        `;
    }).join('');
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
    themeCircle.style.backgroundColor = isDark ? '#f0f4f8' : '#0a0e27';
    
    themeCircle.classList.add('expanding');
    
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
        'insights': document.getElementById('insightsView'),
        'achievements': document.getElementById('achievementsView'),
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
    if (viewName === 'insights') generateInsights();
    if (viewName === 'achievements') loadAchievements();
    
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
        countersList.innerHTML = '<p style="text-align: center; color: var(--text-color); opacity: 0.7; padding: 40px;">No saved counters yet. Create one to get started!</p>';
        return;
    }
    
    counters.forEach(c => {
        const item = document.createElement('div');
        item.className = 'counter-item glass';
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
        showToast('✅ Counter created!');
    }
});

// ========================
// Session History
// ========================
function saveSession() {
    if (counter === 0) {
        showToast('⚠️ No data to save!');
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
    if (sessions.length > 100) sessions.pop(); // Keep last 100 sessions
    localStorage.setItem('sessions', JSON.stringify(sessions));
    
    calculateStreak();
    checkAchievements();
    showToast('✅ Session saved successfully!');
    vibrate(100);
}

function loadHistory() {
    const historyList = document.getElementById('historyList');
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    
    historyList.innerHTML = '';
    
    if (sessions.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-color); opacity: 0.7; padding: 40px;">No history yet. Complete a session to see it here!</p>';
        return;
    }
    
    sessions.forEach(session => {
        const date = new Date(session.date);
        const item = document.createElement('div');
        item.className = 'history-item glass';
        item.innerHTML = `
            <h3>${session.dhikr} ${session.completed ? '✅' : ''}</h3>
            <p>Count: ${session.count}/${session.target} • ${formatTime(Math.floor(session.duration / 1000))}</p>
            <p style="font-size: 12px; opacity: 0.6;">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</p>
        `;
        historyList.appendChild(item);
    });
}

document.getElementById('exportBtn').addEventListener('click', () => {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    if (sessions.length === 0) {
        showToast('⚠️ No data to export!');
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
    showToast('✅ History exported!');
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
    const longestStreak = streakDays;
    
    // Most used dhikr
    const dhikrCounts = {};
    sessions.forEach(s => {
        dhikrCounts[s.dhikr] = (dhikrCounts[s.dhikr] || 0) + 1;
    });
    const mostUsedDhikr = Object.keys(dhikrCounts).length > 0 
        ? Object.entries(dhikrCounts).sort((a, b) => b[1] - a[1])[0][0] 
        : 'None';
    
    statsContent.innerHTML = `
        <div class="stats-card glass scale-in">
            <h3>📊 Overall Statistics</h3>
            <div class="stats-grid">
                <div class="stat-item glass">
                    <div class="stat-icon">📝</div>
                    <div class="stat-content">
                        <span class="stat-label">Total Sessions</span>
                        <span class="stat-value">${totalSessions}</span>
                    </div>
                </div>
                <div class="stat-item glass">
                    <div class="stat-icon">🔢</div>
                    <div class="stat-content">
                        <span class="stat-label">Total Count</span>
                        <span class="stat-value">${totalCount}</span>
                    </div>
                </div>
                <div class="stat-item glass">
                    <div class="stat-icon">✅</div>
                    <div class="stat-content">
                        <span class="stat-label">Completed</span>
                        <span class="stat-value">${completedSessions}</span>
                    </div>
                </div>
                <div class="stat-item glass">
                    <div class="stat-icon">📈</div>
                    <div class="stat-content">
                        <span class="stat-label">Avg Count</span>
                        <span class="stat-value">${avgCount}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="stats-card glass scale-in" style="animation-delay: 0.1s">
            <h3>⚡ Performance Metrics</h3>
            <div class="stats-grid">
                <div class="stat-item glass">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-content">
                        <span class="stat-label">Completion Rate</span>
                        <span class="stat-value">${completionRate}%</span>
                    </div>
                </div>
                <div class="stat-item glass">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-content">
                        <span class="stat-label">Longest Session</span>
                        <span class="stat-value">${longestSession}</span>
                    </div>
                </div>
                <div class="stat-item glass">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-content">
                        <span class="stat-label">Avg Duration</span>
                        <span class="stat-value">${formatTime(avgDuration)}</span>
                    </div>
                </div>
                <div class="stat-item glass">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-content">
                        <span class="stat-label">Current Streak</span>
                        <span class="stat-value">${longestStreak}d</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="stats-card glass scale-in" style="animation-delay: 0.2s">
            <h3>💚 Favorites</h3>
            <div class="stat-item glass">
                <div class="stat-icon">⭐</div>
                <div class="stat-content">
                    <span class="stat-label">Most Used Dhikr</span>
                    <span class="stat-value" style="font-size: 14px;">${mostUsedDhikr}</span>
                </div>
            </div>
        </div>
    `;
}

// ========================
// 99 Names of Allah (Complete List)
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
    if (!namesList) return;
    
    namesList.innerHTML = names.map((name, index) => `
        <div class="name-item glass">
            <div class="name-arabic">${name.arabic}</div>
            <div class="name-transliteration">${index + 1}. ${name.transliteration}</div>
            <div class="name-meaning">${name.meaning}</div>
        </div>
    `).join('');
}

// ========================
// Qibla Finder
// ========================
function initQiblaFinder() {
    if ('geolocation' in navigator) {
        showToast('🧭 Getting your location...');
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const qiblaAngle = calculateQibla(lat, lon);
            
            document.getElementById('qiblaInfo').innerHTML = `
                <p>Qibla direction: ${qiblaAngle.toFixed(2)}° from North</p>
                <p>Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}</p>
            `;
            
            showToast('✅ Qibla direction found!');
            
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
            showToast('❌ Unable to get location. Please enable location services.');
        });
    } else {
        showToast('❌ Geolocation is not supported by your device.');
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
// Cloud Sync (Preparation)
// ========================
let syncQueue = [];

function enableCloudSync() {
    showToast('☁️ Cloud sync coming soon!');
    // Future: Implement with Firebase/Supabase
}

function queueSyncData(data) {
    if (settings.cloudSync) {
        syncQueue.push({
            timestamp: Date.now(),
            data: data
        });
    }
}

function syncToCloud() {
    if (syncQueue.length > 0 && navigator.onLine) {
        showToast('☁️ Syncing data...');
        // Future: Send syncQueue to cloud
        syncQueue = [];
    }
}

// ========================
// Notifications
// ========================
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showToast('✅ Notifications enabled!');
                settings.notifications = true;
                document.getElementById('notificationsToggle').checked = true;
                saveSettings();
            } else {
                showToast('❌ Notification permission denied');
            }
        });
    } else {
        showToast('❌ Notifications not supported on this device');
    }
}

function sendNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'https://cdn-icons-png.flaticon.com/512/7113/7113227.png',
            badge: 'https://cdn-icons-png.flaticon.com/512/7113/7113227.png',
            vibrate: [200, 100, 200]
        });
    }
}

// ========================
// PWA Install
// ========================
document.getElementById('installBtn')?.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            showToast('✅ App installed!');
        }
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
        showToast('✅ All data cleared');
        setTimeout(() => location.reload(), 1000);
    });
}

function enterFullscreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
        showToast('📱 Fullscreen enabled');
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
        showToast('📱 Fullscreen disabled');
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

// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('✅ Service Worker registered'))
        .catch(err => console.log('❌ SW registration failed'));
}
