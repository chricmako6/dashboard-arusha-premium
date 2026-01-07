"use client";
import React, { useState } from "react";
import Calendar from "react-calendar";
import Image from "next/image";
import "react-calendar/dist/Calendar.css";

const events = [
  {
    id: 1,
    title: "Board Meeting",
    date: "2025-10-10",
    description: "Quarterly board meeting to discuss company performance and strategies.",
  },
  {
    id: 2,
    title: "Team Outing",
    date: "2025-10-27",
    description: "Annual team outing for team building activities and relaxation.",
  },
  {
    id: 3,
    title: "Product Launch",
    date: "2025-10-29",
    description: "Launch event for the new product line with presentations and demos.",
  },
];

function EventCalendar() {
  const [value, onChange] = useState(new Date());

  // Format the selected date to match the event date format (YYYY-MM-DD)
  const selectedDate = value.toISOString().split("T")[0];

  // Filter events that match the selected date
  const filteredEvents = events.filter((event) => event.date === selectedDate);

  return (
    <div className="p-4 bg-white rounded-md shadow-md">
      {/* Calendar */}
      <Calendar onChange={onChange} value={value} />

      {/* Events Section */}
      <div className="mt-5">
        <div className="flex justify-between">
          <h1 className="text-lg font-semibold mb-2">Events </h1>
          <Image src="/3dots.svg" alt="menu" width={25} height={25}/>
        </div>
          {filteredEvents.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredEvents.map((event) => (
                <div key={event.id}>
                <div className="flex flex-col gap-2 p-4 rounded-md shadow-sm bg-[#fae27c]">
                  <h1 className="text-lg font-bold text-gray-800">
                    {event.title}
                    <span className="ml-7 text-sm text-gray-500 bg-white rounded-full px-2">{selectedDate}</span>
                  </h1>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No events for this date.</p>
          )}
      </div>
    </div>
  );
}

export default EventCalendar;