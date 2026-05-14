import RoomWaitingScreen from "./screens/RoomWaitingScreen";
import OnlineLobbyScreen from "./screens/OnlineLobbyScreen";
import { createRoom, joinRoom } from "./online";
import { useState, useCallback, useEffect } from "react";
import { buildDeck, shuffle } from "./deck";
import { tileValue, handPenalty, groupSum } from "./scoring";
import {
  isJokerFigure,
  isTwoTile,
  canActAsWild,
  getEscaleraArrangement,
  getPiernaArrangement,
  normalizeGroupTiles,
  isCanasta,
  isCanastaPura,
  isCanastalImpura,
  playerHasCanasta,
  compareByEscalera,
  compareByPierna,
  compareWildFirst,
} from "./rules";
import Tile from "./components/Tile";
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import ModeSelectScreen from "./screens/ModeSelectScreen";
import StarterDrawScreen from "./screens/StarterDrawScreen";



// ─── INIT ─────────────────────────────────────────────────────────────────────
function initGame(names, starterIdx = 0, gameMode = {type:"points", target:3000}) {
  const deck = shuffle(buildDeck());
  const hand0 = deck.splice(0, 11);
  const hand1 = deck.splice(0, 11);
  const dead0 = deck.splice(0, 11);
  const dead1 = deck.splice(0, 11);
  return {
    players: names,
    currentPlayer: starterIdx,
    hands: [hand0, hand1],
    dead: [dead0, dead1],
    deadBought: [false, false],
    deadAvailable: [true, true],
    table: [],
    drawPile: deck,
    discardPile: [],
    selected: [],
    message: `Turno de ${names[starterIdx]}. Tomá una ficha del mazo.`,
    totalScores: [0, 0],
    gameMode,
    roundScores: null,
    drawnThisTurn: false,
    manoFirstTurn: true,
    manoCanReturn: false,
    firstDrawnTile: null,
    manoSwapUsed: false,
    hasLaidDown: [false, false],
    roundOver: false,
    gameOver: false,
    winner: null,
    undoState: null,
    closeWarning: false,
  };
}

// ─── TABLE GROUP ──────────────────────────────────────────────────────────────
function TGrp({group,index,canAdd,onAdd}) {
  const cp=isCanastaPura(group),ci=isCanastalImpura(group),c=isCanasta(group);
  return (
    <div onClick={()=>canAdd&&onAdd(index)} style={{
      display:"flex",gap:3,flexWrap:"wrap",alignItems:"flex-end",
      background:canAdd?"rgba(255,224,102,.1)":cp?"rgba(255,215,0,.07)":ci?"rgba(100,220,100,.07)":"rgba(0,0,0,.22)",
      border:canAdd?"2px dashed #ffe066":cp?"2px solid rgba(255,215,0,.5)":ci?"2px solid rgba(100,220,100,.4)":"1px solid rgba(255,255,255,.1)",
      borderRadius:8,padding:"7px 10px",cursor:canAdd?"pointer":"default",
      transition:"all .15s",position:"relative",minWidth:60,marginTop:c?12:0,
    }}>
      {c&&<span style={{
        position:"absolute",top:-13,left:4,fontSize:10,
        color:cp?"#ffd700":"#90ee90",fontWeight:700,
        background:"rgba(0,0,0,.65)",padding:"1px 5px",borderRadius:4,
      }}>{cp?"⭐ Canasta Pura":"✨ Canasta Impura"}</span>}
      {(() => {
        const arr=getEscaleraArrangement(group.tiles) || getPiernaArrangement(group.tiles);
        return group.tiles.map((t,i)=><Tile key={t.id+i} tile={t} small replaceAs={arr?.replaceAs?.[t.id]}/>);
      })()}
    </div>
  );
}


const INP={width:"100%",padding:"9px 13px",boxSizing:"border-box",
  background:"rgba(0,0,0,.35)",border:"1px solid rgba(244,185,66,.3)",
  borderRadius:7,color:"#fff",fontSize:13,fontFamily:"Georgia,serif",outline:"none"};
const PBTN={marginTop:13,width:"100%",padding:"10px",
  background:"linear-gradient(135deg,#f4b942,#d4830a)",
  border:"none",borderRadius:7,color:"#1a0800",fontSize:13,fontWeight:700,cursor:"pointer",
  fontFamily:"'Playfair Display',Georgia,serif"};
const ABTN={width:"100%",padding:"8px 11px",marginBottom:7,
  background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.14)",
  borderRadius:7,color:"#ccc",fontSize:12,cursor:"pointer",textAlign:"left",
  fontFamily:"'Playfair Display',Georgia,serif",transition:"all .12s"};
const HBTN={padding:"4px 8px",background:"rgba(244,185,66,.08)",
  border:"1px solid rgba(244,185,66,.24)",borderRadius:6,color:"#caa15a",
  fontSize:10,cursor:"pointer",fontFamily:"'Playfair Display',Georgia,serif"};



// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  async function testOnline(playerName: string) {
    if (!playerName.trim()) {
      alert("Ingresá tu nombre");
      return;
    }
  
    const room = await createRoom(playerName);
      
    if (!room) {
      alert("No se pudo crear la sala");
      return;
    }
  
    console.log("ROOM CREADA:", room);
  
    setOnlineRoom(room);
    setScreen("room");
  }
  async function handleJoinRoom(code: string, playerName: string) {
    if (!playerName.trim()) {
      alert("Ingresá tu nombre");
      return;
    }
  
    if (!code.trim()) {
      alert("Ingresá un código de sala");
      return;
    }
  
    const result = await joinRoom(code, playerName);
  
    if (result.error) {
      alert(result.error);
      return;
    }
  
    setOnlineRoom(result.room);
    setScreen("room");
  }
  const [onlineRoom, setOnlineRoom] = useState(null);
  const [screen,setScreen]=useState("welcome");
  const [game,setGame]=useState(null);
  const [names,setNames]=useState([]);
  const [carryScores,setCarryScores]=useState([0,0]);
  const [gameMode,setGameMode]=useState({type:"points",target:3000});
  const [nextStarter,setNextStarter]=useState(0);

  const start=useCallback((ns)=>{setNames(ns);setCarryScores([0,0]);setScreen("mode");},[]);
  const chooseMode=useCallback((mode)=>{setGameMode(mode);setScreen("starter");},[]);
  const startWithPlayer=useCallback((starterIdx)=>{
    const ng=initGame(names, starterIdx, gameMode);
    setNextStarter(1-starterIdx);
    setGame({...ng,totalScores:carryScores});
    setScreen("game");
  },[names,carryScores,gameMode]);
  const newRound=useCallback(()=>{
    const scores=game?.totalScores || carryScores;
    const ng=initGame(names, nextStarter, gameMode);
    setCarryScores(scores);
    setGame({...ng,totalScores:scores});
    setNextStarter(1-nextStarter);
    setScreen("game");
  },[game,carryScores,names,nextStarter,gameMode]);
  const newGame=useCallback(()=>{setGame(null);setCarryScores([0,0]);setNextStarter(0);setScreen("login");},[]);

  if(screen==="welcome") return (
    <WelcomeScreen
      onOnline={() => setScreen("online")}
      onPractice={() => setScreen("login")}
    />
  );
  if(screen==="online") return (
    <OnlineLobbyScreen
    onCreateRoom={testOnline}
    onJoinRoom={handleJoinRoom}
    onBack={() => setScreen("welcome")}
  />
  );
  if(screen==="room") return (
    <RoomWaitingScreen
    room={onlineRoom}
    onBack={() => setScreen("online")}
    onStarted={(room: any) => {
      console.log("PARTIDA ONLINE INICIADA:", room);
      alert("La partida online está iniciando");
    }}
  />
  );
  if(screen==="login") return (
    <LoginScreen
      onStart={start}
      onBack={() => setScreen("welcome")}
    />
  );
  if(screen==="mode") return <ModeSelectScreen onSelect={chooseMode}/>;
  if(screen==="starter") return <StarterDrawScreen names={names} onStart={startWithPlayer}/>;
  if(!game) return null;
  return <Game g={game} setG={setGame} onNewRound={newRound} onNewGame={newGame}/>;
}

