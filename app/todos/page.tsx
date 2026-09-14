"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

type Todo = {
  id: string;
  task: string;
  is_done: boolean;
  createdAt?: number;
};

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadTodos() {
    try {
      const snapshot = await getDocs(collection(db, "todos"));
      const items: Todo[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          task: data.task ?? "",
          is_done: data.is_done ?? false,
          createdAt: data.createdAt?.toMillis?.() ?? 0,
        };
      });
      items.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setTodos(items);
    } catch (error) {
      console.error("Error loading todos from Firestore:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTodos();
  }, []);

  async function addTodo() {
    if (!newTask.trim()) return;
    try {
      await addDoc(collection(db, "todos"), {
        task: newTask.trim(),
        is_done: false,
        createdAt: serverTimestamp(),
      });
      setNewTask("");
      await loadTodos();
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  }

  async function toggleDone(todo: Todo) {
    try {
      await updateDoc(doc(db, "todos", todo.id), {
        is_done: !todo.is_done,
      });
      await loadTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  }

  async function deleteTodo(id: string) {
    try {
      await deleteDoc(doc(db, "todos", id));
      await loadTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  }

  const completedCount = todos.filter((todo) => todo.is_done).length;

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-md flex-col gap-6 py-16 px-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            My Todos
          </h1>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            完了: <span className="font-medium text-black dark:text-white">{completedCount}</span> / {todos.length} 件
          </span>
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 rounded border border-zinc-300 bg-white px-3 py-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            placeholder="New task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button
            className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
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
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
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
