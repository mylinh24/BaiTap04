const express = require("express"); 
const router = express.Router();
const esClient = require("../elasticsearch");

router.get("/", async (req, res) => {
  const { keyword, category, artist } = req.query;

  try {
    const must = [];

    if (keyword) {
      must.push({
        match: {
          title: {
            query: keyword,
            fuzziness: "AUTO",
            operator: "and"
          },
        },
      });
    }

    if (category) {
      must.push({ match: { category } });
    }

    if (artist) {
      must.push({ match: { artist } });
    }

    const result = await esClient.search({
      index: "songs",
      query: {
        bool: { must },
      },
    });

    const hits = result.hits.hits.map((h) => h._source);

    res.json(hits);
  } catch (err) {
    console.error("Elasticsearch search error:", err.meta?.body || err.message);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;
