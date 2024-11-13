$(document).ready(function() { 

    $(".note .show-note-button").click(function() {
      $(".note").removeClass("active");
      $(this).parent(".note").addClass("active");
    });

}); 

  