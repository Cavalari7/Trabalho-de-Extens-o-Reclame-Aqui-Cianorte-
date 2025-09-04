auth.onAuthStateChanged(async user=>{
  if(user){
    const userDoc = await db.collection("usuarios").doc(user.uid).get();
    if(userDoc.exists && userDoc.data().role==="admin"){
      const provider = user.providerData[0]?.providerId==="google.com"?" (Logado via Google)":"";
      document.getElementById("adminInfo").textContent =
        `Nome: ${userDoc.data().nome} | E-mail: ${user.email}${provider}`;
    } else {
      alert("Acesso negado. Apenas administradores podem entrar.");
      window.location.href="login.html";
    }
  } else { window.location.href="login.html"; }
});

function logout(){ auth.signOut().then(()=>window.location.href="login.html"); }
