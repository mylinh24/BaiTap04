import { useEffect, useState, useCallback, useRef } from "react"; // Thêm useRef
import { Card, Row, Col, Typography, Input, Select, Button, message } from "antd";
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
    size: 20,
  });
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

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
    const query = new URLSearchParams({
      ...currentFilters,
      page: currentFilters.page,
      size: currentFilters.size,
    }).toString();

    console.log("🔍 Fetching with filters:", currentFilters);
    console.log("📡 API URL:", `http://localhost:8888/v1/api/search?${query}`);

    try {
      const response = await fetch(`http://localhost:8888/v1/api/search?${query}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

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
  const debouncedFetchSongs = useCallback(debounce(fetchSongs, 300), [songs.length]);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
    setSongs([]);
    setHasMore(true);
  }, []);

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
                    >
                      <Card.Meta title={song.title} description={song.artist} />
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