/* ============================================
   JOVI – auth.js
   Login / cadastro alinhados ao HTML (formLogin, formCadastro).
   Credenciais demo (README): demo@jovi.com / demo1234
   ============================================ */

"use strict";

function gerarIniciais(nomeCompleto) {
  var partes = nomeCompleto.trim().split(/\s+/);
  var primeira = partes[0] ? partes[0].charAt(0).toUpperCase() : "";
  var ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0).toUpperCase() : "";
  return primeira + ultima || primeira || "U";
}

function initToggleSenha(btnId, inputId) {
  var btn = document.getElementById(btnId);
  var input = document.getElementById(inputId);
  if (!btn || !input) return;

  btn.addEventListener("click", function() {
    var visivel = input.type === "text";
    input.type = visivel ? "password" : "text";
    btn.textContent = visivel ? "👁" : "🙈";
  });
}

initToggleSenha("verSenha", "senha");

/** Mesmas credenciais documentadas no README */
var USUARIOS_DEMO = [
  { email: "demo@jovi.com", senha: "demo1234", nome: "Usuário Demo" },
  { email: "gustavo@jovi.com", senha: "Jovi@2026", nome: "Gustavo Noleto" }
];

function gravarSessao(usuario) {
  JoviStorage.set("sessao", {
    nome: usuario.nome,
    email: usuario.email.toLowerCase(),
    iniciais: gerarIniciais(usuario.nome),
    logado: true,
    loginEm: new Date().toISOString()
  });
}

function irParaDashboard(usuario) {
  var primeiro = usuario.nome.split(" ")[0];
  showToast("Bem-vindo, " + capitalizar(primeiro) + "!", "success");
  setTimeout(function() {
    window.location.href = "dashboard.html";
  }, 500);
}

function autenticar(email, senha) {
  var cadastrados = JoviStorage.get("usuarios") || [];
  var norm = email.trim().toLowerCase();
  var todos = USUARIOS_DEMO.concat(cadastrados);
  for (var i = 0; i < todos.length; i++) {
    if (todos[i].email.toLowerCase() === norm && todos[i].senha === senha) {
      return todos[i];
    }
  }
  return null;
}

// ============ LOGIN (pages/login.html) ============
(function initLogin() {
  var form = document.getElementById("formLogin");
  if (!form) return;

  var emailInput = document.getElementById("email");
  var senhaInput = document.getElementById("senha");
  var btnDemo = document.getElementById("btnDemo");
  var linkEsqueci = document.getElementById("linkEsqueci");

  function limparCamposErro() {
    limparErro("errEmail");
    limparErro("errSenha");
    if (emailInput) emailInput.classList.remove("erro-campo");
    if (senhaInput) senhaInput.classList.remove("erro-campo");
  }

  function validarLogin() {
    var ok = true;
    limparCamposErro();

    if (!emailInput || !senhaInput) return false;

    if (vazio(emailInput.value)) {
      marcarErro("errEmail", "Informe o e-mail.");
      emailInput.classList.add("erro-campo");
      ok = false;
    } else if (!emailValido(emailInput.value.trim())) {
      marcarErro("errEmail", "E-mail inválido.");
      emailInput.classList.add("erro-campo");
      ok = false;
    }

    if (vazio(senhaInput.value)) {
      marcarErro("errSenha", "Informe a senha.");
      senhaInput.classList.add("erro-campo");
      ok = false;
    }

    return ok;
  }

  function fazerLoginComUsuario(usuario) {
    gravarSessao(usuario);
    irParaDashboard(usuario);
  }

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    if (!validarLogin()) return;

    var usuario = autenticar(emailInput.value, senhaInput.value);
    if (!usuario) {
      marcarErro("errSenha", "E-mail ou senha incorretos.");
      emailInput.classList.add("erro-campo");
      senhaInput.classList.add("erro-campo");
      showToast("Use demo@jovi.com e a senha demo1234 (veja o README).", "error");
      return;
    }
    fazerLoginComUsuario(usuario);
  });

  if (btnDemo) {
    btnDemo.addEventListener("click", function() {
      var demo = USUARIOS_DEMO[0];
      if (emailInput) emailInput.value = demo.email;
      if (senhaInput) senhaInput.value = demo.senha;
      fazerLoginComUsuario(demo);
    });
  }

  if (linkEsqueci) {
    linkEsqueci.addEventListener("click", function(e) {
      e.preventDefault();
      var email = window.prompt("Informe seu e-mail cadastrado para recuperar a senha:");
      if (email === null) return;
      if (vazio(email) || !emailValido(email.trim())) {
        window.alert("E-mail inválido. Tente novamente.");
        return;
      }
      window.alert("Simulação: um link seria enviado para:\n" + email.trim());
      showToast("Verifique sua caixa de entrada.", "success");
    });
  }

  if (emailInput) {
    emailInput.addEventListener("input", function() {
      limparErro("errEmail");
      emailInput.classList.remove("erro-campo");
    });
  }
  if (senhaInput) {
    senhaInput.addEventListener("input", function() {
      limparErro("errSenha");
      senhaInput.classList.remove("erro-campo");
    });
  }
})();


