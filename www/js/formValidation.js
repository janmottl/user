/**
 * Created by mottl on 12.2.17.
 */

function acceptedElement(element) {
    //
    //  Nize uvedene classy se osetruji zvlast, protoze se kontroluji asynchronne Ajaxem
    //
    var inputGroup = $(element).closest('div.input-group');
    var relevantDiv = inputGroup.length ? inputGroup : $(element).closest('div');
    return (relevantDiv.length === 0) || !$(relevantDiv).hasClass('flash');
}

function acceptExtraMessage(elDiv, stdValidationMssage) {
    let retVal = stdValidationMssage;
    let extraMessage = $(elDiv).attr('data-extra-message');
    if (extraMessage && (extraMessage !== '')) {
        retVal = extraMessage;
    }
    return retVal;
}

function showErrors(errors, focus, form)
{
    var hasError = false;
    var firstElement = null;

    setAllAlertsSize();
    $('div.alert.alert-danger[data-invisible]').remove();

    errors.forEach(function(error) {
        hasError = true;

        if (!firstElement) {
            firstElement = error.element;
        }

        if (true /*acceptedElement(error.element)*/) {

            // Rodna cisla a IC se hlasi pres flashMessage a  nesmi se do nich zasahovat
            if (error.message) {
                let errorMessage = error.message;
                let separatorPos = errorMessage.indexOf(':');
                if (separatorPos !== -1) {
                    errorMessage = errorMessage.substring(separatorPos+1).trim();
                }

                if (!$(error.element).is(':visible')) {
                    let text = errorMessage + ' [pole '+$(error.element).attr('name')+' je skryté, hodnota="'+$(error.element).val()+'"]';
                    $('div.validace-alerts.container').
                        prepend('<div class="alert alert-danger validace-alert lead" role="alert" data-invisible>' +
                                    '<a href="javascript:void(0)" class="close alert-close pull-right" aria-label="Zavřít">&times;</a>'+
                                     text +
                                '</div>');
                }

                var parent = $(error.element).parent();
                if ($(parent).prop("tagName").toLowerCase() === 'td') {
                    // element je v tabulce
                    $(parent).addClass('has-error').find('span.error').remove();
                    $('<span class=error>').text(errorMessage).insertAfter(error.element);
                } else {
                    var inputGroup = $(error.element).closest('div.input-group');
                    if (inputGroup.length) {
                        // element je v inputGroup
                        $(inputGroup).addClass('has-error'); // nastavi se na urovni input group
                        $(inputGroup).next('span.error').remove();
                        errorMessage = acceptExtraMessage(inputGroup, errorMessage);
                        $('<span class="error">').text(errorMessage).insertAfter($(inputGroup).last());
                    } else {
                        // element neni v inputGroup
                        var closestDiv = $(error.element).closest('div');
                        $(closestDiv).addClass('has-error'); // nastavi se na urovni nejblizsiho divu
                        $(closestDiv).find('span.error').remove();
                        errorMessage = acceptExtraMessage(closestDiv, errorMessage);
                        $(closestDiv).append('<span class="error">'+errorMessage+'</span>');
                    }
                }
            }
        }
    });

    if (form && firstElement) {
        $(firstElement).closest('div.container').find('div.validace-alert:not([data-invisible])').removeClass('hidden')
            .html('<a href="javascript:void(0)" class="close alert-close pull-right" aria-label="Zavřít">&times;</a>Chybně vyplněný formulář')
            .css('display', 'none').slideDown();
        // fokusovat element
        if (focus) {
            firstElement.focus();
        }
    }

    if (hasError && form) {
        $(document).trigger('alert-danger', [form]);
        $('.saveButton').prop('disabled', false).removeClass('processing disabled'); // povolit opet stisknuti tlacitka
    }

    if (form) {
        $("ul#myTabs").trigger("validationFinished", {validationOK: !hasError, validationPhase: 'cli'});
    }
}

