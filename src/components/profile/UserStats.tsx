import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, CalendarCheck, Percent, Trophy, WifiOff } from 'lucide-react';
interface UserStatsData {
  totalPoints: number;
  eventsAttended: number;
  winRatio: number;
  rank: number;
}
export function UserStats() {
  const { data: stats, isLoading, isError } = useQuery<UserStatsData>({
    queryKey: ['userStats'],
    queryFn: () => api.get('/users/stats'),
  });
  if (isLoading) {
    return <StatsSkeleton />;
  }
  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center rounded-lg p-12 text-center">
            <WifiOff className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Could not fetch stats</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              There was a problem connecting to the server. Please try again later.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Award} title="Total Points" value={stats?.totalPoints ?? 0} />
          <StatCard icon={CalendarCheck} title="Events Attended" value={stats?.eventsAttended ?? 0} />
          <StatCard icon={Percent} title="Win Ratio" value={`${stats?.winRatio ?? 0}%`} />
          <StatCard icon={Trophy} title="Leaderboard Rank" value={`#${stats?.rank ?? 'N/A'}`} />
        </div>
      </CardContent>
    </Card>
  );
}
interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
}
function StatCard({ icon: Icon, title, value }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
function StatsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-1/3" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}