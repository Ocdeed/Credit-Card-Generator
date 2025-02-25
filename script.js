const cardTypes = {
  visa: {
    prefix: "4",
    length: 16,
  },
  mastercard: {
    prefix: ["51", "52", "53", "54", "55"],
    length: 16,
  },
  amex: {
    prefix: ["34", "37"],
    length: 15,
  },
};

class CreditCardGenerator {
  static generateNumber(type) {
    const cardType = cardTypes[type];
    const prefix = Array.isArray(cardType.prefix)
      ? cardType.prefix[Math.floor(Math.random() * cardType.prefix.length)]
      : cardType.prefix;

    let number = prefix;
    while (number.length < cardType.length - 1) {
      number += Math.floor(Math.random() * 10);
    }

    const checkDigit = this.calculateLuhnCheckDigit(number);
    return number + checkDigit;
  }

  static calculateLuhnCheckDigit(partialNumber) {
    let sum = 0;
    let isEven = false;

    for (let i = partialNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(partialNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return ((Math.floor(sum / 10) + 1) * 10 - sum) % 10;
  }

  static formatNumber(number, type) {
    if (type === "amex") {
      return number.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3");
    }
    return number.replace(/(\d{4})/g, "$1 ").trim();
  }

  static generateExpiryDate() {
    const today = new Date();
    const month = Math.floor(Math.random() * 12) + 1;
    const year = today.getFullYear() + Math.floor(Math.random() * 5) + 1;
    return {
      month: month.toString().padStart(2, "0"),
      year: year.toString().slice(-2),
    };
  }

  static generateCVV(type) {
    const length = type === "amex" ? 4 : 3;
    return Array(length)
      .fill(0)
      .map(() => Math.floor(Math.random() * 10))
      .join("");
  }
}

class UI {
  static init() {
    this.bindEvents();
    this.initTheme();
    this.initQuantityControls();
    this.initDownloadButton();
    this.initFooter();

    // Initialize info toggle state
    document
      .getElementById("infoToggle")
      .setAttribute("aria-expanded", "false");
  }

  static bindEvents() {
    document
      .getElementById("generate")
      .addEventListener("click", () => this.generateCards());
    document
      .getElementById("themeToggle")
      .addEventListener("click", () => this.toggleTheme());
    document
      .getElementById("infoToggle")
      .addEventListener("click", () => this.toggleInfo());
  }

  static generateCards() {
    const type = document.getElementById("cardType").value;
    const quantity = parseInt(document.getElementById("quantity").value);
    const formatted = document.getElementById("formatted").checked;
    const container = document.getElementById("cards");

    container.innerHTML = "";

    for (let i = 0; i < quantity; i++) {
      const number = CreditCardGenerator.generateNumber(type);
      const card = this.createCardElement(
        formatted ? CreditCardGenerator.formatNumber(number, type) : number,
        type
      );
      container.appendChild(card);
    }
  }

  static createCardElement(number, type) {
    const expiry = CreditCardGenerator.generateExpiryDate();
    const cvv = CreditCardGenerator.generateCVV(type);
    const card = document.createElement("div");
    card.className = "card";

    const cardTypeIcon =
      type.toLowerCase() === "amex"
        ? "cc-amex"
        : type.toLowerCase() === "mastercard"
        ? "cc-mastercard"
        : "cc-visa";

    card.innerHTML = `
            <div class="card-content">
                <div class="card-chip-wrapper">
                    <div class="card-chip">
                        <i class="fas fa-microchip"></i>
                    </div>
                    <div class="card-brand">
                        <i class="fab fa-${cardTypeIcon}"></i>
                    </div>
                </div>
                <div class="card-number">${number}</div>
                <div class="card-details">
                    <div class="card-expiry">
                        <div class="detail-label">
                            <i class="far fa-calendar-alt"></i>
                            Expires
                        </div>
                        <div class="detail-value">${expiry.month}/${expiry.year}</div>
                    </div>
                    <div class="card-cvv">
                        <div class="detail-label">
                            <i class="fas fa-lock"></i>
                            CVV
                        </div>
                        <div class="detail-value">${cvv}</div>
                    </div>
                </div>
                <div class="card-footer">
                    <span class="validation-badge">
                        <i class="fas fa-check-circle"></i>
                        Valid
                    </span>
                    <button class="copy-btn" aria-label="Copy card details">
                        <i class="fas fa-copy"></i>
                        Copy
                    </button>
                </div>
            </div>
        `;

    card.querySelector(".copy-btn").addEventListener("click", () => {
      const cardData = {
        number: number.replace(/\s/g, ""),
        expiry: `${expiry.month}/${expiry.year}`,
        cvv: cvv,
      };
      navigator.clipboard.writeText(
        `Card: ${cardData.number}\nExpiry: ${cardData.expiry}\nCVV: ${cardData.cvv}`
      );
      this.showCopyFeedback(card);
    });

    return card;
  }

  static showCopyFeedback(card) {
    const feedback = document.createElement("div");
    feedback.className = "copy-feedback";
    feedback.textContent = "Copied!";
    card.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
  }

  static toggleTheme() {
    document.body.classList.toggle("light-theme");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("light-theme") ? "light" : "dark"
    );
  }

  static initTheme() {
    if (localStorage.getItem("theme") === "light") {
      document.body.classList.add("light-theme");
    }
  }

  static toggleInfo() {
    const toggle = document.getElementById("infoToggle");
    const content = document.getElementById("infoContent");
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";

    toggle.setAttribute("aria-expanded", !isExpanded);
    content.classList.toggle("hidden");

    if (!isExpanded) {
      content.style.animation = "slideDown 0.3s ease forwards";
    } else {
      content.style.animation = "slideUp 0.3s ease forwards";
    }
  }

  static initQuantityControls() {
    const quantityInput = document.getElementById("quantity");
    document.querySelector(".minus").addEventListener("click", () => {
      if (quantityInput.value > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
      }
    });
    document.querySelector(".plus").addEventListener("click", () => {
      if (quantityInput.value < 10) {
        quantityInput.value = parseInt(quantityInput.value) + 1;
      }
    });
  }

  static initDownloadButton() {
    document.getElementById("downloadAll").addEventListener("click", () => {
      const cards = document.querySelectorAll(".card-number");
      if (cards.length === 0) return;

      const content = Array.from(cards)
        .map((card) => card.textContent.trim())
        .join("\n");

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "generated-cards.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  static initFooter() {
    document.getElementById("currentYear").textContent =
      new Date().getFullYear();
  }
}

document.addEventListener("DOMContentLoaded", () => UI.init());

// Add new animations to the existing ones
document.documentElement.style.setProperty("--slide-timing", "0.3s");

const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  `
    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`,
  styleSheet.cssRules.length
);

styleSheet.insertRule(
  `
    @keyframes slideUp {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
`,
  styleSheet.cssRules.length
);
