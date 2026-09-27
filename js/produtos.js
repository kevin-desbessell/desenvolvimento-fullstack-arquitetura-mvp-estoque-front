import { api } from "./api.js";
import { debounce, escapeHtml, formatMoney, showToast, withLoading } from "./utils.js";

/*
  =========================================================
  Produtos: cadastro (POST), listagem com filtros (GET),
  edição (PUT), movimentação de estoque (PATCH) e exclusão (DELETE)
  =========================================================
*/
const POR_PAGINA = 6;

const state = {
    produtos: [],
    viewMode: "cards",
    editingId: null,
    pagina: 1,
    totalPaginas: 1,
    onChange: () => {}
};

const $ = (id) => document.getElementById(id);

const form = $("product-form");
const formTitle = $("form-title");
const submitBtn = $("submit-btn");
const cancelEditBtn = $("cancel-edit-btn");
const container = $("products-container");
const statusText = $("status-text");

const fields = {
    nome: $("nome"),
    categoria: $("categoria"),
    quantidade: $("quantidade"),
    estoqueMinimo: $("estoque-minimo"),
    unidade: $("unidade"),
    preco: $("preco"),
    fornecedor: $("fornecedor"),
    descricao: $("descricao")
};

const filtros = {
    busca: $("filtro-busca"),
    categoria: $("filtro-categoria"),
    ordenacao: $("filtro-ordenacao"),
    estoqueBaixo: $("filtro-estoque-baixo")
};

export function initProdutos({ onChange }) {
    state.onChange = onChange;

    form.addEventListener("submit", handleSubmit);
    cancelEditBtn.addEventListener("click", resetForm);

    $("cards-view-btn").addEventListener("click", () => setViewMode("cards"));
    $("list-view-btn").addEventListener("click", () => setViewMode("list"));

    // Filtros: qualquer alteração volta para a página 1 e consulta a API
    const aplicarFiltros = () => {
        state.pagina = 1;
        loadProducts();
    };
    filtros.busca.addEventListener("input", debounce(aplicarFiltros));
    filtros.categoria.addEventListener("change", aplicarFiltros);
    filtros.ordenacao.addEventListener("change", aplicarFiltros);
    filtros.estoqueBaixo.addEventListener("change", aplicarFiltros);
    $("filters-form").addEventListener("submit", (e) => e.preventDefault());

    $("prev-page").addEventListener("click", () => changePage(-1));
    $("next-page").addEventListener("click", () => changePage(1));

    // Delegação de eventos para os botões dos cards/linhas
    container.addEventListener("click", handleProductAction);
}

/* ---------------------- Listagem ---------------------- */

function buildQuery() {
    const [ordenar_por, direcao] = filtros.ordenacao.value.split(":");
    const query = { ordenar_por, direcao, pagina: state.pagina, por_pagina: POR_PAGINA };

    if (filtros.busca.value.trim()) query.busca = filtros.busca.value.trim();
    if (filtros.categoria.value) query.categoria = filtros.categoria.value;
    if (filtros.estoqueBaixo.checked) query.estoque_baixo = true;

    return query;
}

export async function loadProducts() {
    statusText.textContent = "Carregando produtos...";

    try {
        const data = await api.listarProdutos(buildQuery());

        // Se a página atual ficou vazia (ex.: após excluir), volta uma página
        if (!data.produtos.length && state.pagina > 1) {
            state.pagina -= 1;
            return loadProducts();
        }

        state.produtos = data.produtos;
        state.totalPaginas = data.total_paginas;
        statusText.textContent = `${data.total} produto(s) encontrado(s).`;
        renderProducts();
        renderPagination();
    } catch (error) {
        statusText.textContent = "Erro ao carregar os produtos.";
        container.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
        showToast(error.message, "error");
    }
}

export async function loadCategorias() {
    try {
        const { categorias } = await api.listarCategorias();
        const atual = filtros.categoria.value;

        filtros.categoria.innerHTML =
            `<option value="">Todas as categorias</option>` +
            categorias.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
        filtros.categoria.value = categorias.includes(atual) ? atual : "";

        $("categorias-sugeridas").innerHTML = categorias
            .map((c) => `<option value="${escapeHtml(c)}"></option>`)
            .join("");
    } catch {
        /* a listagem principal já exibe o erro de conexão */
    }
}

