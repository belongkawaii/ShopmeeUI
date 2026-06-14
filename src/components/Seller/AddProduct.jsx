import { useState } from "react";
import { addSellerProduct } from "../../pages/Seller/sellerApi";
import { useSellerAlert } from "../../layouts/SellerLayout";

function AddProduct() {
  const [loading, setLoading] = useState(false);
  const { showAlert } = useSellerAlert();

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    images: [],
    variants: [
      {
        sku: "",
        variant_name: "",
        price: "",
        stock_quantity: "",
      },
    ],
  });

  const categories = [
    { id: 1, name: "Thiết bị điện tử" },
    { id: 2, name: "Thời trang" },
    { id: 3, name: "Nhà cửa & Đời sống" },
    { id: 4, name: "Sức khỏe & Làm đẹp" },
    { id: 5, name: "Sách" },
    { id: 6, name: "Thể thao & Dã ngoại" },
  ];

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

      formData.images.forEach((img) => {
        form.append("images[]", img);
      });

      const result = await addSellerProduct(form);

      if (result.success) {
        await showAlert(result.message || "Đăng sản phẩm thành công!", "success");
        setFormData({
          category_id: "",
          name: "",
          description: "",
          images: [],
          variants: [
            {
              sku: "",
              variant_name: "",
              price: "",
              stock_quantity: "",
            },
          ],
        });
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
        />
      </div>

      <div className="input-group">
        <label>Ảnh sản phẩm</label>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) =>
            setFormData({
              ...formData,
              images: [...e.target.files],
            })
          }
        />
      </div>

      <div className="preview-grid">
        {formData.images.map((file, index) => (
          <img
            key={index}
            src={URL.createObjectURL(file)}
            alt=""
          />
        ))}
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
      >
        + Thêm biến thể
      </button>

      <button
        type="submit"
        className="submit-btn"
        disabled={loading}
      >
        {loading ? "Đang đăng..." : "Đăng sản phẩm"}
      </button>
    </form>
  );
}

export default AddProduct;