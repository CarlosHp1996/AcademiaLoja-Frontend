// Função para inicializar a página de objetivos
document.addEventListener("DOMContentLoaded", function() {
    initializeGoalsPage();
});

const API_BASE_URL = "https://localhost:4242/api"; // Ajuste se necessário

function initializeGoalsPage() {
    // Adicionar eventos de clique nos cards de objetivos
    initializeGoalCards();

    // Carregar dinamicamente os objetivos no submenu (opcional, mas bom para consistência)
    // loadObjectivesSubmenu();

    // Se houver outras inicializações como sliders, etc.
    // initializeFeaturedProductsSlider();
}

// Função para inicializar os cards de objetivos
function initializeGoalCards() {
    const goalCards = document.querySelectorAll(".goal-card");

    goalCards.forEach(card => {
        // Adicionar efeito de hover (opcional, pode ser feito via CSS)
        card.addEventListener("mouseenter", function() {
            this.style.transform = "translateY(-5px)";
            this.style.boxShadow = "0 4px 8px rgba(255, 165, 0, 0.3)"; // Sombra laranja suave
        });
        card.addEventListener("mouseleave", function() {
            this.style.transform = "translateY(0)";
            this.style.boxShadow = "none"; // Remover sombra ao sair
        });

        // Adicionar evento de clique para ver produtos do objetivo
        const viewProductsBtn = card.querySelector(".btn-primary");
        const objectiveId = card.getAttribute("data-objective-id");

        if (viewProductsBtn && objectiveId) {
            viewProductsBtn.addEventListener("click", function(e) {
                e.preventDefault(); // Prevenir comportamento padrão do link
                // Redirecionar para a página de produtos com o filtro de objetivo
                window.location.href = `/public/html/products.html?ObjectiveIds=${objectiveId}`;
            });
        }
    });
}

// Função para carregar objetivos no submenu (exemplo)
/*
async function loadObjectivesSubmenu() {
    const submenu = document.getElementById("goals-submenu");
    if (!submenu) return;

    // Aqui você faria uma chamada API para buscar os objetivos se necessário
    // Exemplo: const objectives = await fetch(`${API_BASE_URL}/Objectives/get`).then(res => res.json());
    // Por enquanto, vamos usar os que já estão no HTML como exemplo

    // Limpar submenu existente (se houver)
    // submenu.innerHTML = '';

    // Adicionar itens (exemplo baseado no Enum)
    const objectivesMap = {
        1: "Emagrecimento",
        2: "Hipertrofia",
        3: "Definição",
        4: "Aumento De Massa Muscular",
        5: "Ganho De Peso",
        6: "Aumento De Forca",
        7: "Melhora De Desempenho",
        8: "Melhora De Saude",
        9: "Melhora De Recuperacao",
        10: "Melhora De Imunidade"
    };

    for (const id in objectivesMap) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `/public/html/products.html?ObjectiveIds=${id}`;
        a.className = "nav-link";
        a.textContent = objectivesMap[id];
        li.appendChild(a);
        submenu.appendChild(li);
    }
}
*/

// Manter funções de exemplo se forem usadas em outras partes da página
/*
function initializeFeaturedProductsSlider() { ... }
function initializeProductButtons() { ... }
function addToCart(product) { ... }
function showAddToCartFeedback(button) { ... }
function updateCartCounter() { ... }
function filterGoals(searchTerm) { ... }
*/

