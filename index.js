document.addEventListener("DOMContentLoaded", function () {
  const eventList = document.getElementById('eventList');
  const eventModal = document.getElementById('eventModal');
  const modalCloseBtn = eventModal.querySelector('.close-btn');
  const modalEventName = eventModal.querySelector('.modal-event-name');
  const modalEventDate = eventModal.querySelector('.modal-event-date');
  const modalEventLocation = eventModal.querySelector('.modal-event-location');
  const modalEventCreationDate = eventModal.querySelector('.modal-event-creation-date');
  const modalEventDescription = eventModal.querySelector('.modal-event-description');
  const editBtn = eventModal.querySelector('.edit-btn');
  const saveBtn = eventModal.querySelector('.save-btn');
  const eventCreationModal = document.getElementById('eventCreationModal');
  const createEventBtn = document.getElementById('createEventBtn');
  const saveEventBtn = document.getElementById('saveEventBtn');
  const modalCloseBtns = document.querySelectorAll('.close-btn'); 
  
  let events = []; // Store events fetched from the server or created by the user
  let currentEvent = null; // Store the current event being edited or created

  // Fetch the events JSON file using XMLHttpRequest
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'events.json', true);
  xhr.onload = function () {
    if (xhr.status === 200) {
      events = JSON.parse(xhr.responseText);
      displayEvents(events);
    } else {
      console.error('Error fetching events');
    }
  };
  xhr.send();

   // Event form inputs
   const eventNameInput = document.getElementById('eventName');
   const eventDateInput = document.getElementById('eventDate');
   const startTimeInput = document.getElementById('startTime');
   const endTimeInput = document.getElementById('endTime');
   const eventLocationInput = document.getElementById('eventLocation');
   const eventDescriptionInput = document.getElementById('eventDescription');
 
   // Open modal for new event creation
   createEventBtn.addEventListener('click', function () {
     eventCreationModal.style.display = 'block';
   });
 
   // Close modals
   modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      eventCreationModal.style.display = 'none';
      eventModal.style.display = 'none';
      eventForm.reset();
      isEditMode = false; // Reset the mode when the modal is closed
    });
  });
  
 
   let isEditMode = false;  // To track whether it's edit mode or not

   saveEventBtn.addEventListener('click', function () {
     const eventForm = document.getElementById('eventForm');
     
     // Check if the form is valid
     if (eventForm.reportValidity()) {
       if (isEditMode && currentEvent) {
         // If in edit mode, update the current event
         currentEvent.name = eventNameInput.value;
         currentEvent.eventDate = eventDateInput.value;
         currentEvent.startTime = startTimeInput.value;
         currentEvent.endTime = endTimeInput.value;
         currentEvent.location = eventLocationInput.value;
         currentEvent.description = eventDescriptionInput.value;
         
         // Update the event list (you may need to refresh the displayed list or re-render the updated event)
         eventList.innerHTML = '';  // Clear the list
         displayEvents(events);     // Re-render the list with updated events
       } else {
         // If not in edit mode, create a new event
         const newEvent = {
           id: Date.now(), // Unique ID for the new event
           name: eventNameInput.value,
           eventDate: eventDateInput.value,
           startTime: startTimeInput.value,
           endTime: endTimeInput.value,
           location: eventLocationInput.value,
           description: eventDescriptionInput.value,
           imageUrl: 'https://thedatascientist.com/wp-content/uploads/2024/04/1706884145604_processed.jpg', // Placeholder image URL
           altText: 'Event image',
           creationDate: Date.now()
         };
   
         // Add the new event to the events array and display it
         events.push(newEvent);
         displayEvents([newEvent]);
       }
   
       // Clear the form and close the modal
       eventForm.reset();
       eventCreationModal.style.display = 'none';
       eventModal.style.display = 'none';
       isEditMode = false; // Reset the mode after saving
       showSnackbar("Event saved successfully!");
     } else {
       // Form is invalid, show validation messages
       console.log("Form is invalid. Please fill in all required fields.");
     }
   });
   

  function displayEvents(events) {
    const currentDateTime = new Date(); // Current date and time
    
    events.forEach(event => {
      const eventDiv = document.createElement('div');
      eventDiv.classList.add('event');
  
      // Create and add the event image
      const eventImage = document.createElement('img');
      eventImage.classList.add('event-image');
      eventImage.src = event.imageUrl;
      eventImage.alt = event.altText;
  
      const eventStaticContent = document.createElement('div');
      eventStaticContent.classList.add('event-static-content');
  
      const eventName = document.createElement('h2');
      eventName.classList.add('event-name');
      eventName.textContent = event.name;
  
      // Event Date and Time
      const eventDateTime = document.createElement('p');
      eventDateTime.classList.add('event-date-time');
      eventDateTime.textContent = `${event.eventDate}, ${event.startTime} - ${event.endTime}`;
  
      // Calculate event duration
      const eventDuration = calculateEventDuration(event.startTime, event.endTime);
      const eventDurationText = document.createElement('p');
      eventDurationText.classList.add('event-duration');
      eventDurationText.textContent = `Duration: ${eventDuration}`;
  
      // Event Location
      const eventLocation = document.createElement('p');
      eventLocation.classList.add('event-location');
      eventLocation.textContent = event.location;
  
      // Append static content
      eventStaticContent.appendChild(eventName);
      eventStaticContent.appendChild(eventDateTime);
      eventStaticContent.appendChild(eventDurationText);
      eventStaticContent.appendChild(eventLocation);
  
      const eventDescriptionDiv = document.createElement('div');
      eventDescriptionDiv.classList.add('event-description');
  
      const eventDescription = document.createElement('p');
      eventDescription.textContent = truncateDescription(event.description, 10);
  
      const expandBtn = document.createElement('button');
      expandBtn.classList.add('expand-btn');
      expandBtn.textContent = 'Learn More';
  
      expandBtn.addEventListener('click', function () {
        openModal(event);
      });
  
      eventDescriptionDiv.appendChild(eventDescription);
  
      // Add Checkbox for Event Status (Upcoming / Completed)
      const eventStatusDiv = document.createElement('div');
      eventStatusDiv.classList.add('event-status-div');
  
      const eventStatusLabel = document.createElement('label');
      eventStatusLabel.textContent = 'Mark as Completed';

      const eventStatusCheckbox = document.createElement('input');
      eventStatusCheckbox.type = 'checkbox';
      eventStatusCheckbox.classList.add('eventStatusCheckbox');

      // Check if the event has passed and automatically mark it as completed
      const eventEndDateTime = new Date(`${event.eventDate}T${event.endTime}`);
      if (eventEndDateTime < currentDateTime) {
        eventStatusCheckbox.checked = true;
        eventDiv.classList.add('completed'); // Mark as completed visually
        eventStatusLabel.textContent = 'Event Completed';
      } else {
        eventDiv.classList.add('upcoming'); // Mark as upcoming visually
        eventStatusLabel.textContent = 'Mark as Completed';
      }
  
      // Change status based on checkbox
      eventStatusCheckbox.addEventListener('change', function () {
        if (eventStatusCheckbox.checked) {
          eventDiv.classList.remove('upcoming');
          eventDiv.classList.add('completed');
          eventStatusLabel.textContent = 'Event Completed';
        } else {
          eventDiv.classList.remove('completed');
          eventDiv.classList.add('upcoming');
          eventStatusLabel.textContent = 'Mark as Completed';
        }
      });
  
      eventStatusDiv.appendChild(eventStatusCheckbox);
      eventStatusDiv.appendChild(eventStatusLabel);
  
      // Append the checkbox to the description div
      eventDescriptionDiv.appendChild(eventStatusDiv);  
      eventDescriptionDiv.appendChild(expandBtn);

      // Append everything to the event card
      eventDiv.appendChild(eventImage);
      eventDiv.appendChild(eventStaticContent);
      eventDiv.appendChild(eventDescriptionDiv);
  
      eventList.appendChild(eventDiv);
    });
  }

