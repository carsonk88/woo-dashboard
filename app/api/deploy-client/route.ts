import { NextRequest, NextResponse } from "next/server";

const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN;
const GITHUB_REPO = process.env.VERCEL_GITHUB_REPO || "carsonk88/woo-dashboard";
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || "";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function POST(req: NextRequest) {
  if (!VERCEL_TOKEN) {
    return NextResponse.json(
      { error: "VERCEL_API_TOKEN is not configured on this server." },
      { status: 500 }
    );
  }

  const { clientId, clientName } = await req.json() as { clientId: string; clientName: string };

  if (!clientId || !clientName) {
    return NextResponse.json({ error: "clientId and clientName are required." }, { status: 400 });
  }

  const projectName = `dash-${slugify(clientName)}-${clientId.slice(0, 6)}`;
  const teamQuery = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : "";

  const envVars: { key: string; value: string; target: string[]; type: string }[] = [
    {
      key: "NEXT_PUBLIC_CLIENT_ID",
      value: clientId,
      target: ["production", "preview"],
      type: "plain",
    },
  ];

  // Forward Supabase vars so the client deployment can read clients table
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    envVars.push({
      key: "NEXT_PUBLIC_SUPABASE_URL",
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      target: ["production", "preview"],
      type: "plain",
    });
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    envVars.push({
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      target: ["production", "preview"],
      type: "plain",
    });
  }
  if (process.env.NEXT_PUBLIC_AGENCY_PASSWORD) {
    envVars.push({
      key: "NEXT_PUBLIC_AGENCY_PASSWORD",
      value: process.env.NEXT_PUBLIC_AGENCY_PASSWORD,
      target: ["production", "preview"],
      type: "plain",
    });
  }

  const createRes = await fetch(`https://api.vercel.com/v10/projects${teamQuery}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: projectName,
      framework: "nextjs",
      gitRepository: {
        type: "github",
        repo: GITHUB_REPO,
      },
      environmentVariables: envVars,
    }),
  });

  const project = await createRes.json();

  if (!createRes.ok) {
    // If name collision, append more of the UUID
    if (project.error?.code === "project_name_taken") {
      const retryName = `dash-${slugify(clientName)}-${clientId.slice(0, 12)}`;
      const retryRes = await fetch(`https://api.vercel.com/v10/projects${teamQuery}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: retryName,
          framework: "nextjs",
          gitRepository: { type: "github", repo: GITHUB_REPO },
          environmentVariables: envVars,
        }),
      });
      const retryProject = await retryRes.json();
      if (!retryRes.ok) {
        return NextResponse.json(
          { error: retryProject.error?.message || "Failed to create Vercel project." },
          { status: retryRes.status }
        );
      }
      const retryUrl = `https://${retryProject.name}.vercel.app`;
      return NextResponse.json({ url: retryUrl, projectId: retryProject.id, projectName: retryProject.name });
    }

    return NextResponse.json(
      { error: project.error?.message || "Failed to create Vercel project." },
      { status: createRes.status }
    );
  }

  const url = `https://${project.name}.vercel.app`;
  return NextResponse.json({ url, projectId: project.id, projectName: project.name });
}
