/////////////////////
//  Element Selectors
/////////////////////
const mainAppContainer = document.querySelector('.app');
const createNoteButton = document.querySelector('.app__controls__icon');
const clearAllNotesButton = document.querySelector('.app__controls__icon-bin');
const createNotePopup = document.querySelector('.note__create');
const closeCreateNotePopup = document.querySelector('.note__create-close');
const deleteAllNotesPopup = document.querySelector('.notes__delete');
const deleteAllNotesConfirm = document.querySelector('.notes__delete__button');
const closeDeleteAllNotesPopup = document.querySelector('.notes__delete-close');
const form = document.querySelector('#form');
const notesContainer = document.querySelector('.app__notes');
const shortcut = document.querySelector('.shortcut');
const shortcutButton = document.querySelector('.shortcut__button');

let notes = [];

populateNoteList(getNotes());


function createNote() {
    // Grab text input data
    let textData = document.querySelector('.note__create__input').value;
    if (textData === '') return;

    // Clear text input
    document.querySelector('.note__create__input').value = '';
    
    let date = getDate();
    let note = {
      id: randomId(), 
      text: textData,
      date: date
    }

    notes = getNotes();
    notes.unshift(note);
    storeNotes();
    exitCreateNote();
    populateNoteList(getNotes());
}

function populateNoteList(items) {
  if (items.length == 0) return;
  let notes = items;
  notesContainer.innerHTML = notes.map((note) => {
    return `
    <div class="note__content">
    <div class="note__content-date">${note.date}</div>
    <div class="note__content-note">
      <p>${note.text}</p>
    </div>
    <div data-edit="${note.id}" class="note__content-edit">
      <svg class="note__content-icon">
        <use xlink:href="assets/img/sprite.svg#icon-pencil"></use>
      </svg>
    </div>
    <div data-id="${note.id}" class="note__content-delete">
      <svg class="note__content-icon-bin">
        <use xlink:href="assets/img/sprite.svg#icon-bin1"></use>
      </svg>
    </div>
  </div>
  `;
  }).join('');
  addListeners();
}


/////////////////////
// Helper functions
/////////////////////
function getDate() {
  return new Date().toJSON().slice(0,10).replace(/-/g,'/'); // get current date
}

function getNotes() {
  if (localStorage.length !== 0) {
    let jsonNotes = localStorage.getItem('notes');
    return JSON.parse(jsonNotes);
  } else {
    return [];
  }
}

function storeNotes() {
  let jsonNotes = JSON.stringify(notes);
  localStorage.setItem('notes', jsonNotes);
}

function exitCreateNote() {
  // Hide create note popup
  createNotePopup.style.display = 'none';
  createNotePopup.style.visibility = 'hidden';
  // Clear text input
  let textData = document.querySelector('.note__create__input').value = '';
}

function exitDeleteAllNotes() {
  deleteAllNotesPopup.style.display = 'none';
  deleteAllNotesPopup.style.visibility = 'hidden';
}

function randomId() {
  return Math.random().toString(36).substr(2, 16);
};

function clearAllNotes() {
  localStorage.clear();
  while (notesContainer.firstChild) {
    notesContainer.removeChild(notesContainer.firstChild);
  }
}

function addListeners() {
  let deleteButtons = Array.from(document.querySelectorAll('[data-id]'));
  let editButtons = Array.from(document.querySelectorAll('[data-edit]'));

  deleteButtons.forEach(function(e, i) {
      e.addEventListener('click', function(e) {
        let id = deleteButtons[i].dataset.id;
        let newNotes = getNotes().filter(note => note.id !== id);

        notes = newNotes;
        storeNotes();

        if (notes.length <= 0) {
          clearAllNotes();
        } else {
          populateNoteList(getNotes());
        }
      });
  });

  editButtons.forEach(function(e, i) {
    e.addEventListener('click', function(e) {
      let id = editButtons[i].dataset.edit;
      let newNote = getNotes().filter(note => note.id == id);
      let editPopup = `
        <div class="editNote">
          <form class="editForm" action="#">
            <input class="editNote__input" maxlength="48" type="text" value="${newNote[0].text}" required>
            <button class="editNote__button">Update note</button>
          </form>
          <span class="editNote-close">&#10006;</span>
        </div>
      `;

      // Prevent popup duplication
      if (document.querySelector('.editNote') == null) {
        // Insert update note popup into the DOM
        mainAppContainer.insertAdjacentHTML('afterbegin', editPopup);
      }
      
      document.querySelector('.editNote-close').addEventListener('click', () => {
        exitUpdateNote();
      });


      document.querySelector('.editForm').addEventListener('submit', function(e) {
        e.preventDefault();
        // Prevent updating error if popup doesn't exist
        if (document.querySelector('.editNote') !== null) {
          // Grab text input data
          let textData = document.querySelector('.editNote__input').value;
          if (textData === '') return;

          updateNote(id, textData);
          exitUpdateNote();
        }
      });
    });
  });
}

function exitUpdateNote() {
  let popup = document.querySelector('.editNote');
  if (popup) {
    popup.parentNode.removeChild(popup);
  }
}

function updateNote(id, text) {
  let newText = text;
  let newDate = getDate();
  let newNotes = getNotes();
  let updatedNotes = newNotes.map(function(e) {
    if (e.id == id) {
      return  {
        id: e.id,
        text: newText,
        date: newDate
      }
    } else {
      return e;
    }
  });

  notes = updatedNotes;
  storeNotes();
  populateNoteList(getNotes());
}

function makeCreateNotePopupVisible() {
    createNotePopup.style.display = 'block';
    createNotePopup.style.visibility = 'visible';
}


/////////////////////
// Event Listeners
/////////////////////
createNoteButton.addEventListener('click', () => {
  makeCreateNotePopupVisible();
});

closeCreateNotePopup.addEventListener('click', () => {
  exitCreateNote();
});

form.addEventListener('submit', (e) => {
  e.preventDefault(); // preventing forms default actions
    createNote();
});

clearAllNotesButton.addEventListener('click', () => {
  if (localStorage.getItem('notes') !== null) {
    deleteAllNotesPopup.style.display = 'block';
    deleteAllNotesPopup.style.visibility = 'visible';
  }
});

closeDeleteAllNotesPopup.addEventListener('click', () => exitDeleteAllNotes());

deleteAllNotesConfirm.addEventListener('click', () => {
    exitDeleteAllNotes();
    clearAllNotes();
});

shortcutButton.addEventListener('click', () => {
  shortcut.style.display = 'none';
  shortcut.style.visibility = 'hidden';
});

////////////////////////
// Create Note shortcut (konami code)
///////////////////////
let sequenceCount = [];

window.addEventListener('keydown', (e) => {
  sequenceCount.push(e.keyCode);
  if (sequenceCount[0] !== 17) {
    sequenceCount = [];
  }

  if (sequenceCount.length === 3) {
    if (sequenceCount[0] === 17 && sequenceCount[1] === 16 && sequenceCount[2] === 107) {
      makeCreateNotePopupVisible();
      sequenceCount = [];
    } else {
      sequenceCount = [];
    }
  }
});