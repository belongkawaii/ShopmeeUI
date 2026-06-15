import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../../components/Banner/Hero";
import "./Home.css";
import { API_BASE_URL } from "../../config";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const navigate = useNavigate();

  useEffect(function () {
    fetchProducts();
    fetchCategories();
  }, []);

  function fetchCategories() {
    fetch(`${API_BASE_URL}/categories`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setCategories(result.data || []);
        }
      })
      .catch((err) => console.error("Lỗi lấy danh mục:", err));
  }

  function fetchProducts(page = 1, categoryId = selectedCategory) {
    setLoading(true);

    let url = `${API_BASE_URL}/products?page=${page}`;
    if (categoryId) {
      url += `&category_id=${categoryId}`;
    }

    fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        setProducts(
          result.data.data.filter(
            (product) => product.status === "active"
          )
        );

        setCurrentPage(result.data.meta.current_page);
        setLastPage(result.data.meta.last_page);

        setLoading(false);
      })
      .catch(function (error) {
        console.error("Lỗi API:", error);
        setLoading(false);
      });
  }

  function searchProducts(page = 1) {
    setLoading(true);
    setSelectedCategory(null); // Clear selected category when search is executed

    fetch(
      `${API_BASE_URL}/products/search?keyword=${encodeURIComponent(
        keyword
      )}&page=${page}`
    )
      .then((response) => response.json())
      .then((result) => {
        setProducts(
          result.data.data.filter(
            (product) => product.status === "active"
          )
        );

        setCurrentPage(
          result.data.meta.current_page
        );

        setLastPage(
          result.data.meta.last_page
        );

        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi tìm kiếm:", error);
        setLoading(false);
      });
  }

  function handleCategorySelect(categoryId) {
    setSelectedCategory(categoryId);
    setKeyword(""); // Clear keyword when filter is selected
    fetchProducts(1, categoryId);
  }

  function handleViewDetail(id) {
    navigate(`/product/${id}`);
  }

  function formatPrice(price) {
    return (
      Math.round(Number(price)).toLocaleString("vi-VN") + "₫"
    );
  }

  function calculateOldPrice(price) {
    return (
      Math.round(Number(price) * 1.2).toLocaleString("vi-VN") +
      "₫"
    );
  }

  return (
    <>
      <Hero />

      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="search-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchProducts();
            }
          }}
        />

        <button
          className="search-btn"
          onClick={searchProducts}
        >
          🔍 Tìm kiếm
        </button>

        <button
          className="reset-icon-btn"
          title="Làm mới"
          onClick={() => {
            setKeyword("");
            setSelectedCategory(null);
            fetchProducts(1, null);
          }}
        >
          ⟳
        </button>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="categories-container">
          <button
            className={`category-tab ${selectedCategory === null ? "active" : ""}`}
            onClick={() => handleCategorySelect(null)}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-tab ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => handleCategorySelect(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <section className="products-section">
        <h2 className="products-title">
          🔥 SẢN PHẨM NỔI BẬT
        </h2>

        {loading ? (
          <div className="skeleton-grid">
            {[...Array(8)].map(function (_, index) {
              return (
                <div
                  key={index}
                  className="skeleton-card"
                ></div>
              );
            })}
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map(function (product) {
                const firstVariant =
                  product.variants?.[0];

                const image =
                  product.images?.[0]?.image_url;

                const price =
                  firstVariant?.price || 0;

                const stock =
                  firstVariant?.stock_quantity || 0;

                return (
                  <div
                    className="product-card"
                    key={product.id}
                    onClick={() => handleViewDetail(product.id)}
                  >
                    <span className="hot-badge">
                      HOT
                    </span>

                    <span className="discount-badge">
                      -20%
                    </span>

                    <div className="product-image-wrapper">
                      <img
                        src={image}
                        alt={product.name}
                        className="product-image"
                      />

                      <div className="product-overlay">
                        <button
                          className="detail-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(product.id);
                          }}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">
                        {product.name}
                      </h3>

                      <div className="rating">
                        ⭐ {product.rating_count > 0 ? `${product.rating_avg} (${product.rating_count})` : "Chưa có đánh giá"}
                      </div>

                      <div className="price-box">
                        <span className="old-price">
                          {calculateOldPrice(
                            price
                          )}
                        </span>

                        <span className="new-price">
                          {formatPrice(price)}
                        </span>
                      </div>

                      <div className="stock">
                        Còn lại: {stock}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pagination">
              {[...Array(lastPage)].map(
                function (_, index) {
                  const page = index + 1;

                  return (
                    <button
                      key={page}
                      className={
                        currentPage === page
                          ? "page-btn active"
                          : "page-btn"
                      }
                      onClick={function () {
                        fetchProducts(page);
                      }}
                    >
                      {page}
                    </button>
                  );
                }
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
}

export default Home;