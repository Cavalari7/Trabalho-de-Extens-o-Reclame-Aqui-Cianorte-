function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("cadastroForm").style.display = "none";
  document.getElementById("titulo").textContent = "Login";
}

function showCadastro() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("cadastroForm").style.display = "block";
  document.getElementById("titulo").textContent = "Cadastro";
}

function showMessage(id, text, type = "error") {
  const msgEl = document.getElementById(id);
  msgEl.textContent = text;
  msgEl.className = "msg " + type;
}

// Login email/senha
async function login() {
  const email = document.getElementById("emailLogin").value.trim();
  const senha = document.getElementById("senhaLogin").value.trim();
  const btn = document.getElementById("btnLogin");

  if (!email || !senha) {
    showMessage("loginMsg", "Preencha todos os campos!", "error");
    return;
  }

  btn.disabled = true;
  showMessage("loginMsg", "Aguarde...", "success");

  try {
    const cred = await auth.signInWithEmailAndPassword(email, senha);
    const userDoc = await db.collection("usuarios").doc(cred.user.uid).get();

    if (userDoc.exists && userDoc.data().role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "index.html";
    }
  } catch (err) {
    showMessage("loginMsg", "Erro: " + err.message, "error");
  } finally {
    btn.disabled = false;
  }
}

// Cadastro email/senha
async function cadastrar() {
  const nome = document.getElementById("nomeCadastro").value.trim();
  const email = document.getElementById("emailCadastro").value.trim();
  const senha = document.getElementById("senhaCadastro").value.trim();
  const btn = document.getElementById("btnCadastro");

  if (!nome || !email || !senha) {
    showMessage("cadastroMsg", "Preencha todos os campos!", "error");
    return;
  }

  if (senha.length < 6) {
    showMessage("cadastroMsg", "A senha deve ter pelo menos 6 caracteres!", "error");
    return;
  }

  btn.disabled = true;
  showMessage("cadastroMsg", "Aguarde...", "success");

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, senha);
    const snapshot = await db.collection("usuarios").get();
    let role = snapshot.empty ? "admin" : "usuario";

    await db.collection("usuarios").doc(cred.user.uid).set({
      nome: nome,
      email: email,
      role: role,
      criadoEm: new Date()
    });

    showMessage("cadastroMsg", "✅ Cadastro realizado com sucesso!", "success");
    setTimeout(() => showLogin(), 1500);
  } catch (err) {
    showMessage("cadastroMsg", "Erro: " + err.message, "error");
  } finally {
    btn.disabled = false;
  }
}

// Login/Cadastro com Google usando redirect
function loginGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithRedirect(provider);
}

// Pegar resultado do redirect
auth.getRedirectResult()
  .then(async (result) => {
    if (result.user) {
      const user = result.user;
      const userDoc = await db.collection("usuarios").doc(user.uid).get();

      if (!userDoc.exists) {
        const snapshot = await db.collection("usuarios").get();
        let role = snapshot.empty ? "admin" : "usuario";

        await db.collection("usuarios").doc(user.uid).set({
          nome: user.displayName,
          email: user.email,
          role: role,
          criadoEm: new Date()
        });
      }

      const updatedDoc = await db.collection("usuarios").doc(user.uid).get();
      if (updatedDoc.data().role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "index.html";
      }
    }
  })
  .catch((err) => {
    console.error("Erro ao logar com Google:", err.message);
  });
