/* ============================================
   JOVI – dashboard.js
   Requisitos Web Dev cobertos:
   ✔ Manipulação dinâmica de elementos e DOM
   ✔ Gerenciamento de eventos de usuário
   ✔ Alertas e prompts
   ✔ Manipulação de strings e variáveis
   ✔ Criação dinâmica de elementos
   ============================================ */

"use strict";

// ============ ESTADO GLOBAL ============
let estado = {
  sessao: null,
  materias: [],
  fotos: [],
  audios: [],
  notificacoes: [],
  buscas: 0,
  corSelecionada: "#6c63ff"
};

// Dados iniciais de demonstração (FIAP Sprint — matérias do período)
const MATERIAS_PADRAO = [
  { id: "mat1", nome: "Computational Thinking with Python",        cor: "#6c63ff", fotos: 4, audios: 2 },
  { id: "mat2", nome: "Differentiated Problem Solving",             cor: "#00d2ff", fotos: 3, audios: 1 },
  { id: "mat3", nome: "Edge Computing e Computer Systems",            cor: "#f7c948", fotos: 3, audios: 1 },
  { id: "mat4", nome: "Front-end Design",                             cor: "#ff6b6b", fotos: 5, audios: 2 },
  { id: "mat5", nome: "Storytelling e Inspiração Empreendedora",      cor: "#2dd4bf", fotos: 2, audios: 1 },
  { id: "mat6", nome: "Web Development",                              cor: "#a78bfa", fotos: 4, audios: 2 }
];

const FOTOS_DEMO = [
  { id: "f1", emoji: "🐍", materia: "Computational Thinking with Python",        materiaId: "mat1", desc: "Listas, dicionários e laços for",        data: new Date(Date.now() - 3600000) },
  { id: "f2", emoji: "🧩", materia: "Differentiated Problem Solving",             materiaId: "mat2", desc: "Decomposição do problema – sprint",       data: new Date(Date.now() - 7200000) },
  { id: "f3", emoji: "☁️", materia: "Edge Computing e Computer Systems",            materiaId: "mat3", desc: "Latência e nós na borda da rede",         data: new Date(Date.now() - 10800000) },
  { id: "f4", emoji: "🎨", materia: "Front-end Design",                             materiaId: "mat4", desc: "Grid, flexbox e hierarquia visual",       data: new Date(Date.now() - 14400000) },
  { id: "f5", emoji: "💡", materia: "Storytelling e Inspiração Empreendedora",      materiaId: "mat5", desc: "Arc da narrativa no pitch",               data: new Date(Date.now() - 18000000) },
  { id: "f6", emoji: "🌐", materia: "Web Development",                              materiaId: "mat6", desc: "REST, status HTTP e JSON",                data: new Date(Date.now() - 21600000) }
];

const AUDIOS_DEMO = [
  {
    id: "a1", titulo: "Computational Thinking with Python – funções",
    materia: "Computational Thinking with Python", duracao: "42min",
    data: new Date(Date.now() - 86400000),
    transcricao: "...vamos definir uma função com def que recebe parâmetros e retorna um valor. A indentação em Python é obrigatória: o bloco do corpo da função fica alinhado sob o def. Funções ajudam a reutilizar código e a dividir o programa em partes menores, mais fáceis de testar..."
  },
  {
    id: "a2", titulo: "Front-end Design – acessibilidade e contraste",
    materia: "Front-end Design", duracao: "36min",
    data: new Date(Date.now() - 172800000),
    transcricao: "...contraste mínimo entre texto e fundo segue as diretrizes WCAG. Labels associados a inputs, ordem de foco no teclado e textos alternativos em imagens melhoram a experiência para todos os usuários. Vamos revisar um checklist rápido antes do handoff..."
  },
  {
    id: "a3", titulo: "Web Development – APIs e fetch",
    materia: "Web Development", duracao: "48min",
    data: new Date(Date.now() - 259200000),
    transcricao: "...o método fetch retorna uma Promise. Tratamos a resposta com await ou com then. Códigos 4xx e 5xx indicam erros do cliente ou do servidor; sempre verificamos response.ok antes de chamar json(). CORS aparece quando o front e a API estão em origens diferentes..."
  }
];

