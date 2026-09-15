import "./App.css";
import { Route, Routes } from "react-router-dom";
import Sobre from "./Pages/Sobre";
import Login from "./Pages/Login";
import Sidebar from "./componentes/Sidebar";
import RotaPrivada from "./componentes/RotaPrivada";
import Kanban from "./componentes/Kanban";
import { useAuth } from "./Contexts/AuthContext";

function App() {
  const { token } = useAuth();

  return (
    <div className="app-layout">
      {token && <Sidebar />}

      <main
        className="app-conteudo"
        style={{ marginLeft: token ? "220px" : "0" }}
      >
        <Routes>
          <Route
            path="/"
            element={
              <RotaPrivada>
                <Kanban />
              </RotaPrivada>
            }
          />

          <Route path="/sobre" element={<Sobre />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<h1>Página não encontrada</h1>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
