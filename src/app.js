// we use stringify to inline an example XML document
import pizzaDiagram from '../resources/pizza-collaboration.bpmn';
import emptyDiagram from '../resources/empty.bpmn';
import absenseRequestDiagram from '../resources/absence-request.bpmn';
import ticketBookingDiagram from '../resources/ticket-booking.bpmn'
import errorHandling from '../resources/error-handling.bpmn';
import enforcingSLA from '../resources/enforcing-sla.bpmn';

import Modeler from "bpmn-js/lib/Modeler";

import TokenSimulationModule from "bpmn-js-token-simulation/lib/modeler";
import ResetSimulation from "bpmn-js-token-simulation/lib/features/reset-simulation";
import TokenSimulationSupportModule from "bpmn-js-token-simulation/lib/simulation-support";

import TemplateExtension from './template-guide'

const diagramSelect = document.getElementById("choose-diagram");
const toggleSimulation = document.getElementById("toggle-simulation");
const toggleGuide = document.getElementById("toggle-guide");
const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");
const resetZoom = document.getElementById("reset-zoom");

const diagrams = {
  pizza: pizzaDiagram,
  "absence-request": absenseRequestDiagram,
  "ticket-booking": ticketBookingDiagram,
  "enforcing-sla": enforcingSLA,
  "error-handling": errorHandling,
  "": emptyDiagram
}

let isTokenSimulationActivated = false;

var modeler = new Modeler({
  container: '#canvas',
  keyboard: {
    bindTo: document
  },
  additionalModules: [
    TokenSimulationModule,
    ResetSimulation,
    TokenSimulationSupportModule,
    TemplateExtension
  ]
  
});

// disable scroll canvas with wheel
modeler.get("zoomScroll").toggle(false);

const resetSimulation = modeler.get("resetSimulation"),
      simulationSupport = modeler.get("simulationSupport");

const run = async () => {
  await importDiagram(emptyDiagram);
};

const importDiagram = async (diagram) => {
  const { error, warnings } = await modeler.importXML(diagram);

  if (error) {
    throw error;
  }

  if (warnings.length) {
    console.log(warnings);
  }
};

const resetTokenSimulation = (value) => {
  resetSimulation.resetSimulation();
  simulationSupport.toggleSimulation(value);
  isTokenSimulationActivated = value;
}

diagramSelect.addEventListener("change", async (e) => {
  await importDiagram(diagrams[e.target.value]);

  if(isTokenSimulationActivated) {
    resetTokenSimulation(false);
    toggleSimulation.checked = false;
  }
});

toggleSimulation.addEventListener("click", () => {

  if(isTokenSimulationActivated) {
    resetTokenSimulation(false);

  } else {
    resetTokenSimulation(true);
  }
});

zoomIn.addEventListener("click", () => modeler.get("zoomScroll").stepZoom(1));
zoomOut.addEventListener("click", () => modeler.get("zoomScroll").stepZoom(-1));
resetZoom.addEventListener("click", () => modeler.get("zoomScroll").reset());

run().catch((err) => {
  console.log(err);
});

