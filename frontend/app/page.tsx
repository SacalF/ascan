import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/mysql"

export default async function HomePage() {
  const cookieStore = cookies()
  const token = cookieStore.get("session-token")?.value

  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      redirect("/dashboard")
    }
  }
  
  redirect("/auth/login")
}
