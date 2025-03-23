import React, { useState, useEffect } from "react";

const AdafruitData = ({ feedName }) => {
    const [data, setData] = useState("--");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const AIO_USERNAME = process.env.REACT_APP_AIO_USERNAME;
        const AIO_KEY = process.env.REACT_APP_AIO_KEY;
        
        // Debug logging
        console.log("Adafruit credentials:", { 
            username: AIO_USERNAME ? "Set" : "Not set", 
            key: AIO_KEY ? "Set" : "Not set" 
        });
        
        if (!AIO_USERNAME || !AIO_KEY) {
            setError("Adafruit credentials not configured");
            setLoading(false);
            return;
        }
        
        const API_URL = `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds/${feedName}/data?limit=1`;
        
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(API_URL, {
                    headers: { "X-AIO-Key": AIO_KEY },
                });
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const jsonData = await response.json();
                console.log(`Adafruit data for ${feedName}:`, jsonData);
                
                if (jsonData.length > 0) {
                    setData(jsonData[0].value);
                } else {
                    setData("No data");
                }
            } catch (error) {
                console.error(`Error fetching ${feedName}:`, error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000);
        
        return () => clearInterval(interval);
    }, [feedName]);

    if (error) return <span>Error: {error}</span>;
    return <span>{data}</span>;
};

export default AdafruitData;
