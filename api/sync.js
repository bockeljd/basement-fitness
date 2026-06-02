async function kvRequest(command) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  
  if (!url || !token) {
    throw new Error('KV_NOT_CONFIGURED');
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(command)
  });

  const body = await res.json();
  if (body.error) {
    throw new Error(body.error);
  }
  return body.result;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, username, password, data } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing required credentials' });
  }

  const cleanUser = String(username).trim().toLowerCase();

  try {
    let userRecord;
    try {
      const raw = await kvRequest(['GET', `user:${cleanUser}`]);
      userRecord = raw ? JSON.parse(raw) : null;
    } catch (e) {
      if (e.message === 'KV_NOT_CONFIGURED') {
        return res.status(503).json({ error: 'Vercel KV Database not configured.' });
      }
      throw e;
    }

    if (!userRecord) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const crypto = require('crypto');
    const hash = crypto.createHmac('sha256', userRecord.salt).update(password).digest('hex');
    if (hash !== userRecord.hashedPassword) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (action === 'push') {
      if (!data) {
        return res.status(400).json({ error: 'Missing sync data' });
      }
      await kvRequest(['SET', `data:${cleanUser}`, JSON.stringify(data)]);
      return res.status(200).json({ success: true });
    }

    if (action === 'pull') {
      const dataRaw = await kvRequest(['GET', `data:${cleanUser}`]);
      const userData = dataRaw ? JSON.parse(dataRaw) : null;
      return res.status(200).json({ success: true, data: userData });
    }

    return res.status(400).json({ error: 'Invalid action. Must be push or pull.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};