const NOTIF_DEMO = [
  "📸 Novas fotos classificadas em Computational Thinking with Python",
  "🎙️ Transcrição concluída em Web Development (48 min)",
  "🔍 Busca por 'fetch' encontrou 2 resultados em Web Development"
];

/** Subir de valor quando o conjunto demo (matérias/fotos/áudios) mudar no código — assim o browser não fica preso ao localStorage antigo. */
const DASH_DEMO_DATA_VERSION = 2;


// ============ INICIALIZAÇÃO ============
document.addEventListener("DOMContentLoaded", () => {
  carregarEstado();
  initSessao();
  initSidebar();
  initTopbar();
  initDashboard();
  initModais();
  renderizarTudo();
});


// ============ SESSÃO ============
function carregarEstado() {
  estado.sessao = JoviStorage.get("sessao");

  const versaoSalva = JoviStorage.get("dashDemoVersion");
  if (versaoSalva !== DASH_DEMO_DATA_VERSION) {
    estado.materias = MATERIAS_PADRAO.map(m => ({ ...m }));
    estado.fotos = FOTOS_DEMO.map(f => ({ ...f, data: new Date(f.data) }));
    estado.audios = AUDIOS_DEMO.map(a => ({ ...a, data: new Date(a.data) }));
    estado.notificacoes = [...NOTIF_DEMO];
    estado.buscas = JoviStorage.get("buscas") || 0;
    JoviStorage.set("dashDemoVersion", DASH_DEMO_DATA_VERSION);
    salvarEstado();
    return;
  }

  estado.materias = JoviStorage.get("materias") || MATERIAS_PADRAO.map(m => ({ ...m }));
  estado.fotos = JoviStorage.get("fotos") || FOTOS_DEMO.map(f => ({ ...f, data: new Date(f.data) }));
  estado.audios = JoviStorage.get("audios") || AUDIOS_DEMO.map(a => ({ ...a, data: new Date(a.data) }));
  estado.notificacoes = JoviStorage.get("notifs") || [...NOTIF_DEMO];
  estado.buscas = JoviStorage.get("buscas") || 0;
}

function salvarEstado() {
  JoviStorage.set("materias", estado.materias);
  JoviStorage.set("fotos", estado.fotos);
  JoviStorage.set("audios", estado.audios);
  JoviStorage.set("notifs", estado.notificacoes);
  JoviStorage.set("buscas", estado.buscas);
}

function initSessao() {
  if (!estado.sessao?.logado) {
    // Permite acesso sem login em modo demo
    estado.sessao = { nome: "Visitante Demo", email: "demo@jovi.com", iniciais: "VD", logado: true };
  }

  // Preenche avatar e mensagem de boas-vindas
  const avatar = document.getElementById("avatarUser");
  if (avatar) avatar.textContent = estado.sessao.iniciais || "US";

  const welcomeMsg = document.getElementById("msgBoasVindas");
  if (welcomeMsg) {
    const hora = new Date().getHours();
    let saudacao = "Olá";
    if (hora < 12) saudacao = "Bom dia";
    else if (hora < 18) saudacao = "Boa tarde";
    else saudacao = "Boa noite";

    const primeiroNome = capitalizar(estado.sessao.nome.split(" ")[0]);
    welcomeMsg.textContent = `${saudacao}, ${primeiroNome}! 👋`;
  }

  // Badge notificações
  atualizarBadgeNotif();
}


// ============ SIDEBAR ============
function initSidebar() {
  const toggle = document.getElementById("btnMenu");
  const sidebar = document.getElementById("sidebar");
  const navItems = document.querySelectorAll(".nav-item[data-sec]");

  toggle?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 720 && sidebar && toggle &&
        !sidebar.contains(e.target) &&
        !toggle.contains(e.target)) {
      sidebar.classList.remove("open");
    }
  });

  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const secao = item.dataset.sec;
      navegarPara(secao);
      sidebar?.classList.remove("open");
    });
  });

  document.getElementById("btnSair")?.addEventListener("click", (e) => {
    e.preventDefault();
    const confirmar = confirm("Deseja realmente sair da sua conta?");
    if (confirmar) {
      JoviStorage.remove("sessao");
      showToast("👋 Até logo!", "success");
      setTimeout(() => { window.location.href = "../index.html"; }, 800);
    }
  });
}

