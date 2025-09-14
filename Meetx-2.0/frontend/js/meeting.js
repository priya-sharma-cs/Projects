const videoGrid = document.getElementById('video-grid');
const muteButton = document.getElementById('muteButton');
const videoButton = document.getElementById('videoButton');
const shareScreenButton = document.getElementById('shareScreen');
const leaveButton = document.getElementById('leaveButton');
const chatToggle = document.getElementById('chatToggle');
const chatPanel = document.getElementById('chat-panel');
const sendButton = document.getElementById('sendButton');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chat-messages');

// Initialize Socket.IO
const socket = io.connect("http://localhost:3000"); // Make sure to replace with your server URL

let localStream;
let isAudioMuted = false;
let isVideoMuted = false;
let peerConnections = {}; // Store peer connections for multiple users
let roomId = localStorage.getItem('roomId') || ''; // Retrieve roomId from localStorage (from dashboard)

// If no roomId is found, prompt user to enter one
if (!roomId) {
  roomId = prompt('Enter the Meeting ID:');
  localStorage.setItem('roomId', roomId); // Store roomId for future use
}

const meetingId = roomId; // Use the roomId to join or create the meeting

// Get user media
async function initVideo() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    addVideoStream(localStream);
    socket.emit('join_room', meetingId); // Join the room using the meetingId
  } catch (error) {
    console.error('Error accessing media devices.', error);
  }
}

// Add video stream to grid
function addVideoStream(stream, userId) {
  const video = document.createElement('video');
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.appendChild(video);
  peerConnections[userId] = stream;
}

// Mute/unmute audio
muteButton.addEventListener('click', () => {
  if (!localStream) return;
  isAudioMuted = !isAudioMuted;
  localStream.getAudioTracks()[0].enabled = !isAudioMuted;
  muteButton.textContent = isAudioMuted ? '🎤 Unmute' : '🎤 Mute';
});

// Start/stop video
videoButton.addEventListener('click', () => {
  if (!localStream) return;
  isVideoMuted = !isVideoMuted;
  localStream.getVideoTracks()[0].enabled = !isVideoMuted;
  videoButton.textContent = isVideoMuted ? '🎥 Start Video' : '🎥 Stop Video';
});

// Screen sharing
shareScreenButton.addEventListener('click', async () => {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    addVideoStream(screenStream);
  } catch (error) {
    console.error('Error sharing screen:', error);
  }
});

// Leave meeting
leaveButton.addEventListener('click', () => {
  localStorage.removeItem('roomId'); // Clear the stored roomId
  window.location.href = '/frontend/pages/dashboard.html'; // Change according to your routes
});

// Toggle chat panel
chatToggle.addEventListener('click', () => {
  chatPanel.style.display = chatPanel.style.display === 'flex' ? 'none' : 'flex';
});

// Send chat message
sendButton.addEventListener('click', () => {
  const message = chatInput.value.trim();
  if (message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `You: ${message}`;
    messageElement.style.marginBottom = '10px';
    chatMessages.appendChild(messageElement);
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});

// Initialize video when page loads
initVideo();

// Socket.IO events

// Handle new user joining the room
socket.on('user_joined', (userId) => {
  console.log(`${userId} joined the room`);
  createPeerConnection(userId);
});

// Handle incoming video stream
socket.on('user_stream', (userId, stream) => {
  console.log(`Received stream from ${userId}`);
  addVideoStream(stream, userId);
});

// Handle user disconnecting
socket.on('user_left', (userId) => {
  console.log(`${userId} left the room`);
  removeVideoStream(userId);
});

// Create peer connection and send stream to other users
function createPeerConnection(userId) {
  const peerConnection = new RTCPeerConnection();
  peerConnections[userId] = peerConnection;

  // Add local stream to peer connection
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  // Create an offer to send to the new user
  peerConnection.createOffer().then(offer => {
    return peerConnection.setLocalDescription(offer);
  }).then(() => {
    socket.emit('offer', userId, peerConnection.localDescription);
  });

  // Handle incoming ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice_candidate', userId, event.candidate);
    }
  };

  // Handle remote stream (video)
  peerConnection.ontrack = (event) => {
    addVideoStream(event.streams[0], userId);
  };
}

// Handle incoming offer from other users
socket.on('offer', (userId, offer) => {
  const peerConnection = new RTCPeerConnection();
  peerConnections[userId] = peerConnection;

  peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  peerConnection.createAnswer().then(answer => {
    return peerConnection.setLocalDescription(answer);
  }).then(() => {
    socket.emit('answer', userId, peerConnection.localDescription);
  });

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice_candidate', userId, event.candidate);
    }
  };

  peerConnection.ontrack = (event) => {
    addVideoStream(event.streams[0], userId);
  };

  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
});

// Handle incoming answer from other users
socket.on('answer', (userId, answer) => {
  const peerConnection = peerConnections[userId];
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

// Handle incoming ICE candidates
socket.on('ice_candidate', (userId, candidate) => {
  const peerConnection = peerConnections[userId];
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});
