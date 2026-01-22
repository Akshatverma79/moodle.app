// api/proxy.js
export default async function handler(req, res) {
    // 1. Get the internal path (e.g., login/token.php)
    const { slug } = req.query;
    const path = Array.isArray(slug) ? slug.join('/') : slug;

    // 2. Build the target URL for the KIET server
    const targetUrl = new URL(`http://lms.kiet.edu/moodle/${path}`);

    // 3. Copy all query parameters (username, password, etc.)
    Object.keys(req.query).forEach(key => {
        if (key !== 'slug') {
            targetUrl.searchParams.append(key, req.query[key]);
        }
    });

    try {
        // 4. Fetch the data while masking as a real browser
        const response = await fetch(targetUrl.toString(), {
            method: req.method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
            },
        });

        const data = await response.json();
        
        // 5. Send the data back to your React app
        res.status(response.status).json(data);
    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(502).json({ error: "KIET Server is unreachable from Vercel." });
    }
}