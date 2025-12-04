import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground">Page not found</p>
        <p className="text-sm text-muted-foreground">The page you are looking for does not exist.</p>
        <Link href="/">
          <Button>Go back home</Button>
        </Link>
      </div>
    </div>
  )
}
