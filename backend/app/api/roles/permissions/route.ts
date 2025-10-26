import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { authenticateUser } from "@/lib/auth-guard"

// Función para mapear acciones a módulos
function mapActionsToModules(actions: string[]): string[] {
  const modules: string[] = ['dashboard'] // Siempre incluir dashboard
  
  // Mapeo de acciones a módulos
  const actionToModuleMap: { [key: string]: string } = {
    // Pacientes
    'ver_pacientes': 'pacientes',
    'crear_pacientes': 'pacientes',
    'editar_pacientes': 'pacientes',
    'eliminar_pacientes': 'pacientes',
    
    // Consultas
    'ver_consultas': 'consultas',
    'crear_consultas': 'consultas',
    'editar_consultas': 'consultas',
    'consultas_ver': 'consultas',
    'consultas_crear': 'consultas',
    'consultas_editar': 'consultas',
    
    // Citas
    'ver_citas': 'citas',
    'crear_citas': 'citas',
    'editar_citas': 'citas',
    'citas_ver': 'citas',
    'citas_crear': 'citas',
    'citas_editar': 'citas',
    
    // Laboratorio
    'ver_laboratorio': 'laboratorio',
    'crear_laboratorio': 'laboratorio',
    'editar_laboratorio': 'laboratorio',
    'laboratorio_ver': 'laboratorio',
    'laboratorio_crear': 'laboratorio',
    'laboratorio_editar': 'laboratorio',
    
    // Administración
    'admin_usuarios': 'administracion',
    'admin_reportes': 'administracion',
    'admin_roles': 'administracion',
    'all': 'administracion'
  }
  
  // Convertir acciones a módulos
  actions.forEach(action => {
    const module = actionToModuleMap[action]
    if (module && !modules.includes(module)) {
      modules.push(module)
    }
  })
  
  return modules
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    // Obtener permisos del rol del usuario desde la base de datos
    const rolePermissions = await executeQuery(
      `SELECT permisos FROM roles WHERE nombre_rol = ? AND activo = 1`,
      [user.rol]
    )

    let actionPermissions: string[] = []
    let modulePermissions: string[] = []

    if (Array.isArray(rolePermissions) && rolePermissions.length > 0) {
      const roleData = rolePermissions[0] as any
      try {
        const rawPermissions = JSON.parse(roleData.permisos || '[]')
        
        // Usar los permisos tal como están en la base de datos (módulos directos)
        modulePermissions = rawPermissions
        actionPermissions = [] // No usamos acciones específicas
        
        console.log(`📋 Permisos del rol ${user.rol} desde BD:`, modulePermissions)
      } catch (error) {
        console.error("Error parseando permisos:", error)
        actionPermissions = []
        modulePermissions = ['dashboard'] // Mínimo acceso
      }
    } else {
      // Si no hay rol en la tabla roles, usar permisos por defecto
      const defaultPermissions = {
        'administrador': ['dashboard', 'pacientes', 'citas', 'consultas', 'laboratorio', 'administracion'],
        'Administrador': ['dashboard', 'pacientes', 'citas', 'consultas', 'laboratorio', 'administracion'],
        'medico': ['dashboard', 'pacientes', 'consultas'],
        'enfermera': ['dashboard', 'pacientes', 'consultas'],
        'recepcionista': ['dashboard', 'pacientes', 'citas'],
        'laboratorio': ['dashboard', 'pacientes', 'laboratorio'],
        'ultrasonido': ['dashboard', 'pacientes', 'laboratorio']
      }
      
      modulePermissions = defaultPermissions[user.rol as keyof typeof defaultPermissions] || ['dashboard']
      console.log(`⚠️ Rol ${user.rol} no encontrado en BD, usando permisos por defecto:`, modulePermissions)
    }

    // SOLUCIÓN DIRECTA: Forzar permisos para roles específicos
    if (user.rol === 'administrador' || user.rol === 'Administrador') {
      modulePermissions = ['dashboard', 'pacientes', 'citas', 'consultas', 'laboratorio', 'administracion']
      console.log("🔧 FORZANDO PERMISOS DE ADMINISTRADOR:", modulePermissions)
    } else if (user.rol === 'enfermera') {
      modulePermissions = ['dashboard', 'pacientes', 'consultas']
      console.log("🔧 FORZANDO PERMISOS DE ENFERMERA:", modulePermissions)
    } else if (user.rol === 'medico') {
      modulePermissions = ['dashboard', 'pacientes', 'consultas']
      console.log("🔧 FORZANDO PERMISOS DE MÉDICO:", modulePermissions)
    } else if (user.rol === 'recepcionista') {
      modulePermissions = ['dashboard', 'pacientes', 'citas']
      console.log("🔧 FORZANDO PERMISOS DE RECEPCIONISTA:", modulePermissions)
    } else if (user.rol === 'laboratorio') {
      modulePermissions = ['dashboard', 'pacientes', 'laboratorio']
      console.log("🔧 FORZANDO PERMISOS DE LABORATORIO:", modulePermissions)
    }

    // Logs de depuración
    console.log("🔍 DEBUG PERMISSIONS:")
    console.log("- Usuario:", user.rol)
    console.log("- Permisos del rol:", rolePermissions)
    console.log("- Módulos finales:", modulePermissions)
    console.log("- Acciones:", actionPermissions)
    console.log("- Usuario completo:", user.nombres, user.apellidos)

    return NextResponse.json({
      user: {
        id: user.id_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol: user.rol
      },
      permissions: modulePermissions,
      availableModules: modulePermissions,
      actionPermissions: actionPermissions
    })

  } catch (error) {
    console.error("Error obteniendo permisos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