function removeErrors(elem)
{
    var form = null;
    var container = $(elem).closest('div.container');

    if ($(elem).is('form')) {
        form = elem;
        $('.has-error:not(.flash) input, .has-error:not(.flash) select, .has-error:not(.flash) textarea', elem).
                removeClass('has-error').find('span.error :not(.myFlash)').remove();
    } else {
        form = $(elem).closest('form');
        if (acceptedElement(elem)) {
            var parent = $(elem).parent();
            if ($(parent).prop("tagName").toLowerCase() === 'td') {
                // element je v tabulce
                $(elem).closest('td').removeClass('has-error').find('span.error').remove();
            } else {
                var inputGroup = $(elem).closest('div.input-group');
                if (inputGroup.length) {
                    // element je v inputGroup
                    $(inputGroup).removeClass('has-error'); // nastavi se na urovni input group
                    $(inputGroup).next('span.error').remove();
                } else {
                    // element neni v inputGroup
                    var closestDiv = $(elem).closest('div');
                    $(closestDiv).removeClass('has-error'); // nastavi se na urovni nejblizsiho divu
                    $(closestDiv).find('span.error').remove();
                }
            }
        }
    }

    if ($(form).find('.has-error').length === 0) {
        // pokud tam nevisi zadna chyba
        $(container).find('div.validace-alert').removeClass('in');
    }
}

Nette.showFormErrors = function(form, errors) {
    //$(".loader").fadeOut("fast");
    removeErrors(form);
    showErrors(errors, true, form);
};

function removeServerErrors(elem) {
    var container = $(elem).closest('div.container');
    $(container).find('div.server-alert').remove();
}

var reformatNumber = function (elem) {
    //
    // nahrada . za , kvuli klavesnici na mobilu
    //
    if ($(elem).hasClass('formatNumber')) {
        var value = $(elem).val();
        var numDecimal = 2;
        var attrNumDecimal = $(elem).attr('data-num-decimal');
        if (attrNumDecimal && (attrNumDecimal !== '')) {
            numDecimal = parseInt(attrNumDecimal);
        }

        if (value !== '') {
            //
            // formatuje se pokud ma class='formatNumber'. Pokud je '' u slevy se neformatuje.
            //
            var valueFloat = parseFloat(value.replace(/\s+/g, "").replace(/,/g, "."));
            var valueFormatted = number_format(valueFloat, numDecimal, ',', ' ');
            if (value !== valueFormatted) {
                $(elem).val(valueFormatted);
            }
        } else {
            var acceptNull = $(elem).attr('data-num-accept-empty');
            if (acceptNull === undefined) {
                switch (numDecimal) {
                    case 1:
                        $(elem).val('0,0');
                        break;
                    case 2:
                    default:
                        $(elem).val('0,00');
                        break;
                }
            }
        }
    }
};

function validateElement(elem) {
    removeErrors(elem);
    Nette.formErrors = [];
    Nette.validateControl(elem);
    showErrors(Nette.formErrors);
}


$(function() {
    $('body')
        .on('keydown', ':input', function (e) {
            if ($(this).hasClass('formatNumber') && (e.keyCode === 32)) {
                e.preventDefault();

                let numDecimal = 2;
                let attrNumDecimal = $(this).attr('data-num-decimal');
                if (attrNumDecimal && (attrNumDecimal !== '')) {
                    numDecimal = parseInt(attrNumDecimal);
                }
                switch (numDecimal) {
                    case 1:
                        $(this).val('0,0');
                        break;
                    case 2:
                    default:
                        $(this).val('0,00');
                        break;
                }
            } else {
                if ((e.key && (e.key.length===1) && (e.key.match(/[a-zá-žA-ZÁ-Ž0-9]/))) || (e.key === 'Unidentified'))
                    // velka pismena s diakritijkou chodi jako Unidentified
                {
                    removeServerErrors(this);
                    removeErrors(this);
                }
            }
        })
        .on('blur', ':input', function (e) {
            if (!($(this).hasClass('mnozstvi') || $(this).hasClass('jednotk_cena') || $(this).hasClass('dph') || $(this).hasClass('sleva_proc'))) {
                reformatNumber(this);
            }
            validateElement(this);
        });
});