// ============ CADASTRO (pages/cadastro.html) ============
(function initCadastro() {
  var form = document.getElementById("formCadastro");
  if (!form) return;

  var senhaInput = document.getElementById("senha");
  var forcaFill = document.getElementById("forcaFill");
  var forcaLabel = document.getElementById("forcaLabel");

  function calcularForcaSenha(senha) {
    var pontos = 0;
    if (senha.length >= 8) pontos++;
    if (senha.length >= 12) pontos++;
    if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) pontos++;
    if (/[0-9]/.test(senha)) pontos++;
    if (/[^A-Za-z0-9]/.test(senha)) pontos++;
    return Math.min(Math.floor(pontos / 1.5), 3);
  }

  if (senhaInput && forcaFill && forcaLabel) {
    senhaInput.addEventListener("input", function() {
      var val = senhaInput.value;
      var cores = ["#ff6b6b", "#f7c948", "#2dd4bf", "#6c63ff"];
      var labels = ["Muito fraca", "Fraca", "Boa", "Forte"];
      var pct = [25, 50, 75, 100];
      var forca = calcularForcaSenha(val);

      if (val.length === 0) {
        forcaFill.style.width = "0%";
        forcaLabel.textContent = "Força da senha";
        forcaLabel.style.color = "";
        return;
      }

      forcaFill.style.width = pct[forca] + "%";
      forcaFill.style.background = cores[forca];
      forcaLabel.textContent = labels[forca];
      forcaLabel.style.color = cores[forca];
    });
  }

  function nomeOk(s) {
    return s && s.trim().length >= 2;
  }

  function validarCadastro() {
    var ok = true;
    var campos = [
      { input: "nome", erro: "errNome", vazioMsg: "Informe o nome.", fn: nomeOk, fnMsg: "Nome deve ter ao menos 2 caracteres." },
      { input: "sobrenome", erro: "errSobrenome", vazioMsg: "Informe o sobrenome.", fn: nomeOk, fnMsg: "Sobrenome deve ter ao menos 2 caracteres." },
      { input: "email", erro: "errEmail", vazioMsg: "Informe o e-mail.", fn: emailValido, fnMsg: "E-mail inválido." },
      { input: "senha", erro: "errSenha", vazioMsg: "Informe a senha.", fn: senhaValida, fnMsg: "Senha deve ter ao menos 8 caracteres." }
    ];

    campos.forEach(function(c) {
      var el = document.getElementById(c.input);
      limparErro(c.erro);
      if (el) el.classList.remove("erro-campo");
      if (!el) return;

      if (vazio(el.value)) {
        marcarErro(c.erro, c.vazioMsg);
        el.classList.add("erro-campo");
        ok = false;
      } else if (!c.fn(el.value.trim())) {
        marcarErro(c.erro, c.fnMsg);
        el.classList.add("erro-campo");
        ok = false;
      }
    });

    var confirma = document.getElementById("confirma");
    var senha = document.getElementById("senha");
    limparErro("errConfirma");
    if (confirma) confirma.classList.remove("erro-campo");
    if (!confirma || vazio(confirma.value)) {
      marcarErro("errConfirma", "Confirme a senha.");
      if (confirma) confirma.classList.add("erro-campo");
      ok = false;
    } else if (senha && confirma.value !== senha.value) {
      marcarErro("errConfirma", "As senhas não coincidem.");
      confirma.classList.add("erro-campo");
      ok = false;
    }

    limparErro("errTermos");
    var termos = document.getElementById("termos");
    if (termos && !termos.checked) {
      marcarErro("errTermos", "Você precisa aceitar os termos.");
      ok = false;
    }

    return ok;
  }

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    if (!validarCadastro()) {
      showToast("Corrija os campos indicados.", "error");
      return;
    }

    var nome = capitalizar(document.getElementById("nome").value.trim());
    var sobrenome = capitalizar(document.getElementById("sobrenome").value.trim());
    var email = document.getElementById("email").value.trim().toLowerCase();
    var senha = document.getElementById("senha").value;
    var nomeCompleto = nome + " " + sobrenome;

    var usuarios = JoviStorage.get("usuarios") || [];
    if (usuarios.some(function(u) { return u.email === email; })) {
      marcarErro("errEmail", "E-mail já cadastrado.");
      document.getElementById("email").classList.add("erro-campo");
      showToast("Este e-mail já está em uso.", "error");
      return;
    }

    if (USUARIOS_DEMO.some(function(u) { return u.email === email; })) {
      marcarErro("errEmail", "Este e-mail é reservado para a conta demo.");
      document.getElementById("email").classList.add("erro-campo");
      showToast("Use outro e-mail ou entre com a conta demo.", "error");
      return;
    }

    var novo = {
      nome: nomeCompleto,
      email: email,
      senha: senha,
      criadoEm: new Date().toISOString()
    };
    usuarios.push(novo);
    JoviStorage.set("usuarios", usuarios);

    gravarSessao(novo);
    showToast("Conta criada! Bem-vindo ao JOVI, " + nome + "!", "success");
    setTimeout(function() {
      window.location.href = "dashboard.html";
    }, 800);
  });

  form.querySelectorAll("input").forEach(function(el) {
    el.addEventListener("input", function() {
      var errMap = { nome: "errNome", sobrenome: "errSobrenome", email: "errEmail", senha: "errSenha", confirma: "errConfirma" };
      var errId = errMap[el.id];
      if (errId) limparErro(errId);
      el.classList.remove("erro-campo");
      if (el.id === "termos") limparErro("errTermos");
    });
  });
})();
