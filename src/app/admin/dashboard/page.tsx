
import { AdminLayout } from '@/components/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SettingsIcon, BuildingIcon, UsersIcon as CounterIcon, UserCogIcon, TvIcon } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <PageHeader 
        title="Administrator Dashboard" 
        description="Manage system settings, offices, counters, and staff."
        icon={SettingsIcon}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 animate-fade-in">
        <FeatureCard
          title="Office Management"
          description="Add, edit, or remove office locations."
          icon={BuildingIcon}
          linkHref="/admin/offices"
          linkText="Manage Offices"
        />
        <FeatureCard
          title="Counter Management"
          description="Configure counters for each office, including priority settings."
          icon={CounterIcon}
          linkHref="/admin/counters"
          linkText="Manage Counters"
        />
        <FeatureCard
          title="User Management"
          description="Manage staff and administrator accounts."
          icon={UserCogIcon}
          linkHref="/admin/users"
          linkText="Manage Users"
        />
        <FeatureCard
          title="Live Queue Display"
          description="View current ticket queues for all active offices."
          icon={TvIcon}
          linkHref="/display"
          linkText="View Display"
        />
      </div>
    </AdminLayout>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  linkHref: string;
  linkText: string;
  disabled?: boolean;
}

function FeatureCard({ title, description, icon: Icon, linkHref, linkText, disabled = false }: FeatureCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Icon className="h-7 w-7 text-primary" />
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full" disabled={disabled}>
          <Link href={disabled ? '#' : linkHref} target={linkHref === "/display" ? "_blank" : undefined} rel={linkHref === "/display" ? "noopener noreferrer" : undefined}>{linkText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
