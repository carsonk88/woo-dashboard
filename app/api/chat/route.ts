import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST — receive a new contact form submission
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message, client_id } = body;

    if (!email || !message) {
      return NextResponse.json({ error: "email and message are required" }, { status: 400 });
    }

    const resolvedClientId = client_id || process.env.NEXT_PUBLIC_CLIENT_ID || null;

    // Check if there's an existing open conversation from this email
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("email", email.toLowerCase())
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let conversationId: string;

    if (existing) {
      // Add to existing conversation
      conversationId = existing.id;
      const { data: conv } = await supabase.from("conversations").select("unread").eq("id", conversationId).single();
      await supabase.from("conversations").update({ unread: (conv?.unread || 0) + 1, updated_at: new Date().toISOString() }).eq("id", conversationId);
    } else {
      // Create new conversation
      const { data: newConv, error: convErr } = await supabase
        .from("conversations")
        .insert({
          client_id: resolvedClientId,
          name: name || "Anonymous",
          email: email.toLowerCase(),
          phone: phone || null,
          status: "open",
          unread: 1,
        })
        .select()
        .single();

      if (convErr || !newConv) {
        return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
      }
      conversationId = newConv.id;
    }

    // Insert the message
    const { error: msgErr } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender: "customer",
      body: message,
    });

    if (msgErr) {
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
    }

    return NextResponse.json({ success: true, conversation_id: conversationId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

// GET — fetch conversations and messages for the dashboard
export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("client_id") || process.env.NEXT_PUBLIC_CLIENT_ID;
  const conversationId = req.nextUrl.searchParams.get("conversation_id");

  if (conversationId) {
    // Verify conversation belongs to this client
    if (clientId) {
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("client_id", clientId)
        .single();
      if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Get conversations for this client only — never return all clients' data
  if (!clientId) {
    return NextResponse.json({ error: "client_id required" }, { status: 400 });
  }

  const query = supabase
    .from("conversations")
    .select("*")
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH — send a reply or update conversation status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversation_id, reply, status } = body;

    if (!conversation_id) {
      return NextResponse.json({ error: "conversation_id required" }, { status: 400 });
    }

    // Update status if provided (close/archive)
    if (status) {
      await supabase.from("conversations").update({ status, updated_at: new Date().toISOString() }).eq("id", conversation_id);
    }

    // Insert admin reply if provided
    if (reply) {
      await supabase.from("messages").insert({
        conversation_id,
        sender: "admin",
        body: reply,
      });
      await supabase
        .from("conversations")
        .update({ unread: 0, updated_at: new Date().toISOString() })
        .eq("id", conversation_id);

      // Send email via WordPress WP Mail SMTP
      const { data: conv } = await supabase
        .from("conversations")
        .select("email, name, client_id")
        .eq("id", conversation_id)
        .single();

      if (conv?.email) {
        // Get the store URL from the client record
        const { data: client } = await supabase
          .from("clients")
          .select("store_url")
          .eq("id", conv.client_id)
          .single();

        const storeUrl = client?.store_url || "https://reviveamino.com";

        try {
          await fetch(`${storeUrl}/wp-json/dashboard/v1/send-reply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              secret: "rv-amino-dash-2026",
              to: conv.email,
              subject: `Reply from ${storeUrl.replace("https://", "").replace("http://", "")}`,
              message: reply,
            }),
          });
        } catch {
          // Email send failed — reply is still saved in Supabase
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
