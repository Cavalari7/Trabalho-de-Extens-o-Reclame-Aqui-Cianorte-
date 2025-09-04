// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBm6Z8zXY_imCe3GEe1IG_GCbsLF1mxa_E",
  authDomain: "reclame-aqui-cianorte.firebaseapp.com",
  projectId: "reclame-aqui-cianorte",
  storageBucket: "reclame-aqui-cianorte.appspot.com",
  messagingSenderId: "547736289696",
  appId: "1:547736289696:web:50c1c62f68d118e02064c5",
  measurementId: "G-BYZ9DX1XF0"
};

// Inicializa Firebase (compat)
firebase.initializeApp(firebaseConfig);

// Serviços
const auth = firebase.auth();
const db = firebase.firestore();
