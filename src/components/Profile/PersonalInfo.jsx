import { useEffect, useState } from "react";
import {
  getProfile,
  updateProfile,
} from "../../pages/Profile/profileApi";

function PersonalInfo() {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const result = await getProfile();

      if (result.success) {
        setUser(result.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await updateProfile({
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    alert(result.message);
  };

  if (loading) {
    return <h3>Đang tải dữ liệu...</h3>;
  }

  return (
    <>
      <h2>Thông tin cá nhân</h2>

      <form
        className="profile-form"
        onSubmit={handleSubmit}
      >
        <div className="input-group">
          <label>Họ tên</label>

          <input
            name="name"
            value={user.name}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Email</label>

          <input
          name="email"
            value={user.email}
            disabled
          />
        </div>

        <div className="input-group">
          <label>Số điện thoại</label>

          <input
            name="phone"
            value={user.phone}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Vai trò</label>

          <input
            value={user.role}
            disabled
          />
        </div>

        <button
          type="submit"
          className="save-btn"
        >
          Lưu thay đổi
        </button>
      </form>
    </>
  );
}

export default PersonalInfo;