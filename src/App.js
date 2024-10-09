import React, {useEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {increment, decrement} from './features/counterSlice';
import {buyApi, fetchApiData, fetchResult, move, placeBet} from "./features/apiSlice";
import {Button, Input, Typography, Space, Card, Row, Col} from "antd";
import {Statistic} from 'antd';

const {Title} = Typography;

function App() {
    const count = useSelector((state) => state.counter.value);
    const dispatch = useDispatch();
    const {count: countData, data = null, loading, error, loadingBet} = useSelector((state) => state.api);

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
    const [betNumber, setBetNumber] = useState(0);
    const [oldWinResult, setOldWinResult] = useState("");
    const [oldWinStreak, setOldWinStreak] = useState("");
    const [oldLoseStreak, setOldLoseStreak] = useState("");
    const betCount = localStorage.getItem('countBet');
    useEffect(() => {
        // Đặt bộ hẹn giờ
        const timer = setInterval(() => {
            setCountdownValue(prev => {
                if (prev <= 1) {
                    dispatch(fetchResult(typeBet))
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
        setBetNumber(+betCount);
    }, [key, betCount]);

    useEffect(() => {
        setOldWinResult(localStorage.getItem('winResult'))
        setOldWinStreak(localStorage.getItem('winStreak'))
        setOldLoseStreak(localStorage.getItem('loseStreak'))
    }, [
        localStorage.getItem('winResult'),
        localStorage.getItem('winStreak'),
        localStorage.getItem('loseStreak')]);

    useEffect(() => {
        if (autoBet) {
            if (revert) {
                if (countData?.buy >= 8 && countData?.buy > countData?.sell) {
                    console.log("sell");
                    dispatch(placeBet('DOWN', typeBet))
                }
                if (countData?.sell >= 8 && countData?.sell > countData?.buy) {
                    console.log("buy");
                    dispatch(placeBet('UP', typeBet))
                }
            } else {
                if (countData?.buy >= 8 && countData?.buy > countData?.sell) {
                    console.log("buy");
                    dispatch(placeBet('UP', typeBet))
                }
                if (countData?.sell >= 8 && countData?.sell > countData?.buy) {
                    console.log("sell");
                    dispatch(placeBet('DOWN', typeBet))
                }
            }
        }
    }, [countData?.buy, countData?.sell, countData?.neutralCount]);


    return (
        <div className="App">
            {localStorage.getItem('openInput') === "true" ?
                <Card className='m-5 p-3'>
                    <Space.Compact style={{width: '80%'}}>
                        <div style={{width: '10%'}}>token</div>
                        <Input onChange={(e) => {
                            localStorage.setItem('token', e.target.value)
                        }}/>
                    </Space.Compact>
                    <Space.Compact style={{width: '80%', top: '20px'}} className='mt-3'>
                        <div style={{width: '10%'}}>bet value</div>
                        <Input onChange={(e) => {
                            localStorage.setItem('bet', e.target.value)
                        }}/>
                    </Space.Compact>
                </Card> : null
            }

            <button onClick={() => {
                localStorage.getItem('openInput') === "true" ?
                    localStorage.setItem('openInput', 'false') :
                    localStorage.setItem('openInput', 'true')
            }}>{localStorage.getItem('openInput') === "true" ? "ẩn" : "hiện"}
            </button>
            <Row>
                <Col span={8}>
                    <Card>
                        <div style={{background: '#fff', padding: 24, minHeight: 100, textAlign: 'center'}}>
                            <Title level={2}>
                                <div>Số lệnh đánh {betNumber}</div>
                                <div>Số lệnh win {oldWinResult}</div>
                                <div>Số oldWinStreak {oldWinStreak}</div>
                                <div>Số oldLoseStreak {oldLoseStreak}</div>
                            </Title>
                            <Title level={2}>
                                <button onClick={() => {
                                    localStorage.setItem('countBet', "0")
                                    localStorage.setItem('winResult', "0")
                                    localStorage.setItem('winStreak', "0")
                                    localStorage.setItem('loseStreak', "0")
                                }}>Reset
                                </button>
                            </Title>

                            <div className='mt-3'>
                                <button style={{background: '#DDD', padding: 24,}} onClick={() => {
                                    typeBet === "DEMO" ?
                                        setTypeBet("LIVE") : setTypeBet("DEMO")
                                }}>{typeBet}</button>

                                <button style={{background: '#DDD', padding: 24,}} onClick={() => {
                                    autoBet === 0 ?
                                        setAutoBet(1) : setAutoBet(0)
                                }}>{autoBet === 1 ?
                                    'ON auto' : 'OFF auto'}</button>

                                <button style={{background: '#DDD', padding: 24,}} onClick={() => {
                                    revert === 0 ?
                                        setRevert(1) : setRevert(0)
                                }}>{revert === 1 ?
                                    'Dao nguoc' : 'danh theo'}</button>
                            </div>
                        </div>
                        <div style={{textAlign: 'center', marginTop: '20px'}}>
                            <Statistic.Countdown
                                title="Thời gian còn lại"
                                value={Date.now() + countdownValue * 1000} // Thiết lập giá trị cho Countdown
                                format="HH:mm:ss"
                            />
                        </div>
                    </Card>
                </Col>
                <Col>
                    <Card className='ms-3'>
                        {loading ? <p>Loading...</p> : error ? <div>
                            <p style={{color: 'red'}}>Error: {error}</p>
                            <button onClick={() => {
                                dispatch(fetchApiData())
                                dispatch(fetchResult(typeBet))
                            }}>Refresh Data
                            </button>
                        </div> : <div className='m-3'>
                            {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
                            <button onClick={() => {
                                dispatch(fetchApiData())
                                dispatch(fetchResult(typeBet))
                            }}>Refresh Data
                            </button>
                            <p>{loading}</p>
                        </div>}
                        <Title level={2}>buy: {countData?.buy}</Title>
                        <Title level={2}>sell: {countData?.sell}</Title>
                        <Title level={2}>neutralCount: {countData?.neutralCount}</Title>
                    </Card>
                    <Card className='ms-3 mt-1'>
                        <h1>Số Tiền: {localStorage.getItem('bet')} $</h1>
                        {
                            loadingBet ? <div>loading....</div> :
                                <Title level={2} className=''>
                                    <Button type="primary" className='m-3' onClick={() => dispatch(placeBet('UP', 'DEMO'))}>BUY</Button>
                                    <Button color="danger" variant="solid" onClick={() => dispatch(placeBet('DOWN', 'DEMO'))}>SELL</Button>
                                </Title>
                        }
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default App;
