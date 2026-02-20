import { useState, useEffect, useCallback } from "react";

const API_URL = "https://tasks-api-production-6b05.up.railway.app/api/tasks";

const PRIORITY_STYLES = {
  low:    { dot: "bg-slate-300",   badge: "text-slate-500 bg-slate-100" },
  medium: { dot: "bg-amber-300",   badge: "text-amber-600 bg-amber-50" },
  high:   { dot: "bg-orange-400",  badge: "text-orange-600 bg-orange-50" },
  urgent: { dot: "bg-red-500",     badge: "text-red-600 bg-red-50" },
};

const STATUS_STYLES = {
  pending:     "text-slate-400",
  in_progress: "text-blue-500",
  completed:   "text-emerald-500",
  cancelled:   "text-slate-300 line-through",
};

const EMPTY_FORM = { title: "", description: "", priority: "medium", due_date: "" };

// ─── API helpers ──────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include", // envia cookies com cada requisição
    ...options,
  });
  return res.json();
}

// ─── Modal ────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,15,20,0.55)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Task Form ────────────────────────────────────────────────
function TaskForm({ initial = EMPTY_FORM, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handle = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 transition placeholder-slate-300";
  const labelCls = "block text-xs font-medium text-slate-500 mb-1.5 tracking-wide uppercase";

  return (
    <form onSubmit={handle} className="space-y-4">
      <div>
        <label className={labelCls}>Título *</label>
        <input className={inputCls} value={form.title} onChange={set("title")} placeholder="Ex: Revisar documentação" required />
      </div>
      <div>
        <label className={labelCls}>Descrição</label>
        <textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={set("description")} placeholder="Detalhes opcionais..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Prioridade</label>
          <select className={inputCls} value={form.priority} onChange={set("priority")}>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Prazo</label>
          <input type="date" className={inputCls} value={form.due_date} onChange={set("due_date")} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50">
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}

// ─── Task Card ────────────────────────────────────────────────
function TaskCard({ task, onEdit, onDelete, onComplete }) {
  const pr = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
  const st = STATUS_STYLES[task.status] || "text-slate-400";
  const isCompleted = task.status === "completed";

  const statusLabel = { pending: "Pendente", in_progress: "Em andamento", completed: "Concluída", cancelled: "Cancelada" };
  const priorityLabel = { low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente" };

  const due = task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR") : null;
  const overdue = task.due_date && !isCompleted && new Date(task.due_date) < new Date();

  return (
    <div className={`group bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${isCompleted ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        {/* Complete button */}
        <button
          onClick={() => !isCompleted && onComplete(task.id)}
          title="Marcar como concluída"
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all duration-200 ${isCompleted ? "border-emerald-400 bg-emerald-400" : "border-slate-300 hover:border-emerald-400"}`}
        >
          {isCompleted && (
            <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${pr.dot}`} />
            <h3 className={`text-sm font-semibold text-slate-800 truncate ${isCompleted ? "line-through text-slate-400" : ""}`}>
              {task.title}
            </h3>
          </div>

          {task.description && (
            <p className="text-xs text-slate-400 mb-2 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pr.badge}`}>
              {priorityLabel[task.priority]}
            </span>
            <span className={`text-xs font-medium ${st}`}>
              {statusLabel[task.status]}
            </span>
            {due && (
              <span className={`text-xs ${overdue ? "text-red-400 font-medium" : "text-slate-300"}`}>
                {overdue ? "⚠ " : ""}{due}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition" title="Editar">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
            </svg>
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-400 transition" title="Deletar">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1m-4 0h10" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────
function EmptyState({ onNew }) {
  return (
    <div className="text-center py-16">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p className="text-slate-400 text-sm mb-4">Nenhuma tarefa encontrada</p>
      <button onClick={onNew} className="text-sm text-slate-900 font-medium underline underline-offset-2 hover:text-slate-600 transition">
        Criar primeira tarefa
      </button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────
export default function App({ user, onLogout }) {
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const [modal, setModal]         = useState(null); // "create" | "edit"
  const [editing, setEditing]     = useState(null);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilter] = useState("");

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (filterStatus) params.append("status", filterStatus);
      const data = await apiFetch(`?${params}`);
      if (data.success) setTasks(data.data);
      else throw new Error(data.message);
    } catch {
      setError("Não foi possível conectar à API. Verifique se o servidor está rodando.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Create
  const handleCreate = async (form) => {
    setSaving(true);
    const data = await apiFetch("", { method: "POST", body: JSON.stringify(form) });
    setSaving(false);
    if (data.success) { setModal(null); fetchTasks(); }
  };

  // Update
  const handleUpdate = async (form) => {
    setSaving(true);
    const data = await apiFetch(`/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
    setSaving(false);
    if (data.success) { setModal(null); setEditing(null); fetchTasks(); }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm("Deletar esta tarefa?")) return;
    await apiFetch(`/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  // Complete
  const handleComplete = async (id) => {
    await apiFetch(`/${id}/complete`, { method: "PATCH" });
    fetchTasks();
  };

  // Filter by search
  const visible = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    done: tasks.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .animate-fade-in { animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tarefas</h1>
            <p className="text-sm text-slate-400 mt-1">
              {counts.done} de {counts.total} concluídas · {user?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModal("create")}
              className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-all shadow-sm"
            >
              <span className="text-lg leading-none">+</span> Nova tarefa
            </button>
            <button
              onClick={onLogout}
              className="text-sm font-medium px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all"
              title="Sair"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total", value: counts.total, color: "text-slate-800" },
            { label: "Pendentes", value: counts.pending, color: "text-amber-600" },
            { label: "Concluídas", value: counts.done, color: "text-emerald-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5">
          <input
            className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 placeholder-slate-300 bg-white"
            placeholder="Buscar tarefas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
            value={filterStatus}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="pending">Pendente</option>
            <option value="in_progress">Em andamento</option>
            <option value="completed">Concluída</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-2xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <div className="text-center py-16 text-slate-300 text-sm">Carregando...</div>
        ) : visible.length === 0 ? (
          <EmptyState onNew={() => setModal("create")} />
        ) : (
          <div className="space-y-2.5">
            {visible.map((task) => (
              <div key={task.id} className="animate-fade-in">
                <TaskCard
                  task={task}
                  onEdit={(t) => { setEditing(t); setModal("edit"); }}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === "create" && (
        <Modal title="Nova tarefa" onClose={() => setModal(null)}>
          <TaskForm onSubmit={handleCreate} onCancel={() => setModal(null)} loading={saving} />
        </Modal>
      )}
      {modal === "edit" && editing && (
        <Modal title="Editar tarefa" onClose={() => { setModal(null); setEditing(null); }}>
          <TaskForm
            initial={{
              title: editing.title,
              description: editing.description || "",
              priority: editing.priority,
              due_date: editing.due_date ? editing.due_date.split("T")[0] : "",
            }}
            onSubmit={handleUpdate}
            onCancel={() => { setModal(null); setEditing(null); }}
            loading={saving}
          />
        </Modal>
      )}
    </div>
  );
}
