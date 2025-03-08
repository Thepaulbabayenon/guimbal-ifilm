import { SignInForm } from "@/app/auth/nextjs/components/SignInForm"
import {
  Card,
  CardContent,
  CardDescription,
} from "@/components/ui/card"

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ oauthError?: string }>
}) {
  const { oauthError } = await searchParams

  return (
    <div className="container mx-auto p-4 max-w-[750px]">
      <Card>
          {oauthError && (
            <CardDescription className="text-destructive">
              {oauthError}
            </CardDescription>
          )}
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  )
}
