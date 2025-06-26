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

  // Return form handling
  const returnForm = document.querySelector(".modern-return-form")

  if (returnForm) {
    returnForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Get form data
      const formData = new FormData(this)
      const data = Object.fromEntries(formData)

      // Simple validation
      if (!data["order-number"] || !data["customer-email"] || !data["return-type"] || !data["return-reason"]) {
        alert("Por favor, preencha todos os campos obrigatórios.")
        return
      }

      // Validate order number format
      const orderNumber = data["order-number"]
      if (!orderNumber.startsWith("#") && !orderNumber.match(/^\d+$/)) {
        alert("Por favor, insira um número de pedido válido (ex: #12345 ou 12345).")
        return
      }

      // Simulate form submission
      const submitBtn = this.querySelector(".btn-submit-return")
      const originalText = submitBtn.querySelector(".btn-text").textContent

      submitBtn.querySelector(".btn-text").textContent = "Processando..."
      submitBtn.disabled = true

      setTimeout(() => {
        alert(
          "Solicitação enviada com sucesso! Entraremos em contato em até 24 horas para dar continuidade ao processo.",
        )
        this.reset()
        submitBtn.querySelector(".btn-text").textContent = originalText
        submitBtn.disabled = false
      }, 2000)
    })
  }

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

  if (primaryBtn) {
    primaryBtn.addEventListener("click", () => {
      // Scroll to form section
      const formSection = document.querySelector(".return-form-section")
      if (formSection) {
        formSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  }

  if (secondaryBtn) {
    secondaryBtn.addEventListener("click", () => {
      // Scroll to FAQ section
      const faqSection = document.querySelector(".faq-section")
      if (faqSection) {
        faqSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  }

  // Form input animations
  const formInputs = document.querySelectorAll(".form-group input, .form-group select, .form-group textarea")

  formInputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("focused")
    })

    input.addEventListener("blur", function () {
      if (!this.value) {
        this.parentElement.classList.remove("focused")
      }
    })
  })

  // Auto-format order number
  const orderNumberInput = document.getElementById("order-number")
  if (orderNumberInput) {
    orderNumberInput.addEventListener("input", (e) => {
      const value = e.target.value.replace(/[^\d]/g, "")
      if (value && !value.startsWith("#")) {
        e.target.value = "#" + value
      }
    })
  }

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

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
