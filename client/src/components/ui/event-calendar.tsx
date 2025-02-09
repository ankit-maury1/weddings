
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

export function EventCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showEventDialog, setShowEventDialog] = useState(false);

  return (
    <div className="p-4">
      <Calendar
        mode="single"
        selected={date}
        onSelect={(date) => {
          setDate(date);
          setShowEventDialog(true);
        }}
        className="rounded-md border"
      />
      
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
          </DialogHeader>
          {/* Add event form here */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
