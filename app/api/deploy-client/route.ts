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

function teamQuery(extra?: string): string {
  if (!VERCEL_TEAM_ID) return extra ? `?${extra}` : "";
  return extra ? `?teamId=${VERCEL_TEAM_ID}&${extra}` : `?teamId=${VERCEL_TEAM_ID}`;
}

async function createProject(name: string, envVars: object[]) {
  return fetch(`https://api.vercel.com/v10/projects${teamQuery()}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      framework: "nextjs",
      gitRepository: { type: "github", repo: GITHUB_REPO },
      environmentVariables: envVars,
    }),
  });
}

async function triggerDeployment(projectId: string, repoId: number | string) {
  return fetch(`https://api.vercel.com/v13/deployments${teamQuery()}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: projectId,
      project: projectId,
      gitSource: {
        type: "github",
        repoId: String(repoId),
        ref: "main",
      },
    }),
  });
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

  // Get GitHub repo ID (public repo — no auth needed)
  const [ghOwner, ghRepo] = GITHUB_REPO.split("/");
  const ghRes = await fetch(`https://api.github.com/repos/${ghOwner}/${ghRepo}`, {
    headers: { "User-Agent": "woo-dashboard-deploy" },
  });
  if (!ghRes.ok) {
    return NextResponse.json({ error: `Could not fetch GitHub repo info: ${ghRes.status}` }, { status: 500 });
  }
  const ghData = await ghRes.json();
  const repoId: number = ghData.id;

  const envVars: { key: string; value: string; target: string[]; type: string }[] = [
    { key: "NEXT_PUBLIC_CLIENT_ID", value: clientId, target: ["production", "preview"], type: "plain" },
  ];
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    envVars.push({ key: "NEXT_PUBLIC_SUPABASE_URL", value: process.env.NEXT_PUBLIC_SUPABASE_URL, target: ["production", "preview"], type: "plain" });
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    envVars.push({ key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, target: ["production", "preview"], type: "plain" });
  }
  if (process.env.NEXT_PUBLIC_AGENCY_PASSWORD) {
    envVars.push({ key: "NEXT_PUBLIC_AGENCY_PASSWORD", value: process.env.NEXT_PUBLIC_AGENCY_PASSWORD, target: ["production", "preview"], type: "plain" });
  }

  // Create the project
  let projectName = `dash-${slugify(clientName)}-${clientId.slice(0, 6)}`;
  let createRes = await createProject(projectName, envVars);
  let project = await createRes.json();

  if (!createRes.ok) {
    if (project.error?.code === "project_name_taken") {
      projectName = `dash-${slugify(clientName)}-${clientId.slice(0, 12)}`;
      createRes = await createProject(projectName, envVars);
      project = await createRes.json();
    }
    if (!createRes.ok) {
      return NextResponse.json(
        { error: project.error?.message || "Failed to create Vercel project." },
        { status: createRes.status }
      );
    }
  }

  // Trigger the first deployment from the main branch
  const deployRes = await triggerDeployment(project.id, repoId);
  const deployData = await deployRes.json();

  if (!deployRes.ok) {
    // Project created but deploy trigger failed — URL will be live once user pushes to main
    return NextResponse.json({
      url: `https://${project.name}.vercel.app`,
      projectId: project.id,
      projectName: project.name,
      deployWarning: deployData.error?.message || "Project created but initial deploy trigger failed. It will deploy on next git push.",
    });
  }

  return NextResponse.json({
    url: `https://${project.name}.vercel.app`,
    projectId: project.id,
    projectName: project.name,
  });
}
