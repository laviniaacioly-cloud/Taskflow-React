import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { useAuth } from "../Contexts/AuthContext";

function Sidebar() {
  const { logado, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    isActive
      ? `${styles.link} ${styles.ativo}`
      : styles.link;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className={styles.sidebar}>
      
      <div className={styles.logo}>
        <h1>TaskFlow</h1>
      </div>

      <nav className={styles.nav}>
        {logado && (
          <NavLink to="/" className={linkClass}>
            Dashboard
          </NavLink>
        )}

        <NavLink to="/sobre" className={linkClass}>
          Sobre
        </NavLink>
      </nav>

      {logado && (
        <button
          className={styles.botaoSair}
          onClick={handleLogout}
        >
          Sair
        </button>
      )}

    </aside>
  );
}

export default Sidebar;