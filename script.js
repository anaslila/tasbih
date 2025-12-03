// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {

// ============================================
// STATE MANAGEMENT
// ============================================
let counter = 0;
let target = 33;
let firstCountTime = null;
let timestamps = [];
let statsInterval = null;

const STORAGE_KEY = 'tasbih_v912';

// ============================================
// DOM ELEMENTS
// ============================================
const digitContainers = [
    document.getElementById('digit0'),
    document.getElementById('digit1'),
    document.getElementById('digit2'),
    document.getElementById('digit3')
];

const progressRing = document.getElementById('progressRing');
const targetBtn = document.getElementById('targetBtn');
const targetValue = document.getElementById('targetValue');
const targetMenuOverlay = document.getElementById('targetMenuOverlay');
const targetMenuBox = document.getElementById('targetMenuBox');
const targetCloseBtn = document.getElementById('targetCloseBtn');
const customInput = document.getElementById('customInput');
const setBtn = document.getElementById('setBtn');
const plusBtn = document.getElementById('plusBtn');
const minusBtn = document.getElementById('minusBtn');
const resetBtn = document.getElementById('resetBtn');
const saveBtn = document.getElementById('saveBtn');
const resetPopup = document.getElementById('resetPopup');
const cancelBtn = document.getElementById('cancelBtn');
const confirmBtn = document.getElementById('confirmBtn');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');

const totalCount = document.getElementById('totalCount');
const timeValue = document.getElementById('timeValue');
const timeDetail = document.getElementById('timeDetail');
const speedValue = document.getElementById('speedValue');
const etcValue = document.getElementById('etcValue');
const etcDetail = document.getElementById('etcDetail');

// ============================================
// INITIALIZATION
// ============================================
loadData();
updateDisplay();
updateProgress();
updateStats();

// Start stats interval - updates every second
statsInterval = setInterval(updateStats, 1000);

console.log('✅ Tasbih v9.1.2 LOADED - Fixed double tap + haptic');
console.log('📊 State:', { counter, target, firstCountTime });

// ============================================
// DISPLAY UPDATE (Rolling Animation)
// ============================================
function updateDisplay() {
    const digits = String(counter).padStart(4, '0').split('');
    digits.forEach((digit, index) => {
        const container = digitContainers[3 - index];
        if (container) {
            const roller = container.querySelector('.digit-roller');
            if (roller) {
                const offset = -parseInt(digit) * 80;
                roller.style.transform = `translateY(${offset}px)`;
            }
        }
    });
    if (totalCount) totalCount.textContent = counter;
}

// ============================================
// PROGRESS RING
// ============================================
function updateProgress() {
    if (!progressRing) return;
    const circumference = 2 * Math.PI * 128;
    const progress = Math.min(counter / target, 1);
    const offset = circumference - (progress * circumference);
    progressRing.style.strokeDashoffset = offset;
}

// ============================================
// INCREMENT FUNCTION
// ============================================
function incrementCounter() {
    const now = Date.now();
    
    if (counter === 0) {
        firstCountTime = now;
        timestamps = [now];
        console.log('🆕 Session started:', formatDateTimeFull(new Date(now)));
    } else {
        timestamps.push(now);
    }
    
    counter++;
    updateDisplay();
    updateProgress();
    saveData();
    updateStats();
    
    if (counter === target) {
        showToast('🎉 Target reached! MashaAllah!');
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    }
}

// ============================================
// DECREMENT FUNCTION
// ============================================
function decrementCounter() {
    if (counter > 0) {
        counter--;
        timestamps.pop();
        
        if (counter === 0) {
            firstCountTime = null;
            timestamps = [];
        }
        
        updateDisplay();
        updateProgress();
        saveData();
        updateStats();
    }
}

