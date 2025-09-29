import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@shared/types';
const awardPointsSchema = z.object({
  userId: z.string().min(1, 'Please select a user.'),
  points: z.coerce.number().int().min(1, 'Points must be at least 1.'),
});
type AwardPointsFormValues = z.infer<typeof awardPointsSchema>;
export function AwardPointsForm() {
  const queryClient = useQueryClient();
  const form = useForm<AwardPointsFormValues>({
    resolver: zodResolver(awardPointsSchema),
    defaultValues: {
      userId: '',
      points: 1,
    },
  });
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users/scoreboard'), // Using scoreboard to get all users
  });
  const mutation = useMutation({
    mutationFn: (data: AwardPointsFormValues) => api.post('/users/award-points', data),
    onSuccess: () => {
      toast.success('Points awarded successfully!');
      queryClient.invalidateQueries({ queryKey: ['scoreboard'] });
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to award points.');
    },
  });
  const onSubmit = (data: AwardPointsFormValues) => {
    mutation.mutate(data);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>User</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                    >
                      {field.value ? users?.find((user) => user.id === field.value)?.name : 'Select user'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search user..." />
                    <CommandList>
                      {isLoadingUsers && <div className="p-4 text-center text-sm">Loading...</div>}
                      <CommandEmpty>No user found.</CommandEmpty>
                      <CommandGroup>
                        {users?.map((user) => (
                          <CommandItem
                            value={user.name}
                            key={user.id}
                            onSelect={() => {
                              form.setValue('userId', user.id);
                            }}
                          >
                            <Check className={cn('mr-2 h-4 w-4', user.id === field.value ? 'opacity-100' : 'opacity-0')} />
                            {user.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Points to Award</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 10" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Award Points
        </Button>
      </form>
    </Form>
  );
}