/**
 * Script para integrar todos os componentes de autenticação e segurança
 * Deve ser incluído em todas as páginas HTML após o auth-service.js
 */

const API_BASE_URL_AUTH = "https://localhost:4242/api"; // Ajuste se necessário

// Função para verificar e decodificar token JWT
function decodeJWT(token) {
    try {
        if (!token) return null;
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(atob(base64).split("").map(function(c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(""));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Erro ao decodificar token:", error);
        return null;
    }
}

// Função para verificar acesso à página
function checkPageAccess() {
    if (!window.authService) {
        setTimeout(checkPageAccess, 100);
        return false;
    }
    const currentPath = window.location.pathname;
    const userRestrictedPages = [
        "/cart.html",
        "/checkout.html",
        "/dashboard.html",
        "/order-details.html",
        "/profile.html",
        "/orders.html",
        "/tracking.html",
        "/account/my-account.html"
    ];
    const adminRestrictedPages = [
        "/admin/index.html",
        "/admin/orders.html",
        "/admin/payments.html",
        "/admin/products.html",
        "/admin/tracking.html",
        "/admin/users.html"
    ];
    const isUserRestricted = userRestrictedPages.some(page => currentPath.toLowerCase().includes(page.toLowerCase()));
    const isAdminRestricted = adminRestrictedPages.some(page => currentPath.toLowerCase().includes(page.toLowerCase()));
    const isAuthenticated = window.authService.isAuthenticated();
    const userRole = window.authService.getUserRole();

    console.log("Verificação de acesso:", { currentPath, isAuthenticated, userRole, isUserRestricted, isAdminRestricted });

    if (isAdminRestricted) {
        if (!isAuthenticated || userRole !== "Admin") {
            console.log("Acesso negado: página de admin");
            window.location.href = "/";
            if (window.authNotifications) window.authNotifications.accessDenied("Você precisa ser um administrador para acessar esta página.");
            return false;
        }
    } else if (isUserRestricted) {
        if (!isAuthenticated) {
            console.log("Acesso negado: login necessário");
            window.location.href = "/login.html?redirect=" + encodeURIComponent(currentPath);
            if (window.authNotifications) window.authNotifications.loginRequired();
            return false;
        }
    }
    return true;
}

// Função para inicializar o dropdown do usuário
function initUserDropdown() {
    if (!window.authService) {
        setTimeout(initUserDropdown, 100);
        return;
    }
    const userDropdown = document.querySelector(".user-dropdown");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    const userBtn = document.querySelector(".user-icon-btn");

    if (userDropdown && userBtn && dropdownMenu) {
        console.log("Inicializando dropdown do usuário");
        window.authService.updateUserDropdown();
        userBtn.replaceWith(userBtn.cloneNode(true));
        const newUserBtn = document.querySelector(".user-icon-btn");
        newUserBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle("active");
        });
        document.addEventListener("click", function(e) {
            if (!userDropdown.contains(e.target)) {
                dropdownMenu.classList.remove("active");
            }
        });
        dropdownMenu.addEventListener("click", function(e) {
            dropdownMenu.classList.remove("active");
        });
        console.log("Dropdown inicializado com sucesso");
    } else {
        console.log("Elementos do dropdown não encontrados:", { userDropdown: !!userDropdown, dropdownMenu: !!dropdownMenu, userBtn: !!userBtn });
    }
}

