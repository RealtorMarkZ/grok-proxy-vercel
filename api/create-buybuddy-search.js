export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body;

  // ← Paste your REAL Zapier webhook URL here in the next step
  const zapierUrl = 'https://hooks.zapier.com/hooks/catch/XXXXXXXXXXXXX/';  // ← CHANGE THIS LINE SOON

  try {
    const zapResponse = await fetch(zapierUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!zapResponse.ok) {
      throw new Error(`Zapier responded with ${zapResponse.status}`);
    }

    // For now, just confirm success (later we can enhance to return a real link if Zap sends one back)
    res.status(200).json({ success: true, message: 'Search data sent to Buying Buddy via Zapier' });
  } catch (error) {
    console.error('Error forwarding to Zapier:', error);
    res.status(500).json({ success: false, error: 'Failed to create search' });
  }
}
