import { useEffect, useState } from "react";

function Shops() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    async function loadShops() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://127.0.0.1:8000/api/v1/admin/shops",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (result.success) {
          setShops(result.data || []);
        } else {
          console.error(result.message);
          setShops([]);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách shop:", error);
      }
    }

    loadShops();
  }, []);

  async function approveShop(id) {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/admin/shops/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "active",
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Duyệt shop thành công!");

        // Reload danh sách
        const reloadResponse = await fetch(
          "http://127.0.0.1:8000/api/v1/admin/shops",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const reloadResult =
          await reloadResponse.json();

        setShops(reloadResult.data || []);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Lỗi duyệt shop:", error);
    }
  }

  return (
    <div>
      <h1>Quản lý Shop</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên Shop</th>
            <th>Chủ Shop</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {shops.length > 0 ? (
            shops.map((shop) => (
              <tr key={shop.id}>
                <td>{shop.id}</td>

                <td>{shop.name}</td>

                <td>{shop.owner?.name}</td>

                <td>{shop.status}</td>

                <td>
                  {shop.status !== "active" && (
                    <button
                      onClick={() =>
                        approveShop(shop.id)
                      }
                    >
                      Duyệt
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">
                Không có dữ liệu shop
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Shops;