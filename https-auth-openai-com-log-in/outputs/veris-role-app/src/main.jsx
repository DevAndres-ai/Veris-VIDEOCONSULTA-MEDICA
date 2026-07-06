import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  LogOut,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
  Video,
} from "lucide-react";
import {
  APPOINTMENT_STATUS,
  addFamilyMember,
  deleteDoctor,
  deleteSpecialty,
  getAdministrators,
  getAppointments,
  getAppointmentsByDoctor,
  getAppointmentsByPatient,
  getCurrentUser,
  getDoctors,
  getFamilyMembers,
  getMedicalHistory,
  getPatients,
  getSpecialties,
  loginUser,
  logoutUser,
  registerPatient,
  saveAppointment,
  saveDoctor,
  saveMedicalDocuments,
  saveMeetingUrl,
  saveSpecialty,
  seedDemoData,
  updateAppointment,
  updateDoctor,
} from "./utils/storage";
import "./styles.css";

const APP_NAME = "VERIS: VIDEO CONSULTA MÉDICA";
const roleLabels = { patient: "Paciente", doctor: "Doctor", admin: "Administrador" };

function App() {
  const [view, setView] = useState("roles");
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentUser, setCurrentUserState] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    seedDemoData();
    const user = getCurrentUser();
    if (user) {
      setCurrentUserState(user);
      setView("dashboard");
    }
  }, []);

  const refresh = () => setRefreshKey((key) => key + 1);

  const handleRole = (role) => {
    setSelectedRole(role);
    setView("login");
  };

  const handleLogin = (user) => {
    setCurrentUserState(user);
    setView("dashboard");
    refresh();
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUserState(null);
    setSelectedRole(null);
    setView("roles");
  };

  return (
    <main>
      <Header user={currentUser} onLogout={handleLogout} onHome={() => setView("roles")} />
      {view === "roles" && <RoleSelection onSelect={handleRole} />}
      {view === "login" && selectedRole && (
        <LoginScreen role={selectedRole} onLogin={handleLogin} onBack={() => setView("roles")} />
      )}
      {view === "dashboard" && currentUser?.role === "patient" && (
        <PatientDashboard user={currentUser} refreshKey={refreshKey} refresh={refresh} />
      )}
      {view === "dashboard" && currentUser?.role === "doctor" && (
        <DoctorDashboard user={currentUser} refreshKey={refreshKey} refresh={refresh} />
      )}
      {view === "dashboard" && currentUser?.role === "admin" && (
        <AdminDashboard user={currentUser} refreshKey={refreshKey} refresh={refresh} />
      )}
      {!currentUser && view !== "roles" && view !== "login" && <RoleSelection onSelect={handleRole} />}
      <Footer />
    </main>
  );
}

function Header({ user, onLogout, onHome }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={onHome} type="button">
        <span className="brandMark"><HeartPulse size={24} /></span>
        <span>{APP_NAME}</span>
      </button>
      <nav>
        {user ? (
          <>
            <span className="sessionPill">{roleLabels[user.role]}: {user.name}</span>
            <button className="ghostButton" onClick={onLogout} type="button"><LogOut size={17} /> Cerrar sesión</button>
          </>
        ) : (
          <span className="sessionPill">Plataforma académica de videoconsultas</span>
        )}
      </nav>
    </header>
  );
}

