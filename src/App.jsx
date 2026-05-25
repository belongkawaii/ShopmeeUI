import './App.css'
import MainLayout from "./layouts/MainLayout";
import Hero from "./components/Banner/Hero.jsx";

function App() {
  return (
    <MainLayout>
      <Hero />
      <section style={{ padding: '40px' }}>
        <h2>Sản phẩm nổi bật
      
        </h2>
        {/* List sản phẩm của bạn */}
      </section>
    </MainLayout>
  );
}

export default App