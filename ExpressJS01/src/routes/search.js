const express = require("express");
const router = express.Router();
const esClient = require("../elasticsearch");

router.get("/", async (req, res) => {
  const { keyword, category, artist, page = 1, size = 10 } = req.query; // Giữ size mặc định, nhưng có thể bỏ nếu không cần

  try {
    const must = [];

    if (keyword) {
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

    if (category) {
      must.push({
        match: {
          category_name: category,
        },
      });
    }

    if (artist) {
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

    const query = must.length > 0 ? { bool: { must } } : { match_all: {} };

    const from = (parseInt(page, 10) - 1) * (size || 10); // Sử dụng size từ query, mặc định 10
    const searchSize = size ? Math.min(parseInt(size, 10), 10000) : 10; // Giới hạn tối đa 10,000

    console.log("Elasticsearch Query:", { index: "songs", from, size: searchSize, query });
    const result = await esClient.search({
      index: "songs",
      from: from,
      size: searchSize,
      query: query,
      sort: [{ id: { order: "asc" } }], // Sắp xếp theo id tăng dần
    });
    const hits = result.hits.hits.map((h) => h._source);
    const total = result.hits.total.value;

    console.log("Elasticsearch Result - Page", page, ":", { total, hitsLength: hits.length });

    if (hits.length === 0) {
      return res.json({ message: "Không tìm thấy kết quả nào" });
    }

    res.json({
      total: total,
      page: parseInt(page, 10),
      size: searchSize, // Trả về size thực tế
      data: hits,
    });
  } catch (err) {
    console.error("Elasticsearch search error:", err.meta?.body || err.message);
    res.status(500).json({ error: "Search failed", details: err.message });
  }
});

module.exports = router;