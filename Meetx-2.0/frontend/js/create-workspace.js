const token = localStorage.getItem("token");

if (!token) {
  alert("Please login first.");
  window.location.href = "login.html";
}

function goToDashboard() {
  window.location.href = "dashboard.html";
}

function createWorkspace() {
  const workspaceName = document.getElementById("newWorkspace").value.trim();
  if (!workspaceName) {
    alert("Please enter a workspace name.");
    return;
  }

  fetch("http://localhost:3000/api/workspaces", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ name: workspaceName })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Workspace created!");
        loadWorkspaces();
        document.getElementById("newWorkspace").value = "";
      } else {
        alert(data.message || "Something went wrong");
      }
    })
    .catch(err => {
      console.error("Error:", err);
      alert("Failed to create workspace.");
    });
}

function loadWorkspaces() {
  fetch("http://localhost:3000/api/workspaces", {
    headers: {
      Authorization: token
    }
  })
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("workspaceList");
      list.innerHTML = "";
      data.workspaces.forEach(w => {
        const li = document.createElement("li");
        li.innerText = w.name;
        list.appendChild(li);
      });
    });
}

// Load workspaces on page load
loadWorkspaces();
