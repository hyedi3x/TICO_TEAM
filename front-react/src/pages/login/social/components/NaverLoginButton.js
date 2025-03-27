import React, { useEffect } from "react";

const NaverLoginButton = ({ onLogin }) => {
  useEffect(() => {
    const { naver } = window;
    const naverLogin = new naver.LoginWithNaverId({
      clientId: "네이버에서 발급받은 Client ID",
      callbackUrl: "http://localhost:3000/login/naver/callback",
      isPopup: false,
      loginButton: { color: "green", type: 3, height: 40 },
    });

    naverLogin.init();
    naverLogin.getLoginStatus((status) => {
      if (status) {
        const { email, id, name } = naverLogin.user;
        onLogin({ email, id, name });
      }
    });
  }, [onLogin]);

  return <div id="naverIdLogin" />;
};

export default NaverLoginButton;
