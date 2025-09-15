import React, { useContext, useState, useEffect } from 'react';
import { UsergroupAddOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Dùng để lấy đường dẫn hiện tại
  const { auth, setAuth } = useContext(AuthContext);

  // Đặt key mặc định dựa trên đường dẫn hiện tại
  const [current, setCurrent] = useState(() => {
    switch (location.pathname) {
      case '/':
        return 'home';
      case '/user':
        return 'user';
      case '/login':
        return 'login';
      default:
        return 'home';
    }
  });

  // Cập nhật key khi đường dẫn thay đổi
  useEffect(() => {
    switch (location.pathname) {
      case '/':
        setCurrent('home');
        break;
      case '/user':
        setCurrent('user');
        break;
      case '/login':
        setCurrent('login');
        break;
      default:
        setCurrent('home');
    }
  }, [location.pathname]);

  const items = [
    {
      label: <Link to="/">Home Page</Link>,
      key: 'home',
      icon: <HomeOutlined />,
    },
    ...(auth.isAuthenticated
      ? [
          {
            label: <Link to="/user">User</Link>,
            key: 'user',
            icon: <UsergroupAddOutlined />,
          },
        ]
      : []),
    {
      label: (
        <span
          style={{
            maxWidth: 200, // Giới hạn chiều rộng của email
            overflow: 'hidden',
            textOverflow: 'ellipsis', // Thêm dấu ... nếu email quá dài
            whiteSpace: 'nowrap',
          }}
        >
          Welcome {auth?.user?.email ?? 'Guest'}
        </span>
      ),
      key: 'submenu',
      icon: <SettingOutlined />,
      children: [
        ...(auth.isAuthenticated
          ? [
              {
                label: (
                  <span
                    onClick={() => {
                      localStorage.removeItem('access_token'); // Sửa clear toàn bộ thành xóa access_token
                      setAuth({
                        isAuthenticated: false,
                        user: {
                          email: '',
                          name: '',
                        },
                      });
                      navigate('/');
                    }}
                  >
                    Đăng xuất
                  </span>
                ),
                key: 'logout',
              },
            ]
          : [
              {
                label: <Link to="/login">Đăng nhập</Link>,
                key: 'login',
              },
            ]),
      ],
    },
  ];

  const onClick = (e) => {
    setCurrent(e.key);
  };

  return (
    <Menu
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      style={{
        position: 'sticky', // Hoặc 'fixed' tùy thuộc vào bố cục
        top: 0,
        zIndex: 1000,
        width: '100%',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
      }}
      items={items}
    />
  );
};

export default Header;