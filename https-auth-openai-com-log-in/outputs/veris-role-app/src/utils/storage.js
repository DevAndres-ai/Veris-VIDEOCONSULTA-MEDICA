const KEYS = {
  users: "veris_users",
  currentUser: "veris_current_user",
  activeRole: "veris_active_role",
  doctors: "veris_doctors",
  specialties: "veris_specialties",
  appointments: "veris_appointments",
  family: "veris_family",
  documents: "veris_documents",
};

export const APPOINTMENT_STATUS = [
  "Pendiente de pago",
  "Confirmada",
  "En consulta",
  "Finalizada",
  "Cancelada",
];

const baseSpecialties = [
  "Medicina General",
  "Medicina Interna",
  "Pediatría",
  "Ginecología",
  "Dermatología",
  "Cardiología",
  "Traumatología",
];

const baseDoctors = [
  {
    id: "doctor-demo",
    name: "Dr. Andrés Molina",
    email: "doctor@demo.com",
    password: "123456",
    role: "doctor",
    specialty: "Medicina General",
    phone: "099 100 2000",
    status: "Activo",
    zoom: "https://zoom.us/j/123456789",
  },
  {
    id: "doctor-camila",
    name: "Dra. Camila Torres",
    email: "camila@demo.com",
    password: "123456",
    role: "doctor",
    specialty: "Pediatría",
    phone: "099 200 3000",
    status: "Activo",
    zoom: "https://zoom.us/j/123456789",
  },
  {
    id: "doctor-fernanda",
    name: "Dra. Fernanda Ruiz",
    email: "fernanda@demo.com",
    password: "123456",
    role: "doctor",
    specialty: "Dermatología",
    phone: "099 300 4000",
    status: "Activo",
    zoom: "https://zoom.us/j/123456789",
  },
  {
    id: "doctor-carlos",
    name: "Dr. Carlos Vega",
    email: "carlos@demo.com",
    password: "123456",
    role: "doctor",
    specialty: "Cardiología",
    phone: "099 400 5000",
    status: "Activo",
    zoom: "https://zoom.us/j/123456789",
  },
  {
    id: "doctor-andrea",
    name: "Dra. Andrea Salazar",
    email: "andrea@demo.com",
    password: "123456",
    role: "doctor",
    specialty: "Ginecología",
    phone: "099 500 6000",
    status: "Activo",
    zoom: "https://zoom.us/j/123456789",
  },
  {
    id: "doctor-mateo",
    name: "Dr. Mateo Ríos",
    email: "mateo@demo.com",
    password: "123456",
    role: "doctor",
    specialty: "Traumatología",
    phone: "099 600 7000",
    status: "Activo",
    zoom: "https://zoom.us/j/123456789",
  },
];

const read = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const id = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const publicUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

const syncDoctorUsers = (doctors) => {
  const users = read(KEYS.users);
  const nonDoctors = users.filter((user) => user.role !== "doctor");
  write(KEYS.users, [...nonDoctors, ...doctors.map((doctor) => ({ ...doctor, role: "doctor", password: doctor.password || "123456" }))]);
};

export function seedDemoData() {
  if (!localStorage.getItem(KEYS.specialties)) {
    write(KEYS.specialties, baseSpecialties.map((name) => ({ id: id("specialty"), name })));
  }
  if (!localStorage.getItem(KEYS.doctors)) {
    write(KEYS.doctors, baseDoctors);
  }
  if (!localStorage.getItem(KEYS.users)) {
    write(KEYS.users, [
      {
        id: "admin-demo",
        name: "Admin VERIS",
        email: "admin@demo.com",
        password: "123456",
        role: "admin",
      },
      {
        id: "patient-demo",
        name: "Paciente Demo",
        email: "paciente@demo.com",
        password: "123456",
        role: "patient",
      },
      ...baseDoctors,
    ]);
  }
  if (!localStorage.getItem(KEYS.appointments)) {
    write(KEYS.appointments, [
      {
        id: "appointment-demo",
        patientId: "patient-demo",
        patientName: "Paciente Demo",
        doctorId: "doctor-demo",
        doctorName: "Dr. Andrés Molina",
        specialty: "Medicina General",
        date: new Date().toISOString().slice(0, 10),
        time: "09:30",
        reason: "Control general y orientacion medica.",
        insurance: "Particular",
        status: "Confirmada",
        meetingUrl: "https://zoom.us/j/123456789",
      },
    ]);
  }
  if (!localStorage.getItem(KEYS.family)) write(KEYS.family, []);
  if (!localStorage.getItem(KEYS.documents)) write(KEYS.documents, []);
}

