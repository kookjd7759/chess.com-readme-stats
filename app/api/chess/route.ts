export const runtime = "edge";

type JsonValue = Record<string, any> | null;

async function fetchJSON(
  url: string,
  options?: {
    noStore?: boolean;
    revalidate?: number;
  }
): Promise<JsonValue> {
  const { noStore = false, revalidate } = options ?? {};

  const res = await fetch(url, {
    headers: {
      "User-Agent": "chess-com-readme-stats",
      Accept: "application/json",
    },
    ...(noStore
      ? { cache: "no-store" as const }
      : { next: { revalidate: revalidate ?? 3600 } }),
  });

  if (!res.ok) return null;
  return res.json();
}

function escapeXml(text: string) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatNumber(value: number | string) {
  if (typeof value === "number") return value.toLocaleString("en-US");
  return String(value);
}

function getStatsEntry(memberStats: any, key: string) {
  const arr = memberStats?.stats;
  if (!Array.isArray(arr)) return null;
  return arr.find((item: any) => item?.key === key) ?? null;
}

function getTotalGamesFromMemberStats(memberStats: any) {
  const keys = ["lightning", "bullet", "rapid", "chess960"];

  let total = 0;

  for (const key of keys) {
    const entry = getStatsEntry(memberStats, key);
    const count = entry?.stats?.total_game_count ?? entry?.gameCount ?? 0;

    if (typeof count === "number") {
      total += count;
    }
  }

  return total;
}

function getPuzzleRating(memberStats: any) {
  return getStatsEntry(memberStats, "tactics")?.stats?.rating ?? "-";
}

function getRapidRating(memberStats: any) {
  return getStatsEntry(memberStats, "rapid")?.stats?.rating ?? "-";
}

function getBulletRating(memberStats: any) {
  return getStatsEntry(memberStats, "bullet")?.stats?.rating ?? "-";
}

function getBlitzRating(memberStats: any) {
  return getStatsEntry(memberStats, "lightning")?.stats?.rating ?? "-";
}

