import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDN3tbTvlUF56OG2P1rm5jtQ8cO0Ufgc4Q",
  authDomain: "zxcdreioof.firebaseapp.com",
  projectId: "zxcdreioof",
  storageBucket: "zxcdreioof.firebasestorage.app",
  messagingSenderId: "861257464557",
  appId: "1:861257464557:web:a1350af0a4f8a765856ae4"
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { app, auth, googleProvider, signInWithPopup, signOut }
