import { useState } from "react";
import Tile from "../components/Tile";
import { buildDeck, shuffle } from "../deck";

function isJokerFigure(t: any) {
  return t?.isJokerFigure === true;
}

const PBTN={marginTop:13,width:"100%",padding:"10px",
  background:"linear-gradient(135deg,#f4b942,#d4830a)",
  border:"none",borderRadius:7,color:"#1a0800",fontSize:13,fontWeight:700,cursor:"pointer",
  fontFamily:"'Playfair Display',Georgia,serif"};

export default function StarterDrawScreen({ names, onStart }: any) {
  const [draws,setDraws]=useState(null);
  const [winner,setWinner]=useState(null);

  const cardRank=(t)=> isJokerFigure(t) ? 14 : t.num;
  const drawStarter=()=>{
    const deck=shuffle(buildDeck());
    const a=deck.pop();
    const b=deck.pop();
    const ra=cardRank(a), rb=cardRank(b);
    setDraws([a,b]);
    setWinner(ra===rb ? null : (ra>rb ? 0 : 1));
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#150800,#3a1c06,#150800)",fontFamily:"'Playfair Display',Georgia,serif",color:"#f4b942",padding:30}}>
      <div style={{maxWidth:760,width:"100%",textAlign:"center",background:"rgba(255,255,255,.04)",border:"1px solid rgba(244,185,66,.28)",borderRadius:22,padding:34}}>
        <div style={{fontSize:38,fontWeight:900,marginBottom:8}}>¿Quién inicia?</div>
        <div style={{color:"#caa15a",fontSize:15,lineHeight:1.6,marginBottom:26}}>Cada jugador toma una ficha. Empieza quien saque la más alta. Si hay empate, se vuelve a sacar.</div>
        {draws&&(
          <div style={{display:"flex",gap:36,justifyContent:"center",alignItems:"center",flexWrap:"wrap",marginBottom:24}}>
            {[0,1].map(i=>(
              <div key={i} style={{background:"rgba(0,0,0,.28)",border:`2px solid ${winner===i?"#ffe066":"rgba(255,255,255,.12)"}`,borderRadius:16,padding:18,minWidth:160}}>
                <div style={{fontSize:18,fontWeight:800,marginBottom:12,color:winner===i?"#ffe066":"#f4b942"}}>{names[i]}</div>
                <div style={{display:"flex",justifyContent:"center"}}><Tile tile={draws[i]} /></div>
              </div>
            ))}
          </div>
        )}
        {draws&&winner===null&&<div style={{color:"#ffe066",marginBottom:16,fontWeight:800}}>Empate. Saquen otra ficha.</div>}
        {winner!==null&&<div style={{color:"#90ee90",marginBottom:16,fontSize:20,fontWeight:900}}>Inicia {names[winner]}</div>}
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          {(!draws || winner===null) && <button onClick={drawStarter} style={{...PBTN,width:"auto",padding:"12px 24px"}}>{draws?"Sacar de nuevo":"Sacar fichas"}</button>}
          {winner!==null&&<button onClick={()=>onStart(winner)} style={{...PBTN,width:"auto",padding:"12px 24px",background:"linear-gradient(135deg,#90ee90,#4caf50)"}}>Comenzar partida</button>}
        </div>
      </div>
    </div>
  );
}
