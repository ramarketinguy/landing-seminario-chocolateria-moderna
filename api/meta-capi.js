import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');

    // Configuration
    const PIXEL_ID = process.env.META_PIXEL_ID;
    const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

    if (!PIXEL_ID || !ACCESS_TOKEN) {
        console.error('Missing META_PIXEL_ID or META_ACCESS_TOKEN environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const payload = req.body;

        // Let's ensure the payload has the required format
        if (!payload || !payload.data || !Array.isArray(payload.data)) {
            return res.status(400).json({ error: 'Invalid payload format. Expected { data: [...] }' });
        }

        // --- CRITICAL FIX: Meta requires client_ip_address for Server Events ---
        // Get the real IP from Vercel headers
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.headers['x-real-ip'] ||
            req.socket?.remoteAddress ||
            '';

        payload.data = payload.data.map(event => {
            // Ensure user_data exists
            if (!event.user_data) {
                event.user_data = {};
            }
            // Inject the real client IP (Mandatory for CAPI QoS)
            if (!event.user_data.client_ip_address && clientIp) {
                event.user_data.client_ip_address = clientIp;
            }

            // Meta requires customer information parameters like external_id to be hashed with SHA256
            if (event.user_data.external_id) {
                const extId = String(event.user_data.external_id).trim();
                if (!/^[a-f0-9]{64}$/i.test(extId)) { // If not already hashed
                    event.user_data.external_id = crypto.createHash('sha256').update(extId).digest('hex');
                }
            }

            // Clean up: attribution_data is not standard at the root of a CAPI event
            // and can cause 400 Bad Request if strictly validated.
            if (event.attribution_data) {
                delete event.attribution_data;
            }

            return event;
        });

        console.log("Sending to Meta Payload:", JSON.stringify(payload, null, 2));

        const facebookUrl = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

        const response = await fetch(facebookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Meta CAPI Error:', data);
            return res.status(response.status).json({ error: data });
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
