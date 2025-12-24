/* ===== TO DO WITH EDIT & DELETE ===== */
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
const taskList = document.getElementById("taskList");

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "todo-item";

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = task.text;
    if (task.done) text.classList.add("done");

    text.onclick = () => {
      tasks[index].done = !tasks[index].done;
      saveTasks();
    };

    const actions = document.createElement("div");
    actions.className = "todo-actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editTask(index);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete";
    deleteBtn.onclick = () => deleteTask(index);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(text);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
}

// ===== ENTER KEY SUPPORT =====
const taskInput = document.getElementById("taskInput");

taskInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

function addTask() {
  const input = document.getElementById("taskInput");
  if (input.value.trim() === "") return;

  tasks.push({ text: input.value, done: false });
  input.value = "";
  saveTasks();
}

function editTask(index) {
  const newText = prompt("Edit task:", tasks[index].text);
  if (newText !== null && newText.trim() !== "") {
    tasks[index].text = newText;
    saveTasks();
  }
}

function deleteTask(index) {
  if (confirm("Delete this task?")) {
    tasks.splice(index, 1);
    saveTasks();
  }
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

/* ===== TIMER WITH SNOOZE & DISMISS ===== */
let time = 1500;
let timerInterval = null;
let isRunning = false;

const alarmSound = document.getElementById("alarmSound");
let activeNotification = null;

function updateTimer() {
  const min = Math.floor(time / 60);
  const sec = time % 60;
  document.getElementById("timer").textContent =
    `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

function toggleTimer() {
  const btn = document.getElementById("startPauseBtn");

  if (!isRunning) {
    timerInterval = setInterval(() => {
      if (time > 0) {
        time--;
        updateTimer();
      } else {
        timerFinished();
      }
    }, 1000);
    btn.textContent = "Pause";
    isRunning = true;
  } else {
    clearInterval(timerInterval);
    timerInterval = null;
    btn.textContent = "Start";
    isRunning = false;
  }
}

function resetTimer() {
  stopAlarm();
  time = 1500;
  isRunning = false;
  document.getElementById("startPauseBtn").textContent = "Start";
  updateTimer();
}

function addTime(minutes) {
  time += minutes * 60;
  if (time < 60) time = 60;
  updateTimer();
}

/* ===== WHEN TIMER FINISHES ===== */
function timerFinished() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  document.getElementById("startPauseBtn").textContent = "Start";

  // Use alarm sound system
  playAlarmSound();
  
  // Also show custom notification bar
  showNotification();
}

/* ===== CUSTOM RINGTONE SYSTEM WITH FILE UPLOAD ===== */
let alarmVolume = parseFloat(localStorage.getItem('alarmVolume')) || 0.7;
let customRingtone = localStorage.getItem('customRingtone') || null;
let customRingtoneName = localStorage.getItem('customRingtoneName') || null;
let useCustomSound = localStorage.getItem('useCustomSound') === 'true' || false;
let currentAudio = null;

// Initialize ringtone system
function initRingtones() {
    setupVolumeControl();
    setupFileUpload();
    
    // Ask for notification permission
    if ("Notification" in window && Notification.permission === "default") {
        setTimeout(() => {
            Notification.requestPermission();
        }, 2000);
    }
}

// Setup file upload - FIXED VERSION
function setupFileUpload() {
    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
        const fileInput = document.getElementById('ringtoneUpload');
        const fileUploadBtn = document.getElementById('fileUploadBtn');
        const playBtn = document.getElementById('playCustomRingtoneBtn');
        const testBtn = document.getElementById('testAlarmBtn');
        const fileNameDisplay = document.getElementById('selectedFileName');
        const customRingtoneInfo = document.getElementById('customRingtoneInfo');
        const ringtoneNameDisplay = document.getElementById('ringtoneName');
        
        console.log("File upload setup started...");
        
        if (!fileInput) {
            console.error("File input not found!");
            return;
        }
        
        // Handle file upload button
        if (fileUploadBtn) {
            // Remove any existing onclick
            fileUploadBtn.onclick = null;
            
            // Add single event listener
            fileUploadBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("File upload button clicked");
                fileInput.click();
            });
        } else {
            console.error("File upload button not found!");
        }
        
        // Handle file selection
        fileInput.addEventListener('change', function handleFileSelect(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            console.log("File selected:", file.name);
            
            // Validate file
            if (!validateAudioFile(file)) {
                alert('Please select a valid audio file (MP3, WAV, OGG, M4A) under 5MB');
                this.value = ''; // Clear file input
                return;
            }
            
            // Read file as data URL
            const reader = new FileReader();
            reader.onload = function(event) {
                // Save to localStorage
                customRingtone = event.target.result;
                customRingtoneName = file.name;
                localStorage.setItem('customRingtone', customRingtone);
                localStorage.setItem('customRingtoneName', customRingtoneName);
                
                console.log("File saved to localStorage");
                
                // Update UI
                if (fileNameDisplay) {
                    fileNameDisplay.textContent = `Selected: ${file.name}`;
                }
                if (ringtoneNameDisplay) {
                    ringtoneNameDisplay.textContent = file.name;
                }
                if (customRingtoneInfo) {
                    customRingtoneInfo.style.display = 'block';
                }
                
                // Auto-select custom sound option
                const useCustomRadio = document.getElementById('useCustomSound');
                const useBrowserRadio = document.getElementById('useBrowserSound');
                if (useCustomRadio) {
                    useCustomRadio.checked = true;
                    useCustomSound = true;
                    localStorage.setItem('useCustomSound', 'true');
                }
                if (useBrowserRadio) {
                    useBrowserRadio.checked = false;
                }
                
                // ✅ FIXED: Don't auto-play, show success message instead
                showToast(`🎵 Ringtone "${file.name}" saved successfully!`, 'success');
            };
            
            reader.onerror = function() {
                alert('Error reading file. Please try again.');
                fileInput.value = '';
            };
            
            reader.readAsDataURL(file);
        });
        
        // Handle play button
        if (playBtn) {
            // Remove onclick attribute if exists
            playBtn.onclick = null;
            
            playBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Play button clicked");
                playCustomRingtone();
            });
        }
        
        // Handle test button
        if (testBtn) {
            // Remove onclick attribute if exists
            testBtn.onclick = null;
            
            testBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Test button clicked");
                testAlarmSound();
            });
        }
        
        // Load existing custom ringtone
        if (customRingtone && customRingtoneName) {
            console.log("Loading existing ringtone:", customRingtoneName);
            if (fileNameDisplay) {
                fileNameDisplay.textContent = `Selected: ${customRingtoneName}`;
            }
            if (ringtoneNameDisplay) {
                ringtoneNameDisplay.textContent = customRingtoneName;
            }
            if (customRingtoneInfo) {
                customRingtoneInfo.style.display = 'block';
            }
        }
        
        // Setup radio buttons
        const useBrowserRadio = document.getElementById('useBrowserSound');
        const useCustomRadio = document.getElementById('useCustomSound');
        
        if (useBrowserRadio && useCustomRadio) {
            // Set initial state
            useBrowserRadio.checked = !useCustomSound;
            useCustomRadio.checked = useCustomSound;
            
            // Event listener for browser radio
            useBrowserRadio.addEventListener('change', function() {
                if (this.checked) {
                    useCustomSound = false;
                    localStorage.setItem('useCustomSound', 'false');
                    console.log("Switched to browser sound");
                }
            });
            
            // Event listener for custom radio
            useCustomRadio.addEventListener('change', function() {
                if (this.checked) {
                    useCustomSound = true;
                    localStorage.setItem('useCustomSound', 'true');
                    console.log("Switched to custom sound");
                    
                    // If no custom ringtone selected, prompt to select one
                    if (!customRingtone) {
                        alert('Please select a ringtone file first');
                        if (fileUploadBtn) fileUploadBtn.click();
                        this.checked = false;
                        useBrowserRadio.checked = true;
                        useCustomSound = false;
                    }
                }
            });
        }
        
        console.log("File upload setup complete");
    }, 100);
}

// Validate audio file
function validateAudioFile(file) {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert('File too large! Maximum size is 5MB');
        return false;
    }
    
    // Check file type
    const validTypes = [
        'audio/mpeg', // mp3
        'audio/wav', 'audio/x-wav', // wav
        'audio/ogg', // ogg
        'audio/mp4', 'audio/x-m4a', // m4a
        'audio/aac' // aac
    ];
    
    if (!validTypes.includes(file.type)) {
        // Check by extension as fallback
        const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
        const fileName = file.name.toLowerCase();
        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
        
        if (!hasValidExtension) {
            return false;
        }
    }
    
    return true;
}

// Play custom ringtone
function playCustomRingtone() {
    console.log("playCustomRingtone called");
    
    if (!customRingtone) {
        alert('No custom ringtone selected!');
        return;
    }
    
    stopCurrentSound();
    
    try {
        const audio = new Audio(customRingtone);
        audio.volume = alarmVolume;
        
        audio.onended = function() {
            currentAudio = null;
        };
        
        audio.onerror = function() {
            alert('Error playing audio file. Please select a different file.');
            currentAudio = null;
        };
        
        audio.play();
        currentAudio = audio;
    } catch (error) {
        console.error('Error playing custom ringtone:', error);
        alert('Error playing audio file');
    }
}

// Play alarm sound (based on selection)
function playAlarmSound() {
    stopCurrentSound();
    
    if (useCustomSound && customRingtone) {
        // Play custom ringtone
        playCustomRingtoneLoop();
    } else {
        // Use browser notifications with fallback beep
        playFallbackBeep();
        showAlarmNotification();
    }
}

// Play custom ringtone in loop (for alarm)
function playCustomRingtoneLoop() {
    if (!customRingtone) {
        playFallbackBeep();
        return;
    }
    
    try {
        const audio = new Audio(customRingtone);
        audio.volume = alarmVolume;
        audio.loop = true;
        audio.play();
        currentAudio = audio;
        
        audio.onerror = function() {
            // Fallback to beep if custom file fails
            playFallbackBeep();
            currentAudio = null;
        };
    } catch (error) {
        console.error('Error playing custom ringtone loop:', error);
        playFallbackBeep();
    }
}

// Fallback beep sound using Web Audio API
function playFallbackBeep() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        
        gainNode.gain.value = alarmVolume * 0.3; // Lower volume for beep
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 300);
    } catch (error) {
        console.log("Web Audio not supported, using notification only");
    }
}

// Show alarm notification
function showAlarmNotification() {
    if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification("⏰ Timer Finished!", {
            body: "Time's up! Take a break or snooze.",
            tag: "timer-alarm",
            requireInteraction: true,
            silent: false // This uses browser's default notification sound
        });
        
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
        
        // Auto-close after 10 seconds
        setTimeout(() => notification.close(), 10000);
        
        return notification;
    }
    return null;
}

// Test alarm sound
function testAlarmSound() {
    stopCurrentSound();
    
    if (useCustomSound && customRingtone) {
        // Test custom ringtone
        try {
            const audio = new Audio(customRingtone);
            audio.volume = alarmVolume;
            audio.play();
            currentAudio = audio;
            
            audio.onended = function() {
                currentAudio = null;
            };
        } catch (error) {
            alert('Error playing custom ringtone. Please select a different file.');
        }
    } else {
        // Test browser notification
        playFallbackBeep();
        
        if (Notification.permission === "granted") {
            const notification = new Notification("🔔 Test Alarm", {
                body: "This is how your alarm will sound",
                silent: false
            });
            setTimeout(() => notification.close(), 2000);
        } else {
            alert("🔔 Test Beep\nEnable notifications for browser sound");
        }
    }
}

// Stop current sound
function stopCurrentSound() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}

/* ===== VOLUME CONTROL ===== */
function setupVolumeControl() {
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    
    if (volumeSlider && volumeValue) {
        volumeSlider.value = alarmVolume * 100;
        volumeValue.textContent = Math.round(alarmVolume * 100) + '%';
        
        volumeSlider.addEventListener('input', function() {
            alarmVolume = this.value / 100;
            volumeValue.textContent = this.value + '%';
            localStorage.setItem('alarmVolume', alarmVolume);
            
            // Update volume of currently playing audio
            if (currentAudio) {
                currentAudio.volume = alarmVolume;
            }
        });
    }
}

// Update stopAlarm to stop any ongoing sounds
function stopAlarm() {
    stopCurrentSound();
    
    // Stop the old alarm if it exists
    if (alarmSound) {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }
}

/* ===== NOTIFICATION BAR WITH ACTIONS ===== */
function showNotification() {
  if (activeNotification) activeNotification.remove();

  const div = document.createElement("div");
  div.className = "notification";

  div.innerHTML = `
    ⏰ Time's up!
    <div class="notification-actions">
      <button class="snooze">Snooze</button>
      <button class="dismiss">Dismiss</button>
    </div>
  `;

  document.body.appendChild(div);
  activeNotification = div;

  div.querySelector(".snooze").onclick = snoozeTimer;
  div.querySelector(".dismiss").onclick = dismissTimer;

  if (Notification.permission === "granted") {
    new Notification("Timer Finished", {
      body: "Time's up! Snooze or Dismiss?",
    });
  }
}

/* ===== SNOOZE & DISMISS ===== */
function snoozeTimer() {
  stopAlarm();
  if (activeNotification) {
    activeNotification.remove();
    activeNotification = null;
  }

  time = 300; // 5 minutes snooze
  updateTimer();
  toggleTimer(); // restart timer
}

function dismissTimer() {
  stopAlarm();
  if (activeNotification) {
    activeNotification.remove();
    activeNotification = null;
  }
  resetTimer();
}

/* ===== ASK NOTIFICATION PERMISSION ===== */
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

/* ===== QUICK NOTES SYSTEM (Todo-style) ===== */
let savedNotes = JSON.parse(localStorage.getItem('savedNotes')) || [];

// Function to add note
function addNote() {
    const textarea = document.getElementById('notes');
    const noteText = textarea.value.trim();
    
    if (!noteText) {
        alert("Please write something first!");
        return;
    }
    
    // Create new note object
    const newNote = {
        id: Date.now(), // Unique ID
        text: noteText,
        date: new Date().toLocaleString(),
        color: getRandomColor() // Optional: random color for each note
    };
    
    // Add to array
    savedNotes.push(newNote);
    
    // Save to localStorage
    localStorage.setItem('savedNotes', JSON.stringify(savedNotes));
    
    // Clear textarea
    textarea.value = '';
    
    // Refresh display
    displayNotes();
    
    // Show confirmation
    showNoteConfirmation();
}

// Function to display all notes
function displayNotes() {
    const container = document.getElementById('notesList');
    if (!container) return;
    
    if (savedNotes.length === 0) {
        container.innerHTML = '<p class="empty-notes">No notes yet. Add your first note!</p>';
        return;
    }
    
    // Display notes in reverse order (newest first)
    container.innerHTML = savedNotes.slice().reverse().map(note => `
        <div class="note-card" style="border-left: 4px solid ${note.color}">
            <div class="note-content">
                <div class="note-text">${note.text}</div>
                <div class="note-date">📅 ${note.date}</div>
            </div>
            <div class="note-actions">
                <button onclick="editNote(${note.id})" class="note-edit">Edit</button>
                <button onclick="deleteNote(${note.id})" class="note-delete">Delete</button>
            </div>
        </div>
    `).join('');
}

// Function to edit note
function editNote(id) {
    const note = savedNotes.find(n => n.id === id);
    if (!note) return;
    
    const newText = prompt("Edit your note:", note.text);
    if (newText !== null && newText.trim() !== "") {
        note.text = newText.trim();
        note.date = new Date().toLocaleString() + " (edited)";
        
        localStorage.setItem('savedNotes', JSON.stringify(savedNotes));
        displayNotes();
    }
}

// Function to delete note
function deleteNote(id) {
    if (confirm("Delete this note?")) {
        savedNotes = savedNotes.filter(note => note.id !== id);
        localStorage.setItem('savedNotes', JSON.stringify(savedNotes));
        displayNotes();
    }
}

// Function to get random color for notes
function getRandomColor() {
    const colors = [
        "#6366f1", "#8b5cf6", "#3b82f6", "#06b6d4",
        "#10b981", "#84cc16", "#f59e0b", "#ef4444"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Function to show confirmation
function showNoteConfirmation() {
    // Create a temporary message
    const msg = document.createElement('div');
    msg.textContent = "✓ Note added!";
    msg.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        z-index: 999;
        font-weight: bold;
        animation: fadeInOut 2s ease;
    `;
    
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
}

/* ===== TOAST NOTIFICATION FUNCTION ===== */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#6366f1'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: 500;
        animation: fadeInOut 2.5s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
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

/* ===== ADDITIONAL EVENT LISTENERS FOR BUTTONS ===== */
function setupButtonListeners() {
    // Todo button
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addTask);
    }
    
    // Timer buttons
    const addTime5Btn = document.getElementById('addTime5Btn');
    if (addTime5Btn) {
        addTime5Btn.addEventListener('click', () => addTime(5));
    }
    
    const addTimeMinus5Btn = document.getElementById('addTimeMinus5Btn');
    if (addTimeMinus5Btn) {
        addTimeMinus5Btn.addEventListener('click', () => addTime(-5));
    }
    
    const startPauseBtn = document.getElementById('startPauseBtn');
    if (startPauseBtn) {
        startPauseBtn.addEventListener('click', toggleTimer);
    }
    
    const resetTimerBtn = document.getElementById('resetTimerBtn');
    if (resetTimerBtn) {
        resetTimerBtn.addEventListener('click', resetTimer);
    }
    
    // Notes button
    const addNoteBtn = document.getElementById('addNoteBtn');
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', addNote);
    }
}

