import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
const createEventSchema = z.object({
  location: z.string().min(3, 'Location is required.'),
  date: z.date({ required_error: "A date is required." }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM).'),
  teamALimit: z.coerce.number().int().positive('Limit must be a positive number.'),
  teamBLimit: z.coerce.number().int().positive('Limit must be a positive number.'),
});
type CreateEventFormValues = z.infer<typeof createEventSchema>;
interface CreateEventFormProps {
  onSuccess: () => void;
}
export function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      location: '',
      date: new Date(),
      time: '',
      teamALimit: 10,
      teamBLimit: 10,
    },
  });
  const mutation = useMutation({
    mutationFn: (data: CreateEventFormValues) => api.post('/events', {
      ...data,
      date: data.date.toISOString(),
    }),
    onSuccess: () => {
      toast.success('Event created successfully!');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to create event. Please try again.');
    },
  });
  const onSubmit = (data: CreateEventFormValues) => {
    mutation.mutate(data);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                      >
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl><Input type="time" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="teamALimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team A Limit</FormLabel>
                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="teamBLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team B Limit</FormLabel>
                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Event
        </Button>
      </form>
    </Form>
  );
}