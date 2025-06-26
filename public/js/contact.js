// JavaScript para a página de contato

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

  // Contact form handling
  const contactForm = document.querySelector(".modern-contact-form")

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Get form data
      const formData = new FormData(this)
      const data = Object.fromEntries(formData)

      // Simple validation
      if (!data.name || !data.email || !data.message) {
        alert("Por favor, preencha todos os campos obrigatórios.")
        return
      }

      // Simulate form submission
      const submitBtn = this.querySelector(".btn-submit-form")
      const originalText = submitBtn.querySelector(".btn-text").textContent

      submitBtn.querySelector(".btn-text").textContent = "Enviando..."
      submitBtn.disabled = true

      setTimeout(() => {
        alert("Mensagem enviada com sucesso! Entraremos em contato em breve.")
        this.reset()
        submitBtn.querySelector(".btn-text").textContent = originalText
        submitBtn.disabled = false
      }, 2000)
    })
  }

  // Contact method buttons
  const contactButtons = document.querySelectorAll(".btn-contact-method")

  contactButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const card = this.closest(".contact-method-card")
      const method = card.querySelector("h3").textContent
      const info = card.querySelector(".method-info span").textContent

      switch (method) {
        case "WhatsApp":
          window.open(`https://wa.me/5511999999999?text=Olá! Gostaria de mais informações sobre os produtos.`, "_blank")
          break
        case "Email":
          window.location.href = `mailto:${info}?subject=Contato via Site`
          break
        case "Telefone":
          window.location.href = `tel:${info.replace(/\D/g, "")}`
          break
        case "Localização":
          window.open("https://maps.google.com/?q=Av.+Paulista,+1000+-+São+Paulo,+SP", "_blank")
          break
      }
    })
  })

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
})
