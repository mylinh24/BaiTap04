import { useEffect, useState, useContext } from "react";
import { Card, Row, Col, Typography, Button, message, Tabs, List, Avatar } from "antd";
import { HeartFilled, PlayCircleOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/auth.context";
import { getFavoritesApi, getListenedApi, removeFavoriteApi } from "../util/api";

const { Title } = Typography;
const { TabPane } = Tabs;

const UserPage = () => {
  const { auth } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [listened, setListened] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchData();
    }
  }, [auth.isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [favRes, listenRes] = await Promise.all([getFavoritesApi(), getListenedApi()]);
      setFavorites(favRes);
      setListened(listenRes);
    } catch (error) {
      message.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (songId) => {
    try {
      await removeFavoriteApi(songId);
      setFavorites(prev => prev.filter(f => f.id !== songId));
      message.success("Đã xóa khỏi yêu thích");
    } catch (error) {
      message.error("Lỗi xóa yêu thích");
    }
  };

  if (!auth.isAuthenticated) {
    return <div>Vui lòng đăng nhập để xem trang này.</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>Trang cá nhân</Title>
      <Tabs defaultActiveKey="favorites">
        <TabPane tab="Bài hát yêu thích" key="favorites">
          <Row gutter={[16, 16]}>
            {favorites.map(song => (
              <Col xs={24} sm={12} md={8} lg={6} key={song.id}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={song.title}
                      src={song.image_url || "/fallback-image.jpg"}
                      loading="lazy"
                      style={{
                        height: 200,
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  }
                  actions={[
                    <Button type="link" onClick={() => handleRemoveFavorite(song.id)}>Xóa</Button>
                  ]}
                >
                  <Card.Meta title={song.title} description={song.artist} />
                  <p>Lượt nghe: {song.listener_count || 0}</p>
                  <audio
                    controls
                    style={{ marginTop: 10, width: "100%" }}
                    preload="none"
                  >
                    <source src={song.audio_url} type="audio/mp3" />
                  </audio>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
        <TabPane tab="Lịch sử nghe" key="history">
          <List
            dataSource={listened}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar src={item.image_url} />}
                  title={item.title}
                  description={`${item.artist} - Nghe lúc: ${new Date(item.listened_at).toLocaleString()}`}
                />
                <audio
                  controls
                  style={{ width: 300 }}
                  preload="none"
                >
                  <source src={item.audio_url} type="audio/mp3" />
                </audio>
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default UserPage;
