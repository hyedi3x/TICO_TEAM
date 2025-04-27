import axios from 'axios';

// 1) Axios 인스턴스 생성: 기본 URL, JSON 헤더, 쿠키 전송 허용 설정
const axiosInstance = axios.create({ // 서버와 통신할 때 사용하는 axios 인스턴스 생성
  baseURL: 'https://tico.kro.kr', //  baseURL : 기본 url생성 (기준)
  withCredentials: true,  // 쿠키(withCredentials) 허용
  headers: {  
    'Content-Type': 'application/json' // 모든 요청에 Content-Type / application/json 포함
  }
});

// 2) 요청 인터셉터: 모든 요청에 저장된 Access Token을 Authorization 헤더에 자동 추가
// 로컬스토리지의 토큰을 헤더에 추가 (서버로 요청을 보내기전 이 함수가 먼저 실행됨)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // Callback에 에서 localStorage 저장한 토큰을 가져와서 
    // 만약 토큰이 있다면 요청 헤더에 Authorization: Bearer {토큰} 형식으로 추가함
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
  // 모든 요청에 인증 토큰이 자동으로 포함되는점 알아두기
);

// 401 에러 발생 시 토큰 재발급 시도
axiosInstance.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    // 1) 401 && 아직 재시도 전일 때만
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 2) 리프레시 요청 자체라면 무한루프 방지
      if (originalRequest.url === '/auth/refresh') {
        return Promise.reject(error);
      }

      try {
        // 3) HttpOnly 쿠키에 담긴 리프레시 토큰으로 재발급 요청
        const res = await axios.post(
          '/auth/refresh',
          null,
          { baseURL: axiosInstance.defaults.baseURL, withCredentials: true }
        );
        const newAccessToken = res.data.accessToken;

        // 4) 새 토큰 저장 및 헤더 업데이트
        localStorage.setItem('accessToken', newAccessToken);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        // 5) 원래 요청 다시 보내기
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.error('토큰 재발급 실패', refreshError);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 401 외거나 이미 재시도한 경우 그대로 에러 처리
    return Promise.reject(error);
  }
);
export default axiosInstance;