"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Todo = {
  id: number;
  task: string;
  is_done: boolean;
};

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadTodos() {
    const { data, error } = await supabase
      .from("todos")
      .select("id, task, is_done")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setTodos(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadTodos();
  }, []);

  async function addTodo() {
    if (!newTask.trim()) return;
    const { error } = await supabase.from("todos").insert({ task: newTask });
    if (error) {
      console.error(error);
      return;
    }
    setNewTask("");
    loadTodos();
  }

  async function toggleDone(todo: Todo) {
    const { error } = await supabase
      .from("todos")
      .update({ is_done: !todo.is_done })
      .eq("id", todo.id);
    if (error) {
      console.error(error);
      return;
    }
    loadTodos();
  }

  async function deleteTodo(id: number) {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    loadTodos();
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-md flex-col gap-6 py-16 px-6">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          My Todos
        </h1>

        <div className="flex gap-2">
          <input
            className="flex-1 rounded border border-zinc-300 bg-white px-3 py-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            placeholder="New task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button
            className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
            onClick={addTodo}
          >
            Add
          </button>
        </div>

        {loading ? (
          <p className="text-zinc-500">Loading...</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 rounded border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <input
                  type="checkbox"
                  checked={todo.is_done}
                  onChange={() => toggleDone(todo)}
                />
                <span
                  className={
                    todo.is_done
                      ? "flex-1 text-zinc-400 line-through"
                      : "flex-1 text-black dark:text-white"
                  }
                >
                  {todo.task}
                </span>
                <button
                  className="text-sm text-red-500"
                  onClick={() => deleteTodo(todo.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
