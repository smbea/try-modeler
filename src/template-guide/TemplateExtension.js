/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. Licensed under a commercial license.
 * You may not use this file except in compliance with the commercial license.
 */

import templates from './templates';

export default function TemplateExtension(overlays, eventBus, elementRegistry) {
  eventBus.on('import.done', () => {
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

    //add overlays if a template exists
    if (template) {
      template.config.diagram.tooltips.forEach((tooltip) => {
        try {
          overlays.add(tooltip.id, {
            position: {
              top: 0,
              left: 0
            },
            html: `<div class="template-trigger"></div><div class="template-tooltip">${tooltip.text}</div>`
          });
        } catch (_error) {
          // Element not found, diagram was modified
        }
      });
    }
  });
}

TemplateExtension.$inject = ['overlays', 'eventBus', 'elementRegistry'];