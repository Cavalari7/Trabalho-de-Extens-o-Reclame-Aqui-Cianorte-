const form = document.getElementById("form-denuncia");
const listaDenuncias = document.getElementById("lista-denuncias");
const todasDenunciasDiv = document.getElementById("todas-denuncias");

// Função para criar HTML de uma denúncia
function criarHTMLDenuncia(d) {
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

// Carregar últimas denúncias
function carregarDenuncias() {
  const denuncias = JSON.parse(localStorage.getItem("denuncias"))||[];
  listaDenuncias.innerHTML="";
  denuncias.slice(0,5).forEach(d=>{
    listaDenuncias.innerHTML += criarHTMLDenuncia(d);
  });
  carregarTodasDenuncias();
}

// Carregar todas as denúncias
function carregarTodasDenuncias(){
  const denuncias = JSON.parse(localStorage.getItem("denuncias"))||[];
  todasDenunciasDiv.innerHTML="";
  denuncias.forEach(d=>{
    todasDenunciasDiv.innerHTML += criarHTMLDenuncia(d);
  });
}

// Salvar nova denúncia
function salvarDenuncia(denuncia){
  const denuncias = JSON.parse(localStorage.getItem("denuncias"))||[];
  denuncias.unshift(denuncia);
  localStorage.setItem("denuncias",JSON.stringify(denuncias));
  carregarDenuncias();
}

// Limpar todas as denúncias
function limparDenuncias(){
  if(confirm("Tem certeza que deseja apagar todas as denúncias?")){
    localStorage.removeItem("denuncias");
    carregarDenuncias();
  }
}

// Envio do formulário
form.addEventListener("submit", e=>{
  e.preventDefault();
  const novaDenuncia = {
    nome: document.getElementById("nome").value || "Anônimo",
    categoria: document.getElementById("categoria").value,
    titulo: document.getElementById("titulo").value,
    descricao: document.getElementById("descricao").value,
    local: document.getElementById("local").value,
    data: document.getElementById("data").value,
    comprovanteDataUrl: ""
  };

  const arquivo = document.getElementById("arquivo").files[0];
  if(arquivo && arquivo.type.startsWith("image/")){
    const reader = new FileReader();
    reader.onload = function(event){
      novaDenuncia.comprovanteDataUrl = event.target.result;
      salvarDenuncia(novaDenuncia);
    };
    reader.readAsDataURL(arquivo);
  } else {
    salvarDenuncia(novaDenuncia);
  }

  form.reset();
});

window.onload = carregarDenuncias;
