export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>ASCAN Backend API</h1>
      <p>El servidor backend está funcionando correctamente.</p>
      <p>Puerto: 3001</p>
      <h2>Endpoints disponibles:</h2>
      <ul>
        <li>/api/auth/* - Autenticación</li>
        <li>/api/pacientes/* - Gestión de pacientes</li>
        <li>/api/citas/* - Gestión de citas</li>
        <li>/api/consultas/* - Gestión de consultas</li>
        <li>/api/laboratorio/* - Gestión de laboratorio</li>
        <li>/api/users/* - Gestión de usuarios</li>
        <li>/api/valoraciones/* - Gestión de valoraciones</li>
      </ul>
    </div>
  )
}
