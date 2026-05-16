/* ============================================
   JOVI – landing.js
   Requisitos Web Dev cobertos:
   ✔ Slideshow de imagens
   ✔ Manipulação de eventos (click, scroll, submit)
   ✔ Alertas e prompts
   ✔ Manipulação de strings e variáveis
   ✔ Validação de formulário de contato
   ✔ DOM dinâmico
   ============================================ */

"use strict";

// ============ NAVBAR ============
(function initNavbar() {
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  const links = document.querySelectorAll(".nav-link");

  // Scroll: adiciona classe .scrolled
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
    atualizarLinkAtivo();
  });

  // Hamburger menu (opcional — nem todas as páginas têm o botão)
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      const aberto = navLinks.classList.contains("open");
      hamburger.setAttribute("aria-expanded", aberto);
    });
  }

  // Fecha menu ao clicar em link
  if (navLinks) {
    navLinks.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => navLinks.classList.remove("open"));
    });
  }

  // Highlight do link ativo via scroll
  function atualizarLinkAtivo() {
    const sections = ["hero", "features", "slideshow", "sobre", "contato"];
    let atual = "";

    sections.forEach(id => {
      const sec = document.getElementById(id);
      if (sec && window.scrollY >= sec.offsetTop - 120) {
        atual = id;
      }
    });

    links.forEach(link => {
      const href = link.getAttribute("href").replace("#", "");
      link.classList.toggle("active", href === atual);
    });
  }
})();


// ============ CONTADORES ANIMADOS (HERO) ============
(function initContadores() {
  const nums = document.querySelectorAll(".stat-number[data-target]");
  if (!nums.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        animarContador(el, target, 1500);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(el => observer.observe(el));
})();


// ============ SLIDESHOW ============
(function initSlideshow() {
  const root = document.querySelector(".slideshow");
  const slides = root ? root.querySelectorAll(".slide") : [];
  if (!slides.length) return;

  const dots = root.querySelectorAll(".dot");
  const prevBtn = document.getElementById("prevSlide") || document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextSlide") || document.getElementById("nextBtn");
  const track = document.getElementById("slideshowTrack");

  let atual = 0;
  let intervalo = null;

  function mostrarSlide(index) {
    // Garante loop
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    slides.forEach(s => s.classList.remove("ativo", "active"));
    dots.forEach(d => d.classList.remove("ativo", "active"));

    slides[index].classList.add("ativo");
    if (dots[index]) dots[index].classList.add("ativo");

    atual = index;
  }

  function proximoSlide() { mostrarSlide(atual + 1); }
  function slideAnterior() { mostrarSlide(atual - 1); }

  function iniciarAutoplay() {
    pararAutoplay();
    intervalo = setInterval(proximoSlide, 5000);
  }

  function pararAutoplay() {
    if (intervalo) clearInterval(intervalo);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => { slideAnterior(); iniciarAutoplay(); });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => { proximoSlide(); iniciarAutoplay(); });
  }

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const raw = dot.dataset.i != null ? dot.dataset.i : dot.dataset.slide;
      const idx = parseInt(raw, 10);
      mostrarSlide(Number.isFinite(idx) ? idx : 0);
      iniciarAutoplay();
    });
  });

  let touchStartX = 0;
  const swipeTarget = track || root;
  if (swipeTarget) {
    swipeTarget.addEventListener("touchstart", e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    swipeTarget.addEventListener("touchend", e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) proximoSlide(); else slideAnterior();
        iniciarAutoplay();
      }
    }, { passive: true });

    swipeTarget.addEventListener("mouseenter", pararAutoplay);
    swipeTarget.addEventListener("mouseleave", iniciarAutoplay);
  }

  mostrarSlide(0);
  iniciarAutoplay();
})();


