import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react"; // Importa o componente principal
import dayGridPlugin from "@fullcalendar/daygrid"; // Visualização de grade diária
import timeGridPlugin from "@fullcalendar/timegrid"; // Visualização de grade de tempo
import interactionPlugin from "@fullcalendar/interaction"; // Permite interatividade (clicar e arrastar)


const Events = () => {
  // Estado para os eventos
  const [events] = useState([
    
  ]);

  return (
    <>
      {/* Header Start */}
      <div className="container-fluid bg-primary py-5 mb-5 page-header">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Eventos do LAPS
              </h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb justify-content-center">
                  <li className="breadcrumb-item">
                    <a className="text-white" href="/">
                      Home
                    </a>
                  </li>
                  <li
                    className="breadcrumb-item text-white active"
                    aria-current="page"
                  >
                    Eventos
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
      {/* Header End */}

      {/* Events Section Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <h6 className="section-title bg-white text-center text-primary px-3">
              Eventos
            </h6>
            <h1 className="mb-5">Próximos eventos do LAPS</h1>
          </div>

          {/* FullCalendar */}
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth" // Visualização inicial (mês)
            events={events} // Eventos do estado
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            height="auto"
          />
        </div>
      </div>
      {/* Events Section End */}
    </>
  );
};

export default Events;
