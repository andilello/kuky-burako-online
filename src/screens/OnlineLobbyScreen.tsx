import { useState } from "react";

export default function OnlineLobbyScreen({
  onCreateRoom,
  onJoinRoom,
  onBack,
}: any) {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 30% 15%,#3a1c06,#160700 55%,#050100)",
        color: "#f4b942",
        fontFamily: "'Playfair Display',Georgia,serif",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          background: "rgba(20,8,0,.68)",
          border: "1px solid rgba(255,224,102,.18)",
          borderRadius: 28,
          padding: "42px 48px",
          boxShadow: "0 22px 60px rgba(0,0,0,.45)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#ffe066",
            marginTop: 0,
          }}
        >
          Jugar online
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#d8b27a",
            fontSize: 16,
          }}
        >
          Creá una sala privada o ingresá con un código.
        </p>

        <input
          placeholder="Tu nombre"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={() => onCreateRoom(playerName)}
          style={buttonStyle}
        >
          Crear sala
        </button>

        <div
          style={{
            margin: "28px 0",
            borderTop: "1px solid rgba(255,255,255,.1)",
          }}
        />

        <input
          placeholder="Código de sala"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          style={inputStyle}
        />

        <button
          onClick={() => onJoinRoom(roomCode, playerName)}
          style={secondaryButtonStyle}
        >
          Unirme a una sala
        </button>

        <button onClick={onBack} style={backButtonStyle}>
          Volver
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginTop: 20,
  borderRadius: 10,
  border: "1px solid rgba(255,224,102,.18)",
  background: "rgba(0,0,0,.25)",
  color: "#ffe8a3",
  fontSize: 16,
  boxSizing: "border-box" as const,
};

const buttonStyle = {
  width: "100%",
  marginTop: 20,
  padding: "14px 18px",
  background: "linear-gradient(135deg,#f4b942,#d4830a)",
  border: "none",
  borderRadius: 10,
  color: "#1a0800",
  fontSize: 18,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Playfair Display',Georgia,serif",
};

const secondaryButtonStyle = {
  ...buttonStyle,
  background: "linear-gradient(135deg,#6b4a1b,#3a2208)",
  color: "#ffe8a3",
  border: "1px solid rgba(244,185,66,.35)",
};

const backButtonStyle = {
  ...buttonStyle,
  background: "transparent",
  color: "#b78b45",
  border: "1px solid rgba(244,185,66,.2)",
};