function RoleSelection({ onSelect }) {
  const cards = [
    {
      role: "patient",
      title: "Paciente",
      icon: UserRound,
      text: "Agenda videoconsultas, revisa tus citas vigentes y consulta tu historial clínico simulado.",
      button: "Ingresar como paciente",
    },
    {
      role: "doctor",
      title: "Doctor",
      icon: Stethoscope,
      text: "Revisa tus consultas asignadas, atiende pacientes y genera documentos médicos simulados.",
      button: "Ingresar como doctor",
    },
    {
      role: "admin",
      title: "Administrador",
      icon: ShieldCheck,
      text: "Gestiona usuarios, médicos, especialidades, horarios y citas dentro del sistema.",
      button: "Ingresar como administrador",
    },
  ];

  return (
    <section className="hero">
      <div className="heroText">
        <span className="eyebrow">Acceso seguro por roles</span>
        <h1>Bienvenido a {APP_NAME}</h1>
        <p>Selecciona tu tipo de acceso para continuar con la plataforma de videoconsultas médicas.</p>
      </div>
      <div className="roleGrid">
        {cards.map(({ role, title, icon: Icon, text, button }) => (
          <article className="roleCard" key={role}>
            <div className="roleIcon"><Icon size={34} /></div>
            <h2>{title}</h2>
            <p>{text}</p>
            <button onClick={() => onSelect(role)} type="button">{button}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function LoginScreen({ role, onLogin, onBack }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const submit = (event) => {
    event.preventDefault();
    setMessage("");
    try {
      if (mode === "register") {
        const user = registerPatient(form);
        onLogin(user);
        return;
      }
      onLogin(loginUser(form.email, form.password, role));
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="authLayout">
      <div className="authPanel">
        <button className="textButton" onClick={onBack} type="button">Volver a selección de rol</button>
        <h1>Iniciar sesión como {roleLabels[role]}</h1>
        <p>{APP_NAME}</p>
        <form onSubmit={submit} className="formGrid">
          {mode === "register" && (
            <label>Nombre completo<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          )}
          <label>Correo electrónico<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Contraseña<input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          {message && <p className="alert">{message}</p>}
          <button className="primaryButton" type="submit">{mode === "register" ? "Registrar paciente" : "Ingresar"}</button>
        </form>
        {role === "patient" && (
          <button className="ghostButton full" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Crear cuenta de paciente" : "Ya tengo cuenta"}
          </button>
        )}
      </div>
      <aside className="demoBox">
        <h2>Credenciales de prueba</h2>
        <p><strong>Paciente:</strong> paciente@demo.com / 123456</p>
        <p><strong>Doctor:</strong> doctor@demo.com / 123456</p>
        <p><strong>Administrador:</strong> admin@demo.com / 123456</p>
      </aside>
    </section>
  );
}

function PatientDashboard({ user, refreshKey, refresh }) {
  const appointments = useMemo(() => getAppointmentsByPatient(user.id), [user.id, refreshKey]);
  const doctors = useMemo(() => getDoctors().filter((doctor) => doctor.status === "Activo"), [refreshKey]);
  const specialties = useMemo(() => getSpecialties(), [refreshKey]);
  const family = useMemo(() => getFamilyMembers(user.id), [user.id, refreshKey]);
  const history = useMemo(() => getMedicalHistory(user.id), [user.id, refreshKey]);
  const nextAppointment = appointments.find((item) => item.status !== "Finalizada" && item.status !== "Cancelada");
  const [familyName, setFamilyName] = useState("");
  const [zoomMessage, setZoomMessage] = useState("");
  const [appointment, setAppointment] = useState({
    patientName: user.name,
    specialty: specialties[0]?.name || "",
    doctorId: doctors[0]?.id || "",
    date: "",
    time: "",
    reason: "",
    insurance: "Particular",
  });

  const submitFamily = (event) => {
    event.preventDefault();
    addFamilyMember(user.id, familyName);
    setFamilyName("");
    refresh();
  };

  const submitAppointment = (event) => {
    event.preventDefault();
    const doctor = doctors.find((item) => item.id === appointment.doctorId);
    saveAppointment({
      ...appointment,
      patientId: user.id,
      doctorName: doctor?.name || "",
      meetingUrl: doctor?.zoom || "",
      status: "Pendiente de pago",
    });
    refresh();
  };

  const payAppointment = (item) => {
    updateAppointment({ ...item, status: "Confirmada" });
    refresh();
  };

  const openZoom = (item) => {
    if (!item.meetingUrl) {
      setZoomMessage("La reunión de Zoom aún no ha sido creada.");
      return;
    }
    window.open(item.meetingUrl, "_blank");
  };

  return (
    <DashboardShell title="Panel del Paciente" subtitle={`Bienvenido, ${user.name}`}>
      <SummaryGrid cards={[
        ["Próxima cita", nextAppointment ? `${nextAppointment.date} ${nextAppointment.time}` : "Sin cita vigente"],
        ["Citas confirmadas", appointments.filter((item) => item.status === "Confirmada").length],
        ["Familiares registrados", family.length],
        ["Documentos médicos simulados", history.length],
      ]} />
      <section className="twoColumn">
        <Card title="Agregar familiar o amigo">
          <form className="formGrid" onSubmit={submitFamily}>
            <label>Nombre<input required value={familyName} onChange={(e) => setFamilyName(e.target.value)} /></label>
            <button className="primaryButton" type="submit">Guardar familiar</button>
          </form>
          <SmallList items={family.map((item) => item.name)} empty="Sin familiares registrados" />
        </Card>
        <Card title="Agendar cita online">
          <form className="formGrid" onSubmit={submitAppointment}>
            <label>Seleccionar paciente<select value={appointment.patientName} onChange={(e) => setAppointment({ ...appointment, patientName: e.target.value })}>
              <option>{user.name}</option>{family.map((item) => <option key={item.id}>{item.name}</option>)}
            </select></label>
            <label>Especialidad<select value={appointment.specialty} onChange={(e) => setAppointment({ ...appointment, specialty: e.target.value })}>
              {specialties.map((item) => <option key={item.id}>{item.name}</option>)}
            </select></label>
            <label>Médico<select value={appointment.doctorId} onChange={(e) => setAppointment({ ...appointment, doctorId: e.target.value })}>
              {doctors.filter((doctor) => !appointment.specialty || doctor.specialty === appointment.specialty).map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
            </select></label>
            <label>Fecha<input required type="date" value={appointment.date} onChange={(e) => setAppointment({ ...appointment, date: e.target.value })} /></label>
            <label>Hora<input required type="time" value={appointment.time} onChange={(e) => setAppointment({ ...appointment, time: e.target.value })} /></label>
            <label>Convenio o seguro<select value={appointment.insurance} onChange={(e) => setAppointment({ ...appointment, insurance: e.target.value })}><option>Particular</option><option>Seguro privado</option><option>Convenio empresarial</option></select></label>
            <label className="wide">Motivo de consulta<textarea required value={appointment.reason} onChange={(e) => setAppointment({ ...appointment, reason: e.target.value })} /></label>
            <button className="primaryButton" type="submit">Reservar cita</button>
          </form>
        </Card>
      </section>
      <Card title="Citas vigentes">
        {zoomMessage && <p className="alert">{zoomMessage}</p>}
        <AppointmentTable appointments={appointments} actions={(item) => (
          <>
            {item.status === "Pendiente de pago" && <button onClick={() => payAppointment(item)} type="button">Realizar pago simulado</button>}
            {item.status === "Confirmada" && <button onClick={() => openZoom(item)} type="button">Ingresar a Zoom</button>}
          </>
        )} />
      </Card>
      <Card title="Historial clínico simulado">
        <DocumentList history={history} />
      </Card>
    </DashboardShell>
  );
}

function DoctorDashboard({ user, refreshKey, refresh }) {
  const appointments = useMemo(() => getAppointmentsByDoctor(user.id), [user.id, refreshKey]);
  const today = new Date().toISOString().slice(0, 10);
  const [selected, setSelected] = useState(null);
  const [documents, setDocuments] = useState({ prescription: "", recommendations: "", orders: "", certificate: "" });
  const [message, setMessage] = useState("");

  const startConsultation = (item) => {
    const updated = { ...item, status: "En consulta" };
    updateAppointment(updated);
    refresh();
    if (item.meetingUrl) window.open(item.meetingUrl, "_blank");
    else setMessage("La reunión de Zoom aún no ha sido creada.");
  };

  const finishConsultation = (item) => {
    const updated = { ...item, status: "Finalizada" };
    updateAppointment(updated);
    setSelected(updated);
    refresh();
  };

  const saveDocs = (event) => {
    event.preventDefault();
    saveMedicalDocuments(selected.patientId, selected.id, documents);
    setDocuments({ prescription: "", recommendations: "", orders: "", certificate: "" });
    setSelected(null);
    refresh();
  };

  return (
    <DashboardShell title="Panel del Doctor" subtitle={`Bienvenido, ${user.name} · ${user.specialty}`}>
      <SummaryGrid cards={[
        ["Citas asignadas", appointments.length],
        ["Pacientes del día", appointments.filter((item) => item.date === today).length],
        ["Confirmadas", appointments.filter((item) => item.status === "Confirmada").length],
        ["Finalizadas", appointments.filter((item) => item.status === "Finalizada").length],
      ]} />
      {message && <p className="alert">{message}</p>}
      <Card title="Citas asignadas">
        <AppointmentTable appointments={appointments} actions={(item) => (
          <>
            <button onClick={() => startConsultation(item)} type="button">Atender videoconsulta por Zoom</button>
            <button onClick={() => finishConsultation(item)} type="button">Finalizar consulta</button>
          </>
        )} />
      </Card>
      {selected && (
        <Card title="Generar documentos médicos simulados">
          <form className="formGrid" onSubmit={saveDocs}>
            <label>Receta médica<textarea value={documents.prescription} onChange={(e) => setDocuments({ ...documents, prescription: e.target.value })} /></label>
            <label>Recomendaciones<textarea value={documents.recommendations} onChange={(e) => setDocuments({ ...documents, recommendations: e.target.value })} /></label>
            <label>Órdenes de servicio<textarea value={documents.orders} onChange={(e) => setDocuments({ ...documents, orders: e.target.value })} /></label>
            <label>Certificado médico<textarea value={documents.certificate} onChange={(e) => setDocuments({ ...documents, certificate: e.target.value })} /></label>
            <button className="primaryButton" type="submit">Guardar documentos</button>
          </form>
        </Card>
      )}
    </DashboardShell>
  );
}

function AdminDashboard({ user, refreshKey, refresh }) {
  const patients = useMemo(() => getPatients(), [refreshKey]);
  const doctors = useMemo(() => getDoctors(), [refreshKey]);
  const admins = useMemo(() => getAdministrators(), [refreshKey]);
  const appointments = useMemo(() => getAppointments(), [refreshKey]);
  const specialties = useMemo(() => getSpecialties(), [refreshKey]);
  const [doctorForm, setDoctorForm] = useState({ id: "", name: "", email: "", specialty: "Medicina General", phone: "", status: "Activo", zoom: "" });
  const [specialtyName, setSpecialtyName] = useState("");
  const [meetingDrafts, setMeetingDrafts] = useState({});
  const [message, setMessage] = useState("");

  const saveDoctorForm = (event) => {
    event.preventDefault();
    doctorForm.id ? updateDoctor(doctorForm) : saveDoctor(doctorForm);
    setDoctorForm({ id: "", name: "", email: "", specialty: "Medicina General", phone: "", status: "Activo", zoom: "" });
    refresh();
  };

  const addSpecialty = (event) => {
    event.preventDefault();
    saveSpecialty(specialtyName);
    setSpecialtyName("");
    refresh();
  };

  const updateMeeting = (appointment) => {
    try {
      saveMeetingUrl(appointment.id, meetingDrafts[appointment.id] ?? appointment.meetingUrl ?? "");
      setMessage("Enlace de Zoom actualizado.");
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const setStatus = (appointment, status) => {
    updateAppointment({ ...appointment, status });
    refresh();
  };

  return (
    <DashboardShell title="Panel Administrativo" subtitle={`Bienvenido, ${user.name}`}>
      <SummaryGrid cards={[
        ["Total de pacientes", patients.length],
        ["Total de doctores", doctors.length],
        ["Total de citas", appointments.length],
        ["Citas confirmadas", appointments.filter((item) => item.status === "Confirmada").length],
        ["Especialidades disponibles", specialties.length],
      ]} />
      <section className="twoColumn">
        <Card title="Usuarios registrados">
          <SmallList title="Pacientes" items={patients.map((item) => `${item.name} · ${item.email}`)} />
          <SmallList title="Doctores" items={doctors.map((item) => `${item.name} · ${item.email}`)} />
          <SmallList title="Administradores" items={admins.map((item) => `${item.name} · ${item.email}`)} />
        </Card>
        <Card title="Gestionar doctores">
          <form className="formGrid" onSubmit={saveDoctorForm}>
            <label>Nombre completo<input required value={doctorForm.name} onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })} /></label>
            <label>Correo<input required type="email" value={doctorForm.email} onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })} /></label>
            <label>Especialidad<select value={doctorForm.specialty} onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}>{specialties.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
            <label>Teléfono<input value={doctorForm.phone} onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })} /></label>
            <label>Estado<select value={doctorForm.status} onChange={(e) => setDoctorForm({ ...doctorForm, status: e.target.value })}><option>Activo</option><option>Inactivo</option></select></label>
            <label>Enlace personal de Zoom<input value={doctorForm.zoom} onChange={(e) => setDoctorForm({ ...doctorForm, zoom: e.target.value })} /></label>
            <button className="primaryButton" type="submit">{doctorForm.id ? "Actualizar doctor" : "Agregar doctor"}</button>
          </form>
          <div className="stack">
            {doctors.map((doctor) => (
              <div className="inlineRow" key={doctor.id}>
                <span>{doctor.name} · {doctor.specialty} · {doctor.status}</span>
                <button type="button" onClick={() => setDoctorForm(doctor)}>Editar</button>
                <button type="button" onClick={() => { deleteDoctor(doctor.id); refresh(); }}>Eliminar</button>
              </div>
            ))}
          </div>
        </Card>
      </section>
      <section className="twoColumn">
        <Card title="Gestionar especialidades">
          <form className="formGrid" onSubmit={addSpecialty}>
            <label>Especialidad<input required value={specialtyName} onChange={(e) => setSpecialtyName(e.target.value)} /></label>
            <button className="primaryButton" type="submit">Agregar especialidad</button>
          </form>
          <div className="stack">
            {specialties.map((item) => (
              <div className="inlineRow" key={item.id}><span>{item.name}</span><button type="button" onClick={() => { deleteSpecialty(item.id); refresh(); }}>Eliminar</button></div>
            ))}
          </div>
        </Card>
        <Card title="Avisos de administración">
          <p className="muted">Los enlaces de videoconsulta deben iniciar con https://zoom.us/ o https://us02web.zoom.us/.</p>
          {message && <p className="alert">{message}</p>}
        </Card>
      </section>
      <Card title="Gestionar citas">
        <div className="tableWrap">
          <table>
            <thead><tr><th>Paciente</th><th>Doctor</th><th>Especialidad</th><th>Fecha</th><th>Hora</th><th>Estado</th><th>Motivo</th><th>Enlace de Zoom</th><th>Acciones</th></tr></thead>
            <tbody>
              {appointments.map((item) => (
                <tr key={item.id}>
                  <td>{item.patientName}</td><td>{item.doctorName}</td><td>{item.specialty}</td><td>{item.date}</td><td>{item.time}</td>
                  <td><select value={item.status} onChange={(e) => setStatus(item, e.target.value)}>{APPOINTMENT_STATUS.map((status) => <option key={status}>{status}</option>)}</select></td>
                  <td>{item.reason}</td>
                  <td><input value={meetingDrafts[item.id] ?? item.meetingUrl ?? ""} onChange={(e) => setMeetingDrafts({ ...meetingDrafts, [item.id]: e.target.value })} /></td>
                  <td className="actions"><button type="button" onClick={() => updateMeeting(item)}>Guardar Zoom</button><button type="button" onClick={() => setStatus(item, "Cancelada")}>Cancelar cita</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardShell>
  );
}

function DashboardShell({ title, subtitle, children }) {
  return (
    <section className="dashboard">
      <div className="pageTitle"><span className="eyebrow">VERIS: VIDEO CONSULTA MÉDICA</span><h1>{title}</h1><p>{subtitle}</p></div>
      {children}
    </section>
  );
}

function SummaryGrid({ cards }) {
  const icons = [CalendarDays, ClipboardList, UsersRound, FileText, Activity];
  return <div className="summaryGrid">{cards.map(([label, value], index) => { const Icon = icons[index % icons.length]; return <article className="summaryCard" key={label}><Icon size={24} /><span>{label}</span><strong>{value}</strong></article>; })}</div>;
}

function Card({ title, children }) {
  return <section className="card"><h2>{title}</h2>{children}</section>;
}

function SmallList({ title, items, empty = "Sin registros" }) {
  return <div className="smallList">{title && <h3>{title}</h3>}{items.length ? items.map((item) => <p key={item}>{item}</p>) : <p className="muted">{empty}</p>}</div>;
}

function AppointmentTable({ appointments, actions }) {
  if (!appointments.length) return <p className="muted">No hay citas registradas.</p>;
  return (
    <div className="tableWrap">
      <table>
        <thead><tr><th>Paciente</th><th>Especialidad</th><th>Médico</th><th>Fecha</th><th>Hora</th><th>Motivo</th><th>Estado</th><th>Zoom</th><th>Acciones</th></tr></thead>
        <tbody>{appointments.map((item) => <tr key={item.id}><td>{item.patientName}</td><td>{item.specialty}</td><td>{item.doctorName}</td><td>{item.date}</td><td>{item.time}</td><td>{item.reason}</td><td>{item.status}</td><td>{item.meetingUrl || "Pendiente"}</td><td className="actions">{actions(item)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function DocumentList({ history }) {
  if (!history.length) return <p className="muted">Aún no hay documentos médicos simulados.</p>;
  return <div className="stack">{history.map((item) => <article className="document" key={item.id}><strong>{item.createdAt}</strong><p><b>Receta:</b> {item.documents.prescription || "No registrada"}</p><p><b>Recomendaciones:</b> {item.documents.recommendations || "No registradas"}</p><p><b>Órdenes:</b> {item.documents.orders || "No registradas"}</p><p><b>Certificado:</b> {item.documents.certificate || "No registrado"}</p></article>)}</div>;
}

function Footer() {
  return <footer>{APP_NAME} · Proyecto académico con LocalStorage y enlaces externos de Zoom.</footer>;
}

createRoot(document.getElementById("root")).render(<App />);
