import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModalTarefa from "./ModalTarefa";
import { AuthProvider } from "../Contexts/AuthContext";

// Listas de exemplo, no formato que a API devolve
const prioridades = [
  { id: 1, descricao: "Alto" },
  { id: 2, descricao: "Médio" },
  { id: 3, descricao: "Baixo" },
];
const usuarios = [
  { id: 1, nome: "Ana Lima" },
  { id: 2, nome: "Bruno Melo" },
];
const projetos = [
  { id: 10, nome: "TaskFlow" },
  { id: 20, nome: "Site da Escola" },
];

function abrirModal(props = {}) {
  render(
    <AuthProvider>
      <ModalTarefa
        aberto={true}
        onFechar={vi.fn()}
        onSalvar={vi.fn()}
        prioridades={prioridades}
        usuarios={usuarios}
        projetos={projetos}
        {...props}
      />
    </AuthProvider>,
  );
}

describe("ModalTarefa", () => {
  test("fechado, não mostra nada", () => {
    abrirModal({ aberto: false });

    expect(screen.queryByText("Nova tarefa")).not.toBeInTheDocument();
  });

  test("aberto para criar, mostra o título e os campos", () => {
    abrirModal();

    expect(
      screen.getByRole("heading", { name: "Nova tarefa" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Tarefa")).toHaveValue("");
    // expect(screen.getByLabelText("Responsável")).toHaveValue("1");
    expect(screen.getByLabelText("Projeto")).toHaveValue("10");
    expect(screen.getByLabelText("Prioridade")).toHaveValue("2");
  });

  test("aberto para editar, vem preenchido", () => {
    const tarefa = {
      id: 7,
      texto: "Revisar a API",
      coluna: "andamento",
      idprioridade: 1,
      usuario_id: 2,
      projeto_id: 20,
    };
    abrirModal({ tarefa });

    expect(
      screen.getByRole("heading", { name: "Editar tarefa" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Tarefa")).toHaveValue("Revisar a API");
    // expect(screen.getByLabelText("Responsável")).toHaveValue("2");
  });

  test("o que a pessoa digita aparece no campo", async () => {
    const user = userEvent.setup();
    abrirModal();

    const campo = screen.getByLabelText("Tarefa");
    await user.type(campo, "Estudar mocks");

    expect(campo).toHaveValue("Estudar mocks");
  });

  test("Cancelar e Esc chamam onFechar", async () => {
    const user = userEvent.setup();
    const onFechar = vi.fn();

    abrirModal({ onFechar });

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    await user.keyboard("{Escape}");

    expect(onFechar).toHaveBeenCalledTimes(2);
  });

  test("Salvar envia os dados e fecha o modal", async () => {
    const user = userEvent.setup();
    const onSalvar = vi.fn().mockResolvedValue();
    const onFechar = vi.fn();

    abrirModal({ onSalvar, onFechar, coluna: "afazer" });

    await user.type(screen.getByLabelText("Tarefa"), "Estudar mocks");

    await user.selectOptions(screen.getByLabelText("Prioridade"), "1");

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSalvar).toHaveBeenCalledWith({
      id: undefined,
      texto: "Estudar mocks",
      coluna: "afazer",
      prioridade_id: 1,
      projeto_id: 10,
      usuario_id: 1,
    });

    expect(onFechar).toHaveBeenCalledTimes(1);
  });

  test("mostra Salvando e desabilita o botão enquanto salva", async () => {
    const user = userEvent.setup();

    const onSalvar = vi.fn(() => new Promise(() => {}));

    abrirModal({ onSalvar });

    await user.type(screen.getByLabelText("Tarefa"), "Estudar mocks");

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled();
  });

  test("editar envia o id e a coluna da tarefa", async () => {
    const user = userEvent.setup();
    const onSalvar = vi.fn().mockResolvedValue();

    const tarefa = {
      id: 7,
      texto: "Revisar a API",
      coluna: "andamento",
      idprioridade: 1,
      usuario_id: 2,
      projeto_id: 20,
    };

    abrirModal({ tarefa, onSalvar });

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSalvar).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 7,
        coluna: "andamento",
      }),
    );
  });

  test("selecionar Bruno Melo envia usuario_id 2", async () => {
    const user = userEvent.setup();
    const onSalvar = vi.fn().mockResolvedValue();

    abrirModal({ onSalvar });

    await user.type(screen.getByLabelText("Tarefa"), "Estudar testes");

    await user.selectOptions(screen.getByLabelText("Responsável"), "2");

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSalvar).toHaveBeenCalledWith(
      expect.objectContaining({
        usuario_id: 2,
      }),
    );
  });

  test("a API recusa: mostra os erros e não fecha", async () => {
    const user = userEvent.setup();

    const erro400 = {
      response: {
        data: {
          erro: {
            detalhes: ["texto é obrigatório"],
          },
        },
      },
    };

    const onSalvar = vi.fn().mockRejectedValue(erro400);
    const onFechar = vi.fn();

    abrirModal({ onSalvar, onFechar });

    await user.type(screen.getByLabelText("Tarefa"), "Estudar mocks");

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByText("texto é obrigatório")).toBeInTheDocument();

    expect(onFechar).not.toHaveBeenCalled();
  });
});
