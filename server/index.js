const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { BskyAgent } = require('@atproto/api');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

app.post('/follow-all', async (req, res) => {
  const { identifier, appPassword, targetHandle } = req.body;

  if (!identifier || !appPassword || !targetHandle) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const agent = new BskyAgent({ service: 'https://bsky.social' });
    await agent.login({ identifier, password: appPassword });

    const targetProfile = await agent.getProfile({ actor: targetHandle });
    const followers = await agent.getFollowers({ actor: targetProfile.data.did });

    for (const follower of followers.data.followers) {
      try {
        await agent.follow(follower.did);
      } catch (err) {
        console.error(`Failed to follow ${follower.handle}`);
      }
    }

    res.json({ success: true, followedCount: followers.data.followers.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
