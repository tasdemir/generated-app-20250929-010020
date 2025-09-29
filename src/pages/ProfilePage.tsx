import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { SecurityForm } from '@/components/profile/SecurityForm';
import { UserStats } from '@/components/profile/UserStats';
export function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-display">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your account and personal information.</p>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="stats">
          <UserStats />
        </TabsContent>
        <TabsContent value="security">
          <SecurityForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}