import { useState } from "react";

const PBTN={marginTop:13,width:"100%",padding:"10px",
  background:"linear-gradient(135deg,#f4b942,#d4830a)",
  border:"none",borderRadius:7,color:"#1a0800",fontSize:13,fontWeight:700,cursor:"pointer",
  fontFamily:"'Playfair Display',Georgia,serif"};
const HBTN={padding:"4px 8px",background:"rgba(244,185,66,.08)",
  border:"1px solid rgba(244,185,66,.24)",borderRadius:6,color:"#caa15a",
  fontSize:10,cursor:"pointer",fontFamily:"'Playfair Display',Georgia,serif"};

export default function ModeSelectScreen({ onSelect }: any) {
  const [target,setTarget]=useState(3000);
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#150800,#3a1c06,#150800)",fontFamily:"'Playfair Display',Georgia,serif",color:"#f4b942",padding:30}}>
      <div style={{maxWidth:820,width:"100%",textAlign:"center",background:"rgba(255,255,255,.04)",border:"1px solid rgba(244,185,66,.28)",borderRadius:22,padding:34,boxShadow:"0 20px 60px rgba(0,0,0,.45)"}}>
        <div style={{fontSize:38,fontWeight:900,marginBottom:8}}>Modo de juego</div>
        <div style={{color:"#caa15a",fontSize:15,lineHeight:1.6,marginBottom:26}}>Elegí si querés jugar una sola mano o una partida por puntos.</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:18,marginBottom:22}}>
          <button onClick={()=>onSelect({type:"single",target:null})} style={{...PBTN,width:"100%",padding:"18px 20px",fontSize:17,textAlign:"center"}}>Partida simple<br/><span style={{fontSize:12,fontWeight:400}}>Termina al cerrar una mano</span></button>
          <div style={{background:"rgba(0,0,0,.28)",border:"1px solid rgba(244,185,66,.25)",borderRadius:16,padding:18}}>
            <div style={{fontSize:18,fontWeight:900,marginBottom:12,color:"#ffe066"}}>Por puntos</div>
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:14}}>
              {[1000,2000,3000].map(v=>(
                <button key={v} onClick={()=>setTarget(v)} style={{...HBTN,padding:"8px 12px",color:target===v?"#1a0800":"#f4b942",background:target===v?"#f4b942":"rgba(244,185,66,.08)"}}>{v}</button>
              ))}
            </div>
            <button onClick={()=>onSelect({type:"points",target})} style={{...PBTN,width:"100%"}}>Jugar a {target} puntos</button>
          </div>
        </div>
        <div style={{fontSize:12,color:"#8a632a"}}>En partidas por puntos, el inicio se define una sola vez y luego alternan las rondas.</div>
      </div>
    </div>
  );
}