var checkAndconvertDate = function (datumStr) {
    var datum = null;

    if (!datumStr || (datumStr === '')) {
        return datum;
    }

    try {
        datum = $.datepicker.parseDate('dd.m.yy', datumStr);
    }
    catch (err) {
        // datum zustane null
    }
    return datum;
};

function dateDiff(dateold, datenew)
{
    var ynew = datenew.getFullYear();
    var mnew = datenew.getMonth();
    var dnew = datenew.getDate();
    var yold = dateold.getFullYear();
    var mold = dateold.getMonth();
    var dold = dateold.getDate();
    return ynew - yold + (mnew-mold)/12 + (dnew-dold)/365;
}

function dateDiffActualDate(val) {
    var datum;
    if (!val || (val === '')) {
        return 0;
    }
    if (!(datum = checkAndconvertDate (val))) {
        return 0;
    }

    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(datum.getFullYear(), datum.getMonth(), datum.getDate());
    const currDate = new Date();
    const utc2 = Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());
    let xxx = utc2 - utc1;
    let xx = Math.floor((utc2 - utc1) / _MS_PER_DAY);
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

Nette.validators.AppUtilitiesMyValidators_rcValidator = function(elem) {
    // Rodna cisla a IC se hlasi pres flashMessage a pouze se zjistuje zda je chyba nastavena
    var inputGroup = $(elem).closest('div.input-group');
    var relevantDiv = inputGroup.length ? inputGroup : $(elem).closest('div');
    return !$(relevantDiv).hasClass('has-error');
};

Nette.validators.AppUtilitiesMyValidators_icValidator = function(elem) {
    // Rodna cisla a IC se hlasi pres flashMessage a pouze se zjistuje zda je chyba nastavena
    var inputGroup = $(elem).closest('div.input-group');
    var relevantDiv = inputGroup.length ? inputGroup : $(elem).closest('div');
    return !$(relevantDiv).hasClass('has-error');
};

Nette.validators.AppUtilitiesMyValidators_cenikValidator = function(elem) {
    // Rodna cisla a IC se hlasi pres flashMessage a pouze se zjistuje zda je chyba nastavena
    var inputGroup = $(elem).closest('div.input-group');
    var relevantDiv = inputGroup.length ? inputGroup : $(elem).closest('div');
    return !$(relevantDiv).hasClass('has-error');
};

Nette.validators.AppUtilitiesMyValidators_statValidator = function(elem) {
    // Rodna cisla a IC se hlasi pres flashMessage a pouze se zjistuje zda je chyba nastavena
    var inputGroup = $(elem).closest('div.input-group');
    var relevantDiv = inputGroup.length ? inputGroup : $(elem).closest('div');
    return !$(relevantDiv).hasClass('has-error');
};

Nette.validators.AppUtilitiesMyValidators_datumValidator = function(elem, args, val) {
    if (!val || (val === '')) {
        return true;
    }
    return checkAndconvertDate (val) !== null;
};

Nette.validators.AppUtilitiesMyValidators_casValidator = function(elem, args, val) {
    if (!val || (val === '')) {
        return true;
    }

    var hodinaParts = val.split(':');
    return (parseInt(hodinaParts[0]) <= 23) && (parseInt(hodinaParts[1]) <= 59);
};

Nette.validators.AppUtilitiesMyValidators_objDatumNarozeniZletilostValidator = function(elem, args, val) {
    var datum;
    if (!val || (val === '')) {
        return true;
    }
    if (!(datum = checkAndconvertDate (val))) {
        return true;
    }
    var diff = dateDiff(datum, new Date());
    return diff >= 18;
};


