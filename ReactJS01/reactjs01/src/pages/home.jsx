import { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Input, Select, Button } from "antd";
import { CrownOutlined, SearchOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const HomePage = () => {
  const [songs, setSongs] = useState([]);
  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    artist: "",
  });

  // Gọi API search hoặc lấy tất cả
  const fetchSongs = () => {
    const query = new URLSearchParams(filters).toString();

    fetch(`http://localhost:8888/v1/api/search?${query}`)
      .then((res) => res.json())
      .then((data) => setSongs(data))
      .catch((err) => console.error("Lỗi fetch songs:", err));
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // Gom nhóm theo category_name (đảm bảo backend trả về field này)
  const categories = songs.reduce((acc, song) => {
    const cat = song.category_name || song.category || "Khác";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(song);
    return acc;
  }, {});

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>
        <CrownOutlined /> Tìm kiếm & Lọc bài hát
      </Title>

      {/* Form tìm kiếm + lọc */}
      <div style={{ marginBottom: 20, display: "flex", gap: "10px" }}>
        <Input
          placeholder="Tìm kiếm theo tên bài hát..."
          prefix={<SearchOutlined />}
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          style={{ width: 250 }}
        />

        <Select
          placeholder="Danh mục"
          value={filters.category}
          onChange={(val) => setFilters({ ...filters, category: val })}
          style={{ width: 150 }}
          allowClear
        >
          <Option value="Pop">Pop</Option>
          <Option value="Rock">Rock</Option>
          <Option value="Rap">Rap</Option>
        </Select>

        <Input
          placeholder="Artist"
          value={filters.artist}
          onChange={(e) => setFilters({ ...filters, artist: e.target.value })}
          style={{ width: 200 }}
        />

        <Button type="primary" onClick={fetchSongs}>
          Lọc
        </Button>
      </div>

      {/* Hiển thị kết quả theo danh mục */}
      {Object.keys(categories).map((cat) => (
        <div key={cat} style={{ marginBottom: 30 }}>
          <Title level={3}>{cat}</Title>
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
      ))}
    </div>
  );
};

export default HomePage;
