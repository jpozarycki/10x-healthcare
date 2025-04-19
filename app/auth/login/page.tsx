import { Metadata } from 'next'
import Image from 'next/image'
import { LoginForm } from '@/app/auth/components/login-form'

export const metadata: Metadata = {
  title: 'Login | MedMinder Plus',
  description: 'Login to your MedMinder Plus account',
}

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Image
            src="/logo.svg"
            width={128}
            height={128}
            alt="MedMinder Plus"
            className="mx-auto"
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to sign in to your account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
} 