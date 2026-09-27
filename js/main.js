import { loadDashboard } from "./dashboard.js";
import { initFornecedores, loadFornecedores } from "./fornecedores.js";
import {
    initProdutos,
    loadCategorias,
    loadProducts,
    mostrarSomenteEstoqueBaixo,
    setFornecedoresOptions
} from "./produtos.js";

/*
  =========================================================
  Ponto de entrada da SPA: navegação por abas e carga inicial
  =========================================================
*/
const tabs = document.querySelectorAll(".tab");

function showTab(name) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.toggle("hidden", panel.id !== `tab-${name}`);
    });

    // Recarrega os dados da aba ao entrar nela
    if (name === "dashboard") loadDashboard();
    if (name === "produtos") loadProducts();
    if (name === "fornecedores") loadFornecedores();
}

// Quando fornecedores mudam, o select do formulário de produto é atualizado
async function syncFornecedores() {
    const fornecedores = await loadFornecedores();
    setFornecedoresOptions(fornecedores);
}

document.addEventListener("DOMContentLoaded", () => {
    tabs.forEach((tab) => tab.addEventListener("click", () => showTab(tab.dataset.tab)));

    initProdutos({ onChange: loadDashboard });
    initFornecedores({
        onChange: async () => {
            await syncFornecedores();
            loadProducts();
            loadDashboard();
        }
    });

    document.getElementById("ver-estoque-baixo").addEventListener("click", () => {
        showTab("produtos");
        mostrarSomenteEstoqueBaixo();
    });

    loadDashboard();
    loadCategorias();
    loadProducts();
    syncFornecedores();
});
