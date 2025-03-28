import React, { useEffect, useState } from "react";
import styled from "styled-components";
import NavBar from "../components/layout/NavBar";
import { getDevices } from "../services/adafruitApi";
import trendUp from "../assets/images/trend_up.svg";
import trendDown from "../assets/images/trend_down.svg";

const MainContent = styled.div`
  margin-left: 260px;
  flex: 1;
  padding: 32px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

const Th = styled.th`
  background-color: #f1f1f1;
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
`;

const Td = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
`;

const DeviceList = () => {
  const [devices, setDevices] = useState(null); // Dùng null để kiểm tra loading

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDevices();
      console.log("Dữ liệu từ API:", data);

      if (data && data.feeds) {
        setDevices(data.feeds);
      } else {
        setDevices([]); // Nếu không có dữ liệu, đặt mảng rỗng tránh lỗi
      }
    };

    fetchData();
  }, []);

  if (devices === null) {
    return <p>Đang tải dữ liệu...</p>; // Hiển thị khi chưa tải xong
  }

  return (
    <div className="bg-[#f8f9fc] h-screen">
      <NavBar />
      <MainContent>
        {/* Thống kê tổng quan */}
        <div className="flex mt-[0px] mb-[24px]">
          <div className="relative p-[16px] mr-[32px] bg-white w-[250px] h-[140px] [box-shadow:0px_4px_12px_rgba(0,_0,_0,_0.05)] rounded-[14px]">
            <div className="flex">
              <div>
                <h2 className="text-[16px] text-[#636466]">Total Devices</h2>
                <h3 className="text-[28px] font-semibold">{devices.length}</h3>
              </div>
            </div>
            <div className="flex absolute bottom-[16px]">
              <img className="mr-[4px]" src={trendUp} alt="trendUp" />
              <span className="text-[14px] text-[#636466]">
                <span className="text-[#00B69B]">+5 </span>
                new devices this week
              </span>
            </div>
          </div>

          <div className="relative p-[16px] bg-white w-[250px] h-[140px] [box-shadow:0px_4px_12px_rgba(0,_0,_0,_0.05)] rounded-[14px]">
            <div className="flex">
              <div>
                <h2 className="text-[16px] text-[#636466]">Active Devices</h2>
                <h3 className="text-[28px] font-semibold">
                  {devices.filter((d) => d.status === "online").length}
                </h3>
              </div>
            </div>
            <div className="flex absolute bottom-[16px]">
              <img className="mr-[4px]" src={trendDown} alt="trendDown" />
              <span className="text-[14px] text-[#636466]">
                <span className="text-[#F93C65]">-2 </span>
                inactive this week
              </span>
            </div>
          </div>
        </div>

        {/* Danh sách thiết bị dạng bảng */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Danh sách Thiết Bị</h2>
          {devices.length === 0 ? (
            <p>Không có thiết bị nào.</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Tên Thiết Bị</Th>
                  <Th>Trạng Thái</Th>
                  <Th>Giá Trị</Th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id}>
                    <Td>{device.name}</Td>
                    <Td style={{ color: device.status === "online" ? "green" : "red" }}>
                      {device.status || "N/A"}
                    </Td>
                    <Td>{device.last_value || "N/A"}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </MainContent>
    </div>
  );
};

export default DeviceList;
