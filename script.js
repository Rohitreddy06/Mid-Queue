// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOIQhccHSyJOvcAXBjM8G-zUAfpnC3270",
  authDomain: "my-queue-app-bf0e2.firebaseapp.com",
  projectId: "my-queue-app-bf0e2",
  storageBucket: "my-queue-app-bf0e2.appspot.com",
  messagingSenderId: "961309321317",
  appId: "1:961309321317:web:3f19e5dc635d3ce84d7e8c"
};

// Global Firebase variables
let db, auth;
let currentUser = null;
let currentRole = null;
let queueListener = null;
let historyListener = null;

// These arrays will be populated with LIVE data from Firebase
let demoQueue = []; 
let demoHistory = [];

// Initialize app when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    createFloatingParticles();
    showPage('homePage');
});

function initializeApp() {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    console.log("✅ Mid-Queue successfully connected to Firebase!");

    // Set up the new doctor login form listener
    const doctorLoginForm = document.getElementById('doctorLoginForm');
    doctorLoginForm.addEventListener('submit', loginDoctor);
}

function createFloatingParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = particle.style.height = Math.random() * 10 + 5 + 'px';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        container.appendChild(particle);
    }
}

// Page Navigation
function showPage(pageId) {
    const pages = ['homePage', 'patientPage', 'doctorPage', 'historyPage'];
    pages.forEach(page => {
        document.getElementById(page).classList.add('hidden');
    });
    document.getElementById(pageId).classList.remove('hidden');
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// --- AUTHENTICATION FUNCTIONS (UPDATED) ---

// Handles the simple "Patient Portal" button click
function loginUser(role) {
    if (role === 'patient') {
        currentRole = 'patient';
        showPage('patientPage');
        startQueueListener();
        showNotification('Welcome!', 'You are viewing the patient portal.', 'info');
    }
}

// Handles the new Doctor Login form
async function loginDoctor(e) {
    e.preventDefault();
    showLoading();

    const email = document.getElementById('doctorEmail').value;
    const password = document.getElementById('doctorPassword').value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        currentRole = 'doctor';

        hideLoading();
        document.getElementById('doctorName').textContent = currentUser.email;
        showPage('doctorPage');
        startQueueListener();
        showNotification('Login Successful!', `Welcome back, ${currentUser.email}`, 'success');

    } catch (error) {
        hideLoading();
        console.error("Authentication Error:", error.code, error.message);
        showNotification("Login Failed", "Invalid email or password.", "error");
    }
}

// Uses Firebase to sign the user out
async function logout() {
    try {
        await auth.signOut();
        currentUser = null;
        currentRole = null;
        if (queueListener) queueListener(); 
        if (historyListener) historyListener();
        
        showPage('homePage');
        showNotification('Logged out', 'See you next time!', 'info');
    } catch (error) {
        console.error("Logout Error:", error);
        showNotification("Logout Failed", "Please try again.", "error");
    }
}

// --- QUEUE & HISTORY MANAGEMENT ---
// (No changes to these functions)

function startQueueListener() {
    if (queueListener) queueListener(); 
    queueListener = db.collection('queue').orderBy('timestamp', 'asc').onSnapshot(snapshot => {
        const queueData = [];
        snapshot.forEach(doc => {
            queueData.push({ id: doc.id, ...doc.data() });
        });
        demoQueue = queueData;
        updateQueueDisplay();
    }, error => {
        console.error("Error listening to queue collection: ", error);
        showNotification("Connection Error", "Could not fetch queue data.", "error");
    });
}

function updateQueueDisplay() {
    if (currentRole === 'patient') {
        updatePatientQueueView();
    } else if (currentRole === 'doctor') {
        updateDoctorQueueView();
        updateDoctorStats();
    }
}

