// Configuração da API
const API_BASE_URL = "https://academialoja-production.up.railway.app/api";

// Elementos do DOM
const orderSearch = document.getElementById("orderSearch");
const searchBtn = document.getElementById("dashboard-search-btn");
const statusFilter = document.getElementById("statusFilter");
const dateSort = document.getElementById("dateSort");
const ordersContainer = document.getElementById("orders-container");
const loadingContainer = document.getElementById("loading-container");
const emptyState = document.getElementById("empty-state");
const errorState = document.getElementById("error-state");
const errorMessage = document.getElementById("error-message");
const paginationContainer = document.getElementById("pagination");
const paginationPages = document.getElementById("pagination-pages");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");

// Estado da aplicação
let currentPage = 1;
let totalPages = 1;
const currentFilters = {
  search: "",
  status: "",
  sort: "desc",
};

// Função para obter token de autenticação
function getAuthToken() {
  return (
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  );
}

// Função para obter headers de autenticação
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

// Função para verificar se o usuário está autenticado
function checkAuthentication() {
  const token = getAuthToken();
  if (!token) {
    window.location.href = "/login.html";
    return false;
  }
  return true;
}

function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const tokenStr = getAuthToken();
const payload = parseJwt(tokenStr);
const userId = payload ? payload.id : null;

// Função para carregar informações do usuário
async function loadUserInfo() {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/get/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.hasSuccess && result.value) {
        userName.textContent = result.value.user.userName || "Usuário";
        userEmail.textContent = result.value.user.email || "";
      }
    }
  } catch (error) {
    console.error("Erro ao carregar informações do usuário:", error);
  }
}

// Função para carregar os pedidos
async function loadOrders(page = 1, filters = currentFilters) {
  if (!checkAuthentication()) return;

  showLoading();
  hideStates();

  try {
    // Construir parâmetros de query
    const queryParams = new URLSearchParams({
      Page: page.toString(),
      PageSize: "10",
      //SortBy: "OrderDate",
      SortDirection: filters.sort, // "asc" ou "desc"
    });

    // Adicionar filtros se existirem
    if (filters.search) {
      queryParams.append("OrderNumber", filters.search);
    }
    if (filters.status) {
      queryParams.append("Status", filters.status);
    }

    const response = await fetch(`${API_BASE_URL}/Order/get?${queryParams}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        window.location.href = "/login.html";
        return;
      }
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.hasSuccess && result.value) {
      const orders = result.value.orders || [];
      totalPages = result.value.totalPages || 1;
      currentPage = page;

      if (orders.length === 0) {
        showEmptyState();
      } else {
        renderOrders(orders);
        updatePagination();
        showOrdersContainer();
      }
    } else {
      throw new Error(result.errors?.[0] || "Erro ao carregar pedidos");
    }
  } catch (error) {
    console.error("Erro ao carregar pedidos:", error);
    showError(error.message || "Erro ao carregar pedidos. Tente novamente.");
  } finally {
    hideLoading();
  }
}

// Função para renderizar os pedidos
function renderOrders(orders) {
  ordersContainer.innerHTML = orders
    .map(
      (order) => `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
                <div class="order-info">
                    <h3 class="order-number">Pedido #${
                      order.orderNumber || order.id.substring(0, 8)
                    }</h3>
                    <span class="order-date">${formatDate(
                      order.createdAt || order.orderDate
                    )}</span>
                </div>
                <div class="order-status ${getStatusClass(order.status)}">
                    <i class="fas ${getStatusIcon(order.status)}"></i>
                    ${getStatusText(order.status)}
                </div>
            </div>
            <div class="order-items">
                ${renderOrderItems(order.items || order.orderItems || [])}
            </div>
            <div class="order-footer">
                <div class="order-total">
                    <span>Total:</span>
                    <strong>R$ ${formatPrice(
                      order.totalAmount || order.total || 0
                    )}</strong>
                </div>
                <div class="order-actions">
                    <button class="btn btn-outline" onclick="viewOrderDetails('${
                      order.id
                    }')">
                        <i class="fas fa-eye"></i>
                        Ver Detalhes
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Função para renderizar itens do pedido
function renderOrderItems(items) {
  if (!items || items.length === 0) {
    return '<div class="no-items">Nenhum item encontrado</div>';
  }

  return items
    .map(
      (item) => `
        <div class="order-item">
            <div class="item-image">
                <img src="${item.productImageUrl || item.image}" 
                     alt="${item.productName || item.name || "Produto"}>
                <h4 class="item-name">${
                  item.productName || item.name || "Produto"
                }</h4>
            </div>
            <div class="item-details">
                <h4 class="item-name">${
                  item.productName || item.name || "Produto"
                }</h4>
                <p class="item-variant">${
                  item.variant || item.description || ""
                }</p>
                <p class="item-quantity">Quantidade: ${item.quantity || 1}</p>
            </div>
            <div class="item-price">
                <span class="price">R$ ${formatPrice(
                  item.unitPrice || item.price || 0
                )}</span>
            </div>
        </div>
    `
    )
    .join("");
}

// Função para atualizar a paginação
function updatePagination() {
  if (totalPages <= 1) {
    paginationContainer.style.display = "none";
    return;
  }

  paginationContainer.style.display = "flex";

  // Atualizar botões de navegação
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;

  // Gerar páginas
  let pagesHTML = "";
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pagesHTML += `
            <button class="pagination-page ${
              i === currentPage ? "active" : ""
            }" 
                    onclick="changePage(${i})">${i}</button>
        `;
  }

  paginationPages.innerHTML = pagesHTML;
}

