$(document).ready(function() {

    var pageUrl = window.location.pathname,
        pageID = pageUrl.split("/")[2],
        pageNB = parseInt(pageUrl.split("/")[3]),
        previousNB = (pageNB > 1) ? pageNB - 1 : 1,
        nextNB = (pageNB)  ? pageNB + 1 : 1,
        previousPage = (pageNB > 1) ? "/search/" + pageID + "/" + previousNB : null, 
        nextPage = (pageNB) ? "/search/" + pageID + "/" + nextNB : null,
        liResults = $(".liResults"),
        collection;

    console.log("pageID : " , pageID , " pageNB : " , pageNB , " nextPage : " , nextPage);

    $(".nbElements").on("click" , function(){
      collection = $(this).parents(".collection");
      if(!collection.hasClass("open")){
        collection.addClass("open");
        collection.children(".subitems").show();
        collection.siblings().css({ opacity : 0 });
      }
      else{
        collection.removeClass("open");
        collection.children(".subitems").hide();
        collection.siblings().css({ opacity : 1 });
      }

    });

    if($("#resultsTitle").length > 0){
        $(".word2Search").each(function(index,element){
        $(".listResults").highlight(element.innerHTML);
      });
    }
		
    $(".openCard , .activator").on("click"  , function(){
      $(this).parents(".divResults").css("display" , "block");
    });

    $(".closeCard , .desactivator").on("click"  , function(){
      $(this).parents(".divResults").css("display" , "");
    });

    $(".previousPage").after("<li class='waves-effect active'><a href='#'>" + pageNB + "</a></li>");

    if(previousPage){
      console.log(" preivous possible ");
      $(".previousPage a").attr("href" , previousPage);
      $(".previousPage").after("<li class='waves-effect'><a href=' " + previousPage + " '>" + previousNB + "</a></li>");
      // $(".previousPage").on("click" , function(){
      //   window.location.href = previousPage;
      // });
    }
    else{
      $(".previousPage").addClass("disabled");
    }

    if(nextPage){
      console.log(" next possible ");
      if(liResults.length < 10){
        $(".nextPage").addClass("disabled");
      }
      else{
        $(".nextPage a").attr("href" , nextPage);
        $(".nextPage").before("<li class='waves-effect'><a href=' " + nextPage + " '>" + nextNB + "</a></li>");
      }
    }


    // Ajax Load paragraph
    var target,
        wid,
        parent,
        html;
    $(".sentence").on("click" , function(){
      parent = $(this).parents(".collection-item").first();

      target = $(this).attr("data-target").toString();
      wid = $(this).attr("data-wid").toString();
      // Si le p est deja present
      if($("#" + target).length > 0){
        $("#" + target).openModal();
        return;
      }
      $.ajax({
        url: "/getpar/" +  wid + "/" + target
      })
      .done(function(data){
        if(data.p){
          console.log("Il y a un P a ajouter");
          html = '<div id="' + target + '" class="modal bottom-sheet">\
            <div class="modal-content">\
              <h4>Paragraphe</h4>\
              <p>' + data.p + '</p>\
            </div>\
            <div class="modal-footer">\
              <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Agree</a>\
            </div>\
          </div>';
          $(parent).append(html);
          $("#" + target).openModal();
        }
      });
    });
    

});