const crypto = require('crypto');

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

function hashPassword(password, salt) {
  const hash = crypto.createHmac('sha256', salt);
  hash.update(password);
  return hash.digest('hex');
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

  const { action, username, password, displayName } = req.body || {};

  if (!action || !username || !password) {
    return res.status(400).json({ error: 'Missing required fields: action, username, password' });
  }

  const cleanUser = String(username).trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(cleanUser)) {
    return res.status(400).json({ error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores.' });
  }

  try {
    if (action === 'register') {
      let existingUser = null;
      try {
        const rows = await supabaseRequest(`basement_fitness_sync?username=eq.${cleanUser}`, 'GET');
        existingUser = rows[0] || null;
      } catch (e) {
        if (e.message === 'SUPABASE_NOT_CONFIGURED') {
          return res.status(503).json({ error: 'Supabase Database not configured. Please add SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY to your Vercel project environment settings.' });
        }
        throw e;
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken.' });
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = hashPassword(password, salt);

      const initialData = {
        profile: { goal: 'general', durationMin: 30, equipment: ['bodyweight'], username: String(displayName || cleanUser).trim() },
        primaryGoal: null,
        secondaryGoal: null,
        plan: { generatedAt: null, days: [] },
        routines: [],
        sessions: []
      };

      await supabaseRequest('basement_fitness_sync', 'POST', {
        username: cleanUser,
        display_name: String(displayName || cleanUser).trim(),
        salt,
        password_hash: hashedPassword,
        data: initialData
      });

      return res.status(200).json({
        success: true,
        user: { username: cleanUser, displayName: String(displayName || cleanUser).trim() },
        data: initialData
      });
    }

    if (action === 'login') {
      let userRecord = null;
      try {
        const rows = await supabaseRequest(`basement_fitness_sync?username=eq.${cleanUser}`, 'GET');
        userRecord = rows[0] || null;
      } catch (e) {
        if (e.message === 'SUPABASE_NOT_CONFIGURED') {
          return res.status(503).json({ error: 'Supabase Database not configured. Please add SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY to your Vercel project environment settings.' });
        }
        throw e;
      }

      if (!userRecord) {
        return res.status(400).json({ error: 'Invalid username or password.' });
      }

      const hash = hashPassword(password, userRecord.salt);
      if (hash !== userRecord.password_hash) {
        return res.status(400).json({ error: 'Invalid username or password.' });
      }

      return res.status(200).json({
        success: true,
        user: { username: userRecord.username, displayName: userRecord.display_name },
        data: userRecord.data
      });
    }

    return res.status(400).json({ error: 'Invalid action. Must be register or login.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};
