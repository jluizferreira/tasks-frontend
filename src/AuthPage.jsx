import { useState } from "react";

const API_URL = "http://localhost:3000/api/auth";

async function apiFetch(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // envia/recebe cookies
    body: JSON.stringify(body),
  });
  return res.json();
}

export default function AuthPage({ onAuth }) {
  const [mode, setMode]       = useState("login"); // "login" | "register"
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = mode === "login"
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password };

    const data = await apiFetch(`/${mode}`, payload);
    setLoading(false);

    if (data.success) {
      onAuth(data.data); // passa usuário para o App
    } else {
      setError(data.message || data.errors?.[0]?.msg || "Erro desconhecido");
    }
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 transition placeholder-slate-300 bg-white";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap'); * { font-family: 'DM Sans', sans-serif; }`}</style>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tarefas</h1>
          <p className="text-sm text-slate-400 mt-1">
            {mode === "login" ? "Entre na sua conta" : "Crie sua conta"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <form onSubmit={handle} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Nome</label>
                <input className={inputCls} placeholder="Seu nome" value={form.name} onChange={set("name")} required />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Email</label>
              <input className={inputCls} type="email" placeholder="seu@email.com" value={form.email} onChange={set("email")} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Senha</label>
              <input className={inputCls} type="password" placeholder={mode === "register" ? "Mínimo 6 caracteres" : "••••••••"} value={form.password} onChange={set("password")} required />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 text-xs rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50 mt-2"
            >
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>

        {/* Toggle */}
        <p className="text-center text-sm text-slate-400 mt-5">
          {mode === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="text-slate-700 font-medium underline underline-offset-2 hover:text-slate-900 transition"
          >
            {mode === "login" ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}
