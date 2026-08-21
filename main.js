import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot,
  query, orderBy, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCyZ1p7KqQFdHR5-rQ8Nips086gH-VQiok",
  authDomain: "getbettersam-6eb58.firebaseapp.com",
  projectId: "getbettersam-6eb58",
  storageBucket: "getbettersam-6eb58.firebasestorage.app",
  messagingSenderId: "307265841116",
  appId: "1:307265841116:web:72795da7cfc4eaf0ed9119"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const wishesRef = collection(db, "wellWishes");

const form = document.getElementById("wellWishForm");
const nameInput = document.getElementById("wellWishName");
const commentInput = document.getElementById("wellWishComment");
const errorEl = document.getElementById("wellWishError");
const listEl = document.getElementById("wellWishList");
const countEl = document.getElementById("wellWishCount");

// Submit a new well wish — saved as "pending" until you approve it
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const comment = commentInput.value.trim();

  if (!name || !comment) {
    errorEl.style.display = "block";
    return;
  }
  errorEl.style.display = "none";

  try {
    await addDoc(wishesRef, {
      name,
      comment,
      status: "pending",
      createdAt: serverTimestamp()
    });
    // Show a thank-you note instead of the message itself
    listEl.insertAdjacentHTML("afterbegin", `
      <li class="wellwish-item wellwish-pending">
        ✏️ Thanks ${escapeHtml(name)}! Your message is awaiting approval and will appear here shortly.
      </li>
    `);
    form.reset();
  } catch (error) {
    console.error("Firebase error:", error.message);
  }
});

// Only show approved messages on the public page
const approvedQuery = query(
  wishesRef,
  where("status", "==", "approved"),
  orderBy("createdAt", "desc")
);

onSnapshot(approvedQuery, (snapshot) => {
  const wishes = snapshot.docs.map(doc => doc.data());

  countEl.textContent = wishes.length === 0
    ? "Messages are on their way — check back soon!"
    : `${wishes.length} message${wishes.length === 1 ? "" : "s"}`;

  // Remove any pending thank-you notes before re-rendering approved list
  const pendingNotes = listEl.querySelectorAll(".wellwish-pending");
  pendingNotes.forEach(n => n.remove());

  const approvedHtml = wishes.map(w => `
    <li class="wellwish-item">
      <span class="wellwish-name">${escapeHtml(w.name)}</span>
      <span class="wellwish-time">${formatTime(w.createdAt)}</span>
      <p class="wellwish-text">${escapeHtml(w.comment)}</p>
    </li>
  `).join("");

  // Insert approved items after any pending thank-you notes
  const pendingNote = listEl.querySelector(".wellwish-pending");
  if (pendingNote) {
    pendingNote.insertAdjacentHTML("afterend", approvedHtml);
  } else {
    listEl.innerHTML = approvedHtml;
  }
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatTime(timestamp) {
  if (!timestamp) return "just now";
  return timestamp.toDate().toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
