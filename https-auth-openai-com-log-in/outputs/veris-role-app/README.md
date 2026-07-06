# VERIS: VIDEO CONSULTA MÉDICA

Aplicación académica de videoconsultas médicas con acceso por roles: Paciente, Doctor y Administrador.

## Como ejecutar

```bash
npm install
npm run dev
npm run build
```

## Roles del sistema

- Paciente: agenda videoconsultas, registra familiares, realiza pagos simulados, revisa citas vigentes, ingresa a Zoom y consulta historial clínico simulado.
- Doctor: revisa citas asignadas, atiende por enlace externo de Zoom, finaliza consultas y genera documentos médicos simulados.
- Administrador: gestiona usuarios, doctores, especialidades, citas, estados y enlaces externos de Zoom.

## Credenciales de prueba

Paciente:

- correo: paciente@demo.com
- contraseña: 123456

Doctor:

- correo: doctor@demo.com
- contraseña: 123456

Administrador:

- correo: admin@demo.com
- contraseña: 123456

## Notas academicas

- El sistema usa LocalStorage.
- No procesa pagos reales.
- No realiza videollamadas reales internas.
- Las videoconsultas se abren únicamente mediante enlaces externos de Zoom.
- No usa Google Meet.
- Los documentos medicos son simulados.
- Es un proyecto academico.
