auth.onAuthStateChanged(async (user) => {
  if (user) {
    const userDoc = await db.collection("usuarios").doc(user.uid).get();

    if (userDoc.exists && userDoc.data().role === "usuario") {
      const provider = user.providerData[0]?.providerId === "google.com"
        ? " (Logado via Google)" : "";

      document.getElementById("userInfo").textContent =
        `Nome: ${userDoc.data().nome} | E-mail: ${user.email}${provider}`;
    } else {
      window.location.href = "admin.html";
    }
  } else {
    window.location.href = "login.html";
  }
});

function logout() {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}
