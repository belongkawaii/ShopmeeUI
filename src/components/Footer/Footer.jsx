import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Về Chúng Tôi</h3>
          <p>Chúng tôi là một sàn thương mại với đầy đủ sản phẩm và dịch vụ chất lượng.</p>
        </div>
        <div className="footer-section">
          <h3>Liên Kết</h3>
          <ul>
            <li><a href="https://www.facebook.com/lovell.06">Facebook</a></li>
            <li><a href="https://twitter.com">X(Twitter)</a></li>
            <li><a href="https://www.instagram.com/son.t.n.x/">Instagram</a></li>
            <li><a href="https://www.youtube.com/@pcvn3226">YouTube</a></li>
            <li><a href="/">Chính sách bảo hành</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Liên Hệ</h3>
          <p>Email: fakemadridofficial001@gmail.com</p>
          <p>Hotline: 0387604029 </p>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; 2026 HCMUE. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;