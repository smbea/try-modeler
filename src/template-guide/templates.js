import absenseRequestDiagram from '../../resources/absence-request.bpmn';
import ticketBookingDiagram from '../../resources/ticket-booking.bpmn'
import enforcingSLA from '../../resources/enforcing-sla.bpmn';
import errorHandling from '../../resources/error-handling.bpmn';

export default [{
    id: 'absence-request',
    name: 'Absence Request',
    description: `This process handles absence requests. As an employee, you can file an absence request which will then be reviewed by your manager. The manager might accept or reject your request, or request a further explanation for it before reviewing it again. If the review has not happened within two days, the manager will be reminded.`,
    diagram: absenseRequestDiagram,
tooltips: [
          {
            id: 'Activity_1ihlcws',
            text: 'This <a href="https://docs.camunda.io/docs/reference/bpmn-processes/user-tasks/user-tasks" target="_blank">User Task</a> assigns work to a human user. The task will show up in <a href="https://docs.camunda.io/docs/product-manuals/tasklist/introduction" target="_blank">Tasklist</a> or any other frontend you integrate with Camunda. The user can claim the task, fill out the <a href="https://docs.camunda.io/docs/product-manuals/tasklist/userguide/camunda-forms" target="_blank">Task Form</a> and submit it to complete the task. When the task is completed, the process will continue to the next step.'
          },
          {
            id: 'Event_0z73nuo',
            text: 'This <a href="https://docs.camunda.io/docs/reference/bpmn-processes/timer-events/timer-events" target="_blank">Timer Event</a> is attached to a User Task. It triggers based on the interval that you specify in the <a href="https://docs.camunda.io/docs/reference/bpmn-processes/timer-events/timer-events#timers" target="_blank">properties</a> - in this case, every two days.  Because it is <a href="https://docs.camunda.io/docs/reference/bpmn-processes/timer-events/timer-events#timer-boundary-events" target="_blank">non-interrupting</a> it will not cancel the User Task that it’s attached to when triggered, but instead initiate a flow that runs in parallel - in this case, to remind the line manager that this task is overdue.'
          },
          {
            id: 'Gateway_1pdgva1',
            text: 'This <a href="https://docs.camunda.io/docs/reference/bpmn-processes/exclusive-gateways/exclusive-gateways" target="_blank">Exclusive Gateway</a> will determine how the process should continue. There are three possible options (Approved, Rejected, and Need Clarification). Technically, you need to define a <a href="https://docs.camunda.io/docs/reference/bpmn-processes/exclusive-gateways/exclusive-gateways#conditions" target="_blank">condition expression</a> as a property for each of the  outgoing sequence flows.'
          },
          {
            id: 'Flow_1a3eadh',
            text: 'We have defined a <a href="https://docs.camunda.io/docs/reference/bpmn-processes/exclusive-gateways/exclusive-gateways#conditions" target="_blank">condition expression</a> in the properties of this Sequence Flow. If the value of the variable “result” is “rejected”, then the process will continue on this flow. The variable has been populated by the task form that had been submitted in the previous User task “Approve Absence”.'
          }
        ]


  },
  {
    id: 'ticket-booking',
    name: 'Ticket Booking',
    description: `This process handles ticket sales for events. In the first step, we reserve the respective seats via gRPC. If this fails due to an error, the booking is cancelled. Once the seats have been reserved, we request via AMQP that the payment will be retrieved and then wait for an event that confirms the arrival of the payment. If that event does not arrive within 30 seconds, the booking is cancelled. Once we’ve received the payment, we trigger the ticket generation in the respective system via REST.`,
    diagram: ticketBookingDiagram,
        tooltips: [
          {
            id: 'Activity_1g89uec',
            text: 'This <a href="https://docs.camunda.io/docs/reference/bpmn-processes/service-tasks/service-tasks/" target="_blank">Service Task</a> assigns work to a microservice by creating a job. The process instance stops here and waits until the job is complete. The workflow engine will not call the microservice, but instead wait to be called: A <a href="https://docs.camunda.io/docs/components/concepts/job-workers/" target="_blank">job worker</a> can subscribe to the job type, process the jobs, and complete them using one of the Zeebe clients. When the job is complete, the service task is completed and the process instance continues.'
          },
          {
            id: 'Event_076cmo0',
            text: 'This <a href="https://docs.camunda.io/docs/reference/bpmn-processes/error-events/error-events/" target="_blank">Error Event</a> is attached to a Service Task. It triggers if the job worker tells the workflow engine via client command that an error has occurred that should be handled by the process. '
          },
          {
            id: 'Participant_0y2e8ja',
            text: 'This Collapsed Pool does not have any execution semantics, i.e. it will be ignored by the workflow engine. It’s only here to make the diagram more expressive since it represents the external system that the Microservice either belongs to or invokes. You can learn more about pools and lanes in our <a href="https://camunda.com/bpmn/reference/#participants-pool" target="_blank">general BPMN reference</a>.'
          },
          {
            id: 'Activity_0h19mxb',
            text: 'This <a href="https://docs.camunda.io/docs/reference/bpmn-processes/receive-tasks/receive-tasks/" target="_blank">Receive Task</a> does not assign work to a microservice, but just waits for an incoming message. It’s a visual alternative to the <a href="https://docs.camunda.io/docs/reference/bpmn-processes/message-events/message-events/#intermediate-message-catch-events" target="_blank">Intermediate Message Catch Event</a>, with the same execution semantics. '
          },
          {
            id: 'Event_1ywtp2y',
            text: 'This <a href="https://docs.camunda.io/docs/reference/bpmn-processes/timer-events/timer-events" target="_blank">Timer Event</a> is attached to a Receive Task. It triggers based on the duration interval that you specify in the <a href="https://docs.camunda.io/docs/reference/bpmn-processes/timer-events/timer-events#timers" target="_blank">properties</a> - in this case, after 30 seconds. It is interrupting which means that once 30 seconds have passed since the workflow engine has waited for the message in ‘payment received’, it will cancel the Receive Task and not process that message anymore. Instead, it will end the process in the End Event ‘Booking cancelled”.'
          }
        ]
      },
  {
    id: 'enforcing-sla',
    name: 'Enforcing SLA',
    description:
      'A process that showcases how timer events can be used to help time sensitive processes like how you might enforce Service Level Agreements (SLAs). This includes features around alerting as well as ensuring that a process will not wait indefinitely for a response from an external service.',
    diagram: enforcingSLA,
        tooltips: [
          {
            id: 'Event_1f7rc2t',
            text: 'This Interrupting timer event begins the moment the token activates the task. The timer has a specific duration defined and if the task has not been completed by the time that duration expires, it will cancel the task and the process will continue along a different path'
          },
          {
            id: 'Event_028ru14',
            text: 'This is a non-interrupting timer, so if this timer is triggered it will not affect what is currently running in the process; instead it will create a parallel flow which in this case will send an email indicating that an SLA has expired.'
          },
          {
            id: 'Activity_05t68an',
            text: 'This is an event sub process. I has the ability to listen over the whole process for an event to occur. The event in question is determined by the start event inside the sub process. In this case it’s a non-interrupting timer. Meaning that when the process starts this becomes active and if this process hasn’t finished before the time has expired the event will trigger'
          },
          {
            id: 'Gateway_17pv522',
            text: 'This event based gateway is connected to two or more events. In this case a Message event and a Timer event. Whichever event happens first will determine the path that will be followed. So in this case if we receive a message we’ll go on to the log reply task. But if the timer expires before we get a reply the process will go to an end event.'
          }
        ]
      },
  {
    id: 'error-handling',
    name: 'Error Handling',
    description:
      'When implementing microservices, taking into account how to respond when a service is unable to successfully complete its task is an important step in ensuring robustness of your process but also important in making your process fully automated. This example shows how BPMN Error events can be used to catch and continue the process based on predefined criteria. It shows how those events propagate and how scope works within a process, sub process and event sub process. ',
    diagram: errorHandling,
        tooltips: [
          {
            id: 'Event_05j9v3i',
            text: 'This <a href="https://docs.camunda.io/docs/reference/bpmn-processes/error-events/error-events/" target="_blank">Error Event</a> is attached to a Service Task. It triggers if the job worker tells the workflow engine via client command that an error has occurred that should be handled by the process. It is then passed to a user to help correct the problem before continuing to the rest of the process'
          },
          {
            id: 'Gateway_1n3fnvz',
            text: 'This is a merging XOR gateway. It’s a common pattern to use these gateways to show that two or more paths are rejoining the main flow. In this case it shows that once the Verify Data task and the View and Correct Error task are completed, the process will follow the same path in the end'
          },
          {
            id: 'Event_0ewdllh',
            text: 'This <a href="https://docs.camunda.io/docs/reference/bpmn-processes/error-events/error-events/" target="_blank">Error Event</a> is attached to a sub process. This means that it has the ability to catch an error that could be thrown by any of the tasks within the sub process. If any of the tasks throw this error it will be caught and then a Remove any records created task will run'
          },
          {
            id: 'Event_0azlwld',
            text: 'Error events in BPMN are thrown “up scope” and once they are caught they stop being thrown. In this case a error thrown in the sub process has already been caught by a boundary event - It then ran a task and will now throw the error to the next scope. In this case the next scope will be the event sub process.'
          },
          {
            id: 'Activity_1e5gui8',
            text: 'This is an event sub process which is waiting to catch an interrupting error that might be thrown in the process. When an error is thrown and caught in this way it will stop anything else happening in the process and continue to the Send Message to User task before the process itself ends'
          }
        ]
      }
];