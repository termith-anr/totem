$(document).ready(function() {
  if($(".send").length > 0){
    $(".send").on("click" , function(){
      idToSearch = $(this).siblings(".validate").val();
      window.location.replace("/search/" + idToSearch);
    });
  }
  else{
    var pageUrl = window.location.pathname,
      pageID = pageUrl.split("/")[2],
      pageNB = parseInt(pageUrl.split("/")[3]),
      previousNB = (pageNB > 1) ? pageNB - 1 : 1,
      nextNB = (pageNB)  ? pageNB + 1 : 1,
      previousPage = (pageNB > 1) ? "/search/" + pageID + "/" + previousNB : null, 
      nextPage = (pageNB) ? "/search/" + pageID + "/" + nextNB : null,
      liResults = $(".liResults"),
      collection,
      idToSearch;

    console.log("pageID : " , pageID , " pageNB : " , pageNB , " nextPage : " , nextPage);

    // $("#containerUL").append('<a href="'+ nextPage +'" class="nextPage">next page</a>')

    $('.containerUL').jscroll({
      debug : true,
      loadingHtml: '<div class="preloader-wrapper small active"><div class="spinner-layer spinner-red-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>',
      padding: 250,
      contentSelector : ".containerUL .toGet",
      nextSelector : ".nextPage:last"
    });

    $(document).on("click" , ".nbElements" , function(){
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
    $(document).on("click" , ".sentence" , function(){
      console.log("clickkk");
      parent = $(this).parents(".collection-item").first();

      target = $(this).attr("data-target").replace(/,/g , "").toString();

      console.log("target : " , target);

      wid = $(this).attr("data-wid").toString();
      // Si le p est deja present
      if($("#" + wid + "-" + target).length > 0){
        $("#" + wid + "-" + target).openModal();
        return;
      }
      $.ajax({
        url: "/getpar/" +  wid + "/" + target
      })
      .done(function(data){
        if(!data.p){
          alert("La paragraphe parent semble introuvable");
          return;
        }
        console.log("Il y a un P a ajouter");
        html = '<div id="' + wid + "-" + target + '" class="modal bottom-sheet">\
          <div class="modal-content">\
            <h4>Paragraphe</h4>\
            <p>' + data.p + '</p>\
          </div>\
          <div class="modal-footer">\
            <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Fermer</a>\
          </div>\
        </div>';
        $(parent).append(html);
        $("#" + wid + "-" + target).openModal();
      });
    });
  }
});