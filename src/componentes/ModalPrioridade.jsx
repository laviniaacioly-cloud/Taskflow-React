
import { useState, useEffect } from "react";
import api from "../api";
import styles from "./ModalPrioridade.module.css";

function ModalPrioridade({
  aberto,
  onFechar,
  onCadastrada,
  prioridadeEditando = null,
  onEditada,
}) {
  const [descricao, setDescricao] = useState("");
  const [cor, setCor] = useState("#FF9800");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const editando = Boolean(prioridadeEditando);

  useEffect(() => {
    if (!aberto) return;

    setDescricao(prioridadeEditando?.descricao || "");
    setCor(prioridadeEditando?.cor || "#FF9800");
    setErro("");
  }, [aberto, prioridadeEditando]);

  if (!aberto) return null;

  async function handleSalvar() {
    if (!descricao.trim()) {
      setErro("Informe o nome da prioridade.");
      return;
    }

    setErro("");
    setSalvando(true);

    try {
      const dados = {
        descricao: descricao.trim(),
        cor: cor.toUpperCase(),
      };

      if (editando) {
        const resposta = await api.put(
          `/prioridades/${prioridadeEditando.id}`,
          dados
        );

        onEditada(resposta.data);
      } else {
        const resposta = await api.post("/prioridades", dados);

        onCadastrada(resposta.data);
      }

      onFechar();
    } catch (e) {
      setErro(
        e.response?.data?.erro?.mensagem ||
          e.response?.data?.erro ||
          "Não foi possível salvar a prioridade."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className={styles.overlay}
      onClick={() => !salvando && onFechar()}
    >
      <div
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{editando ? "Editar prioridade" : "Nova prioridade"}</h2>

        <div className={styles.campo}>
          <label htmlFor="prioridade-descricao">
            Nome da prioridade
          </label>
          <input
            id="prioridade-descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex.: Urgente"
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="prioridade-cor">Escolha uma cor</label>
          <input
            id="prioridade-cor"
            type="color"
            value={cor}
            onChange={(e) => setCor(e.target.value.toUpperCase())}
            style={{ width: "70px", height: "42px", padding: "3px" }}
          />
          <span>{cor}</span>
        </div>

        {erro && <p role="alert">{erro}</p>}

        <div className={styles.botoes}>
          <button
            type="button"
            onClick={onFechar}
            disabled={salvando}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSalvar}
            disabled={salvando}
          >
            {salvando
              ? "Salvando..."
              : editando
                ? "Salvar alterações"
                : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalPrioridade;