// ============================================
// BUTTON CLICKS (with INSTANT animation + HAPTIC)
// ============================================
if (plusBtn) {
    plusBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('pressed');
        
        if (navigator.vibrate) navigator.vibrate(15);
        incrementCounter();
    });
    
    plusBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        this.classList.remove('pressed');
    });
    
    plusBtn.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        this.classList.add('pressed');
        incrementCounter();
    });
    
    plusBtn.addEventListener('mouseup', function() {
        this.classList.remove('pressed');
    });
}

if (minusBtn) {
    minusBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('pressed');
        
        if (navigator.vibrate) navigator.vibrate(15);
        decrementCounter();
    });
    
    minusBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        this.classList.remove('pressed');
    });
    
    minusBtn.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        this.classList.add('pressed');
        decrementCounter();
    });
    
    minusBtn.addEventListener('mouseup', function() {
        this.classList.remove('pressed');
    });
}

// ============================================
// SCREEN TAP ZONES (LEFT = -, RIGHT = +)
// FIXED: Prevent double counting on mobile
// ============================================
let lastTapTime = 0;
const tapDebounce = 100;

document.addEventListener('touchstart', function(e) {
    const now = Date.now();
    
    if (now - lastTapTime < tapDebounce) {
        return;
    }
    lastTapTime = now;
    
    if (
        e.target.closest('.control-btn') ||
        e.target.closest('.fab') ||
        e.target.closest('.target-btn') ||
        e.target.closest('.target-menu-overlay') ||
        e.target.closest('.popup-overlay') ||
        e.target.closest('.stat-card') ||
        e.target.closest('.toast')
    ) {
        return;
    }
    
    const screenWidth = window.innerWidth;
    const tapX = e.touches[0].clientX;
    
    if (tapX > screenWidth / 2) {
        e.preventDefault();
        incrementCounter();
        
        if (navigator.vibrate) navigator.vibrate(15);
        
        if (plusBtn) {
            plusBtn.classList.add('pressed');
            setTimeout(() => plusBtn.classList.remove('pressed'), 150);
        }
    } else {
        e.preventDefault();
        decrementCounter();
        
        if (navigator.vibrate) navigator.vibrate(15);
        
        if (minusBtn) {
            minusBtn.classList.add('pressed');
            setTimeout(() => minusBtn.classList.remove('pressed'), 150);
        }
    }
}, { passive: false });

document.addEventListener('click', function(e) {
    if ('ontouchstart' in window) {
        return;
    }
    
    if (
        e.target.closest('.control-btn') ||
        e.target.closest('.fab') ||
        e.target.closest('.target-btn') ||
        e.target.closest('.target-menu-overlay') ||
        e.target.closest('.popup-overlay') ||
        e.target.closest('.stat-card') ||
        e.target.closest('.toast')
    ) {
        return;
    }
    
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;
    
    if (clickX > screenWidth / 2) {
        incrementCounter();
        if (plusBtn) {
            plusBtn.classList.add('pressed');
            setTimeout(() => plusBtn.classList.remove('pressed'), 150);
        }
    } else {
        decrementCounter();
        if (minusBtn) {
            minusBtn.classList.add('pressed');
            setTimeout(() => minusBtn.classList.remove('pressed'), 150);
        }
    }
});

// ============================================
// STATISTICS
// ============================================
function updateStats() {
    if (counter > 0 && firstCountTime) {
        const now = Date.now();
        const elapsed = now - firstCountTime;
        
        const h = Math.floor(elapsed / 3600000);
        const m = Math.floor((elapsed % 3600000) / 60000);
        const s = Math.floor((elapsed % 60000) / 1000);
        
        if (timeValue) timeValue.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
        
        if (timeDetail) {
            const startDate = new Date(firstCountTime);
            timeDetail.textContent = 'Started at ' + formatDateTimeFull(startDate);
        }
        
        const minutes = elapsed / 60000;
        const speed = minutes > 0 ? Math.round(counter / minutes) : 0;
        if (speedValue) speedValue.innerHTML = speed + '<span class="unit">/min</span>';
        
        if (counter < target) {
            const remaining = target - counter;
            const avgMs = elapsed / counter;
            const etcMs = remaining * avgMs;
            
            if (etcValue) etcValue.textContent = formatETC(etcMs);
            
            if (etcDetail) {
                const completionDate = new Date(now + etcMs);
                etcDetail.textContent = 'Might end at ' + formatDateTimeFull(completionDate);
            }
        } else {
            if (etcValue) etcValue.textContent = 'Done!';
            if (etcDetail) etcDetail.textContent = 'Target completed ✅';
        }
    } else {
        if (timeValue) timeValue.textContent = '00:00:00';
        if (timeDetail) timeDetail.textContent = 'Not started';
        if (speedValue) speedValue.innerHTML = '0<span class="unit">/min</span>';
        if (etcValue) etcValue.textContent = '--';
        if (etcDetail) etcDetail.textContent = 'Not started';
    }
}

