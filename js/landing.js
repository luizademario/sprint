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

  // Hamburger menu
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    const aberto = navLinks.classList.contains("open");
    hamburger.setAttribute("aria-expanded", aberto);
  });

  // Fecha menu ao clicar em link
  navLinks.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => navLinks.classList.remove("open"));
  });

  // Highlight do link ativo via scroll
  function atualizarLinkAtivo() {
    const sections = ["hero", "features", "slideshow", "about", "contact"];
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
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.getElementById("prevSlide");
  const nextBtn = document.getElementById("nextSlide");

  let atual = 0;
  let intervalo = null;

  function mostrarSlide(index) {
    // Garante loop
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    // Remove active de todos
    slides.forEach(s => s.classList.remove("active"));
    dots.forEach(d => d.classList.remove("active"));

    // Ativa o atual
    slides[index].classList.add("active");
    dots[index].classList.add("active");

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

  // Eventos de botões
  prevBtn.addEventListener("click", () => { slideAnterior(); iniciarAutoplay(); });
  nextBtn.addEventListener("click", () => { proximoSlide(); iniciarAutoplay(); });

  // Dots
  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const idx = parseInt(dot.dataset.slide, 10);
      mostrarSlide(idx);
      iniciarAutoplay();
    });
  });

  // Swipe touch
  let touchStartX = 0;
  const track = document.getElementById("slideshowTrack");

  track.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener("touchend", e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) proximoSlide(); else slideAnterior();
      iniciarAutoplay();
    }
  }, { passive: true });

  // Pause ao hover
  track.addEventListener("mouseenter", pararAutoplay);
  track.addEventListener("mouseleave", iniciarAutoplay);

  // Inicializa
  mostrarSlide(0);
  iniciarAutoplay();
})();


// ============ CÂMERA MOCKUP (HERO) ============
(function initCameraMockup() {
  const shutterBtn = document.getElementById("shutterBtn");
  const modos = document.querySelectorAll(".cam-mode");
  const detectMsg = document.querySelector(".subject-detect");

  if (!shutterBtn) return;

  const conteudos = [
    "📚 Quadro detectado",
    "📄 Apostila detectada",
    "🖊️ Caderno detectado",
    "📐 Fórmula detectada",
    "🗒️ Anotação detectada"
  ];
  let conteudoIdx = 0;

  // Botão disparar câmera
  shutterBtn.addEventListener("click", () => {
    shutterBtn.style.transform = "scale(0.92)";
    setTimeout(() => shutterBtn.style.transform = "", 120);

    conteudoIdx = (conteudoIdx + 1) % conteudos.length;
    if (detectMsg) {
      detectMsg.textContent = conteudos[conteudoIdx];
      detectMsg.style.animation = "none";
      requestAnimationFrame(() => {
        detectMsg.style.animation = "detectedIn 0.5s ease";
      });
    }

    showToast("📸 Foto capturada e classificada pela IA!", "success");
  });

  // Troca de modo
  modos.forEach(modo => {
    modo.addEventListener("click", () => {
      modos.forEach(m => m.classList.remove("active"));
      modo.classList.add("active");
    });
  });
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
