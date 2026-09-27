import { API_BASE_URL } from "./config.js";

/*
  =========================================================
  Cliente HTTP da API de Estoque.
  Centraliza todas as chamadas (GET, POST, PUT, PATCH, DELETE)
  e padroniza o tratamento de erros.
  =========================================================
*/
async function request(path, { method = "GET", body } = {}) {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers: body ? { "Content-Type": "application/json" } : undefined,
            body: body ? JSON.stringify(body) : undefined
        });
    } catch {
        throw new Error("Não foi possível conectar à API de Estoque. Ela está rodando?");
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        // 422 = erro de validação do flask-openapi3 (lista de erros do pydantic)
        if (Array.isArray(data)) {
            const campos = data.map((e) => e.loc?.slice(-1)[0]).filter(Boolean).join(", ");
            throw new Error(`Dados inválidos${campos ? `: ${campos}` : ""}.`);
        }
        throw new Error(data.message || `Erro ${response.status} na requisição.`);
    }

    return data;
}

export const api = {
    // Produtos
    listarProdutos: (filtros) => request(`/produtos?${new URLSearchParams(filtros)}`),
    buscarProduto: (id) => request(`/produtos/${id}`),
    listarCategorias: () => request("/produtos/categorias"),
    criarProduto: (produto) => request("/produtos", { method: "POST", body: produto }),
    atualizarProduto: (id, produto) => request(`/produtos/${id}`, { method: "PUT", body: produto }),
    movimentarEstoque: (id, tipo, quantidade) =>
        request(`/produtos/${id}/estoque`, { method: "PATCH", body: { tipo, quantidade } }),
    excluirProduto: (id) => request(`/produtos/${id}`, { method: "DELETE" }),

    // Fornecedores (a API consulta a BrasilAPI internamente)
    consultarCnpj: (cnpj) => request(`/fornecedores/consulta/${cnpj}`),
    listarFornecedores: () => request("/fornecedores"),
    criarFornecedor: (dados) => request("/fornecedores", { method: "POST", body: dados }),
    atualizarContatoFornecedor: (id, contato) =>
        request(`/fornecedores/${id}`, { method: "PATCH", body: contato }),
    excluirFornecedor: (id) => request(`/fornecedores/${id}`, { method: "DELETE" }),

    // Dashboard
    dashboard: () => request("/dashboard")
};
