import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6XluaAfSDMBYWu4n8DEApxxVClU8rZhQ",
  authDomain: "oboi-top.firebaseapp.com",
  databaseURL: "https://oboi-top-default-rtdb.firebaseio.com",
  projectId: "oboi-top",
  storageBucket: "oboi-top.firebasestorage.app",
  messagingSenderId: "552402951555",
  appId: "1:552402951555:web:daf010692a6bb18592eab6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Глобальные переменные для доступа из HTML
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseFuncs = {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  ref, set, get, child
};

// Делаем функции доступными глобально
window.registerUser = (email, password) => createUserWithEmailAndPassword(auth, email, password);
window.loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);
window.logoutUser = () => signOut(auth);
window.loginGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};
window.checkAuth = (callback) => onAuthStateChanged(auth, callback);

// Сохранение лайка в базу данных
window.saveLike = async (userId, wallpaperId, isLiked) => {
  const likeRef = ref(db, 'likes/' + userId + '/' + wallpaperId);
  await set(likeRef, isLiked);
};

// Получение всех лайков пользователя
window.getUserLikes = async (userId) => {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, 'likes/' + userId));
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return {};
};
// Добавление скачивания (счетчик)
window.incrementDownload = async (wallpaperId) => {
  try {
    const downloadRef = ref(db, 'downloads/' + wallpaperId);
    const snapshot = await get(downloadRef);
    const currentCount = snapshot.exists() ? snapshot.val() : 0;
    await set(downloadRef, currentCount + 1);
  } catch (e) {
    console.error('Ошибка при обновлении счетчика:', e);
  }
};

// Получение всех счетчиков
window.getAllDownloads = async () => {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, 'downloads'));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return {};
  } catch (e) {
    console.error('Ошибка при получении счетчиков:', e);
    return {};
  }
};