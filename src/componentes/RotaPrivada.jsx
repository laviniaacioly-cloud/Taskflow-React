import { Navigate } from "react-router-dom";
import { useAuth } from '../Contexts/AuthContext';

function RotaPrivada({ children }) {
  const { token } = useAuth();
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    // Usuário logado → renderiza o componente filho
    return children;
}

export default RotaPrivada;
