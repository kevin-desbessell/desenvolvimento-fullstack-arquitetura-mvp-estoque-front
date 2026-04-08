const API_BASE_URL = "http://127.0.0.1:5000";

let produtos = [];
let viewMode = "cards";
let editingProductId = null;

/*
  =========================================================
  Seleção dos principais elementos da interface
  =========================================================
*/
const form = document.getElementById("product-form");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const productsContainer = document.getElementById("products-container");
const statusText = document.getElementById("status-text");
const feedback = document.getElementById("feedback");
const cardsViewBtn = document.getElementById("cards-view-btn");
const listViewBtn = document.getElementById("list-view-btn");

const nomeInput = document.getElementById("nome");
const categoriaInput = document.getElementById("categoria");
const quantidadeInput = document.getElementById("quantidade");
const unidadeInput = document.getElementById("unidade");
const precoInput = document.getElementById("preco");
const descricaoInput = document.getElementById("descricao");

/*
  =========================================================
  Inicialização da aplicação após o carregamento da página
  =========================================================
*/
document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    loadProducts();
});

/*
  =========================================================
  Associação dos eventos principais da interface
  =========================================================
*/
function bindEvents() {
    form.addEventListener("submit", handleSubmit);
    cancelEditBtn.addEventListener("click", cancelEdit);

    cardsViewBtn.addEventListener("click", () => {
        viewMode = "cards";
        updateViewButtons();
        renderProducts();
    });

    listViewBtn.addEventListener("click", () => {
        viewMode = "list";
        updateViewButtons();
        renderProducts();
    });
}

/*
  =========================================================
  Atualiza visualmente o botão ativo entre lista e cards
  =========================================================
*/
function updateViewButtons() {
    cardsViewBtn.classList.toggle("active", viewMode === "cards");
    listViewBtn.classList.toggle("active", viewMode === "list");
}

/*
  =========================================================
  Exibe mensagens de sucesso ou erro para o usuário
  =========================================================
*/
function showFeedback(message, type = "success") {
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    feedback.classList.remove("hidden");
}

/*
  =========================================================
  Limpa a área de feedback visual
  =========================================================
*/
function clearFeedback() {
    feedback.textContent = "";
    feedback.className = "feedback hidden";
}

/*
  =========================================================
  Reseta o formulário para o modo de cadastro
  =========================================================
*/
function resetForm() {
    form.reset();
    editingProductId = null;
    formTitle.textContent = "Cadastrar produto";
    submitBtn.textContent = "Cadastrar produto";
    cancelEditBtn.classList.add("hidden");
}

/*
  =========================================================
  Preenche o formulário com os dados do produto selecionado
  =========================================================
*/
function fillForm(produto) {
    nomeInput.value = produto.nome || "";
    categoriaInput.value = produto.categoria || "";
    quantidadeInput.value = produto.quantidade ?? "";
    unidadeInput.value = produto.unidade || "";
    precoInput.value = produto.preco ?? "";
    descricaoInput.value = produto.descricao || "";
}

/*
  =========================================================
  Coleta os dados digitados no formulário
  =========================================================
*/
function getFormData() {
    return {
        nome: nomeInput.value.trim(),
        categoria: categoriaInput.value.trim(),
        quantidade: Number(quantidadeInput.value),
        unidade: unidadeInput.value.trim(),
        preco: Number(precoInput.value),
        descricao: descricaoInput.value.trim()
    };
}

/*
  =========================================================
  Valida os campos antes do envio ao backend
  =========================================================
*/
function validateFormData(data) {
    if (!data.nome) {
        showFeedback("Informe o nome do produto.", "error");
        return false;
    }

    if (!data.categoria) {
        showFeedback("Informe a categoria do produto.", "error");
        return false;
    }

    if (Number.isNaN(data.quantidade) || data.quantidade < 0) {
        showFeedback("Informe uma quantidade válida.", "error");
        return false;
    }

    if (!data.unidade) {
        showFeedback("Informe a unidade do produto.", "error");
        return false;
    }

    if (Number.isNaN(data.preco) || data.preco < 0) {
        showFeedback("Informe um preço válido.", "error");
        return false;
    }

    return true;
}

/*
  =========================================================
  Busca a lista de produtos no backend
  =========================================================
*/
async function loadProducts() {
    statusText.textContent = "Carregando produtos...";

    try {
        const response = await fetch(`${API_BASE_URL}/produtos`, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error("Erro ao buscar produtos.");
        }

        const data = await response.json();
        produtos = data.produtos || [];

        statusText.textContent = `${produtos.length} produto(s) cadastrado(s).`;
        renderProducts();
    } catch (error) {
        console.error(error);
        statusText.textContent = "Erro ao carregar os produtos.";
        showFeedback("Não foi possível carregar os produtos do backend.", "error");
    }
}

