import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateEventForm } from './CreateEventForm';
import { PlusCircle } from 'lucide-react';
export function AdminControls() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  if (user?.role !== 'ADMIN' && user?.role !== 'COACH') {
    return null;
  }
  return (
    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <CreateEventForm onSuccess={() => setIsCreateOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}