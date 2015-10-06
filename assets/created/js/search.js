$(document).ready(function() {
		//$(".listResults").highlight($(".word2Search").text(), { wordsOnly: true });
		$(".word2Search").each(function(index,element){
			//console.log("txt : " , element.innerHTML);
			$(".listResults").highlight(element.innerHTML);
		})
});