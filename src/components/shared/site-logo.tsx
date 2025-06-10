import { TicketIcon } from 'lucide-react';
import Link from 'next/link';

interface SiteLogoProps {
  className?: string;
}

export function SiteLogo({ className }: SiteLogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-xl font-semibold ${className}`}>
      <TicketIcon className="h-7 w-7 text-primary" />
      <span className="font-headline">Local Queue Assistant</span>
    </Link>
  );
}
