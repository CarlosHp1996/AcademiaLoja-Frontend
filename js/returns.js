// JavaScript para a página de trocas e devoluções

document.addEventListener("DOMContentLoaded", () => {
  // FAQ Accordion functionality
  const faqItems = document.querySelectorAll(".faq-item")

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question")

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active")

      // Close all FAQ items
      faqItems.forEach((faqItem) => {
        faqItem.classList.remove("active")
      })

      // Open clicked item if it wasn't active
      if (!isActive) {
        item.classList.add("active")
      }
    })
  })

  // CTA buttons functionality
  const whatsappBtn = document.querySelector(".btn-whatsapp")
  const emailBtn = document.querySelector(".btn-email")
  const phoneBtn = document.querySelector(".btn-phone")

  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", () => {
      window.open("https://wa.me/5511999999999?text=Olá! Preciso de ajuda com uma troca ou devolução.", "_blank")
    })
  }

  if (emailBtn) {
    emailBtn.addEventListener("click", () => {
      window.location.href = "mailto:contato@powerrocksupplements.com.br?subject=Solicitação de Troca/Devolução"
    })
  }

  if (phoneBtn) {
    phoneBtn.addEventListener("click", () => {
      window.location.href = "tel:+5511999999999"
    })
  }

  // Primary action buttons
  const primaryBtn = document.querySelector(".btn-primary-returns")
  const secondaryBtn = document.querySelector(".btn-secondary-returns")

  // Função auxiliar para rolagem suave com deslocamento para cabeçalhos fixos
  const smoothScrollTo = (element) => {
    if (!element) return;

    const header = document.querySelector('.header');
    const subheader = document.querySelector('.subheader');
    const headerHeight = header ? header.offsetHeight : 0;
    const subheaderHeight = subheader ? subheader.offsetHeight : 0;
    const totalHeaderHeight = headerHeight + subheaderHeight;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - totalHeaderHeight - 20; // 20px de espaço extra

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  };

  if (secondaryBtn) {
    secondaryBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const faqSection = document.querySelector(".faq-section");
      smoothScrollTo(faqSection);
    });
  }

  // Step items hover effect
  const stepItems = document.querySelectorAll(".step-item")
  stepItems.forEach((item, index) => {
    item.addEventListener("mouseenter", () => {
      stepItems.forEach((step, i) => {
        if (i <= index) {
          step.style.transform = "translateY(-8px)"
          step.style.borderColor = "#f97316"
        }
      })
    })

    item.addEventListener("mouseleave", () => {
      stepItems.forEach((step) => {
        step.style.transform = ""
        step.style.borderColor = ""
      })
    })
  })
})
