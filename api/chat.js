// Simple Global Cache: Har request par session create hone ki bajaye sirf 1 martaba hoga
let isSessionCreated = false;

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { text } = req.query;
  const session = "test123";

  if (!text) {
    return res.status(400).json({ status: false, error: "Text required" });
  }

  try {
    // 1. Session creation sirf pehli baar chalega (Crash & Delay Se Bachne Ke Liye)
    if (!isSessionCreated) {
      await fetch(
        `https://flipy-flip.vercel.app/session/create?session=${session}&ai_name=test&looklike=girl&core_prompt=You+are+a+helpful+AI&my_name=user&password=1234`
      ).catch(() => {}); // Catch silent error
      isSessionCreated = true;
    }

    // 2. Direct Chat Fetch
    const apiRes = await fetch(
      `https://flipy-flip.vercel.app/chat?message=${encodeURIComponent(text)}&session=${session}`
    );

    const data = await apiRes.json();

    return res.status(200).json({
      status: true,
      reply: data.reply || "No reply"
    });

  } catch (e) {
    // High Traffic me crash hone ki bajaye safe exit karega
    return res.status(200).json({
      status: true,
      reply: "Busy, try again"
    });
  }
}