export function setFornecedoresOptions(fornecedores) {
    const atual = fields.fornecedor.value;
    fields.fornecedor.innerHTML =
        `<option value="">Sem fornecedor</option>` +
        fornecedores
            .map((f) => `<option value="${f.id}">${escapeHtml(f.nome_fantasia || f.razao_social)}</option>`)
            .join("");
    fields.fornecedor.value = fornecedores.some((f) => String(f.id) === atual) ? atual : "";
}

// Usado pelo card de alerta do dashboard
export function mostrarSomenteEstoqueBaixo() {
    filtros.estoqueBaixo.checked = true;
    state.pagina = 1;
    loadProducts();
}

function changePage(delta) {
    const nova = state.pagina + delta;
    if (nova < 1 || nova > state.totalPaginas) return;
    state.pagina = nova;
    loadProducts();
}

function renderPagination() {
    $("page-info").textContent = `Página ${state.pagina} de ${state.totalPaginas}`;
    $("prev-page").disabled = state.pagina <= 1;
    $("next-page").disabled = state.pagina >= state.totalPaginas;
    $("pagination").classList.toggle("hidden", state.totalPaginas <= 1);
}

function setViewMode(mode) {
    state.viewMode = mode;
    $("cards-view-btn").classList.toggle("active", mode === "cards");
    $("list-view-btn").classList.toggle("active", mode === "list");
    renderProducts();
}

function renderProducts() {
    if (!state.produtos.length) {
        container.innerHTML = `<div class="empty-state">Nenhum produto encontrado.</div>`;
        return;
    }
    container.innerHTML = state.viewMode === "cards" ? renderCards() : renderList();
}

function stockBadge(p) {
    return p.estoque_baixo
        ? `<span class="badge badge-alert">Estoque baixo</span>`
        : `<span class="badge badge-ok">Em estoque</span>`;
}

function movementControl(p) {
    return `
      <div class="movement" data-id="${p.id}">
        <input type="number" min="1" step="1" value="1" class="movement-qty" aria-label="Quantidade a movimentar" />
        <button class="btn btn-in" data-action="entrada" data-id="${p.id}" title="Registrar entrada">+ Entrada</button>
        <button class="btn btn-out" data-action="saida" data-id="${p.id}" title="Registrar saída">− Saída</button>
      </div>`;
}

function actionButtons(p) {
    return `
      <button class="btn btn-edit" data-action="editar" data-id="${p.id}">Editar</button>
      <button class="btn btn-delete" data-action="excluir" data-id="${p.id}">Excluir</button>`;
}

function renderCards() {
    return `
    <div class="cards-grid">
      ${state.produtos
          .map(
              (p) => `
        <article class="product-card ${p.estoque_baixo ? "is-low" : ""}">
          <div class="card-head">
            <h3>${escapeHtml(p.nome)}</h3>
            ${stockBadge(p)}
          </div>

          <div class="stock-line">
            <strong>${p.quantidade}</strong> ${escapeHtml(p.unidade)}(s)
            <span class="muted">• mínimo ${p.estoque_minimo}</span>
          </div>

          <div class="product-meta">
            <span><strong>Categoria:</strong> ${escapeHtml(p.categoria)}</span>
            <span><strong>Preço:</strong> ${formatMoney(p.preco)}</span>
            <span><strong>Valor em estoque:</strong> ${formatMoney(p.valor_total)}</span>
            <span><strong>Fornecedor:</strong> ${escapeHtml(p.fornecedor_nome || "—")}</span>
          </div>

          <p class="product-description">${escapeHtml(p.descricao || "Sem descrição")}</p>

          ${movementControl(p)}
          <div class="card-actions">${actionButtons(p)}</div>
        </article>`
          )
          .join("")}
    </div>`;
}

function renderList() {
    return `
    <div class="table-wrapper">
      <table class="products-table">
        <thead>
          <tr>
            <th>Nome</th><th>Categoria</th><th>Estoque</th><th>Preço</th>
            <th>Fornecedor</th><th>Movimentar</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${state.produtos
              .map(
                  (p) => `
            <tr class="${p.estoque_baixo ? "is-low" : ""}">
              <td data-label="Nome">${escapeHtml(p.nome)}</td>
              <td data-label="Categoria">${escapeHtml(p.categoria)}</td>
              <td data-label="Estoque">${p.quantidade} ${escapeHtml(p.unidade)}(s) ${stockBadge(p)}</td>
              <td data-label="Preço">${formatMoney(p.preco)}</td>
              <td data-label="Fornecedor">${escapeHtml(p.fornecedor_nome || "—")}</td>
              <td data-label="Movimentar">${movementControl(p)}</td>
              <td data-label="Ações"><div class="table-actions">${actionButtons(p)}</div></td>
            </tr>`
              )
              .join("")}
        </tbody>
      </table>
    </div>`;
}

