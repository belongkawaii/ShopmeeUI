import "./Hero.css";
import bannerImg from "../../assets/hero-banner.png";

function Hero() {
  return (
    <div className="hero-container">
      <img src={bannerImg} alt="Shopmee Khuyến Mãi" className="hero-image" />
      <div className="hero-content">
        <h1>Shopmee: Chốt Đơn Là Mê!</h1>
        <p>Giảm giá đến 70% toàn bộ gian hàng điện tử</p>
      </div>
    </div>
  );
}

export default Hero;