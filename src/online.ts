import { supabase } from "./supabase";

export async function createRoom() {
  const code = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  const { data, error } = await supabase
    .from("rooms")
    .insert([
      {
        code,
        state: {
          players: [],
        },
      },
    ])
    .select()
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}