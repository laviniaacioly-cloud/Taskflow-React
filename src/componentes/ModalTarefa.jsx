
import { useState, useEffect } from "react";
import styles from "./ModalTarefa.module.css";
import { mensagensDeErro } from "../api";

// Converte o valor do select para número.
// Se estiver vazio, retorna null.
function paraNumero(valor) {
  return valor !== "" && valor != null ? Number(valor) : null;
}

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
  const [prioridadeId, setPrioridadeId] = useState(2);
  const [usuarioId, setUsuarioId] = useState("");
  const [projetoId, setProjetoId] = useState("");
  const [erros, setErros] = useState([]);
  const [salvando, setSalvando] = useState(false);

  // PREENCHER O MODAL
  useEffect(() => {
    if (!aberto) return;

    setErros([]);

    if (tarefa) {
      setTexto(tarefa.texto || "");
      setPrioridadeId(
        tarefa.prioridade_id ?? tarefa.idprioridade ?? 2
      );
      setUsuarioId(tarefa.usuario_id ?? "");
      setProjetoId(tarefa.projeto_id ?? "");
    } else {
      setTexto("");
      setPrioridadeId(2);
      setUsuarioId(usuarios[0]?.id ?? "");
      setProjetoId(projetos[0]?.id ?? "");
    }
  }, [tarefa, aberto, usuarios, projetos]);

  // FECHAR COM ESC
  useEffect(() => {
    if (!aberto) return;

    function handleEsc(e) {
      if (e.key === "Escape" && !salvando) {
        onFechar();
      }
    }

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [aberto, onFechar, salvando]);

  // SALVAR
  async function handleSalvar() {
    setErros([]);
    if (!texto.trim()) {
      setErros(["O campo 'texto' é obrigatório"]);
      return;
    }
    setSalvando(true);

    try {
      await onSalvar({
        ...tarefa,
        id: tarefa?.id,
        texto,
        coluna: tarefa?.coluna || coluna,
        prioridade_id: paraNumero(prioridadeId),
        usuario_id: paraNumero(usuarioId),
        projeto_id: paraNumero(projetoId),
      });

      onFechar();
    } catch (e) {
      setErros(mensagensDeErro(e));
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) return null;

  return (
    <div
      className={styles.overlay}
      onClick={() => !salvando && onFechar()}
    >
      <div
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{tarefa ? "Editar tarefa" : "Nova tarefa"}</h2>

        <div className={styles.campo}>
          <label htmlFor="tarefa-texto">Tarefa</label>
          <input
            id="tarefa-texto"
            placeholder="Descreva a tarefa"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="tarefa-prioridade">Prioridade</label>
          <select
            id="tarefa-prioridade"
            value={prioridadeId}
            onChange={(e) => setPrioridadeId(e.target.value)}
          >
            {prioridades.map((p) => (
              <option key={p.id} value={p.id}>
                {p.descricao}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.campo}>
          <label htmlFor="tarefa-responsavel">
            Usuário responsável
          </label>
          <select
            id="tarefa-responsavel"
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
        </div>

        <div className={styles.campo}>
          <label htmlFor="tarefa-projeto">Projeto</label>
          <select
            id="tarefa-projeto"
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
        </div>

        {erros.length > 0 && (
          <ul className={styles.erros}>
            {erros.map((mensagem, i) => (
              <li key={i}>{mensagem}</li>
            ))}
          </ul>
        )}

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
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalTarefa;
