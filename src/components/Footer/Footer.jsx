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
            <li>Facebook</li>
            <li>X(Twitter)</li>
            <li>Instagram</li>
            <li><a href="https://www.youtube.com">YouTube</a></li>
            <li>Chính sách bảo hành</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Liên Hệ</h3>
          <p>Email: fakemadridofficial001@gmail.com</p>
          <p>Hotline: 0387604029 </p>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; 2024 MyStore. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;