function navegarPara(secao) {
  document.querySelectorAll(".nav-item[data-sec]").forEach(item => {
    item.classList.toggle("ativo", item.dataset.sec === secao);
  });

  document.querySelectorAll(".secao").forEach(sec => {
    sec.classList.toggle("ativa", sec.id === `sec-${secao}`);
  });

  if (secao === "galeria")  renderizarGaleria();
  if (secao === "audios")   renderizarAudios();
  if (secao === "materias") renderizarMaterias();
}


// ============ TOPBAR ============
function initTopbar() {
  const searchInput = document.getElementById("buscaRapida");
  const notifBtn = document.getElementById("btnNotif");

  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const termo = searchInput.value.trim();
      if (termo) {
        navegarPara("busca");
        const campo = document.getElementById("campoBusca");
        if (campo) campo.value = termo;
        realizarBusca(termo);
      }
    }
  });

  notifBtn?.addEventListener("click", () => {
    showToast("Central de notificações no app completo.", "success");
  });
}

function atualizarBadgeNotif() {
  const badge = document.getElementById("badge");
  if (!badge) return;
  const count = estado.notificacoes.length;
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

function renderizarNotificacoes() {
  const lista = document.getElementById("notifList");
  if (!lista) return;

  if (estado.notificacoes.length === 0) {
    lista.innerHTML = `<li style="color:var(--text3);font-size:0.88rem;text-align:center;padding:1rem">Nenhuma notificação</li>`;
    return;
  }

  lista.innerHTML = estado.notificacoes.map(n => `
    <li class="notif-item">
      <span class="notif-dot"></span>
      <span>${n}</span>
    </li>
  `).join("");
}


// ============ DASHBOARD PRINCIPAL ============
function initDashboard() {
  // Contadores animados
  setTimeout(() => {
    const totalFotos    = document.getElementById("totalFotos");
    const totalMaterias = document.getElementById("totalMaterias");
    const totalBuscas   = document.getElementById("totalBuscas");
    const pendingCount  = document.getElementById("pendingCount");

    if (totalFotos)    animarContador(totalFotos,    estado.fotos.length,    800);
    if (totalMaterias) animarContador(totalMaterias, estado.materias.length, 800);
    if (totalBuscas)   animarContador(totalBuscas,   estado.buscas,          800);
    if (pendingCount)  pendingCount.textContent = estado.audios.filter((_, i) => i < 3).length;
  }, 300);

  // Botão capturar
  document.getElementById("btnCapturar")?.addEventListener("click", () => {
    iniciarCaptura();
  });

  document.getElementById("btnAddMateria")?.addEventListener("click", () => {
    abrirModal("modalMateria");
  });

  document.getElementById("btnAddMateriaMain")?.addEventListener("click", () => {
    abrirModal("modalMateria");
  });
}

function renderizarTudo() {
  renderizarMateriasHome();
  renderizarMaterias();
  renderizarGaleria();
}


// ============ MATÉRIAS ============
function renderizarMateriasHome() {
  const container = document.getElementById("materiasHome");
  if (!container) return;

  if (estado.materias.length === 0) {
    container.innerHTML = `<p style="color:var(--text3);font-size:0.85rem">Nenhuma matéria cadastrada ainda.</p>`;
    return;
  }

  container.innerHTML = estado.materias.map(m => `
    <div class="materia-item">
      <div class="esq">
        <span class="materia-dot" style="background:${m.cor}"></span>
        <span>${m.nome}</span>
      </div>
      <small>${m.fotos} fotos · ${m.audios} áudios</small>
    </div>
  `).join("");
}

function renderizarMaterias() {
  const grid = document.getElementById("materiasGrid");
  if (!grid) return;

  if (estado.materias.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text3)">
        <div style="font-size:2.5rem;margin-bottom:1rem">📚</div>
        <p>Nenhuma matéria cadastrada ainda.<br>Clique em "+ Nova matéria" para começar!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = estado.materias.map(m => `
    <div class="materia-card" style="--cor:${m.cor}" data-id="${m.id}">
      <button type="button" class="btn-del" onclick="excluirMateria('${m.id}')" title="Remover">✕</button>
      <div class="materia-card-icon">📚</div>
      <h4>${m.nome}</h4>
      <div class="materia-card-stats">
        <span class="materia-stat">📸 ${m.fotos} fotos</span>
        <span class="materia-stat">🎙️ ${m.audios} áudios</span>
      </div>
    </div>
  `).join("");
}

function excluirMateria(id) {
  const materia = estado.materias.find(m => m.id === id);
  if (!materia) return;

  const confirmar = confirm(`Deseja remover a matéria "${materia.nome}"?\nAs fotos associadas serão mantidas.`);
  if (!confirmar) return;

  estado.materias = estado.materias.filter(m => m.id !== id);
  salvarEstado();
  renderizarMaterias();
  renderizarMateriasHome();
  renderizarGaleria();

  // Atualiza stat
  animarContador(document.getElementById("totalMaterias"), estado.materias.length, 400);
  showToast(`🗑️ Matéria "${materia.nome}" removida.`, "success");
}

// Expõe globalmente para o onclick inline
window.excluirMateria = excluirMateria;


// ============ GALERIA ============
function renderizarGaleria() {
  const grid = document.getElementById("galeriaGrid");
  const filtros = document.getElementById("filtros");
  if (!grid) return;

  if (filtros) {
    const materiasUnicas = [...new Set(
      estado.fotos
        .map(f => (f.materia != null ? String(f.materia) : "").trim())
        .filter(n => n.length > 0)
    )].sort((a, b) => a.localeCompare(b, "pt"));

    const nomesMaterias = ["Todas", ...materiasUnicas];
    filtros.innerHTML = nomesMaterias.map((nome, i) => `
    <button type="button" class="btn-filtro${i === 0 ? " ativo" : ""}" data-filter="${nome}">${nome}</button>
  `).join("");

    filtros.querySelectorAll(".btn-filtro").forEach(btn => {
      btn.addEventListener("click", () => {
        filtros.querySelectorAll(".btn-filtro").forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        const filtro = btn.dataset.filter;
        const fotosFiltradas = filtro === "Todas" ? estado.fotos : estado.fotos.filter(f => f.materia === filtro);
        renderizarFotos(fotosFiltradas, grid);
      });
    });
  }

  renderizarFotos(estado.fotos, grid);
}

function renderizarFotos(fotos, container) {
  if (fotos.length === 0) {
    container.innerHTML = `<p style="color:var(--text3);font-size:0.88rem;padding:1rem">Nenhuma foto encontrada.</p>`;
    return;
  }

  container.innerHTML = fotos.map(f => {
    const mat = estado.materias.find(x => x.id === f.materiaId);
    const cor = mat && mat.cor ? mat.cor : "#6c63ff";
    return `
    <div class="galeria-item" onclick="verFoto('${f.id}')">
      <div class="galeria-thumb" style="--cor-mat:${cor};box-shadow:inset 0 -4px 0 0 ${cor}">${f.emoji}</div>
      <div class="galeria-info">
        <span>${f.desc}</span>
        <small><span class="galeria-cor" style="background:${cor}"></span>${f.materia} · ${formatarData(f.data)}</small>
      </div>
    </div>`;
  }).join("");
}

function verFoto(id) {
  const foto = estado.fotos.find(f => f.id === id);
  if (!foto) return;

  const materia = estado.materias.find(m => m.id === foto.materiaId);
  const cor = materia?.cor || "var(--accent)";

  alert(`📸 ${foto.emoji} ${foto.desc}\n\nMatéria: ${foto.materia}\nData: ${formatarData(foto.data)}\nHora: ${formatarHora(foto.data)}`);
}
window.verFoto = verFoto;

function formatarHora(d) {
  const x = d instanceof Date ? d : new Date(d);
  return x.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}


// ============ ÁUDIOS ============
function renderizarAudios() {
  const lista = document.getElementById("audioList");
  if (!lista) return;

  if (estado.audios.length === 0) {
    lista.innerHTML = `<p style="color:var(--text3)">Nenhum áudio gravado ainda.</p>`;
    return;
  }

  lista.innerHTML = estado.audios.map(a => `
    <div class="audio-item">
      <div class="audio-header">
        <span class="audio-title">🎙️ ${a.titulo}</span>
        <span class="audio-meta">${a.materia} · ${a.duracao} · ${formatarData(a.data)}</span>
      </div>
      <div class="audio-transcript" id="transcript-${a.id}">
        ${a.transcricao}
      </div>
      <div class="audio-actions">
        <button class="audio-btn" onclick="expandirTranscricao('${a.id}')">Ver completo</button>
        <button class="audio-btn" onclick="copiarTranscricao('${a.id}')">📋 Copiar</button>
      </div>
    </div>
  `).join("");
}

function expandirTranscricao(id) {
  const el = document.getElementById(`transcript-${id}`);
  if (!el) return;
  el.classList.toggle("expanded");
  const btns = el.parentElement.querySelectorAll(".audio-btn");
  btns[0].textContent = el.classList.contains("expanded") ? "Recolher" : "Ver completo";
}

function copiarTranscricao(id) {
  const audio = estado.audios.find(a => a.id === id);
  if (!audio) return;
  // Simula cópia (clipboard API pode não funcionar em todos os contextos)
  showToast("📋 Transcrição copiada para a área de transferência!", "success");
}

window.expandirTranscricao = expandirTranscricao;
window.copiarTranscricao   = copiarTranscricao;


// ============ BUSCA ============
(function initBusca() {
  const campoBusca = document.getElementById("campoBusca");
  const btnBuscar = document.getElementById("btnBuscar");

  btnBuscar?.addEventListener("click", () => {
    realizarBusca(campoBusca?.value.trim() || "");
  });

  campoBusca?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") realizarBusca(campoBusca.value.trim());
  });
})();

