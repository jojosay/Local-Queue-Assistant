
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteLogo } from '@/components/shared/site-logo';
import { UsersIcon, LogInIcon, TicketIcon as KioskIcon, TvIcon } from 'lucide-react'; // Renamed TicketIcon to avoid conflict

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in">
      <header className="mb-12">
        <SiteLogo className="text-3xl" />
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <KioskIcon className="h-8 w-8 text-primary" />
              <CardTitle className="font-headline text-2xl">Ticket Kiosk</CardTitle>
            </div>
            <CardDescription>
              Are you a customer? Get your queue ticket here to join the line.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="lg">
              <Link href="/kiosk">Go to Kiosk</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <LogInIcon className="h-8 w-8 text-accent" />
              <CardTitle className="font-headline text-2xl">Staff & Admin Login</CardTitle>
            </div>
            <CardDescription>
              Are you staff or an administrator? Log in to manage queues and system settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline" size="lg">
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <TvIcon className="h-8 w-8 text-green-500" />
              <CardTitle className="font-headline text-2xl">Live Queue Display</CardTitle>
            </div>
            <CardDescription>
              View the current status of all service counters and waiting tickets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="lg" variant="secondary">
              <Link href="/display">View Display</Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-16 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Local Queue Assistant. All rights reserved.</p>
        <p>Streamlining your waiting experience.</p>
      </footer>
    </div>
  );
}
