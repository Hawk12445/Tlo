// ==== Select DOM elements safely ====
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".send-btn");

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.querySelector('.theme-toggle');

const typingText = document.getElementById('typing-text');
const aboutBtn = document.querySelector(".about-btn");
const chatbotPopup = document.querySelector(".chatbot-popup");

// ==== API config ====
const API_KEY = ""; // Replace with your API key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// ==== Chat history ====
let chatHistory = [
  { role: "model", parts: [{ text: "Hi! How can I assist you today?" }] }
];

// ==== Helpers ====
// Create chat message element
function createChatLi(message, className) {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", className);
  chatLi.innerHTML = `<span class="chatbot-text">${message}</span>`;
  return chatLi;
}

// Handle sending messages
async function handleOutgoingMessage(e) {
  e.preventDefault();
  if (!chatInput) return;

  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  if (chatbox) {
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatInput.value = "";
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  // Thinking message
  const thinkingLi = createChatLi("Thinking...", "incoming");
  if (chatbox) {
    chatbox.appendChild(thinkingLi);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "API request failed");

    const botMessage = data.candidates[0].content.parts[0].text;
    chatHistory.push({ role: "model", parts: [{ text: botMessage }] });

    thinkingLi.querySelector(".chatbot-text").textContent = botMessage;
  } catch (error) {
    thinkingLi.querySelector(".chatbot-text").textContent = `Error: ${error.message}`;
    thinkingLi.style.background = "#ffcccc"; // light red for error
  }

  if (chatbox) chatbox.scrollTop = chatbox.scrollHeight;
}

// ==== Event listeners ====

if (sendChatBtn && chatInput && chatbox) {
  sendChatBtn.addEventListener("click", handleOutgoingMessage);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 600) {
      handleOutgoingMessage(e);
    }
  });
}

if (chatbotToggler) {
  chatbotToggler.addEventListener("click", () => {
    document.body.classList.toggle("show-chatbot");
  });
}

if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    document.body.classList.remove("show-chatbot");
  });
}

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active'));
  });
}

if (navLinks.length && hamburger && navMenu) {
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// Active link highlight function
function setActiveLink() {
  if (!navLinks.length) return;

  const sections = document.querySelectorAll('section[id]');
  const scrollPosition = window.scrollY + 100;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        link.setAttribute('aria-current', 'false');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    }
  });
}

if (navLinks.length) {
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetSection = document.querySelector(href);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    const icon = themeToggle.querySelector('.icon');
    if (icon) icon.textContent = newTheme === 'dark' ? '' : '';
    localStorage.setItem('theme', newTheme);
  });
}

// Load saved theme, typing effect, and set active link on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Load theme
  if (themeToggle) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = themeToggle.querySelector('.icon');
    if (icon) icon.textContent = savedTheme === 'dark' ? '' : '';
  }

  setActiveLink();

  // Typing effect
  if (typingText) {
    let index = 0;
    const textToType = "Your Personal AI Chat Bot";

    function type() {
      const beforeHighlight = "Your ";
      const highlight = "Personal AI";
      const afterHighlight = " Chat Bot";

      if (index <= beforeHighlight.length) {
        typingText.innerHTML = textToType.substring(0, index);
      } else if (index <= beforeHighlight.length + highlight.length) {
        const typedHighlight = highlight.substring(0, index - beforeHighlight.length);
        typingText.innerHTML = beforeHighlight + '<span class="highlight">' + typedHighlight + '</span>';
      } else if (index <= textToType.length) {
        const typedAfter = afterHighlight.substring(0, index - beforeHighlight.length - highlight.length);
        typingText.innerHTML = beforeHighlight + '<span class="highlight">' + highlight + '</span>' + typedAfter;
      }

      if (index < textToType.length) {
        index++;
        setTimeout(type, 150);
      }
    }

    type();
  }
});

window.addEventListener('scroll', setActiveLink);

if (aboutBtn && chatbotPopup) {
  aboutBtn.addEventListener("click", () => {
    chatbotPopup.classList.toggle("show-about");
  });
}