function realizarBusca(termo) {
  const resultados = document.getElementById("resultadosBusca");
  if (!resultados) return;

  if (!termo) {
    resultados.innerHTML = `<p style="color:var(--text3);font-size:0.88rem">Digite algo para buscar.</p>`;
    return;
  }

  const termoMin = termo.toLowerCase();

  // Busca em fotos
  const fotosBuscadas = estado.fotos.filter(f =>
    f.desc.toLowerCase().includes(termoMin) ||
    f.materia.toLowerCase().includes(termoMin)
  );

  // Busca em áudios / transcrições
  const audiosBuscados = estado.audios.filter(a =>
    a.titulo.toLowerCase().includes(termoMin) ||
    a.transcricao.toLowerCase().includes(termoMin) ||
    a.materia.toLowerCase().includes(termoMin)
  );

  // Incrementa contador de buscas
  estado.buscas++;
  salvarEstado();
  animarContador(document.getElementById("totalBuscas"), estado.buscas, 400);

  if (fotosBuscadas.length === 0 && audiosBuscados.length === 0) {
    resultados.innerHTML = `
      <div style="text-align:center;padding:3rem;color:var(--text3)">
        <div style="font-size:2rem;margin-bottom:0.5rem">🔍</div>
        <p>Nenhum resultado para "<strong style="color:var(--text2)">${termo}</strong>"</p>
      </div>
    `;
    return;
  }

  let html = "";

  if (fotosBuscadas.length > 0) {
    html += `<p style="font-size:0.8rem;color:var(--text3);margin-bottom:6px">📸 Fotos (${fotosBuscadas.length})</p>`;
    html += fotosBuscadas.map(f => `
      <div class="resultado-item">
        <div class="resultado-thumb">${f.emoji}</div>
        <div>
          <strong>${f.desc}</strong>
          <span>${f.materia} · ${formatarData(f.data)}</span>
          <span class="tag-match">Encontrado na imagem</span>
        </div>
      </div>
    `).join("");
  }

  if (audiosBuscados.length > 0) {
    html += `<p style="font-size:0.8rem;color:var(--text3);margin:14px 0 6px">🎙️ Transcrições (${audiosBuscados.length})</p>`;
    html += audiosBuscados.map(a => `
      <div class="resultado-item">
        <div class="resultado-thumb">🎙️</div>
        <div>
          <strong>${a.titulo}</strong>
          <span>${a.materia} · ${a.duracao}</span>
          <span class="tag-match">Encontrado na transcrição</span>
        </div>
      </div>
    `).join("");
  }

  resultados.innerHTML = html;
  showToast(`🔍 ${fotosBuscadas.length + audiosBuscados.length} resultado(s) para "${termo}"`, "success");
}


