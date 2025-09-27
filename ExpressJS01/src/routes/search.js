const express = require("express");
const router = express.Router();
const esClient = require("../elasticsearch");

router.get("/", async (req, res) => {
  const { keyword, category, artist, page = 1, size = 10 } = req.query;

  try {
    const must = [];

    if (keyword) {
      if (keyword.length <= 2) { 
        must.push({
          wildcard: {
            title: {
              value: `*${keyword.toLowerCase()}*`,
              case_insensitive: true,
            },
          },
        });
      } else {
        must.push({
          match: {
            title: {
              query: keyword,
              fuzziness: "AUTO",
              operator: "or",
            },
          },
        });
      }
    }

  
    if (artist) {
      if (artist.length <= 2) { 
        must.push({
          wildcard: {
            artist: {
              value: `*${artist.toLowerCase()}*`,
              case_insensitive: true,
            },
          },
        });
      } else {
        must.push({
          match: {
            artist: {
              query: artist,
              fuzziness: "AUTO",
              operator: "or",
            },
          },
        });
      }
    }

    // Giữ nguyên category
    if (category) {
      must.push({
        match: {
          category_name: category,
        },
      });
    }

    const query = must.length > 0 ? { bool: { must } } : { match_all: {} };

    const from = (parseInt(page, 10) - 1) * (size || 10);
    const searchSize = size ? Math.min(parseInt(size, 10), 10000) : 10;

    console.log("Elasticsearch Query:", { index: "songs", from, size: searchSize, query });
    const result = await esClient.search({
      index: "songs",
      from: from,
      size: searchSize,
      query: query,
      sort: [{ id: { order: "asc" } }],
    });
    const hits = result.hits.hits.map((h) => h._source);
    const total = result.hits.total.value;

    console.log("Elasticsearch Result - Page", page, ":", { 
      total, 
      hitsLength: hits.length, 
      hits: hits.slice(0, 5) // Log 5 kết quả đầu để debug
    });

    if (hits.length === 0) {
      return res.json({ message: "Không tìm thấy kết quả nào" });
    }

    res.json({
      total: total,
      page: parseInt(page, 10),
      size: searchSize,
      data: hits,
    });
  } catch (err) {
    console.error("Elasticsearch search error:", err.meta?.body || err.message);
    res.status(500).json({ error: "Search failed", details: err.message });
  }
});

module.exports = router;