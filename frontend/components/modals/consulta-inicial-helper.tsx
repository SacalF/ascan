// Helper para combinar datos de consulta inicial, valoración y examen físico
export interface ConsultaCompleta {
  // Datos básicos de consulta
  id?: string
  paciente_id?: string
  medico_id?: string
  fecha_consulta?: string
  medico_nombre?: string
  medico_apellidos?: string
  medico?: string
  created_at?: string
  
  // Historia y síntomas
  motivo_consulta?: string
  primer_sintoma?: string
  fecha_primer_sintoma?: string
  antecedentes_medicos?: string
  antecedentes_quirurgicos?: string
  revision_sistemas?: string
  historia_familiar?: string
  
  // Información ginecológica
  menstruacion_menarca?: string
  menstruacion_ultima?: string
  gravidez?: number
  partos?: number
  abortos?: number
  habitos_tabaco?: number
  habitos_otros?: string
  
  // Diagnóstico y tratamiento
  diagnostico?: string
  tratamiento?: string
  plan_tratamiento?: string
  
  // Signos vitales
  peso?: string | number
  talla?: string | number
  pulso?: string | number
  respiracion?: string | number
  presion_arterial?: string
  temperatura?: string | number
  
  // Examen físico
  cabeza?: string
  cuello?: string
  torax?: string
  abdomen?: string
  extremidades?: string
  ojos?: string
  dientes?: string
  tiroides?: string
  pulmones?: string
  corazon?: string
  higado?: string
  genitales?: string
  nariz?: string
  ganglios?: string
  recto?: string
  
  // Información del paciente
  paciente_nombre?: string
  paciente_telefono?: string
  paciente_email?: string
  numero_registro_medico?: string
  fecha_nacimiento?: string
  sexo?: string
  imagenes?: string | string[]
}

export function combinarDatosConsulta(
  consultaInicial: any,
  valoracion?: any,
  examenFisico?: any,
  paciente?: any
): ConsultaCompleta {
  return {
    // Datos de consulta inicial (incluye imagenes si está presente)
    ...consultaInicial,
    imagenes: consultaInicial?.imagenes,
    
    // Datos de valoración si están disponibles
    ...(valoracion && {
      peso: valoracion.peso,
      talla: valoracion.talla,
      pulso: valoracion.pulso,
      respiracion: valoracion.respiracion,
      presion_arterial: valoracion.presion_arterial,
      temperatura: valoracion.temperatura
    }),
    
    // Datos de examen físico si están disponibles
    ...(examenFisico && {
      cabeza: examenFisico.cabeza,
      cuello: examenFisico.cuello,
      torax: examenFisico.torax,
      abdomen: examenFisico.abdomen,
      extremidades: examenFisico.extremidades,
      ojos: examenFisico.ojos,
      dientes: examenFisico.dientes,
      tiroides: examenFisico.tiroides,
      pulmones: examenFisico.pulmones,
      corazon: examenFisico.corazon,
      higado: examenFisico.higado,
      genitales: examenFisico.genitales,
      nariz: examenFisico.nariz,
      ganglios: examenFisico.ganglios,
      recto: examenFisico.recto
    }),
    
    // Información del paciente si está disponible
    ...(paciente && {
      paciente_nombre: paciente.nombres && paciente.apellidos 
        ? `${paciente.nombres} ${paciente.apellidos}` 
        : paciente.nombre_completo,
      paciente_telefono: paciente.telefono,
      paciente_email: paciente.correo_electronico,
      numero_registro_medico: paciente.numero_registro_medico,
      fecha_nacimiento: paciente.fecha_nacimiento,
      sexo: paciente.sexo
    })
  }
}
