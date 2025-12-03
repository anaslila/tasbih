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

const STORAGE_KEY = 'tasbih_v911';

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

console.log('✅ Tasbih v9.1.1 LOADED - Fixed target menu + date format');
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
                const offset = -parseInt(digit) * 85;
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
    const circumference = 2 * Math.PI * 155;
    const progress = Math.min(counter / target, 1);
    const offset = circumference - (progress * circumference);
    progressRing.style.strokeDashoffset = offset;
}

// ============================================
// INCREMENT COUNTER
// ============================================
if (plusBtn) {
    plusBtn.addEventListener('click', function() {
        const now = Date.now();
        
        // First count - start session
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
        
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(10);
        
        // Target reached
        if (counter === target) {
            showToast('🎉 Target reached! MashaAllah!');
            if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
        }
    });
}

// ============================================
// DECREMENT COUNTER
// ============================================
if (minusBtn) {
    minusBtn.addEventListener('click', function() {
        if (counter > 0) {
            counter--;
            timestamps.pop();
            
            // Reset if back to zero
            if (counter === 0) {
                firstCountTime = null;
                timestamps = [];
            }
            
            updateDisplay();
            updateProgress();
            saveData();
            updateStats();
            
            if (navigator.vibrate) navigator.vibrate(10);
        }
    });
}

// ============================================
// 🔥 FLAGSHIP FEATURE: STATISTICS
// TIME, SPEED, ETC - ALL WITH PROPER DATE FORMAT
// ============================================
function updateStats() {
    if (counter > 0 && firstCountTime) {
        const now = Date.now();
        const elapsed = now - firstCountTime;
        
        // ============================================
        // TIME (HH:MM:SS format)
        // ============================================
        const h = Math.floor(elapsed / 3600000);
        const m = Math.floor((elapsed % 3600000) / 60000);
        const s = Math.floor((elapsed % 60000) / 1000);
        
        if (timeValue) timeValue.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
        
        // Time detail - "Started at 03-Dec-25, 6:52 PM"
        if (timeDetail) {
            const startDate = new Date(firstCountTime);
            timeDetail.textContent = 'Started at ' + formatDateTimeFull(startDate);
        }
        
        // ============================================
        // SPEED (Counts Per Minute)
        // ============================================
        const minutes = elapsed / 60000;
        const speed = minutes > 0 ? Math.round(counter / minutes) : 0;
        if (speedValue) speedValue.innerHTML = speed + '<span class="unit">/min</span>';
        
        // ============================================
        // ETC (Estimated Time to Completion)
        // ============================================
        if (counter < target) {
            const remaining = target - counter;
            const avgMs = elapsed / counter;
            const etcMs = remaining * avgMs;
            
            // Format ETC time
            if (etcValue) etcValue.textContent = formatETC(etcMs);
            
            // Calculate completion time - "Might end at 04-Dec-25, 2:15 AM"
            if (etcDetail) {
                const completionDate = new Date(now + etcMs);
                etcDetail.textContent = 'Might end at ' + formatDateTimeFull(completionDate);
            }
        } else {
            if (etcValue) etcValue.textContent = 'Done!';
            if (etcDetail) etcDetail.textContent = 'Target completed ✅';
        }
    } else {
        // Not started
        if (timeValue) timeValue.textContent = '00:00:00';
        if (timeDetail) timeDetail.textContent = 'Not started';
        if (speedValue) speedValue.innerHTML = '0<span class="unit">/min</span>';
        if (etcValue) etcValue.textContent = '--';
        if (etcDetail) etcDetail.textContent = 'Not started';
    }
}

// ============================================
// TARGET MENU - OPEN/CLOSE
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

// Preset target chips
document.querySelectorAll('.target-chip').forEach(function(chip) {
    chip.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Update active state
        document.querySelectorAll('.target-chip').forEach(function(c) {
            c.classList.remove('active');
        });
        chip.classList.add('active');
        
        // Set target
        target = parseInt(chip.dataset.target);
        if (targetValue) targetValue.textContent = target;
        
        updateProgress();
        updateStats();
        saveData();
        
        showToast('Target set to ' + target);
        
        // Close after selection
        setTimeout(closeTargetMenu, 300);
    });
});

// Custom target
if (setBtn) {
    setBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const val = parseInt(customInput.value);
        if (val && val > 0 && val < 10000) {
            // Clear active chips
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
            
            // Close after setting
            setTimeout(closeTargetMenu, 300);
        } else {
            showToast('Please enter 1-9999');
        }
    });
}

