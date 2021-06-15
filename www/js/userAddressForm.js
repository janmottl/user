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
