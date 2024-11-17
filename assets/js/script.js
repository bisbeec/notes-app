$(document).ready(function () {
  // Store unique tags
  const uniqueTags = new Set();

  // Function to render tags in the .nav-tags ul
  function renderTags() {
    const tagsContainer = $(".nav-tags ul");
    tagsContainer.empty(); // Clear existing tags

    // Convert the uniqueTags set to an array and sort alphabetically
    const sortedTags = Array.from(uniqueTags).sort();

    sortedTags.forEach((tag) => {
      const tagHTML = `<li><button>${tag}</button></li>`;
      tagsContainer.append(tagHTML);
    });
  }

  // Function to update the selected note's tags
  function updateSelectedNoteTags(tags) {
    const tagsWrap = $(".selected-note .tags-wrap");
    tagsWrap.empty(); // Clear existing tags
    tags.split(",").forEach((tag) => {
      const trimmedTag = tag.trim();
      if (trimmedTag) {
        const tagHTML = `<span>${trimmedTag}</span>`;
        tagsWrap.append(tagHTML);
      }
    });
  }

  // Filter Notes by tag when clicking a tag button
  $(document).on("click", ".nav-tags ul button", function () {
    const selectedTag = $(this).text();

    // Highlight the active tag
    $(".nav-tags ul button").removeClass("active");
    $(this).addClass("active");

    // Filter notes to only show those with the exact selected tag
    $(".notes-list .note").hide();
    $(".notes-list .note").filter(function () {
      const noteTags = $(this).find(".tags span").map(function () {
        return $(this).text();
      }).get();
      return noteTags.includes(selectedTag); // Match exact tag
    }).show();
  });

  // Remove active class from tag and show all notes when clicking anywhere in the notes-categories-aside
  $(".notes-categories-aside").on("click", function (event) {
    if (!$(event.target).is("button")) {
      $(".nav-tags ul button").removeClass("active");
      $(".notes-list .note").show();
    }
  });

  // Handle displaying a selected note
  $(document).on("click", ".note", function () {
    // Remove 'active' class from other notes and add to the clicked note
    $(".note").removeClass("active");
    $(this).addClass("active");

    // Get note details
    const title = $(this).find("h2").text();
    const tags = $(this)
      .find(".tags span")
      .map(function () {
        return $(this).text();
      })
      .get()
      .join(", ");
    const date = $(this).find(".date").text();
    const description = $(this).data("description");

    // Update the .selected-note column
    $(".selected-note .seclected-note-title").text(title);
    $(".selected-note .selected-note-details ul li:nth-child(2) span:last-child").text(date);
    $(".selected-note .selected-note-content > div").html(`<p>${description}</p>`);
    updateSelectedNoteTags(tags);

    // Disable "Save Note" button until an edit is made
    $(".selected-note .btn").prop("disabled", true);
  });

  // Editable Notes: Tags in the Selected Note
  $(".selected-note").on("click", ".tags-wrap", function () {
    const currentTags = $(this).find("span").map(function () {
      return $(this).text();
    }).get().join(", ");
    $(this).replaceWith(`<input type="text" class="edit-tags-wrap" value="${currentTags}">`);
    $(".edit-tags-wrap").focus();
  });

  $(".selected-note").on("focusout", ".edit-tags-wrap", function () {
    const updatedTags = $(this).val();
    $(this).replaceWith('<div class="tags-wrap"></div>');
    updateSelectedNoteTags(updatedTags);

    // Update tags in the .notes-list
    const activeNote = $(".notes-list .note.active");
    const tagsHTML = updatedTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag)
      .map((tag) => `<span>${tag}</span>`)
      .join("");
    activeNote.find(".tags").html(tagsHTML);

    // Update the uniqueTags set and re-render nav-tags
    uniqueTags.clear();
    $(".notes-list .note .tags span").each(function () {
      uniqueTags.add($(this).text());
    });
    renderTags();
  });

  // Function to enable or disable the "Save Note" button
  function toggleSaveButton(state) {
    $(".selected-note .btn").prop("disabled", !state);
  }

  // Initialize the "Save Note" button as disabled
  toggleSaveButton(false);

  // Show modal when 'Create New Note' button is clicked
$("#createNoteBtn").on("click", function (event) {
  event.stopPropagation(); // Prevent this click from triggering other event listeners
  $("#noteModal").fadeIn();
});

// Close modal when 'x' is clicked
$(".close-modal").on("click", function () {
  $("#noteModal").fadeOut();
});

// Close modal when clicking outside the modal content
$(document).on("click", function (event) {
  const modal = $("#noteModal");
  const modalContent = $(".modal-content");

  // Close the modal only if the modal is visible and the click is outside the modal content
  if (modal.is(":visible") && !modalContent.is(event.target) && modalContent.has(event.target).length === 0) {
    modal.fadeOut();
  }
});

// Prevent clicks inside the modal content from closing it
$(".modal-content").on("click", function (event) {
  event.stopPropagation();
});


  // Handle form submission for creating new notes
  $("#noteForm").on("submit", function (event) {
    event.preventDefault();

    const title = $("#noteTitle").val();
    const tags = $("#noteTags").val();
    const description = $("#noteDescription").val();

    if (title && description) {
      // Get the current date
      const currentDate = new Date().toLocaleDateString();

      // Create the HTML structure for the new note
      const noteHTML = `
        <li>
          <div class="note active" data-description="${description}">
            <h2>${title}</h2>
            <div class="tags">
              ${tags
                .split(",")
                .map((tag) => `<span>${tag.trim()}</span>`)
                .join("")}
            </div>
            <p class="date">${currentDate}</p>
            <button class="show-note-button">
              <span class="sr-only">Edit note</span>
            </button>
          </div>
        </li>
      `;

      // Remove 'active' class from all other notes
      $(".note").removeClass("active");

      // Prepend the new note to the <ul> inside the .notes-list <div>
      $(".notes-list ul").prepend(noteHTML);

      // Add tags to the uniqueTags set, excluding empty tags
      tags.split(",").forEach((tag) => {
        const trimmedTag = tag.trim();
        if (trimmedTag) {
          uniqueTags.add(trimmedTag);
        }
      });


      // Render the updated tags
      renderTags();

      // Reset the form and close the modal
      $(this)[0].reset();
      $("#noteModal").fadeOut();
    } else {
      alert("Please fill in all required fields.");
    }
  });

  // Event handler to display a selected note in the .selected-note column
  $(document).on("click", ".note", function () {
    // Remove 'active' class from other notes and add to the clicked note
    $(".note").removeClass("active");
    $(this).addClass("active");

    // Get note details
    const title = $(this).find("h2").text();
    const tags = $(this)
      .find(".tags span")
      .map(function () {
        return $(this).text();
      })
      .get()
      .join(", ");
    const date = $(this).find(".date").text();
    const description = $(this).data("description");

    // Update the .selected-note column
    updateSelectedNote(title, tags, description, date);

    // Disable "Save Note" button until an edit is made
    toggleSaveButton(false);
  });

  // Function to update the .selected-note column
  function updateSelectedNote(title, tags, description, date) {
    $(".selected-note .seclected-note-title").text(title);
    $(".selected-note .selected-note-details ul li:nth-child(1) span:last-child").text(tags);
    $(".selected-note .selected-note-details ul li:nth-child(2) span:last-child").text(date);
    $(".selected-note .selected-note-content > div").html(`<p>${description}</p>`);
  }

  // Editable Notes: Title
  $(".selected-note").on("click", ".seclected-note-title", function () {
    const currentTitle = $(this).text();
    $(this).replaceWith(`<input type="text" class="edit-title" value="${currentTitle}">`);
    $(".edit-title").focus();
  });

  $(".selected-note").on("input", ".edit-title", function () {
    toggleSaveButton(true); // Enable "Save Note" button on input
  });

  $(".selected-note").on("focusout", ".edit-title", function () {
    const updatedTitle = $(this).val();
    $(this).replaceWith(`<h1 class="seclected-note-title">${updatedTitle}</h1>`);
  });

  // Editable Notes: Tags
  $(".selected-note").on("click", ".selected-note-details ul li:nth-child(1) span:last-child", function () {
    const currentTags = $(this).text();
    $(this).replaceWith(`<input type="text" class="edit-tags" value="${currentTags}">`);
    $(".edit-tags").focus();
  });

  $(".selected-note").on("input", ".edit-tags", function () {
    toggleSaveButton(true); // Enable "Save Note" button on input
  });

  $(".selected-note").on("focusout", ".edit-tags", function () {
    const updatedTags = $(this).val();
    $(this).replaceWith(`<span>${updatedTags}</span>`);
    updateTags(); // Update tags in nav-tags after editing
  });

  // Editable Notes: Description
  $(".selected-note").on("click", ".selected-note-content > div", function () {
    const currentContent = $(this).html();
    $(this).attr("contenteditable", "true").focus();

    $(this).on("input", function () {
      toggleSaveButton(true); // Enable "Save Note" button on input
    });

    $(this).on("focusout", function () {
      $(this).removeAttr("contenteditable");
    });
  });

  // Save updated note and reflect changes in .notes-list
  $(".selected-note").on("click", ".btn", function () {
    const updatedTitle = $(".seclected-note-title").text();
    const updatedTags = $(".selected-note-details ul li:nth-child(1) span:last-child").text();
    const updatedDescription = $(".selected-note-content > div").html(); // Preserve formatting with HTML

    // Find the active note in .notes-list and update it
    const activeNote = $(".notes-list .note.active");
    activeNote.find("h2").text(updatedTitle);

    const tagsHTML = updatedTags
      .split(",")
      .map((tag) => `<span>${tag.trim()}</span>`)
      .join("");
    activeNote.find(".tags").html(tagsHTML);

    activeNote.data("description", updatedDescription);

    // Disable the "Save Note" button after saving
    toggleSaveButton(false);

    // Update tags in nav-tags
    updateTags();
  });

  // Archive/Unarchive Note
  $(".selected-note-settings-col").on("click", ".btn-archive", function () {
    const activeNote = $(".notes-list .note.active");

    if (activeNote.hasClass("archived")) {
      // Unarchive the note
      activeNote.removeClass("archived");
      $(this).html('<i class="fa-solid fa-box-archive" aria-hidden="true"></i> Archive Note');
    } else {
      // Archive the note
      activeNote.addClass("archived");
      $(this).html('<i class="fa-solid fa-box-archive" aria-hidden="true"></i> Unarchive Note');
    }
  });




  // Delete Note
  $(".selected-note-settings-col").on("click", ".btn-delete", function () {
    const activeNote = $(".notes-list .note.active");
    const noteTitle = activeNote.find("h2").text();

    if (confirm(`Are you sure you want to delete "${noteTitle}"? This action cannot be undone.`)) {
      activeNote.closest("li").remove();
      alert(`"${noteTitle}" has been deleted.`);
      clearSelectedNote();
      updateTags(); // Update tags in nav-tags after deleting a note
    }
  });

  // Clear the .selected-note column
  function clearSelectedNote() {
    $(".selected-note .seclected-note-title").text("");
    $(".selected-note .selected-note-details ul li:nth-child(1) span:last-child").text("");
    $(".selected-note .selected-note-details ul li:nth-child(2) span:last-child").text("");
    $(".selected-note .selected-note-content > div").html("");
  }

  // Filter Notes by tag when clicking a tag button
  $(document).on("click", ".nav-tags ul button", function () {
    const selectedTag = $(this).text();

    // Highlight the active tag
    $(".nav-tags ul button").removeClass("active");
    $(this).addClass("active");

    // Filter notes to only show those with the exact selected tag
    $(".notes-list .note").hide();
    $(".notes-list .note").filter(function () {
      const noteTags = $(this).find(".tags span").map(function () {
        return $(this).text();
      }).get();
      return noteTags.includes(selectedTag); // Match exact tag
    }).show();
  });


  // Remove active class from tag and show all notes when clicking anywhere in the notes-categories-aside
  $(".notes-categories-aside").on("click", function (event) {
    if (!$(event.target).is("button")) {
      $(".nav-tags ul button").removeClass("active");
      $(".notes-list .note").show();
    }
  });

  // Filter Notes (All Notes and Archived Notes)
  $(".notes-filters button").on("click", function () {
    $(".notes-filters button").removeClass("active");
    $(this).addClass("active");

    // Remove tag active class and show all notes when "All Notes" is clicked
    $(".nav-tags ul button").removeClass("active");

    if ($(this).is("#archivedNotesBtn")) {
      $(".notes-list .note").hide();
      $(".notes-list .note.archived").show();
    } else {
      $(".notes-list .note").show();
    }
  });
});
