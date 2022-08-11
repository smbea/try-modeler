/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. Licensed under a commercial license.
 * You may not use this file except in compliance with the commercial license.
 */

import templates from './templates';

let shouldResetGuideToggle = false;
let overlayIds = [];
let currentDiagramStoreDisposer;
let tokenSimulationDisposer;
let lastVisibleTooltip;

const diagramContainerClassName = 'bjs-container';
const tooltipTriggerClassName = 'template-trigger';
const tooltipClassName = 'template-tooltip';
const foregroundTooltipClassName = 'foreground';
const djsOverlayClassName = 'djs-overlay';

const triggerPosition = {
  top: -12,
  left: -12
};
const triggerShow = {
  minZoom: 0.5,
  maxZoom: 1.5
};
const triggerScale = {
  min: 1,
  max: 1
};


export default function TemplateExtension(overlays, eventBus, elementRegistry) {
  eventBus.on('import.done', () => handleImportDone(overlays, elementRegistry));
}


function handleImportDone(overlays, elementRegistry) {
    // find business object of the root process element
    let process = elementRegistry.find(
      ({ businessObject }) => {
        let ret = false;
        if(businessObject.$type) {
          ret = businessObject.$type =='bpmn:Process';
        }

        if(businessObject.processRef) {
          ret = businessObject.processRef.$type =='bpmn:Process';
        }
        return ret;
      }
    ).businessObject;

    process = process.processRef || process;

    // find template for the process id
    const template = templates
      .find(
        ({ id }) =>
          id === process.id
      );

    if (template) {
      removeExistingOverlays(overlays);
       disposeMouseEvents();

       template.tooltips.forEach((tooltip) => renderTooltip(tooltip, overlays));

      registerMouseEvents();
    }
}

function removeExistingOverlays(overlays) {
  try {
    overlayIds.forEach((id) => {
      overlays.remove(id);
    });
  } catch (_error) {
    // Object not found
  }
}

function registerMouseEvents() {
  const diagramContainer = document.getElementsByClassName(diagramContainerClassName)[0];
  if (diagramContainer) {
    diagramContainer.addEventListener('mouseover', handleDiagramMouseOver);
  }
}

function disposeMouseEvents() {
  const diagramContainer = document.getElementsByClassName(diagramContainerClassName)[0];
  if (diagramContainer) {
    diagramContainer.removeEventListener('mouseover', handleDiagramMouseOver);
  }
}

function handleDiagramMouseOver(event) {
  if (event.target.classList.contains(tooltipTriggerClassName)) {
    computeTooltipPosition(event.target);
  }
}

function computeTooltipPosition(trigger) {
  const tooltipTopAlignmentOffset = 10;
  const tooltipLeftAlignementOffest = 20;
  const tooltipRightAlignmentOffset = 43;

  const diagramContainer = document.getElementsByClassName(diagramContainerClassName)[0];
  const tooltip = getVisibleTooltip();

  if (diagramContainer && tooltip) {
    const triggerRect = trigger.getBoundingClientRect();

    tooltip.style.top = `${triggerRect.height + tooltipTopAlignmentOffset}px`;
    tooltip.style.left = `-${tooltipLeftAlignementOffest}px`;

    adjustTooltipPositionAndAddArrow({
      diagramContainer,
      triggerRect,
      tooltip,
      tooltipTopAlignmentOffset,
      tooltipLeftAlignementOffest,
      tooltipRightAlignmentOffset
    });

    moveVisibleTooltipToForeground(tooltip);
  }
}

function adjustTooltipPositionAndAddArrow({
  diagramContainer,
  triggerRect,
  tooltip,
  tooltipTopAlignmentOffset,
  tooltipLeftAlignementOffest,
  tooltipRightAlignmentOffset
}) {
  const diagramContainerRect = diagramContainer.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const { overTop, overBottom, overLeft, overRight } = isTooltipOutOfViewport(diagramContainerRect, tooltipRect);

  if (overTop) {
    tooltip.classList.remove('bottom-arrow');
    tooltip.classList.add('top-arrow');
    tooltip.style.top = `${triggerRect.height + tooltipTopAlignmentOffset}px`;
  } else if (overBottom) {
    tooltip.classList.remove('top-arrow');
    tooltip.classList.add('bottom-arrow');
    tooltip.style.top = `${-(tooltipRect.height + tooltipTopAlignmentOffset)}px`;
  } else {
    tooltip.classList.remove('bottom-arrow');
    tooltip.classList.add('top-arrow');
  }

  if (overLeft) {
    tooltip.classList.remove('right-arrow');
    tooltip.classList.add('left-arrow');
    tooltip.style.left = `-${tooltipLeftAlignementOffest}px`;
  } else if (overRight) {
    tooltip.classList.remove('left-arrow');
    tooltip.classList.add('right-arrow');
    tooltip.style.left = `${-tooltipRect.width + tooltipRightAlignmentOffset}px`;
  } else {
    tooltip.classList.remove('right-arrow');
    tooltip.classList.add('left-arrow');
  }
}

function moveVisibleTooltipToForeground(tooltip) {
  if (lastVisibleTooltip) {
    lastVisibleTooltip.closest(`.${djsOverlayClassName}`).classList.remove(foregroundTooltipClassName);
  }

  tooltip.closest(`.${djsOverlayClassName}`).classList.add(foregroundTooltipClassName);

  lastVisibleTooltip = tooltip;
}

function getVisibleTooltip() {
  let elements = document.getElementsByClassName(tooltipClassName);
  for (const element of elements) {
    if (window.getComputedStyle(element).display !== 'none') {
      return element;
    }
  }
}

function isTooltipOutOfViewport(viewportRect, tooltipRect) {
  return {
    overTop: tooltipRect.top < viewportRect.top,
    overBottom: tooltipRect.top + tooltipRect.height > viewportRect.bottom,
    overLeft: tooltipRect.left < viewportRect.left,
    overRight: tooltipRect.left + tooltipRect.width > viewportRect.right
  };
}

function renderTooltip(tooltip, overlays) {
  try {
    const overlayId = overlays.add(tooltip.id, {
      position: triggerPosition,
      show: triggerShow,
      scale: triggerScale,
      html: `<div class="${tooltipTriggerClassName}"></div><div class="${tooltipClassName}">${tooltip.text}</div>`
    });
    overlayIds.push(overlayId);
  } catch (_error) {
    // Element not found, diagram was modified
  }
}


TemplateExtension.$inject = ['overlays', 'eventBus', 'elementRegistry'];