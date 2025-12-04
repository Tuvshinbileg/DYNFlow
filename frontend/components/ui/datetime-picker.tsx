"use client"

import * as React from "react"
import { format, parse, set } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DateTimePickerProps {
  value?: string;
  onChange: (datetime: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  disabled = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Parse the ISO string or datetime-local format
  const parseDateTime = (val?: string) => {
    if (!val) return undefined;
    try {
      return new Date(val);
    } catch {
      return undefined;
    }
  }

  const date = parseDateTime(value);
  const [timeValue, setTimeValue] = React.useState<string>(
    date ? format(date, "HH:mm") : "12:00"
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Parse the time value
      const [hours, minutes] = timeValue.split(':').map(Number);
      
      // Set the time on the selected date
      const dateWithTime = set(selectedDate, {
        hours: hours || 0,
        minutes: minutes || 0,
        seconds: 0,
        milliseconds: 0
      });
      
      // Return ISO string
      onChange(dateWithTime.toISOString());
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);
    
    if (date) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const dateWithTime = set(date, {
        hours: hours || 0,
        minutes: minutes || 0,
        seconds: 0,
        milliseconds: 0
      });
      onChange(dateWithTime.toISOString());
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            <span>
              {format(date, "PPP")} at {format(date, "HH:mm")}
            </span>
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={disabled}
            initialFocus
          />
        </div>
        <div className="p-3 space-y-2">
          <Label htmlFor="time-picker" className="text-sm font-medium">
            Time
          </Label>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              id="time-picker"
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              disabled={disabled}
              className="flex-1"
            />
          </div>
          <Button
            size="sm"
            className="w-full"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