/*
  =========================================================
  Decide qual modo de exibição usar
  =========================================================
*/
function renderProducts() {
    if (!produtos.length) {
        productsContainer.innerHTML = `
      <div class="empty-state">
        Nenhum produto cadastrado no momento.
      </div>
    `;
        return;
    }

    if (viewMode === "cards") {
        renderCards();
    } else {
        renderList();
    }
}

/*
  =========================================================
  Renderiza os produtos em formato de cards
  =========================================================
*/
function renderCards() {
    productsContainer.innerHTML = `
    <div class="cards-grid">
      ${produtos
            .map(
                (produto) => `
            <article class="product-card">
              <div>
                <h3>${produto.nome}</h3>
              </div>

              <div class="product-meta">
                <span><strong>Categoria:</strong> ${produto.categoria}</span>
                <span><strong>Quantidade:</strong> ${produto.quantidade}</span>
                <span><strong>Unidade:</strong> ${produto.unidade}</span>
                <span><strong>Preço:</strong> R$ ${Number(produto.preco).toFixed(2)}</span>
                <span><strong>Data:</strong> ${produto.data_insercao || "-"}</span>
              </div>

              <p class="product-description">
                <strong>Descrição:</strong> ${produto.descricao || "Sem descrição"}
              </p>

              <div class="card-actions">
                <button class="btn btn-edit" onclick="startEdit(${produto.id})">Editar</button>
                <button class="btn btn-delete" onclick="deleteProduct(${produto.id})">Excluir</button>
              </div>
            </article>
          `
            )
            .join("")}
    </div>
  `;
}

/*
  =========================================================
  Renderiza os produtos em formato de lista/tabela
  =========================================================
*/
function renderList() {
    productsContainer.innerHTML = `
    <div class="table-wrapper">
      <table class="products-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Quantidade</th>
            <th>Unidade</th>
            <th>Preço</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${produtos
            .map(
                (produto) => `
                <tr>
                  <td data-label="Nome">${produto.nome}</td>
                  <td data-label="Categoria">${produto.categoria}</td>
                  <td data-label="Quantidade">${produto.quantidade}</td>
                  <td data-label="Unidade">${produto.unidade}</td>
                  <td data-label="Preço">R$ ${Number(produto.preco).toFixed(2)}</td>
                  <td data-label="Descrição">${produto.descricao || "Sem descrição"}</td>
                  <td data-label="Ações">
                    <div class="table-actions">
                      <button class="btn btn-edit" onclick="startEdit(${produto.id})">Editar</button>
                      <button class="btn btn-delete" onclick="deleteProduct(${produto.id})">Excluir</button>
                    </div>
                  </td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

/*
  =========================================================
  Envia o formulário para cadastrar ou atualizar um produto
  =========================================================
*/
async function handleSubmit(event) {
    event.preventDefault();
    clearFeedback();

    const payload = getFormData();

    if (!validateFormData(payload)) {
        return;
    }

    try {
        let response;

        if (editingProductId) {
            response = await fetch(`${API_BASE_URL}/produtos/${editingProductId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/produtos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Erro ao salvar produto.");
        }

        showFeedback(
            editingProductId
                ? "Produto atualizado com sucesso."
                : "Produto cadastrado com sucesso."
        );

        resetForm();
        await loadProducts();
    } catch (error) {
        console.error(error);
        showFeedback(error.message || "Não foi possível salvar o produto.", "error");
    }
}

/*
  =========================================================
  Busca um produto específico para edição
  =========================================================
*/
async function startEdit(id) {
    clearFeedback();

    try {
        const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
            method: "GET"
        });

        const produto = await response.json();

        if (!response.ok) {
            throw new Error(produto.message || "Erro ao buscar produto.");
        }

        editingProductId = id;
        fillForm(produto);
        formTitle.textContent = "Editar produto";
        submitBtn.textContent = "Salvar alterações";
        cancelEditBtn.classList.remove("hidden");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    } catch (error) {
        console.error(error);
        showFeedback(error.message || "Não foi possível carregar o produto para edição.", "error");
    }
}

/*
  =========================================================
  Cancela o modo de edição e volta para cadastro
  =========================================================
*/
function cancelEdit() {
    clearFeedback();
    resetForm();
}

/*
  =========================================================
  Remove um produto do backend e atualiza a interface
  =========================================================
*/
async function deleteProduct(id) {
    clearFeedback();

    const confirmed = window.confirm("Tem certeza que deseja excluir este produto?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Erro ao excluir produto.");
        }

        if (editingProductId === id) {
            resetForm();
        }

        showFeedback("Produto removido com sucesso.");
        await loadProducts();
    } catch (error) {
        console.error(error);
        showFeedback(error.message || "Não foi possível excluir o produto.", "error");
    }
}