$(document).ready(function(){var e=$("#browseTable").dataTable({search:{regex:true},ordering:true,dom:"ilfrtp",info:true,ajax:"/browse.json",serverSide:true,lengthMenu:[15,1,3,5,10,25,50,100,200,500],language:{emptyTable:"Aucun document présent",lengthMenu:" _MENU_ Document(s) / page",search:"Rechercher:",zeroRecords:"Aucun résultat ...",info:"Il y a _TOTAL_ résultat(s)",infoFiltered:"( filtrés sur _MAX_ )",paginate:{previous:"Précédent",next:"Suivant"}},columns:[{data:"wid",visible:false,searchable:false},{data:"fields.validate",visible:false,searchable:false},{data:"object",className:"browseYear browseTd",searchable:true},{data:"fields.title",className:"browseTitle browseTd",searchable:true}],fnCreatedRow:function(t,n,r){var i=e.fnGetData(r);if(i["validate"]=="yes"){$(t).attr("class","trValidate")}},fnDrawCallback:function(){$("tbody tr").on("click",function(){var t=e.fnGetPosition(this);var n=e.fnGetData(t);document.location.href="/display/"+n.wid+".html"}).addClass("trBody")}}),t=$("#menuThead");$("#browseChangeList").on("change",function(){if($(this).val()=="traites"){e.fnFilter("yes",1)}else if($(this).val()=="nonTraites"){e.fnFilter("no",1)}else if($(this).val()=="tous"){e.fnFilter("",1)}});$(window).scroll(function(){if($(this).scrollTop()>541){t.addClass("fixedThead")}else{t.removeClass("fixedThead")}});var n=function(e){window.location=e.currentTarget.getAttribute("data-href")};$("#exportResults").on("click",n)})