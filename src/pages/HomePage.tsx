import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Event } from '@shared/types';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/button';
import { JoinEventDialog } from '@/components/events/JoinEventDialog';
import { Loader2, PlusCircle, WifiOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminControls } from '@/components/admin/AdminControls';
export function HomePage() {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const { data: events, isLoading, isError } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: () => api.get('/events'),
  });
  const upcomingEvents = events?.filter(event => new Date(event.date) >= new Date()) || [];
  const pastEvents = events?.filter(event => new Date(event.date) < new Date()) || [];
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display">Events Dashboard</h1>
          <p className="text-muted-foreground">View upcoming and past events.</p>
        </div>
        <div className="flex items-center gap-2">
          <AdminControls />
          <Button onClick={() => setIsJoinDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Join Event
          </Button>
        </div>
      </div>
      {isLoading && <EventGridSkeleton />}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <WifiOff className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Could not fetch events</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            There was a problem connecting to the server. Please check your internet connection and try again.
          </p>
        </div>
      )}
      {!isLoading && !isError && (
        <>
          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Upcoming Events</h2>
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No upcoming events.</div>
            )}
          </section>
          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Past Events</h2>
            {pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No past events.</div>
            )}
          </section>
        </>
      )}
      <JoinEventDialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen} />
    </div>
  );
}
function EventGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-4 rounded-lg border p-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}