import { buildDeck, shuffle } from "./deck";
import { supabase } from "./supabase";

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createRoom(playerName: string) {
  const code = generateRoomCode();

  const { data, error } = await supabase
    .from("rooms")
    .insert([
      {
        code,
        state: {
          players: [
            {
              id: "player1",
              name: playerName,
              role: "host",
            },
          ],
          status: "waiting",
        },
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creando sala:", error);
    return null;
  }

  return data;
}

export async function joinRoom(code: string, playerName: string) {
  const cleanCode = code.trim().toUpperCase();

  const { data: room, error: findError } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", cleanCode)
    .single();

  if (findError || !room) {
    console.error("Sala no encontrada:", findError);
    return { room: null, error: "Sala no encontrada" };
  }

  const currentPlayers = room.state?.players || [];

  if (currentPlayers.length >= 2) {
    return { room: null, error: "La sala ya está completa" };
  }

  const updatedState = {
    ...room.state,
    players: [
      ...currentPlayers,
      {
        id: "player2",
        name: playerName,
        role: "guest",
      },
    ],
    status: "ready",
  };

  const { data: updatedRoom, error: updateError } = await supabase
    .from("rooms")
    .update({ state: updatedState })
    .eq("code", cleanCode)
    .select()
    .single();

  if (updateError) {
    console.error("Error uniéndose a sala:", updateError);
    return { room: null, error: "No se pudo unir a la sala" };
  }

  return { room: updatedRoom, error: null };
}
export async function startOnlineGame(roomCode: string) {
  const { data: room, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", roomCode)
    .single();

  if (error || !room) {
    console.error(error);
    return null;
  }

  const currentState = room.state || {};
  const players = currentState.players || [];

  if (players.length < 2) {
    console.error("No hay suficientes jugadores para iniciar la partida");
    return null;
  }

  const deck = shuffle(buildDeck());

  const hand0 = deck.splice(0, 11);
  const hand1 = deck.splice(0, 11);
  const dead0 = deck.splice(0, 11);
  const dead1 = deck.splice(0, 11);

  const onlineGame = {
    players: [players[0].name, players[1].name],
    currentPlayer: 0,
    hands: [hand0, hand1],
    dead: [dead0, dead1],
    deadBought: [false, false],
    deadAvailable: [true, true],
    table: [],
    drawPile: deck,
    discardPile: [],
    selected: [],
    message: `Turno de ${players[0].name}. Tomá una ficha del mazo.`,
    totalScores: [0, 0],
    gameMode: { type: "points", target: 3000 },
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
    online: true,
  };

  const { data: updatedRoom, error: updateError } = await supabase
    .from("rooms")
    .update({
      state: {
        ...currentState,
        status: "started",
        game: onlineGame,
      },
    })
    .eq("code", roomCode)
    .select()
    .single();

  if (updateError) {
    console.error(updateError);
    return null;
  }

  return updatedRoom;
}