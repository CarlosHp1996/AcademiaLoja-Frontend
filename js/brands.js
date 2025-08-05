// Função para inicializar a página de marcas
document.addEventListener("DOMContentLoaded", function() {
    initializeBrandsPage();
});

function initializeBrandsPage() {
    // Adicionar eventos de clique nos cards de marcas
    initializeBrandCards();
}

// Função para inicializar os cards de marcas
function initializeBrandCards() {
    const brandCards = document.querySelectorAll(".brand-card");

    brandCards.forEach(card => {
        // Adicionar efeito de hover (pode ser feito via CSS)
        card.addEventListener("mouseenter", function() {
            this.style.transform = "translateY(-5px)";
            this.style.boxShadow = "20px 20px 20px rgba(218, 73, 0, 0.39)"; // Sombra laranja suave
        });
        card.addEventListener("mouseleave", function() {
            this.style.transform = "translateY(0)";
            this.style.boxShadow = "none";
        });

        // Corrigido: busca pelo botão correto
        const viewProductsBtn = card.querySelector(".btn-brand");
        const brandId = card.getAttribute("data-brand-id"); // Pega o ID do atributo data

        if (viewProductsBtn && brandId) {
            viewProductsBtn.addEventListener("click", function(e) {
                e.preventDefault(); // Previne comportamento padrão do botão
                // Redireciona para a página de produtos com o filtro de marca (BrandIds)
                window.location.href = `/products.html?BrandIds=${brandId}`;
            });
        }
    });
}