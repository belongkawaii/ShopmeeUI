import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Orders.css";

import { API_BASE_URL, STORAGE_BASE_URL } from "../../config";
import { useCustomAlert } from "../../context/CustomAlertContext";

function Orders() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useCustomAlert();
  const token = localStorage.getItem("access_token");

  // States
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Cancel order modal state
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    orderId: null,
    loading: false,
  });

  // Action loading states by order ID
  const [actionLoading, setActionLoading] = useState({});

  // Review modal state
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    orderId: null,
    productId: null,
    productName: "",
    productImage: "",
    variantName: "",
    rating: 5,
    comment: "",
    imageFile: null,
    imagePreview: null,
    loading: false,
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [token]);

  // Fetch all orders
  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setOrders(result.data || []);
      } else {
        setError(result.message || "Không thể tải danh sách đơn hàng.");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  // Cancel single order
  async function handleCancelOrder(orderId) {
    setCancelModal((prev) => ({ ...prev, loading: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setCancelModal({ isOpen: false, orderId: null, loading: false });
        fetchOrders(); // Reload orders
      } else {
        showError(result.message || "Hủy đơn hàng thất bại.");
      }
    } catch (err) {
      console.error(err);
      showError("Lỗi kết nối khi hủy đơn hàng.");
    } finally {
      setCancelModal((prev) => ({ ...prev, loading: false }));
    }
  }

  // Simulate banking / momo payment
  async function handleSimulatePayment(orderId) {
    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/payments/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        showSuccess(result.message);
        fetchOrders(); // Reload orders to update status
      } else {
        showError(result.message || "Giả lập thanh toán thất bại.");
      }
    } catch (err) {
      console.error(err);
      showError("Lỗi kết nối khi giả lập thanh toán.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  // Simulating momo redirect check on click
  function handleMomoRedirectSimulate(order) {
    showWarning("Đang chuyển hướng giả lập thanh toán ví MoMo...");
    // Direct call payment simulation for test convenience
    setTimeout(() => {
      handleSimulatePayment(order.id);
    }, 1000);
  }

  // Currency formater (matches formatMoney in Cart.jsx)
  function formatMoney(amount) {
    return Math.round(Number(amount)).toLocaleString("vi-VN") + " ₫";
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Helpers
  function getShopName(order) {
    if (order.items && order.items.length > 0) {
      return order.items[0].product_variant?.product?.shop?.name || "Shopmee Store";
    }
    return "Shopmee Store";
  }

  function getProductImage(item) {
    if (item.product_variant?.product?.images?.length > 0) {
      const img = item.product_variant.product.images[0].image;
      if (img.startsWith("http")) return img;
      return `${STORAGE_BASE_URL}/${img}`;
    }
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";
  }

  function getOrderStatusText(status) {
    const statusMap = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      shipping: "Đang giao",
      delivered: "Đã giao",
      completed: "Đã giao",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  }

  function getPaymentStatusText(status) {
    const statusMap = {
      pending: "Chưa thanh toán",
      paid: "Đã thanh toán",
      refunded: "Đã hoàn tiền",
    };
    return statusMap[status] || status;
  }

  // Review modal actions
  function openReviewModal(orderId, item) {
    const productId = item.product_variant?.product?.id;
    const productName = item.product_variant?.product?.name || "Sản phẩm";
    const productImage = getProductImage(item);
    const variantName = item.product_variant?.variant_name || "";
    
    setReviewModal({
      isOpen: true,
      orderId,
      productId,
      productName,
      productImage,
      variantName,
      rating: 5,
      comment: "",
      imageFile: null,
      imagePreview: null,
      loading: false,
    });
  }

  function handleRatingSelect(stars) {
    setReviewModal(prev => ({ ...prev, rating: stars }));
  }

  function handleReviewImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setReviewModal(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    setReviewModal(prev => ({ ...prev, loading: true }));

    const formData = new FormData();
    formData.append("rating", reviewModal.rating);
    if (reviewModal.comment) {
      formData.append("comment", reviewModal.comment);
    }
    if (reviewModal.imageFile) {
      formData.append("image", reviewModal.imageFile);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${reviewModal.orderId}/products/${reviewModal.productId}/review`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showSuccess("Đánh giá sản phẩm thành công!");
        setReviewModal({
          isOpen: false,
          orderId: null,
          productId: null,
          productName: "",
          productImage: "",
          variantName: "",
          rating: 5,
          comment: "",
          imageFile: null,
          imagePreview: null,
          loading: false,
        });
        fetchOrders();
      } else {
        showError(result.message || "Gửi đánh giá thất bại.");
      }
    } catch (err) {
      console.error(err);
      showError("Lỗi kết nối khi gửi đánh giá.");
    } finally {
      setReviewModal(prev => ({ ...prev, loading: false }));
    }
  }

  function getPaymentMethodText(method) {
    const methodMap = {
      cash_on_delivery: "Thanh toán tiền mặt",
      cod: "Thanh toán tiền mặt",
      bank_transfer: "Chuyển khoản",
      momo: "momo",
    };
    return methodMap[method] || method;
  }

  // Filtering Logic
  const filteredOrders = orders
    .filter((order) => {
      // 1. Tab status filter
      if (activeTab !== "all" && order.status !== activeTab) {
        return false;
      }
      // 2. Search query filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchId = order.id.toString().includes(q);
        const matchProduct = order.items.some((item) =>
          item.product_variant?.product?.name?.toLowerCase().includes(q)
        );
        return matchId || matchProduct;
      }
      return true;
    });

  const tabs = [
    { label: "Tất cả", value: "all" },
    { label: "Chờ xử lý", value: "pending" },
    { label: "Đang xử lý", value: "processing" },
    { label: "Đang giao", value: "shipping" },
    { label: "Đã giao", value: "delivered" },
    { label: "Đã hủy", value: "cancelled" },
  ];

  return (
    <div className="orders-container">
      <h1 className="orders-title">📦 LỊCH SỬ ĐƠN HÀNG</h1>

      {error && <div className="orders-error-banner">⚠️ {error}</div>}

      {/* Filter Tabs & Search Header */}
      <div className="orders-filter-bar">
        <div className="orders-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className={`orders-tab-btn ${activeTab === tab.value ? "active" : ""}`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="orders-search">
          <input
            type="text"
            placeholder="Tìm theo Mã đơn hoặc Tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="orders-search-input"
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="orders-loading-state">
          <div className="spinner"></div>
          <p>Đang tải lịch sử đơn hàng của bạn...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-orders-card">
          <div className="empty-orders-icon">🛍️</div>
          <h3>Không tìm thấy đơn hàng nào!</h3>
          <p>Bạn chưa thực hiện giao dịch nào hoặc không có đơn hàng khớp với bộ lọc.</p>
          <button className="go-shopping-btn" onClick={() => navigate("/")}>
            Quay lại trang chủ mua sắm
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const isUnpaid = order.payment_status === "pending";
            const isPending = order.status === "pending";
            const canCancel = isPending;
            const isDelivered = order.status === "delivered" || order.status === "completed";

            return (
              <div key={order.id} className="order-card">
                {/* Card Header */}
                <div className="order-card-header">
                  <div className="shop-info">
                    <span className="shop-tag">Cửa hàng</span>
                    <span className="shop-name">{getShopName(order)}</span>
                  </div>
                  <div className="order-badges">
                    <span className={`method-badge method-${order.payment_method}`}>
                      {getPaymentMethodText(order.payment_method)}
                    </span>
                    <span className={`pay-badge pay-${order.payment_status}`}>
                      {getPaymentStatusText(order.payment_status)}
                    </span>
                    <span className={`status-badge status-${order.status}`}>
                      {getOrderStatusText(order.status)}
                    </span>
                  </div>
                </div>

                {/* Card Items */}
                <div className="order-card-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item-row">
                      <div className="item-img-box">
                        <img src={getProductImage(item)} alt="Sản phẩm" />
                      </div>
                      <div className="item-info-box">
                        <h4 className="item-title-text">
                          {item.product_variant?.product?.name || "Sản phẩm không khả dụng"}
                        </h4>
                        <span className="item-variant-text">
                          Phân loại: {item.product_variant?.variant_name || "Mặc định"}
                        </span>
                        {item.product_variant?.sku && (
                          <span className="item-sku-text">SKU: {item.product_variant.sku}</span>
                        )}
                      </div>
                      <div className="item-price-box-wrapper">
                        <div className="item-price-box">
                          <span className="item-unit-price">{formatMoney(item.unit_price)}</span>
                          <span className="item-quantity-text">x{item.quantity}</span>
                        </div>
                        {isDelivered && (
                          <div className="item-review-action">
                            {item.is_reviewed ? (
                              <span className="reviewed-label">✓ Đã đánh giá</span>
                            ) : (
                              <button
                                type="button"
                                className="btn-review-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReviewModal(order.id, item);
                                }}
                              >
                                ✍️ Đánh giá
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Note/Description if any */}
                {order.description && (
                  <div className="order-description-box">
                    <strong>Ghi chú đặt hàng:</strong> {order.description}
                  </div>
                )}

                {/* Card Footer Summary and Actions */}
                <div className="order-card-footer">
                  <div className="order-total-amount">
                    <span className="total-label">Thành tiền:</span>
                    <span className="total-value">{formatMoney(order.total_amount)}</span>
                  </div>

                  <div className="order-actions-btn-group">
                    {/* Action: Cancel Order */}
                    {canCancel && (
                      <button
                        type="button"
                        className="btn-action btn-cancel-order"
                        onClick={() => setCancelModal({ isOpen: true, orderId: order.id, loading: false })}
                      >
                        ✕ Hủy đơn hàng
                      </button>
                    )}

                    {/* Meta info info date */}
                    <span className="order-date-label">
                      Đặt lúc: {formatDate(order.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {cancelModal.isOpen && (
        <div className="cancel-modal-overlay">
          <div className="cancel-modal-box">
            <h3>Xác nhận hủy đơn hàng</h3>
            <p>Bạn có chắc chắn muốn hủy đơn hàng <strong>#{cancelModal.orderId}</strong>?</p>
            <p className="modal-warning">Hành động này sẽ hoàn trả các mặt hàng vào kho và không thể hoàn tác.</p>
            
            <div className="modal-buttons">
              <button
                className="modal-btn-close"
                onClick={() => setCancelModal({ isOpen: false, orderId: null, loading: false })}
                disabled={cancelModal.loading}
              >
                Đóng
              </button>
              <button
                className="modal-btn-confirm"
                onClick={() => handleCancelOrder(cancelModal.orderId)}
                disabled={cancelModal.loading}
              >
                {cancelModal.loading ? "Đang hủy..." : "Đồng ý Hủy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="review-modal-overlay">
          <div className="review-modal-box">
            <button 
              className="review-modal-close-btn"
              onClick={() => setReviewModal(prev => ({ ...prev, isOpen: false }))}
              disabled={reviewModal.loading}
            >
              ✕
            </button>
            
            <h3>Đánh giá sản phẩm</h3>
            
            <div className="review-modal-product-summary">
              <img src={reviewModal.productImage} alt={reviewModal.productName} />
              <div className="product-details">
                <h4>{reviewModal.productName}</h4>
                {reviewModal.variantName && (
                  <span className="variant-label">Phân loại hàng: {reviewModal.variantName}</span>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="review-form">
              {/* Star Rating Selector */}
              <div className="rating-select-group">
                <label>Chất lượng sản phẩm:</label>
                <div className="stars-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= reviewModal.rating ? "selected" : ""}`}
                      onClick={() => handleRatingSelect(star)}
                      disabled={reviewModal.loading}
                    >
                      ★
                    </button>
                  ))}
                  <span className="rating-text-hint">
                    {reviewModal.rating === 1 && "Tệ"}
                    {reviewModal.rating === 2 && "Không hài lòng"}
                    {reviewModal.rating === 3 && "Bình thường"}
                    {reviewModal.rating === 4 && "Hài lòng"}
                    {reviewModal.rating === 5 && "Tuyệt vời"}
                  </span>
                </div>
              </div>

              {/* Comment Input */}
              <div className="form-group">
                <label htmlFor="comment">Chia sẻ nhận xét của bạn:</label>
                <textarea
                  id="comment"
                  rows="4"
                  placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này nhé..."
                  value={reviewModal.comment}
                  onChange={(e) => setReviewModal(prev => ({ ...prev, comment: e.target.value }))}
                  disabled={reviewModal.loading}
                  maxLength={1000}
                ></textarea>
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label>Thêm hình ảnh sản phẩm (nếu có):</label>
                <div className="image-upload-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    id="review-image-input"
                    onChange={handleReviewImageChange}
                    disabled={reviewModal.loading}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="review-image-input" className="image-upload-btn">
                    📷 Tải ảnh lên
                  </label>
                  
                  {reviewModal.imagePreview && (
                    <div className="image-preview-container">
                      <img src={reviewModal.imagePreview} alt="Preview" />
                      <button
                        type="button"
                        className="remove-preview-btn"
                        onClick={() => setReviewModal(prev => ({ ...prev, imageFile: null, imagePreview: null }))}
                        disabled={reviewModal.loading}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="review-modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setReviewModal(prev => ({ ...prev, isOpen: false }))}
                  disabled={reviewModal.loading}
                >
                  Trở lại
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={reviewModal.loading}
                >
                  {reviewModal.loading ? "Đang gửi..." : "Hoàn thành"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
