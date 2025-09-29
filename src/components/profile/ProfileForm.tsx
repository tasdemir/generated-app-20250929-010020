import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { User } from '@shared/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';
const SOCCER_POSITIONS = [
  { value: 'Goalkeeper', label: 'Goalkeeper' },
  { value: 'Centre-Back', label: 'Centre-Back' },
  { value: 'Full-Back', label: 'Full-Back' },
  { value: 'Wing-Back', label: 'Wing-Back' },
  { value: 'Defensive Midfielder', label: 'Defensive Midfielder' },
  { value: 'Central Midfielder', label: 'Central Midfielder' },
  { value: 'Attacking Midfielder', label: 'Attacking Midfielder' },
  { value: 'Winger', label: 'Winger' },
  { value: 'Striker', label: 'Striker' },
];
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  whatsapp: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  favoriteTeam: z.string().optional(),
  birthDate: z.date().optional(),
  positions: z.array(z.string()).optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;
export function ProfileForm() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      whatsapp: '',
      city: '',
      district: '',
      favoriteTeam: '',
      birthDate: undefined,
      positions: [],
    },
  });
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        whatsapp: user.whatsapp || '',
        city: user.city || '',
        district: user.district || '',
        favoriteTeam: user.favoriteTeam || '',
        birthDate: user.birthDate ? new Date(user.birthDate) : undefined,
        positions: user.positions || [],
      });
    }
  }, [user, form]);
  const mutation = useMutation({
    mutationFn: (data: ProfileFormValues) => api.put<User>('/users/profile', {
      ...data,
      birthDate: data.birthDate?.toISOString(),
    }),
    onSuccess: (updatedUser) => {
      toast.success('Profile updated successfully!');
      setUser(updatedUser, localStorage.getItem('pitchpal-auth-storage') ? JSON.parse(localStorage.getItem('pitchpal-auth-storage')!).state.token : null);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      toast.error('Failed to update profile. Please try again.');
    },
  });
  const onSubmit = (data: ProfileFormValues) => {
    mutation.mutate(data);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="positions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Soccer Positions</FormLabel>
                   <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" role="combobox" className="w-full justify-between h-auto">
                          <div className="flex gap-1 flex-wrap">
                            {field.value && field.value.length > 0
                              ? field.value.map((pos) => <Badge key={pos} variant="secondary">{pos}</Badge>)
                              : "Select positions"}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search positions..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {SOCCER_POSITIONS.map((option) => {
                              const isSelected = field.value?.includes(option.value);
                              return (
                                <CommandItem
                                  key={option.value}
                                  onSelect={() => {
                                    if (isSelected) {
                                      field.onChange(field.value?.filter((v) => v !== option.value));
                                    } else {
                                      field.onChange([...(field.value || []), option.value]);
                                    }
                                  }}
                                >
                                  <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                    <Check className="h-4 w-4" />
                                  </div>
                                  {option.label}
                                </CommandItem>
                              );
                            })}
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
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl><Input placeholder="e.g., +1234567890" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="favoriteTeam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favorite Team</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}