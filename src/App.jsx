import { useState, useEffect } from "react";

const SUPABASE_URL = "https://cxcmzyrjjnxelbeevztg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4Y216eXJqam54ZWxiZWV2enRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODEyMjQsImV4cCI6MjA5MzQ1NzIyNH0.nMOhmY5omrsh2lx6uJYfuFGtOBuGnwiZNT-LbnXERq8";

async function fetchMemos() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/memos?order=created_at.desc`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  return res.json();
}

async function insertMemo(memo) {
  await fetch(`${SUPABASE_URL}/rest/v1/memos`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(memo),
  });
}

async function updateMemo(id, memo) {
  await fetch(`${SUPABASE_URL}/rest/v1/memos?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(memo),
  });
}

async function deleteMemo(id) {
  await fetch(`${SUPABASE_URL}/rest/v1/memos?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
}

const CATEGORIES = [
  { id: "movie", label: "映画", icon: "🎬", color: "#E85D04" },
  { id: "manga", label: "漫画", icon: "📖", color: "#7B2FBE" },
  { id: "anime", label: "アニメ", icon: "✨", color: "#0077B6" },
  { id: "drama", label: "ドラマ", icon: "📺", color: "#2D6A4F" },
  { id: "book", label: "本", icon: "📚", color: "#9E2A2B" },
  { id: "game", label: "ゲーム", icon: "🎮", color: "#4A4E69" },
  { id: "youtube", label: "YouTube", icon: "▶️", color: "#FF0000" },
];

const PRIORITIES = [
  { id: "high", label: "気になる！", color: "#E85D04" },
  { id: "medium", label: "いつか", color: "#7B2FBE" },
  { id: "done", label: "視聴済", color: "#2D6A4F" },
];

export default function App() {
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ title: "", category: "movie", priority: "high", note: "" });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await fetchMemos();
    setMemos(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  const filtered = memos.filter(m => {
    const matchCat = filter === "all" || m.category === filter;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function openAdd() {
    setForm({ title: "", category: "movie", priority: "high", note: "" });
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(memo) {
    setForm({ title: memo.title, category: memo.category, priority: memo.priority, note: memo.note });
    setEditId(memo.id);
    setShowForm(true);
  }

  async function save() {
    if (!form.title.trim()) return;
    if (editId) {
      await updateMemo(editId, form);
    } else {
      await insertMemo({ ...form, created_at: new Date().toISOString() });
    }
    setShowForm(false);
    load();
  }

  async function remove(id) {
    await deleteMemo(id);
    load();
  }

  const cat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
  const pri = (id) => PRIORITIES.find(p => p.id === id) || PRIORITIES[0];

  return (
    <div style={styles.root}>
      <div style={styles.noise} />
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>WATCHLIST</div>
          <div style={styles.headerSub}>気になる作品メモ</div>
        </div>
        <button style={styles.addBtn} onClick={openAdd}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>＋</span>
        </button>
      </div>
      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          style={styles.searchInput}
          placeholder="タイトルで検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div style={styles.filterRow}>
        <button
          style={{ ...styles.filterChip, ...(filter === "all" ? styles.filterChipActive : {}) }}
          onClick={() => setFilter("all")}
        >
          ALL
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            style={{
              ...styles.filterChip,
              ...(filter === c.id ? { ...styles.filterChipActive, borderColor: c.color, color: c.color } : {}),
            }}
            onClick={() => setFilter(c.id)}
          >
            {c.icon}
          </button>
        ))}
      </div>
      <div style={styles.count}>
        {loading ? "読み込み中..." : `${filtered.length} 件`}
      </div>
      <div style={styles.list}>
        {!loading && filtered.length === 0 && (
          <div style={styles.empty}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
            <div style={{ color: "#666", fontSize: 14 }}>メモがありません</div>
          </div>
        )}
        {filtered.map((memo, i) => {
          const c = cat(memo.category);
          const p = pri(memo.priority);
          return (
            <div key={memo.id} style={{ ...styles.card, animationDelay: `${i * 0.05}s` }}>
              <div style={{ ...styles.cardAccent, background: c.color }} />
              <div style={styles.cardContent}>
                <div style={styles.cardTop}>
                  <div style={styles.cardMeta}>
                    <span style={{ ...styles.catBadge, borderColor: c.color, color: c.color }}>
                      {c.icon} {c.label}
                    </span>
                    <span style={{ ...styles.priBadge, background: p.color + "22", color: p.color }}>
                      {p.label}
                    </span>
                  </div>
                  <div style={styles.cardActions}>
                    <button style={styles.iconBtn} onClick={() => openEdit(memo)}>✏️</button>
                    <button style={styles.iconBtn} onClick={() => remove(memo.id)}>🗑️</button>
                  </div>
                </div>
                <div style={styles.cardTitle}>{memo.title}</div>
                {memo.note && <div style={styles.cardNote}>{memo.note}</div>}
                <div style={styles.cardDate}>
                  {new Date(memo.created_at).toLocaleDateString("ja-JP")}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {showForm && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>{editId ? "編集" : "新規メモ"}</div>
              <button style={styles.closeBtn} onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>タイトル</label>
              <input
                style={styles.input}
                placeholder="作品名を入力..."
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                autoFocus
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>カテゴリ</label>
              <div style={styles.chipGroup}>
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    style={{
                      ...styles.chip,
                      ...(form.category === c.id ? { background: c.color + "33", borderColor: c.color, color: c.color } : {}),
                    }}
                    onClick={() => setForm({ ...form, category: c.id })}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>優先度</label>
              <div style={styles.chipGroup}>
                {PRIORITIES.map(p => (
                  <button
                    key={p.id}
                    style={{
                      ...styles.chip,
                      ...(form.priority === p.id ? { background: p.color + "33", borderColor: p.color, color: p.color } : {}),
                    }}
                    onClick={() => setForm({ ...form, priority: p.id })}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>メモ（任意）</label>
              <textarea
                style={{ ...styles.input, height: 80, resize: "none" }}
                placeholder="一言メモ..."
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
              />
            </div>
            <button style={styles.saveBtn} onClick={save}>
              {editId ? "更新する" : "追加する"}
            </button>
          </div>
        </div>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; background: #0a0a0a; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: { fontFamily: "'Noto Sans JP', sans-serif", background: "#0a0a0a", minHeight: "100vh", maxWidth: 480, margin: "0 auto", paddingBottom: 80, position: "relative", overflow: "hidden" },
  noise: { position: "fixed", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: "none", zIndex: 0 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "52px 20px 20px", position: "relative", zIndex: 1 },
  headerTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: "#fff", letterSpacing: 4, lineHeight: 1 },
  headerSub: { fontSize: 11, color: "#555", letterSpacing: 2, marginTop: 4 },
  addBtn: { width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg, #E85D04, #9D0208)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px #E85D0466" },
  searchWrap: { margin: "0 20px 16px", background: "#111", border: "1px solid #222", borderRadius: 12, display: "flex", alignItems: "center", padding: "0 14px", position: "relative", zIndex: 1 },
  searchIcon: { fontSize: 14, marginRight: 10, opacity: 0.5 },
  searchInput: { background: "none", border: "none", outline: "none", color: "#ccc", fontSize: 14, padding: "12px 0", width: "100%", fontFamily: "'Noto Sans JP', sans-serif" },
  filterRow: { display: "flex", gap: 8, padding: "0 20px 4px", overflowX: "auto", scrollbarWidth: "none", position: "relative", zIndex: 1 },
  filterChip: { background: "#111", border: "1px solid #222", borderRadius: 20, color: "#555", fontSize: 13, padding: "6px 14px", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.2s" },
  filterChipActive: { background: "#1a1a1a", color: "#fff", borderColor: "#fff" },
  count: { color: "#333", fontSize: 11, letterSpacing: 1, padding: "12px 20px 8px", position: "relative", zIndex: 1 },
  list: { padding: "0 16px", display: "flex", flexDirection: "column", gap: 10, position: "relative", zIndex: 1 },
  empty: { textAlign: "center", padding: 60 },
  card: { background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, overflow: "hidden", display: "flex", animation: "fadeUp 0.3s ease both" },
  cardAccent: { width: 3, flexShrink: 0 },
  cardContent: { flex: 1, padding: "14px 14px 12px" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  cardMeta: { display: "flex", gap: 6, flexWrap: "wrap" },
  catBadge: { fontSize: 11, border: "1px solid", borderRadius: 6, padding: "2px 8px", fontWeight: 500 },
  priBadge: { fontSize: 11, borderRadius: 6, padding: "2px 8px", fontWeight: 500 },
  cardActions: { display: "flex", gap: 4, marginLeft: 8 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 4, opacity: 0.5 },
  cardTitle: { color: "#eee", fontSize: 16, fontWeight: 700, lineHeight: 1.4, marginBottom: 6 },
  cardNote: { color: "#555", fontSize: 12, lineHeight: 1.5, marginBottom: 6 },
  cardDate: { color: "#333", fontSize: 11 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "flex-end", backdropFilter: "blur(4px)" },
  modal: { background: "#111", borderTop: "1px solid #222", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, margin: "0 auto", padding: "24px 20px 40px", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#fff", letterSpacing: 2 },
  closeBtn: { background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#666", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 13 },
  field: { marginBottom: 20 },
  label: { display: "block", color: "#555", fontSize: 11, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" },
  input: { width: "100%", background: "#0d0d0d", border: "1px solid #222", borderRadius: 10, color: "#ccc", fontSize: 15, padding: "12px 14px", outline: "none", fontFamily: "'Noto Sans JP', sans-serif" },
  chipGroup: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: { background: "#0d0d0d", border: "1px solid #222", borderRadius: 8, color: "#555", fontSize: 12, padding: "7px 12px", cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.15s" },
  saveBtn: { width: "100%", padding: "16px", background: "linear-gradient(135deg, #E85D04, #9D0208)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", boxShadow: "0 0 24px #E85D0444", marginTop: 8 },
};
