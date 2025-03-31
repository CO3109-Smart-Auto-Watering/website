import React from 'react';
import { useEffect, useState } from 'react';
import { Space, Table, Tag } from 'antd';
import { FaMagnifyingGlass } from 'react-icons/fa6';


const API_URL = process.env.REACT_APP_API_URL


const columns = [
  {
    title: 'Username',
    dataIndex: 'username',
    key: 'username',
    width: 250,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: 400,
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
    render: (role) => (
      <Tag color={role === "admin" ? "blue" : "gold"}>
        {role === "admin" ? "Admin" : "User"}
      </Tag>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => (
      // <Tag color={status === "active" ? "green" : "red"}>
      //   {status === "active" ? "Active" : "Inactive"}
      // </Tag>
      <Tag color="green">
      Active
    </Tag>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    // render: (_, record) => (
    //   <Space size="middle">
    //     <button>Delete</button>
    //   </Space>
    // ),
  },
];

const UserTable = () => {
  // Gửi request đến API
  const [users, setUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchVal, setSearchVal] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token from localStorage

        // const response = await fetch(http://localhost:5000/api/users);
        const response = await fetch(`${API_URL}/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Add Bearer token
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUsers(data);
        setSearchResults(data); // Initialize search results with all data
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Lọc dữ liệu khi searchVal thay đổi
  useEffect(() => {
    const results = users.filter(user => {
      const searchLower = searchVal.trim().toLowerCase();

      return (
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower)
      );
    });

    setSearchResults(results);
  }, [searchVal, users]);

  // Hiển thị loading hoặc lỗi
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;


  const handleSearchChange = event => {
    setSearchVal(event.target.value);
  };

  return (
    <>
      <div className='inline-flex gap-8'>
        <div className='text-[28px] '>All Users</div>
        <div className="relative w-[400px]">
          <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            className="pl-10 pr-2 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            type="text"
            autoComplete='off'
            placeholder="Search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>
      </div>
      <div className='mt-4 shadow-[0px_-4px_12px_rgba(0,0,0,0.05)]'>
        <Table className='' columns={columns} dataSource={searchResults}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total Users: ${total}`,
          }}
        />
      </div>
    </>
  );
};
export default UserTable;