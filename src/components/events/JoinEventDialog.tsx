import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Event } from '@shared/types';
import { Loader2 } from 'lucide-react';
interface JoinEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function JoinEventDialog({ open, onOpenChange }: JoinEventDialogProps) {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: (shortCode: string) => api.get<Event[]>(`/events?shortCode=${shortCode}`),
    onSuccess: (data) => {
      if (data && data.length > 0) {
        const event = data[0];
        toast.success(`Found event: ${event.location}`);
        onOpenChange(false);
        navigate(`/event/${event.id}`);
      } else {
        toast.error('Event not found. Please check the code.');
      }
    },
    onError: () => {
      toast.error('Failed to find event. Please try again.');
    },
  });
  const handleSubmit = () => {
    if (code.length === 6) {
      mutation.mutate(code.toUpperCase());
    } else {
      toast.warning('Please enter a 6-character code.');
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Event</DialogTitle>
          <DialogDescription>
            Enter the 6-character event code to find and join an event.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <InputOTP maxLength={6} value={code} onChange={(value) => setCode(value)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={mutation.isPending} className="w-full">
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Find Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}