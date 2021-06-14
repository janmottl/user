$(document).on( "click", ".newUserAddress", function() {
    $('.tooltip').hide();
    $("#userAddressDialog").modal({backdrop: "static", keyboard: true});

    adjustGUIEditMode('div#frm-group-userAddress');

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
        setTimeout(function() {
            $('[name="k_osoba"]').focus();
        });
    });
});


$(document).on( "click", ".editUserAddress", function() {
    var id = $(this).closest('tr').attr('data-id');

    // otevre dialog s pridanim prevozu
    $("#userAddressDialog").modal({backdrop: "static", keyboard: true});

    if (window.location.href.indexOf('admin') !== -1) {
        // editacni mod pouze pri administraci
        adjustGUIEditMode('div#frm-group-userAddress');

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
            var kontaktEl = $("#frm-group-userAddress").find('input[name="kontakt_kod"]');
            if (kontaktEl.length > 0) {
                var text = $(kontaktEl).attr('data-alert-info');
                if (text && (text !== '')) {
                    var formGroup = $(kontaktEl).closest('div.form-group');
                    $(formGroup).after('<div class="form-group"><div class="alert alert-info col-sm-12 xsma" role="alert">'+text+'</div></div>');
                }
            }

            setTimeout(function() {
                $('[name="k_osoba"]').focus();
            });
        });
    } else {
        $.nette.ajax({
            url: reloadUserAddressSource,
            data: {
                snippet: "userAddressSnippet",
                headerSnippet: "userAddressHeaderSnippet",
                clicked: "editovat",
                parentDivId: "frm-group-userAddress-modcon",
                adjustGUI: false,
                id: id,
            }
        });
    }
});


/*
$('.edit').prop('onclick',null).off('click').click(function () {
    var id = $('input#id').val();

    // prepnuti do editacniho modu spolecne s downloadem snippetu
    $.nette.ajax({
        url: reloaduserAddressSnippetSource,
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

$('.storno').prop('onclick',null).off('click').click(function () {
    $('div#snippet--userAddressSnippet').empty();
});

*/