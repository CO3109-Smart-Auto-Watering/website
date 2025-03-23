import React, { useState } from "react";
import styled from "styled-components";

const ScheduleForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
`;

const SubmitButton = styled.button`
  padding: 10px;
  font-size: 16px;
  background: #4975d1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: #3a66c2;
  }
`;

const PumpSchedule = () => {
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Đang gửi lịch...");
    try {
      const username = process.env.REACT_APP_AIO_USERNAME;
      const key = process.env.REACT_APP_AIO_KEY;
      const feeds = { month, day, hour, minute, duration };
      // Gửi POST cho từng feed
      for (const [feed, value] of Object.entries(feeds)) {
        await fetch(
          `https://io.adafruit.com/api/v2/${username}/feeds/${feed}/data`,
          {
            method: "POST",
            headers: {
              "X-AIO-Key": key,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ value: value.toString() }),
          }
        );
      }
      setStatus("Lịch bơm đã được gửi thành công!");
    } catch (error) {
      console.error(error);
      setStatus("Có lỗi xảy ra khi gửi lịch.");
    }
  };

  return (
    <div>
      <h3>Đặt lịch bơm theo giờ</h3>
      <ScheduleForm onSubmit={handleSubmit}>
        <div>
          <Label>Tháng:</Label>
          <Input
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="Nhập tháng (1-12)"
            min="1"
            max="12"
          />
        </div>
        <div>
          <Label>Ngày:</Label>
          <Input
            type="number"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="Nhập ngày (1-31)"
            min="1"
            max="31"
          />
        </div>
        <div>
          <Label>Giờ:</Label>
          <Input
            type="number"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            placeholder="Nhập giờ (0-23)"
            min="0"
            max="23"
          />
        </div>
        <div>
          <Label>Phút:</Label>
          <Input
            type="number"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            placeholder="Nhập phút (0-59)"
            min="0"
            max="59"
          />
        </div>
        <div>
          <Label>Thời gian bơm (phút):</Label>
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Nhập thời gian bơm"
          />
        </div>
        <SubmitButton type="submit">Gửi lịch bơm</SubmitButton>
      </ScheduleForm>
      {status && <p>{status}</p>}
    </div>
  );
};

export default PumpSchedule;
