import { Event } from '@shared/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
interface EventCardProps {
  event: Event;
}
export function EventCard({ event }: EventCardProps) {
  const totalParticipants = event.participations.filter(p => p.status === 'DEFINITELY').length;
  const totalLimit = event.teamALimit + event.teamBLimit;
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/event/${event.id}`}>
        <Card className="h-full flex flex-col transition-all duration-200 border-transparent hover:border-primary">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {event.location}
              </CardTitle>
              <Badge variant="secondary">{event.shortCode}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{totalParticipants} / {totalLimit} confirmed</span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}