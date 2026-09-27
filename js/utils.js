/*
  =========================================================
  Funções utilitárias compartilhadas
  =========================================================
*/

// Escapa texto vindo da API antes de inserir no HTML (evita XSS).
export function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export const formatMoney = (value) =>
    Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatNumber = (value) => Number(value || 0).toLocaleString("pt-BR");

export const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

export function formatCnpj(value) {
    const d = onlyDigits(value).slice(0, 14);
    return d
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
}

export function formatCep(value) {
    const d = onlyDigits(value);
    return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

let toastTimer = null;

// Feedback visual flutuante de sucesso ou erro.
export function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add("hidden"), 4000);
}

// Evita disparar uma busca a cada tecla digitada.
export function debounce(fn, delay = 350) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// Coloca o botão em estado de carregamento enquanto a promessa roda.
export async function withLoading(button, label, fn) {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = label;
    try {
        return await fn();
    } finally {
        button.disabled = false;
        button.textContent = original;
    }
}
