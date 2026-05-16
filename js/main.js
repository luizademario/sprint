"use strict";

function showToast(msg, tipo) {
  var toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className = "toast show " + (tipo || "");
  clearTimeout(toast._t);
  toast._t = setTimeout(function() {
    toast.className = "toast";
  }, 3000);
}

function vazio(val) {
  return !val || val.trim() === "";
}

function emailValido(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function senhaValida(val) {
  return val && val.length >= 8;
}

function marcarErro(id, msg) {
  var el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function limparErro(id) {
  var el = document.getElementById(id);
  if (el) el.textContent = "";
}

function capitalizar(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatarData(date) {
  var d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("pt-BR");
}

function salvar(chave, valor) {
  try { localStorage.setItem("jovi_" + chave, JSON.stringify(valor)); } catch(e) {}
}

function carregar(chave) {
  try {
    var v = localStorage.getItem("jovi_" + chave);
    return v ? JSON.parse(v) : null;
  } catch(e) { return null; }
}

function remover(chave) {
  try { localStorage.removeItem("jovi_" + chave); } catch(e) {}
}

/** API usada por auth.js e dashboard.js (prefixo jovi_ no localStorage) */
var JoviStorage = {
  get: function(chave) { return carregar(chave); },
  set: function(chave, valor) { salvar(chave, valor); },
  remove: function(chave) { remover(chave); }
};

function abrirModal(id) {
  var el = document.getElementById(id);
  if (el) el.hidden = false;
}

function fecharModal(id) {
  var el = document.getElementById(id);
  if (el) el.hidden = true;
}

document.addEventListener("click", function(e) {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.hidden = true;
  }
});

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay:not([hidden])").forEach(function(m) {
      m.hidden = true;
    });
  }
});

/** Anima número inteiro em um elemento (dashboard, landing) */
function animarContador(el, alvo, duracao) {
  if (!el) return;
  var inicio = parseInt(String(el.textContent).replace(/\D/g, ""), 10);
  if (isNaN(inicio)) inicio = 0;
  var fim = alvo;
  var ms = duracao || 600;
  var t0 = Date.now();
  function tick() {
    var p = Math.min(1, (Date.now() - t0) / ms);
    el.textContent = Math.round(inicio + (fim - inicio) * p);
    if (p < 1) requestAnimationFrame(tick);
  }
  tick();
}