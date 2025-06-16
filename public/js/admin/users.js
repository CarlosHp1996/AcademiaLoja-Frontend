document.addEventListener('DOMContentLoaded', function() {
    // Pagination variables
    let currentPage = 1;
    const pageSize = 10;
    let totalPages = 0;
    let totalItems = 0;
    
    // Initial load
    loadUsers(currentPage, pageSize);
    
    // Filter button click
    document.getElementById('filterButton').addEventListener('click', function() {
        currentPage = 1;
        loadUsers(currentPage, pageSize);
    });
    
    // Search input enter key
    document.getElementById('userSearch').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            currentPage = 1;
            loadUsers(currentPage, pageSize);
        }
    });
    
    // Pagination controls
    document.getElementById('prevPage').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            loadUsers(currentPage, pageSize);
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            loadUsers(currentPage, pageSize);
        }
    });
    
    // Save new user
    document.getElementById('saveUserBtn').addEventListener('click', async function() {
        const form = document.getElementById('addUserForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            role: formData.get('role'),
            isActive: formData.get('isActive') === 'on'
        };
        
        try {
            const response = await window.apiCall('/api/Auth/create', 'POST', userData);
            
            if (response && response.hasSuccess) {
                window.showNotification('Usuário adicionado com sucesso!', 'success');
                closeModal('addUserModal');
                form.reset();
                loadUsers(currentPage, pageSize);
            } else {
                window.showNotification('Erro ao adicionar usuário: ' + (response?.errors?.join(', ') || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            window.showNotification('Erro ao adicionar usuário', 'error');
        }
    });
    
    // Update user
    document.getElementById('updateUserBtn').addEventListener('click', async function() {
        const form = document.getElementById('editUserForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        const userId = formData.get('id');
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            role: formData.get('role'),
            isActive: formData.get('isActive') === 'on'
        };
        
        // Only include password if it's not empty
        const password = formData.get('password');
        if (password) {
            userData.password = password;
        }
        
        try {
            const response = await window.apiCall('/api/Auth/update', 'PUT', userData);
            
            if (response && response.hasSuccess) {
                window.showNotification('Usuário atualizado com sucesso!', 'success');
                closeModal('editUserModal');
                loadUsers(currentPage, pageSize);
            } else {
                window.showNotification('Erro ao atualizar usuário: ' + (response?.errors?.join(', ') || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            window.showNotification('Erro ao atualizar usuário', 'error');
        }
    });
    
    // Delete user
    document.getElementById('confirmDeleteBtn').addEventListener('click', async function() {
        const userId = document.getElementById('deleteUserId').value;
        
        try {
            const response = await window.apiCall(`/api/Auth/delete/${userId}`, 'DELETE');
            
            if (response && response.hasSuccess) {
                window.showNotification('Usuário excluído com sucesso!', 'success');
                closeModal('deleteUserModal');
                loadUsers(currentPage, pageSize);
            } else {
                window.showNotification('Erro ao excluir usuário: ' + (response?.errors?.join(', ') || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            window.showNotification('Erro ao excluir usuário', 'error');
        }
    });
    
    // Load users function
    async function loadUsers(page, size) {
        const searchTerm = document.getElementById('userSearch').value;
        const roleFilter = document.getElementById('roleFilter').value;
        
        let endpoint = `/api/Auth/get?pageNumber=${page}&pageSize=${size}`;
        
        if (searchTerm) {
            endpoint += `&search=${encodeURIComponent(searchTerm)}`;
        }
        
        if (roleFilter) {
            endpoint += `&role=${encodeURIComponent(roleFilter)}`;
        }
        
        try {
            const response = await window.apiCall(endpoint);
            
            const tableBody = document.getElementById('usersTable');
            if (!tableBody) return;
            
            if (response && response.value && response.value.items) {
                totalItems = response.value.totalItems || 0;
                totalPages = response.value.totalPages || 0;
                
                updatePagination(page, size, totalItems, totalPages);
                
                if (response.value.items.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum usuário encontrado</td></tr>';
                    return;
                }
                
                let html = '';
                response.value.items.forEach(user => {
                    const statusClass = user.isActive ? 'status-completed' : 'status-cancelled';
                    const statusText = user.isActive ? 'Ativo' : 'Inativo';
                    
                    html += `
                        <tr>
                            <td>${user.id.substring(0, 8)}...</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.phone || 'N/A'}</td>
                            <td>${user.role === 'Admin' ? 'Administrador' : 'Usuário'}</td>
                            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-action btn-view" title="Ver detalhes" onclick="viewUser('${user.id}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-action btn-edit" title="Editar" onclick="editUser('${user.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-action btn-delete" title="Excluir" onclick="deleteUser('${user.id}', '${user.name}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
                
                tableBody.innerHTML = html;
            } else {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Erro ao carregar usuários</td></tr>';
            }
        } catch (error) {
            console.error('Error loading users:', error);
            const tableBody = document.getElementById('usersTable');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Erro ao carregar usuários</td></tr>';
            }
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
                loadUsers(currentPage, pageSize);
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
                loadUsers(currentPage, pageSize);
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
                loadUsers(currentPage, pageSize);
            });
            pagesContainer.appendChild(lastPageBtn);
        }
    }
});

// View user details
function viewUser(id) {
    window.location.href = `/public/html/admin/users-detail.html?id=${id}`;
}

// Edit user
async function editUser(id) {
    try {
        const response = await window.apiCall(`/api/Auth/get/${id}`);
        
        if (response && response.hasSuccess && response.value) {
            const user = response.value;
            
            document.getElementById('editUserId').value = user.id;
            document.getElementById('editUserName').value = user.name;
            document.getElementById('editUserEmail').value = user.email;
            document.getElementById('editUserPhone').value = user.phone || '';
            document.getElementById('editUserAddress').value = user.address || '';
            document.getElementById('editUserRole').value = user.role || 'Usuario';
            document.getElementById('editUserActive').checked = user.isActive;
            
            // Clear password field as it's for new password only
            document.getElementById('editUserPassword').value = '';
            
            window.showModal('editUserModal');
        } else {
            window.showNotification('Erro ao carregar dados do usuário', 'error');
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        window.showNotification('Erro ao carregar dados do usuário', 'error');
    }
}

// Delete user
function deleteUser(id, name) {
    document.getElementById('deleteUserId').value = id;
    document.getElementById('deleteUserName').textContent = name;
    window.showModal('deleteUserModal');
}