// Função para buscar e atualizar a contagem de itens no carrinho
async function updateCartItemCount() {
    if (!window.authService || !window.authService.isAuthenticated()) {
        console.log("Usuário não autenticado, não atualizando contagem do carrinho.");
        const cartBadge = document.querySelector(".cart-badge");
        if (cartBadge) {
            cartBadge.textContent = "0";
            cartBadge.style.display = "none";
        }
        return;
    }

    const userId = window.authService.getUserId();
    const token = window.authService.getToken();

    if (!userId || !token) {
        console.error("ID do usuário ou token não encontrado para buscar ordens.");
        return;
    }

    const url = `${API_BASE_URL_AUTH}/Order/get?UserId=${userId}`;
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

    try {
        console.log(`Buscando ordens para o usuário ${userId}...`);
        const response = await fetch(url, { headers });

        if (!response.ok) {
            // Se for 404 (nenhuma ordem encontrada), tratar como 0 itens
            if (response.status === 404) {
                 console.log("Nenhuma ordem encontrada para o usuário.");
                 updateCartBadgeDisplay(0);
                 return;
            }
            const errorData = await response.json().catch(() => ({ errors: [`Erro ${response.status}`] }));
            throw new Error(errorData.errors ? errorData.errors.join(", ") : `Erro ${response.status}`);
        }

        const result = await response.json();
        console.log("Resposta da API de ordens:", result);

        let totalItems = 0;
        if (result.hasSuccess && result.value && Array.isArray(result.value.orders)) {
            result.value.orders.forEach(order => {
                if (order.orderItems && Array.isArray(order.orderItems)) {
                    order.orderItems.forEach(item => {
                        totalItems += item.quantity || 0;
                    });
                }
            });
            console.log(`Total de itens calculado: ${totalItems}`);
        } else {
            console.log("Resposta da API não contém ordens ou formato inesperado.");
        }

        updateCartBadgeDisplay(totalItems);

    } catch (error) {
        console.error("Erro ao buscar ordens do usuário:", error);
        // Manter o badge zerado ou oculto em caso de erro
        updateCartBadgeDisplay(0);
        if (window.authNotifications) {
             window.authNotifications.showNotification(`Erro ao atualizar carrinho: ${error.message}`, "error");
        }
    }
}

// Função auxiliar para atualizar a exibição do badge
function updateCartBadgeDisplay(count) {
    const cartBadge = document.querySelector(".cart-badge");
    if (cartBadge) {
        if (count > 0) {
            cartBadge.textContent = count;
            cartBadge.style.display = "flex"; // Ou "inline-flex", dependendo do CSS
            console.log(`Badge do carrinho atualizado para ${count}`);
        } else {
            cartBadge.textContent = "0";
            cartBadge.style.display = "none";
            console.log("Badge do carrinho oculto (0 itens).");
        }
    }
}

// Função para mostrar informações de debug do usuário
function showUserDebugInfo() {
    if (window.authService) {
        console.log("Status de autenticação:", {
            isAuthenticated: window.authService.isAuthenticated(),
            userName: window.authService.getUserName(),
            userRole: window.authService.getUserRole(),
            userId: window.authService.getUserId(),
            token: !!localStorage.getItem("authToken"),
            userData: JSON.parse(localStorage.getItem("userData") || "{}")
        });
    }
}

// Função para aguardar que todos os serviços estejam carregados
function waitForServices(callback, maxAttempts = 50) {
    let attempts = 0;
    function checkServices() {
        attempts++;
        if (window.authService) {
            console.log("Serviços carregados, executando callback");
            callback();
        } else if (attempts < maxAttempts) {
            console.log(`Aguardando serviços... tentativa ${attempts}`);
            setTimeout(checkServices, 100);
        } else {
            console.error("Timeout: Serviços não carregaram a tempo");
        }
    }
    checkServices();
}

// Inicialização principal
function initAuth() {
    console.log("Iniciando sistema de autenticação");
    showUserDebugInfo();
    if (!checkPageAccess()) return;
    initUserDropdown();
    //updateCartItemCount(); // Atualiza a contagem do carrinho após inicializar a autenticação
    console.log("Sistema de autenticação inicializado");
}

// Verifica acesso e inicializa componentes quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM carregado, aguardando serviços...");
    waitForServices(initAuth);
});

// Também exporta as funções para uso manual se necessário
window.authIntegration = {
    checkPageAccess,
    initUserDropdown,
    showUserDebugInfo,
    initAuth,
   // updateCartItemCount // Exporta a função para ser chamada externamente se necessário (ex: após adicionar item)
};

