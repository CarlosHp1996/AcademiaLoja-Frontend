document.addEventListener("DOMContentLoaded", function () {
  // Fetch dashboard data
  fetchDashboardData();
  fetchRecentOrders();
  fetchRecentProducts();

  // Function to fetch dashboard data
  async function fetchDashboardData() {
    try {
      // Fetch product count
      const productsResponse = await window.apiCall(
        "https://academialoja-production.up.railway.app/api/Product/get?pageSize=1&pageNumber=1"
      );
      if (productsResponse && productsResponse.value) {
        document.getElementById("productCount").textContent =
          productsResponse.value.totalItems || 0;
      }

      // Fetch user count
      const usersResponse = await window.apiCall(
        "https://academialoja-production.up.railway.app/api/Auth/get?pageSize=1&pageNumber=1"
      );
      if (usersResponse && usersResponse.value) {
        document.getElementById("userCount").textContent =
          usersResponse.value.totalItems || 0;
      }

      // Fetch order count
      const ordersResponse = await window.apiCall(
        "https://academialoja-production.up.railway.app/api/Order/get?pageSize=1&pageNumber=1"
      );
      if (ordersResponse && ordersResponse.value) {
        document.getElementById("orderCount").textContent =
          ordersResponse.value.totalItems || 0;
      }

      // Fetch payment count
      const paymentsResponse = await window.apiCall(
        "https://academialoja-production.up.railway.app/api/Payment/verify?pageSize=1&pageNumber=1"
      );
      if (paymentsResponse && paymentsResponse.value) {
        document.getElementById("paymentCount").textContent =
          paymentsResponse.value.totalItems || 0;
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      window.showNotification("Erro ao carregar dados do dashboard", "error");
    }
  }

  // Function to fetch recent orders
  async function fetchRecentOrders() {
    try {
      const response = await window.apiCall(
        "https://academialoja-production.up.railway.app/api/Order/get?pageSize=5&pageNumber=1&sortBy=createdAt&sortDirection=desc"
      );

      const tableBody = document.getElementById("recentOrdersTable");
      if (!tableBody) return;

      if (response && response.value && response.value.items) {
        if (response.value.items.length === 0) {
          tableBody.innerHTML =
            '<tr><td colspan="6" class="text-center">Nenhum pedido encontrado</td></tr>';
          return;
        }

        let html = "";
        response.value.items.forEach((order) => {
          let statusClass = "";
          let statusText = "";

          switch (order.status) {
            case "Pending":
              statusClass = "status-pending";
              statusText = "Pendente";
              break;
            case "Completed":
              statusClass = "status-completed";
              statusText = "Concluído";
              break;
            case "Cancelled":
              statusClass = "status-cancelled";
              statusText = "Cancelado";
              break;
            default:
              statusClass = "status-pending";
              statusText = order.status;
          }

          html += `
                        <tr>
                            <td>${order.id.substring(0, 8)}...</td>
                            <td>${order.userName || "Cliente"}</td>
                            <td>${window.formatDate(order.createdAt)}</td>
                            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                            <td>${window.formatCurrency(order.total)}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-action btn-view" title="Ver detalhes" onclick="window.location.href='/admin/orders-detail.html?id=${
                                      order.id
                                    }'">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-action btn-edit" title="Editar" onclick="window.location.href='/admin/orders-edit.html?id=${
                                      order.id
                                    }'">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
        });

        tableBody.innerHTML = html;
      } else {
        tableBody.innerHTML =
          '<tr><td colspan="6" class="text-center">Erro ao carregar pedidos</td></tr>';
      }
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      const tableBody = document.getElementById("recentOrdersTable");
      if (tableBody) {
        tableBody.innerHTML =
          '<tr><td colspan="6" class="text-center">Erro ao carregar pedidos</td></tr>';
      }
    }
  }

  // Function to fetch recent products
  async function fetchRecentProducts() {
    try {
      const response = await window.apiCall(
        "https://academialoja-production.up.railway.app/api/Product/get?pageSize=5&pageNumber=1&sortBy=createdAt&sortDirection=desc"
      );

      const tableBody = document.getElementById("recentProductsTable");
      if (!tableBody) return;

      if (response && response.value && response.value.items) {
        if (response.value.items.length === 0) {
          tableBody.innerHTML =
            '<tr><td colspan="7" class="text-center">Nenhum produto encontrado</td></tr>';
          return;
        }

        let html = "";
        response.value.items.forEach((product) => {
          html += `
                        <tr>
                            <td>${product.id.substring(0, 8)}...</td>
                            <td>
                                <img src="${
                                  product.imageUrl ||
                                  "/assets/images/placeholder.jpg"
                                }" alt="${
            product.name
          }" width="50" height="50" style="object-fit: cover; border-radius: 4px;">
                            </td>
                            <td>${product.name}</td>
                            <td>${product.category || "Sem categoria"}</td>
                            <td>${window.formatCurrency(product.price)}</td>
                            <td>${product.stockQuantity || 0}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-action btn-view" title="Ver detalhes" onclick="window.location.href='/admin/products-detail.html?id=${
                                      product.id
                                    }'">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-action btn-edit" title="Editar" onclick="window.location.href='/admin/products-edit.html?id=${
                                      product.id
                                    }'">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
        });

        tableBody.innerHTML = html;
      } else {
        tableBody.innerHTML =
          '<tr><td colspan="7" class="text-center">Erro ao carregar produtos</td></tr>';
      }
    } catch (error) {
      console.error("Error fetching recent products:", error);
      const tableBody = document.getElementById("recentProductsTable");
      if (tableBody) {
        tableBody.innerHTML =
          '<tr><td colspan="7" class="text-center">Erro ao carregar produtos</td></tr>';
      }
    }
  }
});
