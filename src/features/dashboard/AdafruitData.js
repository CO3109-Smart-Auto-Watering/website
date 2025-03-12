// realtime data from Adafruit IO, update every 2 seconds
import React, { useState, useEffect } from "react";

const AIO_USERNAME = process.env.REACT_APP_AIO_USERNAME;  
const AIO_KEY = process.env.REACT_APP_AIO_KEY; 

const AdafruitData = ({ feedName }) => {
    const [data, setData] = useState(null);
    const API_URL = `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds/${feedName}/data?limit=1`;
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(API_URL, {
                    headers: { "X-AIO-Key": AIO_KEY },
                });
                const jsonData = await response.json();
                if (jsonData.length > 0) {
                    setData(jsonData[0].value);  // Lấy giá trị mới nhất
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        // Gọi API mỗi 2 giây
        fetchData();
        const interval = setInterval(fetchData, 2000);
        
        return () => clearInterval(interval);  // Cleanup interval khi component unmount
    }, [feedName]);

    return (
        <span>{data}</span>
    );
};

export default AdafruitData;
