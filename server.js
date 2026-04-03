import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 8787);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://poureservavalor.com";

const PROVIDERS = {
  chainalysis: {
    label: "Chainalysis",
    upstream: process.env.CHAINALYSIS_UPSTREAM_URL || "",
    apiKey: process.env.CHAINALYSIS_API_KEY || "",
    mode: process.env.CHAINALYSIS_MODE || ""
  },
  elliptic: {
    label: "Elliptic",
    upstream: process.env.ELLIPTIC_UPSTREAM_URL || "",
    apiKey: process.env.ELLIPTIC_API_KEY || "",
    mode: process.env.ELLIPTIC_MODE || ""
  },
  trm: {
    label: "TRM",
    upstream: process.env.TRM_UPSTREAM_URL || "",
    apiKey: process.env.TRM_API_KEY || "",
    mode: process.env.TRM_MODE || ""
  }
};

const GLOBAL_MODE = (process.env.COMPLIANCE_MODE || "unavailable").toLowerCase();

app.use(cors({
  origin: [ALLOWED_ORIGIN, "http://localhost:8080", "http://127.0.0.1:8080"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "256kb" }));

function normalizeResult(input, provider) {
  const rawState = String(input?.state || input?.status || "").toUpperCase();
  const reason = input?.reason || input?.message || `${provider.label} returned no reason.`;

  if (rawState === "CLEAR" || rawState === "APPROVED" || rawState === "ALLOW") {
    return { provider: provider.label, state: "CLEAR", reason };
  }
  if (rawState === "BLOCKED" || rawState === "DENY" || rawState === "REJECTED") {
    return { provider: provider.label, state: "BLOCKED", reason };
  }
  return { provider: provider.label, state: "UNAVAILABLE", reason };
}

function mockResult(provider) {
  const mode = (provider.mode || GLOBAL_MODE).toLowerCase();
  if (mode === "clear") {
    return { provider: provider.label, state: "CLEAR", reason: `${provider.label} mock: wallet approved.` };
  }
  if (mode === "blocked") {
    return { provider: provider.label, state: "BLOCKED", reason: `${provider.label} mock: wallet blocked.` };
  }
  return { provider: provider.label, state: "UNAVAILABLE", reason: `${provider.label} mock: backend unavailable.` };
}

async function queryUpstream(provider, payload) {
  const headers = { "Content-Type": "application/json" };
  if (provider.apiKey) {
    headers["Authorization"] = `Bearer ${provider.apiKey}`;
    headers["x-api-key"] = provider.apiKey;
  }

  const resp = await fetch(provider.upstream, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}`);
  }

  const data = await resp.json();
  return normalizeResult(data, provider);
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "POU PROTOCOLO compliance backend",
    origin: ALLOWED_ORIGIN,
    mode: GLOBAL_MODE,
    providers: Object.fromEntries(
      Object.entries(PROVIDERS).map(([k, v]) => [k, { label: v.label, upstreamConfigured: !!v.upstream, mode: v.mode || GLOBAL_MODE }])
    )
  });
});

app.post("/api/compliance/:provider", async (req, res) => {
  const key = String(req.params.provider || "").toLowerCase();
  const provider = PROVIDERS[key];

  if (!provider) {
    return res.status(404).json({ state: "UNAVAILABLE", reason: "Unknown provider." });
  }

  const payload = {
    address: req.body?.address || "",
    chainId: req.body?.chainId || 56,
    source: req.body?.source || "website",
    action: req.body?.action || "connect"
  };

  if (!payload.address) {
    return res.status(400).json({ provider: provider.label, state: "UNAVAILABLE", reason: "Missing wallet address." });
  }

  try {
    let result;
    if (provider.upstream) {
      result = await queryUpstream(provider, payload);
    } else {
      result = mockResult(provider);
    }
    return res.json(result);
  } catch (err) {
    console.error(`[${provider.label}]`, err);
    return res.json({
      provider: provider.label,
      state: "UNAVAILABLE",
      reason: `${provider.label} backend error: ${err.message}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`POU compliance backend running on http://localhost:${PORT}`);
  console.log(`Allowed origin: ${ALLOWED_ORIGIN}`);
});
