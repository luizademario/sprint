/* ============================================
   JOVI – auth.js
   Requisitos Web Dev cobertos:
   ✔ Validação de formulários e login
   ✔ Alertas e prompts
   ✔ Manipulação de strings e variáveis
   ✔ Eventos de usuário no DOM
   ============================================ */

"use strict";

// ============ TOGGLE SENHA ============
function initToggleSenha(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;

  btn.addEventListener("click", () => {
    const visivel = input.type === "text";
    input.type = visivel ? "password" : "text";
    btn.textContent = visivel ? "👁" : "🙈";
  });
}

initToggleSenha("togglePass", "loginPassword");
initToggleSenha("toggleCadPass", "cadSenha");


// ============ FORMULÁRIO DE LOGIN ============
(function initLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const emailInput    = document.getElementById("loginEmail");
  const senhaInput    = document.getElementById("loginPassword");
  const demoBtn       = document.getElementById("demoLogin");
  const forgotLink    = document.getElementById("forgotLink");

  // Usuários demo cadastrados
  const usuariosDemo = [
    { email: "gustavo@jovi.com", senha: "Jovi@2026", nome: "Gustavo Noleto" },
    { email: "demo@jovi.com",    senha: "demo1234",  nome: "Usuário Demo" }
  ];

  function validarLogin() {
    let valido = true;

    limparErro(emailInput, "errorLoginEmail");
    limparErro(senhaInput, "errorLoginPass");

    if (Validar.vazio(emailInput.value)) {
      marcarErro(emailInput, "Informe o e-mail.", "errorLoginEmail");
      valido = false;
    } else if (!Validar.email(emailInput.value)) {
      marcarErro(emailInput, "E-mail inválido.", "errorLoginEmail");
      valido = false;
    }

    if (Validar.vazio(senhaInput.value)) {
      marcarErro(senhaInput, "Informe a senha.", "errorLoginPass");
      valido = false;
    }

    return valido;
  }

  function autenticar(email, senha) {
    // Verifica usuários cadastrados na sessão
    const cadastrados = JoviStorage.get("usuarios") || [];
    const todosCombinados = [...usuariosDemo, ...cadastrados];

    const usuario = todosCombinados.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
    );
    return usuario || null;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validarLogin()) return;

    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    const lembrar = document.getElementById("rememberMe")?.checked;

    const usuario = autenticar(email, senha);

    if (!usuario) {
      marcarErro(emailInput, "", "errorLoginEmail");
      marcarErro(senhaInput, "E-mail ou senha incorretos.", "errorLoginPass");
      showToast("❌ Credenciais inválidas. Tente: demo@jovi.com / demo1234", "error", 5000);
      return;
    }

    // Salva sessão
    JoviStorage.set("sessao", {
      nome: usuario.nome,
      email: usuario.email,
      iniciais: gerarIniciais(usuario.nome),
      logado: true,
      loginEm: new Date().toISOString()
    });

    if (lembrar) {
      JoviStorage.set("lembrar", { email: usuario.email });
    }

    showToast(`👋 Bem-vindo de volta, ${usuario.nome.split(" ")[0]}!`, "success");
    setTimeout(() => { window.location.href = "dashboard.html"; }, 1000);
  });

  // Login demo
  demoBtn?.addEventListener("click", () => {
    emailInput.value = "demo@jovi.com";
    senhaInput.value = "demo1234";
    showToast("✅ Dados preenchidos! Clique em Entrar.", "success");
  });

  // Esqueceu a senha - usa prompt
  forgotLink?.addEventListener("click", (e) => {
    e.preventDefault();
    const email = prompt("Informe seu e-mail cadastrado para recuperar a senha:");

    if (email === null) return; // cancelou

    if (!email || !Validar.email(email.trim())) {
      alert("⚠️ E-mail inválido. Tente novamente.");
      return;
    }

    alert(`✅ Um link de recuperação foi enviado para:\n${email.trim()}\n\nVerifique sua caixa de entrada.`);
    showToast("📧 Link de recuperação enviado!", "success");
  });

  // Preenche lembrar email
  const lembrado = JoviStorage.get("lembrar");
  if (lembrado?.email && emailInput) {
    emailInput.value = lembrado.email;
    const rem = document.getElementById("rememberMe");
    if (rem) rem.checked = true;
  }

  // Limpa erros ao digitar
  [emailInput, senhaInput].forEach(el => {
    el?.addEventListener("input", () => el.classList.remove("error"));
  });
})();


