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
  const [events, setEvents] = useState([
    {
      id: "event2",
      title: "Mayfes Day 2",
      start: "2024-05-13T15:00:00",
      desc: "Conference",
      end: "2024-05-13T16:00:00",
      color: "blue", // Same color to indicate continuation
    },
    {
      id: "event1",
      title: "Conferenc",
      desc: "Conference",
      start: "2024-05-12T12:00:00",
      end: "2024-05-12T13:00:00",
      color: "#ff6347", // Use a unique color to represent this event
    },
    {
      id: "event1",
      title: "Conferenc",
      desc: "Conference",
      start: "2024-05-13T12:00:00",
      end: "2024-05-13T13:00:00",
      color: "#ff6347", // Same color to indicate continuation
    },
    {
      id: "event2",
      title: "Mayfes Day 2",
      desc: "Conference",
      start: "2024-05-12T15:00:00",
      end: "2024-05-12T16:00:00",
      color: "blue", // Same color to indicate continuation
    },
  ]);
  const handleEventClick = (clickInfo) => {
    if (clickInfo && clickInfo.event) {
      // Extract the event ID and start date from the clicked event
      const { id, start } = clickInfo.event;

      // Find the clicked event from the events array based on ID and start date
      const clickedEvent = events.find((event) => {
        const eventStartDate = new Date(event.start);
        return event.id === id && eventStartDate.getTime() === start.getTime();
      });

      // If a matching event is found, update the selected event state
      if (clickedEvent) {
        console.log(events);
        setSelectedEvent(clickedEvent);
      }
    }
  };

  return (
    <div
      className="calendar-container"
      style={{ width: "90%", marginLeft: "20px", marginTop: "75px" }}
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
        eventClick={handleEventClick}
        slotLabelFormat={{
          hour: "numeric",
          minute: "2-digit",
          omitZeroMinute: false,
          hour12: false,
          meridiem: "short",
        }}
      />
      <div style={{ width: "20%" }}>
        {selectedEvent && (
          <div className="event-details">
            <h3>{selectedEvent.title}</h3>
            <p>Desc: {selectedEvent.desc}</p>
            <p>Date: {formatDate(selectedEvent.start)}</p>
            <p>Start Time: {formatTime(selectedEvent.start)}</p>
            {selectedEvent.end !== selectedEvent.start && (
              <p>End Time: {formatTime(selectedEvent.end)}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};
export default CalendarComponent;
