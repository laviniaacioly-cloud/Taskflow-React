import "./App.css";
import { Route, Routes } from "react-router-dom";
import Sobre from "./Pages/Sobre";
import Login from "./Pages/Login";
import Sidebar from "./componentes/Sidebar";
import RotaPrivada from "./componentes/RotaPrivada";
import Kanban from "./componentes/Kanban";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-conteudo">
        <Routes>

          <Route
            path="/"
            element={
              <RotaPrivada>
                <Kanban/>
              </RotaPrivada>
            }
          />

          <Route path="/sobre" element={<Sobre />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="*"
            element={<h1>Página não encontrada</h1>}
          />

        </Routes>
      </main>
    </div>
  );
}

export default App;