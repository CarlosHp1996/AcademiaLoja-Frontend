document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = "https://localhost:4242/api";

    function getAuthToken() {
        return localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    }

    function getAuthHeaders() {
        const token = getAuthToken();
        return {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
        };
    }

    function parseJwt(token) {
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    const tokenStr = getAuthToken();
    const payload = parseJwt(tokenStr);
    const userId = payload ? payload.id : null;

    async function loadUserInfo() {
        try {
            const response = await fetch(`${API_BASE_URL}/Auth/get/${userId}`, {
                method: "GET",
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.hasSuccess && result.value) {
                    const user = result.value;
                    document.getElementById('user-name').textContent = user.name || "Usuário";
                    document.getElementById('user-email').textContent = user.email || "";
                    
                    document.getElementById('name').value = user.name || "";
                    document.getElementById('cpf').value = user.cpf || "";
                    document.getElementById('email').value = user.email || "";
                    document.getElementById('phone').value = user.phoneNumber || "";
                    document.getElementById('birthdate').value = user.birthdate ? user.birthdate.split('T')[0] : "";
                    document.getElementById('gender').value = user.gender || "prefer_not_to_say";

                    if (user.address) {
                        document.getElementById('cep').value = user.address.cep || "";
                        document.getElementById('street').value = user.address.street || "";
                        document.getElementById('number').value = user.address.number || "";
                        document.getElementById('complement').value = user.address.complement || "";
                        document.getElementById('neighborhood').value = user.address.neighborhood || "";
                        document.getElementById('city').value = user.address.city || "";
                        document.getElementById('state').value = user.address.state || "";
                        document.getElementById('country').value = user.address.country || "";
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao carregar informações do usuário:", error);
        }
    }

    if (userId) {
        loadUserInfo();
    }

    const profileForm = document.getElementById('profileForm');
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Coletar dados do formulário e enviar para a API
    });

    const addressForm = document.getElementById('addressForm');
    addressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Coletar dados e salvar
    });

    const passwordForm = document.getElementById('passwordForm');
    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Coletar senhas e enviar para a API
    });

    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const passwordInput = button.previousElementSibling;
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                button.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordInput.type = 'password';
                button.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });
});
