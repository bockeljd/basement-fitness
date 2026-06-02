const crypto = require('crypto');

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
      let existingUser;
      try {
        const raw = await kvRequest(['GET', `user:${cleanUser}`]);
        existingUser = raw ? JSON.parse(raw) : null;
      } catch (e) {
        if (e.message === 'KV_NOT_CONFIGURED') {
          return res.status(503).json({ error: 'Vercel KV Database not configured. Please link a KV database to this project in the Vercel Dashboard under the Storage tab.' });
        }
        throw e;
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken.' });
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = hashPassword(password, salt);

      const newUser = {
        username: cleanUser,
        displayName: String(displayName || cleanUser).trim(),
        salt,
        hashedPassword,
        createdAt: new Date().toISOString()
      };

      await kvRequest(['SET', `user:${cleanUser}`, JSON.stringify(newUser)]);

      const initialData = {
        profile: { goal: 'general', durationMin: 30, equipment: ['bodyweight'], username: newUser.displayName },
        primaryGoal: null,
        secondaryGoal: null,
        plan: { generatedAt: null, days: [] },
        routines: [],
        sessions: []
      };
      await kvRequest(['SET', `data:${cleanUser}`, JSON.stringify(initialData)]);

      return res.status(200).json({
        success: true,
        user: { username: newUser.username, displayName: newUser.displayName },
        data: initialData
      });
    }

    if (action === 'login') {
      let userRecord;
      try {
        const raw = await kvRequest(['GET', `user:${cleanUser}`]);
        userRecord = raw ? JSON.parse(raw) : null;
      } catch (e) {
        if (e.message === 'KV_NOT_CONFIGURED') {
          return res.status(503).json({ error: 'Vercel KV Database not configured. Please link a KV database to this project in the Vercel Dashboard under the Storage tab.' });
        }
        throw e;
      }

      if (!userRecord) {
        return res.status(400).json({ error: 'Invalid username or password.' });
      }

      const hash = hashPassword(password, userRecord.salt);
      if (hash !== userRecord.hashedPassword) {
        return res.status(400).json({ error: 'Invalid username or password.' });
      }

      const dataRaw = await kvRequest(['GET', `data:${cleanUser}`]);
      const userData = dataRaw ? JSON.parse(dataRaw) : null;

      return res.status(200).json({
        success: true,
        user: { username: userRecord.username, displayName: userRecord.displayName },
        data: userData
      });
    }

    return res.status(400).json({ error: 'Invalid action. Must be register or login.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};
