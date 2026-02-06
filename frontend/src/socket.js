import io from "socket.io-client";

const socket = io("http://localhost:5000");

// Get token from localStorage
const token = localStorage.getItem("token");

if (token) {
  socket.emit("join", { token });
}

export default socket;
