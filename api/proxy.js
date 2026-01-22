export default async function handler(req, res) {
  const { path } = req.query;
  const targetUrl = `http://lms.kiet.edu/moodle/${path || ''}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Add any other moodle headers if needed
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(502).json({ error: "Could not connect to KIET server" });
  }
}