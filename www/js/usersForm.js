$(document).on( "click", ".deleteUser", function() {
    let id = $(this).closest('tr').attr('data-id');
    function stopEventFunction () {
        $("#confirmDialog").off( "stop", stopEventFunction).off( "continue", continueEventFunction);
    }
    function continueEventFunction() {
        $("#confirmDialog").off( "stop", stopEventFunction).off( "continue", continueEventFunction);
        $.nette.ajax({
            url: deleteUserSource,
            data: {
                id: id
            }
        }).done(function (data) {
        });
    }
    dialogConfirm(stopEventFunction, continueEventFunction,
        'Smazání uživatele', 'Chcere skutečně smazat uživatele?', 270);
    $('#confirmObjDefaultDialog ~ div.ui-dialog-buttonpane').find('div.ui-dialog-buttonset').css('margin-right', '70px');
});