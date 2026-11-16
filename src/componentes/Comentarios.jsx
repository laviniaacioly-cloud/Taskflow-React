
import { useEffect, useState } from "react";
import api, { mensagensDeErro } from "../api";
import { useAuth } from "../Contexts/AuthContext";
import styles from "./Comentarios.module.css";

function Comentarios({ tarefa, aberto, onFechar }) {
  const { usuario } = useAuth();

  const [comentarios, setComentarios] = useState([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!aberto || !tarefa?.id) return;

    async function carregarComentarios() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await api.get(
          `/comentarios/tarefas/${tarefa.id}`
        );

        setComentarios(resposta.data);
      } catch (err) {
        setErro(mensagensDeErro(err).join(" "));
      } finally {
        setCarregando(false);
      }
    }

    carregarComentarios();
  }, [aberto, tarefa?.id]);

  async function enviarComentario(e) {
    e.preventDefault();

    if (!texto.trim()) {
      setErro("Digite um comentário antes de enviar.");
      return;
    }

    try {
      setEnviando(true);
      setErro("");

      const resposta = await api.post(
        `/comentarios/tarefas/${tarefa.id}`,
        { texto: texto.trim() }
      );

      setComentarios((atuais) => [...atuais, resposta.data]);
      setTexto("");
    } catch (err) {
      setErro(mensagensDeErro(err).join(" "));
    } finally {
      setEnviando(false);
    }
  }

  async function excluirComentario(comentarioId) {
    const confirmar = window.confirm(
      "Deseja excluir este comentário?"
    );

    if (!confirmar) return;

    try {
      setErro("");

      await api.delete(
        `/comentarios/tarefas/${tarefa.id}/${comentarioId}`
      );

      setComentarios((atuais) =>
        atuais.filter((comentario) => comentario.id !== comentarioId)
      );
    } catch (err) {
      setErro(mensagensDeErro(err).join(" "));
    }
  }

  function formatarData(data) {
    if (!data) return "";

    return new Date(data).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  if (!aberto || !tarefa) return null;

  return (
    <div className={styles.overlay} onClick={onFechar}>
      <aside
        className={styles.painel}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.cabecalho}>
          <div>
            <span className={styles.etiqueta}>TASKFLOW</span>
            <h2>Comentários</h2>
            <p>{tarefa.texto}</p>
          </div>

          <button
            type="button"
            className={styles.botaoFechar}
            onClick={onFechar}
            aria-label="Fechar comentários"
          >
            ×
          </button>
        </header>

        <div className={styles.conteudo}>
          {carregando && (
            <p className={styles.mensagem}>
              Carregando comentários...
            </p>
          )}

          {erro && (
            <p className={styles.erro}>{erro}</p>
          )}

          {!carregando && comentarios.length === 0 && (
            <div className={styles.vazio}>
              <span>💬</span>
              <p>Nenhum comentário ainda.</p>
              <small>Seja a primeira pessoa a comentar!</small>
            </div>
          )}

          <div className={styles.lista}>
            {comentarios.map((comentario) => {
              const comentarioDoUsuario =
                Number(comentario.usuario_id) === Number(usuario?.id);

              return (
                <article
                  key={comentario.id}
                  className={styles.comentario}
                >
                  <div className={styles.autor}>
                    <div className={styles.avatar}>
                      {(comentario.usuario?.nome || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className={styles.dadosAutor}>
                      <strong>
                        {comentario.usuario?.nome || "Usuário"}
                      </strong>

                      <small>
                        {formatarData(comentario.criado_em)}
                      </small>
                    </div>

                    {comentarioDoUsuario && (
                      <button
                        type="button"
                        className={styles.botaoExcluir}
                        onClick={() =>
                          excluirComentario(comentario.id)
                        }
                        title="Excluir comentário"
                        aria-label="Excluir comentário"
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  <p className={styles.textoComentario}>
                    {comentario.texto}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        <form
          className={styles.formulario}
          onSubmit={enviarComentario}
        >
          <label htmlFor="novo-comentario">
            Escreva um comentário
          </label>

          <textarea
            id="novo-comentario"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Digite sua mensagem..."
            rows={3}
            maxLength={1000}
            disabled={enviando}
          />

          <div className={styles.rodapeFormulario}>
            <small>{texto.length}/1000 caracteres</small>

            <button
              type="submit"
              disabled={enviando || !texto.trim()}
            >
              {enviando ? "Enviando..." : "Enviar comentário"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

export default Comentarios;
