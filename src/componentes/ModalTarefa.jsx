
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
  projetos = [],
  usuarios = [],
}) {
  const [texto, setTexto] = useState("");
  const [prioridadeId, setPrioridadeId] = useState(2);
  const [projetoId, setProjetoId] = useState("");
  const [usuarioId, setUsuarioId] = useState(1);
  const [erros, setErros] = useState([]);
  const [salvando, setSalvando] = useState(false);

  // PREENCHER O MODAL
  useEffect(() => {
    if (!aberto) return;

    setErros([]);

    if (tarefa) {
      setTexto(tarefa.texto || "");
      setPrioridadeId(tarefa.prioridade_id ?? tarefa.idprioridade ?? 2);
      setProjetoId(tarefa.projeto_id ?? "");
      setUsuarioId(tarefa.usuario_id ?? 1);
    } else {
      setTexto("");
      setPrioridadeId(2);
      setProjetoId(projetos[0]?.id ?? "");
      setUsuarioId(1);
    }
  }, [tarefa, aberto, projetos]);

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

    if (!projetoId) {
      setErros(["Selecione um projeto"]);
      return;
    }

    setSalvando(true);

    try {
      await onSalvar({
        ...tarefa,
        id: tarefa?.id,
        texto: texto.trim(),
        coluna: tarefa?.coluna || coluna,
        prioridade_id: paraNumero(prioridadeId),
        projeto_id: paraNumero(projetoId),
        usuario_id: paraNumero(usuarioId),
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
    <div className={styles.overlay} onClick={() => !salvando && onFechar()}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <h2>{tarefa ? "Editar tarefa" : "Nova tarefa"}</h2>

        <div className={styles.campo}>
          <label htmlFor="tarefa-texto">Tarefa</label>
          <textarea
            id="tarefa-texto"
            placeholder="Descreva a tarefa"
            rows={4}
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

        <div className={styles.campo}>
          <label htmlFor="tarefa-responsavel">Responsável</label>
          <select
            id="tarefa-responsavel"
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
          >
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nome}
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
          <button type="button" onClick={onFechar} disabled={salvando}>
            Cancelar
          </button>

          <button type="button" onClick={handleSalvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalTarefa;
