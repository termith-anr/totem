$(document).ready(function() {

    var pageUrl = window.location.pathname,
        pageID = pageUrl.split("/")[2],
        pageNB = parseInt(pageUrl.split("/")[3]),
        previousNB = (pageNB > 1) ? pageNB - 1 : 1,
        nextNB = (pageNB)  ? pageNB + 1 : 1,
        previousPage = (pageNB > 1) ? "/search/" + pageID + "/" + previousNB : null, 
        nextPage = (pageNB) ? "/search/" + pageID + "/" + nextNB : null;

    console.log("pageID : " , pageID , " pageNB : " , pageNB , " nextPage : " , nextPage);

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
      $(".nextPage a").attr("href" , nextPage);
      $(".nextPage").before("<li class='waves-effect'><a href=' " + nextPage + " '>" + nextNB + "</a></li>");
      // $(".nextPage").on("click" , function(){
      //   window.location.href = nextPage;
      // });
    }
    

});