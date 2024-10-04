import React, {useEffect, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from './features/counterSlice';
import {buyApi, fetchApiData, placeBet} from "./features/apiSlice";
import {Button, Input, Typography,Space} from "antd";
import { Statistic } from 'antd';
const { Title } = Typography;
function App() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();
  const { count:countData ,data = null, loading, error } = useSelector((state) => state.api);

    // Fetch data from API when component mounts
    useEffect(() => {
        dispatch(fetchApiData());
    }, [dispatch]);
    const onFinish = () => {
        console.log('Đếm ngược đã hoàn thành!');
        alert('Đếm ngược đã hoàn thành!');
    };

    const initialCountdownValue = 60; // 30 giây
    const [countdownValue, setCountdownValue] = useState(initialCountdownValue); // Giá trị đếm ngược
    const [key, setKey] = useState(0); // Thay đổi khóa để khởi động lại đồng hồ
    const [typeBet, setTypeBet] = useState("DEMO");
    const [autoBet, setAutoBet] = useState(0);
    const [revert, setRevert] = useState(0);

    useEffect(() => {
        // Đặt bộ hẹn giờ
        const timer = setInterval(() => {
            setCountdownValue(prev => {
                if (prev <= 1) {
                    // Khi đếm ngược hoàn thành, khởi động lại
                    setKey(prevKey => prevKey + 1); // Thay đổi khóa để khởi động lại đồng hồ
                    dispatch(fetchApiData())
                    return initialCountdownValue; // Đặt lại về giá trị ban đầu
                }
                return prev - 1; // Giảm giá trị đếm ngược
            });
        }, 1000); // Cập nhật mỗi giây

        return () => clearInterval(timer); // Dọn dẹp timer khi component bị hủy
    }, [key]);

    useEffect(() => {
        if (autoBet) {
            console.log(1);
           // if (revert) {
           //     if (countData?.buy > 8 && countData?.sell > 0 && countData?.buy / countData?.sell >= 2 && countData?.neutralCount <= 5) {
           //         console.log("sell");
           //         dispatch(placeBet('DOWN',typeBet))
           //     }
           //     if (countData?.sell > 8 && countData?.buy > 0 && countData?.sell / countData?.buy >= 2 && countData?.neutralCount <= 5) {
           //         console.log("buy");
           //         dispatch(placeBet('UP',typeBet))
           //     }
           // }else {
           //     if (countData?.buy > 8 && countData?.sell > 0 && countData?.buy / countData?.sell >= 2 && countData?.neutralCount <= 5) {
           //         console.log("buy");
           //         dispatch(placeBet('UP',typeBet))
           //     }
           //     if (countData?.sell > 8 && countData?.buy > 0 && countData?.sell / countData?.buy >= 2 && countData?.neutralCount <= 5) {
           //         console.log("sell");
           //         dispatch(placeBet('DOWN',typeBet))
           //     }
           // }
            if (countData?.buy >= 8 && countData?.buy > countData?.sell) {
                console.log("buy");
                dispatch(placeBet('UP',typeBet))
            }
            if (countData?.sell >= 8 && countData?.sell > countData?.buy) {
                console.log("sell");
                dispatch(placeBet('DOWN',typeBet))
            }
        }
    }, [countData?.buy,countData?.sell,countData?.neutralCount]);

    return (
      <div className="App">
          <Space.Compact style={{ width: '80%' }}>
              <div>token</div>
              <Input onChange={(e) => {localStorage.setItem('token',e.target.value)}}/>
          </Space.Compact>
          <Space.Compact style={{ width: '50%' ,top:'20px'}}>
              <div>bet value</div>
              <Input onChange={(e) => {localStorage.setItem('bet',e.target.value)}}/>
          </Space.Compact>

          <div style={{ background: '#fff', padding: 24, minHeight: 100, textAlign: 'center' }}>
              <Title level={2}>Binary Option Chart Indicator Data</Title>
              {loading ? <p>Loading...</p> : error ? <div>
                     <p style={{ color: 'red' }}>Error: {error}</p>
                     <button onClick={() => {
                         dispatch(fetchApiData())
                     }}>Refresh Data</button>
                 </div> : <div>
                      {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
                      <button onClick={() => {
                          dispatch(fetchApiData())
                      }}>Refresh Data</button>
                  <p>{loading}</p>
              </div>}
              <button style={{ background: '#DDD', padding: 24,}} onClick={() => {
                  typeBet === "DEMO" ?
                      setTypeBet("LIVE") : setTypeBet("DEMO")
              }}>{typeBet}</button>

              <button style={{ background: '#DDD', padding: 24,}} onClick={() => {
                  autoBet === 0 ?
                      setAutoBet(1) : setAutoBet(0)
              }}>{autoBet === 1  ?
                  'ON auto' : 'OFF auto'}</button>

              <button style={{ background: '#DDD', padding: 24,}} onClick={() => {
                  revert === 0 ?
                      setRevert(1) : setRevert(0)
              }}>{revert === 1  ?
                  'Dao nguoc' : 'danh theo'}</button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h1>Đồng Hồ Đếm Ngược 30 Giây</h1>
              <Statistic.Countdown
                  title="Thời gian còn lại"
                  value={Date.now() + countdownValue * 1000} // Thiết lập giá trị cho Countdown
                  format="HH:mm:ss"
              />
          </div>
        <h1>buy: {countData?.buy}</h1>
        <h1>sell: {countData?.sell}</h1>
        <h1>neutralCount: {countData?.neutralCount}</h1>
        {/*<h1>Counter: {sellCount}</h1>*/}
        <button onClick={() => dispatch(placeBet('UP','DEMO'))}>BUY</button>
        <button onClick={() => dispatch(placeBet('DOWN','DEMO'))}>SELL</button>
      </div>
  );
}

export default App;
