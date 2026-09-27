import { api } from "./api.js";
import { formatMoney, formatNumber, showToast } from "./utils.js";

/*
  =========================================================
  Dashboard: indicadores (GET /dashboard) e gráfico por categoria
  =========================================================
*/
let chart = null;

export async function loadDashboard() {
    try {
        const data = await api.dashboard();

        document.getElementById("stat-produtos").textContent = formatNumber(data.total_produtos);
        document.getElementById("stat-itens").textContent = formatNumber(data.total_itens);
        document.getElementById("stat-valor").textContent = formatMoney(data.valor_total_estoque);
        document.getElementById("stat-baixo").textContent = formatNumber(data.produtos_estoque_baixo);
        document
            .getElementById("stat-alerta-card")
            .classList.toggle("is-alert", data.produtos_estoque_baixo > 0);

        renderChart(data.por_categoria);
    } catch (error) {
        showToast(error.message, "error");
    }
}

function renderChart(categorias) {
    const canvas = document.getElementById("grafico-categorias");
    const vazio = document.getElementById("grafico-vazio");
    const semDados = !categorias.length;

    canvas.classList.toggle("hidden", semDados);
    vazio.classList.toggle("hidden", !semDados);

    if (chart) {
        chart.destroy();
        chart = null;
    }

    if (semDados || typeof Chart === "undefined") {
        return;
    }

    // Chart vem do script global carregado pela CDN no index.html
    chart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: categorias.map((c) => c.categoria),
            datasets: [
                {
                    label: "Valor em estoque",
                    data: categorias.map((c) => c.valor_total),
                    backgroundColor: "#2f5d50",
                    borderRadius: 8,
                    maxBarThickness: 56
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const c = categorias[ctx.dataIndex];
                            return `${formatMoney(c.valor_total)} • ${c.quantidade_produtos} produto(s) • ${formatNumber(c.quantidade_itens)} itens`;
                        }
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, ticks: { callback: (v) => formatMoney(v) } },
                x: { grid: { display: false } }
            }
        }
    });
}