// ─── GAME ─────────────────────────────────────────────────────────────────────
function Game({g,setG,onNewRound,onNewGame}) {
  const cp=g.currentPlayer, op=1-cp;
  const hand=g.hands[cp];
  const sel=g.selected;
  const [discardExpanded, setDiscardExpanded] = useState(false);
  const [discardOrder, setDiscardOrder] = useState("mesa");
  const [pendingDiscard, setPendingDiscard] = useState(null);
  const [idleSeconds, setIdleSeconds] = useState(0);
  const [afkDismissedStage, setAfkDismissedStage] = useState(0);

  const upd=(patch)=>setG(s=>({...s,...(typeof patch==="function"?patch(s):patch)}));
  const msg=(m)=>upd({message:m});

  const resetActivity = useCallback(() => {
    setIdleSeconds(0);
    setAfkDismissedStage(0);
  }, []);

  useEffect(() => {
    if (g.roundOver || g.gameOver) return;
    const timer = setInterval(() => setIdleSeconds(v => v + 1), 1000);
    return () => clearInterval(timer);
  }, [g.roundOver, g.gameOver, g.currentPlayer]);

  const afkStage = idleSeconds >= 180 ? 3 : idleSeconds >= 120 ? 2 : idleSeconds >= 60 ? 1 : 0;
  const showAfkModal = afkStage > 0 && afkStage > afkDismissedStage;

  const drawFromPile=()=>{
    resetActivity();
    setG(s=>{
      // Guardia interna: nunca se puede tomar dos veces del mazo en el mismo turno.
      // La única excepción del jugador mano se hace con el botón especial de cambiar ficha.
      if(s.drawnThisTurn){
        return {...s,message:s.manoCanReturn
          ?"Ya tomaste la ficha inicial. Si no te gusta, usá ‘Descartar esta ficha y tomar otra’."
          :"Ya tomaste una ficha este turno."};
      }
      if(s.drawPile.length===0){
        return {...s,message:"¡El mazo está vacío!"};
      }
      const dp=[...s.drawPile];
      const tile=dp.pop();
      const hands=s.hands.map((h,i)=>i===s.currentPlayer?[...h,tile]:h);
      const isManoFirst=s.manoFirstTurn&&!s.manoSwapUsed;
      return{...s,drawPile:dp,hands,drawnThisTurn:true,
        manoCanReturn:isManoFirst,
        firstDrawnTile:isManoFirst?tile:null,
        selected:[],
        message:isManoFirst
          ?`Tomaste el ${tile.isJokerFigure?"★":tile.num} ${tile.isJokerFigure?"":tile.color}. Por ser mano, podés descartarla una sola vez y tomar otra.`
          :"Ficha tomada. Jugá o descartá."};
    });
  };

  const returnFirst=()=>{
    resetActivity();
    setG(s=>{
      if(!s.manoCanReturn || !s.firstDrawnTile){
        return {...s,message:"No hay ficha inicial para cambiar."};
      }
      if(s.drawPile.length===0){
        return {...s,message:"No quedan fichas en el mazo para tomar otra."};
      }
      const oldTile=s.firstDrawnTile;
      const dp=[...s.drawPile];
      const newTile=dp.pop();
      const hands=s.hands.map((h,i)=>{
        if(i!==s.currentPlayer) return h;
        const withoutOld=h.filter(t=>t.id!==oldTile.id);
        return [...withoutOld,newTile];
      });
      return{...s,hands,drawPile:dp,discardPile:[...s.discardPile,oldTile],
        drawnThisTurn:true,manoCanReturn:false,firstDrawnTile:null,manoFirstTurn:false,manoSwapUsed:true,
        selected:[],message:`Descartaste la ficha inicial y tomaste ${newTile.isJokerFigure?"★":newTile.num}. Jugá o descartá.`};
    });
  };

  const drawDiscard=()=>{
    resetActivity();
    if(g.drawnThisTurn){msg("Ya tomaste una ficha.");return;}
    if(g.discardPile.length===0){msg("El descarte está vacío.");return;}
    setG(s=>{
      const tiles=[...s.discardPile];
      const hands=s.hands.map((h,i)=>i===cp?[...h,...tiles]:h);
      return{...s,discardPile:[],hands,drawnThisTurn:true,
        manoCanReturn:false,manoFirstTurn:false,selected:[],
        message:`Tomaste ${tiles.length} ficha(s) del descarte.`};
    });
  };

  const toggleSel=(idx)=>{
    resetActivity();
    setG(s=>({...s,
      selected:s.selected.includes(idx)?s.selected.filter(i=>i!==idx):[...s.selected,idx]}));
  };

  const layDown=()=>{
    resetActivity();
    if(!g.drawnThisTurn){msg("Primero tomá una ficha.");return;}
    if(sel.length<3){msg("Seleccioná al menos 3 fichas.");return;}
    const tiles=sel.map(i=>hand[i]);
    const normalized=normalizeGroupTiles(tiles);
    if(!normalized){msg("Grupo inválido. Necesitás escalera (mismos colores, consecutivos) o pierna (mismo número, 3-4).");return;}

    setG(s=>{
      const newHand=hand.filter((_,i)=>!sel.includes(i));
      const hands=s.hands.map((h,i)=>i===cp?newHand:h);
      const table=[...s.table,{tiles:normalized,owner:cp}];
      const hasLaidDown=s.hasLaidDown.map((v,i)=>i===cp?true:v);
      const undoState={hands:s.hands,table:s.table,hasLaidDown:s.hasLaidDown,manoFirstTurn:s.manoFirstTurn,message:s.message};

      // Si al bajar el grupo el jugador queda sin fichas, puede comprar muerto
      // o cerrar inmediatamente si ya compró el muerto y tiene canasta.
      if(newHand.length===0){
        if(s.deadAvailable[cp]){
          const deadH=s.dead[cp];
          const h2=hands.map((h,i)=>i===cp?deadH:h);
          const db=s.deadBought.map((v,i)=>i===cp?true:v);
          const da=s.deadAvailable.map((v,i)=>i===cp?false:v);
          return{...s,hands:h2,table,hasLaidDown,deadBought:db,deadAvailable:da,undoState,
            closeWarning:false,selected:[],manoFirstTurn:false,
            message:`¡${s.players[cp]} compró el muerto de forma directa! Seguí jugando en este turno.`};
        }

        if(playerHasCanasta(table,cp)){
          return finishRound({...s,table,hasLaidDown},hands,s.discardPile,cp);
        }

        return{...s,hands,table,hasLaidDown,undoState,closeWarning:true,selected:[],manoFirstTurn:false,
          message:"¡ATENCIÓN! Te quedaste sin fichas, pero no podés cerrar sin canasta. Deshacé la última jugada para continuar."};
      }

      return{...s,hands,table,hasLaidDown,undoState,closeWarning:false,selected:[],manoFirstTurn:false,message:"¡Grupo bajado!"};
    });
  };

  const addToGroup=(gi)=>{
    resetActivity();
    if(!g.drawnThisTurn){msg("Primero tomá una ficha.");return;}
    if(sel.length===0){msg("Seleccioná fichas para agregar.");return;}
    if(!g.hasLaidDown[cp]){msg("Primero tenés que bajar tu propio juego.");return;}
    if(g.table[gi].owner!==cp){msg("Solo podés agregar fichas a tus propios juegos.");return;}
    const grp=g.table[gi];
    const add=sel.map(i=>hand[i]);
    const c1=[...grp.tiles,...add],c2=[...add,...grp.tiles];
    const newTiles=normalizeGroupTiles(c1)||normalizeGroupTiles(c2);
    if(!newTiles){msg("No se puede agregar esas fichas a ese grupo.");return;}
    setG(s=>{
      const newHand=hand.filter((_,i)=>!sel.includes(i));
      const hands=s.hands.map((h,i)=>i===cp?newHand:h);
      const table=s.table.map((g,i)=>i===gi?{...g,tiles:newTiles}:g);
      const hasLaidDown=s.hasLaidDown.map((v,i)=>i===cp?true:v);
      const undoState={hands:s.hands,table:s.table,hasLaidDown:s.hasLaidDown,manoFirstTurn:s.manoFirstTurn,message:s.message};

      // Si al agregar fichas a un juego el jugador queda sin fichas, puede cerrar
      // sin descarte si ya compró el muerto y tiene al menos una canasta.
      if(newHand.length===0){
        if(s.deadAvailable[cp]){
          const deadH=s.dead[cp];
          const h2=hands.map((h,i)=>i===cp?deadH:h);
          const db=s.deadBought.map((v,i)=>i===cp?true:v);
          const da=s.deadAvailable.map((v,i)=>i===cp?false:v);
          return{...s,hands:h2,table,hasLaidDown,deadBought:db,deadAvailable:da,undoState,
            closeWarning:false,selected:[],manoFirstTurn:false,
            message:`¡${s.players[cp]} compró el muerto de forma directa! Seguí jugando en este turno.`};
        }

        if(playerHasCanasta(table,cp)){
          return finishRound({...s,table,hasLaidDown},hands,s.discardPile,cp);
        }

        return{...s,hands,table,hasLaidDown,undoState,closeWarning:true,selected:[],manoFirstTurn:false,
          message:"¡ATENCIÓN! Te quedaste sin fichas, pero no podés cerrar sin canasta. Deshacé la última jugada para continuar."};
      }

      return{...s,hands,table,hasLaidDown,undoState,closeWarning:false,selected:[],manoFirstTurn:false,message:"¡Ficha(s) agregada(s)!"};
    });
  };

  const doDiscard=(confirmed=false)=>{
    resetActivity();
    if(!g.drawnThisTurn){msg("Primero tomá una ficha.");return;}
    if(sel.length!==1){msg("Seleccioná exactamente 1 ficha para descartar.");return;}
    const ti=sel[0], tile=hand[ti];
    if(canActAsWild(tile) && !confirmed){
      setPendingDiscard(tile);
      return;
    }
    setPendingDiscard(null);
    setG(s=>{
      const newHand=hand.filter((_,i)=>i!==ti);
      const hands=s.hands.map((h,i)=>i===cp?newHand:h);
      const discardPile=[...s.discardPile,tile];
      // Empty hand → check muerto
      if(newHand.length===0){
        if(s.deadAvailable[cp]){
          // Compra indirecta
          const deadH=s.dead[cp];
          const h2=hands.map((h,i)=>i===cp?deadH:h);
          const db=s.deadBought.map((v,i)=>i===cp?true:v);
          const da=s.deadAvailable.map((v,i)=>i===cp?false:v);
          return{...s,hands:h2,discardPile,deadBought:db,deadAvailable:da,
            selected:[],drawnThisTurn:false,manoCanReturn:false,manoFirstTurn:false,
            currentPlayer:op,
            message:`${s.players[cp]} compró el muerto (compra indirecta). Turno de ${s.players[op]}.`};
        }
        // Validate: need at least 1 canasta to close
        if(!playerHasCanasta(s.table,cp)){
          // Can't close — hand is empty but no canasta: put tile back, can't discard it
          // Restore hand with the discarded tile so player must keep playing
          const restoredHand=[...newHand,tile];
          const restoredHands=s.hands.map((h,i)=>i===cp?restoredHand:h);
          return{...s,hands:restoredHands,selected:[],closeWarning:true,
            message:"¡ATENCIÓN! No podés cerrar sin tener al menos una Canasta en la mesa. Deshacé tu última jugada para continuar o seguí formando una canasta."};
        }
        // Close round
        return finishRound(s,hands,discardPile,cp);
      }
      return{...s,hands,discardPile,currentPlayer:op,
        selected:[],drawnThisTurn:false,manoCanReturn:false,manoFirstTurn:false,
        message:`Turno de ${s.players[op]}.`};
    });
  };

  const buyMuertoDirect=()=>{
    resetActivity();
    if(!g.drawnThisTurn){msg("Primero tomá una ficha.");return;}
    if(!g.deadAvailable[cp]){msg("Ya compraste tu muerto.");return;}
    if(hand.length>0){msg("Para compra directa necesitás quedar sin fichas primero.");return;}
    setG(s=>{
      const deadH=s.dead[cp];
      const hands=s.hands.map((h,i)=>i===cp?deadH:h);
      const db=s.deadBought.map((v,i)=>i===cp?true:v);
      const da=s.deadAvailable.map((v,i)=>i===cp?false:v);
      return{...s,hands,deadBought:db,deadAvailable:da,selected:[],
        message:`¡${s.players[cp]} compró el muerto! Seguí jugando en este turno.`};
    });
  };

  function finishRound(s,hands,discardPile,winner){
    const rs=[0,0];

    for (let i = 0; i < 2; i++) {
      const playerGroups = s.table.filter(grp => grp.owner === i);
      const hasCanasta = playerGroups.some(grp => isCanasta(grp));
      const tableTilesValue = playerGroups.reduce(
        (sum, grp) => sum + grp.tiles.reduce((a, t) => a + tileValue(t), 0),
        0
      );
      const handValue = handPenalty(hands[i]);
      const boughtMuerto = !s.deadAvailable[i];

      if (hasCanasta) {
        // Solo quien formó canasta suma las fichas que bajó a la mesa.
        rs[i] += tableTilesValue;

        playerGroups.forEach(grp => {
          if (isCanastaPura(grp)) rs[i] += 200;
          else if (isCanastalImpura(grp)) rs[i] += 100;
        });

        if (i === winner) rs[i] += 100; // cierre
        rs[i] -= handValue;
      } else {
        // Si no formó canasta, resta todo lo bajado y lo que quedó en mano.
        rs[i] -= tableTilesValue;
        rs[i] -= handValue;
      }

      // El muerto suma o resta independientemente de haber formado canasta.
      rs[i] += boughtMuerto ? 100 : -100;
    }

    const tot=s.totalScores.map((t,i)=>t+rs[i]);
    const mode=s.gameMode || {type:"points",target:3000};
    const gw=mode.type==="single" ? winner : tot.findIndex(t=>t>=mode.target);
    const isGameOver=mode.type==="single" || gw>=0;
    return{...s,hands,discardPile,roundOver:true,gameOver:isGameOver,
      winner:isGameOver?(gw>=0?gw:winner):winner,roundScores:rs,totalScores:tot,selected:[],
      message: mode.type==="single" ? `¡${s.players[winner]} ganó la partida simple!` : `¡${s.players[winner]} cerró la ronda!`};
  }

  const reorderHand = (mode) => {
    resetActivity();
    const comparers = {
      escalera: compareByEscalera,
      pierna: compareByPierna,
      comodines: compareWildFirst,
    };
    const cmp = comparers[mode];
    if (!cmp) return;
    setG(s => {
      const current = s.hands[cp];
      const selectedTiles = s.selected.map(i => current[i]).filter(Boolean);
      const ordered = [...current].sort(cmp);
      const selected = selectedTiles
        .map(tile => ordered.findIndex(t => t.id === tile.id))
        .filter(i => i >= 0);
      const hands = s.hands.map((h,i)=>i===cp?ordered:h);
      const labels = {
        escalera: "Bandeja ordenada por escaleras: color y orden 3-4-...-13-1; comodines al final.",
        pierna: "Bandeja ordenada por piernas: números iguales juntos; comodines al final.",
        comodines: "Comodines visibles al inicio de la bandeja.",
      };
      return {...s,hands,selected,message:labels[mode]};
    });
  };

  const manualMode = () => { resetActivity(); msg("Modo manual activo: arrastrá una ficha y soltala sobre otra para ordenar tu bandeja a gusto."); };

  const moveHandTile = (from, to) => {
    resetActivity();
    if (from === to || from < 0 || to < 0) return;
    setG(s => {
      const current = s.hands[cp];
      if (!current[from] || !current[to]) return s;
      const selectedTiles = s.selected.map(i => current[i]).filter(Boolean);
      const ordered = [...current];
      const [moved] = ordered.splice(from, 1);
      ordered.splice(to, 0, moved);
      const selected = selectedTiles
        .map(tile => ordered.findIndex(t => t.id === tile.id))
        .filter(i => i >= 0);
      const hands = s.hands.map((h,i)=>i===cp?ordered:h);
      return {...s,hands,selected,message:"Bandeja reordenada manualmente."};
    });
  };

  const undoLastTableAction = () => {
    setG(s => {
      if (!s.undoState) return {...s,message:"No hay una jugada de mesa para deshacer."};
      return {
        ...s,
        hands: s.undoState.hands,
        table: s.undoState.table,
        hasLaidDown: s.undoState.hasLaidDown,
        manoFirstTurn: s.undoState.manoFirstTurn,
        selected: [],
        undoState: null,
        closeWarning: false,
        message: "Última jugada deshecha. Recuperaste la ficha/fichas colocadas."
      };
    });
  };

  const displayDiscard = (() => {
    if (discardOrder === "escalera") return [...g.discardPile].sort(compareByEscalera);
    if (discardOrder === "pierna") return [...g.discardPile].sort(compareByPierna);
    return discardExpanded ? g.discardPile : g.discardPile.slice(-6);
  })();

  const canAdd=sel.length>0&&g.drawnThisTurn&&g.hasLaidDown[cp];
  const selPts=sel.length>=3?groupSum(sel.map(i=>hand[i])):0;

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",
      background:"radial-gradient(ellipse at 50% 0%,#1e4d0f,#0e2806 55%,#050e02)",
      fontFamily:"'Playfair Display',Georgia,serif",color:"#fff"}}>

      {/* HEADER */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"9px 18px",background:"rgba(0,0,0,.45)",
        borderBottom:"1px solid rgba(244,185,66,.22)",flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:22,fontWeight:900,color:"#f4b942",letterSpacing:2}}>Kuky-Burako OnLine</div>
        <div style={{background:"rgba(244,185,66,.1)",border:"1px solid rgba(244,185,66,.3)",
          borderRadius:7,padding:"5px 15px",fontSize:12,color:"#f4b942",textAlign:"center"}}>
          <strong>{g.players[cp]}</strong>
          {g.drawnThisTurn&&<span style={{color:"#90ee90",marginLeft:7}}>• Ficha tomada</span>}
          {g.manoCanReturn&&<span style={{color:"#ffe066",marginLeft:7}}>• Podés devolver</span>}
        </div>
        <div style={{display:"flex",gap:14,fontSize:12,color:"#7a5020"}}>
          {g.players.map((p,i)=>(
            <span key={i} style={{color:i===cp?"#f4b942":"#7a5020"}}>
              {p}: <strong style={{color:i===cp?"#ffe066":"#a07040"}}>{g.totalScores[i]}</strong>
            </span>
          ))}
          <span>Mazo: {g.drawPile.length}</span>
        </div>
      </div>

      {/* MESSAGE */}
      <div style={{padding:"6px 18px",background:"rgba(0,0,0,.28)",
        borderBottom:"1px solid rgba(255,255,255,.04)",
        fontSize:12,color:"#ffe066",minHeight:28}}>
        {g.message}
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>
        {/* LEFT */}
        <div style={{width:162,background:"rgba(0,0,0,.33)",
          borderRight:"1px solid rgba(255,255,255,.06)",
          padding:13,display:"flex",flexDirection:"column",gap:10,overflowY:"auto"}}>
          <div style={{color:"#6a4018",fontSize:10,letterSpacing:2}}>RIVAL</div>
          <div style={{fontWeight:700,color:"#e0c080",fontSize:14}}>{g.players[op]}</div>
          <div style={{color:"#555",fontSize:11}}>{g.hands[op].length} fichas en mano</div>
          <div style={{fontSize:11,color:g.deadAvailable[op]?"#f4b942":"#555",
            background:"rgba(0,0,0,.2)",borderRadius:5,padding:"5px 8px"}}>
            {g.deadAvailable[op]?"🎁 Muerto sin comprar":"✓ Muerto comprado"}
          </div>
          <div style={{borderTop:"1px solid rgba(255,255,255,.07)",paddingTop:10}}>
            <div style={{color:"#6a4018",fontSize:10,letterSpacing:2,marginBottom:7}}>MI ESTADO</div>
            <div style={{fontSize:11,color:g.deadAvailable[cp]?"#f4b942":"#555",
              background:"rgba(0,0,0,.2)",borderRadius:5,padding:"5px 8px",marginBottom:6}}>
              {g.deadAvailable[cp]?"🎁 Mi muerto: disponible":g.deadBought[cp]?"✓ Muerto comprado":"✓ Muerto comprado"}
            </div>
            <div style={{fontSize:11,color:g.hasLaidDown[cp]?"#90ee90":"#888",
              background:"rgba(0,0,0,.2)",borderRadius:5,padding:"5px 8px"}}>
              {g.hasLaidDown[cp]?"✓ Ya bajé fichas":"⏳ Sin bajar aún (min 30 pts)"}
            </div>
            <div style={{fontSize:11,marginTop:5,
              color:playerHasCanasta(g.table,cp)?"#ffd700":"#666",
              background:"rgba(0,0,0,.2)",borderRadius:5,padding:"5px 8px"}}>
              {playerHasCanasta(g.table,cp)?"⭐ Tengo canasta (puedo cerrar)":"🔒 Sin canasta (no puedo cerrar)"}
            </div>
          </div>
          <div style={{marginTop:"auto",borderTop:"1px solid rgba(255,255,255,.07)",paddingTop:10}}>
            <div style={{color:"#6a4018",fontSize:10,marginBottom:5}}>TOTALES</div>
            {g.players.map((p,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                <span style={{color:i===cp?"#f4b942":"#777"}}>{p}</span>
                <span style={{color:"#b09050",fontWeight:700}}>{g.totalScores[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER */}
        <div style={{flex:1,padding:14,overflowY:"auto",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{color:"#6a4018",fontSize:10,letterSpacing:2}}>— MESA —</div>
          {g.table.length===0?(
            <div style={{color:"rgba(255,255,255,.13)",fontSize:13,textAlign:"center",
              padding:"28px 0",border:"2px dashed rgba(255,255,255,.07)",borderRadius:10}}>
              La mesa está vacía. ¡Bajá tu primer juego!<br/>
              <span style={{fontSize:10,color:"rgba(255,255,255,.08)"}}>Primera bajada: mínimo 30 puntos</span>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,alignItems:"start"}}>
              {[0,1].map(ownerIdx=>(
                <div key={ownerIdx} style={{
                  minHeight:120,
                  background:ownerIdx===cp?"rgba(244,185,66,.045)":"rgba(0,0,0,.16)",
                  border:ownerIdx===cp?"1px solid rgba(244,185,66,.18)":"1px solid rgba(255,255,255,.06)",
                  borderRadius:10,
                  padding:10
                }}>
                  <div style={{
                    color:ownerIdx===cp?"#f4b942":"#8a5a20",fontSize:10,letterSpacing:2,
                    marginBottom:10,textAlign:ownerIdx===0?"left":"right"
                  }}>
                    JUEGOS DE {g.players[ownerIdx].toUpperCase()}
                  </div>
                  <div style={{
                    display:"flex",flexWrap:"wrap",gap:12,alignItems:"flex-start",
                    justifyContent:ownerIdx===0?"flex-start":"flex-end"
                  }}>
                    {g.table.map((grp,gi)=>({grp,gi})).filter(x=>x.grp.owner===ownerIdx).length===0 ? (
                      <div style={{color:"rgba(255,255,255,.12)",fontSize:11}}>Sin juegos bajados</div>
                    ) : g.table.map((grp,gi)=>({grp,gi})).filter(x=>x.grp.owner===ownerIdx).map(({grp,gi})=>(
                      <TGrp key={gi} group={grp} index={gi} canAdd={canAdd&&grp.owner===cp} onAdd={addToGroup}/>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DISCARD */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:7}}>
              <div style={{color:"#6a4018",fontSize:10,letterSpacing:2}}>— DESCARTE —</div>
              {g.discardPile.length>6&&(<button onClick={()=>setDiscardExpanded(v=>!v)} style={{...HBTN,padding:"4px 8px"}}>
                {discardExpanded?"Ver últimos 6":"Ampliar descarte"}
              </button>)}
              {g.discardPile.length>0&&(<button onClick={()=>{setDiscardOrder("escalera");setDiscardExpanded(true);}} style={{...HBTN,padding:"4px 8px"}}>Ordenar escaleras</button>)}
              {g.discardPile.length>0&&(<button onClick={()=>{setDiscardOrder("pierna");setDiscardExpanded(true);}} style={{...HBTN,padding:"4px 8px"}}>Ordenar piernas</button>)}
              {discardOrder!=="mesa"&&(<button onClick={()=>setDiscardOrder("mesa")} style={{...HBTN,padding:"4px 8px"}}>Orden original</button>)}
            </div>
            <div style={{
              display:"flex",gap:5,alignItems:"center",flexWrap:"wrap",
              maxHeight:discardExpanded?180:"none",overflowY:discardExpanded?"auto":"visible",
              padding:discardExpanded?8:0,border:discardExpanded?"1px solid rgba(244,185,66,.15)":"none",
              borderRadius:discardExpanded?8:0,background:discardExpanded?"rgba(0,0,0,.12)":"transparent"
            }}>
              {g.discardPile.length===0
                ?<span style={{color:"rgba(255,255,255,.13)",fontSize:12}}>Vacío</span>
                :displayDiscard.map((t,i,arr)=>(
                    <Tile key={t.id+i} tile={t} small dim={!discardExpanded && i<arr.length-1}/>
                  ))
              }
              {!g.drawnThisTurn&&g.discardPile.length>0&&(
                <button onClick={drawDiscard} style={{
                  ...ABTN,width:"auto",padding:"5px 11px",marginBottom:0,marginLeft:10,
                  background:"rgba(244,185,66,.1)",border:"1px solid rgba(244,185,66,.35)",color:"#f4b942",
                }}>Tomar descarte completo ({g.discardPile.length})</button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{width:170,background:"rgba(0,0,0,.33)",
          borderLeft:"1px solid rgba(255,255,255,.06)",
          padding:13,display:"flex",flexDirection:"column",gap:5,overflowY:"auto"}}>
          <div style={{color:"#6a4018",fontSize:10,letterSpacing:2,marginBottom:3}}>ACCIONES</div>

          <button onClick={drawFromPile} disabled={g.drawnThisTurn&&!g.manoCanReturn}
            style={{...ABTN,opacity:(g.drawnThisTurn&&!g.manoCanReturn)?0.35:1}}>
            🎲 Tomar del mazo
          </button>

          {g.manoCanReturn&&(
            <button onClick={returnFirst}
              style={{...ABTN,color:"#ffe066",border:"1px solid rgba(255,224,102,.35)"}}>
              ↩ Descartar esta ficha y tomar otra
            </button>
          )}

          <button onClick={layDown} disabled={sel.length<3||!g.drawnThisTurn}
            style={{...ABTN,opacity:(sel.length<3||!g.drawnThisTurn)?0.35:1}}>
            ⬇ Bajar grupo {sel.length>=3?`(${selPts} pts)`:""}
          </button>

          <button onClick={()=>doDiscard(false)} disabled={sel.length!==1||!g.drawnThisTurn}
            style={{...ABTN,background:"rgba(180,40,40,.15)",border:"1px solid rgba(180,40,40,.35)",
              color:"#d08080",opacity:(sel.length!==1||!g.drawnThisTurn)?0.35:1}}>
            🗑 Descartar (fin turno)
          </button>

          <button onClick={undoLastTableAction} disabled={!g.undoState}
            style={{...ABTN,background:g.closeWarning?"rgba(255,224,102,.18)":"rgba(255,255,255,.07)",
              border:g.closeWarning?"2px solid #ffe066":"1px solid rgba(255,255,255,.14)",
              color:g.closeWarning?"#ffe066":"#ccc",opacity:!g.undoState?0.35:1}}>
            ↶ Deshacer última jugada
          </button>

          {hand.length===0&&g.deadAvailable[cp]&&(
            <button onClick={buyMuertoDirect}
              style={{...ABTN,color:"#f4b942",border:"1px solid rgba(244,185,66,.4)",
                background:"rgba(244,185,66,.1)"}}>
              🎁 Comprar muerto
            </button>
          )}

          <div style={{borderTop:"1px solid rgba(255,255,255,.07)",paddingTop:10,marginTop:4}}>
            <div style={{color:"#6a4018",fontSize:10,letterSpacing:2,marginBottom:6}}>REGLAS RÁPIDAS</div>
            <div style={{fontSize:10,color:"#555",lineHeight:1.8}}>
              <b style={{color:"#7a5020"}}>Escalera:</b> 3+ seguidas, mismo color<br/>
              <b style={{color:"#7a5020"}}>Pierna:</b> 3+ del mismo número<br/>
              <b style={{color:"#ffd700"}}>Canasta Pura:</b> 7+ sin comodín +200<br/>
              <b style={{color:"#90ee90"}}>Canasta Impura:</b> 7+ con comodín +100<br/>
              <b style={{color:"#f4b942"}}>★ fig:</b> comodín, vale 50 pts<br/>
              <b style={{color:"#f4b942"}}>2:</b> comodín (o real en su color)<br/>
              <b style={{color:"#ffe066"}}>Cierre:</b> +100 pts<br/>
              Meta: <b style={{color:"#ffe066"}}>{g.gameMode?.type==="single"?"partida simple":`${g.gameMode?.target||3000} pts`}</b>
            </div>
          </div>
        </div>
      </div>

      {/* HAND */}
      <div style={{background:"rgba(0,0,0,.52)",borderTop:"1px solid rgba(244,185,66,.18)",padding:"11px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
          <span style={{color:"#6a4018",fontSize:10,letterSpacing:2}}>
            BANDEJA · {g.players[cp].toUpperCase()}
          </span>
          <span style={{color:"#3a2010",fontSize:10}}>({hand.length} fichas)</span>
          {sel.length>0&&<span style={{color:"#ffe066",fontSize:10}}>
            {sel.length} sel. {selPts>0?`· ${selPts} pts`:""}
          </span>}
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginLeft:"auto"}}>
            <button onClick={manualMode} style={HBTN}>Manual</button>
            <button onClick={()=>reorderHand("escalera")} style={HBTN}>Ordenar escaleras</button>
            <button onClick={()=>reorderHand("pierna")} style={HBTN}>Ordenar piernas</button>
            <button onClick={()=>reorderHand("comodines")} style={HBTN}>Ver comodines</button>
          </div>
          <button onClick={()=>setG(s=>({...s,selected:[]}))}
            style={{background:"none",border:"none",color:"#3a2010",cursor:"pointer",fontSize:10}}>
            Deseleccionar
          </button>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",paddingBottom:2}}>
          {hand.map((t,i)=>(
            <Tile key={t.id+i} tile={t} selected={sel.includes(i)} onClick={()=>toggleSel(i)} draggable onDragStart={(e)=>e.dataTransfer.setData("text/plain",String(i))} onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{e.preventDefault(); moveHandTile(Number(e.dataTransfer.getData("text/plain")), i);}}/>
          ))}
          {hand.length===0&&g.deadAvailable[cp]&&(
            <div style={{color:"#f4b942",fontSize:12,padding:"10px 0"}}>
              ¡Bandeja vacía! Comprá tu muerto con el botón de la derecha →
            </div>
          )}
          {hand.length===0&&!g.deadAvailable[cp]&&(
            <div style={{color: playerHasCanasta(g.table,cp)?"#90ee90":"#e08080",fontSize:12,padding:"10px 0"}}>
              {playerHasCanasta(g.table,cp)
                ?"¡Bandeja vacía! La ronda debería cerrarse automáticamente."
                :"¡Bandeja vacía pero sin canasta! Necesitás armar una canasta antes de poder cerrar."}
            </div>
          )}
        </div>
      </div>

      {g.closeWarning&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:180,padding:20}}>
        <div style={{background:"linear-gradient(135deg,#3a1200,#1a0700)",border:"3px solid #ffe066",borderRadius:18,padding:"32px 40px",maxWidth:560,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.75)"}}>
          <div style={{fontSize:42,marginBottom:10}}>⚠️</div>
          <div style={{fontSize:28,fontWeight:900,color:"#ffe066",marginBottom:12}}>¡ATENCIÓN!</div>
          <div style={{fontSize:16,lineHeight:1.6,color:"#fff3b0",marginBottom:22}}>
            No podés cerrar sin antes haber hecho una canasta.
            <br/>Deshacé tu última jugada para recuperar la ficha y continuar.
          </div>
          <button onClick={undoLastTableAction} disabled={!g.undoState} style={{...PBTN,maxWidth:260,margin:"0 auto"}}>↶ Deshacer última jugada</button>
          <button onClick={()=>setG(s=>({...s,closeWarning:false}))} style={{marginTop:12,background:"none",border:"none",color:"#b09050",cursor:"pointer",fontSize:12}}>Cerrar aviso</button>
        </div>
      </div>)}

      {pendingDiscard&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:190,padding:20}}>
        <div style={{background:"linear-gradient(135deg,#3a1200,#1a0700)",border:"3px solid #f4b942",borderRadius:18,padding:"30px 38px",maxWidth:520,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.75)"}}>
          <div style={{fontSize:42,marginBottom:10}}>⚠️</div>
          <div style={{fontSize:28,fontWeight:900,color:"#ffe066",marginBottom:12}}>¡ATENCIÓN!</div>
          <div style={{fontSize:16,lineHeight:1.6,color:"#fff3b0",marginBottom:22}}>
            Estás por descartar {isJokerFigure(pendingDiscard)?"un comodín":"un 2 que puede funcionar como comodín"}.
            <br/>¿Estás seguro de tu movimiento?
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>setPendingDiscard(null)} style={{...PBTN,width:"auto",padding:"12px 24px",background:"linear-gradient(135deg,#777,#444)",color:"#fff"}}>No, volver atrás</button>
            <button onClick={()=>doDiscard(true)} style={{...PBTN,width:"auto",padding:"12px 24px",background:"linear-gradient(135deg,#e85c5c,#9d1f1f)",color:"#fff"}}>Sí, descartar</button>
          </div>
        </div>
      </div>)}

      {showAfkModal&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.68)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:185,padding:20}}>
        <div style={{background:"linear-gradient(135deg,#231000,#120600)",border:"2px solid #ffe066",borderRadius:18,padding:"28px 36px",maxWidth:560,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.75)"}}>
          <div style={{fontSize:40,marginBottom:8}}>⏳</div>
          <div style={{fontSize:26,fontWeight:900,color:"#ffe066",marginBottom:12}}>¡ATENCIÓN!</div>
          {afkStage===1&&<div style={{fontSize:16,lineHeight:1.6,color:"#fff3b0",marginBottom:22}}>Llevás 1 minuto sin actividad. Tenés 1 minuto más para realizar un movimiento.</div>}
          {afkStage===2&&<div style={{fontSize:16,lineHeight:1.6,color:"#fff3b0",marginBottom:22}}>Llevás 2 minutos sin actividad. Tu rival ya podría reclamar victoria por abandono.</div>}
          {afkStage===3&&<div style={{fontSize:16,lineHeight:1.6,color:"#fff3b0",marginBottom:22}}>Llevás 3 minutos sin actividad. En la versión online esto podría contar como abandono.</div>}
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>{setAfkDismissedStage(afkStage);}} style={{...PBTN,width:"auto",padding:"12px 24px"}}>Seguir pensando</button>
            {afkStage>=2&&<button onClick={()=>msg(`${g.players[op]} podría reclamar victoria por abandono cuando el juego sea online.`)} style={{...PBTN,width:"auto",padding:"12px 24px",background:"linear-gradient(135deg,#e85c5c,#9d1f1f)",color:"#fff"}}>Reclamar victoria</button>}
          </div>
        </div>
      </div>)}

      {/* ROUND OVER */}
      {g.roundOver&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{background:"linear-gradient(135deg,#1a0900,#3a1c07)",
            border:"2px solid #f4b942",borderRadius:18,padding:"38px 52px",
            textAlign:"center",maxWidth:380,width:"90%"}}>
            <div style={{fontSize:48,marginBottom:12}}>{g.gameOver?"🏆":"🎴"}</div>
            <div style={{fontSize:24,fontWeight:900,color:"#f4b942",marginBottom:18}}>
              {g.gameOver?`¡${g.players[g.winner]} ganó!`:"Fin de ronda"}
            </div>
            {g.roundScores&&g.players.map((p,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",
                padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.07)",fontSize:13}}>
                <span style={{color:"#b09050"}}>{p}</span>
                <span>
                  <span style={{color:g.roundScores[i]>=0?"#90ee90":"#e08080",marginRight:10}}>
                    {g.roundScores[i]>=0?"+":""}{g.roundScores[i]}
                  </span>
                  <span style={{color:"#f4b942",fontWeight:700}}>{g.totalScores[i]} total</span>
                </span>
              </div>
            ))}
            <div style={{marginTop:24}}>
              {g.gameOver?(
                <button onClick={onNewGame} style={{...PBTN,maxWidth:200,margin:"0 auto"}}>Nuevo juego</button>
              ):(
                <button onClick={onNewRound} style={{...PBTN,maxWidth:200,margin:"0 auto"}}>Nueva ronda →</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
