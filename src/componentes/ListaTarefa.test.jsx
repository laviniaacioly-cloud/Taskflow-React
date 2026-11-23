
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ListaTarefas from "./ListaTarefas";

describe("ListaTarefas", () => {
  test("lista vazia mostra a mensagem e nenhum card", () => {
    render(<ListaTarefas tarefas={[]} />);

    expect(
      screen.getByText("Nenhuma tarefa nesta coluna."),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Estudar React"),
    ).not.toBeInTheDocument();
  });

  test("deve exibir todas as tarefas recebidas", () => {
    const tarefas = [
      { id: 1, texto: "Estudar React" },
      { id: 2, texto: "Fazer exercícios" },
      { id: 3, texto: "Revisar o projeto" },
    ];

    render(<ListaTarefas tarefas={tarefas} />);

    const itens = screen.getAllByText(
      /Estudar React|Fazer exercícios|Revisar o projeto/,
    );

    expect(itens).toHaveLength(3);
  });

  test("deve exibir a prioridade correspondente à tarefa", () => {
    const tarefas = [{ id: 1, texto: "Estudar React", prioridade_id: 2 }];

    const prioridades = [
      { id: 1, descricao: "baixa", cor: "#34c759" },
      { id: 2, descricao: "media", cor: "#ffcc00" },
    ];

    render(<ListaTarefas tarefas={tarefas} prioridades={prioridades} />);

    expect(screen.getByText("Media")).toBeInTheDocument();
  });

  test("deve exibir o nome do responsável pela tarefa", () => {
    const tarefas = [
      {
        id: 1,
        texto: "Estudar React",
        usuario_id: 2,
      },
    ];

    const usuarios = [{ id: 2, nome: "Alice" }];

    render(<ListaTarefas tarefas={tarefas} usuarios={usuarios} />);

    expect(screen.getByText("Responsável: Alice")).toBeInTheDocument();
  });

  test("deve exibir o nome do projeto da tarefa", () => {
    const tarefas = [
      {
        id: 1,
        texto: "Estudar React",
        projeto_id: 3,
      },
    ];

    const projetos = [{ id: 3, nome: "Projeto TaskFlow" }];

    render(<ListaTarefas tarefas={tarefas} projetos={projetos} />);

    expect(screen.getByText("Projeto: Projeto TaskFlow")).toBeInTheDocument();
  });

  test("deve chamar onAbrirComentarios com a tarefa correta", async () => {
    const tarefa = {
      id: 1,
      texto: "Estudar React",
    };

    const onAbrirComentarios = vi.fn();

    render(
      <ListaTarefas
        tarefas={[tarefa]}
        onAbrirComentarios={onAbrirComentarios}
      />,
    );

    await userEvent.setup().click(
      screen.getByRole("button", {
        name: "Ver comentários da tarefa Estudar React",
      }),
    );

    expect(onAbrirComentarios).toHaveBeenCalledWith(tarefa);
  });

  test("deve chamar onEditar com a tarefa correta", async () => {
    const tarefa = {
      id: 1,
      texto: "Estudar React",
    };

    const onEditar = vi.fn();

    render(<ListaTarefas tarefas={[tarefa]} onEditar={onEditar} />);

    await userEvent.setup().click(screen.getByTitle("Editar tarefa"));

    expect(onEditar).toHaveBeenCalledWith(tarefa);
  });

  test("X da segunda tarefa chama onDeletar com o ID 2", async () => {
    const user = userEvent.setup();
    const onDeletar = vi.fn();

    const tarefas = [
      { id: 1, texto: "Estudar React" },
      { id: 2, texto: "Fazer exercícios" },
    ];

    render(
      <ListaTarefas
        tarefas={tarefas}
        onDeletar={onDeletar}
      />,
    );

    const botoesExcluir = screen.getAllByTitle("Excluir tarefa");

    await user.click(botoesExcluir[1]);

    expect(onDeletar).toHaveBeenCalledWith(2);
  });

  test("deve chamar onMover com o ID e a próxima coluna", async () => {
    const tarefa = {
      id: 10,
      texto: "Estudar React",
    };

    const onMover = vi.fn();

    render(
      <ListaTarefas
        tarefas={[tarefa]}
        onMover={onMover}
        colunaProxima="andamento"
      />,
    );

    await userEvent.setup().click(screen.getByTitle("Avançar tarefa"));

    expect(onMover).toHaveBeenCalledWith(10, "andamento");
  });

  test("deve chamar onMover com o ID e a coluna anterior", async () => {
    const tarefa = {
      id: 10,
      texto: "Estudar React",
    };

    const onMover = vi.fn();

    render(
      <ListaTarefas
        tarefas={[tarefa]}
        onMover={onMover}
        colunaAnterior="afazer"
      />,
    );

    await userEvent.setup().click(screen.getByTitle("Voltar tarefa"));

    expect(onMover).toHaveBeenCalledWith(10, "afazer");
  });

  test("deve exibir Sem prioridade quando a tarefa não tiver prioridade cadastrada", () => {
    const tarefas = [
      {
        id: 1,
        texto: "Estudar React",
        prioridade_id: 99,
      },
    ];

    render(<ListaTarefas tarefas={tarefas} prioridades={[]} />);

    expect(screen.getByText("Sem prioridade")).toBeInTheDocument();
  });

  test("deve exibir Não informado quando não encontrar o responsável", () => {
    const tarefas = [
      {
        id: 1,
        texto: "Estudar React",
        usuario_id: 99,
      },
    ];

    render(<ListaTarefas tarefas={tarefas} usuarios={[]} />);

    expect(screen.getByText("Responsável: Não informado")).toBeInTheDocument();
  });

  test("deve exibir Não informado quando não encontrar o projeto", () => {
    const tarefas = [
      {
        id: 1,
        texto: "Estudar React",
        projeto_id: 99,
      },
    ];

    render(<ListaTarefas tarefas={tarefas} projetos={[]} />);

    expect(screen.getByText("Projeto: Não informado")).toBeInTheDocument();
  });

  test("deve exibir tarefas com IDs diferentes", () => {
    const tarefas = [
      { id: 10, texto: "Tarefa número 10" },
      { id: 20, texto: "Tarefa número 20" },
    ];

    render(<ListaTarefas tarefas={tarefas} />);

    expect(screen.getByText("Tarefa número 10")).toBeInTheDocument();
    expect(screen.getByText("Tarefa número 20")).toBeInTheDocument();
  });
});
