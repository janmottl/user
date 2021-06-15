$(document).on( "click", ".newUserAddress", function() {
    $('.tooltip').hide();

    $.nette.ajax({
        url: reloadUserAddressSource,
        data: {
            snippet: "userAddressSnippet",
            headerSnippet: "userAddressHeaderSnippet",
            clicked: "editovat",
            parentDivId: "frm-group-userAddress-modcon",
            adjustGUI: true,
            id: ""
        }
    }).done(function() {
        $("#userAddressDialog").modal({backdrop: "static", keyboard: true});
        adjustGUIEditMode('div#frm-group-userAddress');
        setTimeout(function() {
            $('[name="name"]').focus();
        });
    });
}).on( "click", ".editUserAddress", function() {
    let id = $(this).closest('tr').attr('data-id');
    $.nette.ajax({
        url: reloadUserAddressSource,
        data: {
            snippet: "userAddressSnippet",
            headerSnippet: "userAddressHeaderSnippet",
            clicked: "editovat",
            parentDivId: "frm-group-userAddress-modcon",
            adjustGUI: true,
            id: id,
        }
    }).done(function (msg) {
        // otevre dialog
        $("#userAddressDialog").modal({backdrop: "static", keyboard: true});
        adjustGUIEditMode('div#frm-group-userAddress');
        setTimeout(function() {
            $('[name="name"]').focus();
        });
    });
}).on( "click", ".deleteUserAddress", function() {
    let id = $(this).closest('tr').attr('data-id');
    function stopEventFunction () {
        $("#confirmDialog").off( "stop", stopEventFunction).off( "continue", continueEventFunction);
    }
    function continueEventFunction() {
        $("#confirmDialog").off( "stop", stopEventFunction).off( "continue", continueEventFunction);
        $.nette.ajax({
            url: deleteUserAddressSource,
            data: {
                id: id
            }
        }).done(function (data) {
        });
    }
    dialogConfirm(stopEventFunction, continueEventFunction,
        'Smazání adresy', 'Chcere skutečně smazat adresu?', 250);
    $('#confirmObjDefaultDialog ~ div.ui-dialog-buttonpane').find('div.ui-dialog-buttonset').css('margin-right', '60px');
}).on( "click", ".editModeUserAddress", function() {
    let id = $(this).closest('div.tab-pane').find('input[name="user_address_id"]').val();
    $.nette.ajax({
        url: reloadUserAddressSource,
        data: {
            snippet: "userAddressSnippet",
            headerSnippet: "userAddressHeaderSnippet",
            clicked: "editovat",
            parentDivId: "frm-group-userAddress-modcon",
            adjustGUI: true,
            id: id
        }
    });
});
