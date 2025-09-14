// Disable the back button (top left arrow) on the dashboard page
history.pushState(null, null, location.href);
window.onpopstate = function () {
  history.go(1); // This will prevent navigating backward
};

// Fetch dashboard data (user info, active meetings, recent chats) from backend
fetch('http://localhost:5500/api/dashboard', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}` // Pass JWT token
  }
})
  .then(response => response.json())
  .then(data => {
    // Update the UI with user info
    document.getElementById("userName").textContent = data.user.name; 
    document.getElementById("userEmail").textContent = data.user.email;

    // Display active meetings
    const activeMeetingsList = document.getElementById("activeMeetingsList");
    activeMeetingsList.innerHTML = ''; // Clear any existing list items
    data.activeMeetings.forEach(meeting => {
      const li = document.createElement("li");
      li.textContent = `${meeting.name} (ID: ${meeting.id})`;
      activeMeetingsList.appendChild(li);
    });

    // Display recent chats
    const recentChatsList = document.getElementById("recentChatsList");
    recentChatsList.innerHTML = ''; // Clear any existing list items
    data.recentChats.forEach(chat => {
      const li = document.createElement("li");
      li.textContent = chat.message;
      recentChatsList.appendChild(li);
    });
  })
  .catch(error => console.log('Error fetching dashboard data:', error));

// Logout function
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token"); // Remove JWT token
  window.location.href = "login.html"; // Redirect to login page
});

// Handle create meeting button
document.getElementById("createMeetingBtn").addEventListener("click", () => {
  window.location.href = "meeting.html"; // Redirect to meeting creation page
});

// Handle join meeting button
document.getElementById("joinMeetingBtn").addEventListener("click", () => {
  const meetingId = document.getElementById("meetingIdInput").value;
  if (meetingId) {
    window.location.href = `meeting.html?id=${meetingId}`; // Redirect to meeting page with ID
  } else {
    alert("Please enter a valid Meeting ID");
  }
});