// Helper function to calculate duration
function calculateEventDuration(startTime, endTime) {
  // Parse the start and end times (format: HH:MM)
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  // Create Date objects for start and end times
  const startDate = new Date(2024, 0, 1, startHour, startMinute); // Arbitrary date
  const endDate = new Date(2024, 0, 1, endHour, endMinute);       // Arbitrary date

  // Calculate the difference in milliseconds and convert to hours and minutes
  const diffMs = endDate - startDate;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  // Return duration as string
  if (diffMinutes === 0) {
    return `${diffHours}h`;
  }
  return `${diffHours}h ${diffMinutes}m`;
}

  // Function to open the modal with event details
  function openModal(event) {
    currentEvent = event; // Store the current event

    modalEventName.textContent = event.name;
    modalEventDate.textContent = `${event.eventDate}, ${event.startTime} - ${event.endTime}`;
    modalEventLocation.textContent = event.location;
    modalEventCreationDate.textContent = new Date(event.creationDate).toLocaleString();
    modalEventDescription.value = event.description;

    eventModal.style.display = 'block';

    editBtn.addEventListener('click', function () {
      // Prefill form with current event details
      eventNameInput.value = currentEvent.name;
      eventDateInput.value = currentEvent.eventDate;
      startTimeInput.value = currentEvent.startTime;
      endTimeInput.value = currentEvent.endTime;
      eventLocationInput.value = currentEvent.location;
      eventDescriptionInput.value = currentEvent.description;
      
      // Mark the form mode as 'edit'
      isEditMode = true;
      
      // Show the event creation modal for editing
      eventCreationModal.style.display = 'block';
    });
  }

  // Close modal functionality
  modalCloseBtn.addEventListener('click', function () {
    eventModal.style.display = 'none';
  });

  // Save event functionality
  saveBtn.addEventListener('click', function () {
    modalEventDescription.setAttribute('readonly', true);
    currentEvent.description = modalEventDescription.value; // Save the updated description

    editBtn.style.display = 'inline-block';
    saveBtn.style.display = 'none';
    eventModal.style.display = 'none';
  });

  // Helper function to truncate the description
  function truncateDescription(description, wordLimit) {
    const words = description.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return description;
  }
});

// Function to show the snackbar
function showSnackbar(message) {
  const snackbar = document.getElementById('snackbar');
  const snackbarMessage = document.getElementById('snackbar-message');
  
  snackbarMessage.textContent = message; // Set the message
  snackbar.classList.add('show'); // Add the 'show' class to display the snackbar

  // After 3 seconds, hide the snackbar
  setTimeout(function () {
    snackbar.classList.remove('show');
  }, 3000); // Show for 3 seconds
}