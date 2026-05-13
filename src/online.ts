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