// ============================================
// TARGET MENU
// ============================================
if (targetBtn) {
    targetBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openTargetMenu();
    });
}

if (targetCloseBtn) {
    targetCloseBtn.addEventListener('click', function() {
        closeTargetMenu();
    });
}

if (targetMenuOverlay) {
    targetMenuOverlay.addEventListener('click', function(e) {
        if (e.target === targetMenuOverlay) {
            closeTargetMenu();
        }
    });
}

function openTargetMenu() {
    if (targetMenuOverlay) {
        targetMenuOverlay.classList.add('active');
    }
}

function closeTargetMenu() {
    if (targetMenuOverlay) {
        targetMenuOverlay.classList.remove('active');
    }
}

document.querySelectorAll('.target-chip').forEach(function(chip) {
    chip.addEventListener('click', function(e) {
        e.stopPropagation();
        
        document.querySelectorAll('.target-chip').forEach(function(c) {
            c.classList.remove('active');
        });
        chip.classList.add('active');
        
        target = parseInt(chip.dataset.target);
        if (targetValue) targetValue.textContent = target;
        
        updateProgress();
        updateStats();
        saveData();
        
        showToast('Target set to ' + target);
        setTimeout(closeTargetMenu, 300);
    });
});

if (setBtn) {
    setBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const val = parseInt(customInput.value);
        if (val && val > 0 && val < 10000) {
            document.querySelectorAll('.target-chip').forEach(function(c) {
                c.classList.remove('active');
            });
            
            target = val;
            if (targetValue) targetValue.textContent = target;
            customInput.value = '';
            
            updateProgress();
            updateStats();
            saveData();
            
            showToast('Custom target set to ' + target);
            setTimeout(closeTargetMenu, 300);
        } else {
            showToast('Please enter 1-9999');
        }
    });
}

// ============================================
// RESET
// ============================================
if (resetBtn) {
    resetBtn.addEventListener('click', function() {
        if (counter > 0 && resetPopup) {
            resetPopup.classList.add('active');
        } else {
            showToast('Counter is already at 0');
        }
    });
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
        if (resetPopup) resetPopup.classList.remove('active');
    });
}

if (confirmBtn) {
    confirmBtn.addEventListener('click', function() {
        if (resetPopup) resetPopup.classList.remove('active');
        
        const startCount = counter;
        const duration = 800;
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            counter = Math.round(startCount * (1 - easeProgress));
            updateDisplay();
            updateProgress();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                counter = 0;
                firstCountTime = null;
                timestamps = [];
                
                updateDisplay();
                updateProgress();
                updateStats();
                saveData();
                
                showToast('Counter reset ✅');
            }
        }
        
        animate();
    });
}

// ============================================
// SAVE SESSION
// ============================================
if (saveBtn) {
    saveBtn.addEventListener('click', function() {
        if (counter === 0) {
            showToast('No data to save!');
            return;
        }
        
        const sessions = JSON.parse(localStorage.getItem('tasbihSessions') || '[]');
        const elapsed = firstCountTime ? (Date.now() - firstCountTime) : 0;
        
        sessions.unshift({
            id: Date.now(),
            count: counter,
            target: target,
            duration: elapsed,
            date: new Date().toISOString(),
            completed: counter >= target
        });
        
        if (sessions.length > 50) sessions.pop();
        localStorage.setItem('tasbihSessions', JSON.stringify(sessions));
        
        showToast('Session saved! ✅');
    });
}

