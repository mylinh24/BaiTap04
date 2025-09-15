import { Outlet } from "react-router-dom";
import Header from "./layout/header.jsx";
import axios from "./util/axios.customize.js";
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/auth.context";
import { Spin } from "antd";

function App() {
  const { setAuth, appLoading, setAppLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchAccount = async () => {
      setAppLoading(true);
      try {
        const res = await axios.get("/v1/api/user");
        if (res && res.message) {
          setAuth({
            isAuthenticated: true,
            user: {
              email: res.email,
              name: res.name,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching account:", error);
      } finally {
        setAppLoading(false);
      }
    };

    fetchAccount();
  }, [setAuth, setAppLoading]);

  return (
    <div
      style={{
        height: "100vh", // Đảm bảo container chiếm toàn bộ chiều cao
        overflow: "hidden", // Ngăn thanh cuộn
        display: "flex",
        flexDirection: "column", // Sắp xếp Header và Outlet theo cột
      }}
    >
      {appLoading ? (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Spin />
        </div>
      ) : (
        <>
          <Header />
          <div
            style={{
              flex: 1, // Outlet chiếm phần còn lại của chiều cao
              overflow: "hidden", // Ngăn thanh cuộn trong container này
            }}
          >
            <Outlet />
          </div>
        </>
      )}
    </div>
  );
}

export default App;