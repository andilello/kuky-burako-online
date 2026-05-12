import { useState } from "react";

const INP={width:"100%",padding:"9px 13px",boxSizing:"border-box",
  background:"rgba(0,0,0,.35)",border:"1px solid rgba(244,185,66,.3)",
  borderRadius:7,color:"#fff",fontSize:13,fontFamily:"Georgia,serif",outline:"none"};
const PBTN={marginTop:13,width:"100%",padding:"10px",
  background:"linear-gradient(135deg,#f4b942,#d4830a)",
  border:"none",borderRadius:7,color:"#1a0800",fontSize:13,fontWeight:700,cursor:"pointer",
  fontFamily:"'Playfair Display',Georgia,serif"};


export default function LoginScreen({ onStart }: any) {
  const [f,setF]=useState([{name:"",pw:""},{name:"",pw:""}]);
  const [ok,setOk]=useState([false,false]);
  const [db,setDb]=useState({});
  const [err,setErr]=useState(["",""]);
  const names=[f[0].name,f[1].name];

  const login=(i)=>{
    const {name,pw}=f[i];
    if(!name.trim()||!pw.trim()){setErr(e=>{const n=[...e];n[i]="Completá ambos campos.";return n;});return;}
    if(name===f[1-i].name&&ok[1-i]){setErr(e=>{const n=[...e];n[i]="Ese usuario ya está en juego.";return n;});return;}
    if(db[name]&&db[name]!==pw){setErr(e=>{const n=[...e];n[i]="Contraseña incorrecta.";return n;});return;}
    setDb(d=>({...d,[name]:pw}));
    const newOk=ok.map((v,j)=>j===i?true:v);
    setOk(newOk);
    setErr(e=>{const n=[...e];n[i]="";return n;});
    if(newOk[0]&&newOk[1]) setTimeout(()=>onStart([f[0].name,f[1].name]),200);
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      background:"linear-gradient(160deg,#150800,#3a1c06,#150800)",fontFamily:"'Playfair Display',Georgia,serif"}}>
      <div style={{textAlign:"center",marginBottom:44}}>
        <div style={{fontSize:76,fontWeight:900,letterSpacing:-3,
          background:"linear-gradient(135deg,#f4b942,#e8902a,#ffe066,#c97a10)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>Kuky-Burako</div>
        <div style={{color:"#7a4a18",letterSpacing:8,fontSize:12,marginTop:4}}>ONLINE · DEDICADO A KUKY</div>
      </div>
      <div style={{display:"flex",gap:24,flexWrap:"wrap",justifyContent:"center"}}>
        {[0,1].map(i=>(
          <div key={i} style={{
            background:"rgba(255,255,255,.04)",
            border:`1px solid ${ok[i]?"rgba(100,200,100,.5)":"rgba(244,185,66,.22)"}`,
            borderRadius:16,padding:"30px 34px",minWidth:250,backdropFilter:"blur(12px)",transition:"border .3s",
          }}>
            <div style={{textAlign:"center",marginBottom:22,color:ok[i]?"#90ee90":"#f4b942",fontSize:17,fontWeight:700}}>
              {ok[i]?`✓ ${f[i].name}`:`Jugador ${i+1}`}
            </div>
            {!ok[i]?(
              <>
                <input placeholder="Usuario" value={f[i].name}
                  onChange={e=>setF(a=>{const n=[...a];n[i]={...n[i],name:e.target.value};return n;})}
                  style={INP}/>
                <input type="password" placeholder="Contraseña" value={f[i].pw}
                  onChange={e=>setF(a=>{const n=[...a];n[i]={...n[i],pw:e.target.value};return n;})}
                  onKeyDown={e=>e.key==="Enter"&&login(i)} style={{...INP,marginTop:9}}/>
                {err[i]&&<div style={{color:"#e74c3c",fontSize:11,marginTop:5}}>{err[i]}</div>}
                <button onClick={()=>login(i)} style={PBTN}>Ingresar / Registrar</button>
              </>
            ):(
              <div style={{textAlign:"center",color:"#90ee90",fontSize:13}}>¡Listo para jugar!</div>
            )}
          </div>
        ))}
      </div>
      <div style={{marginTop:40,maxWidth:440,color:"#5a3a10",fontSize:11,lineHeight:1.8,textAlign:"center",padding:"0 20px"}}>
        <strong style={{color:"#7a5020"}}>Cómo jugar:</strong> 11 fichas + muerto de 11. Armá escaleras (consecutivas, mismo color) y piernas (mismo número, sin límite para formar canasta).
        7+ fichas = Canasta. El 2 actúa como comodín (★). Meta: 3000 puntos.
      </div>
    </div>
  );
}
