import { AwardPointsForm } from '@/components/admin/AwardPointsForm';
import { DeletionRequests } from '@/components/admin/DeletionRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Navigate } from 'react-router-dom';
export function AdminPage() {
  const { user } = useAuth();
  // This is a client-side guard. The API should enforce rules as the source of truth.
  if (user?.role !== 'ADMIN' && user?.role !== 'COACH') {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-display">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users and application settings.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Award Points</CardTitle>
            <CardDescription>Manually award points to a user for exceptional performance or other reasons.</CardDescription>
          </CardHeader>
          <CardContent>
            <AwardPointsForm />
          </CardContent>
        </Card>
        {user?.role === 'ADMIN' && (
          <Card>
            <CardHeader>
              <CardTitle>Account Deletion Requests</CardTitle>
              <CardDescription>Manage pending account deletion requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <DeletionRequests />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}