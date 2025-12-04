"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
      {
        path: '/socket.io/',
        transports: ['polling', 'websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        secure: true,
        rejectUnauthorized: false,
        withCredentials: true,
        upgrade: true,
        rememberUpgrade: false,
        forceNew: false,
      }
    );

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
      
      // Auto reconnect nếu server disconnect
      if (reason === "io server disconnect") {
        socketInstance.connect();
      }
    });

    socketInstance.on("connect_error", (error) => {
      console.error("🔴 Connection error:", error.message);
      setIsConnected(false);
      
      // Xử lý Session ID unknown
      if (error.message.includes("Session ID unknown")) {
        console.log("🔄 Session expired, creating new connection...");
        socketInstance.disconnect();
        setTimeout(() => socketInstance.connect(), 1000);
      }
    });

    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 Reconnection attempt:", attemptNumber);
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log("✅ Reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
    });

    socketInstance.on("reconnect_error", (error) => {
      console.error("🔴 Reconnection error:", error.message);
    });

    socketInstance.on("reconnect_failed", () => {
      console.error("🔴 Reconnection failed, creating new connection...");
      socketInstance.disconnect();
      setTimeout(() => socketInstance.connect(), 2000);
    });

    // Reconnect khi tab được focus lại
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !socketInstance.connected) {
        console.log("👁️ Tab visible, reconnecting...");
        socketInstance.connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    setSocket(socketInstance);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      console.log("🧹 Cleaning up socket");
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
