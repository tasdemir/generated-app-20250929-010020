import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Event, Participation } from '@shared/types';
import { Loader2, Calendar, Clock, MapPin, Users, UserCheck, UserX, HelpCircle, WifiOff, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { TeamAssignmentControl } from '@/components/events/TeamAssignmentControl';
export function EventDetailsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: event, isLoading, isError } = useQuery<Event>({
    queryKey: ['event', eventId],
    queryFn: () => api.get(`/events/${eventId}`),
    enabled: !!eventId,
  });
  const participationMutation = useMutation({
    mutationFn: (data: { status: 'DEFINITELY' | 'MAYBE' | 'CANT'; teamPreference: 'TEAM_A' | 'TEAM_B' }) =>
      api.post('/participations', { eventId, ...data }),
    onSuccess: () => {
      toast.success('Your status has been updated.');
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
    onError: () => {
      toast.error('Failed to update status. Please try again.');
    },
  });
  if (isLoading) return <EventDetailsSkeleton />;
  if (isError || !event) return <ErrorState />;
  const myParticipation = event.participations.find(p => p.userId === user?.id);
  const teamA = event.participations.filter(p => p.teamPreference === 'TEAM_A' && p.status === 'DEFINITELY');
  const teamB = event.participations.filter(p => p.teamPreference === 'TEAM_B' && p.status === 'DEFINITELY');
  const maybe = event.participations.filter(p => p.status === 'MAYBE');
  const cant = event.participations.filter(p => p.status === 'CANT');
  const handleStatusUpdate = (status: 'DEFINITELY' | 'MAYBE' | 'CANT') => {
    participationMutation.mutate({
      status,
      teamPreference: myParticipation?.teamPreference || 'TEAM_A',
    });
  };
  const handleTeamUpdate = (team: 'TEAM_A' | 'TEAM_B') => {
    participationMutation.mutate({
      status: myParticipation?.status || 'DEFINITELY',
      teamPreference: team,
    });
  };
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const canManage = user?.role === 'ADMIN' || user?.role === 'COACH';
  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-display">{event.location}</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-muted-foreground">
          <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-primary" /><span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span></div>
          <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-primary" /><span>{event.time}</span></div>
          <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /><span>{event.location}</span></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleStatusUpdate('DEFINITELY')} variant={myParticipation?.status === 'DEFINITELY' ? 'default' : 'outline'}><UserCheck className="mr-2 h-4 w-4" />Definitely</Button>
            <Button onClick={() => handleStatusUpdate('MAYBE')} variant={myParticipation?.status === 'MAYBE' ? 'default' : 'outline'}><HelpCircle className="mr-2 h-4 w-4" />Maybe</Button>
            <Button onClick={() => handleStatusUpdate('CANT')} variant={myParticipation?.status === 'CANT' ? 'destructive' : 'outline'}><UserX className="mr-2 h-4 w-4" />Can't Go</Button>
          </div>
          {myParticipation?.status === 'DEFINITELY' && (
            <div>
              <h3 className="mb-2 font-semibold">Team Preference</h3>
              <RadioGroup defaultValue={myParticipation.teamPreference} onValueChange={(value: 'TEAM_A' | 'TEAM_B') => handleTeamUpdate(value)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="TEAM_A" id="team_a" />
                  <Label htmlFor="team_a">Team A</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="TEAM_B" id="team_b" />
                  <Label htmlFor="team_b">Team B</Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </CardContent>
      </Card>
      <Tabs defaultValue="teams">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="maybe">Maybe ({maybe.length})</TabsTrigger>
          <TabsTrigger value="cant">Can't Go ({cant.length})</TabsTrigger>
          <TabsTrigger value="all">All ({event.participations.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="teams" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <PlayerListCard title="Team A" players={teamA} limit={event.teamALimit} getInitials={getInitials} canManage={canManage} eventId={event.id} />
            <PlayerListCard title="Team B" players={teamB} limit={event.teamBLimit} getInitials={getInitials} canManage={canManage} eventId={event.id} />
          </div>
        </TabsContent>
        <TabsContent value="maybe" className="mt-4">
          <PlayerListCard title="Maybe" players={maybe} getInitials={getInitials} />
        </TabsContent>
        <TabsContent value="cant" className="mt-4">
          <PlayerListCard title="Can't Go" players={cant} getInitials={getInitials} />
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          <PlayerListCard title="All Participants" players={event.participations} getInitials={getInitials} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
function PlayerListCard({ title, players, limit, getInitials, canManage, eventId }: { title: string; players: Participation[]; limit?: number; getInitials: (name: string) => string; canManage?: boolean; eventId?: string; }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-medium text-muted-foreground">
            <Users className="inline-block mr-2 h-4 w-4" />
            {players.length} {limit !== undefined && `/ ${limit}`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {players.length > 0 ? (
          <ul className="space-y-3">
            {players.map(p => (
              <li key={p.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${p.user.name}`} />
                    <AvatarFallback>{getInitials(p.user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{p.user.name}</span>
                </div>
                {canManage && eventId && p.status === 'DEFINITELY' && <TeamAssignmentControl participation={p} eventId={eventId} />}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No players in this list.</p>
        )}
      </CardContent>
    </Card>
  );
}
function EventDetailsSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-36" />
      <Card>
        <CardHeader><Skeleton className="h-8 w-3/5" /></CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-6 w-2/5" />
          <Skeleton className="h-6 w-3/5" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><Skeleton className="h-7 w-1/4" /></CardHeader>
        <CardContent className="flex gap-2"><Skeleton className="h-10 w-28" /><Skeleton className="h-10 w-28" /><Skeleton className="h-10 w-28" /></CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardHeader><Skeleton className="h-7 w-1/3" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-7 w-1/3" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
      </div>
    </div>
  );
}
function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <WifiOff className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Could not fetch event details</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        There was a problem connecting to the server. Please check your internet connection and try again.
      </p>
    </div>
  );
}