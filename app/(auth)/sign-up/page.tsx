import { SignUpForm } from "@/app/auth/nextjs/components/SignUpForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUp() {
  return (
    <div className="container mx-auto p-4 max-w-[750px]">
      <Card>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  )
}
