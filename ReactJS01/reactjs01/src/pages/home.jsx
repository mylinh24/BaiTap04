import { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Input, Select, Button } from "antd";
import { CrownOutlined, SearchOutlined } from "@ant-design/icons";
import InfiniteScroll from "react-infinite-scroll-component";

const { Title } = Typography;
const { Option } = Select;

const HomePage = () => {
  const [songs, setSongs] = useState([]);
  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    artist: "",
    page: 1,
    size: 50,
  });
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchSongs = async () => {
    setLoading(true);
    const query = new URLSearchParams({
      ...filters,
      page: filters.page,
      size: filters.size,
    }).toString();

    try {
      const response = await fetch(`http://localhost:8888/v1/api/search?${query}`);
      const data = await response.json();
      console.log("API Response - Page", filters.page, ":", data);
      const newSongs = data.data || [];

      const existingIds = new Set(songs.map((song) => song.id));
      const uniqueNewSongs = newSongs.filter((song) => !existingIds.has(song.id));
      console.log("New Songs - Page", filters.page, ":", uniqueNewSongs);

      setSongs((prevSongs) => [...prevSongs, ...uniqueNewSongs]);
      setTotal(data.total || 0);

      const loadedCount = prevSongs.length + uniqueNewSongs.length;
      if (loadedCount >= data.total || newSongs.length === 0) {
        setHasMore(false);
      } else {
        setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
      }
    } catch (err) {
      console.error("Lỗi fetch songs:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSongs([]);
    setFilters((prev) => ({ ...prev, page: 1 }));
    setHasMore(true);
    fetchSongs();
  }, [filters.keyword, filters.category, filters.artist]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const categories = songs.reduce((acc, song) => {
    if (!song || typeof song !== "object") return acc;
    const cat = song.category_name || "Khác";
    if (!acc[cat]) acc[cat] = [];
    if (!acc[cat].some((s) => s.id === song.id)) {
      acc[cat].push(song);
    }
    return acc;
  }, {});

  useEffect(() => {
    console.log("Categories:", Object.keys(categories), "Total Songs:", songs.length);
  }, [categories]);

  return (
    <div id="scrollableDiv" style={{ padding: 20 }}>
      <Title level={2}>
        <CrownOutlined /> Tìm kiếm & Lọc bài hát
      </Title>
      <div style={{ marginBottom: 20, display: "flex", gap: "10px" }}>
        <Input
          placeholder="Tìm kiếm theo tên bài hát..."
          prefix={<SearchOutlined />}
          value={filters.keyword}
          onChange={(e) => handleFilterChange("keyword", e.target.value)}
          style={{ width: 250 }}
          disabled={loading}
        />
        <Select
          placeholder="Danh mục"
          value={filters.category}
          onChange={(val) => handleFilterChange("category", val)}
          style={{ width: 150 }}
          allowClear
          disabled={loading}
        >
          <Option value="Pop">Pop</Option>
          <Option value="Rock">Rock</Option>
          <Option value="Ballad">Ballad</Option>
          <Option value="Hip Hop">Hip Hop</Option>
          <Option value="Khác">Khác</Option>
        </Select>
        <Input
          placeholder="Artist"
          prefix={<SearchOutlined />}
          value={filters.artist}
          onChange={(e) => handleFilterChange("artist", e.target.value)}
          style={{ width: 250 }}
          disabled={loading}
        />
        <Button type="primary" onClick={fetchSongs} loading={loading}>
          Lọc
        </Button>
      </div>
      <InfiniteScroll
        dataLength={songs.length}
        next={fetchSongs}
        hasMore={hasMore}
        loader={<p style={{ textAlign: "center" }}>Đang tải thêm...</p>}
        endMessage={<p style={{ textAlign: "center" }}>Đã tải hết</p>}
        scrollableTarget="scrollableDiv"
      >
        {Object.keys(categories).length > 0 ? (
          Object.keys(categories).map((cat) => (
            <div key={cat} style={{ marginBottom: 30 }}>
              <Title level={3}>{cat} ({categories[cat].length})</Title>
              <Row gutter={[16, 16]}>
                {categories[cat].map((song) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={song.id}>
                    <Card
                      hoverable
                      cover={<img alt={song.title} src={song.image_url} />}
                    >
                      <Card.Meta title={song.title} description={song.artist} />
                      <audio controls style={{ marginTop: 10, width: "100%" }}>
                        <source src={song.audio_url} type="audio/mp3" />
                      </audio>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ))
        ) : (
          <p>{loading ? "Đang tải..." : "Không tìm thấy kết quả nào"}</p>
        )}
      </InfiniteScroll>
    </div>
  );
};

export default HomePage;