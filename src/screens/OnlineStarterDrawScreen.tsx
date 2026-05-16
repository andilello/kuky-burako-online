export default function OnlineStarterDrawScreen({ room }: any) {
    const starterDraw = room?.state?.starterDraw;
  
    const players = room?.state?.players || [];
  
    const tile0 = starterDraw?.tiles?.[0];
    const tile1 = starterDraw?.tiles?.[1];
  
    const starterIndex = starterDraw?.starterIndex ?? 0;
  
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
            maxWidth: 900,
            background: "rgba(20,8,0,.68)",
            border: "1px solid rgba(255,224,102,.18)",
            borderRadius: 28,
            padding: "42px 48px",
            boxShadow: "0 22px 60px rgba(0,0,0,.45)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              color: "#ffe066",
              marginTop: 0,
              marginBottom: 12,
            }}
          >
            Sorteo inicial
          </h1>
  
          <div
            style={{
              color: "#d8b27a",
              marginBottom: 36,
              fontSize: 16,
            }}
          >
            Se sortea quién comenzará la partida.
          </div>
  
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 40,
              flexWrap: "wrap",
            }}
          >
            <PlayerDrawCard
              player={players[0]}
              tile={tile0}
              winner={starterIndex === 0}
            />
  
            <PlayerDrawCard
              player={players[1]}
              tile={tile1}
              winner={starterIndex === 1}
            />
          </div>
  
          <div
            style={{
              marginTop: 36,
              fontSize: 22,
              color: "#ffe066",
              fontWeight: 700,
            }}
          >
            {players[starterIndex]?.name} comienza la partida
          </div>
        </div>
      </div>
    );
  }
  
  function PlayerDrawCard({ player, tile, winner }: any) {
    return (
      <div
        style={{
          minWidth: 220,
          padding: 24,
          borderRadius: 18,
          background: winner
            ? "rgba(244,185,66,.15)"
            : "rgba(255,255,255,.04)",
          border: winner
            ? "2px solid #f4b942"
            : "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div
          style={{
            fontSize: 18,
            marginBottom: 18,
            color: "#ffe066",
          }}
        >
          {player?.name}
        </div>
  
        <div
          style={{
            width: 90,
            height: 120,
            margin: "0 auto",
            borderRadius: 12,
            background: "#fff3c4",
            color: "#2b1204",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 42,
            fontWeight: 900,
            boxShadow: "0 8px 20px rgba(0,0,0,.35)",
          }}
        >
          {tile?.n}
        </div>
  
        {winner && (
          <div
            style={{
              marginTop: 18,
              color: "#ffe066",
              fontWeight: 700,
            }}
          >
            Comienza
          </div>
        )}
      </div>
    );
  }