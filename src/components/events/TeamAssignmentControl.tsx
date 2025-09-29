import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Participation } from '@shared/types';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
interface TeamAssignmentControlProps {
  participation: Participation;
  eventId: string;
}
export function TeamAssignmentControl({ participation, eventId }: TeamAssignmentControlProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (newTeam: 'TEAM_A' | 'TEAM_B') =>
      api.post('/participations', {
        eventId,
        userId: participation.userId,
        status: participation.status,
        teamPreference: newTeam,
      }),
    onSuccess: () => {
      toast.success(`${participation.user.name}'s team has been updated.`);
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
    onError: () => {
      toast.error('Failed to update team. Please try again.');
    },
  });
  const handleTeamSwitch = () => {
    const newTeam = participation.teamPreference === 'TEAM_A' ? 'TEAM_B' : 'TEAM_A';
    mutation.mutate(newTeam);
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleTeamSwitch}
            disabled={mutation.isPending}
            className="h-8 w-8"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowLeftRight className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to Team {participation.teamPreference === 'TEAM_A' ? 'B' : 'A'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}