// ============ MODAIS ============
function initModais() {
  document.getElementById("fecharCaptura")?.addEventListener("click", () => fecharModal("modalCaptura"));
  document.getElementById("cancelarCaptura")?.addEventListener("click", () => fecharModal("modalCaptura"));
  document.getElementById("confirmarCaptura")?.addEventListener("click", confirmarCaptura);

  document.getElementById("fecharMateria")?.addEventListener("click", () => fecharModal("modalMateria"));
  document.getElementById("cancelarMateria")?.addEventListener("click", () => fecharModal("modalMateria"));
  document.getElementById("confirmarMateria")?.addEventListener("click", adicionarMateria);

  document.querySelectorAll("#cores .cor").forEach(opt => {
    opt.addEventListener("click", () => {
      document.querySelectorAll("#cores .cor").forEach(o => o.classList.remove("selecionada"));
      opt.classList.add("selecionada");
      estado.corSelecionada = opt.dataset.cor;
    });
  });
}

function iniciarCaptura() {
  abrirModal("modalCaptura");
  const sel = document.getElementById("capMateria");
  if (sel) {
    sel.innerHTML = estado.materias.map(m =>
      `<option value="${m.nome}">${m.nome}</option>`
    ).join("");
  }
}

function confirmarCaptura() {
  const materia = document.getElementById("capMateria")?.value;
  const desc    = document.getElementById("capDesc")?.value.trim() || "Foto de aula";

  const novaFoto = {
    id: "f" + Date.now(),
    emoji: ["📐", "📝", "🔬", "📖", "✏️"][Math.floor(Math.random() * 5)],
    materia: materia,
    materiaId: estado.materias.find(m => m.nome === materia)?.id || "mat1",
    desc: desc,
    data: new Date()
  };

  estado.fotos.unshift(novaFoto);

  // Atualiza contador da matéria
  const mat = estado.materias.find(m => m.nome === materia);
  if (mat) mat.fotos++;

  // Adiciona atividade
  adicionarAtividade(`Foto capturada – ${materia}: "${desc}"`, "📸");

  // Adiciona notificação
  estado.notificacoes.unshift(`📸 Nova foto capturada em ${materia}`);

  salvarEstado();

  // Atualiza UI
  animarContador(document.getElementById("totalFotos"), estado.fotos.length, 400);
  renderizarMateriasHome();
  atualizarBadgeNotif();
  fecharModal("modalCaptura");

  showToast(`📸 Foto salva em ${materia}!`, "success");

  // Reseta campos
  if (document.getElementById("capDesc")) document.getElementById("capDesc").value = "";
}

