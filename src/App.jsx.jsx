import { useState, useEffect } from "react";
import AuthPage from "./AuthPage";
import TasksApp from "./TasksApp";

export default function App() {
  const [user, setUser]       = useState(null);
  const [checking, setChecking] = useState(true); // verificar se já tem sessão

  // Ao carregar, checa se o usuário já tem cookie válido
  useEffect(() => {
    fetch("http://localhost:3000/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUser(data.data);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-300 text-sm">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuth={setUser} />;
  }

  return <TasksApp user={user} onLogout={handleLogout} />;
}
