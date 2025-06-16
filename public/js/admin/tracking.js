document.addEventListener('DOMContentLoaded', function() {
    // Pagination variables
    let currentPage = 1;
    const pageSize = 10;
    let totalPages = 0;
    let totalItems = 0;
    
    // Initial load
    loadTrackings(currentPage, pageSize);
    loadOrders();
    
    // Filter button click
    document.getElementById('filterButton').addEventListener('click', function() {
        currentPage = 1;
        loadTrackings(currentPage, pageSize);
    });
    
    // Search input enter key
    document.getElementById('trackingSearch').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            currentPage = 1;
            loadTrackings(currentPage, pageSize);
        }
    });
    
    // Pagination controls
    document.getElementById('prevPage').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            loadTrackings(currentPage, pageSize);
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            loadTrackings(currentPage, pageSize);
        }
    });
    
    // Save new tracking
    document.getElementById('saveTrackingBtn').addEventListener('click', async function() {
        const form = document.getElementById('addTrackingForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        const trackingData = {
            orderId: formData.get('orderId'),
            carrier: formData.get('carrier'),
            trackingCode: formData.get('trackingCode'),
            status: formData.get('status'),
            notes: formData.get('notes')
        };
        
        try {
            const response = await window.apiCall('/api/Tracking', 'POST', trackingData);
            
            if (response && response.hasSuccess) {
                window.showNotification('Rastreio adicionado com sucesso!', 'success');
                closeModal('addTrackingModal');
                form.reset();
                loadTrackings(currentPage, pageSize);
            } else {
                window.showNotification('Erro ao adicionar rastreio: ' + (response?.errors?.join(', ') || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            console.error('Error saving tracking:', error);
            window.showNotification('Erro ao adicionar rastreio', 'error');
        }
    });
    
    // Update tracking
    document.getElementById('updateTrackingBtn').addEventListener('click', async function() {
        const form = document.getElementById('editTrackingForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        const trackingId = formData.get('id');
        const trackingData = {
            carrier: formData.get('carrier'),
            trackingCode: formData.get('trackingCode'),
            status: formData.get('status'),
            notes: formData.get('notes')
        };
        
        try {
            const response = await window.apiCall(`/api/Tracking/${trackingId}`, 'PUT', trackingData);
            
            if (response && response.hasSuccess) {
                window.showNotification('Rastreio atualizado com sucesso!', 'success');
                closeModal('editTrackingModal');
                loadTrackings(currentPage, pageSize);
            } else {
                window.showNotification('Erro ao atualizar rastreio: ' + (response?.errors?.join(', ') || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            console.error('Error updating tracking:', error);
            window.showNotification('Erro ao atualizar rastreio', 'error');
        }
    });
    
    // Delete tracking
    document.getElementById('confirmDeleteBtn').addEventListener('click', async function() {
        const trackingId = document.getElementById('deleteTrackingId').value;
        
        try {
            const response = await window.apiCall(`/api/Tracking/${trackingId}`, 'DELETE');
            
            if (response && response.hasSuccess) {
                window.showNotification('Rastreio excluído com sucesso!', 'success');
                closeModal('deleteTrackingModal');
                loadTrackings(currentPage, pageSize);
            } else {
                window.showNotification('Erro ao excluir rastreio: ' + (response?.errors?.join(', ') || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            console.error('Error deleting tracking:', error);
            window.showNotification('Erro ao excluir rastreio', 'error');
        }
    });
    
    // Load trackings function
    async function loadTrackings(page, size) {
        const searchTerm = document.getElementById('trackingSearch').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        let endpoint = `/api/Tracking?pageNumber=${page}&pageSize=${size}`;
        
        if (searchTerm) {
            endpoint += `&search=${encodeURIComponent(searchTerm)}`;
        }
        
        if (statusFilter) {
            endpoint += `&status=${encodeURIComponent(statusFilter)}`;
        }
        
        try {
            const response = await window.apiCall(endpoint);
            
            const tableBody = document.getElementById('trackingTable');
            if (!tableBody) return;
            
            if (response && response.value && response.value.items) {
                totalItems = response.value.totalItems || 0;
                totalPages = response.value.totalPages || 0;
                
                updatePagination(page, size, totalItems, totalPages);
                
                if (response.value.items.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum rastreio encontrado</td></tr>';
                    return;
                }
                
                let html = '';
                response.value.items.forEach(tracking => {
                    let statusClass = '';
                    let statusText = '';
                    
                    switch (tracking.status) {
                        case 'Pending':
                            statusClass = 'status-pending';
                            statusText = 'Pendente';
                            break;
                        case 'InTransit':
                            statusClass = 'status-pending';
                            statusText = 'Em trânsito';
                            break;
                        case 'Delivered':
                            statusClass = 'status-completed';
                            statusText = 'Entregue';
                            break;
                        case 'Returned':
                            statusClass = 'status-cancelled';
                            statusText = 'Devolvido';
                            break;
                        default:
                            statusClass = 'status-pending';
                            statusText = tracking.status;
                    }
                    
                    html += `
                        <tr>
                            <td>${tracking.id.substring(0, 8)}...</td>
                            <td>${tracking.orderId.substring(0, 8)}...</td>
                            <td>${tracking.trackingCode}</td>
                            <td>${tracking.carrier}</td>
                            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                            <td>${window.formatDate(tracking.updatedAt || tracking.createdAt)}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-action btn-edit" title="Editar" onclick="editTracking('${tracking.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-action btn-delete" title="Excluir" onclick="deleteTracking('${tracking.id}', '${tracking.trackingCode}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
                
                tableBody.innerHTML = html;
            } else {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Erro ao carregar rastreios</td></tr>';
            }
        } catch (error) {
            console.error('Error loading trackings:', error);
            const tableBody = document.getElementById('trackingTable');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Erro ao carregar rastreios</td></tr>';
            }
        }
    }
    
    // Load orders for select dropdown
    async function loadOrders() {
        try {
            const response = await window.apiCall('/api/Order/get?pageSize=100&status=Processing,Shipped');
            
            const orderSelects = document.querySelectorAll('#trackingOrderId, #editTrackingOrderId');
            
            if (response && response.value && response.value.items) {
                let options = '<option value="">Selecione um pedido</option>';
                
                response.value.items.forEach(order => {
                    options += `<option value="${order.id}">${order.id.substring(0, 8)}... - ${order.userName}</option>`;
                });
                
                orderSelects.forEach(select => {
                    select.innerHTML = options;
                });
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
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
                loadTrackings(currentPage, pageSize);
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
                loadTrackings(currentPage, pageSize);
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
                loadTrackings(currentPage, pageSize);
            });
            pagesContainer.appendChild(lastPageBtn);
        }
    }
});

// Edit tracking
async function editTracking(id) {
    try {
        const response = await window.apiCall(`/api/Tracking/${id}`);
        
        if (response && response.hasSuccess && response.value) {
            const tracking = response.value;
            
            document.getElementById('editTrackingId').value = tracking.id;
            document.getElementById('editTrackingOrderId').value = tracking.orderId;
            document.getElementById('editTrackingCarrier').value = tracking.carrier;
            document.getElementById('editTrackingCode').value = tracking.trackingCode;
            document.getElementById('editTrackingStatus').value = tracking.status;
            document.getElementById('editTrackingNotes').value = tracking.notes || '';
            
            window.showModal('editTrackingModal');
        } else {
            window.showNotification('Erro ao carregar dados do rastreio', 'error');
        }
    } catch (error) {
        console.error('Error fetching tracking details:', error);
        window.showNotification('Erro ao carregar dados do rastreio', 'error');
    }
}

// Delete tracking
function deleteTracking(id, code) {
    document.getElementById('deleteTrackingId').value = id;
    document.getElementById('deleteTrackingCode').textContent = code;
    window.showModal('deleteTrackingModal');
}