// ============ FORMULÁRIO DE CADASTRO ============
(function initCadastro() {
  const form = document.getElementById("cadastroForm");
  if (!form) return;

  const senhaInput   = document.getElementById("cadSenha");
  const confirmaInput = document.getElementById("cadConfirma");
  const strengthFill  = document.getElementById("strengthFill");
  const strengthLabel = document.getElementById("strengthLabel");

  // Força da senha em tempo real
  senhaInput?.addEventListener("input", () => {
    const val = senhaInput.value;
    const forca = calcularForcaSenha(val);

    const cores = ["#ff6b6b", "#f7c948", "#2dd4bf", "#6c63ff"];
    const labels = ["Muito fraca", "Fraca", "Boa", "Forte"];
    const pct = [25, 50, 75, 100];

    if (val.length === 0) {
      strengthFill.style.width = "0%";
      strengthLabel.textContent = "Força da senha";
      return;
    }

    strengthFill.style.width = pct[forca] + "%";
    strengthFill.style.background = cores[forca];
    strengthLabel.textContent = labels[forca];
    strengthLabel.style.color = cores[forca];
  });

  function calcularForcaSenha(senha) {
    let pontos = 0;
    if (senha.length >= 8)  pontos++;
    if (senha.length >= 12) pontos++;
    if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) pontos++;
    if (/[0-9]/.test(senha)) pontos++;
    if (/[^A-Za-z0-9]/.test(senha)) pontos++;
    return Math.min(Math.floor(pontos / 1.5), 3);
  }

  function validarCadastro() {
    let valido = true;

    const campos = [
      { id: "cadNome",      errId: "errorCadNome",      fn: v => Validar.nome(v),  msg: "Nome deve ter ao menos 2 caracteres." },
      { id: "cadSobrenome", errId: "errorCadSobrenome", fn: v => Validar.nome(v),  msg: "Sobrenome deve ter ao menos 2 caracteres." },
      { id: "cadEmail",     errId: "errorCadEmail",     fn: v => Validar.email(v), msg: "E-mail inválido." },
      { id: "cadInstituicao", errId: "errorCadInst",    fn: v => !Validar.vazio(v), msg: "Informe sua instituição." },
      { id: "cadSenha",     errId: "errorCadSenha",     fn: v => Validar.senha(v), msg: "Senha deve ter ao menos 8 caracteres." }
    ];

    campos.forEach(c => {
      const input = document.getElementById(c.id);
      limparErro(input, c.errId);
      if (!input) return;

      if (Validar.vazio(input.value)) {
        marcarErro(input, "Campo obrigatório.", c.errId);
        valido = false;
      } else if (!c.fn(input.value.trim())) {
        marcarErro(input, c.msg, c.errId);
        valido = false;
      }
    });

    // Confirma senha
    const senha    = document.getElementById("cadSenha");
    const confirma = document.getElementById("cadConfirma");
    limparErro(confirma, "errorCadConfirma");
    if (confirma.value !== senha.value) {
      marcarErro(confirma, "As senhas não coincidem.", "errorCadConfirma");
      valido = false;
    }

    // Termos
    const termos = document.getElementById("aceitaTermos");
    const errTermos = document.getElementById("errorTermos");
    if (errTermos) errTermos.textContent = "";
    if (!termos.checked) {
      if (errTermos) errTermos.textContent = "Você precisa aceitar os termos.";
      valido = false;
    }

    return valido;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validarCadastro()) {
      showToast("⚠️ Corrija os campos indicados.", "error");
      return;
    }

    const nome      = capitalizar(document.getElementById("cadNome").value.trim());
    const sobrenome = capitalizar(document.getElementById("cadSobrenome").value.trim());
    const email     = document.getElementById("cadEmail").value.trim().toLowerCase();
    const senha     = document.getElementById("cadSenha").value;
    const inst      = document.getElementById("cadInstituicao").value.trim();

    const nomeCompleto = `${nome} ${sobrenome}`;

    // Verifica se e-mail já existe
    const usuarios = JoviStorage.get("usuarios") || [];
    if (usuarios.find(u => u.email === email)) {
      marcarErro(document.getElementById("cadEmail"), "E-mail já cadastrado.", "errorCadEmail");
      showToast("❌ Este e-mail já está em uso.", "error");
      return;
    }

    // Salva novo usuário
    const novoUsuario = {
      nome: nomeCompleto,
      email,
      senha,
      instituicao: inst,
      iniciais: gerarIniciais(nomeCompleto),
      criadoEm: new Date().toISOString()
    };

    usuarios.push(novoUsuario);
    JoviStorage.set("usuarios", usuarios);

    // Cria sessão
    JoviStorage.set("sessao", {
      nome: nomeCompleto,
      email,
      iniciais: gerarIniciais(nomeCompleto),
      logado: true,
      loginEm: new Date().toISOString()
    });

    showToast(`🎉 Conta criada! Bem-vindo ao JOVI, ${nome}!`, "success");
    setTimeout(() => { window.location.href = "dashboard.html"; }, 1200);
  });

  // Limpa erros ao digitar
  form.querySelectorAll("input").forEach(el => {
    el.addEventListener("input", () => el.classList.remove("error"));
  });
})();


// ============ HELPERS ============
function gerarIniciais(nomeCompleto) {
  const partes = nomeCompleto.trim().split(" ");
  const primeira = partes[0]?.charAt(0).toUpperCase() || "";
  const ultima   = partes[partes.length - 1]?.charAt(0).toUpperCase() || "";
  return primeira + ultima;
}