// ============================================
// UTILITIES
// ============================================
function pad(n) {
    return String(n).padStart(2, '0');
}

function formatDateTimeFull(date) {
    const day = pad(date.getDate());
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);
    
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    const minutesStr = pad(minutes);
    
    return day + '-' + month + '-' + year + ', ' + hours + ':' + minutesStr + ' ' + ampm;
}

function formatETC(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    
    if (totalSeconds < 1) return '< 1s';
    if (totalSeconds < 60) return totalSeconds + 's';
    
    const s = totalSeconds % 60;
    const m = Math.floor(totalSeconds / 60) % 60;
    const h = Math.floor(totalSeconds / 3600) % 24;
    const d = Math.floor(totalSeconds / 86400) % 7;
    const w = Math.floor(totalSeconds / 604800) % 4;
    const mo = Math.floor(totalSeconds / 2592000) % 12;
    const y = Math.floor(totalSeconds / 31536000);
    
    if (y > 0) return mo > 0 ? y + 'y ' + mo + 'mo' : y + ' year' + (y > 1 ? 's' : '');
    if (mo > 0) return w > 0 ? mo + 'mo ' + w + 'w' : mo + ' month' + (mo > 1 ? 's' : '');
    if (w > 0) return d > 0 ? w + 'w ' + d + 'd' : w + ' week' + (w > 1 ? 's' : '');
    if (d > 0) return h > 0 ? d + 'd ' + h + 'h' : d + ' day' + (d > 1 ? 's' : '');
    if (h > 0) return m > 0 ? h + 'h ' + m + 'm' : h + ' hour' + (h > 1 ? 's' : '');
    if (m > 0) return s > 0 ? m + 'm ' + s + 's' : m + ' min';
    return s + 's';
}

function showToast(msg) {
    if (toastText) toastText.textContent = msg;
    if (toast) {
        toast.classList.add('show');
        setTimeout(function() {
            toast.classList.remove('show');
        }, 2500);
    }
}

// ============================================
// STORAGE
// ============================================
function saveData() {
    const data = {
        counter: counter,
        target: target,
        firstCountTime: firstCountTime,
        timestamps: timestamps,
        saved: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            counter = data.counter || 0;
            target = data.target || 33;
            firstCountTime = data.firstCountTime || null;
            timestamps = data.timestamps || [];
            
            if (targetValue) targetValue.textContent = target;
            
            document.querySelectorAll('.target-chip').forEach(function(chip) {
                if (parseInt(chip.dataset.target) === target) {
                    chip.classList.add('active');
                } else {
                    chip.classList.remove('active');
                }
            });
            
            console.log('📂 Data loaded:', { counter, target });
        }
    } catch (e) {
        console.error('❌ Load error:', e);
    }
}

window.addEventListener('beforeunload', saveData);

setInterval(function() {
    if (counter > 0) saveData();
}, 30000);

// ============================================
// PWA
// ============================================
let deferredPrompt;

if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('✅ App is installed');
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('✅ SW registered'))
        .catch(err => console.error('❌ SW failed:', err));
}

// ============================================
// KEYBOARD
// ============================================
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        incrementCounter();
        if (plusBtn) {
            plusBtn.classList.add('pressed');
            setTimeout(() => plusBtn.classList.remove('pressed'), 150);
        }
    } else if (e.code === 'Backspace') {
        e.preventDefault();
        decrementCounter();
        if (minusBtn) {
            minusBtn.classList.add('pressed');
            setTimeout(() => minusBtn.classList.remove('pressed'), 150);
        }
    }
});

document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('visibilitychange', function() {
    if (document.hidden && counter > 0) saveData();
});

console.log('✅ Fixed: No double tap on mobile!');
console.log('✅ Haptic feedback enabled!');

});
