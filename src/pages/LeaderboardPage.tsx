import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User } from '@shared/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, WifiOff } from 'lucide-react';
export function LeaderboardPage() {
  const { data: users, isLoading, isError } = useQuery<User[]>({
    queryKey: ['scoreboard'],
    queryFn: () => api.get('/users/scoreboard'),
  });
  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-display">Leaderboard</h1>
        <p className="text-muted-foreground">See who's at the top of their game.</p>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center"><Skeleton className="h-6 w-6 mx-auto rounded-full" /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <WifiOff className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Could not fetch leaderboard</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Please check your connection and try again.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="text-center font-bold text-lg text-muted-foreground">
                    {index < 3 ? (
                      <Trophy className={`mx-auto h-6 w-6 ${
                        index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-yellow-700'
                      }`} />
                    ) : (
                      index + 1
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-lg">{user.points}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}