import { useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

import Header from "../Header.jsx";
import { fetchEvent, deleteEvent, queryClient } from "../../utils/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDelete, setIsDelete] = useState(false);

  const params = useParams(); /// get id params value

  const navigate = useNavigate();

  const { data, isPending, error, isError } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });

  const {
    mutate,
    isPending: isPendingEvent,
    isError: isErrorEvent,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  function handleStopDelete() {
    setIsDelete(false);
  }

  function handleStartDelete() {
    setIsDelete(true);
  }

  function handleDeleteEvent() {
    mutate({ id: params.id });
  }

  let content;

  if (isPending) {
    content = (
      <div id="event-details-content">
        <p>Fetching event data.......</p>
      </div>
    );
  }

  if (isError) {
    content = (
      <div id="event-details-content">
        <ErrorBlock
          title="Failed to fetch event"
          message={
            error.info?.message ||
            "Failed to fetch event. Please  try again later."
          }
        />
      </div>
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDelete && (
        <Modal onClose={handleStopDelete}>
          <h1>Are you sure to delete?</h1>
          <p>Do you really want to delete this event?</p>
          <div className="form-actions">
            {isPendingEvent && <p>Deleting.....</p>}
            {!isPendingEvent && (
              <>
                <button className="button-text" onClick={handleStopDelete}>
                  cancel
                </button>
                <button className="button" onClick={handleDeleteEvent}>
                  delete
                </button>
              </>
            )}
          </div>
          {isErrorEvent && (
            <ErrorBlock
              title="Failed to delete event"
              message={
                deleteError.info?.message ||
                "Failed to delete event, please try again later."
              }
            />
          )}
        </Modal>
      )}

      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