/* ===== DEBUG FUNCTION ===== */
function debugFileUpload() {
    console.log("=== DEBUG FILE UPLOAD ===");
    console.log("customRingtone exists:", !!customRingtone);
    console.log("customRingtoneName:", customRingtoneName);
    console.log("useCustomSound:", useCustomSound);
    console.log("Elements found:");
    console.log("- fileUploadBtn:", document.getElementById('fileUploadBtn'));
    console.log("- ringtoneUpload:", document.getElementById('ringtoneUpload'));
    console.log("- selectedFileName:", document.getElementById('selectedFileName'));
    console.log("- customRingtoneInfo:", document.getElementById('customRingtoneInfo'));
    console.log("- ringtoneName:", document.getElementById('ringtoneName'));
    console.log("- playCustomRingtoneBtn:", document.getElementById('playCustomRingtoneBtn'));
    console.log("- testAlarmBtn:", document.getElementById('testAlarmBtn'));
    console.log("=== END DEBUG ===");
}

/* ===== INITIALIZE ON PAGE LOAD ===== */
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing...");
    
    // Initialize notes
    displayNotes();
    
    // Enter key support for textarea
    const textarea = document.getElementById('notes');
    if (textarea) {
        textarea.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                addNote();
            }
        });
    }
    
    // Initialize theme
    initTheme();
    watchSystemTheme();
    
    // Initialize ringtones
    initRingtones();
    
    // Setup button listeners
    setupButtonListeners();
    
    // Initialize timer display
    updateTimer();
    
    // Initialize tasks
    renderTasks();
    
    console.log("Initialization complete");
});

// Make functions globally available
window.toggleTheme = toggleTheme;
window.setTheme = setTheme;
window.testAlarmSound = testAlarmSound;
window.playCustomRingtone = playCustomRingtone;
window.addNote = addNote;
window.editNote = editNote;
window.deleteNote = deleteNote;
window.addTask = addTask;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.toggleTimer = toggleTimer;
window.resetTimer = resetTimer;
window.addTime = addTime;
window.snoozeTimer = snoozeTimer;
window.dismissTimer = dismissTimer;
window.debugFileUpload = debugFileUpload;

// Initial calls
updateTimer();
renderTasks();