import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User } from '@shared/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Loader2, WifiOff, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
export function DeletionRequests() {
  const queryClient = useQueryClient();
  const { data: users, isLoading, isError } = useQuery<User[]>({
    queryKey: ['deletionRequests'],
    queryFn: () => api.get('/admin/deletion-requests'),
  });
  const mutation = useMutation({
    mutationFn: ({ userId, approve }: { userId: string; approve: boolean }) =>
      api.post(`/admin/deletion-requests/${userId}`, { approve }),
    onSuccess: (_, variables) => {
      toast.success(`Request has been ${variables.approve ? 'approved' : 'denied'}.`);
      queryClient.invalidateQueries({ queryKey: ['deletionRequests'] });
    },
    onError: () => {
      toast.error('Failed to process request. Please try again.');
    },
  });
  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Request Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell className="text-right space-x-2">
                  <Skeleton className="h-9 w-9 inline-block" />
                  <Skeleton className="h-9 w-9 inline-block" />
                </TableCell>
              </TableRow>
            ))
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={3}>
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <WifiOff className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Could not fetch requests</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Please check your connection and try again.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : users && users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {user.deletionRequestedAt ? format(new Date(user.deletionRequestedAt), 'PPp') : 'N/A'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-green-600 hover:text-green-700"
                    onClick={() => mutation.mutate({ userId: user.id, approve: true })}
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending && mutation.variables?.userId === user.id && mutation.variables.approve ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => mutation.mutate({ userId: user.id, approve: false })}
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending && mutation.variables?.userId === user.id && !mutation.variables.approve ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-5 w-5" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center h-24">
                No pending deletion requests.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}