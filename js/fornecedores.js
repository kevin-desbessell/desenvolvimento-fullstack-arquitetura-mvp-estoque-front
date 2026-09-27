import { api } from "./api.js";
import { escapeHtml, formatCep, formatCnpj, onlyDigits, showToast, withLoading } from "./utils.js";

/*
  =========================================================
  Fornecedores: consulta de CNPJ (API de Estoque → BrasilAPI),
  cadastro (POST), listagem (GET), contato (PATCH) e exclusão (DELETE)
  =========================================================
*/
const $ = (id) => document.getElementById(id);

const cnpjInput = $("cnpj");
const consultarBtn = $("consultar-btn");
const preview = $("cnpj-preview");
const container = $("fornecedores-container");
const statusText = $("fornecedores-status");

let consultaAtual = null;
let onChange = () => {};

export function initFornecedores(options) {
    onChange = options.onChange;

    // Máscara de CNPJ enquanto o usuário digita
    cnpjInput.addEventListener("input", () => {
        cnpjInput.value = formatCnpj(cnpjInput.value);
    });

    $("cnpj-form").addEventListener("submit", consultar);
    preview.addEventListener("click", handlePreviewAction);
    container.addEventListener("click", handleListAction);
}

function endereco(f) {
    const linha1 = [f.logradouro, f.numero].filter(Boolean).join(", ");
    const linha2 = [f.bairro, f.municipio && `${f.municipio}/${f.uf || ""}`].filter(Boolean).join(" • ");
    return [linha1, linha2, f.cep && `CEP ${formatCep(f.cep)}`].filter(Boolean).map(escapeHtml).join("<br>");
}

function situacaoBadge(situacao) {
    if (!situacao) return "";
    const ativa = situacao.toUpperCase() === "ATIVA";
    return `<span class="badge ${ativa ? "badge-ok" : "badge-alert"}">${escapeHtml(situacao)}</span>`;
}

/* ---------------------- Consulta de CNPJ ---------------------- */

async function consultar(event) {
    event.preventDefault();
    const cnpj = onlyDigits(cnpjInput.value);

    if (cnpj.length !== 14) {
        showToast("O CNPJ precisa ter 14 dígitos.", "error");
        return;
    }

    preview.classList.remove("hidden");
    preview.innerHTML = `<div class="loading">Consultando CNPJ na BrasilAPI...</div>`;

    try {
        consultaAtual = await withLoading(consultarBtn, "Consultando...", () => api.consultarCnpj(cnpj));
        renderPreview(consultaAtual);
    } catch (error) {
        consultaAtual = null;
        preview.innerHTML = `<div class="feedback error">${escapeHtml(error.message)}</div>`;
    }
}

function renderPreview(f) {
    preview.innerHTML = `
      <article class="supplier-card preview-card">
        <div class="card-head">
          <div>
            <p class="eyebrow-dark">Resultado da consulta • ${formatCnpj(f.cnpj)}</p>
            <h3>${escapeHtml(f.nome_fantasia || f.razao_social)}</h3>
            ${f.nome_fantasia ? `<p class="muted">${escapeHtml(f.razao_social)}</p>` : ""}
          </div>
          ${situacaoBadge(f.situacao_cadastral)}
        </div>

        <div class="product-meta">
          ${f.atividade_principal ? `<span><strong>Atividade:</strong> ${escapeHtml(f.atividade_principal)}</span>` : ""}
          <span><strong>Endereço:</strong><br>${endereco(f) || "—"}</span>
        </div>

        <div class="form-grid compact">
          <div class="form-group">
            <label for="preview-telefone">Telefone</label>
            <input id="preview-telefone" type="text" value="${escapeHtml(f.telefone || "")}" placeholder="(51) 99999-0000" />
          </div>
          <div class="form-group">
            <label for="preview-email">E-mail</label>
            <input id="preview-email" type="email" value="${escapeHtml(f.email || "")}" placeholder="compras@fornecedor.com.br" />
          </div>
        </div>

        <div class="card-actions">
          <button class="btn btn-primary" data-action="salvar">Salvar fornecedor</button>
          <button class="btn btn-secondary" data-action="descartar">Descartar</button>
        </div>
      </article>`;
}

