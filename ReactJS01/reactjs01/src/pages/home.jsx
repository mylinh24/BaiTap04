import { useEffect, useState } from "react";
import { Card, Row, Col, Typography } from "antd";
import { CrownOutlined } from "@ant-design/icons";

const { Title } = Typography;

const HomePage = () => {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8888/v1/api/songs/with-category") // đổi port nếu cần
      .then((res) => res.json())
      .then((data) => setSongs(data))
      .catch((err) => console.error(" Lỗi fetch songs:", err));
  }, []);

  // Nhóm bài hát theo category
  const categories = songs.reduce((acc, song) => {
    if (!acc[song.category_name]) {
      acc[song.category_name] = [];
    }
    acc[song.category_name].push(song);
    return acc;
  }, {});

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>
        <CrownOutlined /> Danh mục & Bài hát
      </Title>

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
                  <Card.Meta
                    title={song.title}
                    description={song.artist}
                  />
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
