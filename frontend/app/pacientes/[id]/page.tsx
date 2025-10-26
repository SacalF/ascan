import VerPacienteClient from "./page-client"

interface PageProps {
  params: {
    id: string
  }
}

export default function VerPacientePage({ params }: PageProps) {
  return <VerPacienteClient pacienteId={params.id} />
}