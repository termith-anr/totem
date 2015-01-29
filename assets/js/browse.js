//document.location.href = '/browse.html';

$(document).ready(function() {

    // Config DataTable
    var oTable = $('#browseTable').dataTable({
            "search" : {
                "regex" : true
            },
            ordering: true,
            dom : "ilfrtp",
            info : true,
            ajax: "/browse.json",
            serverSide: true,
            lengthMenu : [15,1,3,5,10,25,50,100,200,500],
            "language": {
                "emptyTable":     "Aucun document présent",
                "lengthMenu": " _MENU_ Document(s) / page",
                "search": "Rechercher:",
                "zeroRecords": "Aucun résultat ...",
                "info": "Il y a _TOTAL_ résultat(s)",
                "infoFiltered": "( filtrés sur _MAX_ )",
                "paginate": {
                    "previous": "Précédent",
                    "next" : "Suivant",
                }
            },
            columns: [
                { data: 'wid' , visible : false , searchable: false},
                { data: 'fields.validationDocument', visible : false , searchable: false},
                { data: 'basename' , className: "browseYear browseTd", searchable: true},
                { data: 'fields.title' , className: "browseTitle browseTd", searchable: true}
            ],
            stateSave: true,

            "fnCreatedRow": function( row, td, index ) {

                var rowValue = oTable.fnGetData( index );

                // IF Silence is 100% validated
                if(rowValue['validationDocument'] == "yes"){

                    $(row).attr('class', 'trValidate');

                }
                // IF Methods are 100% validated but Silence no
                else if((rowValue['validationMethods'] == "yes") && (rowValue['fields']['validationDocument'] == "no")) {

                    var ratioINIST = rowValue['progressSilenceKeywords'] ? rowValue['progressSilenceKeywords'] : 0,
                        ratioDocument = ((1+parseFloat(ratioINIST))/2)*100 + "%";

                    $(".browseTitle" ,row).css({
                        "background": "rgba(98,125,77,1)",
                        "background": "-moz-linear-gradient(left, rgba(69,69,69,0.1) " + ratioDocument + ", transparent " + ratioDocument + ")",
                        "background": "-webkit-gradient(left top, right top, color-stop(" + ratioDocument + ", rgba(69,69,69,0.1)), color-stop(" + ratioDocument + ", transparent)))",
                        "background": "-webkit-linear-gradient(left, rgba(69,69,69,0.1) " + ratioDocument + ", transparent " + ratioDocument + ")",
                        "background": "-o-linear-gradient(left, rgba(69,69,69,0.1) " + ratioDocument + ", transparent " + ratioDocument + ")",
                        "background": "-ms-linear-gradient(left, rgba(69,69,69,0.1) " + ratioDocument + ", transparent " + ratioDocument + ")",
                        "background": "linear-gradient(to right, rgba(69,69,69,0.1) " + ratioDocument + ", transparent " + ratioDocument + ")"
                    });


                }
                // IF Methods are not validated
                else if(rowValue['fields']['validationMethods'] == "no") {

                    var ratioMethods = rowValue['progressNotedKeywords'] ? rowValue['progressNotedKeywords'] : 0;

                    if (parseFloat(ratioMethods) > 0) {

                        var ratioDocument = ((parseFloat(ratioMethods)) / 2) * 100 + "%";

                            $(".browseTitle", row).css({
                                "background": "rgba(98,125,77,1)",
                                "background": "-moz-linear-gradient(left, rgba(69,69,69,0.1) " + ratioDocument + ", transparent " + ratioDocument + ")",
                                "background": "-webkit-gradient(left top, right top, color-stop(" + ratioDocument + ", rgba(69,69,69,0.1)), color-stop(" + ratioDocument + ", transparent)))",
                                "background": "-webkit-linear-gradient(left, rgba(69,69,69,0.1) " + ratioDocument + ", transparent " + ratioDocument + ")",
                                "background": "-o-linear-gradient(left, rgba(69,69,69,0.1) " + ratioDocument + ", transparent " + ratioDocument + ")",
                                "background": "-ms-linear-gradient(left, rgba(69,69,69,0.1) " + ratioDocument + ", transparent " + ratioDocument + ")",
                                "background": "linear-gradient(to right, rgba(69,69,69,0.1) " + ratioDocument + ", transparent " + ratioDocument + ")"
                            });

                    }
                }


            },

            fnDrawCallback: function(){

                $('tbody tr').on('click',function() {
                    var position =  oTable.fnGetPosition(this);
                    var docID = oTable.fnGetData( position );
                    document.location.href = "/display/" + docID.wid + '.html';
                }).addClass('trBody');
            }
        }),
        thead = $('#menuThead');

    // DataTable filters
    $('#browseChangeList').on('change', function() {

        if( $(this).val() == 'traites'){
            oTable.fnFilter( 'yes' , 1 );
            localStorage['selecteur'] = "traites";
        }
        else if( $(this).val() == 'nonTraites'){
            oTable.fnFilter( 'no' , 1 );
            localStorage['selecteur'] = "nonTraites";
        }
        else if( $(this).val() == 'tous'){
            oTable.fnFilter('',1);
            localStorage['selecteur'] = "tous";
        }
    } );


    // Fixed top menu
    $(window).scroll(function () {
        if ($(this).scrollTop() > 541) {
            thead.addClass("fixedThead");
        } else {
            thead.removeClass("fixedThead");
        }
    });



    // Get data-href of csv score & redirect to it
    var goToLocation  = function(element){
        window.location = element.currentTarget.getAttribute('data-href');
    };


    $('.exportButtons').on('click' , goToLocation);

    $('#exportButton').on('click' , function(){
        $('#exportMenu').css("display" , "flex");
        $('body').css('overflow' , 'hidden');
    });

    $('#exportQuit').on('click', function(){
        $('body').css('overflow' , '');
        $('#exportMenu').hide();
    });

    if(localStorage['selecteur']){

        switch(localStorage['selecteur']){
            case 'traites':

                $('#browseChangeList option')[1].selected = true;

                break;

            case 'nonTraites':

                $('#browseChangeList option')[2].selected = true;

                break;

            case 'tous':

                $('#browseChangeList option')[0].selected = true;

                break;
        }
    }



});