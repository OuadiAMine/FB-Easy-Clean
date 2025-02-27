// Toggle dark/light mode functionality
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;
const sunIcon = document.getElementById("sunIcon");
const moonIcon = document.getElementById("moonIcon");

// Load saved theme or use system preference
let savedTheme = localStorage.getItem('theme');
if (!savedTheme) {
  savedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
body.setAttribute('data-theme', savedTheme);
updateIcons(savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateIcons(newTheme);
});

function updateIcons(theme) {
  if (theme === 'dark') {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  } else {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  }
}

// Action button listeners for deletion
document.getElementById("deletePhotos").addEventListener("click", () => {
  updateCurrentTask("Deleting Photos...");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "delete_photos" }, (response) => {
      console.log("Response:", response);
    });
  });
});

document.getElementById("deletePosts").addEventListener("click", () => {
  updateCurrentTask("Deleting Posts...");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "delete_posts" }, (response) => {
      console.log("Response:", response);
    });
  });
});

// Listen for progress messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "progress") {
    updateCurrentTask(message.message);
    appendLog(message.message);
  }
});

function updateCurrentTask(text) {
  const currentTaskSpan = document.getElementById("currentTask").querySelector("span");
  if (currentTaskSpan) {
    currentTaskSpan.textContent = text;
  }
}

function appendLog(text) {
  const logContainer = document.getElementById("logContainer");
  const logEntry = document.createElement("div");
  logEntry.className = "log-entry";
  logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;
}
