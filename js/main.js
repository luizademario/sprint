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