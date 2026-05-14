import { useState } from "react";

const INP = {
  width: "100%",
  padding: "9px 13px",
  boxSizing: "border-box" as const,
  background: "rgba(0,0,0,.35)",
  border: "1px solid rgba(244,185,66,.3)",
  borderRadius: 7,
  color: "#fff",
  fontSize: 13,
  fontFamily: "Georgia,serif",
  outline: "none",
};

const PBTN = {
  marginTop: 13,
  width: "100%",
  padding: "10px",
  background: "linear-gradient(135deg,#f4b942,#d4830a)",
  border: "none",
  borderRadius: 7,
  color: "#1a0800",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Playfair Display',Georgia,serif",
};

const BACKBTN = {
  ...PBTN,
  marginTop: 28,
  maxWidth: 300,
  background: "transparent",
  color: "#b78b45",
  border: "1px solid rgba(244,185,66,.25)",
};

export default function LoginScreen({ onStart, onBack }: any) {
  const [names, setNames] = useState(["", ""]);
  const [err, setErr] = useState("");

  const startPractice = () => {
    const p1 = names[0].trim();
    const p2 = names[1].trim();

    if (!p1 || !p2) {
      setErr("Completá el nombre de ambos jugadores.");
      return;
    }

    if (p1.toLowerCase() === p2.toLowerCase()) {
      setErr("Los jugadores deben tener nombres distintos.");
      return;
    }

    setErr("");
    onStart([p1, p2]);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg,#150800,#3a1c06,#150800)",
        fontFamily: "'Playfair Display',Georgia,serif",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div
          style={{
            fontSize: 76,
            fontWeight: 900,
            letterSpacing: -3,
            background:
              "linear-gradient(135deg,#f4b942,#e8902a,#ffe066,#c97a10)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1,
          }}
        >
          Kuky-Burako
        </div>
        <div
          style={{
            color: "#7a4a18",
            letterSpacing: 8,
            fontSize: 12,
            marginTop: 4,
          }}
        >
          MODO PRÁCTICA
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(244,185,66,.22)",
              borderRadius: 16,
              padding: "30px 34px",
              minWidth: 250,
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: 22,
                color: "#f4b942",
                fontSize: 17,
                fontWeight: 700,
              }}
            >
              Jugador {i + 1}
            </div>

            <input
              placeholder={`Nombre del jugador ${i + 1}`}
              value={names[i]}
              onChange={(e) =>
                setNames((prev) => {
                  const next = [...prev];
                  next[i] = e.target.value;
                  return next;
                })
              }
              onKeyDown={(e) => e.key === "Enter" && startPractice()}
              style={INP}
            />
          </div>
        ))}
      </div>

      {err && (
        <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 18 }}>
          {err}
        </div>
      )}

      <button onClick={startPractice} style={{ ...PBTN, maxWidth: 420 }}>
        Comenzar práctica
      </button>

      <button onClick={onBack} style={BACKBTN}>
        Volver
      </button>

      
    </div>
  );
}