async function handlePreviewAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button || !consultaAtual) return;

    if (button.dataset.action === "descartar") {
        limparPreview();
        return;
    }

    try {
        const salvo = await withLoading(button, "Salvando...", () =>
            api.criarFornecedor({
                cnpj: consultaAtual.cnpj,
                telefone: $("preview-telefone").value.trim() || null,
                email: $("preview-email").value.trim() || null
            })
        );
        showToast(`Fornecedor "${salvo.nome_fantasia || salvo.razao_social}" cadastrado.`);
        limparPreview();
        await loadFornecedores();
        onChange();
    } catch (error) {
        showToast(error.message, "error");
    }
}

function limparPreview() {
    consultaAtual = null;
    cnpjInput.value = "";
    preview.classList.add("hidden");
    preview.innerHTML = "";
}

/* ---------------------- Listagem ---------------------- */

export async function loadFornecedores() {
    try {
        const { fornecedores } = await api.listarFornecedores();
        statusText.textContent = `${fornecedores.length} fornecedor(es) cadastrado(s).`;
        renderLista(fornecedores);
        return fornecedores;
    } catch (error) {
        statusText.textContent = "Erro ao carregar fornecedores.";
        container.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
        return [];
    }
}

function renderLista(fornecedores) {
    if (!fornecedores.length) {
        container.innerHTML = `<div class="empty-state">Nenhum fornecedor cadastrado. Consulte um CNPJ acima.</div>`;
        return;
    }

    container.innerHTML = `
      <div class="cards-grid">
        ${fornecedores
            .map(
                (f) => `
          <article class="supplier-card">
            <div class="card-head">
              <div>
                <h3>${escapeHtml(f.nome_fantasia || f.razao_social)}</h3>
                <p class="muted">${formatCnpj(f.cnpj)}</p>
              </div>
              ${situacaoBadge(f.situacao_cadastral)}
            </div>
            <div class="product-meta">
              <span>${endereco(f) || "Endereço não informado"}</span>
              <span><strong>Telefone:</strong> ${escapeHtml(f.telefone || "—")}</span>
              <span><strong>E-mail:</strong> ${escapeHtml(f.email || "—")}</span>
              <span><strong>Produtos vinculados:</strong> ${f.total_produtos}</span>
            </div>
            <div class="card-actions">
              <button class="btn btn-edit" data-action="contato" data-id="${f.id}"
                data-telefone="${escapeHtml(f.telefone || "")}" data-email="${escapeHtml(f.email || "")}">Editar contato</button>
              <button class="btn btn-delete" data-action="excluir" data-id="${f.id}"
                data-nome="${escapeHtml(f.nome_fantasia || f.razao_social)}">Excluir</button>
            </div>
          </article>`
            )
            .join("")}
      </div>`;
}

async function handleListAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const id = Number(button.dataset.id);

    try {
        if (button.dataset.action === "contato") {
            const telefone = window.prompt("Telefone de contato:", button.dataset.telefone);
            if (telefone === null) return;
            const email = window.prompt("E-mail de contato:", button.dataset.email);
            if (email === null) return;

            await api.atualizarContatoFornecedor(id, { telefone: telefone.trim(), email: email.trim() });
            showToast("Contato atualizado.");
        } else {
            const ok = window.confirm(
                `Excluir o fornecedor "${button.dataset.nome}"? Os produtos vinculados ficarão sem fornecedor.`
            );
            if (!ok) return;
            await api.excluirFornecedor(id);
            showToast("Fornecedor removido.");
        }

        await loadFornecedores();
        onChange();
    } catch (error) {
        showToast(error.message, "error");
    }
}
