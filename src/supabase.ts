import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yehalorsgndkhxblscmj.supabase.co";

const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllaGFsb3JzZ25ka2h4YmxzY21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjUwMDYsImV4cCI6MjA5NDIwMTAwNn0.QeMRWzXidQ4YiW1PiKLcwRDdmZkeioAOa4QASU3GA48";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);