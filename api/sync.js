async function supabaseRequest(path, method, bodyArgs) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }

  const endpoint = `${url}/rest/v1/${path}`;
  const headers = {
    'apikey': anonKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  };

  const options = { method, headers };
  if (bodyArgs) {
    options.body = JSON.stringify(bodyArgs);
  }

  const res = await fetch(endpoint, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase error (${res.status}): ${errorText}`);
  }

  if (method === 'GET') {
    return await res.json();
  }
  return null;
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
    let userRecord = null;
    try {
      const rows = await supabaseRequest(`basement_fitness_sync?username=eq.${cleanUser}`, 'GET');
      userRecord = rows[0] || null;
    } catch (e) {
      if (e.message === 'SUPABASE_NOT_CONFIGURED') {
        return res.status(503).json({ error: 'Supabase Database not configured.' });
      }
      throw e;
    }

    if (!userRecord) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const crypto = require('crypto');
    const hash = crypto.createHmac('sha256', userRecord.salt).update(password).digest('hex');
    if (hash !== userRecord.password_hash) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (action === 'push') {
      if (!data) {
        return res.status(400).json({ error: 'Missing sync data' });
      }
      await supabaseRequest(`basement_fitness_sync?username=eq.${cleanUser}`, 'PATCH', {
        data,
        updated_at: new Date().toISOString()
      });
      return res.status(200).json({ success: true });
    }

    if (action === 'pull') {
      return res.status(200).json({ success: true, data: userRecord.data });
    }

    return res.status(400).json({ error: 'Invalid action. Must be push or pull.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};
