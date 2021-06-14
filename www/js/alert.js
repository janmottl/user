function setAllAlertsSize() {
    let width = $('div.container.main').width();
    $('div.all-alerts').css('width', width);
}

$(window).resize(function() {
    setAllAlertsSize();
});

setAllAlertsSize();

function alertMessage_getFromXhr(xhr) {
    let userMessage = "";
    if (xhr) {
        if (xhr.readyState === 4) {
            // HTTP error (can be checked by XMLHttpRequest.status and XMLHttpRequest.statusText)
            userMessage = "Chyba zpracování požadavku na serveru nebo chyba HTTP komunikace"+"<br><br>"+xhr.responseText;
        }
        else if (xhr.readyState === 0) {
            // Network error (i.e. connection refused, access denied due to CORS, etc.)
            userMessage = "Výpadek síťového spojení nebo výpadek serveru";
        }
        else {
            // something weird is happening
            userMessage = "Jiná chyba zpracování požadavku"+"<br><br>"+xhr.responseText;
        }
    }
    return userMessage;
}

function alertMessage_new(message, type) {
    let hasLocate = message.endsWith('->');
    let param = '';
    if (hasLocate) {
        message = message.slice(0, -2);
        let i = message.lastIndexOf('->');
        if (i !== -1) {
            param = message.substr(i+2);
            message = message.substr(0, i-1);
        }
    }
    return  '<div class="server-alerts local-alerts">' +
                '<div class="alert server-alert lead alert-' + type + '" role="alert" style="display: none;" data-before-slide-down>' +
                    '<a href="javascript:void(0)" class="close alert-close pull-right" aria-label="Zavřít">&times;</a>' +
                    message +
                    (hasLocate ? '<div style="text-align: left;"><a href="javascript:void(0)" class="invalidObjednavkaDialog" data-toggle="tooltip" title="Najít dotčená pole" data-param="'+param+'"><i class="fa fa-search" aria-hidden="true"></i></a></div>': '') +
                '</div>'+
            '</div>';
}

function alertMessage_prepend(prependTo, divId, messages) {
    setAllAlertsSize();
    let htmlSnippet = '<div id="'+divId+'" style="margin-bottom: 20px">' + messages + '</div>';
    $(prependTo).prepend(htmlSnippet);
    $(prependTo).find('div[data-before-slide-down]').removeAttr('data-before-slide-down').slideDown(function () {
        if (!$(this).hasClass('alert-danger')) {
            $(this).css('padding', '0');
        }
    });
}

function wrapAlert(alertDiv) {
    let alertText = '';
    let divContents = $(alertDiv).contents();
    if (divContents[divContents.length-1] && divContents[divContents.length-1].textContent) {
        alertText = divContents[divContents.length-1].textContent;
    }
    $(alertDiv).css('padding', '0').text('');
    let newDivContents =
        '<div class="alert-body">' +
            '<a href="javascript:void(0)" class="close alert-close pull-right" aria-label="Zavřít">&times;</a>'+
             alertText +
        '</div>'+
        '<div class="alert-progress"></div>';
    $(alertDiv).append(newDivContents);
}

/* skryt stare alerty */
interval = setInterval(function () {
    $('div.all-alerts div.alert:not(.hidden):not(.alert-danger):not([data-timer-stop]), div.local-alerts div.alert:not(.hidden):not(.alert-danger):not([data-timer-stop])')
        .each(function () {
        if (!$(this).hasClass('hidden') || $(this).hasClass('in')) {
            if ($(this).find('div.alert-body').length === 0) {
                wrapAlert(this);
            }

            let maxTimeSec = 1000;
            let maxTimeSecStr = $(this).attr('data-timer-maxsec');
            if (!isNaN(maxTimeSecStr)) {
                maxTimeSec = parseInt(maxTimeSecStr);
            } else {
                $(this).attr('data-timer-maxsec', maxTimeSec);
            }

            let timerAccessed = parseInt($(this).attr('data-timer-accessed'));
            if (isNaN(timerAccessed)) {
                timerAccessed = 0;
            }

            let toCLoseSec = Math.ceil((maxTimeSec - timerAccessed) / 100);
            let linkClose = $(this).find('a.alert-close');
            $(linkClose).html(toCLoseSec + ' s &times;');
            if (timerAccessed >= maxTimeSec) {
                $(linkClose).trigger('click', {transitionTime: 3});
            } else {
                $(this).attr('data-timer-accessed', timerAccessed+1);
            }

            let progress = $(this).find('div.alert-progress');
            $(progress).css('width', (100 - timerAccessed/maxTimeSec*100) + '%');
        }
    });
}, 10 /* 0.01 sec */);

/**/