function updatePatientQueueView() {
    const container = document.getElementById('queueTracker');
    container.innerHTML = '';

    if (demoQueue.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-white/70"><i class="ph-queue text-6xl mb-4 opacity-50"></i><p class="text-lg">No patients in queue</p></div>`;
        return;
    }

    const sortedQueue = [...demoQueue].sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        if (a.isEmergency && !b.isEmergency) return -1;
        if (!a.isEmergency && b.isEmergency) return 1;
        return (a.timestamp.seconds || 0) - (b.timestamp.seconds || 0);
    });

    sortedQueue.forEach((patient, index) => {
        const card = document.createElement('div');
        card.className = `rounded-xl p-4 transition-all duration-300 hover-scale ${patient.isEmergency ? 'emergency-glow' : 'normal-glow'}`;
        
        const waitTime = patient.timestamp ? Math.max(0, Math.floor((Date.now() - (patient.timestamp.seconds * 1000)) / 60000)) : 0;
        const progressWidth = Math.min(100, (waitTime / 30) * 100);

        card.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full ${patient.isEmergency ? 'bg-red-500' : 'bg-blue-500'} flex items-center justify-center text-white font-bold text-sm">${index + 1}</div>
                    <div><h4 class="font-semibold text-white">${patient.name}</h4><p class="text-white/70 text-sm">${patient.reason}</p></div>
                </div>
                ${patient.isEmergency ? '<span class="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">EMERGENCY</span>' : '<span class="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">NORMAL</span>'}
            </div>
            <div class="mb-2">
                <div class="flex justify-between text-white/70 text-sm mb-1">
                    <span>Wait time: ${waitTime} min</span><span>Position: ${index + 1}</span>
                </div>
                <div class="bg-white/20 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-1000 ${patient.isEmergency ? 'progress-emergency' : 'progress-normal'}" style="width: ${progressWidth}%"></div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function updateDoctorQueueView() {
    const container = document.getElementById('patientQueue');
    container.innerHTML = '';

    if (demoQueue.length === 0) {
        container.innerHTML = `<div class="p-12 text-center text-white/70"><i class="ph-users text-6xl mb-4 opacity-50"></i><p class="text-xl font-medium mb-2">No patients in queue</p><p class="text-sm">Patients will appear here when they check in</p></div>`;
        return;
    }

    const sortedQueue = [...demoQueue].sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        if (a.isEmergency && !b.isEmergency) return -1;
        if (!a.isEmergency && b.isEmergency) return 1;
        return (a.timestamp.seconds || 0) - (b.timestamp.seconds || 0);
    });

    sortedQueue.forEach((patient, index) => {
        const card = document.createElement('div');
        card.className = `p-6 transition-all duration-300 hover:bg-white/5 ${patient.isEmergency ? 'border-l-4 border-red-500 bg-red-500/5' : ''}`;
        
        const waitTime = patient.timestamp ? Math.max(0, Math.floor((Date.now() - (patient.timestamp.seconds * 1000)) / 60000)) : 0;

        card.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="relative">
                        <div class="w-12 h-12 rounded-xl ${patient.isEmergency ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'} flex items-center justify-center font-bold text-white text-lg">${index + 1}</div>
                        ${patient.isEmergency ? '<i class="ph-warning-circle absolute -top-2 -right-2 text-red-400 text-lg bg-gray-900 rounded-full"></i>' : ''}
                    </div>
                    <div>
                        <div class="flex items-center space-x-3 mb-1">
                            <h4 class="font-semibold text-white text-lg">${patient.name}</h4><span class="text-white/70 text-sm">Age: ${patient.age}</span>
                            ${patient.isEmergency ? '<span class="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">EMERGENCY</span>' : '<span class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">NORMAL</span>'}
                        </div>
                        <p class="text-white/70 text-sm">${patient.reason}</p><p class="text-white/50 text-xs mt-1">Waiting: ${waitTime} minutes</p>
                    </div>
                </div>
                <div class="flex space-x-3">
                    <button onclick="markPatientDone('${patient.id}')" class="glass rounded-xl px-6 py-3 text-white font-medium btn-ripple hover-scale transition-all duration-300"><i class="ph-check mr-2"></i>Mark Done</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function updateDoctorStats() {
    document.getElementById('totalPatients').textContent = demoQueue.length;
    document.getElementById('emergencyCount').textContent = demoQueue.filter(p => p.isEmergency).length;
    
    if (demoQueue.length > 0) {
        const totalWaitTime = demoQueue.reduce((sum, p) => {
            if (!p.timestamp) return sum;
            return sum + Math.max(0, Math.floor((Date.now() - (p.timestamp.seconds * 1000)) / 60000));
        }, 0);
        const avgWait = demoQueue.length > 0 ? Math.round(totalWaitTime / demoQueue.length) : 0;
        document.getElementById('avgWaitTime').textContent = avgWait;
    } else {
        document.getElementById('avgWaitTime').textContent = '0';
    }
    document.getElementById('completedToday').textContent = demoHistory.length;
}

document.getElementById('emergencyToggle').addEventListener('change', function() {
    const section = document.getElementById('emergencySection');
    section.classList.toggle('emergency-glow', this.checked);
});

document.getElementById('checkInForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('patientNameInput').value,
        age: parseInt(document.getElementById('patientAge').value),
        reason: document.getElementById('visitReason').value,
        isEmergency: document.getElementById('emergencyToggle').checked,
        timestamp: firebase.firestore.FieldValue.serverTimestamp() 
    };
    showLoading();
    try {
        await db.collection('queue').add(formData);
        hideLoading();
        this.reset();
        document.getElementById('emergencySection').classList.remove('emergency-glow');
        showNotification('Check-in successful!', `${formData.isEmergency ? 'Emergency priority assigned' : 'Added to queue'}`, 'success');
    } catch (error) {
        hideLoading();
        console.error("Error adding document: ", error);
        showNotification("Submission Error", "Could not add patient to the queue.", "error");
    }
});

async function markPatientDone(patientId) {
    showLoading();
    try {
        const queueRef = db.collection('queue').doc(patientId);
        const patientDoc = await queueRef.get();
        if (!patientDoc.exists) throw new Error("Patient document not found!");

        const patientData = patientDoc.data();
        const historyData = {
            ...patientData,
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const batch = db.batch();
        const historyRef = db.collection('history').doc(patientId);
        batch.set(historyRef, historyData);
        batch.delete(queueRef);
        
        await batch.commit();

        hideLoading();
        showNotification('Patient completed!', `${patientData.name} has been moved to history.`, 'success');

    } catch (error) {
        hideLoading();
        console.error("Error marking patient done: ", error);
        showNotification("Operation Failed", "Could not process the patient.", "error");
    }
}

function showHistory() {
    showPage('historyPage');
    
    if (historyListener) historyListener(); 
    historyListener = db.collection('history')
        .orderBy('completedAt', 'desc') 
        .onSnapshot(snapshot => {
            const historyData = [];
            snapshot.forEach(doc => {
                historyData.push({ id: doc.id, ...doc.data() });
            });
            demoHistory = historyData;
            renderHistory();
            updateDoctorStats(); 
        }, error => {
            console.error("Error listening to history collection: ", error);
        });
}

function backToDashboard() {
    if (currentRole === 'doctor') {
        showPage('doctorPage');
    }
}

function renderHistory() {
    const container = document.getElementById('historyGrid');
    container.innerHTML = '';

    if (demoHistory.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16 text-white/70">
                <i class="ph-clock-clockwise text-6xl mb-4 opacity-50"></i>
                <p class="text-xl font-medium mb-2">No history available</p>
                <p class="text-sm">Completed visits will appear here</p>
            </div>
        `;
        return;
    }

    demoHistory.forEach((visit, index) => {
        const card = document.createElement('div');
        card.className = 'glass-strong rounded-2xl p-6 hover-scale gradient-border fade-in';
        card.style.animationDelay = `${index * 0.1}s`;
        
        const completedTime = visit.completedAt ? new Date(visit.completedAt.seconds * 1000).toLocaleString() : 'N/A';

        card.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h4 class="font-semibold text-white text-lg">${visit.name}</h4>
                <span class="bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Completed
                </span>
            </div>
            <div class="space-y-2 text-sm text-white/70 mb-4">
                <p><i class="ph-user mr-2"></i><strong>Age:</strong> ${visit.age}</p>
                <p><i class="ph-note mr-2"></i><strong>Reason:</strong> ${visit.reason}</p>
                <p><i class="ph-calendar mr-2"></i><strong>Completed:</strong> ${completedTime}</p>
                ${visit.isEmergency ? 
                    '<p><i class="ph-warning mr-2 text-red-400"></i><strong class="text-red-400">Emergency Case</strong></p>' : 
                    ''
                }
            </div>
            <div class="pt-4 border-t border-white/10">
                <div class="flex items-center justify-between text-xs text-white/50">
                    <span>Visit ID: ${visit.id.substring(0, 8)}</span>
                    <span>${visit.isEmergency ? '🚨' : '📋'}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function showNotification(title, message, type = 'success') {
    const toast = document.getElementById('notificationToast');
    const icon = document.getElementById('toastIcon');
    const titleEl = document.getElementById('toastTitle');
    const messageEl = document.getElementById('toastMessage');
    
    const icons = {
        success: 'ph-check-circle text-green-400',
        error: 'ph-x-circle text-red-400',
        info: 'ph-info text-blue-400',
        warning: 'ph-warning text-yellow-400'
    };
    
    icon.className = `text-2xl ${icons[type] || icons.success}`;
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}