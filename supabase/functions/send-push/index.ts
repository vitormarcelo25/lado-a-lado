import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const FIREBASE_PROJECT_ID = Deno.env.get("FIREBASE_PROJECT_ID")!
const FIREBASE_CLIENT_EMAIL = Deno.env.get("FIREBASE_CLIENT_EMAIL")!
const FIREBASE_PRIVATE_KEY = Deno.env.get("FIREBASE_PRIVATE_KEY")!

async function getGoogleAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const expiry = now + 3600

  const header = { alg: "RS256", typ: "JWT" }
  const payload = {
    iss: FIREBASE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: expiry,
  }

  const encode = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

  const jwtHeader = encode(header)
  const jwtPayload = encode(payload)
  const signingInput = `${jwtHeader}.${jwtPayload}`

  const privateKeyPem = FIREBASE_PRIVATE_KEY
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "")

  const binaryDer = Uint8Array.from(atob(privateKeyPem), (c) => c.charCodeAt(0))

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput))
  const jwtSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")

  const jwt = `${signingInput}.${jwtSignature}`

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })

  const data = await res.json()
  return data.access_token
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "content-type, authorization",
        },
      })
    }

    const payload = await req.json()
    const record = payload.record

    if (!record) {
      return new Response(JSON.stringify({ error: "No record" }), { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: tokens, error: tokenError } = await supabase
      .from("device_tokens")
      .select("token")
      .eq("ativo", true)

    if (tokenError || !tokens?.length) {
      return new Response(JSON.stringify({ ok: true, reason: "no tokens" }))
    }

    const accessToken = await getGoogleAccessToken()

    const results = []
    for (const t of tokens) {
      const fcmRes = await fetch(
        `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message: {
              token: t.token,
              notification: {
                title: record.titulo,
                body: record.mensagem,
              },
              data: {
                notificacao_id: record.id || "",
                horario: record.horario || "",
              },
              android: { priority: "high" },
              apns: { payload: { aps: { sound: "default", badge: 1 } } },
              webpush: {
                headers: { TTL: "86400" },
                notification: {
                  icon: "/icon-192.png",
                  badge: "/icon-192.png",
                },
              },
            },
          }),
        }
      )

      const fcmData = await fcmRes.json()

      if (fcmData.error?.code === 404 || fcmData.error?.status === "UNREGISTERED") {
        await supabase
          .from("device_tokens")
          .update({ ativo: false })
          .eq("token", t.token)
      }

      results.push({ token: t.token.slice(0, 20) + "...", ok: fcmRes.ok })
    }

    return new Response(JSON.stringify({ ok: true, sent: results.length, results }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
