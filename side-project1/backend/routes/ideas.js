const express = require('express');
const router = express.Router();
const Redis = require('ioredis');

const redis = new Redis();

// Helper function to parse idea from Redis
const parseIdea = (data) => ({
  id: data.id,
  text: data.text,
  upvotes: parseInt(data.upvotes, 10),
  downvotes: parseInt(data.downvotes, 10),
});

// Get all ideas
router.get('/', async (req, res) => {
  try {
    const keys = await redis.keys('idea:*');
    const ideas = await Promise.all(keys.map(async (key) => {
      const idea = await redis.hgetall(key);
      return parseIdea(idea);
    }));
    res.json(ideas);
  } catch (err) {
    console.error('Error fetching ideas:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new idea
router.post('/', async (req, res) => {
  const id = Date.now().toString(); // Simple unique ID based on timestamp
  const idea = {
    id,
    text: req.body.text,
    upvotes: '0',
    downvotes: '0',
  };
  try {
    await redis.hmset(`idea:${id}`, idea);
    res.status(201).json(idea);
  } catch (err) {
    console.error('Error creating idea:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upvote an idea
router.patch('/:id/upvote', async (req, res) => {
  const id = req.params.id;
  try {
    await redis.hincrby(`idea:${id}`, 'upvotes', 1);
    const idea = await redis.hgetall(`idea:${id}`);
    res.json(parseIdea(idea));
  } catch (err) {
    console.error('Error upvoting idea:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Downvote an idea
router.patch('/:id/downvote', async (req, res) => {
  const id = req.params.id;
  try {
    await redis.hincrby(`idea:${id}`, 'downvotes', 1);
    const idea = await redis.hgetall(`idea:${id}`);
    res.json(parseIdea(idea));
  } catch (err) {
    console.error('Error downvoting idea:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
