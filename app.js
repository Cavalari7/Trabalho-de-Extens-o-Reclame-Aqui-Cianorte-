// --- Alternar formulários ---
function showLogin(){
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("cadastroForm").style.display = "none";
  document.getElementById("titulo").textContent = "Login";
}

function showCadastro(){
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("cadastroForm").style.display = "block";
  document.getElementById("titulo").textContent = "Cadastro";
}

// --- Mensagens ---
function showMessage(id, text, type="error"){
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = "msg "+type;
}

// --- Login ---
async function login(){
  const email = document.getElementById("emailLogin").value.trim();
  const senha = document.getElementById("senhaLogin").value.trim();
  const btn = document.getElementById("btnLogin");

  if(!email || !senha){ showMessage("loginMsg","Preencha todos os campos!","error"); return; }

  btn.disabled=true;
  showMessage("loginMsg","Aguarde...","success");

  try{
    const cred = await auth.signInWithEmailAndPassword(email, senha);
    mostrarPainel(cred.user);
  }catch(err){ showMessage("loginMsg","Erro: "+err.message,"error"); }
  finally{ btn.disabled=false; }
}

// --- Cadastro ---
async function cadastrar(){
  const nome = document.getElementById("nomeCadastro").value.trim();
  const email = document.getElementById("emailCadastro").value.trim();
  const senha = document.getElementById("senhaCadastro").value.trim();
  const btn = document.getElementById("btnCadastro");

  if(!nome || !email || !senha){ showMessage("cadastroMsg","Preencha todos os campos!","error"); return; }
  if(senha.length<6){ showMessage("cadastroMsg","A senha deve ter pelo menos 6 caracteres!","error"); return; }

  btn.disabled=true;
  showMessage("cadastroMsg","Aguarde...","success");

  try{
    const cred = await auth.createUserWithEmailAndPassword(email, senha);

    const snapshot = await db.collection("usuarios").get();
    let role = snapshot.empty ? "admin" : "usuario";

    await db.collection("usuarios").doc(cred.user.uid).set({
      nome, email, role, criadoEm: new Date()
    });

    showMessage("cadastroMsg","✅ Cadastro realizado com sucesso!","success");
    mostrarPainel(cred.user);

  }catch(err){
    if(err.code==="auth/email-already-in-use"){
      showMessage("cadastroMsg","E-mail já cadastrado, fazendo login...","success");
      loginExistente(email, senha);
    } else { showMessage("cadastroMsg","Erro: "+err.message,"error"); }
  }finally{ btn.disabled=false; }
}

async function loginExistente(email, senha){
  try{
    const cred = await auth.signInWithEmailAndPassword(email, senha);
    mostrarPainel(cred.user);
  }catch(err){ showMessage("cadastroMsg","Erro ao fazer login: "+err.message,"error"); }
}

// --- Google ---
function loginGoogle(){
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithRedirect(provider);
}

auth.getRedirectResult()
.then(async result=>{
  if(result.user){
    const user = result.user;
    const userDoc = await db.collection("usuarios").doc(user.uid).get();
    if(!userDoc.exists){
      const snapshot = await db.collection("usuarios").get();
      let role = snapshot.empty ? "admin" : "usuario";
      await db.collection("usuarios").doc(user.uid).set({
        nome: user.displayName, email: user.email, role, criadoEm: new Date()
      });
    }
    mostrarPainel(result.user);
  }
}).catch(err=>console.error("Erro Google:",err.message));

// --- Mostrar painel de denúncias ---
function mostrarPainel(user){
  document.getElementById("loginForm").style.display="none";
  document.getElementById("cadastroForm").style.display="none";
  document.getElementById("painelDenuncias").style.display="block";
  document.getElementById("usuario-logado").textContent = `Logado como: ${user.email}`;
  carregarDenuncias();
}

// --- Logout ---
function logout(){
  auth.signOut().then(()=>location.reload());
}

// --- Controle mural ---
const form = document.getElementById("form-denuncia");
const listaDenuncias = document.getElementById("lista-denuncias");
const todasDenunciasDiv = document.getElementById("todas-denuncias");

function criarHTMLDenuncia(d){
  let imagemHTML = "";
  if(d.comprovanteDataUrl){
    imagemHTML = `<br><a href="${d.comprovanteDataUrl}" target="_blank">
      <img src="${d.comprovanteDataUrl}" alt="Prova" style="height:120px;border-radius:6px;margin-top:10px;cursor:pointer;"></a>`;
  }
  return `<div class="denuncia">
            <strong>${d.titulo} (${d.categoria})</strong><br>
            ${d.descricao}<br>
            <em>${d.local} - ${d.data}</em><br>
            <small>Autor: ${d.nome}</small>
            ${imagemHTML}
            <hr>
          </div>`;
}

function carregarDenuncias(){
  const denuncias = JSON.parse(localStorage.getItem("denuncias"))||[];
  listaDenuncias.innerHTML="";
  denuncias.slice(0,5).forEach(d=>{
    listaDenuncias.innerHTML += criarHTMLDenuncia(d);
  });
  carregarTodasDenuncias();
}

function carregarTodasDenuncias(){
  const denuncias = JSON.parse(localStorage.getItem("denuncias"))||[];
  todasDenunciasDiv.innerHTML="";
  denuncias.forEach(d=>{
    todasDenunciasDiv.innerHTML += criarHTMLDenuncia(d);
  });
}

function salvarDenuncia(denuncia){
  const denuncias = JSON.parse(localStorage.getItem("denuncias"))||[];
  denuncias.unshift(denuncia);
  localStorage.setItem("denuncias", JSON.stringify(denuncias));
  carregarDenuncias();
}

function limparDenuncias(){
  if(confirm("Tem certeza que deseja apagar todas as denúncias?")){
    localStorage.removeItem("denuncias");
    carregarDenuncias();
  }
}

// --- Envio formulário ---
form.addEventListener("submit", e=>{
  e.preventDefault();
  const novaDenuncia = {
    nome: document.getElementById("nome").value || "Anônimo",
    categoria: document.getElementById("categoria").value,
    titulo: document.getElementById("tituloDenuncia").value,
    descricao: document.getElementById("descricao").value,
    local: document.getElementById("local").value,
    data: document.getElementById("data").value,
    comprovanteDataUrl: ""
  };
  const arquivo = document.getElementById("arquivo").files[0];
  if(arquivo && arquivo.type.startsWith("image/")){
    const reader = new FileReader();
    reader.onload=function(event){
      novaDenuncia.comprovanteDataUrl = event.target.result;
      salvarDenuncia(novaDenuncia);
    };
    reader.readAsDataURL(arquivo);
  } else { salvarDenuncia(novaDenuncia); }
  form.reset();
});