/* ---------------------- Ações ---------------------- */

async function handleProductAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "editar") return startEdit(id);
    if (action === "excluir") return deleteProduct(id);

    // entrada / saída
    const qtyInput = button.closest(".movement").querySelector(".movement-qty");
    const quantidade = Number(qtyInput.value);

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
        showToast("Informe uma quantidade inteira maior que zero.", "error");
        return;
    }

    try {
        const produto = await withLoading(button, "...", () =>
            api.movimentarEstoque(id, action, quantidade)
        );
        showToast(
            `${action === "entrada" ? "Entrada" : "Saída"} de ${quantidade} registrada. ` +
                `Estoque de "${produto.nome}": ${produto.quantidade}.`
        );
        await refreshAll();
    } catch (error) {
        showToast(error.message, "error");
    }
}

function getFormData() {
    return {
        nome: fields.nome.value.trim(),
        categoria: fields.categoria.value.trim(),
        quantidade: Number(fields.quantidade.value),
        estoque_minimo: fields.estoqueMinimo.value === "" ? 0 : Number(fields.estoqueMinimo.value),
        unidade: fields.unidade.value.trim(),
        preco: Number(fields.preco.value),
        descricao: fields.descricao.value.trim() || null,
        fornecedor_id: fields.fornecedor.value ? Number(fields.fornecedor.value) : null
    };
}

function validate(d) {
    if (!d.nome) return "Informe o nome do produto.";
    if (!d.categoria) return "Informe a categoria do produto.";
    if (fields.quantidade.value === "" || !Number.isInteger(d.quantidade) || d.quantidade < 0)
        return "Informe uma quantidade válida.";
    if (!Number.isInteger(d.estoque_minimo) || d.estoque_minimo < 0) return "Informe um estoque mínimo válido.";
    if (!d.unidade) return "Informe a unidade do produto.";
    if (fields.preco.value === "" || Number.isNaN(d.preco) || d.preco < 0) return "Informe um preço válido.";
    return null;
}

async function handleSubmit(event) {
    event.preventDefault();

    const payload = getFormData();
    const erro = validate(payload);
    if (erro) {
        showToast(erro, "error");
        return;
    }

    const editando = state.editingId !== null;

    try {
        await withLoading(submitBtn, "Salvando...", () =>
            editando ? api.atualizarProduto(state.editingId, payload) : api.criarProduto(payload)
        );
        showToast(editando ? "Produto atualizado com sucesso." : "Produto cadastrado com sucesso.");
        resetForm();
        await refreshAll();
    } catch (error) {
        showToast(error.message, "error");
    }
}

async function startEdit(id) {
    try {
        const p = await api.buscarProduto(id);

        state.editingId = id;
        fields.nome.value = p.nome;
        fields.categoria.value = p.categoria;
        fields.quantidade.value = p.quantidade;
        fields.estoqueMinimo.value = p.estoque_minimo;
        fields.unidade.value = p.unidade;
        fields.preco.value = p.preco;
        fields.fornecedor.value = p.fornecedor_id ?? "";
        fields.descricao.value = p.descricao || "";

        formTitle.textContent = `Editar produto #${id}`;
        submitBtn.textContent = "Salvar alterações";
        cancelEditBtn.classList.remove("hidden");
        form.closest(".panel").scrollIntoView({ behavior: "smooth" });
    } catch (error) {
        showToast(error.message, "error");
    }
}

function resetForm() {
    form.reset();
    state.editingId = null;
    formTitle.textContent = "Cadastrar produto";
    submitBtn.textContent = "Cadastrar produto";
    cancelEditBtn.classList.add("hidden");
}

async function deleteProduct(id) {
    const produto = state.produtos.find((p) => p.id === id);
    if (!window.confirm(`Tem certeza que deseja excluir "${produto?.nome || id}"?`)) return;

    try {
        await api.excluirProduto(id);
        if (state.editingId === id) resetForm();
        showToast("Produto removido com sucesso.");
        await refreshAll();
    } catch (error) {
        showToast(error.message, "error");
    }
}

async function refreshAll() {
    await Promise.all([loadProducts(), loadCategorias()]);
    state.onChange();
}
