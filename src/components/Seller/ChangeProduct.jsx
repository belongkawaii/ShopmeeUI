import { useEffect, useState } from "react";
import {
  getSellerProducts,
  updateSellerProduct,
} from "../../pages/Seller/sellerApi";

function ChangeProduct() {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    variants: [],
  });

  useEffect(() => {
    loadProducts();
  }, []);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await updateSellerProduct(
      selectedId,
      formData
    );

    alert(result.message);
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

          <button className="submit-btn">
            Cập nhật sản phẩm
          </button>
        </>
      )}
    </form>
  );
}

export default ChangeProduct;