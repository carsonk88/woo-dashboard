import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { password, client_id } = await req.json();
    const cid = client_id || process.env.NEXT_PUBLIC_CLIENT_ID;

    if (!cid || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("clients")
      .select("dashboard_password, name")
      .eq("id", cid)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!data.dashboard_password) {
      return NextResponse.json({ error: "No password set. Contact your admin." }, { status: 403 });
    }

    if (password !== data.dashboard_password) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    return NextResponse.json({ success: true, name: data.name });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
