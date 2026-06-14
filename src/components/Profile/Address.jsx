import { useEffect, useState } from "react";

import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../../pages/Profile/profileApi";

function Address() {
  const [addresses, setAddresses] = useState([]);

  const [editingId, setEditingId] =
    useState(null);

  const emptyForm = {
    receiver_name: "",
    receiver_phone: "",
    province: "",
    district: "",
    ward: "",
    specific_address: "",
    is_default: false,
  };

  const [form, setForm] =
    useState(emptyForm);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    const result = await getAddresses();

    if (result.success) {
      setAddresses(result.data);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;

    if (editingId) {
      result = await updateAddress(
        editingId,
        form
      );
    } else {
      result = await createAddress(form);
    }

    alert(result.message);

    resetForm();
    loadAddresses();
  };

  const handleEdit = (address) => {
    setEditingId(address.id);

    setForm({
      receiver_name:
        address.receiver_name,
      receiver_phone:
        address.receiver_phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      specific_address:
        address.specific_address,
      is_default:
        address.is_default,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn xóa địa chỉ này?"
      )
    ) {
      return;
    }

    const result = await deleteAddress(id);

    alert(result.message);

    loadAddresses();
  };

  return (
    <div>
      <h2>
        {editingId
          ? "Chỉnh sửa địa chỉ"
          : "Thêm địa chỉ mới"}
      </h2>

      <form
        className="profile-form"
        onSubmit={handleSubmit}
      >
        <div className="input-group">
          <label>Người nhận</label>
          <input
            name="receiver_name"
            value={form.receiver_name}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Số điện thoại</label>
          <input
            name="receiver_phone"
            value={form.receiver_phone}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Tỉnh / Thành phố</label>
          <input
            name="province"
            value={form.province}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Quận / Huyện</label>
          <input
            name="district"
            value={form.district}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Phường / Xã</label>
          <input
            name="ward"
            value={form.ward}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>
            Địa chỉ cụ thể
          </label>

          <input
            name="specific_address"
            value={
              form.specific_address
            }
            onChange={handleChange}
          />
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            name="is_default"
            checked={
              form.is_default
            }
            onChange={handleChange}
          />
          Đặt làm địa chỉ mặc định
        </label>

        <div className="address-actions">
          <button
            className="save-btn"
            type="submit"
          >
            {editingId
              ? "Cập nhật"
              : "Thêm địa chỉ"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-btn"
              onClick={resetForm}
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      <hr
        style={{
          margin: "30px 0",
        }}
      />

      <h2>Danh sách địa chỉ</h2>

      <div className="address-list">
        {addresses.map(
          (address) => (
            <div
              className="address-card"
              key={address.id}
            >
              <div>
                <h3>
                  {
                    address.receiver_name
                  }
                </h3>

                <p>
                  {
                    address.receiver_phone
                  }
                </p>

                <p>
                  {
                    address.province
                  }
                  {" - "}
                  {
                    address.district
                  }
                  {" - "}
                  {address.ward}
                </p>

                <p>
                  {
                    address.specific_address
                  }
                </p>

                {address.is_default && (
                  <span className="default-badge">
                    Mặc định
                  </span>
                )}
              </div>

              <div className="address-buttons">
                <button
                  onClick={() =>
                    handleEdit(
                      address
                    )
                  }
                >
                  Sửa
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(
                      address.id
                    )
                  }
                >
                  Xóa
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Address;