// ============================================
// RESET - PREMIUM POPUP ANIMATION
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
        
        // Animate counter down to zero
        const startCount = counter;
        const duration = 800;
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            counter = Math.round(startCount * (1 - easeProgress));
            updateDisplay();
            updateProgress();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Reset complete
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
// UTILITY FUNCTIONS
// ============================================
function pad(n) {
    return String(n).padStart(2, '0');
}

// Format date and time - "03-Dec-25, 6:52 PM"
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

// Format time in 12-hour AM/PM format - "6:52 PM"
function formatTime12Hour(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    const minutesStr = pad(minutes);
    
    return hours + ':' + minutesStr + ' ' + ampm;
}

// Format ETC time (5h 23m or 2d 5h)
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
    
    // Return formatted based on scale
    if (y > 0) return mo > 0 ? y + 'y ' + mo + 'mo' : y + ' year' + (y > 1 ? 's' : '');
    if (mo > 0) return w > 0 ? mo + 'mo ' + w + 'w' : mo + ' month' + (mo > 1 ? 's' : '');
    if (w > 0) return d > 0 ? w + 'w ' + d + 'd' : w + ' week' + (w > 1 ? 's' : '');
    if (d > 0) return h > 0 ? d + 'd ' + h + 'h' : d + ' day' + (d > 1 ? 's' : '');
    if (h > 0) return m > 0 ? h + 'h ' + m + 'm' : h + ' hour' + (h > 1 ? 's' : '');
    if (m > 0) return s > 0 ? m + 'm ' + s + 's' : m + ' min';
    return s + 's';
}

// Show toast notification
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
// LOCAL STORAGE (PERSISTENT DATA)
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
            
            // Update active target chip
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

// Save before unload
window.addEventListener('beforeunload', saveData);

// Save periodically (every 30 seconds)
setInterval(function() {
    if (counter > 0) {
        saveData();
    }
}, 30000);

// ============================================
// PWA INSTALL PROMPTS
// ============================================
let deferredPrompt;

// Check if already installed
if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('✅ App is installed');
} else {
    // iOS detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS && !localStorage.getItem('iosPromptDismissed')) {
        setTimeout(function() {
            const iosPrompt = document.getElementById('iosPrompt');
            if (iosPrompt) {
                iosPrompt.classList.add('show');
                
                const closeBtn = document.getElementById('iosPromptClose');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        iosPrompt.classList.remove('show');
                        localStorage.setItem('iosPromptDismissed', 'true');
                    });
                }
            }
        }, 5000);
    }
}

// Android PWA install
window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    
    if (!localStorage.getItem('androidPromptDismissed')) {
        setTimeout(function() {
            const androidPrompt = document.getElementById('androidPrompt');
            if (androidPrompt) {
                androidPrompt.classList.add('show');
                
                const installBtn = document.getElementById('androidInstallBtn');
                if (installBtn) {
                    installBtn.addEventListener('click', async function() {
                        androidPrompt.classList.remove('show');
                        deferredPrompt.prompt();
                        const result = await deferredPrompt.userChoice;
                        console.log('Install outcome:', result.outcome);
                        deferredPrompt = null;
                    });
                }
                
                const closeBtn = document.getElementById('androidPromptClose');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        androidPrompt.classList.remove('show');
                        localStorage.setItem('androidPromptDismissed', 'true');
                    });
                }
            }
        }, 5000);
    }
});

window.addEventListener('appinstalled', function() {
    console.log('✅ PWA installed successfully');
    showToast('App installed! ✅');
});

// ============================================
// SERVICE WORKER
// ============================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(function(reg) {
            console.log('✅ Service Worker registered:', reg.scope);
        })
        .catch(function(err) {
            console.error('❌ SW registration failed:', err);
        });
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        if (plusBtn) plusBtn.click();
    } else if (e.code === 'Backspace') {
        e.preventDefault();
        if (minusBtn) minusBtn.click();
    } else if (e.code === 'KeyR' && e.ctrlKey) {
        e.preventDefault();
        if (resetBtn) resetBtn.click();
    }
});

// ============================================
// PREVENT CONTEXT MENU
// ============================================
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// ============================================
// VISIBILITY CHANGE (Save when tab hidden)
// ============================================
document.addEventListener('visibilitychange', function() {
    if (document.hidden && counter > 0) {
        saveData();
        console.log('💾 Data saved (tab hidden)');
    }
});

// ============================================
// END OF SCRIPT - V9.1.1 COMPLETE 🚀
// ============================================
console.log('✅ All event listeners attached');
console.log('🔥 Flagship features ready:');
console.log('   ✅ TIME with full date (DD-MMM-YY, HH:MM AM/PM)');
console.log('   ✅ ETC with full date (DD-MMM-YY, HH:MM AM/PM)');
console.log('   ✅ Target menu fixed (opens on click, hidden by default)');

// End of DOMContentLoaded
});