// Função para mudar página
function changePage(page) {
  if (page !== currentPage && page >= 1 && page <= totalPages) {
    loadOrders(page, currentFilters);
  }
}

// Funções de estado da UI
function showLoading() {
  loadingContainer.style.display = "flex";
}

function hideLoading() {
  loadingContainer.style.display = "none";
}

function showEmptyState() {
  emptyState.style.display = "flex";
}

function showError(message) {
  errorMessage.textContent = message;
  errorState.style.display = "flex";
}

function showOrdersContainer() {
  ordersContainer.style.display = "flex";
}

function hideStates() {
  emptyState.style.display = "none";
  errorState.style.display = "none";
  ordersContainer.style.display = "none";
}

// Função para formatar data
function formatDate(dateString) {
  if (!dateString) return "Data não disponível";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    return "Data inválida";
  }
}

// Função para formatar preço
function formatPrice(price) {
  if (typeof price !== "number") {
    price = Number.parseFloat(price) || 0;
  }
  return price.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Função para obter classe CSS do status
function getStatusClass(status) {
  const statusMap = {
    PENDING: "pending",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  };
  return statusMap[status?.toUpperCase()] || "pending";
}

// Função para obter ícone do status
function getStatusIcon(status) {
  const icons = {
    PENDING: "fa-clock",
    PROCESSING: "fa-box",
    SHIPPED: "fa-truck",
    DELIVERED: "fa-check-circle",
    CANCELLED: "fa-times-circle",
  };
  return icons[status?.toUpperCase()] || "fa-question-circle";
}

// Função para obter texto do status
function getStatusText(status) {
  const texts = {
    PENDING: "Pendente de Pagamento",
    PROCESSING: "Em Processamento",
    SHIPPED: "Em Transporte",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelado",
  };
  return texts[status?.toUpperCase()] || status || "Status desconhecido";
}

// Função para obter botão de ação baseado no status
// function getActionButton(order) {
//   const status = order.status?.toUpperCase()
//   const actions = {
//     PENDING: `
//             <button class="btn btn-primary" onclick="finishPayment('${order.id}')">
//                 <i class="fas fa-credit-card"></i>
//                 Finalizar Pagamento
//             </button>
//         `,
//     PROCESSING: `
//             <button class="btn btn-primary" onclick="trackOrder('${order.id}')">
//                 <i class="fas fa-box"></i>
//                 Acompanhar
//             </button>
//         `,
//     SHIPPED: `
//             <button class="btn btn-primary" onclick="trackOrder('${order.id}')">
//                 <i class="fas fa-truck"></i>
//                 Rastrear Pedido
//             </button>
//         `,
//     DELIVERED: `
//             <button class="btn btn-primary" onclick="buyAgain('${order.id}')">
//                 <i class="fas fa-shopping-cart"></i>
//                 Comprar Novamente
//             </button>
//         `,
//     CANCELLED: `
//             <button class="btn btn-primary" onclick="contactSupport('${order.id}')">
//                 <i class="fas fa-headset"></i>
//                 Falar com Atendente
//             </button>
//         `,
//   }
//   return actions[status] || ""
// }

// Event Listeners
searchBtn.addEventListener("click", () => {
  currentFilters.search = orderSearch.value;
  loadOrders(1, currentFilters);
});

statusFilter.addEventListener("change", (e) => {
  currentFilters.status = e.target.value;
  loadOrders(1, currentFilters);
});

dateSort.addEventListener("change", (e) => {
  currentFilters.sort = e.target.value;
  loadOrders(1, currentFilters);
});

// Navegação da paginação
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    changePage(currentPage - 1);
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    changePage(currentPage + 1);
  }
});

// Logout
logoutBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    // Tentar fazer logout no servidor
    await fetch(`${API_BASE_URL}/Auth/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error("Erro ao fazer logout no servidor:", error);
  } finally {
    // Limpar tokens locais
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    window.location.href = "/login.html";
  }
});

// Funções de ação dos pedidos
async function viewOrderDetails(orderId) {
  window.location.href = `/order-details.html?id=${orderId}`;
}

async function finishPayment(orderId) {
  window.location.href = `/payment.html?order=${orderId}`;
}

async function trackOrder(orderId) {
  window.location.href = `/tracking.html?order=${orderId}`;
}

// async function buyAgain(orderId) {
//   try {
//     const response = await fetch(`${API_BASE_URL}/Order/buy-again/${orderId}`, {
//       method: "POST",
//       headers: getAuthHeaders(),
//     })

//     if (response.ok) {
//       window.location.href = "/cart.html"
//     } else {
//       throw new Error("Erro ao adicionar produtos ao carrinho")
//     }
//   } catch (error) {
//     alert("Erro ao adicionar produtos ao carrinho. Por favor, tente novamente.")
//     console.error("Erro:", error)
//   }
// }

async function contactSupport(orderId) {
  window.location.href = `/support.html?order=${orderId}`;
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  if (checkAuthentication()) {
    loadUserInfo();
    loadOrders();
  }
});
