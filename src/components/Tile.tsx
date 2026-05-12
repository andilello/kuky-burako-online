const CS: Record<string, { bg: string; brd: string; txt: string }> = {
  red: { bg: "#b03030", brd: "#6b1a1a", txt: "#fff" },
  blue: { bg: "#1e5f8e", brd: "#0d3354", txt: "#fff" },
  black: { bg: "#202020", brd: "#000", txt: "#eee" },
  yellow: { bg: "#c49a0a", brd: "#7a5f00", txt: "#1a1a1a" },
  joker: { bg: "#5b2d8e", brd: "#3a1a5c", txt: "#fff" },
};

function isJokerFigure(tile: any) {
  return tile?.isJokerFigure === true;
}

function isTwoTile(tile: any) {
  return !isJokerFigure(tile) && tile?.num === 2;
}

export default function Tile({
  tile,
  selected,
  onClick,
  small,
  dim,
  replaceAs,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: any) {
  const c = CS[tile.color] || CS.joker;
  const w = small ? 33 : 46;
  const h = small ? 41 : 56;

  return (
    <div
      onClick={onClick}
      style={{
        width: w,
        height: h,
        background: c.bg,
        border: `2px solid ${selected ? "#ffe066" : c.brd}`,
        borderRadius: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: draggable ? "grab" : onClick ? "pointer" : "default",
        boxShadow: selected
          ? "0 0 0 3px #ffe066,0 6px 16px rgba(0,0,0,.6)"
          : "0 2px 6px rgba(0,0,0,.5)",
        transform: selected ? "translateY(-9px) scale(1.09)" : "none",
        transition: "all .13s ease",
        userSelect: "none",
        flexShrink: 0,
        opacity: dim ? 0.38 : 1,
      }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <span
        style={{
          color: c.txt,
          fontFamily: "'Playfair Display',Georgia,serif",
          fontWeight: 900,
          fontSize: small ? 14 : 19,
          lineHeight: 1,
        }}
      >
        {isJokerFigure(tile) ? "★" : tile.num}
      </span>

      {replaceAs ? (
        <span
          style={{
            fontSize: small ? 7 : 8,
            color: c.txt,
            opacity: 0.85,
            marginTop: 1,
          }}
        >
          ={replaceAs}
        </span>
      ) : (
        isTwoTile(tile) && (
          <span style={{ fontSize: 7, color: c.txt, opacity: 0.65, marginTop: 1 }}>
            ★
          </span>
        )
      )}
    </div>
  );
}
