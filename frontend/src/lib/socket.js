import { io } from "socket.io-client";

const BACKEND = import.meta.env.VITE_API_URL ?? "";

let socket = null;

/**
 * Returns a singleton Socket.io client, authenticated with the user's JWT.
 * Call connect(token) once after the user logs in.
 */
export function connectSocket(token) {
  if (socket?.connected) return socket;

  // Extract user ID from JWT token
  let userId = null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    userId = payload.sub;
  } catch (err) {
    console.error('[socket] Failed to parse token:', err);
  }

  socket = io(BACKEND, {
    auth: { token, userId },
    transports: ["websocket"],
    autoConnect: true,
  });

  socket.on("connect", () => console.log("[socket] connected:", socket.id));
  socket.on("connect_error", (err) => console.error("[socket] error:", err.message));
  socket.on("disconnect", (reason) => console.log("[socket] disconnected:", reason));

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
