import { SignUpForm } from "@/app/auth/nextjs/components/SignUpForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUp() {
  return (
    <div className="container mx-auto p-4 max-w-[600px] bg-transparent">
      <Card className="bg-transparent border-none">
        <CardContent className="bg-transparent border-none" >
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  )
}