function addAccMessage(columnName, message) {
    let separatorPos = message.indexOf(':');
    if (separatorPos !== -1) {
        message = message.substring(separatorPos+1).trim();
    }

    let icon = '<i class="fa fa-exclamation-triangle invalidTab" aria-hidden="true" style="font-size:large; color: lightsalmon"></i> ';

    $('[name="'+columnName+'"]').each(function () {
        var parent = $(this).parent();
        if ($(parent).prop("tagName").toLowerCase() === 'td') {
            $('<span class=="obj-column-message alert-warning">').html(icon+message).insertAfter(this);
        } else {
            var inputGroup = $(this).closest('div.input-group');
            if (inputGroup.length) {
                // element je v inputGroup
                $('<span class="obj-column-message alert-warning">').html(icon+message).insertAfter($(inputGroup).last());
            } else {
                // element neni v inputGroup
                var closestDiv = $(this).closest('div');
                $(closestDiv).append('<span class="obj-column-message alert-warning">'+icon+message+'</span>');
            }
        }
    });
}


function invalidObjednavkaDialogOpen(param) {
    let title = 'Chybová hlášení nezpůsobilé objednávky a matriky';
    if (param === 'vystavit') {
        title = 'Objednávka není způsobilá k vystavení';
    } else {
        if (param === 'matrika') {
            title = 'Matrika není způsobilá k vytvoření žádosti';
        }
    }

    var dialogHtml = '<div id="objednavkaInvalid_dialog" title="'+title+'" style="color: #ff0000;"></div>';
    $(dialogHtml).dialog({
        width: 600,
        height: 155,
        autoOpen: false,
        modal: false,
        closeOnEscape: true,
        position: {my: "left top", at: "left top", of: window},
        close: function() {
            $(this).remove();
        },
    });

    // klonovat tabulky a prilepit do dialogu
    let dialogEl = $('#objednavkaInvalid_dialog');
    $('#objednavkaInvalid_message').children().clone().appendTo(dialogEl);

    if (param === 'vystavit') {
        // odstrani hlaseni k matrice
        $(dialogEl).find('a[data-tab="frm-group-matrika"]').each(function () {
            $(this).closest('tr').remove();
        });
    } else {
        if (param === 'matrika') {
            // odstrani jina hlaseni nez k matrice
            $(dialogEl).find('a[data-tab!="frm-group-matrika"]').each(function () {
                $(this).closest('tr').remove();
            });
        }
    }
    $(dialogEl).dialog("open");
}

$('body').on('click', '.alert-close', function (e, parameters) {
    let divEl = $(this).closest('div.alert');
    let transitionTime = 0.3;
    if (parameters && parameters.transitionTime) {
        transitionTime = parameters.transitionTime;
    }

    $(divEl).slideUp(function () {
        $(this).addClass('hidden').removeAttr('data-timer-stop', '');
    });
}).on('click', '.alert-stop', function (e) {
    let divEl = $(this).closest('div.alert');
    $(divEl).attr('data-timer-stop', '');
}).on('mouseenter', 'div.alert', function (e) {
    //stuff to do on mouse enter
    $(this).attr('data-timer-stop', '').removeAttr('data-timer-accessed');
    $(this).find('div.alert-progress').css('width', '0%');
    $(this).find('a.alert-close').html('&times;');
}).on('mouseleave', 'div.alert', function (e) {
    //stuff to do on mouse leave
    $(this).removeAttr('data-timer-stop');
    let timerAccessed = 0;
    let maxTimeSec = 300;
    $(this).attr('data-timer-maxsec', maxTimeSec);
    let progress = $(this).find('div.alert-progress');
    $(progress).css('width', (100 - timerAccessed/maxTimeSec*100) + '%');
    $(this).attr('data-timer-accessed', timerAccessed);
}).on('click', '.invalidObjednavkaDialog', function (e) {
    let param = $(this).attr('data-param');
    invalidObjednavkaDialogOpen(param);
}).on('click', '.objednavkaInvalidMessage', function () {
    $('.invalidObjednavkaField').removeClass('invalidObjednavkaField');
    $(this).addClass('invalidObjednavkaField');
    let columnName = $(this).attr('data-column_name');

    $(':input[name="' + columnName + '"]').each(function () {
        let igr = $(this).closest('div.input-group');
        let hiliteEl = igr.length > 0 ? igr : $(this).closest('div');
        $(hiliteEl).addClass('invalidObjednavkaField');

        let tabId = $(this).closest('div.tab-pane').attr('id');
        $('a[data-toggle="pill"][href="#' + tabId + '"]').tab('show');

        let elementId = this.id;
        setTimeout(function() {
                // radeji nascrolovat nahoru, at to neni pod dialogem
                window.scrollTo(0, 0);
                if (hiliteEl.length > 0) {
                    let rect = hiliteEl[0].getBoundingClientRect();
                    let isNotScrolledTo =
                        (rect.x + rect.width) < 0
                        || (rect.y + rect.height) < 0
                        || (rect.x > window.innerWidth || rect.y > window.innerHeight);
                    if (isNotScrolledTo) {
                        // neni videt, je treba nascrolovat
                        document.getElementById(elementId).scrollIntoView();
                    }
                }
             },
            500);
    });
});
