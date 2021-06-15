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
});


$(document).on( "click", ".editUserAddress", function() {
    var id = $(this).closest('tr').attr('data-id');

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
});
