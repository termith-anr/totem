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
      nextPage = (pageNB) ? "/search/" + pageID + "/" + nextNB : null,
      liResults = $(".liResults"),
      collection,
      idToSearch;

    // $("#containerUL").append('<a href="'+ nextPage +'" class="nextPage">next page</a>')

    $('.containerUL').jscroll({
      debug : false,
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

    if(nextPage){
      $(".nextPage a").attr("href" , nextPage);
      $(".nextPage").before("<li class='waves-effect'><a href=' " + nextPage + " '>" + nextNB + "</a></li>");
    }

    // Ajax Load paragraph
    var target,
        wid,
        parent,
        html;

    var clipboard = new Clipboard('.copyInfo', {
      text: function(trigger){
        var element = $(trigger);
        var el, doc , bro , target , content = "";
        if(element.hasClass("sub")){
          bro = "div";
        }
        else{
          bro = "span";
        }
        el = element.siblings(bro).first();
        doc = el.attr("data-basename");
        target = el.attr("data-target");
        words = el.children("span").children();
        words.each(function(){
          content = content + $(this).text();
          if($(this).attr("wsafter") == "true"){
            content += " ";
          }
        });
        toCopy = content + "\\" + "[" + doc + "/" + target +"]";
        return toCopy.toString();
      }
    });

    clipboard.on('success', function(e) {
      $(".copyInfo").css('color' , '');
      Materialize.toast('Élément copié', 2300);
      $(e.trigger).css("color" , "#FFD700");
      e.clearSelection();
    });


    $(document).on("click" , ".sentence" , function(){
      parent = $(this).parents(".collection-item").first();
      wid = $(this).attr("data-docwid").toString();

      // Si le p est deja present
      if($("#" + wid).length > 0){
        $("#" + wid).openModal();
        return;
      }
      $.ajax({
        url: "/getpar/" +  wid
      })
      .done(function(data){
        if(!data.p){
          alert("La paragraphe parent semble introuvable");
          return;
        }
        html = '<div id="' + wid + '" class="modal bottom-sheet">\
          <div class="modal-content">\
            <h4>Paragraphe</h4>\
            <p>' + data.p + '</p>\
          </div>\
          <div class="modal-footer">\
            <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Fermer</a>\
          </div>\
        </div>';
        $(parent).append(html);
        $("#" + wid).openModal();
      });
    });
  }
});