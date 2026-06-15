import { useEffect, useState } from "react";
import { addSellerProduct } from "../../pages/Seller/sellerApi";
import { useSellerAlert } from "../../layouts/SellerLayout";
import { API_BASE_URL } from "../../config";

function AddProduct() {
  const [loading, setLoading] = useState(false);
  const { showAlert } = useSellerAlert();

  const [categories, setCategories] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    variants: [
      {
        sku: "",
        variant_name: "",
        price: "",
        stock_quantity: "",
      },
    ],
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setCategories(result.data || []);
        }
      })
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  const handleVariantChange = (index, field, value) => {
    const updated = [...formData.variants];
    updated[index][field] = value;

    setFormData({
      ...formData,
      variants: updated,
    });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          sku: "",
          variant_name: "",
          price: "",
          stock_quantity: "",
        },
      ],
    });
  };

  const removeVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
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

    try {
      setLoading(true);

      const form = new FormData();

      form.append("category_id", formData.category_id);
      form.append("name", formData.name);
      form.append("description", formData.description);

      form.append(
        "variants",
        JSON.stringify(formData.variants)
      );

      newImageFiles.forEach((img) => {
        form.append("images[]", img);
      });

      const result = await addSellerProduct(form);

      if (result.success) {
        await showAlert(result.message || "Đăng sản phẩm thành công!", "success");
        setFormData({
          category_id: "",
          name: "",
          description: "",
          variants: [
            {
              sku: "",
              variant_name: "",
              price: "",
              stock_quantity: "",
            },
          ],
        });
        setNewImageFiles([]);
        setNewImagePreviews([]);
      } else {
        await showAlert(result.message || "Đăng sản phẩm thất bại.", "error");
      }
    } catch (error) {
      console.error(error);
      await showAlert("Có lỗi xảy ra khi thêm sản phẩm.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h2>Thêm sản phẩm</h2>

      <div className="input-group">
        <label>Danh mục</label>

        <select
          value={formData.category_id}
          onChange={(e) =>
            setFormData({
              ...formData,
              category_id: e.target.value,
            })
          }
          required
        >
          <option value="">Chọn danh mục</option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

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
      <div className="images-section" style={{ marginTop: "20px", marginBottom: "20px" }}>
        <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "10px" }}>
          Ảnh sản phẩm
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          {/* Ảnh mới chuẩn bị tải lên */}
          {newImagePreviews.map((previewUrl, index) => (
            <div key={index} style={{ position: "relative", width: "90px", height: "90px", borderRadius: "8px", border: "1px solid #3b82f6", overflow: "hidden" }}>
              <img src={previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                title="Xóa ảnh này"
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

      <h3>Biến thể sản phẩm</h3>

      {formData.variants.map((variant, index) => (
        <div className="variant-card" key={index}>
          <input
            placeholder="SKU"
            value={variant.sku}
            onChange={(e) =>
              handleVariantChange(
                index,
                "sku",
                e.target.value
              )
            }
            required
          />

          <input
            placeholder="Tên biến thể"
            value={variant.variant_name}
            onChange={(e) =>
              handleVariantChange(
                index,
                "variant_name",
                e.target.value
              )
            }
            required
          />

          <input
            type="number"
            placeholder="Giá"
            value={variant.price}
            onChange={(e) =>
              handleVariantChange(
                index,
                "price",
                e.target.value
              )
            }
            required
          />

          <input
            type="number"
            placeholder="Tồn kho"
            value={variant.stock_quantity}
            onChange={(e) =>
              handleVariantChange(
                index,
                "stock_quantity",
                e.target.value
              )
            }
            required
          />

          <button
            type="button"
            className="danger-btn"
            onClick={() => removeVariant(index)}
          >
            Xóa
          </button>
        </div>
      ))}

      <button
        type="button"
        className="secondary-btn"
        onClick={addVariant}
        style={{ marginTop: "10px" }}
      >
        + Thêm biến thể
      </button>

      <button
        type="submit"
        className="submit-btn"
        disabled={loading}
        style={{ marginTop: "20px" }}
      >
        {loading ? "Đang đăng..." : "Đăng sản phẩm"}
      </button>
    </form>
  );
}

export default AddProduct;