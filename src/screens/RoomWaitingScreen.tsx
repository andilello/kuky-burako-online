import { startOnlineGame } from "../online";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
export default function RoomWaitingScreen({ room, onBack }: any) {
  const [liveRoom, setLiveRoom] = useState(room);
  const players = liveRoom?.state?.players || [];
  useEffect(() => {
    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          console.log("Realtime update:", payload);
          setLiveRoom(payload.new);
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id]);
  
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 30% 15%,#3a1c06,#160700 55%,#050100)",
        color: "#f4b942",
        fontFamily: "'Playfair Display',Georgia,serif",
        padding: 24,
        boxSizing: "border-box"
      }}>
        <div style={{
          width: "100%",
          maxWidth: 720,
          background: "rgba(20,8,0,.68)",
          border: "1px solid rgba(255,224,102,.18)",
          borderRadius: 28,
          padding: "42px 48px",
          boxShadow: "0 22px 60px rgba(0,0,0,.45)",
          textAlign: "center"
        }}>
          <h1 style={{ color: "#ffe066", marginTop: 0 }}>
            Sala creada
          </h1>
  
          <div style={{
            margin: "22px auto",
            padding: "18px",
            borderRadius: 18,
            background: "rgba(0,0,0,.28)",
            border: "1px solid rgba(244,185,66,.25)"
          }}>
            <div style={{ fontSize: 13, color: "#b78b45", marginBottom: 6 }}>
              Código de sala
            </div>
  
            <div style={{
              fontSize: 42,
              fontWeight: 900,
              letterSpacing: 6,
              color: "#ffe066"
            }}>
              {liveRoom?.code}
            </div>
          </div>
  
          <div style={{
            marginTop: 26,
            textAlign: "left",
            background: "rgba(0,0,0,.22)",
            borderRadius: 16,
            padding: 18
          }}>
            <div style={{ color: "#ffe066", fontWeight: 800, marginBottom: 12 }}>
              Jugadores
            </div>
  
            {players.map((p: any, index: number) => (
              <div key={p.id || index} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,.08)"
              }}>
                <span>{p.name}</span>
                <span style={{ color: "#b78b45" }}>
                  {p.role === "host" ? "Creador" : "Invitado"}
                </span>
              </div>
            ))}
  
            {players.length < 2 && (
              <div style={{
                marginTop: 18,
                color: "#d8b27a",
                fontStyle: "italic",
                textAlign: "center"
              }}>
                Esperando rival…
              </div>
            )}
            {players.length === 2 && (
  <button
  onClick={async () => {
    await startOnlineGame(room.code);
  }}
    style={startButtonStyle}
  >
    Comenzar partida
  </button>
)}
          </div>
  
          <button onClick={onBack} style={backButtonStyle}>
            Volver
          </button>
        </div>
      </div>
    );
  }
  
  const backButtonStyle = {
    width: "100%",
    marginTop: 24,
    padding: "14px 18px",
    background: "transparent",
    color: "#b78b45",
    border: "1px solid rgba(244,185,66,.2)",
    borderRadius: 10,
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Playfair Display',Georgia,serif",
  };
  const startButtonStyle = {
    width: "100%",
    marginTop: 24,
    padding: "14px 18px",
    background: "linear-gradient(135deg,#f4b942,#d4830a)",
    color: "#1a0800",
    border: "none",
    borderRadius: 10,
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Playfair Display',Georgia,serif",
  };