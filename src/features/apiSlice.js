import {createSlice} from '@reduxjs/toolkit';
import axios from 'axios';

export const apiSlice = createSlice({
    name: 'api',
    initialState: {
        data: undefined,
        loading: false,
        loadingBet: false,
        error: null,
        count: {},
        dataResult: undefined,
    },
    reducers: {
        fetchStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchSuccess: (state, action) => {
            const data = action?.payload ?? null;
            let count = {};
            const countBuySell = (data) => {
                let buyCount = 0;
                let sellCount = 0;
                let neutralCount = 0;

                // Kiểm tra nếu dữ liệu có thuộc tính "d"
                if (data && data.d) {
                    // Lọc các giá trị "buy", "sell" và "neutral"
                    for (const key in data.d) {
                        const value = data.d[key][1]; // Lấy trạng thái (buy/sell/neutral)
                        if (value === "buy") {
                            buyCount++;
                        } else if (value === "sell") {
                            sellCount++;
                        } else if (value === "neutral") {
                            neutralCount++;
                        }
                    }
                }

                // Trả về kết quả
                return count = {
                    buy: buyCount,
                    sell: sellCount,
                    neutralCount: neutralCount,
                };
            };
            countBuySell(data)
            state.loading = false;
            state.data = action?.payload;
            state.count = count;
        },
        fetchFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        fetchOpenBet: (state) => {
            state.loadingBet = true;
            state.error = null;
        },
        fetchBetClose: (state) => {
            const betNumber = localStorage.getItem('countBet');
            localStorage.setItem('countBet', `${+betNumber + 1}`)
            state.loadingBet = false;
        },
        fetchBetError: (state, action) => {
            state.loadingBet = false;
            state.error = action.payload;
        },
        fetchResultOke: (state, action) => {
            const oldResult = JSON.parse(localStorage.getItem('result'));
            const oldWinResult = localStorage.getItem('winResult');
            const oldWinStreak = localStorage.getItem('winStreak');
            const oldLoseStreak = localStorage.getItem('loseStreak');
            const newResult = action.payload;
            if (oldResult?.transactionId !== newResult?.transactionId) {
                if (newResult?.result == "WIN") {
                    console.log(2);
                    localStorage.setItem('winResult', `${+oldWinResult + 1}`)
                    if (+oldWinStreak) {
                        localStorage.setItem('winStreak', `${+oldWinStreak + 1}`)
                    }else {
                        localStorage.setItem('winStreak', `1`)
                        localStorage.setItem('loseStreak', "0")
                    }
                }
                if (+oldLoseStreak && newResult?.result == "LOSE") {
                    console.log(3);
                    localStorage.setItem('loseStreak', `${+oldLoseStreak + 1}`)
                    localStorage.setItem('winStreak', "0")
                }else if (newResult?.result == "LOSE") {
                    localStorage.setItem('loseStreak', `1`)
                    localStorage.setItem('winStreak', "0")
                }
            }
            localStorage.setItem('result', JSON.stringify(newResult))
            state.error = null;
        },
        fetchResultFail: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const {
    fetchResultOke,
    fetchResultFail,
    fetchOpenBet,
    fetchBetClose,
    fetchBetError,
    fetchStart,
    fetchSuccess,
    fetchFailure
} = apiSlice.actions;

// Thunk action for making API call with token
export const fetchApiData = () => async (dispatch) => {
    dispatch(fetchStart());

    // Lấy token từ localStorage (hoặc có thể từ Redux state nếu bạn quản lý token bằng Redux)
    const token = localStorage.getItem('token'); // Hoặc bạn có thể lấy từ Redux state nếu token lưu ở đó
    try {
        const response = await axios.get('https://goldence.net/api/wallet/binaryoption/chart/indicator', {
            headers: {
                Authorization: `Bearer ${token}`,  // Thêm token vào header
            },
        });
        dispatch(fetchSuccess(response?.data));
    } catch (error) {
        dispatch(fetchFailure(error.message));
    }
};

export const fetchResult = (type) => async (dispatch) => {

    // Lấy token từ localStorage (hoặc có thể từ Redux state nếu bạn quản lý token bằng Redux)
    const token = localStorage.getItem('token'); // Hoặc bạn có thể lấy từ Redux state nếu token lưu ở đó
    try {
        const response = await axios.get(`https://goldence.net/api/wallet/binaryoption/transaction/close?page=1&size=1&betAccountType=${type}`, {
            headers: {
                Authorization: `Bearer ${token}`,  // Thêm token vào header
            },
        });
        dispatch(fetchResultOke(response?.data?.d?.c[0]));
    } catch (error) {
        dispatch(fetchResultFail(error.message));
    }
};
export const placeBet = (bet, type) => async (dispatch) => {
    dispatch(fetchOpenBet());
    const url = 'https://goldence.net/api/wallet/binaryoption/bet';
    const token = localStorage.getItem('token'); // Thay YOUR_ACCESS_TOKEN bằng token của bạn nếu cần
    const val = localStorage.getItem('bet');
    const data = {
        betAmount: val,
        betType: bet,
        betAccountType: type,
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        if (response.data.ok) {
            dispatch(fetchBetClose());
        }else {
            dispatch(fetchBetError(response.data.m));
        }
        // Gọi thành công
    } catch (error) {
        console.log(error);
        dispatch(fetchBetError(error.message));
    }
};

export default apiSlice.reducer;
