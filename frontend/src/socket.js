import io from "socket.io-client";

const API_URL = process.env.VUE_APP_API_URL || window.location.origin;
const socket = io(API_URL);

// Get token from localStorage
const token = localStorage.getItem("token");

if (token) {
  socket.emit("join", { token });
}

export default socket;