function createSVG(data: any, baseUrl: string) {
  const fallbackAvatar = `${baseUrl}/assets/profile_none.png`;
  const avatar = data.avatar || fallbackAvatar;

  const title = data.title ?? "";
  const username = data.username ?? "";
  const name = data.name ?? "";

  const totalGames = data.totalGames ?? "-";
  const puzzles = data.puzzleRating ?? "-";
  const rapid = data.rapidRating ?? "-";
  const bullet = data.bulletRating ?? "-";
  const blitz = data.blitzRating ?? "-";

  const iconRapid = `${baseUrl}/assets/time-rapid.png`;
  const iconBullet = `${baseUrl}/assets/time-bullet.png`;
  const iconBlitz = `${baseUrl}/assets/time-blitz.png`;
  const iconPuzzle = `${baseUrl}/assets/puzzle-piece.png`;
  const iconPlay = `${baseUrl}/assets/play-white.png`;
  const logo = `${baseUrl}/assets/title-logo.png`;

  const safeAvatar = escapeXml(avatar);
  const safeTitle = escapeXml(title);
  const safeUsername = escapeXml(username);
  const safeName = escapeXml(name);

  const hasTitle = Boolean(title);

  const profileOffsetY = 20;
  const statsOffsetX = 0;
  const statsOffsetY = 20;

  return `
<svg width="760" height="230" viewBox="0 0 760 230" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="avatarClip">
      <rect x="14" y="52" width="116" height="116" rx="18"/>
    </clipPath>

    <linearGradient id="bg" x1="0" y1="0" x2="760" y2="230" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#08101d"/>
      <stop offset="100%" stop-color="#0b1730"/>
    </linearGradient>
  </defs>

  <!-- main card -->
  <rect width="760" height="230" rx="24" fill="url(#bg)"/>
  <rect x="4" y="4" width="752" height="222" rx="20" fill="none" stroke="#1b2a43"/>

  <!-- title logo -->
  <image href="${logo}" x="-15" y="15" width="195" height="40"/>

  <!-- PROFILE BLOCK -->
  <g transform="translate(0,${profileOffsetY})">
    <!-- avatar -->
    <rect x="14" y="52" width="116" height="116" rx="18" fill="#1b263b"/>
    <image
      href="${safeAvatar}"
      x="14"
      y="52"
      width="116"
      height="116"
      preserveAspectRatio="xMidYMid slice"
      clip-path="url(#avatarClip)"
    />

    ${
      hasTitle
        ? `
    <!-- title badge -->
    <rect x="144" y="58" width="40" height="28" rx="7" fill="#ab3a3a"/>
    <rect x="144.5" y="58.5" width="39" height="27" rx="6.5" fill="none" stroke="#e2a0a0"/>

    <text
      x="164"
      y="78"
      fill="#ffffff"
      font-size="16"
      font-family="Verdana"
      font-weight="700"
      text-anchor="middle"
    >
      ${safeTitle}
    </text>
    `
        : ""
    }

    <!-- username -->
    <text
      x="${hasTitle ? 196 : 144}"
      y="78"
      fill="#ffffff"
      font-size="28"
      font-family="Verdana"
      font-weight="700"
    >
      ${safeUsername}
    </text>

    <!-- name -->
    <text
      x="${hasTitle ? 196 : 144}"
      y="96"
      fill="#aab9d0"
      font-size="13"
      font-family="Verdana"
    >
      ${safeName}
    </text>

    <!-- games played -->
    <image href="${iconPlay}" x="144" y="116" width="19" height="19"/>
    <text
      x="170"
      y="131"
      fill="#93a7c6"
      font-size="12"
      font-family="Verdana"
      font-weight="700"
    >
      Games Played
    </text>

    <text
      x="144"
      y="154"
      fill="#ffffff"
      font-size="22"
      font-family="Verdana"
      font-weight="700"
    >
      ${escapeXml(formatNumber(totalGames))}
    </text>
  </g>

  <!-- STATS BLOCK -->
  <g transform="translate(${statsOffsetX},${statsOffsetY})">
    <!-- stats title -->
    <text
      x="490"
      y="34"
      fill="#ffffff"
      font-size="16"
      font-family="Verdana"
      font-weight="700"
    >
      Stats
    </text>

    <!-- separators -->
    <line x1="488" y1="48" x2="718" y2="48" stroke="#2e3c53"/>
    <line x1="488" y1="80" x2="718" y2="80" stroke="#2e3c53"/>
    <line x1="488" y1="112" x2="718" y2="112" stroke="#2e3c53"/>
    <line x1="488" y1="144" x2="718" y2="144" stroke="#2e3c53"/>
    <line x1="488" y1="176" x2="718" y2="176" stroke="#2e3c53"/>

    <!-- row 1 : Rapid -->
    <image href="${iconRapid}" x="492" y="57" width="18" height="18"/>
    <text x="524" y="71" fill="#d8c8aa" font-size="13" font-family="Verdana" font-weight="700">
      Rapid
    </text>
    <text
      x="710"
      y="71"
      fill="#ffffff"
      font-size="13"
      font-family="Verdana"
      font-weight="700"
      text-anchor="end"
    >
      ${escapeXml(formatNumber(rapid))}
    </text>

    <!-- row 2 : Blitz -->
    <image href="${iconBlitz}" x="492" y="89" width="18" height="18"/>
    <text x="524" y="103" fill="#d8c8aa" font-size="13" font-family="Verdana" font-weight="700">
      Blitz
    </text>
    <text
      x="710"
      y="103"
      fill="#ffffff"
      font-size="13"
      font-family="Verdana"
      font-weight="700"
      text-anchor="end"
    >
      ${escapeXml(formatNumber(blitz))}
    </text>

    <!-- row 3 : Bullet -->
    <image href="${iconBullet}" x="492" y="121" width="18" height="18"/>
    <text x="524" y="135" fill="#d8c8aa" font-size="13" font-family="Verdana" font-weight="700">
      Bullet
    </text>
    <text
      x="710"
      y="135"
      fill="#ffffff"
      font-size="13"
      font-family="Verdana"
      font-weight="700"
      text-anchor="end"
    >
      ${escapeXml(formatNumber(bullet))}
    </text>

    <!-- row 4 : Puzzles -->
    <image href="${iconPuzzle}" x="492" y="153" width="18" height="18"/>
    <text x="524" y="167" fill="#f1d2a3" font-size="13" font-family="Verdana" font-weight="700">
      Puzzles
    </text>
    <text
      x="710"
      y="167"
      fill="#ffffff"
      font-size="13"
      font-family="Verdana"
      font-weight="700"
      text-anchor="end"
    >
      ${escapeXml(formatNumber(puzzles))}
    </text>
  </g>
</svg>
`;
}

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const handle = (searchParams.get("handle") || "hikaru").trim().toLowerCase();

  if (!handle) {
    return new Response("Missing handle", { status: 400 });
  }

  const [profile, memberStats] = await Promise.all([
    fetchJSON(`https://api.chess.com/pub/player/${handle}`, { revalidate: 3600 }),
    fetchJSON(`https://www.chess.com/callback/member/stats/${handle}`, { noStore: true }),
  ]);

  if (!profile) {
    return new Response("Player not found", { status: 404 });
  }

  const data = {
    ...profile,
    memberStats,
    totalGames: getTotalGamesFromMemberStats(memberStats),
    puzzleRating: getPuzzleRating(memberStats),
    rapidRating: getRapidRating(memberStats),
    bulletRating: getBulletRating(memberStats),
    blitzRating: getBlitzRating(memberStats),
  };

  const svg = createSVG(data, origin);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}