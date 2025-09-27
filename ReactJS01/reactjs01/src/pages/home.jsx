import { useEffect, useState, useCallback, useRef, useContext } from "react"; // Thêm useRef, useContext
import { Card, Row, Col, Typography, Input, Select, Button, message, Modal, List, Avatar, Form, Tooltip } from "antd";
import { CrownOutlined, SearchOutlined, HeartOutlined, HeartFilled, CommentOutlined, ShareAltOutlined, PlayCircleOutlined } from "@ant-design/icons";
import InfiniteScroll from "react-infinite-scroll-component";
import { AuthContext } from "../context/auth.context";
import { addFavoriteApi, removeFavoriteApi, getFavoritesApi, addListenApi, getListenCountApi, getSimilarSongsApi, addCommentApi, getCommentsApi, deleteCommentApi, getSearchApi } from "../util/api";

const { Title } = Typography;
const { Option } = Select;

const HomePage = () => {
  const { auth } = useContext(AuthContext);
  const [songs, setSongs] = useState([]);
  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    artist: "",
    page: 1,
    size: 20,
  });
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userFavorites, setUserFavorites] = useState(new Set());
  const [listenCounts, setListenCounts] = useState({});
  const [commentsModal, setCommentsModal] = useState({ visible: false, songId: null, comments: [] });
  const [similarVisible, setSimilarVisible] = useState({});
  const [commentForm] = Form.useForm();

  // Ref để giữ focus cho input
  const keywordInputRef = useRef(null);
  const artistInputRef = useRef(null);

  // Custom debounce function
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Tách hàm fetch để tái sử dụng
  const fetchSongs = async (currentFilters) => {
    setLoading(true);

    console.log("🔍 Fetching with filters:", currentFilters);

    try {
      const data = await getSearchApi(currentFilters);

      console.log("📊 API Response:", data);

      if (!data.data || data.data.length === 0) {
        console.log("⚠️ No data returned from API");
        setSongs([]);
        setTotal(0);
        if (currentFilters.page === 1) {
          message.info("Không tìm thấy bài hát. Hãy thử từ khóa hoặc nghệ sĩ khác!");
        }
        setHasMore(false);
        setLoading(false);
        return;
      }

      setSongs((prevSongs) => {
        const existingIds = new Set(prevSongs.map((song) => song.id));
        const newSongs = data.data.filter((song) => !existingIds.has(song.id));
        console.log("➕ New Songs:", newSongs.length);
        return [...prevSongs, ...newSongs];
      });

      setTotal(data.total || data.data.length);
      if (data.data.length < currentFilters.size || songs.length + data.data.length >= data.total) {
        setHasMore(false);
        console.log("✅ No more data to load");
      }
    } catch (err) {
      console.error("❌ Error fetching songs:", err);
      message.error(`Lỗi tải dữ liệu: ${err.message}`);
      setHasMore(false);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced fetch songs
  const debouncedFetchSongs = useCallback(debounce(fetchSongs, 300), []);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [key]: value,
        page: 1,
      };
      setSongs([]);
      setHasMore(true);
      debouncedFetchSongs(newFilters);
      return newFilters;
    });
  }, [debouncedFetchSongs]);

  // Handle manual search (Enter hoặc nút Lọc)
  const handleSearch = useCallback(() => {
    fetchSongs(filters);
    // Giữ focus cho input sau khi search
    if (filters.keyword) keywordInputRef.current?.focus();
    else if (filters.artist) artistInputRef.current?.focus();
  }, [filters]);

  // Load more songs for infinite scroll
  const loadMoreSongs = useCallback(() => {
    if (!loading && hasMore) {
      setFilters((prev) => {
        const newFilters = { ...prev, page: prev.page + 1 };
        fetchSongs(newFilters); // Gọi fetch trực tiếp cho infinite scroll
        return newFilters;
      });
    }
  }, [loading, hasMore]);

  // Generate categories
  const categories = songs.reduce((acc, song) => {
    if (!song || typeof song !== "object") return acc;
    const cat = song.category_name || "Khác";
    acc[cat] = acc[cat] || [];
    acc[cat].push(song);
    return acc;
  }, {});

  // Log categories for debugging
  useEffect(() => {
    console.log("Categories:", Object.keys(categories), "Total Songs:", songs.length);
  }, [categories]);

  // Load initial data
  useEffect(() => {
    fetchSongs(filters); // Chỉ gọi 1 lần khi component mount
  }, []); // Không phụ thuộc filters

  // Load user favorites
  useEffect(() => {
    if (auth.isAuthenticated) {
      getFavoritesApi().then(res => {
        const favIds = new Set(res.map(f => f.id));
        setUserFavorites(favIds);
      }).catch(() => {});
    } else {
      setUserFavorites(new Set());
    }
  }, [auth.isAuthenticated]);

  // Update listen counts from songs
  useEffect(() => {
    const counts = {};
    songs.forEach(song => {
      counts[song.id] = song.listener_count || 0;
    });
    setListenCounts(counts);
  }, [songs]);

  // Handlers
  const handleListen = async (songId) => {
    if (!auth.isAuthenticated) return;
    try {
      await addListenApi(songId);
      setListenCounts(prev => ({ ...prev, [songId]: (prev[songId] || 0) + 1 }));
    } catch (error) {
      console.error("Error adding listen:", error);
    }
  };

  const handleFavorite = async (songId) => {
    if (!auth.isAuthenticated) {
      message.warning("Vui lòng đăng nhập để thêm yêu thích");
      return;
    }
    try {
      if (userFavorites.has(songId)) {
        await removeFavoriteApi(songId);
        setUserFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(songId);
          return newSet;
        });
        message.success("Đã xóa khỏi yêu thích");
      } else {
        await addFavoriteApi(songId);
        setUserFavorites(prev => new Set(prev).add(songId));
        message.success("Đã thêm vào yêu thích");
      }
    } catch (error) {
      message.error("Lỗi cập nhật yêu thích");
    }
  };

  const showComments = async (songId) => {
    try {
      const res = await getCommentsApi(songId);
      setCommentsModal({ visible: true, songId, comments: res });
    } catch (error) {
      message.error("Lỗi tải bình luận");
    }
  };

  const handleCommentSubmit = async (values) => {
    try {
      await addCommentApi(commentsModal.songId, values.comment);
      const res = await getCommentsApi(commentsModal.songId);
      setCommentsModal(prev => ({ ...prev, comments: res }));
      commentForm.resetFields();
      message.success("Đã thêm bình luận");
    } catch (error) {
      message.error("Lỗi thêm bình luận");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteCommentApi(commentId);
      setCommentsModal(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c.id !== commentId)
      }));
      message.success("Đã xóa bình luận");
    } catch (error) {
      message.error("Lỗi xóa bình luận");
    }
  };

  const toggleSimilar = async (songId) => {
    if (similarVisible[songId]) {
      setSimilarVisible(prev => ({ ...prev, [songId]: false }));
    } else {
      try {
        const res = await getSimilarSongsApi(songId);
        setSimilarVisible(prev => ({ ...prev, [songId]: res }));
      } catch (error) {
        message.error("Lỗi tải bài hát tương tự");
      }
    }
  };

  return (
    <div
      id="scrollableDiv"
      style={{
        padding: 20,
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Title level={2}>
        <CrownOutlined /> Tìm kiếm & Lọc bài hát
      </Title>
      <div style={{ marginBottom: 20, display: "flex", gap: "10px" }}>
        <Input
          ref={keywordInputRef} // Gắn ref
          placeholder="Tìm kiếm theo tên bài hát..."
          prefix={<SearchOutlined />}
          value={filters.keyword}
          onChange={(e) => handleFilterChange("keyword", e.target.value)}
          onPressEnter={handleSearch} // Search khi nhấn Enter
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
          ref={artistInputRef} // Gắn ref
          placeholder="Nghệ sĩ"
          prefix={<SearchOutlined />}
          value={filters.artist}
          onChange={(e) => handleFilterChange("artist", e.target.value)}
          onPressEnter={handleSearch} // Search khi nhấn Enter
          style={{ width: 250 }}
          disabled={loading}
        />
        <Button
          type="primary"
          onClick={handleSearch} // Gọi search trực tiếp
          loading={loading}
        >
          Lọc
        </Button>
      </div>
      <InfiniteScroll
        dataLength={songs.length}
        next={loadMoreSongs}
        hasMore={hasMore}
        loader={<p style={{ textAlign: "center" }}>Đang tải thêm...</p>}
        endMessage={<p style={{ textAlign: "center" }}>Đã tải hết</p>}
        scrollableTarget="scrollableDiv"
      >
        {Object.keys(categories).length > 0 ? (
          Object.keys(categories).map((cat) => (
            <div key={cat} style={{ marginBottom: 30 }}>
              <Title level={3}>
                {cat} ({categories[cat].length})
              </Title>
              <Row gutter={[16, 16]}>
                {categories[cat].map((song) => (
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
                        auth.isAuthenticated ? (
                          <Tooltip title={userFavorites.has(song.id) ? "Xóa yêu thích" : "Thêm yêu thích"}>
                            {userFavorites.has(song.id) ? <HeartFilled style={{ color: 'red' }} onClick={() => handleFavorite(song.id)} /> : <HeartOutlined onClick={() => handleFavorite(song.id)} />}
                          </Tooltip>
                        ) : null,
                        <Tooltip title="Bình luận">
                          <CommentOutlined onClick={() => showComments(song.id)} />
                        </Tooltip>,
                        <Tooltip title="Bài hát tương tự">
                          <ShareAltOutlined onClick={() => toggleSimilar(song.id)} />
                        </Tooltip>,
                      ]}
                    >
                      <Card.Meta title={song.title} description={song.artist} />
                      <p>Lượt nghe: {listenCounts[song.id] || 0}</p>
                      <audio
                        controls
                        style={{ marginTop: 10, width: "100%" }}
                        preload="none"
                        onPlay={() => handleListen(song.id)}
                      >
                        <source src={song.audio_url} type="audio/mp3" />
                      </audio>
                    </Card>
                    {similarVisible[song.id] && (
                      <div style={{ marginTop: 10 }}>
                        <Title level={5}>Bài hát tương tự</Title>
                        <Row gutter={[8, 8]}>
                          {similarVisible[song.id].map(s => (
                            <Col span={24} key={s.id}>
                              <Card size="small">
                                <Card.Meta title={s.title} description={s.artist} />
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
                  </Col>
                ))}
              </Row>
            </div>
          ))
        ) : (
          <p>{loading ? "Đang tải..." : "Không tìm thấy kết quả nào"}</p>
        )}
      </InfiniteScroll>
      <Modal
        title="Bình luận"
        visible={commentsModal.visible}
        onCancel={() => setCommentsModal({ visible: false, songId: null, comments: [] })}
        footer={null}
      >
        <List
          dataSource={commentsModal.comments || []}
          renderItem={item => (
            <List.Item
              actions={auth.isAuthenticated && auth.user.email === (item.user_email || item.user_name) ? [<Button type="link" onClick={() => handleDeleteComment(item.id)}>Xóa</Button>] : []}
            >
              <List.Item.Meta
                avatar={<Avatar>{(item.user_email || item.user_name || 'U')[0].toUpperCase()}</Avatar>}
                title={item.user_email || item.user_name || 'Unknown User'}
                description={item.comment}
              />
            </List.Item>
          )}
        />
        {auth.isAuthenticated && (
          <Form form={commentForm} onFinish={handleCommentSubmit}>
            <Form.Item name="comment" rules={[{ required: true, message: 'Vui lòng nhập bình luận' }]}>
              <Input.TextArea rows={3} placeholder="Thêm bình luận..." />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Gửi</Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default HomePage;
