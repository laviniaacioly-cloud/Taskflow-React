import { useState, useEffect } from "react";
import styles from "./ModalTarefa.module.css";
import { mensagensDeErro } from "../api";

function ModalTarefa({
  aberto,
  onFechar,
  onSalvar,
  tarefa = null,
  coluna = "afazer",
  prioridades = [],
  usuarios = [],
  projetos = [],
}) {
  const [texto, setTexto] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [usuarioId, setUsuarioId] = useState("");
  const [projetoId, setProjetoId] = useState("");
  const [erros, setErros] = useState([]);
  const [salvando, setSalvando] = useState(false);

  // PREENCHER O MODAL

  useEffect(() => {
    if (aberto) {
      if (tarefa) {
        setTexto(tarefa.texto || "");
        setPrioridade(tarefa.prioridade || "media");
        setUsuarioId(tarefa.usuario_id ?? tarefa.usuarioId ?? "");
        setProjetoId(tarefa.projeto_id ?? tarefa.projetoId ?? "");
      } else {
        setTexto("");
        setPrioridade("media");
        setUsuarioId("");
        setProjetoId("");
      }
    }
  }, [tarefa, aberto]);

  // FECHAR MODAL COM ESC

  useEffect(() => {
    // Só registra o evento quando o modal estiver aberto
    if (!aberto) return;

    function handleEsc(e) {
      if (e.key === "Escape") {
        onFechar();
      }
    }

    // Registra o evento
    document.addEventListener("keydown", handleEsc);

    // Remove o evento quando o modal fechar
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [aberto, onFechar]);

  // SALVAR

  async function handleSalvar() {
    setErros([]);
    setSalvando(true);

    try {
      await onSalvar({
        id: tarefa?.id,
        texto,
        prioridade,
        usuarioId: Number(usuarioId),
        projetoId: Number(projetoId),
        coluna: tarefa?.coluna || coluna,
      });

      onFechar();
    } catch (e) {
      setErros(mensagensDeErro(e));
    } finally {
      setSalvando(false);
    }
  }

  // MODAL FECHADO
  if (!aberto) return null;

  // MODAL
  return (
    <div className={styles.overlay} onClick={onFechar}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <h2>{tarefa ? "Editar tarefa" : "Nova tarefa"}</h2>

        <input
          placeholder="Texto da tarefa"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />

        <select
          value={prioridade}
          onChange={(e) => setPrioridade(e.target.value)}
        >
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>

        <label>
          Usuário responsável
          <select
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
          >
            <option value="">Selecione um usuário</option>
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nome}
              </option>
            ))}
          </select>
        </label>

        <label>
          Projeto
          <select
            value={projetoId}
            onChange={(e) => setProjetoId(e.target.value)}
          >
            <option value="">Selecione um projeto</option>
            {projetos.map((projeto) => (
              <option key={projeto.id} value={projeto.id}>
                {projeto.nome}
              </option>
            ))}
          </select>
        </label>

        {erros.length > 0 && (
          <ul className={styles.erros}>
            {erros.map((mensagem, i) => (
              <li key={i}>{mensagem}</li>
            ))}
          </ul>
        )}

        <div className={styles.botoes}>
          <button onClick={onFechar} disabled={salvando}>
            Cancelar
          </button>

          <button onClick={handleSalvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default ModalTarefa;