Nette.validators.AppUtilitiesMyValidators_zemrDatumNarozeniValidator = function(elem, args, val) {
    var datum;
    if (!val || (val === '')) {
        return true;
    }
    if (!(datum = checkAndconvertDate (val))) {
        return true;
    }
    var today = new Date();
    var diff = Math.floor((today.getTime() - datum.getTime()) / 86400000);
    return (diff >= 1);
};

Nette.validators.AppUtilitiesMyValidators_datumUmrtiValidator = function(elem, args, val) {
    var datum;
    if (!val || (val === '')) {
        return true;
    }
    if (!(datum = checkAndconvertDate (val))) {
        return true;
    }
    var today = new Date();
    var diff = Math.floor((today.getTime() - datum.getTime()) / 86400000);
    return (diff >= 0);
};

Nette.validators.AppUtilitiesMyValidators_myRangeValidator = function(elem, range, val) {
    if (!val || (val === '') || !range || (range[0] === undefined) || (range[1] === undefined)) {
        return true;
    }
    var valFloat = parseFloat(val.replace(/\s+/g, "").replace(/,/g, "."));
    return (valFloat >= range[0]) && (valFloat <= range[1]);
};


var flashMessage = function (message, selector) {
    // funkce pouzivana pri asynchronnich kontrolach
    if (selector && (selector !== '')) {
        var inputGroup = $(selector).closest('div.input-group');
        var relevantDiv = inputGroup.length ? inputGroup : $(selector).closest('div');
        if (message && (message !== '')) {
            $(relevantDiv).addClass('has-error flash').attr('data-extra-message', message);
        } else {
            $(relevantDiv).removeClass('has-error flash').removeAttr('data-extra-message');
        }

        if (inputGroup.length) {
            $(inputGroup).next('span.error').remove();
            if (message && (message !== '')) {
                $('<span class="error myFlash">').html(message).insertAfter($(inputGroup).last());
            }
        } else {
            $(relevantDiv).find('span.error').remove();
            if (message && (message !== '')) {
                $(relevantDiv).append('<span class="error myFlash">'+message+'</span>');
            }
        }
    }
};

$('body').on('keydown', '.zemr_fo_rodne_cislo, .obj_fo_rodne_cislo, .ic', function (e) {
    if ((e.key.length===1) && e.key.match(/[0-9]/))
    {
        flashMessage ('', '#'+$(this).attr('id')); // vycistit chybove hlasky
    }
});

Nette.validators.AppUtilitiesMyValidators_greaterThanValidator = function(elem, limit, val) {
    if (!val || (val === '') || (limit === undefined)) {
        return true;
    }
    var valFloat = parseFloat(val.replace(/\s+/g, "").replace(/,/g, "."));
    return valFloat > limit;
};

Nette.validators.AppUtilitiesMyValidators_greaterOrEqualValidator = function(elem, limit, val) {
    if (!val || (val === '') || (limit === undefined)) {
        return true;
    }
    var valFloat = parseFloat(val.replace(/\s+/g, "").replace(/,/g, "."));
    return valFloat >= limit;
};

Nette.validators.AppUtilitiesMyValidators_notZeroValidator = function(elem, dummy, val) {
    if (!val || (val === '')) {
        return true;
    }

    var valFloat = parseFloat(val.replace(/\s+/g, "").replace(/,/g, "."));
    return valFloat != 0.0;
};

Nette.validators.AppUtilitiesMyValidators_positiveNumValidator = function(elem, limit, val) {
    if (!val || (val === '')) {
        return true;
    }
    var valFloat = parseFloat(val.replace(/\s+/g, "").replace(/,/g, "."));
    return valFloat > 0.0;
};

Nette.validators.AppUtilitiesMyValidators_negativeNumValidator = function(elem, limit, val) {
    if (!val || (val === '')) {
        return true;
    }
    var valFloat = parseFloat(val.replace(/\s+/g, "").replace(/,/g, "."));
    return valFloat < 0.0;
};
