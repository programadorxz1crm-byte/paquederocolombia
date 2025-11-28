import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || (typeof window !== "undefined" ? window.location.origin : "");

export default function App() {
  const [bgUrl, setBgUrl] = useState("");
  const [tab, setTab] = useState("login"); // login | vehiculos | admin
  const [token, setToken] = useState(localStorage.getItem("jl_token") || "");
  const [user, setUser] = useState(null);

  // Login/Register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // Buscar placas
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // Admin
  const [users, setUsers] = useState([]);
  const [newBg, setNewBg] = useState("");
  const [uploadInfo, setUploadInfo] = useState(null);

  useEffect(() => {
    fetch(API_BASE + "/config").then(r => r.json()).then(j => setBgUrl(j?.config?.backgroundUrl || "")).catch(() => {});
    if (token) fetchMe();
  }, []);

  const fetchMe = async () => {
    try {
      const r = await fetch(API_BASE + "/me", { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json();
      if (!j.error) { setUser(j.user); setTab("vehiculos"); }
    } catch {}
  };

  const doLogin = async () => {
    setError("");
    try {
      const r = await fetch(API_BASE + "/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const j = await r.json();
      if (j.error) { setError(j.error); return; }
      localStorage.setItem("jl_token", j.token);
      setToken(j.token);
      setUser(j.user);
      setTab("vehiculos");
    } catch (e) { setError(e.message); }
  };

  const doRegister = async () => {
    setError("");
    try {
      const r = await fetch(API_BASE + "/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
      const j = await r.json();
      if (j.error) { setError(j.error); return; }
      setError("Registrado. Esperando aprobación del administrador.");
    } catch (e) { setError(e.message); }
  };

  const logout = () => {
    localStorage.removeItem("jl_token");
    setToken("");
    setUser(null);
    setTab("login");
  };

  const buscarPlaca = async () => {
    if (!query.trim()) return;
    try {
      const u = new URL(API_BASE + "/vehicles");
      u.searchParams.set("plate", query.trim());
      const r = await fetch(u.toString());
      const j = await r.json();
      setResults(j.items || []);
    } catch (e) { setError(e.message); }
  };

  const loadUsers = async () => {
    try {
      const r = await fetch(API_BASE + "/admin/users", { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json();
      setUsers(j.items || []);
    } catch {}
  };

  const approve = async (email) => {
    await fetch(API_BASE + "/admin/users/approve", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ email }) });
    loadUsers();
  };

  const delUser = async (id) => {
    await fetch(API_BASE + "/admin/users/" + id, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    loadUsers();
  };

  const resetPw = async (email) => {
    const npw = window.prompt("Nueva contraseña para " + email);
    if (!npw) return;
    await fetch(API_BASE + "/admin/reset-password", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ email, newPassword: npw }) });
    loadUsers();
  };

  const saveBackground = async () => {
    await fetch(API_BASE + "/admin/config/background", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ url: newBg }) });
    setBgUrl(newBg);
  };

  const uploadExcel = async (ev) => {
    const f = ev.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    const r = await fetch(API_BASE + "/admin/vehicles/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
    const j = await r.json();
    setUploadInfo(j);
  };

  const isAdmin = user?.role === "admin";
  const approved = !!user?.approved;

  return (
    <div className="app" style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="header">
        <div className="brand">
          <div className="logo">JL</div>
          <div>
            <div className="big">Parqueadero JL</div>
            <div className="author">Consulta de vehículos</div>
          </div>
        </div>
        {user ? <button className="secondary" onClick={logout}>Salir</button> : null}
      </div>

      {/* Tabs */}
      <div className="actions">
        <button className={tab === "login" ? "primary" : "secondary"} onClick={() => setTab("login")}>Inicio</button>
        <button className={tab === "vehiculos" ? "primary" : "secondary"} onClick={() => setTab("vehiculos")}>Vehículos</button>
        {isAdmin ? <button className={tab === "admin" ? "primary" : "secondary"} onClick={() => { setTab("admin"); loadUsers(); }}>Admin</button> : null}
      </div>

      {/* Login */}
      {tab === "login" && (
        <div className="login">
          <div className="card" style={{ background: "linear-gradient(180deg,#d7372e,#931b14)", borderColor: "#a12c27" }}>
            <div className="big">Iniciar sesión</div>
            <div className="field"><label>Usuario</label><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@admin" /></div>
            <div className="field"><label>Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="123456" /></div>
            <div className="actions"><button className="primary" onClick={doLogin}>Iniciar sesión</button></div>
            {error && <div className="error">{error}</div>}
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <div className="big">Registro</div>
            <div className="field"><label>Nombre</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="field"><label>Correo</label><input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="field"><label>Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <div className="actions"><button className="secondary" onClick={doRegister}>Registrarse</button></div>
            <div className="hint">El admin debe aprobar tu cuenta antes de consultar.</div>
          </div>
        </div>
      )}

      {/* Vehículos */}
      {tab === "vehiculos" && (
        <div className="card">
          <div className="big">Gestión de vehículos</div>
          {!approved && (
            <div className="notice blocked">Tu cuenta está pendiente de aprobación.</div>
          )}
          <div className="field"><label>Buscar placa (ABC123)</label><input value={query} onChange={(e) => setQuery(e.target.value.toUpperCase())} /></div>
          <div className="actions"><button className="primary" onClick={buscarPlaca} disabled={!approved}>Buscar</button></div>
          <div className="big" style={{ marginTop: 12 }}>Resultados</div>
          <div className="list">
            {results.map((r, i) => (
              <div key={i} className="item" style={{ gridTemplateColumns: "120px 1fr 1fr 1fr" }}>
                <div><span className="badge" style={{ background: "#d7372e" }}>{r.plate}</span></div>
                <div>
                  <div className="muted">Ingreso</div>
                  <div>{r.ingreso || "-"}</div>
                </div>
                <div>
                  <div className="muted">Salida</div>
                  <div>{r.salida || "-"}</div>
                </div>
                <div>
                  <div className="muted">Estado</div>
                  <div>{r.estado || "-"}</div>
                </div>
              </div>
            ))}
            {!results.length && <div className="muted">Sin resultados</div>}
          </div>
        </div>
      )}

      {/* Admin */}
      {tab === "admin" && isAdmin && (
        <div className="grid">
          <div className="card">
            <div className="big">Usuarios</div>
            <div className="list">
              {users.map(u => (
                <div key={u.id} className="item" style={{ gridTemplateColumns: "1fr 1fr 120px 120px 140px" }}>
                  <div>{u.name}</div>
                  <div className="muted">{u.email}</div>
                  <div>{u.role}</div>
                  <div>{u.approved ? "Aprobado" : "Pendiente"}</div>
                  <div className="actions">
                    {!u.approved && <button className="primary" onClick={() => approve(u.email)}>Aprobar</button>}
                    <button className="secondary" onClick={() => resetPw(u.email)}>Reset clave</button>
                    <button className="ghost" onClick={() => delUser(u.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="big">Cargar Excel de placas</div>
            <div className="field"><input type="file" accept=".xlsx,.xls" onChange={uploadExcel} /></div>
            {uploadInfo && <div className="notice">Cargadas: {uploadInfo.count}</div>}
          </div>

          <div className="card">
            <div className="big">Fondo (panel y app)</div>
            <div className="field"><label>URL de imagen</label><input value={newBg} onChange={(e) => setNewBg(e.target.value)} placeholder="https://..." /></div>
            <div className="actions"><button className="secondary" onClick={saveBackground}>Guardar fondo</button></div>
            {bgUrl && <div className="hint">Usando fondo: {bgUrl}</div>}
          </div>
        </div>
      )}
    </div>
  );
}