export function loginUser(email, password, role) {
  seedDemoData();
  const user = read(KEYS.users).find(
    (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password && item.role === role
  );
  if (!user) throw new Error("Credenciales incorrectas para el rol seleccionado.");
  const safeUser = publicUser(user);
  write(KEYS.currentUser, safeUser);
  localStorage.setItem(KEYS.activeRole, role);
  return safeUser;
}

export function registerPatient(data) {
  seedDemoData();
  const users = read(KEYS.users);
  if (users.some((item) => item.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error("Ya existe un usuario con ese correo.");
  }
  const user = {
    id: id("patient"),
    name: data.name,
    email: data.email,
    password: data.password,
    role: "patient",
  };
  write(KEYS.users, [...users, user]);
  const safeUser = publicUser(user);
  setCurrentUser(safeUser);
  return safeUser;
}

export function getCurrentUser() {
  return read(KEYS.currentUser, null);
}

export function setCurrentUser(user) {
  write(KEYS.currentUser, user);
  localStorage.setItem(KEYS.activeRole, user.role);
}

export function logoutUser() {
  localStorage.removeItem(KEYS.currentUser);
  localStorage.removeItem(KEYS.activeRole);
}

export function getPatients() {
  return read(KEYS.users).filter((user) => user.role === "patient").map(publicUser);
}

export function getAdministrators() {
  return read(KEYS.users).filter((user) => user.role === "admin").map(publicUser);
}

export function getDoctors() {
  seedDemoData();
  return read(KEYS.doctors);
}

export function saveDoctor(doctor) {
  const doctors = read(KEYS.doctors);
  const next = { ...doctor, id: id("doctor"), password: "123456", role: "doctor" };
  const updated = [...doctors, next];
  write(KEYS.doctors, updated);
  syncDoctorUsers(updated);
  return next;
}

export function updateDoctor(doctor) {
  const doctors = read(KEYS.doctors).map((item) => (item.id === doctor.id ? { ...item, ...doctor, role: "doctor" } : item));
  write(KEYS.doctors, doctors);
  syncDoctorUsers(doctors);
  return doctor;
}

export function deleteDoctor(doctorId) {
  const doctors = read(KEYS.doctors).filter((doctor) => doctor.id !== doctorId);
  write(KEYS.doctors, doctors);
  syncDoctorUsers(doctors);
}

export function getSpecialties() {
  seedDemoData();
  return read(KEYS.specialties);
}

export function saveSpecialty(specialty) {
  const name = typeof specialty === "string" ? specialty : specialty.name;
  const current = read(KEYS.specialties);
  if (!current.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
    write(KEYS.specialties, [...current, { id: id("specialty"), name }]);
  }
}

export function deleteSpecialty(specialtyId) {
  write(KEYS.specialties, read(KEYS.specialties).filter((item) => item.id !== specialtyId));
}

export function getAppointments() {
  seedDemoData();
  return read(KEYS.appointments);
}

export function saveAppointment(appointment) {
  const next = { ...appointment, id: id("appointment"), createdAt: new Date().toISOString() };
  write(KEYS.appointments, [...read(KEYS.appointments), next]);
  return next;
}

export function updateAppointment(appointment) {
  write(KEYS.appointments, read(KEYS.appointments).map((item) => (item.id === appointment.id ? appointment : item)));
  return appointment;
}

export function getAppointmentsByPatient(patientId) {
  return getAppointments().filter((appointment) => appointment.patientId === patientId);
}

export function getAppointmentsByDoctor(doctorId) {
  return getAppointments().filter((appointment) => appointment.doctorId === doctorId);
}

export function saveMedicalDocuments(patientId, appointmentId, documents) {
  const next = {
    id: id("document"),
    patientId,
    appointmentId,
    documents,
    createdAt: new Date().toLocaleString("es-EC"),
  };
  write(KEYS.documents, [...read(KEYS.documents), next]);
  return next;
}

export function getMedicalHistory(patientId) {
  return read(KEYS.documents).filter((document) => document.patientId === patientId);
}

export function saveMeetingUrl(appointmentId, meetingUrl) {
  if (meetingUrl && !meetingUrl.startsWith("https://zoom.us/") && !meetingUrl.startsWith("https://us02web.zoom.us/")) {
    throw new Error("El enlace de Zoom debe iniciar con https://zoom.us/ o https://us02web.zoom.us/.");
  }
  const appointment = getAppointments().find((item) => item.id === appointmentId);
  if (!appointment) throw new Error("Cita no encontrada.");
  updateAppointment({ ...appointment, meetingUrl });
}

export function addFamilyMember(patientId, name) {
  const next = { id: id("family"), patientId, name };
  write(KEYS.family, [...read(KEYS.family), next]);
  return next;
}

export function getFamilyMembers(patientId) {
  return read(KEYS.family).filter((member) => member.patientId === patientId);
}
