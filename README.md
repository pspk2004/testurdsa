# testURdsa - AI-Proctored Data Structures & Algorithms Platform

**[🚀 Launch Live Demo](https://testurdsa.vercel.app/)**

**testURdsa** is a full-stack, browser-based assessment platform designed to conduct secure, automated coding interviews. It leverages **Edge AI (Client-Side Machine Learning)** to perform real-time proctoring without compromising user privacy or server bandwidth.

The application simulates a real coding interview environment with an integrated IDE, test-case runner, and a rigorous anti-cheating system.

---

## 🚀 Key Features

### 1. Smart Proctoring System (Edge AI)
Unlike traditional proctoring that streams video to a server (high latency/cost), this app processes video streams **locally** in the browser using WebAssembly.
*   **Face Detection:** Detects if the candidate leaves the frame.
*   **Multi-Person Detection:** Flags if an unauthorized person enters the frame.
*   **Gaze/Head Tracking:** Uses landmarks to calculate head pose and detect if the user is constantly looking away (e.g., at a phone or notes).
*   **Event Logging:** Timestamped logs of every violation are recorded and stored in the database.

### 2. Full-Featured Coding Environment
*   **Multi-Language UI:** Supports JavaScript, Python, and C++ syntax highlighting.
*   **Sandboxed Execution:** User code (JavaScript) is executed safely within a **Web Worker**. This ensures infinite loops or malicious code cannot freeze the main application or crash the browser.
*   **Test Case Validation:** Runs code against visible examples and hidden edge cases to calculate an accurate score.

### 3. Secure Authentication & Data Persistence
*   **Hybrid Auth:** Supports Google, GitHub, and Email/Password login via Firebase Auth.
*   **Session Persistence:** Keeps users logged in across page reloads.
*   **Cloud Storage:** All test results, scores, and proctoring violation logs are saved instantaneously to Firestore.

### 4. Robust System Check
*   **Hardware Access:** Verifies Camera and Microphone permissions before the test begins.
*   **AI Model Pre-loading:** Ensures ML models are loaded into memory to prevent lag during the test.
*   **Calibration:** Includes an interactive eye-tracking calibration step to establish a baseline for the user.

---

## 🛠️ Technical Stack & Architecture

### Frontend Framework
*   **React 19:** Utilized for a reactive, component-based UI.
*   **TypeScript:** Ensures type safety across the application, particularly for complex data structures like Test Results and Proctoring Logs.
*   **Vite:** High-performance build tool for instant HMR (Hot Module Replacement) and optimized production builds.
*   **Tailwind CSS:** For rapid, responsive, and modern dark-mode styling.

### Artificial Intelligence (AI) / Machine Learning
*   **Google MediaPipe (Vision Tasks):**
    *   Used specifically for the **Face Detector** and **Landmarker** models.
    *   Runs on **WASM (WebAssembly)**, allowing near-native performance directly in the browser.
    *   *Why?* This eliminates the need for expensive backend GPU servers and ensures proctoring works even with poor internet connections.

### Backend-as-a-Service (BaaS)
*   **Firebase Authentication:** Handles identity management securely (OAuth + JWT).
*   **Cloud Firestore:** A NoSQL real-time database used to store:
    *   User Profiles
    *   Test Sessions (Questions attempted, Code written, Score)
    *   Security Logs (List of timestamps and violation types)

### Code Execution Engine
*   **Web Workers API:**
    *   Used to offload code execution to a background thread.
    *   *Why?* Executing user-submitted code on the main thread is dangerous (security risk) and can freeze the UI (UX risk). Workers provide a sandboxed environment.

---

## 📂 Project Structure

```bash
/src
├── components/       # Reusable UI (Buttons, Icons, Timer, Panels)
├── hooks/            # Custom React Hooks (useProctoring - encapsulates AI logic)
├── screens/          # Main Views (Login, Setup, Test, Results)
├── services/
│   ├── authService.ts          # Firebase Auth logic (Google/Github)
│   ├── codeExecutionService.ts # Web Worker logic for running code
│   ├── dbService.ts            # Firestore CRUD operations
│   ├── faceDetectionService.ts # Singleton MediaPipe initialization
│   └── firebase.ts             # App initialization & Env handling
├── types.ts          # TypeScript Interfaces (Strict Typing)
└── App.tsx           # Main Router & State Machine
```

---

## 🚦 Getting Started (Local Development)

### Prerequisites
*   Node.js (v16 or higher)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/testURdsa.git
    cd testURdsa
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory. You need Firebase credentials (get these from the Firebase Console).
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```
    *> **Note:** If no keys are provided, the app will launch in **Demo Mode**, using local storage and mock authentication.*

4.  **Run the App**
    ```bash
    npm run dev
    ```

---

## 🛡️ Deployment

The application is fully deployed and accessible via Vercel.

**🔗 Live URL:** [https://testurdsa.vercel.app/](https://testurdsa.vercel.app/)

The deployment pipeline utilizes Vercel's zero-config React support, automatically building the Vite project and securely injecting Firebase environment variables at runtime.

---

## 🔮 Future Improvements
*   **Backend Code Execution:** Move code execution to a Dockerized backend (e.g., Judge0) to support Python/C++ compilation securely.
*   **Audio Analysis:** Integrate Audio Classification to detect speaking or background whispering.
*   **Admin Dashboard:** A dedicated view for recruiters to replay the session logs and view the code.
