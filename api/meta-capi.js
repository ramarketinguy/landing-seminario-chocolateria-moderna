import crypto from 'crypto';

function sha256(str) {
    return crypto.createHash('sha256').update(String(str).toLowerCase().trim()).digest('hex');
}

function isHashed(val) {
    return /^[a-f0-9]{64}$/i.test(String(val).trim());
}

function hashIfNeeded(val) {
    if (!val) return undefined;
    const s = String(val).trim();
    return s ? (isHashed(s) ? s : sha256(s)) : undefined;
}

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

    const PIXEL_ID   = process.env.META_PIXEL_ID;
    const PIXEL_ID_2 = process.env.META_PIXEL_ID_2;
    const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

    if (!PIXEL_ID || !ACCESS_TOKEN) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const payload = req.body;

        if (!payload || !payload.data || !Array.isArray(payload.data)) {
            return res.status(400).json({ error: 'Invalid payload format.' });
        }

        const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.headers['x-real-ip'] ||
            req.socket?.remoteAddress || '';

        payload.data = payload.data.map(event => {
            if (!event.user_data) event.user_data = {};
            const ud = event.user_data;

            if (!ud.client_ip_address && clientIp) ud.client_ip_address = clientIp;

            if (ud.external_id) ud.external_id = hashIfNeeded(ud.external_id);
            if (ud.em)          ud.em           = hashIfNeeded(ud.em);
            if (ud.ph)          ud.ph           = hashIfNeeded(ud.ph);
            if (ud.fn)          ud.fn           = hashIfNeeded(ud.fn);
            if (ud.ln)          ud.ln           = hashIfNeeded(ud.ln);

            if (event.attribution_data) delete event.attribution_data;

            return event;
        });

        const pixelIds = [PIXEL_ID, PIXEL_ID_2].filter(Boolean);

        const responses = await Promise.all(
            pixelIds.map(pid =>
                fetch(`https://graph.facebook.com/v19.0/${pid}/events?access_token=${ACCESS_TOKEN}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }).then(r => r.json()).then(d => ({ pid, data: d }))
            )
        );

        const errors = responses.filter(r => r.data.error);
        if (errors.length === pixelIds.length) {
            return res.status(400).json({ error: errors });
        }

        return res.status(200).json({ success: true, results: responses });
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
