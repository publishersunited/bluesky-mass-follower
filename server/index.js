const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { BskyAgent } = require('@atproto/api');

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

function clean(input) {
  return typeof input === 'string' ? input.trim().replace(/[\u200B-\u200D\uFEFF]/g, '') : input;
}

app.post('/follow-all', async (req, res) => {
  const identifier = clean(req.body.identifier);
  const appPassword = clean(req.body.appPassword);
  const targetHandle = clean(req.body.targetHandle);

  console.log('🔍 Received login request:');
  console.log('Identifier:', identifier);
  console.log('Password:', appPassword);
  console.log('Target handle:', targetHandle);

  const agent = new BskyAgent({ service: 'https://bsky.social' });

  try {
    await agent.login({ identifier, password: appPassword });

    const profile = await agent.getProfile({ actor: targetHandle });
    const targetDid = profile.data.did;

    const followers = await agent.getFollowers({ actor: targetDid, limit: 100 });

    for (const follower of followers.data.followers) {
      try {
        await agent.follow(follower.did);
        console.log(`✅ Followed ${follower.handle}`);
      } catch (err) {
        console.error(`⚠️ Failed to follow ${follower.handle}:`, err.message);
      }
    }

    res.json({ success: true, followed: followers.data.followers.length });
  } catch (err) {
    console.error('❌ Login or fetch failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
