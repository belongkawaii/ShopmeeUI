import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [loginMessage, setLoginMessage] =
  useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/v1/products/${id}`
        );

        const result = await response.json();

        setProduct(result.data);

        if (result.data.images?.length) {
          setSelectedImage(result.data.images[0].image_url);
        }

        if (result.data.variants?.length) {
          setSelectedVariant(result.data.variants[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  function formatPrice(price) {
    return Number(price).toLocaleString("vi-VN") + " ₫";
  }

  async function handleAddToCart() {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      setLoginMessage(
        "⚠️ Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng."
      );

      return;
    }

    if (!selectedVariant) {
      setLoginMessage("⚠️ Vui lòng chọn phân loại sản phẩm.");
      return;
    }

    if (quantity > selectedVariant.stock_quantity) {
      setLoginMessage(`⚠️ Số lượng vượt quá tồn kho (Hiện có: ${selectedVariant.stock_quantity}).`);
      return;
    }

    setLoginMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          product_variant_id: selectedVariant.id,
          quantity: quantity
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Dispatch custom event to notify Header
        window.dispatchEvent(new Event("cartUpdated"));
        setLoginMessage("🎉 Đã thêm sản phẩm vào giỏ hàng thành công!");
      } else {
        setLoginMessage(`❌ ${result.message || "Không thể thêm sản phẩm vào giỏ hàng."}`);
      }
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error);
      setLoginMessage("❌ Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  }

  if (loading) {
    return <h2 className="loading">Đang tải sản phẩm...</h2>;
  }

  if (!product) {
    return <h2 className="loading">Không tìm thấy sản phẩm</h2>;
  }

  return (
    <>
      <div className="detail-container">
        {/* IMAGE */}
        <div className="detail-gallery">
          <div className="detail-main-image">
            <img src={selectedImage} alt={product.name} />
          </div>

          <div className="detail-thumbnails">
            {product.images?.map((image) => (
              <img
                key={image.id}
                src={image.image_url}
                alt=""
                onClick={() => setSelectedImage(image.image_url)}
                className={
                  selectedImage === image.image_url ? "active-thumb" : ""
                }
              />
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className="detail-info">
          <span className="detail-category">
            {product.category?.name}
          </span>

          <h1>{product.name}</h1>

          <div className="detail-rating-summary">
            <span className="stars-label">⭐ {product.rating_avg ? `${product.rating_avg} / 5` : "Chưa có đánh giá"}</span>
            <span className="divider-bar">|</span>
            <span className="reviews-count-label">{product.rating_count} Đánh giá</span>
          </div>

          <div className="detail-price">
            {selectedVariant
              ? formatPrice(selectedVariant.price)
              : "Liên hệ"}
          </div>

          <div className="detail-shop">
            <strong>Shop:</strong> {product.shop?.name}
          </div>

          <div className="detail-stock">
            <strong>Tồn kho:</strong>{" "}
            {selectedVariant?.stock_quantity ?? 0}
          </div>

          <div className="detail-sku">
            <strong>SKU:</strong>{" "}
            {selectedVariant?.sku || "N/A"}
          </div>

          {/* VARIANTS */}
          <div className="variant-section">
            <h3>Phân loại</h3>

            <div className="variant-list">
              {product.variants?.map((variant) => (
                <button
                  key={variant.id}
                  className={
                    selectedVariant?.id === variant.id
                      ? "variant-btn active"
                      : "variant-btn"
                  }
                  onClick={() => setSelectedVariant(variant)}
                >
                  {variant.variant_name}
                </button>
              ))}
            </div>
          </div>

          {/* QUANTITY */}
          <div className="quantity-section">
            <h3>Số lượng</h3>
            <div className="quantity-selector">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                className="qty-input"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val > 0) {
                    setQuantity(Math.min(selectedVariant?.stock_quantity ?? 1, val));
                  }
                }}
                min="1"
              />
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((prev) => Math.min(selectedVariant?.stock_quantity ?? 1, prev + 1))}
                disabled={quantity >= (selectedVariant?.stock_quantity ?? 0)}
              >
                +
              </button>
            </div>
          </div>

          <>
            {loginMessage && (
              <div className="login-warning">
                {loginMessage}
              </div>
            )}

            <button
              className="add-cart-btn"
              onClick={handleAddToCart}
            >
              Thêm vào giỏ hàng
            </button>
          </>

          <div className="detail-description">
            <h3>Mô tả sản phẩm</h3>
            <p>{product.description}</p>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="reviews-container-box">
        <h2 className="reviews-section-title">ĐÁNH GIÁ SẢN PHẨM</h2>
        
        <div className="reviews-summary-header">
          <div className="rating-overview-card">
            <div className="rating-avg-score">
              <span className="score-num">{product.rating_avg || 5}</span>
              <span className="score-max"> trên 5</span>
            </div>
            <div className="rating-stars-row">
              {"★".repeat(Math.round(product.rating_avg || 5)) + "☆".repeat(5 - Math.round(product.rating_avg || 5))}
            </div>
          </div>
        </div>

        <div className="reviews-feed">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review) => (
              <div className="review-feed-item" key={review.id}>
                <div className="review-user-info">
                  <div className="user-avatar-placeholder">
                    {review.user_name ? review.user_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="user-meta-details">
                    <span className="username">{review.user_name}</span>
                    <div className="stars">
                      {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                    </div>
                    {review.variant_name && (
                      <span className="variant">Phân loại hàng: {review.variant_name}</span>
                    )}
                    <span className="date">{review.created_at}</span>
                  </div>
                </div>
                <div className="review-body-text">
                  <p>{review.comment || "Khách hàng không để lại bình luận."}</p>
                  {review.image_url && (
                    <div className="review-attachment">
                      <img 
                        src={review.image_url} 
                        alt="Đính kèm đánh giá" 
                        onClick={() => window.open(review.image_url, '_blank')} 
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-reviews-placeholder">
              Chưa có đánh giá nào cho sản phẩm này. Hãy mua hàng để trở thành người đánh giá đầu tiên!
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProductDetail;