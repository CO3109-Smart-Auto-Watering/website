import axios from "axios";

const ADAFRUIT_IO_KEY = "aio_AYhL70xwT0iiYCzyNhpk9Q6jMFq1";
const ADAFRUIT_USERNAME = "thanhnguyen2809";

export const getDevices = async () => {
  try {
    const response = await axios.get(
      `https://io.adafruit.com/api/v2/${ADAFRUIT_USERNAME}/groups`,
      { headers: { "X-AIO-Key": ADAFRUIT_IO_KEY } }
    );

    console.log("API trả về:", response.data);

    if (!response.data || response.data.length === 0) {
      return { feeds: [] }; // Tránh lỗi nếu không có dữ liệu
    }

    // Lấy danh sách thiết bị từ nhóm đầu tiên
    const firstGroup = response.data[0];
    return firstGroup?.feeds ? { feeds: firstGroup.feeds } : { feeds: [] };

  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return { feeds: [] }; // Trả về dữ liệu mặc định tránh lỗi
  }
};
