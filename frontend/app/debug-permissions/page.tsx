"use client"

import React from 'react'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/use-permissions'
import { useActions } from '@/hooks/use-actions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function DebugPermissionsPage() {
  const { user, authenticated, loading: authLoading } = useAuth()
  const { permissions, canAccess, loading: permissionsLoading } = usePermissions()
  const { actions, hasAction, loading: actionsLoading } = useActions()

  const loading = authLoading || permissionsLoading || actionsLoading

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Cargando información de permisos...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center">Página de Depuración de Permisos</h1>
      <p className="text-center text-muted-foreground">
        Esta página muestra la información de autenticación y permisos que el frontend está recibiendo.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Autenticado:</strong> <Badge variant={authenticated ? "default" : "destructive"}>{authenticated ? "Sí" : "No"}</Badge></p>
          {user ? (
            <>
              <p><strong>ID de Usuario:</strong> {user.id}</p>
              <p><strong>Nombre:</strong> {user.nombres} {user.apellidos}</p>
              <p><strong>Rol:</strong> <Badge>{user.rol}</Badge></p>
            </>
          ) : (
            <p className="text-red-500">No hay usuario autenticado.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permisos de Módulos (usePermissions)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Módulos a los que tiene acceso:</strong></p>
          <div className="flex flex-wrap gap-2">
            {permissions.length > 0 ? (
              permissions.map((p, index) => (
                <Badge key={index} variant="secondary">{p}</Badge>
              ))
            ) : (
              <p className="text-muted-foreground">Ningún módulo asignado o cargando...</p>
            )}
          </div>
          <Separator className="my-4" />
          <p><strong>Verificación rápida de módulos:</strong></p>
          <div className="grid grid-cols-2 gap-2">
            <div>Dashboard: <Badge variant={canAccess('dashboard') ? "default" : "destructive"}>{canAccess('dashboard') ? "Sí" : "No"}</Badge></div>
            <div>Pacientes: <Badge variant={canAccess('pacientes') ? "default" : "destructive"}>{canAccess('pacientes') ? "Sí" : "No"}</Badge></div>
            <div>Citas: <Badge variant={canAccess('citas') ? "default" : "destructive"}>{canAccess('citas') ? "Sí" : "No"}</Badge></div>
            <div>Consultas: <Badge variant={canAccess('consultas') ? "default" : "destructive"}>{canAccess('consultas') ? "Sí" : "No"}</Badge></div>
            <div>Laboratorio: <Badge variant={canAccess('laboratorio') ? "default" : "destructive"}>{canAccess('laboratorio') ? "Sí" : "No"}</Badge></div>
            <div>Administracion: <Badge variant={canAccess('administracion') ? "default" : "destructive"}>{canAccess('administracion') ? "Sí" : "No"}</Badge></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permisos de Acciones (useActions)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Acciones a las que tiene acceso:</strong></p>
          <div className="flex flex-wrap gap-2">
            {actions.length > 0 ? (
              actions.map((a, index) => (
                <Badge key={index} variant="secondary">{a}</Badge>
              ))
            ) : (
              <p className="text-muted-foreground">Ninguna acción asignada o cargando...</p>
            )}
          </div>
          <Separator className="my-4" />
          <p><strong>Verificación rápida de acciones:</strong></p>
          <div className="grid grid-cols-2 gap-2">
            <div>ver_pacientes: <Badge variant={hasAction('ver_pacientes') ? "default" : "destructive"}>{hasAction('ver_pacientes') ? "Sí" : "No"}</Badge></div>
            <div>crear_pacientes: <Badge variant={hasAction('crear_pacientes') ? "default" : "destructive"}>{hasAction('crear_pacientes') ? "Sí" : "No"}</Badge></div>
            <div>editar_pacientes: <Badge variant={hasAction('editar_pacientes') ? "default" : "destructive"}>{hasAction('editar_pacientes') ? "Sí" : "No"}</Badge></div>
            <div>eliminar_pacientes: <Badge variant={hasAction('eliminar_pacientes') ? "default" : "destructive"}>{hasAction('eliminar_pacientes') ? "Sí" : "No"}</Badge></div>
            <div>ver_consultas: <Badge variant={hasAction('ver_consultas') ? "default" : "destructive"}>{hasAction('ver_consultas') ? "Sí" : "No"}</Badge></div>
            <div>crear_consultas: <Badge variant={hasAction('crear_consultas') ? "default" : "destructive"}>{hasAction('crear_consultas') ? "Sí" : "No"}</Badge></div>
            <div>admin_usuarios: <Badge variant={hasAction('admin_usuarios') ? "default" : "destructive"}>{hasAction('admin_usuarios') ? "Sí" : "No"}</Badge></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
