import EditarPacienteClient from "./page-client"

interface PageProps {
  params: {
    id: string
  }
}

export default function EditarPacientePage({ params }: PageProps) {
  return <EditarPacienteClient pacienteId={params.id} />
}
