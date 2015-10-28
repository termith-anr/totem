$(document).ready(function() {

    var pageUrl = window.location.pathname,
        pageID = pageUrl.split("/")[3];

    console.log(pageID);

		//$(".listResults").highlight($(".word2Search").text(), { wordsOnly: true });
		$(".word2Search").each(function(index,element){
			//console.log("txt : " , element.innerHTML);
			$(".listResults").highlight(element.innerHTML);
		})

    $(".openCard , .activator").on("click"  , function(){
      $(this).parents(".divResults").css("display" , "block");
    });

    $(".closeCard , .desactivator").on("click"  , function(){
      $(this).parents(".divResults").css("display" , "");
    });

    $(".previousPage").on("click" , function(){

    })

});