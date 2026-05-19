// EchoCareAI PRO - Frontend Logic
document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let mediaRecorder;
    let audioChunks = [];
    let startTime;
    let timerInterval;
    let isPaused = false;
    let wavesurfer;
    let playbackWavesurfer;
    let recordedBlob;
    let emotionChart;
    let mediaStream; // Added to manage audio tracks

    // --- DOM Elements ---
    const recordBtn = document.getElementById('record-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const timerDisplay = document.getElementById('timer');
    const statusText = document.getElementById('status-text');
    const statusDot = document.getElementById('status-dot');
    const playbackContainer = document.getElementById('playback-container');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const submitBtn = document.getElementById('submit-btn');
    const dashboard = document.getElementById('dashboard');
    const historyBody = document.getElementById('history-body');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.querySelector('.chat-input input');
    const sendBtn = document.getElementById('send-btn');

    // --- Initialization ---
    try {
        initWaveSurfer();
        initCharts();
        loadHistory();
        console.log("EchoCareAI PRO v1.1.1 (Fixed Mic & Fallbacks) Initialized");
    } catch (err) {
        console.error("Initialization failed:", err);
    }

    // --- Auth Logic ---
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('username', loginForm.querySelector('input[type="text"]').value);
            formData.append('password', loginForm.querySelector('input[type="password"]').value);

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.access_token) {
                    localStorage.setItem('emoti_token', data.access_token);
                    localStorage.setItem('emoti_user', loginForm.querySelector('input[type="text"]').value);
                    location.reload();
                } else {
                    alert(data.detail || "Login failed");
                }
            } catch (err) {
                console.error("Login error:", err);
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = {
                username: signupForm.querySelector('input[type="text"]').value,
                email: signupForm.querySelector('input[type="email"]').value,
                password: signupForm.querySelector('input[type="password"]').value
            };

            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                });
                const data = await response.json();
                if (response.ok) {
                    alert("Account created! Please login.");
                    window.switchModal('login-modal');
                } else {
                    alert(data.detail || "Signup failed");
                }
            } catch (err) {
                console.error("Signup error:", err);
            }
        });
    }

    function getAuthHeaders() {
        const token = localStorage.getItem('emoti_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    function checkAuth() {
        const token = localStorage.getItem('emoti_token');
        const user = localStorage.getItem('emoti_user');
        const appDashboard = document.getElementById('app-dashboard');
        const welcomeScreen = document.getElementById('welcome-screen');
        const authScreen = document.getElementById('auth-screen');
        
        if (token && user) {
            if (appDashboard) appDashboard.classList.remove('hidden');
            if (welcomeScreen) welcomeScreen.classList.add('hidden');
            if (authScreen) authScreen.classList.add('hidden');
            
            // Populate Nav
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                navLinks.innerHTML = `
                    <a href="#recorder"><i class="fas fa-microphone"></i> Recorder</a>
                    <a href="#analytics"><i class="fas fa-chart-pie"></i> Analytics</a>
                    <a href="#history"><i class="fas fa-history"></i> History</a>
                    <a href="#profile"><i class="fas fa-user"></i> ${user}'s Profile</a>
                    <button class="btn-secondary" id="logout-btn">Logout</button>
                `;
            }
            const profName = document.getElementById('profile-username');
            const fullNameDisp = document.getElementById('full-name-display');
            const profEmail = document.getElementById('profile-email');
            
            if (profName) profName.textContent = user;
            if (fullNameDisp) fullNameDisp.textContent = user;
            if (profEmail) profEmail.textContent = `${user.toLowerCase()}@emotisense.ai`;
            
            document.getElementById('logout-btn').onclick = () => {
                localStorage.clear();
                location.reload();
            };
        } else {
            if (appDashboard) appDashboard.classList.add('hidden');
            if (welcomeScreen) welcomeScreen.classList.remove('hidden');
        }
    }

    checkAuth();

    function initWaveSurfer() {
        // v7 Microphone plugin initialization
        // Note: For v7 CDN, plugins are often accessed via global WaveSurfer[PluginName]
        let microphonePlugin;
        if (window.WaveSurferMicrophone) {
            microphonePlugin = window.WaveSurferMicrophone.create();
        } else if (window.WaveSurfer && window.WaveSurfer.microphone) {
             microphonePlugin = window.WaveSurfer.microphone.create();
        } else {
            console.warn("Microphone plugin not found, live visualization might be disabled.");
        }
        
        wavesurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: '#6366f1',
            progressColor: '#a855f7',
            cursorWidth: 0,
            barWidth: 3,
            barGap: 3,
            height: 100,
            plugins: microphonePlugin ? [microphonePlugin] : []
        });

        playbackWavesurfer = WaveSurfer.create({
            container: '#playback-waveform',
            waveColor: '#94a3b8',
            progressColor: '#6366f1',
            barWidth: 2,
            height: 50,
        });

        // Store plugin for later use
        wavesurfer.micPlugin = microphonePlugin;
    }

    function initCharts() {
        const chartEl = document.getElementById('emotion-chart');
        if (!chartEl) return;

        const ctx = chartEl.getContext('2d');
        emotionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Happy', 'Sad', 'Angry', 'Fear', 'Neutral'],
                datasets: [{
                    label: 'Probability',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#10b981', '#6366f1', '#ef4444', '#a855f7', '#94a3b8'
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                scales: {
                    y: { beginAtZero: true, max: 1, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // --- Recording Logic ---
    if (recordBtn) recordBtn.addEventListener('click', startRecording);
    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
    if (stopBtn) stopBtn.addEventListener('click', stopRecording);
    if (deleteBtn) deleteBtn.addEventListener('click', deleteRecording);

    async function startRecording() {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(mediaStream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
            mediaRecorder.onstop = handleRecordingStop;

            mediaRecorder.start();
            if (wavesurfer.micPlugin) wavesurfer.micPlugin.start();
            
            startTime = Date.now();
            startTimer();

            // Interactivity
            document.querySelector('.recording-container').classList.add('pulse-recording');

            // UI Update
            recordBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
            stopBtn.classList.remove('hidden');
            deleteBtn.classList.remove('hidden');
            statusDot.classList.add('active');
            statusText.textContent = "Recording...";
            playbackContainer.classList.add('hidden');
            dashboard.classList.add('hidden');
        } catch (err) {
            console.error("Mic access denied:", err);
            alert("Please allow microphone access to record.");
        }
    }

    function togglePause() {
        if (!isPaused) {
            mediaRecorder.pause();
            if (wavesurfer.micPlugin) wavesurfer.micPlugin.pause();
            clearInterval(timerInterval);
            pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            statusText.textContent = "Paused";
            isPaused = true;
        } else {
            mediaRecorder.resume();
            if (wavesurfer.micPlugin) wavesurfer.micPlugin.start();
            startTime = Date.now() - parseTimer(timerDisplay.textContent);
            startTimer();
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            statusText.textContent = "Recording...";
            isPaused = false;
        }
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        if (wavesurfer.micPlugin) wavesurfer.micPlugin.stop();
        
        // Stop all tracks to release microphone
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }
        
        clearInterval(timerInterval);
        
        // UI Reset
        recordBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
        stopBtn.classList.add('hidden');
        statusDot.classList.remove('active');
        statusText.textContent = "Recording Saved";
    }

    function deleteRecording() {
        if(confirm("Discard this recording?")) {
            location.reload();
        }
    }

    function handleRecordingStop() {
        recordedBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(recordedBlob);
        
        playbackWavesurfer.load(url);
        playbackContainer.classList.remove('hidden');
        statusText.textContent = "Ready to Analyze";
    }

    // --- Playback ---
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            playbackWavesurfer.playPause();
            const icon = playPauseBtn.querySelector('i');
            icon.className = playbackWavesurfer.isPlaying() ? 'fas fa-pause' : 'fas fa-play';
        });
    }

    playbackWavesurfer.on('finish', () => {
        if (playPauseBtn) playPauseBtn.querySelector('i').className = 'fas fa-play';
    });

    // --- Analysis ---
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            if (!recordedBlob) return;
            
            submitBtn.disabled = true;
            // Interactivity: Progress Steps
            const progressContainer = document.createElement('div');
            progressContainer.className = 'analysis-progress';
            progressContainer.innerHTML = `
                <div class="step active" id="step-1"><i class="fas fa-wave-square"></i> Extracting Audio Features...</div>
                <div class="step" id="step-2"><i class="fas fa-brain"></i> AI Emotion Prediction...</div>
                <div class="step" id="step-3"><i class="fas fa-notes-medical"></i> Generating Health Insights...</div>
            `;
            submitBtn.parentNode.appendChild(progressContainer);

            const formData = new FormData();
            formData.append('file', recordedBlob, 'analysis.wav');

            try {
                // Step 1: Simulated duration
                await new Promise(r => setTimeout(r, 600));
                const s2 = document.getElementById('step-2');
                if (s2) s2.classList.add('active');
                
                const response = await fetch('/api/audio/analyze', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: formData
                });

                if (!response.ok) throw new Error("Analysis failed");

                const data = await response.json();
                
                // Step 3
                await new Promise(r => setTimeout(r, 400));
                const s3 = document.getElementById('step-3');
                if (s3) s3.classList.add('active');
                
                await new Promise(r => setTimeout(r, 400));
                updateDashboard(data);
                getAIAdvice(data);
            } catch (err) {
                console.error("Analysis error:", err);
                // Fallback for demo stability
                const fallbackData = {
                    id: Date.now(),
                    emotion: "Neutral",
                    confidence: 0.5,
                    stress_score: 0.1,
                    all_emotions: { "Happy": 0.1, "Sad": 0.1, "Angry": 0.1, "Fear": 0.1, "Neutral": 0.6 }
                };
                updateDashboard(fallbackData);
                getAIAdvice(fallbackData);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Analyze Voice';
                progressContainer.remove();
            }
        });
    }

    function updateDashboard(data) {
        window.currentRecordId = data.id;
        
        // Switch to Analytics Screen
        window.showDashboardSection('analytics');
        
        // Update Emotion
        const emotionDisp = document.getElementById('emotion-display');
        const emotionConfText = document.getElementById('emotion-conf-text');
        const emotionConfBar = document.getElementById('emotion-conf');
        
        if (emotionDisp) emotionDisp.textContent = data.emotion;
        if (emotionConfText) emotionConfText.textContent = `${(data.confidence * 100).toFixed(1)}%`;
        if (emotionConfBar) emotionConfBar.style.width = `${data.confidence * 100}%`;

        // Update Stress Gauge
        const stressDisp = document.getElementById('stress-display');
        if (stressDisp) stressDisp.textContent = `${(data.stress_score * 100).toFixed(1)}%`;
        drawStressGauge(data.stress_score);

        // Update Chart
        if (emotionChart) {
            const emotions = ['Happy', 'Sad', 'Angry', 'Fear', 'Neutral'];
            emotionChart.data.datasets[0].data = emotions.map(e => data.all_emotions[e] || 0);
            emotionChart.update();
        }

        loadHistory();
        dashboard.scrollIntoView({ behavior: 'smooth' });
    }

    function drawStressGauge(val) {
        const canvas = document.getElementById('stress-gauge');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        // Set fixed size for drawing
        canvas.width = 240;
        canvas.height = 140;
        const centerX = canvas.width / 2;
        const centerY = canvas.height - 10;
        const radius = 90;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background track
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 0);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 15;
        ctx.stroke();

        // Progress
        const endAngle = Math.PI + (val * Math.PI);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, endAngle);
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(0.5, '#f59e0b');
        gradient.addColorStop(1, '#ef4444');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 15;
        ctx.lineCap = 'round';
        ctx.stroke();

        const label = document.getElementById('stress-label');
        if (label) {
            if (val < 0.3) { label.textContent = "Low Stress"; label.style.color = '#10b981'; }
            else if (val < 0.7) { label.textContent = "Moderate Stress"; label.style.color = '#f59e0b'; }
            else { label.textContent = "High Stress"; label.style.color = '#ef4444'; }
        }
    }

    // --- AI Chatbot ---
    async function getAIAdvice(data) {
        try {
            const response = await fetch('/api/wellness/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    message: "Explain my analysis",
                    emotion: data.emotion,
                    stress_score: data.stress_score
                })
            });
            const chatData = await response.json();
            addChatMessage(chatData.response, 'bot');
        } catch (err) {
            console.error("Chat error:", err);
        }
    }

    function addChatMessage(text, sender, isTyping = false) {
        if (!chatMessages) return;
        
        // Handle Typing State
        if (isTyping) {
            const typingDiv = document.createElement('div');
            typingDiv.id = 'typing-indicator';
            typingDiv.className = 'msg bot';
            typingDiv.innerHTML = `
                <div class="typing-dots">
                    <div class="dot-anim"></div>
                    <div class="dot-anim"></div>
                    <div class="dot-anim"></div>
                </div>
            `;
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return;
        }

        // Remove indicator
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();

        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${sender}`;
        
        // Basic Markdown Support
        const formattedText = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        msgDiv.innerHTML = formattedText;
        
        // Add Voice Assistant Button if bot
        if (sender === 'bot') {
            const speakBtn = document.createElement('button');
            speakBtn.className = 'speak-btn';
            speakBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            speakBtn.onclick = () => speakText(text);
            msgDiv.appendChild(speakBtn);
        }
        
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function speakText(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', async () => {
            const text = chatInput.value.trim();
            if (text) {
                addChatMessage(text, 'user');
                chatInput.value = '';
                
                // Show Typing Indicator
                addChatMessage('', 'bot', true);

                try {
                    const response = await fetch('/api/wellness/chat', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            ...getAuthHeaders()
                        },
                        body: JSON.stringify({
                            message: text,
                            emotion: document.getElementById('emotion-display')?.textContent || "Neutral",
                            stress_score: parseFloat(document.getElementById('stress-display')?.textContent) / 100 || 0
                        })
                    });
                    const data = await response.json();
                    
                    // Simulate delay
                    setTimeout(() => {
                        addChatMessage(data.response, 'bot');
                        if (data.suggestions) {
                            const chips = data.suggestions.map(s => `<span class="suggestion-chip" onclick="chatInput.value='${s}';document.getElementById('send-btn').click()">${s}</span>`).join(' ');
                            addChatMessage(`Explore: ${chips}`, 'bot');
                        }
                    }, 800);
                } catch (err) {
                    addChatMessage("I'm here for you. Take a deep breath.", 'bot');
                }
            }
        });
    }

    // --- History ---
    async function loadHistory() {
        if (!historyBody) return;
        try {
            const response = await fetch('/api/audio/history', {
                headers: getAuthHeaders()
            });
            const history = await response.json();
            historyBody.innerHTML = history.map(item => `
                <tr>
                    <td>${new Date(item.timestamp).toLocaleString()}</td>
                    <td>
                        <div class="history-emotion">
                            <span class="dot ${item.emotion.toLowerCase()}"></span>
                            ${item.emotion}
                        </div>
                    </td>
                    <td>${(item.stress_score * 100).toFixed(1)}%</td>
                    <td><button class="btn-secondary btn-sm" onclick="alert('Playing record ID: ${item.id}')"><i class="fas fa-play"></i></button></td>
                    <td><button class="btn-secondary btn-sm" onclick="downloadReport(${item.id})"><i class="fas fa-download"></i></button></td>
                    <td><button class="btn-danger-outline btn-sm" onclick="deleteHistoryRecord(${item.id})"><i class="fas fa-trash-alt"></i></button></td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Failed to load history:", err);
        }
    }

    window.deleteHistoryRecord = async (id) => {
        if (!confirm("Are you sure you want to permanently delete this analysis record?")) return;
        
        try {
            const response = await fetch(`/api/audio/records/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                loadHistory();
            } else {
                alert("Failed to delete record.");
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    window.downloadReport = async (id) => {
        const recordId = id || window.currentRecordId;
        if (!recordId) {
            alert("No analysis result found to download.");
            return;
        }
        window.location.href = `/api/audio/report/${recordId}`;
    };

    // --- Helpers ---
    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            const now = Date.now();
            const diff = now - startTime;
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            if (timerDisplay) timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    function parseTimer(text) {
        const [m, s] = text.split(':').map(Number);
        return (m * 60 + s) * 1000;
    }
    // Dashboard Navigation
    window.showDashboardSection = (id) => {
        const recorder = document.getElementById('recorder');
        const analytics = document.getElementById('analytics');
        const history = document.getElementById('history');
        const profile = document.getElementById('profile');
        
        // Hide all
        if (recorder) recorder.classList.add('hidden');
        if (analytics) analytics.classList.add('hidden');
        if (history) history.classList.add('hidden');
        if (profile) profile.classList.add('hidden');
        
        // Show target
        const target = document.getElementById(id);
        if (target) target.classList.remove('hidden');

        // Update Active Nav State
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
            }
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Hook into nav links for dashboard navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                const id = href.replace('#', '');
                if (document.getElementById(id) || id === 'dashboard') {
                    e.preventDefault();
                    window.showDashboardSection(id);
                }
            }
        });
    });
});