// ============ CÂMERA MOCKUP (HERO) ============
(function initCameraMockup() {
  const shutterBtn = document.getElementById("shutterBtn");
  const modos = document.querySelectorAll(".cam-modos .modo");
  const detectMsg = document.querySelector(".hero-phone .detect-label") || document.querySelector(".detect-label");
  const visor = document.querySelector(".hero-phone .cam-visor");

  if (!shutterBtn) return;

  const conteudosFoto = [
    "📚 Quadro detectado",
    "📄 Apostila detectada",
    "🖊️ Caderno detectado",
    "📐 Fórmula detectada",
    "🗒️ Anotação detectada"
  ];
  let conteudoIdx = 0;

  const ROTULOS_MODO = {
    Foto: conteudosFoto[0],
    "Áudio": "🎙️ Gravando — transcrição em tempo real",
    Texto: "📄 Texto na cena — OCR ativo"
  };

  function modoAtivoNome() {
    const ativo = document.querySelector(".cam-modos .modo.ativo");
    return ativo ? ativo.textContent.trim() : "Foto";
  }

  function aplicarModoVisor(nomeModo) {
    if (!visor) return;
    visor.classList.remove("modo-foto", "modo-audio", "modo-texto");
    if (nomeModo === "Áudio") visor.classList.add("modo-audio");
    else if (nomeModo === "Texto") visor.classList.add("modo-texto");
    else visor.classList.add("modo-foto");

    if (detectMsg && ROTULOS_MODO[nomeModo]) {
      detectMsg.textContent = ROTULOS_MODO[nomeModo];
    }
  }

  shutterBtn.addEventListener("click", () => {
    shutterBtn.style.transform = "scale(0.92)";
    setTimeout(() => { shutterBtn.style.transform = ""; }, 120);

    const nome = modoAtivoNome();

    if (nome === "Foto" && detectMsg) {
      conteudoIdx = (conteudoIdx + 1) % conteudosFoto.length;
      detectMsg.textContent = conteudosFoto[conteudoIdx];
      detectMsg.style.animation = "none";
      requestAnimationFrame(() => {
        detectMsg.style.animation = "detectedIn 0.5s ease";
      });
      showToast("📸 Foto capturada e classificada pela IA!", "success");
    } else if (nome === "Áudio") {
      showToast("🎙️ Trecho salvo e transcrito automaticamente.", "success");
    } else if (nome === "Texto") {
      showToast("📄 Texto reconhecido e indexado para busca.", "success");
    }
  });

  modos.forEach(modo => {
    modo.addEventListener("click", () => {
      modos.forEach(m => m.classList.remove("ativo", "active"));
      modo.classList.add("ativo");
      const nome = modo.textContent.trim();
      aplicarModoVisor(nome);
    });
  });

  aplicarModoVisor(modoAtivoNome());
})();


// ============ FORMULÁRIO DE CONTATO ============
(function initFormContato() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  function validarForm() {
    let valido = true;

    const nome = document.getElementById("contactName");
    const email = document.getElementById("contactEmail");
    const subject = document.getElementById("contactSubject");
    const msg = document.getElementById("contactMessage");

    // Nome
    limparErro(nome, "errorName");
    if (Validar.vazio(nome.value)) {
      marcarErro(nome, "Por favor, informe seu nome.", "errorName");
      valido = false;
    } else if (!Validar.nome(nome.value)) {
      marcarErro(nome, "Nome deve ter ao menos 2 caracteres.", "errorName");
      valido = false;
    }

    // Email
    limparErro(email, "errorEmail");
    if (Validar.vazio(email.value)) {
      marcarErro(email, "Por favor, informe seu e-mail.", "errorEmail");
      valido = false;
    } else if (!Validar.email(email.value)) {
      marcarErro(email, "E-mail inválido.", "errorEmail");
      valido = false;
    }

    // Assunto
    limparErro(subject, "errorSubject");
    if (!subject.value) {
      marcarErro(subject, "Selecione um assunto.", "errorSubject");
      valido = false;
    }

    // Mensagem
    limparErro(msg, "errorMessage");
    if (Validar.vazio(msg.value)) {
      marcarErro(msg, "Por favor, escreva uma mensagem.", "errorMessage");
      valido = false;
    } else if (msg.value.trim().length < 10) {
      marcarErro(msg, "A mensagem deve ter ao menos 10 caracteres.", "errorMessage");
      valido = false;
    }

    return valido;
  }

  // Limpa erros ao digitar
  form.querySelectorAll("input, textarea, select").forEach(el => {
    el.addEventListener("input", () => {
      el.classList.remove("error");
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validarForm()) {
      showToast("⚠️ Preencha todos os campos corretamente.", "error");
      return;
    }

    const nome = capitalizar(document.getElementById("contactName").value.trim().split(" ")[0]);
    const assunto = document.getElementById("contactSubject").value;

    const assuntos = {
      duvida: "Dúvida sobre o app",
      bug: "Reporte de problema",
      parceria: "Parceria",
      outro: "Assunto geral"
    };

    const msg = `✅ Obrigado, ${nome}! Sua mensagem sobre "${assuntos[assunto] || assunto}" foi enviada com sucesso. Retornaremos em breve!`;
    showToast(msg, "success", 5000);
    form.reset();
  });
})();


// ============ FADE-IN AO SCROLL ============
(function initScrollReveal() {
  const targets = document.querySelectorAll(".feature-card, .team-card, .stat-card");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = (i * 0.06) + "s";
        entry.target.style.animation = "fadeUp 0.5s cubic-bezier(.4,0,.2,1) both";
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(el => observer.observe(el));
})();
