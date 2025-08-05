document.addEventListener('DOMContentLoaded', function() {
    // Pagination variables
    let currentPage = 1;
    const pageSize = 10;
    let totalPages = 0;
    let totalItems = 0;
    
    // Initial load
    loadOrders(currentPage, pageSize);
    loadUsers();
    loadProducts();
    
    // Filter button click
    document.getElementById('filterButton').addEventListener('click', function() {
        currentPage = 1;
        loadOrders(currentPage, pageSize);
    });
    
    // Search input enter key
    document.getElementById('orderSearch').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            currentPage = 1;
            loadOrders(currentPage, pageSize);
        }
    });
    
    // Pagination controls
    document.getElementById('prevPage').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            loadOrders(currentPage, pageSize);
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            loadOrders(currentPage, pageSize);
        }
    });
    
    // Add item button
    document.getElementById('addItemBtn').addEventListener('click', function() {
        addOrderItem();
    });
    
    // Edit add item button
    document.getElementById('editAddItemBtn').addEventListener('click', function() {
        addEditOrderItem();
    });
    
    // Save new order
    document.getElementById('saveOrderBtn').addEventListener('click', async function() {
        const form = document.getElementById('addOrderForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        const orderData = {
            userId: formData.get('userId'),
            status: formData.get('status'),
            shippingAddress: formData.get('shippingAddress'),
            shippingMethod: formData.get('shippingMethod'),
            items: []
        };
        
        // Get all items
        const itemElements = document.querySelectorAll('#orderItems .order-item');
        itemElements.forEach((item, index) => {
            const productId = formData.get(`items[${index}].productId`);
            const quantity = parseInt(formData.get(`items[${index}].quantity`));
            
            if (productId && quantity > 0) {
                orderData.items.push({
                    productId: productId,
                    quantity: quantity
                });
            }
        });
        
        try {
            const response = await window.apiCall('/api/Order/create', 'POST', orderData);
            
            if (response && response.hasSuccess) {
                window.showNotification('Pedido adicionado com sucesso!', 'success');
                closeModal('addOrderModal');
                form.reset();
                loadOrders(currentPage, pageSize);
            } else {
                window.showNotification('Erro ao adicionar pedido: ' + (response?.errors?.join(', ') || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            console.error('Error saving order:', error);
            window.showNotification('Erro ao adicionar pedido', 'error');
        }
    });
    
    // Update order
    document.getElementById('updateOrderBtn').addEventListener('click', async function() {
        const form = document.getElementById('editOrderForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        const orderId = formData.get('id');
        const orderData = {
            status: formData.get('status'),
            shippingAddress: formData.get('shippingAddress'),
            shippingMethod: formData.get('shippingMethod')
        };
        
        try {
            const response = await window.apiCall(`/api/Order/update/${orderId}`, 'PUT', orderData);
            
            if (response && response.hasSuccess) {
                window.showNotification('Pedido atualizado com sucesso!', 'success');
                closeModal('editOrderModal');
                loadOrders(currentPage, pageSize);
            } else {
                window.showNotification('Erro ao atualizar pedido: ' + (response?.errors?.join(', ') || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            window.showNotification('Erro ao atualizar pedido', 'error');
        }
    });
    
    // Delete order
    document.getElementById('confirmDeleteBtn').addEventListener('click', async function() {
        const orderId = document.getElementById('deleteOrderIdInput').value;
        
        try {
            const response = await window.apiCall(`/api/Order/delete/${orderId}`, 'DELETE');
            
            if (response && response.hasSuccess) {
                window.showNotification('Pedido excluído com sucesso!', 'success');
                closeModal('deleteOrderModal');
                loadOrders(currentPage, pageSize);
            } else {
                window.showNotification('Erro ao excluir pedido: ' + (response?.errors?.join(', ') || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            window.showNotification('Erro ao excluir pedido', 'error');
        }
    });
    
    // Load orders function
    async function loadOrders(page, size) {
        const searchTerm = document.getElementById('orderSearch').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        let endpoint = `/api/Order/get?pageNumber=${page}&pageSize=${size}`;
        
        if (searchTerm) {
            endpoint += `&search=${encodeURIComponent(searchTerm)}`;
        }
        
        if (statusFilter) {
            endpoint += `&status=${encodeURIComponent(statusFilter)}`;
        }
        
        try {
            const response = await window.apiCall(endpoint);
            
            const tableBody = document.getElementById('ordersTable');
            if (!tableBody) return;
            
            if (response && response.value && response.value.items) {
                totalItems = response.value.totalItems || 0;
                totalPages = response.value.totalPages || 0;
                
                updatePagination(page, size, totalItems, totalPages);
                
                if (response.value.items.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum pedido encontrado</td></tr>';
                    return;
                }
                
                let html = '';
                response.value.items.forEach(order => {
                    let statusClass = '';
                    let statusText = '';
                    
                    switch (order.status) {
                        case 'Pending':
                            statusClass = 'status-pending';
                            statusText = 'Pendente';
                            break;
                        case 'Processing':
                            statusClass = 'status-pending';
                            statusText = 'Em processamento';
                            break;
                        case 'Shipped':
                            statusClass = 'status-pending';
                            statusText = 'Enviado';
                            break;
                        case 'Delivered':
                            statusClass = 'status-completed';
                            statusText = 'Entregue';
                            break;
                        case 'Cancelled':
                            statusClass = 'status-cancelled';
                            statusText = 'Cancelado';
                            break;
                        default:
                            statusClass = 'status-pending';
                            statusText = order.status;
                    }
                    
                    const paymentStatus = order.paymentStatus || 'Pendente';
                    const paymentClass = paymentStatus === 'Paid' ? 'status-completed' : 'status-pending';
                    const paymentText = paymentStatus === 'Paid' ? 'Pago' : 'Pendente';
                    
                    html += `
                        <tr>
                            <td>${order.id.substring(0, 8)}...</td>
                            <td>${order.userName || 'Cliente'}</td>
                            <td>${window.formatDate(order.createdAt)}</td>
                            <td>${window.formatCurrency(order.total)}</td>
                            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                            <td><span class="status-badge ${paymentClass}">${paymentText}</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-action btn-view" title="Ver detalhes" onclick="viewOrder('${order.id}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-action btn-edit" title="Editar" onclick="editOrder('${order.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-action btn-delete" title="Excluir" onclick="deleteOrder('${order.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
                
                tableBody.innerHTML = html;
            } else {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Erro ao carregar pedidos</td></tr>';
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            const tableBody = document.getElementById('ordersTable');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Erro ao carregar pedidos</td></tr>';
            }
        }
    }
    
    // Load users for select dropdown
    async function loadUsers() {
        try {
            const response = await window.apiCall('/api/Auth/get?pageSize=100');
            
            const userSelects = document.querySelectorAll('#orderUserId, #editOrderUserId');
            
            if (response && response.value && response.value.items) {
                let options = '<option value="">Selecione um cliente</option>';
                
                response.value.items.forEach(user => {
                    options += `<option value="${user.id}">${user.name} (${user.email})</option>`;
                });
                
                userSelects.forEach(select => {
                    select.innerHTML = options;
                });
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }
    
    // Load products for select dropdown
    async function loadProducts() {
        try {
            const response = await window.apiCall('/api/Product/get?pageSize=100');
            
            if (response && response.value && response.value.items) {
                window.productOptions = '<option value="">Selecione um produto</option>';
                
                response.value.items.forEach(product => {
                    window.productOptions += `<option value="${product.id}">${product.name} - ${window.formatCurrency(product.price)}</option>`;
                });
                
                document.querySelectorAll('.product-select').forEach(select => {
                    select.innerHTML = window.productOptions;
                });
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }
    
    // Add order item
    window.addOrderItem = function() {
        const orderItems = document.getElementById('orderItems');
        const itemCount = orderItems.querySelectorAll('.order-item').length;
        
        const newItem = document.createElement('div');
        newItem.className = 'order-item';
        newItem.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Produto</label>
                    <select name="items[${itemCount}].productId" class="form-control product-select" required>
                        ${window.productOptions || '<option value="">Carregando produtos...</option>'}
                    </select>
                </div>
                <div class="form-group">
                    <label>Quantidade</label>
                    <input type="number" name="items[${itemCount}].quantity" class="form-control" min="1" value="1" required>
                </div>
                <div class="form-group" style="align-self: flex-end;">
                    <button type="button" class="btn btn-danger remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        orderItems.appendChild(newItem);
        
        // Show all remove buttons if there's more than one item
        if (itemCount > 0) {
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.style.display = 'block';
            });
        }
        
        // Add event listener to remove button
        newItem.querySelector('.remove-item').addEventListener('click', function() {
            newItem.remove();
            
            // If only one item left, hide its remove button
            const remainingItems = orderItems.querySelectorAll('.order-item');
            if (remainingItems.length === 1) {
                remainingItems[0].querySelector('.remove-item').style.display = 'none';
            }
            
            // Renumber the items
            remainingItems.forEach((item, index) => {
                item.querySelector('select').name = `items[${index}].productId`;
                item.querySelector('input[type="number"]').name = `items[${index}].quantity`;
            });
        });
    }
    
    // Add edit order item
    window.addEditOrderItem = function() {
        const orderItems = document.getElementById('editOrderItems');
        const itemCount = orderItems.querySelectorAll('.order-item').length;
        
        const newItem = document.createElement('div');
        newItem.className = 'order-item';
        newItem.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Produto</label>
                    <select name="items[${itemCount}].productId" class="form-control product-select" required>
                        ${window.productOptions || '<option value="">Carregando produtos...</option>'}
                    </select>
                </div>
                <div class="form-group">
                    <label>Quantidade</label>
                    <input type="number" name="items[${itemCount}].quantity" class="form-control" min="1" value="1" required>
                </div>
                <div class="form-group" style="align-self: flex-end;">
                    <button type="button" class="btn btn-danger remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        orderItems.appendChild(newItem);
        
        // Add event listener to remove button
        newItem.querySelector('.remove-item').addEventListener('click', function() {
            newItem.remove();
            
            // Renumber the items
            const remainingItems = orderItems.querySelectorAll('.order-item');
            remainingItems.forEach((item, index) => {
                item.querySelector('select').name = `items[${index}].productId`;
                item.querySelector('input[type="number"]').name = `items[${index}].quantity`;
            });
        });
    }
    
    // Update pagination UI
    function updatePagination(currentPage, pageSize, totalItems, totalPages) {
        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(start + pageSize - 1, totalItems);
        
        document.getElementById('paginationStart').textContent = totalItems > 0 ? start : 0;
        document.getElementById('paginationEnd').textContent = end;
        document.getElementById('paginationTotal').textContent = totalItems;
        
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');
        
        prevButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage >= totalPages;
        
        // Generate page numbers
        const pagesContainer = document.getElementById('paginationPages');
        pagesContainer.innerHTML = '';
        
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            const firstPageBtn = document.createElement('button');
            firstPageBtn.className = 'pagination-page';
            firstPageBtn.textContent = '1';
            firstPageBtn.addEventListener('click', () => {
                currentPage = 1;
                loadOrders(currentPage, pageSize);
            });
            pagesContainer.appendChild(firstPageBtn);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pagesContainer.appendChild(ellipsis);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-page ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                loadOrders(currentPage, pageSize);
            });
            pagesContainer.appendChild(pageBtn);
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pagesContainer.appendChild(ellipsis);
            }
            
            const lastPageBtn = document.createElement('button');
            lastPageBtn.className = 'pagination-page';
            lastPageBtn.textContent = totalPages;
            lastPageBtn.addEventListener('click', () => {
                currentPage = totalPages;
                loadOrders(currentPage, pageSize);
            });
            pagesContainer.appendChild(lastPageBtn);
        }
    }
});

// View order details
function viewOrder(id) {
    window.location.href = `/html/admin/orders-detail.html?id=${id}`;
}

// Edit order
async function editOrder(id) {
    try {
        const response = await window.apiCall(`/api/Order/get/${id}`);
        
        if (response && response.hasSuccess && response.value) {
            const order = response.value;
            
            document.getElementById('editOrderId').value = order.id;
            document.getElementById('editOrderUserId').value = order.userId;
            document.getElementById('editOrderStatus').value = order.status;
            document.getElementById('editOrderShippingAddress').value = order.shippingAddress || '';
            document.getElementById('editOrderShippingMethod').value = order.shippingMethod || 'Standard';
            
            // Load order items
            const orderItemsContainer = document.getElementById('editOrderItems');
            orderItemsContainer.innerHTML = '';
            
            if (order.items && order.items.length > 0) {
                order.items.forEach((item, index) => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'order-item';
                    itemElement.innerHTML = `
                        <div class="form-row">
                            <div class="form-group">
                                <label>Produto</label>
                                <select name="items[${index}].productId" class="form-control product-select" required disabled>
                                    <option value="${item.productId}" selected>${item.productName}</option>
                                </select>
                                <input type="hidden" name="items[${index}].id" value="${item.id}">
                            </div>
                            <div class="form-group">
                                <label>Quantidade</label>
                                <input type="number" name="items[${index}].quantity" class="form-control" min="1" value="${item.quantity}" required>
                            </div>
                            <div class="form-group" style="align-self: flex-end;">
                                <button type="button" class="btn btn-danger remove-item" data-item-id="${item.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    
                    orderItemsContainer.appendChild(itemElement);
                    
                    // Add event listener to remove button
                    itemElement.querySelector('.remove-item').addEventListener('click', async function() {
                        const itemId = this.getAttribute('data-item-id');
                        if (itemId) {
                            try {
                                const deleteResponse = await window.apiCall(`/api/Order/delete/${order.id}/item/${itemId}`, 'DELETE');
                                
                                if (deleteResponse && deleteResponse.hasSuccess) {
                                    window.showNotification('Item removido com sucesso!', 'success');
                                    itemElement.remove();
                                } else {
                                    window.showNotification('Erro ao remover item: ' + (deleteResponse?.errors?.join(', ') || 'Erro desconhecido'), 'error');
                                }
                            } catch (error) {
                                console.error('Error deleting order item:', error);
                                window.showNotification('Erro ao remover item', 'error');
                            }
                        } else {
                            itemElement.remove();
                        }
                    });
                });
            } else {
                // Add an empty item if no items exist
                window.addEditOrderItem();
            }
            
            window.showModal('editOrderModal');
        } else {
            window.showNotification('Erro ao carregar dados do pedido', 'error');
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
        window.showNotification('Erro ao carregar dados do pedido', 'error');
    }
}

// Delete order
function deleteOrder(id) {
    document.getElementById('deleteOrderIdInput').value = id;
    document.getElementById('deleteOrderId').textContent = id.substring(0, 8) + '...';
    window.showModal('deleteOrderModal');
}
