import { Navigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

function RotaPrivada({ children }) {
  const { logado } = useAuth();
    if (!logado) {
      return <Navigate to="/login" replace />;
    }
    // Usuário logado → renderiza o componente filho
    return children;
}

export default RotaPrivada;
