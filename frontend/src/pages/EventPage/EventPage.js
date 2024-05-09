import React, { useState, useRef, useEffect } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const CalendarComponent = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const dayGridContainerRef = useRef(null);

  useEffect(() => {
    // Wait for the FullCalendar component to mount and set the day grid container reference
    dayGridContainerRef.current = document.querySelector(
      ".fc-day-grid-container"
    );
  }, []);
  const events = [
    {
      id: "event1",
      title: "Conference Day 1",
      start: "2024-05-12T12:00:00",
      end: "2024-05-12T13:00:00",
      color: "#ff6347", // Use a unique color to represent this event
    },
    {
      id: "event1",
      title: "Conference Day 2",
      start: "2024-05-13T15:00:00",
      end: "2024-05-13T16:00:00",
      color: "#ff6347", // Same color to indicate continuation
    },
    {
      id: "event2",
      title: "Mayfes Day 2",
      start: "2024-05-13T15:00:00",
      end: "2024-05-13T16:00:00",
      color: "blue", // Same color to indicate continuation
    },
    {
      id: "event3",
      title: "Mayfes Day 2",
      start: "2024-05-13T15:00:00",
      end: "2024-05-13T16:00:00",
      color: "blue", // Same color to indicate continuation
    },
  ];

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(
      events.find((event) => event.id === parseInt(clickInfo.event.id))
    );
  };

  return (
    <div
      className="calendar-container"
      style={{ width: "80%", marginLeft: "10px", marginTop: "75px" }}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        headerToolbar={{
          left: "prev,next",
          center: "title,today",
          right: "dayGridMonth,timeGridWeek",
        }}
        eventClick={function (arg) {
          alert(arg.event.title); // Example of interacting with an event
        }}
        slotLabelFormat={{
          hour: "numeric",
          minute: "2-digit",
          omitZeroMinute: false,
          hour12: false,
          meridiem: "short",
        }}
      />
    </div>
  );
};

export default CalendarComponent;
