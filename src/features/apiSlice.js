import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const apiSlice = createSlice({
    name: 'api',
    initialState: {
        data: undefined,
        loading: false,
        error: null,
        count: {},
    },
    reducers: {
        fetchStart: (state) => {
            state.loading = true;
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
                    neutralCount:neutralCount,
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
    },
});

export const { fetchStart, fetchSuccess, fetchFailure } = apiSlice.actions;

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

export const buyApi = () => async (dispatch) => {
    dispatch(fetchStart());
    const token = localStorage.getItem('token');
    // Lấy token từ localStorage (hoặc có thể từ Redux state nếu bạn quản lý token bằng Redux)
    const bet = localStorage.getItem('bet'); // Hoặc bạn có thể lấy từ Redux state nếu token lưu ở đó
    try {
        const response = await axios.post('https://goldence.net/api/wallet/binaryoption/bet', {
            headers: {
                Authorization: `Bearer ${token}`, // Thêm token vào header
            },
            body: {
                "amt": bet,
                "type": "UP",
                "acc_type": "DEMO",
            }
        });
        console.log(response);
    } catch (error) {
        console.log(error);
    }
};
export const placeBet = (bet,type) => async (dispatch) => {
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
        console.log(response);
        // Gọi thành công
    } catch (error) {
        console.log(error);
    }
};

export default apiSlice.reducer;
