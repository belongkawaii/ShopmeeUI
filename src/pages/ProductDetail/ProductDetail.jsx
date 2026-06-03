import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    fetch(
      `http://127.0.0.1:8000/api/v1/products/${id}`
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        setProduct(result.data);
        setLoading(false);
      })
      .catch(function (error) {
        console.error(error);
        setLoading(false);
      });
  }, [id]);

  function formatPrice(price) {
    return (
      Math.round(Number(price) * 26000)
        .toLocaleString("vi-VN") + "₫"
    );
  }

  if (loading) {
    return <h2>Đang tải...</h2>;
  }

  if (!product) {
    return <h2>Không tìm thấy sản phẩm</h2>;
  }

  const firstVariant = product.variants?.[0];

  return (
    <div className="detail-container">
      <div className="detail-image">
        <img
          src={product.images?.[0]?.image_url}
          alt={product.name}
        />
      </div>

      <div className="detail-info">
        <h1>{product.name}</h1>

        <div className="detail-price">
          {formatPrice(firstVariant.price)}
        </div>

        <div className="detail-stock">
          Kho: {firstVariant.stock_quantity}
        </div>

        <div className="detail-sku">
          SKU: {firstVariant.sku}
        </div>

        <button className="add-cart-btn">
          Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  );
}

export default ProductDetail;