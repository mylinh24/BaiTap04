const songController = require('./controllers/song.controller');
const connection = require('./config/database');
const elasticClient = require('./config/elasticConfig');

// Simple script to reindex all songs with listener_count
async function reindexAllSongs() {
  try {
    const req = {}; // Mock req
    const res = {
      json: (data) => console.log('Reindex completed:', data.length, 'songs')
    };
    await songController.getAllSongs(req, res);
    console.log('✅ All songs reindexed successfully.');
  } catch (error) {
    console.error('❌ Reindex failed:', error.message);
  }
}

reindexAllSongs();
