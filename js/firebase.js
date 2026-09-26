/* Firebase Compat SDK: подключается через обычные <script> в HTML. */
const firebaseConfig = {
  apiKey: "AIzaSyAFmC6SMFHdnXOc6VKLQV_CxDzWirxBoHE",
  authDomain: "feracook-web.firebaseapp.com",
  projectId: "feracook-web",
  storageBucket: "feracook-web.firebasestorage.app",
  messagingSenderId: "145514107912",
  appId: "1:145514107912:web:98a3c59db512558521adbd"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
