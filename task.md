# Execution Tasks

- [x] **1. Firebase Setup & Offline Persistence**
    - [x] Enable `enableIndexedDbPersistence` in `firebase.js`
    - [x] Initialize Firebase Messaging
- [x] **2. Role Linking & Synchronization**
    - [x] Update `AuthContext.jsx` with linking functions
    - [x] Create "Care Team" linking logic in Firestore
    - [x] Update `DoctorPacientes.jsx` to filter by doctor ID
- [x] **3. Real-time Chat System**
    - [x] Create `ChatRoom.jsx` component
    - [x] Integrate ChatRoom into Patient, Caregiver, and Doctor apps
- [x] **4. Emergency SOS & Notifications**
    - [x] Add SOS button to Patient Home
    - [x] Implement "Alert Listener" with prioritized Overlays
    - [x] Integrate with Firestore `alerts` collection
- [x] **5. PWA Support (Offline App)**
    - [x] Create `manifest.json`
    - [x] Add Service Worker registration to `index.js`
    - [x] Basic asset caching logic in `sw.js`
