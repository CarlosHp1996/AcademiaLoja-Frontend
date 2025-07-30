// // Função para inicializar a página de objetivos
// document.addEventListener("DOMContentLoaded", function() {
//     initializeGoalsPage();
// });

// document.addEventListener('DOMContentLoaded', () => {
//     const exploreButton = document.getElementById('explore-goals-btn');
//     const goalsSection = document.getElementById('goals-section');

//     if (exploreButton && goalsSection) {
//         exploreButton.addEventListener('click', (e) => {
//             e.preventDefault(); // Previne o comportamento padrão do link

//             // Calcula a altura dos cabeçalhos fixos para um posicionamento perfeito
//             const header = document.querySelector('.header');
//             const subheader = document.querySelector('.subheader');
//             const headerHeight = header ? header.offsetHeight : 0;
//             const subheaderHeight = subheader ? subheader.offsetHeight : 0;
//             const totalHeaderHeight = headerHeight + subheaderHeight;

//             // Calcula a posição da seção de destino
//             const sectionTop = goalsSection.getBoundingClientRect().top + window.scrollY;

//             // Rola a página suavemente até a posição correta
//             window.scrollTo({
//                 top: sectionTop - totalHeaderHeight - 1, // 20px de margem extra para respiro
//                 behavior: 'smooth'
//             });
//         });
//     }
// });



// //const API_BASE_URL = "https://localhost:4242/api";

// function initializeGoalsPage() {
//     // Adicionar eventos de clique nos cards de objetivos
//     initializeGoalCards();
// }

// // Função para inicializar os cards de objetivos
// function initializeGoalCards() {
//     const goalCards = document.querySelectorAll(".goal-card");

//     goalCards.forEach(card => {
//         // Adicionar efeito de hover (opcional, pode ser feito via CSS)
//         card.addEventListener("mouseenter", function() {
//             this.style.transform = "translateY(-5px)";
//             this.style.boxShadow = "0 4px 8px rgba(255, 165, 0, 0.3)"; // Sombra laranja suave
//         });
//         card.addEventListener("mouseleave", function() {
//             this.style.transform = "translateY(0)";
//             this.style.boxShadow = "none"; // Remover sombra ao sair
//         });

//         // Adicionar evento de clique para ver produtos do objetivo
//         const viewProductsBtn = card.querySelector(".btn-primary");
//         const objectiveId = card.getAttribute("data-objective-id");

//         if (viewProductsBtn && objectiveId) {
//             viewProductsBtn.addEventListener("click", function(e) {
//                 e.preventDefault(); // Prevenir comportamento padrão do link
                
//                 // Obter o nome do objetivo baseado no ID
//                 const objectiveName = getObjectiveNameById(objectiveId);
                
//                 // Redirecionar para a página de produtos com o filtro de objetivo e título
//                 const url = `/public/html/products.html?ObjectiveIds=${objectiveId}&title=${encodeURIComponent(objectiveName)}`;
//                 window.location.href = url;
//             });
//         }
//     });
// }

// // Função para obter o nome do objetivo baseado no ID
// function getObjectiveNameById(objectiveId) {
//     // Usar os enums do navigation-enums.js se disponível
//     if (window.NavigationEnums && window.NavigationEnums.ObjectiveDisplayNames) {
//         // Encontrar a chave do enum baseada no ID
//         const enumKey = Object.keys(window.NavigationEnums.EnumObjective).find(
//             key => window.NavigationEnums.EnumObjective[key] == objectiveId
//         );
        
//         if (enumKey && window.NavigationEnums.ObjectiveDisplayNames[enumKey]) {
//             return window.NavigationEnums.ObjectiveDisplayNames[enumKey];
//         }
//     }
    
//     // Fallback para mapeamento manual caso os enums não estejam disponíveis
//     const objectiveMap = {
//         Emagrecimento: 1,
//         Hipertrofia: 2,
//         Definicao: 3,
//         AumentoDeMassaMuscular: 4,
//         GanhoDePeso: 5,
//         AumentoDeForca: 6,
//         MelhoraDeDesempenho: 7,
//         MelhoraDeSaude: 8,
//         MelhoraDeRecuperacao: 9,
//         MelhoraDeImunidade: 10,
//         SaudeEBemEstar: 11
//     };
    
//     return objectiveMap[objectiveId] || "Objetivos";
// }