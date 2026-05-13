import KUKY_PHOTO from "../assets/kuky.jpg";

const primaryButtonStyle = {
  width: "100%",
  padding: "14px 18px",
  background: "linear-gradient(135deg,#f4b942,#d4830a)",
  border: "none",
  borderRadius: 10,
  color: "#1a0800",
  fontSize: 18,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Playfair Display',Georgia,serif",
  transition: "all .15s",
};

export default function WelcomeScreen({ onOnline, onPractice }: any) {
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
          maxWidth: 1180,
          display: "grid",
          gridTemplateColumns: "1.1fr .9fr",
          gap: 34,
          alignItems: "center",
        }}
      >
        {/* IZQUIERDA */}
        <div style={{ textAlign: "center", padding: "18px 10px" }}>
          <div
            style={{
              position: "relative",
              width: 250,
              height: 250,
              margin: "0 auto 18px",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg,#f4b942,#8a5208,#ffe066)",
                padding: 7,
                boxShadow: "0 14px 38px rgba(0,0,0,.55)",
              }}
            >
              <img
                src={KUKY_PHOTO}
                alt="Kuky"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                  display: "block",
                  border: "4px solid #2b1204",
                }}
              />
            </div>

            <div
              style={{
                position: "absolute",
                left: 50,
                bottom: -18,
                display: "flex",
                gap: 7,
                transform: "rotate(-4deg)",
              }}
            >
              {["★", "3", "6"].map((v, i) => (
                <div
                  key={i}
                  style={{
                    width: 54,
                    height: 68,
                    borderRadius: 8,
                    background:
                      "linear-gradient(180deg,#fff3c4,#d9a441)",
                    border: "2px solid #7a4a18",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2b1204",
                    fontSize: 28,
                    fontWeight: 900,
                    boxShadow: "0 8px 18px rgba(0,0,0,.45)",
                    transform:
                      i === 0
                        ? "rotate(-7deg)"
                        : i === 2
                        ? "rotate(7deg)"
                        : "rotate(0deg)",
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              fontSize: 68,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1,
              background:
                "linear-gradient(135deg,#ffe066,#f4b942,#b86f0a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 4px 18px rgba(0,0,0,.5)",
            }}
          >
            Kuky-Burako
          </div>

          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              letterSpacing: 2,
              marginTop: 2,
              background:
                "linear-gradient(135deg,#fff2b0,#f4b942,#a96508)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            OnLine
          </div>

          <div
            style={{
              marginTop: 22,
              borderTop: "1px solid rgba(255,224,102,.18)",
              paddingTop: 24,
              maxWidth: 680,
              marginInline: "auto",
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#fff2b0",
              }}
            >
              Bienvenido a Kuky-Burako OnLine
            </div>

            <div
              style={{
                marginTop: 12,
                fontSize: 22,
                lineHeight: 1.45,
                color: "#e3b45c",
              }}
            >
              Un desarrollo de AND para todos los burakeros del
              mundo.
            </div>
          </div>
        </div>

        {/* DERECHA */}
        <div
          style={{
            background: "rgba(20,8,0,.62)",
            border: "1px solid rgba(255,224,102,.18)",
            borderRadius: 28,
            padding: "44px 48px",
            boxShadow: "0 22px 60px rgba(0,0,0,.45)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              margin: "0 auto 18px",
              borderRadius: 12,
              background:
                "linear-gradient(135deg,#ff5ea8,#8b2eff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            🕹️
          </div>

          <h2
            style={{
              textAlign: "center",
              color: "#ffe066",
              fontSize: 28,
              margin: "0 0 14px",
            }}
          >
            ¡Que comience el juego!
          </h2>

          <p
            style={{
              textAlign: "center",
              color: "#d8b27a",
              fontSize: 16,
              lineHeight: 1.55,
              margin: "0 0 26px",
            }}
          >
            Elegí cómo querés jugar Kuky-Burako Online.
          </p>

          <button onClick={onOnline} style={primaryButtonStyle}>
            Jugar online
          </button>

          <div
            style={{
              fontSize: 12,
              color: "#b78b45",
              textAlign: "center",
              marginTop: 7,
              marginBottom: 18,
            }}
          >
            Creá o unite a una sala privada.
          </div>

          <button
            onClick={onPractice}
            style={{
              ...primaryButtonStyle,
              background:
                "linear-gradient(135deg,#6b4a1b,#3a2208)",
              color: "#ffe8a3",
              border: "1px solid rgba(244,185,66,.35)",
            }}
          >
            Modo práctica
          </button>

          <div
            style={{
              fontSize: 12,
              color: "#b78b45",
              textAlign: "center",
              marginTop: 7,
            }}
          >
            Jugá en el mismo dispositivo para aprender y probar
            reglas.
          </div>

          <div
            style={{
              marginTop: 24,
              paddingTop: 18,
              borderTop: "1px solid rgba(255,255,255,.08)",
              fontSize: 12,
              color: "#8a6a38",
              textAlign: "center",
            }}
          >
            Versión beta familiar · En desarrollo
          </div>
        </div>
      </div>
    </div>
  );
}