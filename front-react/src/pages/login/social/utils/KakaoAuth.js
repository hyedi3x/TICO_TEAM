

// utils/KakaoAuth.js


// 카카오 인증 URL을 생성하는 유틸리티 파일
const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.REACT_APP_KAKAO_REST_API_KEY}&redirect_uri=${process.env.REACT_APP_KAKAO_REDIRECT_URI}&scope=profile_nickname,profile_image`;

    console.log("Kakao REST API Key:", process.env.REACT_APP_KAKAO_REST_API_KEY);
    console.log("Kakao Redirect URI:", process.env.REACT_APP_KAKAO_REDIRECT_URI);


export default KAKAO_AUTH_URL;



// response_type=code: 인증 코드 방식.
// client_id: 카카오 REST API 키.
// redirect_uri: 인증 후 리다이렉트 경로.
// scope=profile_nickname: 사용자 닉네임 정보 요청.