import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";

function MainLayout({ children }) {
  return (
    <div className="app-container">
      <Header />
      
      <main style={{ flex: "1" }}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
}

export default MainLayout;