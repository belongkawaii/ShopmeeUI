import { useEffect, useState } from "react";
import {
  getSellerProducts,
  updateSellerProduct,
} from "../../pages/Seller/sellerApi";
import { useSellerAlert } from "../../layouts/SellerLayout";

function ChangeProduct({ initialProductId }) {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const { showAlert } = useSellerAlert();

  const [existingImages, setExistingImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    variants: [],
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (initialProductId && products.length > 0) {
      handleSelectProduct(initialProductId);
    }
  }, [initialProductId, products]);

  const loadProducts = async () => {
    const result = await getSellerProducts();

    if (result.success) {
      setProducts(result.data);
    }
  };

  const handleSelectProduct = (id) => {
    const product = products.find(
      (item) => item.id === Number(id)
    );

    if (!product) return;

    setSelectedId(id);

    setFormData({
      category_id: product.category_id,
      name: product.name,
      description: product.description,
      variants: product.variants || [],
    });

    setExistingImages(product.images || []);
    setDeletedImageIds([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: field === "price" || field === "stock_quantity" ? Number(value) : value,
    };
    setFormData({
      ...formData,
      variants: updatedVariants,
    });
  };

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          sku: "",
          variant_name: "",
          price: 0,
          stock_quantity: 0,
        },
      ],
    });
  };

  const handleRemoveVariant = (index) => {
    if (formData.variants.length <= 1) {
      showAlert("Sản phẩm phải có ít nhất một biến thể!", "error");
      return;
    }
    const updatedVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      variants: updatedVariants,
    });
  };

  const handleRemoveExistingImage = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    setDeletedImageIds((prev) => [...prev, imageId]);
  };

  const handleAddNewImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setNewImageFiles((prev) => [...prev, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("_method", "PUT");
    form.append("category_id", formData.category_id);
    form.append("name", formData.name);
    form.append("description", formData.description);
    form.append("variants", JSON.stringify(formData.variants));
    form.append("deleted_image_ids", JSON.stringify(deletedImageIds));

    newImageFiles.forEach((file) => {
      form.append("images[]", file);
    });

    const result = await updateSellerProduct(selectedId, form);

    if (result.success) {
      await showAlert("Cập nhật thông tin sản phẩm và ảnh thành công!", "success");
      
      const updatedProductsResult = await getSellerProducts();
      if (updatedProductsResult.success) {
        setProducts(updatedProductsResult.data);
        
        const updatedProduct = updatedProductsResult.data.find(p => p.id === Number(selectedId));
        if (updatedProduct) {
          setFormData({
            category_id: updatedProduct.category_id,
            name: updatedProduct.name,
            description: updatedProduct.description,
            variants: updatedProduct.variants || [],
          });
          setExistingImages(updatedProduct.images || []);
        }
      }
      setDeletedImageIds([]);
      setNewImageFiles([]);
      setNewImagePreviews([]);
    } else {
      await showAlert(result.message || "Cập nhật thất bại.", "error");
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h2>Chỉnh sửa sản phẩm</h2>

      <div className="input-group">
        <label>Chọn sản phẩm</label>

        <select
          value={selectedId}
          onChange={(e) =>
            handleSelectProduct(e.target.value)
          }
        >
          <option value="">
            Chọn sản phẩm
          </option>

          {products.map((product) => (
            <option
              key={product.id}
              value={product.id}
            >
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {selectedId && (
        <>
          <div className="input-group">
            <label>Tên sản phẩm</label>

            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="input-group">
            <label>Mô tả</label>

            <textarea
              rows="4"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              required
            />
          </div>

          {/* Hộp Ảnh Sản phẩm */}
          <div className="images-section" style={{ marginTop: "20px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "10px" }}>
              Ảnh sản phẩm hiện có & Thêm mới
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              {/* Ảnh hiện có */}
              {existingImages.map((img) => (
                <div key={img.id} style={{ position: "relative", width: "90px", height: "90px", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                  <img src={img.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(img.id)}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      background: "rgba(239, 68, 68, 0.9)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                    title="Xóa ảnh này"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Ảnh mới chuẩn bị tải lên */}
              {newImagePreviews.map((previewUrl, index) => (
                <div key={index} style={{ position: "relative", width: "90px", height: "90px", borderRadius: "8px", border: "1px solid #3b82f6", overflow: "hidden" }}>
                  <img src={previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span style={{ position: "absolute", bottom: "4px", left: "4px", backgroundColor: "#3b82f6", color: "white", padding: "1px 4px", borderRadius: "4px", fontSize: "8px" }}>
                    Mới
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      background: "rgba(239, 68, 68, 0.9)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Ô vuông dấu + thêm ảnh */}
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "90px",
                  height: "90px",
                  borderRadius: "8px",
                  border: "2px dashed #cbd5e1",
                  backgroundColor: "#f8fafc",
                  cursor: "pointer",
                  transition: "border-color 0.2s, background-color 0.2s"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f6";
                  e.currentTarget.style.backgroundColor = "#eff6ff";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "#cbd5e1";
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
              >
                <span style={{ fontSize: "20px", color: "#64748b", fontWeight: "bold" }}>+</span>
                <span style={{ fontSize: "10px", color: "#64748b" }}>Thêm ảnh</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAddNewImages}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          <div className="variants-section" style={{ marginTop: "20px" }}>
            <h3 style={{ marginBottom: "15px", color: "#374151" }}>Danh sách các biến thể</h3>
            {formData.variants.map((variant, index) => (
              <div
                key={variant.id || index}
                className="variant-card-edit"
                style={{
                  marginBottom: "15px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "15px",
                  backgroundColor: "#f9fafb"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <h4 style={{ margin: 0, color: "#4b5563", fontSize: "14px" }}>
                    Biến thể #{index + 1}: {variant.variant_name || "Chưa đặt tên"}
                  </h4>
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      ✕ Xóa biến thể
                    </button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div className="input-group">
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563" }}>
                      Tên biến loại (VD: Đỏ - M)
                    </label>
                    <input
                      type="text"
                      value={variant.variant_name || ""}
                      onChange={(e) =>
                        handleVariantChange(index, "variant_name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563" }}>
                      Mã SKU
                    </label>
                    <input
                      type="text"
                      value={variant.sku || ""}
                      onChange={(e) =>
                        handleVariantChange(index, "sku", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563" }}>
                      Giá bán (đ)
                    </label>
                    <input
                      type="number"
                      value={variant.price ?? 0}
                      onChange={(e) =>
                        handleVariantChange(index, "price", e.target.value)
                      }
                      min="0"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563" }}>
                      Số lượng tồn kho
                    </label>
                    <input
                      type="number"
                      value={variant.stock_quantity ?? 0}
                      onChange={(e) =>
                        handleVariantChange(index, "stock_quantity", e.target.value)
                      }
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddVariant}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "2px dashed #cbd5e1",
                backgroundColor: "#f8fafc",
                color: "#475569",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                textAlign: "center",
                marginTop: "10px",
                transition: "border-color 0.2s, background-color 0.2s"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#3b82f6";
                e.currentTarget.style.backgroundColor = "#eff6ff";
                e.currentTarget.style.color = "#2563eb";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#cbd5e1";
                e.currentTarget.style.backgroundColor = "#f8fafc";
                e.currentTarget.style.color = "#475569";
              }}
            >
              + Thêm biến thể mới
            </button>
          </div>

          <button className="submit-btn" style={{ marginTop: "15px" }}>
            Cập nhật sản phẩm
          </button>
        </>
      )}
    </form>
  );
}

export default ChangeProduct;