(function() {
  function submitTextarea() {
    var textEl = $(".input .inputbox");
    var promise = submitMessage(textEl.val(), function(data, res) {
      console.log("LOADED DATA!", data);
      $("#search_term").text(`You searched for ${data.term}!`).show();
      makeMatrixByYear(data.results);
    });

    promise.fail(function() {
      promise.loadingcube.css("background-color", "#fdd");
    });

    promise.done(function() {
      console.log("LOADED RESULTS!");
    });


    textEl.val("");
  }

  function makeMatrixByYear(data) {
    var dataByYear = _.groupBy(data, "year");
    var $thisTable = $("table#matrix_by_year");
    $thisTable.empty();
    
    for (year in dataByYear) {
      var arrWords = _.sortBy(dataByYear[year], "similarity").reverse();
      $thisTable.append("<tr class=\"flex-col\" id=\"year_" + year + "\"></tr>");
      $thisTable.find("#year_" +year+ "").append("<th>" + year + "</th>");
      for (var i = 0; i < arrWords.length; i++) {
        var similarity = Math.floor(arrWords[i]["similarity"] * 100);
        $thisTable.find("#year_" + year + "")
          .append("<td style=\"background-color: rgba(64,188,216, " + similarity / 100 + ")\">" +
            arrWords[i]["word"] + "<br/>" + similarity + "%</td>");
      }
    }
    $thisTable.show();
  };

  function submitMessage(msg, cb) {
    // get the room we are in
    return getCmd("search", { term: msg}, cb);
  }

  function newLoading() {
    var loadingEl = $("<div class='loadingcube' ></div>");
    $(".loadingtray").append(loadingEl);
    loadingEl.fadeIn();
    loadingEl.done = function() {
      loadingEl.stop(true).fadeOut(function() {
        loadingEl.remove();
      });
    }
    return loadingEl;
  }

  function getCmd(cmd, data, cb) {
    var submit = _.clone(data);
    submit.cmd = cmd;
    loadingEl = newLoading();
    var ret= $.get("/r/", submit, function(data, res) {
      if (cb) { cb(data, res); }
    }).always(function() {
      loadingEl.done();
    });

    ret.loadingcube = loadingEl;
    return ret;

  }

  function postCmd(cmd, data, cb) {
    var submit = _.clone(data);
    submit.cmd = cmd;
    loadingEl = newLoading();
    var ret= $.post("/r/", submit, function(data, res) {
      if (cb) { cb(data, res); }
    }).always(function() {
      loadingEl.done();
    });

    ret.loadingcube = loadingEl;
    return ret;

  }


  // Gets ready to press enter
  function handleKeyDown(event) {
    if (event.keyCode == 13) {
        submitTextarea();
    }
  }

  $(function() {
    $(".input .inputbox").on("keydown", handleKeyDown);
  });

})();
