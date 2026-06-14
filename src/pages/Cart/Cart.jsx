import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

import { API_BASE_URL } from "../../config";

function Cart() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  // Cart State
  const [cartGroups, setCartGroups] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // IDs of selected cart items
  const [loading, setLoading] = useState(true);
  const [cartError, setCartError] = useState("");

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    receiver_name: "",
    receiver_phone: "",
    province: "",
    district: "",
    ward: "",
    specific_address: "",
    is_default: false,
  });
  const [addressError, setAddressError] = useState("");
  const [addressSuccess, setAddressSuccess] = useState("");

  // Checkout State
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderDescription, setOrderDescription] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Order Result State
  const [placedOrder, setPlacedOrder] = useState(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationMessage, setSimulationMessage] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("resultCode") && searchParams.has("signature") && searchParams.has("orderId")) {
      const paramsObj = {};
      searchParams.forEach((value, key) => {
        if (key === "amount" || key === "resultCode" || key === "responseTime") {
          paramsObj[key] = Number(value);
        } else {
          paramsObj[key] = value;
        }
      });
      verifyMomoPayment(paramsObj);
    } else {
      fetchCart();
      fetchAddresses();
    }
  }, [token]);

  async function verifyMomoPayment(paramsObj) {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/payments/momo-verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paramsObj),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setPlacedOrder({
          success: true,
          message: "Thanh toán ví điện tử MoMo thành công!",
          data: {
            order_id: paramsObj.orderId.split('_')[0],
            total_amount: paramsObj.amount,
            payment_method: "momo",
            payment_status: "paid"
          }
        });
        navigate("/cart", { replace: true });
      } else {
        setCheckoutError(result.message || "Xác thực thanh toán MoMo thất bại.");
        fetchCart();
        fetchAddresses();
      }
    } catch (err) {
      console.error(err);
      setCheckoutError("Lỗi kết nối xác thực thanh toán MoMo.");
      fetchCart();
      fetchAddresses();
    } finally {
      setLoading(false);
    }
  }

  // Fetch Cart Items
  async function fetchCart() {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setCartGroups(result.data || []);
        // By default select all items
        const allItemIds = [];
        (result.data || []).forEach((group) => {
          group.items.forEach((item) => {
            if (item.is_available) {
              allItemIds.push(item.cart_item_id);
            }
          });
        });
        setSelectedItems(allItemIds);
      } else {
        setCartError(result.message || "Không thể tải giỏ hàng.");
      }
    } catch (err) {
      console.error(err);
      setCartError("Không thể kết nối máy chủ giỏ hàng.");
    } finally {
      setLoading(false);
    }
  }

  // Fetch Addresses
  async function fetchAddresses() {
    try {
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setAddresses(result.data || []);
        const defaultAddr = result.data?.find((a) => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (result.data?.length > 0) {
          setSelectedAddressId(result.data[0].id);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy sổ địa chỉ:", err);
    }
  }

  // Update Cart Item Quantity
  async function handleUpdateQuantity(cartItemId, newQty, stockQty) {
    if (newQty < 1) return;
    if (newQty > stockQty) {
      alert(`⚠️ Số lượng trong kho chỉ còn tối đa ${stockQty} cái.`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart_item_id: cartItemId,
          quantity: newQty,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        // Update local state without full reload
        setCartGroups((prev) =>
          prev.map((group) => ({
            ...group,
            items: group.items.map((item) =>
              item.cart_item_id === cartItemId
                ? { ...item, quantity: newQty }
                : item
            ),
          }))
        );
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        alert(result.message || "Cập nhật số lượng thất bại.");
      }
    } catch (err) {
      console.error(err);
      alert("Không thể cập nhật số lượng.");
    }
  }

  // Remove Single Cart Item
  async function handleRemoveItem(cartItemId) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        // Remove locally
        setCartGroups((prev) =>
          prev
            .map((group) => ({
              ...group,
              items: group.items.filter((item) => item.cart_item_id !== cartItemId),
            }))
            .filter((group) => group.items.length > 0)
        );
        setSelectedItems((prev) => prev.filter((id) => id !== cartItemId));
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        alert(result.message || "Xóa sản phẩm thất bại.");
      }
    } catch (err) {
      console.error(err);
      alert("Không thể xóa sản phẩm.");
    }
  }

  // Remove Multiple Selected Items
  async function handleBulkRemove() {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để xóa.");
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedItems.length} sản phẩm đã chọn?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/bulk-delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart_item_ids: selectedItems,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        // Filter locally
        setCartGroups((prev) =>
          prev
            .map((group) => ({
              ...group,
              items: group.items.filter((item) => !selectedItems.includes(item.cart_item_id)),
            }))
            .filter((group) => group.items.length > 0)
        );
        setSelectedItems([]);
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        alert(result.message || "Không thể xóa các sản phẩm đã chọn.");
      }
    } catch (err) {
      console.error(err);
      alert("Không thể thực hiện xóa hàng loạt.");
    }
  }

  // Select item toggle
  function handleToggleSelectItem(cartItemId) {
    if (selectedItems.includes(cartItemId)) {
      setSelectedItems((prev) => prev.filter((id) => id !== cartItemId));
    } else {
      setSelectedItems((prev) => [...prev, cartItemId]);
    }
  }

  // Toggle select all items in a Shop group
  function handleToggleShopGroup(shopItems, isAllSelected) {
    const itemIds = shopItems.map((item) => item.cart_item_id);
    if (isAllSelected) {
      // Remove all items of this shop from selectedItems
      setSelectedItems((prev) => prev.filter((id) => !itemIds.includes(id)));
    } else {
      // Add all items of this shop to selectedItems
      setSelectedItems((prev) => [...new Set([...prev, ...itemIds])]);
    }
  }

  // Toggle select all items in cart
  const allAvailableItemIds = cartGroups.flatMap((group) =>
    group.items.filter((item) => item.is_available).map((item) => item.cart_item_id)
  );
  const isSelectAll =
    allAvailableItemIds.length > 0 &&
    allAvailableItemIds.every((id) => selectedItems.includes(id));

  function handleToggleSelectAll() {
    if (isSelectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allAvailableItemIds);
    }
  }

  // Calculate totals
  const totalAmountSelected = cartGroups.reduce((sum, group) => {
    return (
      sum +
      group.items.reduce((subSum, item) => {
        if (selectedItems.includes(item.cart_item_id)) {
          return subSum + item.price * item.quantity;
        }
        return subSum;
      }, 0)
    );
  }, 0);

  // Address Submit Handler
  async function handleAddAddress(e) {
    e.preventDefault();
    setAddressError("");
    setAddressSuccess("");

    if (
      !newAddress.receiver_name ||
      !newAddress.receiver_phone ||
      !newAddress.province ||
      !newAddress.district ||
      !newAddress.ward ||
      !newAddress.specific_address
    ) {
      setAddressError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/addresses/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddress),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setAddressSuccess("Thêm địa chỉ giao hàng thành công!");
        setShowAddAddress(false);
        setNewAddress({
          receiver_name: "",
          receiver_phone: "",
          province: "",
          district: "",
          ward: "",
          specific_address: "",
          is_default: false,
        });
        // Reload addresses list
        fetchAddresses();
      } else {
        setAddressError(result.message || "Thêm địa chỉ thất bại.");
      }
    } catch (err) {
      console.error(err);
      setAddressError("Có lỗi kết nối xảy ra khi tạo địa chỉ.");
    }
  }

  // Checkout Handler
  async function handleCheckout(e) {
    e.preventDefault();
    setCheckoutError("");

    if (!selectedAddressId) {
      setCheckoutError("⚠️ Vui lòng chọn địa chỉ nhận hàng.");
      return;
    }

    if (cartGroups.length === 0) {
      setCheckoutError("⚠️ Giỏ hàng trống, không thể thanh toán.");
      return;
    }

    try {
      setCheckoutLoading(true);
      const response = await fetch(`${API_BASE_URL}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_address_id: selectedAddressId,
          payment_method: paymentMethod === "cod" ? "cash_on_delivery" : paymentMethod,
          description: orderDescription,
          cart_item_ids: selectedItems,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setPlacedOrder(result);
        window.dispatchEvent(new Event("cartUpdated")); // Update badge
        
        // Handle redirect if MoMo
        if (paymentMethod === "momo" && result.data?.payUrl) {
          window.location.href = result.data.payUrl;
        }
      } else {
        setCheckoutError(result.message || "Đặt hàng thất bại.");
      }
    } catch (err) {
      console.error(err);
      setCheckoutError("Lỗi kết nối đặt hàng. Vui lòng thử lại.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  // Simulate Payment Success (Bank Transfer simulation)
  async function handleSimulatePayment() {
    if (!placedOrder?.data?.order_id) return;
    try {
      setSimulationLoading(true);
      setSimulationMessage("");
      const response = await fetch(`${API_BASE_URL}/payments/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: placedOrder.data.order_id,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSimulationMessage("🎉 " + result.message);
        // Refresh placed order info to show completed payment status
        setPlacedOrder((prev) => ({
          ...prev,
          message: "Đơn hàng đã được thanh toán và đang xử lý!",
          data: {
            ...prev.data,
            payment_status: "paid",
          },
        }));
      } else {
        setSimulationMessage("❌ " + (result.message || "Giả lập thanh toán thất bại."));
      }
    } catch (err) {
      console.error(err);
      setSimulationMessage("❌ Lỗi kết nối giả lập thanh toán.");
    } finally {
      setSimulationLoading(false);
    }
  }

  function formatMoney(amount) {
    return Math.round(Number(amount)).toLocaleString("vi-VN") + " ₫";
  }

  if (loading) {
    return (
      <div className="cart-page-loading">
        <div className="spinner"></div>
        <p>Đang tải giỏ hàng của bạn...</p>
      </div>
    );
  }

  // If order was successfully placed (and is not MoMo redirection)
  if (placedOrder && paymentMethod !== "momo") {
    const orderId = placedOrder.data?.order_id;
    const total = placedOrder.data?.total_amount;

    return (
      <div className="cart-container success-page">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Đặt hàng thành công!</h2>
          <p className="success-desc">{placedOrder.message}</p>
          <div className="order-details-box">
            <p><strong>Mã đơn hàng:</strong> #{orderId}</p>
            <p><strong>Tổng số tiền:</strong> <span className="price-text">{formatMoney(total)}</span></p>
            <p><strong>Phương thức:</strong> {paymentMethod === "bank_transfer" ? "Chuyển khoản ngân hàng" : "Thanh toán tiền mặt (COD)"}</p>
          </div>

          {paymentMethod === "bank_transfer" && (
            <div className="bank-simulation-box">
              <h3>📱 Giả lập Chuyển khoản</h3>
              <p className="simulation-hint">Hệ thống đang chạy local. Bạn hãy nhấn nút bên dưới để báo chuyển tiền thành công:</p>
              <div className="qr-sim-placeholder">
                <p><strong>Nội dung CK:</strong> SHOPMEE {orderId}</p>
                <p><strong>Số tiền:</strong> {formatMoney(total)}</p>
              </div>
              <button
                className="simulate-btn"
                onClick={handleSimulatePayment}
                disabled={simulationLoading || placedOrder.data.payment_status === "paid"}
              >
                {simulationLoading ? "Đang xử lý..." : placedOrder.data.payment_status === "paid" ? "Đã xác nhận thanh toán" : "Xác nhận chuyển khoản thành công"}
              </button>
              {simulationMessage && <p className="simulation-message">{simulationMessage}</p>}
            </div>
          )}

          <div className="success-actions">
            <button className="continue-shopping-btn" onClick={() => navigate("/")}>Tiếp tục mua sắm</button>
          </div>
        </div>
      </div>
    );
  }

  const isCartEmpty = cartGroups.length === 0;

  return (
    <div className="cart-container">
      <h1 className="cart-title">🛒 GIỎ HÀNG CỦA BẠN</h1>

      {cartError && <div className="cart-error-banner">⚠️ {cartError}</div>}

      {isCartEmpty ? (
        <div className="empty-cart-card">
          <div className="empty-icon">🛍️</div>
          <h3>Giỏ hàng của bạn đang trống!</h3>
          <p>Hãy dạo quanh cửa hàng và chọn các mặt hàng yêu thích nhé.</p>
          <button className="go-home-btn" onClick={() => navigate("/")}>
            Quay lại trang chủ
          </button>
        </div>
      ) : (
        <div className="cart-content-grid">
          {/* LEFT: Cart items list */}
          <div className="cart-items-column">
            {cartGroups.map((group) => {
              const shopId = group.shop_id;
              const shopName = group.shop_name;
              const availableItems = group.items.filter((item) => item.is_available);
              const isShopAllSelected =
                availableItems.length > 0 &&
                availableItems.every((item) => selectedItems.includes(item.cart_item_id));

              return (
                <div key={shopId} className="shop-group-card">
                  <div className="shop-header">
                    <input
                      type="checkbox"
                      className="group-checkbox"
                      checked={isShopAllSelected}
                      onChange={() => handleToggleShopGroup(group.items, isShopAllSelected)}
                    />
                    <span className="shop-tag">Cửa hàng</span>
                    <h3 className="shop-title">{shopName}</h3>
                  </div>

                  <div className="shop-items-list">
                    {group.items.map((item) => {
                      const isChecked = selectedItems.includes(item.cart_item_id);
                      return (
                        <div
                          key={item.cart_item_id}
                          className={`cart-item-row ${!item.is_available ? "out-of-stock-row" : ""}`}
                        >
                          <div className="item-checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={!item.is_available}
                              onChange={() => handleToggleSelectItem(item.cart_item_id)}
                            />
                          </div>

                          <div className="item-image-wrapper">
                            <img src={item.image_url || "https://placehold.co/120"} alt={item.product_name} />
                            {!item.is_available && <div className="oos-badge">HẾT HÀNG</div>}
                          </div>

                          <div className="item-details">
                            <h4 className="item-name" onClick={() => navigate(`/product/${item.product_id}`)}>
                              {item.product_name}
                            </h4>
                            {item.variant_name && (
                              <span className="item-variant">Phân loại: {item.variant_name}</span>
                            )}
                          </div>

                          <div className="item-price-column">
                            <span className="price-unit">{formatMoney(item.price)}</span>
                          </div>

                          <div className="item-qty-column">
                            <div className="quantity-selector">
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.cart_item_id,
                                    item.quantity - 1,
                                    item.stock_quantity
                                  )
                                }
                                disabled={item.quantity <= 1 || !item.is_available}
                              >
                                -
                              </button>
                              <span className="qty-value">{item.quantity}</span>
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.cart_item_id,
                                    item.quantity + 1,
                                    item.stock_quantity
                                  )
                                }
                                disabled={item.quantity >= item.stock_quantity || !item.is_available}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="item-total-column">
                            <span className="price-total">
                              {formatMoney(item.price * item.quantity)}
                            </span>
                          </div>

                          <div className="item-actions-column">
                            <button
                              type="button"
                              className="remove-item-btn"
                              onClick={() => handleRemoveItem(item.cart_item_id)}
                            >
                              ✕ Xóa
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Cart Actions Panel */}
            <div className="cart-actions-bar">
              <label className="select-all-label">
                <input
                  type="checkbox"
                  checked={isSelectAll}
                  onChange={handleToggleSelectAll}
                />
                Chọn tất cả ({allAvailableItemIds.length})
              </label>
              <button
                type="button"
                className="bulk-delete-btn"
                onClick={handleBulkRemove}
                disabled={selectedItems.length === 0}
              >
                Xóa mục đã chọn ({selectedItems.length})
              </button>
            </div>
          </div>

          {/* RIGHT: Address and Checkout details */}
          <div className="cart-checkout-column">
            {/* Address box */}
            <div className="checkout-card">
              <h3>📍 Địa chỉ nhận hàng</h3>
              {addresses.length === 0 && !showAddAddress && (
                <div className="no-address-box">
                  <p>Bạn chưa có địa chỉ giao hàng nào.</p>
                  <button
                    type="button"
                    className="add-addr-btn"
                    onClick={() => setShowAddAddress(true)}
                  >
                    + Thêm địa chỉ mới
                  </button>
                </div>
              )}

              {addresses.length > 0 && !showAddAddress && (
                <div className="address-select-box">
                  <select
                    className="address-dropdown"
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.receiver_name} - {addr.receiver_phone} ({addr.specific_address}, {addr.ward}, {addr.district}, {addr.province})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="add-addr-link"
                    onClick={() => setShowAddAddress(true)}
                  >
                    + Thêm địa chỉ khác
                  </button>
                </div>
              )}

              {/* Add Address Form */}
              {showAddAddress && (
                <form className="add-address-form" onSubmit={handleAddAddress}>
                  <h4>Thêm địa chỉ giao hàng mới</h4>
                  {addressError && <div className="address-error">⚠️ {addressError}</div>}
                  {addressSuccess && <div className="address-success">✓ {addressSuccess}</div>}

                  <div className="form-group">
                    <label>Họ tên người nhận *</label>
                    <input
                      type="text"
                      placeholder="Nguyen Van A..."
                      value={newAddress.receiver_name}
                      onChange={(e) =>
                        setNewAddress((prev) => ({ ...prev, receiver_name: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Số điện thoại *</label>
                    <input
                      type="tel"
                      placeholder="09xxxxxxxx..."
                      value={newAddress.receiver_phone}
                      onChange={(e) =>
                        setNewAddress((prev) => ({ ...prev, receiver_phone: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tỉnh/Thành phố *</label>
                      <input
                        type="text"
                        placeholder="Hồ Chí Minh..."
                        value={newAddress.province}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, province: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Quận/Huyện *</label>
                      <input
                        type="text"
                        placeholder="Quận 1..."
                        value={newAddress.district}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, district: e.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Phường/Xã *</label>
                      <input
                        type="text"
                        placeholder="Phường Bến Nghé..."
                        value={newAddress.ward}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, ward: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Số nhà, Tên đường *</label>
                      <input
                        type="text"
                        placeholder="123 Nguyễn Huệ..."
                        value={newAddress.specific_address}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, specific_address: e.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={newAddress.is_default}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, is_default: e.target.checked }))
                        }
                      />
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="save-address-btn">
                      Lưu địa chỉ
                    </button>
                    <button
                      type="button"
                      className="cancel-address-btn"
                      onClick={() => setShowAddAddress(false)}
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Payment & Order Summary box */}
            <div className="checkout-card payment-card">
              <h3>💳 Phương thức thanh toán</h3>
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <div className="option-info">
                    <strong>COD</strong>
                    <span>Thanh toán tiền mặt khi giao hàng</span>
                  </div>
                </label>



                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment_method"
                    value="momo"
                    checked={paymentMethod === "momo"}
                    onChange={() => setPaymentMethod("momo")}
                  />
                  <div className="option-info">
                    <strong>Ví MoMo</strong>
                    <span>Cổng thanh toán điện tử MoMo</span>
                  </div>
                </label>
              </div>

              <div className="form-group description-group">
                <label>Lời nhắn cho cửa hàng (Tùy chọn)</label>
                <textarea
                  placeholder="Lưu ý giao hàng, giờ giao..."
                  value={orderDescription}
                  onChange={(e) => setOrderDescription(e.target.value)}
                />
              </div>

              <div className="order-summary-box">
                <div className="summary-row">
                  <span>Số lượng đã chọn:</span>
                  <span>{selectedItems.length} sản phẩm</span>
                </div>
                <div className="summary-row total-row">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="final-price">{formatMoney(totalAmountSelected)}</span>
                </div>
              </div>

              {checkoutError && <div className="checkout-error-banner">{checkoutError}</div>}

              <button
                type="button"
                className="checkout-submit-btn"
                onClick={handleCheckout}
                disabled={checkoutLoading || selectedItems.length === 0}
              >
                {checkoutLoading ? "Đang xử lý đặt hàng..." : "ĐẶT HÀNG NGAY"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