function adicionarMateria() {
  const nome = document.getElementById("nomeMateria")?.value.trim();
  if (!nome) {
    showToast("⚠️ Informe o nome da matéria.", "error");
    return;
  }

  // Verifica duplicata
  if (estado.materias.find(m => m.nome.toLowerCase() === nome.toLowerCase())) {
    showToast(`⚠️ Matéria "${nome}" já existe.`, "error");
    return;
  }

  const nova = {
    id: "mat" + Date.now(),
    nome: capitalizar(nome),
    cor: estado.corSelecionada,
    fotos: 0, audios: 0
  };

  estado.materias.push(nova);
  salvarEstado();
  renderizarMaterias();
  renderizarMateriasHome();
  animarContador(document.getElementById("totalMaterias"), estado.materias.length, 400);

  fecharModal("modalMateria");
  if (document.getElementById("nomeMateria")) document.getElementById("nomeMateria").value = "";

  showToast(`✅ Matéria "${nova.nome}" adicionada!`, "success");
  adicionarAtividade(`Nova matéria adicionada: ${nova.nome}`, "📚");
}

function adicionarAtividade(texto, icone = "📝") {
  const lista = document.getElementById("listaAtividade");
  if (!lista) return;

  const item = document.createElement("li");
  item.className = "item-atividade";
  item.style.animation = "fadeUp 0.3s ease both";
  item.innerHTML = `
    <span>${icone}</span>
    <div>
      <span>${texto}</span>
      <small>Agora mesmo</small>
    </div>
  `;

  lista.insertBefore(item, lista.firstChild);

  // Máximo 6 itens
  while (lista.children.length > 6) {
    lista.removeChild(lista.lastChild);
  }
}
