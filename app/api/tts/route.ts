import { NextResponse } from "next/server";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAzureToken(key: string, region: string): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  const res = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": key },
  });
  if (!res.ok) throw new Error(`azure token fetch failed: ${res.status}`);
  const value = await res.text();
  cachedToken = { value, expiresAt: Date.now() + 9 * 60 * 1000 };
  return value;
}

function escapeSsml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(req: Request) {
  const { text, voiceRate = 0.9 } = await req.json();
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    console.warn("TODO: missing env var AZURE_SPEECH_KEY / AZURE_SPEECH_REGION — TTS stubbed");
    return NextResponse.json(
      { error: "tts_unconfigured", message: "Azure Speech is not configured." },
      { status: 501 },
    );
  }

  try {
    const token = await getAzureToken(key, region);
    const ratePct = Math.round((voiceRate - 1) * 100);
    const ssml = `<speak version="1.0" xml:lang="zh-HK"><voice xml:lang="zh-HK" xml:gender="Female" name="zh-HK-HiuGaaiNeural"><prosody rate="${ratePct >= 0 ? "+" : ""}${ratePct}%">${escapeSsml(
      text,
    )}</prosody></voice></speak>`;

    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-64kbitrate-mono-mp3",
      },
      body: ssml,
    });
    if (!res.ok) throw new Error(`azure tts failed: ${res.status}`);

    const audio = await res.arrayBuffer();
    return new Response(audio, { headers: { "Content-Type": "audio/mpeg" } });
  } catch (err) {
    console.error("tts failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "tts_failed" }, { status: 502 });
  }
}
