document.addEventListener("DOMContentLoaded", () => {
    const mainContent = document.getElementById("adminMainContent");
    const modalContainer = document.getElementById("modalContainer");
    const sidebarNav = document.querySelector(".admin-sidebar .sidebar-nav ul");
    const adminJsBasePath = "/js/admin/";

    // --- Helper Functions ---

    // Function to remove previously loaded module script
    const removeModuleScript = () => {
        const oldScript = document.getElementById("adminModuleScript");
        if (oldScript) {
            oldScript.remove();
        }
    };

    // Function to load and execute the specific script for the loaded module
    const loadAndExecuteScript = (scriptPath) => {
        return new Promise((resolve, reject) => {
            removeModuleScript(); // Remove previous script first
            const script = document.createElement("script");
            script.id = "adminModuleScript"; // ID to find and remove later
            script.src = scriptPath;
            script.async = true;

            script.onload = () => {
                console.log(`Script loaded: ${scriptPath}`);
                resolve();
            };

            script.onerror = (error) => {
                console.error(`Error loading script: ${scriptPath}`, error);
                mainContent.innerHTML = `<p class="error">Erro ao carregar o script necessário para esta página (${scriptPath}).</p>`;
                reject(error);
            };

            document.body.appendChild(script);
        });
    };

    // Function to update the active state in the sidebar
    const updateSidebarActiveState = (pageIdentifier) => {
        sidebarNav.querySelectorAll("li").forEach(li => {
            li.classList.remove("active");
            if (li.dataset.page === pageIdentifier) {
                li.classList.add("active");
            }
        });
    };

    // Function to fetch and load admin page content
    const loadAdminPage = async (htmlPath, pageIdentifier) => {
        if (!mainContent || !modalContainer) {
            console.error("Main content or modal container not found!");
            return;
        }

        mainContent.classList.add("loading");
        mainContent.innerHTML = ""; // Clear previous content
        modalContainer.innerHTML = ""; // Clear previous modals
        removeModuleScript(); // Clear previous script immediately

        try {
            const response = await fetch(htmlPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const htmlText = await response.text();

            // Parse the fetched HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, "text/html");

            // Extract the main content and modals from the fetched document
            const fetchedMainContent = doc.querySelector(".admin-main");
            const fetchedModals = doc.querySelectorAll(".modal-backdrop");

            if (fetchedMainContent) {
                mainContent.innerHTML = fetchedMainContent.innerHTML;
            } else {
                mainContent.innerHTML = "<p class=\"error\">Conteúdo principal não encontrado no arquivo carregado.</p>";
                console.error(`'.admin-main' not found in ${htmlPath}`);
            }

            if (fetchedModals && fetchedModals.length > 0) {
                fetchedModals.forEach(modal => {
                    // Ensure modal IDs are unique if necessary, though unlikely to clash here
                    modalContainer.appendChild(modal.cloneNode(true));
                });
            } else {
                // No modals found, which might be normal for some pages
                console.log(`No modals found in ${htmlPath}`);
            }

            // Determine the corresponding JS file path
            let scriptName;
            if (pageIdentifier === "dashboard") {
                scriptName = "dashboard.js";
            } else if (pageIdentifier === "payments") {
                 // Assuming payments.html uses payments.js
                 scriptName = "payments.js";
            } else {
                scriptName = `${pageIdentifier}.js`; // Standard convention (products.js, users.js, etc.)
            }
            const scriptPath = `${adminJsBasePath}${scriptName}`;

            // Load and execute the script *after* content is injected
            await loadAndExecuteScript(scriptPath);

            // Re-initialize any common admin functionality if needed (like sidebar toggle)
            // This might be handled by admin.js already, or might need specific re-triggering
            if (typeof initializeAdminSidebar === 'function') {
                 initializeAdminSidebar(); // Assuming admin.js exposes this
            }
             // Initialize modals if a function exists (assuming admin.js or similar handles this)
            if (typeof initializeAdminModals === 'function') {
                initializeAdminModals();
            }


        } catch (error) {
            console.error("Error loading admin page:", error);
            mainContent.innerHTML = `<p class="error">Erro ao carregar a página: ${error.message}. Verifique o caminho: ${htmlPath}</p>`;
        } finally {
            mainContent.classList.remove("loading");
        }
    };

    // --- Event Listeners ---

    // Handle clicks on sidebar navigation links
    sidebarNav.addEventListener("click", (event) => {
        const link = event.target.closest("a[data-target]");
        if (link) {
            event.preventDefault();
            const targetHtml = link.getAttribute("data-target");
            const pageIdentifier = link.closest("li").dataset.page;

            if (window.location.hash !== `#${pageIdentifier}`) {
                 window.location.hash = pageIdentifier;
            } else {
                // If hash is already correct, force reload content
                loadAdminPage(targetHtml, pageIdentifier);
                updateSidebarActiveState(pageIdentifier);
            }
        }
    });

    // Handle hash changes (for back/forward buttons and direct URL access)
    const handleHashChange = () => {
        const hash = window.location.hash.substring(1);
        const pageIdentifier = hash || "dashboard"; // Default to dashboard
        const targetLi = sidebarNav.querySelector(`li[data-page="${pageIdentifier}"]`);

        if (targetLi) {
            const targetLink = targetLi.querySelector("a[data-target]");
            if (targetLink) {
                const targetHtml = targetLink.getAttribute("data-target");
                loadAdminPage(targetHtml, pageIdentifier);
                updateSidebarActiveState(pageIdentifier);
            } else {
                 console.error(`Target link not found for page: ${pageIdentifier}`);
                 mainContent.innerHTML = `<p class="error">Link de navegação não encontrado para ${pageIdentifier}.</p>`;
            }
        } else {
            console.warn(`No sidebar item found for hash: #${hash}. Loading dashboard.`);
            // Fallback to dashboard if hash is invalid
            const dashboardLi = sidebarNav.querySelector('li[data-page="dashboard"]');
            if (dashboardLi) {
                 const dashboardLink = dashboardLi.querySelector('a[data-target]');
                 const dashboardHtml = dashboardLink.getAttribute('data-target');
                 loadAdminPage(dashboardHtml, 'dashboard');
                 updateSidebarActiveState('dashboard');
                 window.location.hash = 'dashboard'; // Correct the hash
            } else {
                mainContent.innerHTML = `<p class="error">Página padrão (Dashboard) não encontrada.</p>`;
            }
        }
    };

    // --- Initial Load ---
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Load initial page based on current hash or default

});

