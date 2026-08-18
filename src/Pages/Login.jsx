import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import "./Login.css";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [shake, setShake] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  function handleLogin() {
    if (usuario === "admin" && senha === "1234") {
      login();
      navigate("/");
      return;
    }

    setErro("Usuário ou senha incorretos");

    // inicia o shake
    setShake(false);

    // força o React a reiniciar a animação
    setTimeout(() => {
      setShake(true);
    }, 10);

    // remove a classe depois da animação
    setTimeout(() => {
      setShake(false);
    }, 510);
  }

  return (
    <div className="login-container">

      <div className={`login-card ${shake ? "shake" : ""}`}>

        <h1 className="login-logo">
          TaskFlow
        </h1>

        <p className="login-subtitulo">
          Faça login para continuar
        </p>

        <input
          className="login-input"
          type="text"
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
        />

        {erro && (
          <p className="login-erro">
            {erro}
          </p>
        )}

        <button
          className="login-btn"
          onClick={handleLogin}
        >
          Entrar
        </button>

        <p className="login-aviso">
          Este login é apenas para fins didáticos.
          Credenciais reais vêm no módulo back-end.
        </p>

      </div>

    </div>
  );
}

export default Login;