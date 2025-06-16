// Função para inicializar a página de marcas
document.addEventListener("DOMContentLoaded", function() {
    initializeBrandsPage();
});

const API_BASE_URL = "https://localhost:4242/api"; // Ajuste se necessário

function initializeBrandsPage() {
    // Adicionar eventos de clique nos cards de marcas
    initializeBrandCards();

    // Carregar dinamicamente as marcas no submenu (opcional)
    // loadBrandsSubmenu();

    // Outras inicializações (sliders, etc.)
    // initializeFeaturedBrandsSlider();
    // initializeBenefitCards();
}

// Função para inicializar os cards de marcas
function initializeBrandCards() {
    const brandCards = document.querySelectorAll(".brand-card");

    brandCards.forEach(card => {
        // Adicionar efeito de hover (pode ser feito via CSS)
        card.addEventListener("mouseenter", function() {
            this.style.transform = "translateY(-5px)";
            this.style.boxShadow = "0 4px 8px rgba(255, 165, 0, 0.3)"; // Sombra laranja suave
        });
        card.addEventListener("mouseleave", function() {
            this.style.transform = "translateY(0)";
            this.style.boxShadow = "none";
        });

        // Adicionar evento de clique para ver produtos da marca
        const viewProductsBtn = card.querySelector(".btn-primary");
        const brandId = card.getAttribute("data-brand-id"); // Pegar o ID do atributo data

        if (viewProductsBtn && brandId) {
            viewProductsBtn.addEventListener("click", function(e) {
                e.preventDefault(); // Prevenir comportamento padrão do link
                // Redirecionar para a página de produtos com o filtro de marca (BrandIds)
                window.location.href = `/public/html/products.html?BrandIds=${brandId}`;
            });
        }
    });
}

// Função para carregar marcas no submenu (exemplo)
/*
async function loadBrandsSubmenu() {
    const submenu = document.getElementById("brands-submenu");
    if (!submenu) return;

    // Mapeamento de IDs para nomes (baseado no EnumBrand)
    const brandsMap = {
        1: "Max Titanium",
        2: "Probiótica",
        3: "Growth",
        4: "Atlhetica",
        5: "Integral Médica",
        6: "Black Skull",
        7: "New Millennium",
        8: "Universal",
        9: "MuscleMeds",
        10: "Dymatize"
    };

    // Limpar submenu existente
    submenu.innerHTML = '';

    // Adicionar itens
    for (const id in brandsMap) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `/public/html/products.html?BrandIds=${id}`;
        a.className = "nav-link";
        a.textContent = brandsMap[id];
        li.appendChild(a);
        submenu.appendChild(li);
    }
}
*/

// Manter outras funções se necessário
/*
function initializeFeaturedBrandsSlider() { ... }
function initializeBenefitCards() { ... }
function filterBrands(searchTerm) { ... }
function sortBrands(criteria) { ... }
*/

