import React from "react";
import { Link } from "react-router-dom";
import './Footer.css';
import logo from '../imgs/TICO_logo_icon_gray.png';

function Footer() {
  return(
    <footer className="footer">
      <div className="footer-content">
        <Link to=''>
          <img
            src={logo}
            alt="TICO LOGO"
            style={{height: '45px', marginBottom: '5px'}}
          />
        </Link>
        <p>
          <Link to=''>티코 이용약관</Link>
          <Link to='' style={{ fontWeight: 'bold' }}>개인정보 처리방침</Link>
          <Link to=''>책임의 한계와 법적 고지</Link>
          <Link to=''>학급 서비스 이용약관</Link>
          <Link to=''>커뮤니티 가이드라인</Link>
          <Link to=''>티코 위키</Link>
        </p>

        <p>
          티코는 네이버 커넥트재단에서 운영하는 비영리 교육 플랫폼입니다.<br></br>
          모든 저작물은 교육 목적에 한해 출처를 밝히고 자유롭게 이용할 수 있습니다.
        </p>

        <p>
          서울 마포구 백범로 23 3층
          <Link to=''>yeonju@naver.com</Link>
          <Link to='' target="_blank" rel="noopener noreferrer"></Link>
          오픈 소스 라이선스
        </p>

        <div className="social-links">
          <Link to='https://github.com/hyedi3x/TICO_TEAM.git' target="_blank" rel="noopener noreferrer"> {/* target 링크를 새 창에서 열도록 설정,noopener noreferrer : 보안과 프라이버시 보호 */}
            git
          </Link>
          <Link to='https://www.notion.so/Planning-1b424593b1db80169086fed616e863de#1b824593b1db80aa9961d3c93c7cc144' target="_blank" rel="noopener noreferrer">
            Notion
          </Link>
          <Link to='https://docs.google.com/spreadsheets/d/1jE1QHrUpgkkW37kZs9sIbUjE8N0Gx0Ir3XR1hT2feN4/edit?gid=0#gid=0' target="_blank" rel="noopener noreferrer">
            google Drive
          </Link>
        </div>

        <p>Copyright©2025 by TICO.All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;