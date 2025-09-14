const socket = io("http://localhost:3000");

const messageInput = document.getElementById("messageInput");
const messagesContainer = document.getElementById("messages");
const toggleBtn = document.getElementById("toggleMode");
const body = document.body;

// Toggle light/dark mode
toggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
  toggleBtn.innerText = body.classList.contains("dark-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// Send message function
function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  // Send to server
  socket.emit("send_message", { message });

  // Add to your own chat UI
  const msgDiv = document.createElement("div");
  msgDiv.textContent = "You: " + message;
  msgDiv.classList.add("message", "sent");
  messagesContainer.appendChild(msgDiv);

  // Clear input + scroll
  messageInput.value = "";
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Receive message from others
socket.on("receive_message", (data) => {
  const msgDiv = document.createElement("div");
  msgDiv.textContent = "Stranger: " + data.message;
  msgDiv.classList.add("message", "received");
  messagesContainer.appendChild(msgDiv);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Enter key to send
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});
