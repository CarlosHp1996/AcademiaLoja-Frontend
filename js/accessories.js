// Função para inicializar a página de acessórios
document.addEventListener("DOMContentLoaded", function() {
    initializeAccessoriesPage();
});

//const API_BASE_URL = "https://localhost:4242/api";

function initializeAccessoriesPage() {
    // Adicionar eventos de clique nos cards de acessórios
    initializeAccessoryCards();
}

// Função para inicializar os cards de acessórios
function initializeAccessoryCards() {
    const accessoryCards = document.querySelectorAll(".accessory-card");

    accessoryCards.forEach(card => {
        // Adicionar efeito de hover (opcional, pode ser feito via CSS)
        card.addEventListener("mouseenter", function() {
            this.style.transform = "translateY(-5px)";
            this.style.boxShadow = "0 4px 8px rgba(255, 165, 0, 0.3)"; // Sombra laranja suave
        });
        card.addEventListener("mouseleave", function() {
            this.style.transform = "translateY(0)";
            this.style.boxShadow = "none"; // Remover sombra ao sair
        });

        // Adicionar evento de clique para ver produtos do acessório
        const viewProductsBtn = card.querySelector(".btn-accessory");
        const accessoryId = card.getAttribute("data-accessory-id");

        if (viewProductsBtn && accessoryId) {
            viewProductsBtn.addEventListener("click", function(e) {
                e.preventDefault(); // Prevenir comportamento padrão do link
                
                // Obter o nome do acessório baseado no ID
                const accessoryName = getAccessoryNameById(accessoryId);
                
                // Redirecionar para a página de produtos com o filtro de acessório e título
                const url = `/html/products.html?AccessoryIds=${accessoryId}&title=${encodeURIComponent(accessoryName)}`;
                window.location.href = url;
            });
        }
    });
}

// Função para obter o nome do acessório baseado no ID
function getAccessoryNameById(accessoryId) {
    // Usar os enums do navigation-enums.js se disponível
    if (window.NavigationEnums && window.NavigationEnums.AccessoryDisplayNames) {
        // Encontrar a chave do enum baseada no ID
        const enumKey = Object.keys(window.NavigationEnums.EnumAccessory).find(
            key => window.NavigationEnums.EnumAccessory[key] == accessoryId
        );
        
        if (enumKey && window.NavigationEnums.AccessoryDisplayNames[enumKey]) {
            return window.NavigationEnums.AccessoryDisplayNames[enumKey];
        }
    }
    
    // Fallback para mapeamento manual caso os enums não estejam disponíveis
    const accessoryMap = {
        Camisetas : 1,
        Garrafas : 2,
        Shakeiras : 3,
        Luvas : 4,
        Cintos : 5,
        Faixas : 6,
        Meias : 7,
        Mochilas : 8,
        Bonés : 9,
        Nenhum : 10,
    };
    
    return accessoryMap[accessoryId] || "Acessórios";
}

document.addEventListener("DOMContentLoaded", function () {
  const btnExplore = document.querySelector(".btn-primary-accessories");
  const accessoriesSection = document.querySelector(".accessories-section");

  if (btnExplore && accessoriesSection) {
    btnExplore.addEventListener("click", function (e) {
      e.preventDefault();
      accessoriesSection.scrollIntoView({ behavior: "smooth" });
    });
  }
});