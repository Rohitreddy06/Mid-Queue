# Mid-Queue  
Smart Healthcare Queue Management System (Live Demo Open)  

➡️ **[Try it live!](https://midqueue.netlify.app/)**  

---
# 🏥 Mid-Queue – Smart Healthcare Queue Management System

Mid-Queue is a **real-time healthcare queue management web app** that helps doctors and patients manage appointments seamlessly.  
It uses **Firebase Firestore** to handle live data updates, **Firebase Authentication** for secure doctor login, and a **modern glass-UI design** powered by Tailwind CSS.

---

## 🌟 Key Features

✅ **Patient Portal**
- Easy check-in form to join the queue.
- Real-time live queue tracking.
- Emergency priority option for critical cases.
- Instant notifications when it’s your turn.

✅ **Doctor Dashboard**
- View all patients in queue with priority labels.
- Monitor emergency cases separately.
- Mark patients as “Done” to move them to history.
- Auto-update of stats like total patients, emergencies, and average wait time.

✅ **History Management**
- Automatically moves completed patients to a “History” list.
- Displays visit details including name, age, reason, and completion time.

✅ **Firebase Integration**
- Realtime Firestore database for live data sync.
- Authentication for secure doctor login.
- Cloud-based data handling with zero backend setup.

---

## 🛠️ Tech Stack

| Component     | Technology Used |
|----------------|-----------------|
| Frontend       | HTML, Tailwind CSS, JavaScript |
| Backend / DB   | Firebase Firestore |
| Authentication | Firebase Auth |
| Hosting        | Firebase Hosting (optional) |

---

## 📁 Project Structure

```

Mid-Queue/
├── index.html      # Main HTML page
├── style.css       # Tailwind & glassmorphism-based UI styling
├── script.js       # App logic, Firebase CRUD & real-time listeners
└── assets/         # (Optional) icons or images

````

---

## ⚙️ Setup & Installation

### 1️⃣ Clone this repository
```bash
git clone https://github.com/Rohitreddy06/Mid-Queue.git
cd Mid-Queue
````

### 2️⃣ Open `index.html`

Simply open the file in your browser — no server required!
*(Or use VS Code Live Server for a better experience.)*

### 3️⃣ Configure Firebase

Replace the Firebase config in `script.js` with your own from the Firebase Console:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_APP.firebaseapp.com",
  projectId: "YOUR_APP",
  storageBucket: "YOUR_APP.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 🧠 What I Learned

Building **Mid-Queue** helped me:

* Understand **Firebase Authentication & Firestore** deeply.
* Work with **real-time listeners** (`onSnapshot`) for live data updates.
* Apply **Tailwind CSS & glassmorphism** for clean modern UI.
* Implement **role-based access** (Doctor vs. Patient) in a single-page app.
* Handle asynchronous operations and error management in JavaScript.

---

## 💡 Future Improvements

* Add patient authentication for saving personal history.
* Integrate push notifications or SMS alerts.
* Deploy using Firebase Hosting or Vercel.
* Add analytics for daily queue insights.

---

## 📸 Preview

> 🏥 “Smart healthcare queue management made elegant, fast, and reliable.”

---

## 👨‍💻 Author

**Rohit Reddy**
🎓 Student Developer | Passionate about building intelligent web apps
🌐 [GitHub Profile](https://github.com/Rohitreddy06)

---

## 📜 License

This project is open-source and available under the **MIT License**.
