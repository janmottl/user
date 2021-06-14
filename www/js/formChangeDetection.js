/* spolecne funkce pro pripadMaster_edit.js a pripadDetail_edit.js */


/* funkce changeDetected pouziva na udalost change i z funkce inputsChanged */
/* proto je promenna vytazena nahoru */
var changeDetected = false;
var numberOfChanges = 0;
const COLOR_CHANGED = 'green';


var detectChanges = function() {
    var dataStyleChanged = $(this).hasClass('style-changed');
    var name    = $(this).attr('name');
    var value   = null;
    var type    = $(this).prop("tagName").toLowerCase();
    if (type === 'input') {
        type = $(this).attr('type');
    }

    if (name && (name.indexOf("__CHGD__") < 0)) {
        // krome inputu s puvodnimi hodnotami
        var selectorChgd    = "[name='" + "__CHGD__" + name + "']";
        var origValue       = $(selectorChgd).val();
        var inputReallyChanged   = false;

        if ((origValue !== null) && (origValue !== undefined)) {
            switch (type) {
                case 'checkbox':
                    value = $(this).is(':checked');
                    inputReallyChanged = value !== (parseInt(origValue) > 0);
                    var color = inputReallyChanged || dataStyleChanged ? COLOR_CHANGED : '';
                    $('label[for="'+$(this).attr('id')+'"]').css('color', color);
                    break;

                case 'radio':
                    var selRadioChecked = 'input[name="' + name + '"]:checked';
                    var selRadioAll = 'input[name="' + name + '"]';
                    value = $(selRadioChecked).val();
                    inputReallyChanged = value != origValue;
                    var checkedColor = inputReallyChanged || dataStyleChanged ? COLOR_CHANGED : '';

                    $(selRadioAll).each(function () {
                        if ($(this).is(':checked')) {
                            // zmenit barvu labelu k checked inputu radia
                            $(this).parent().css('color', checkedColor);
                        } else {
                            // zmenit barvu labelu k not checked inputu radia
                            $(this).parent().css('color', '');
                        }
                    });
                    break;

                case 'text':
                case 'tel':
                case 'select':
                    if (type === 'select') {
                        value = $('select'+'#'+this.id+' option:selected').val();
                    } else {
                        value = $(this).val();
                    }

                    var dataEmptyValue = $(this).attr('data-nette-empty-value');
                    if (dataEmptyValue && (dataEmptyValue !== '') && (value === dataEmptyValue)) {
                        value = '';
                    } else {
                        if ($(this).attr('data-CHGD-remove-whitespaces') !== undefined) {
                            value = value.replace(/\s/g, "");
                        }
                    }

                    if ((value !== origValue) && (value.trim() !== origValue.trim())) {
                        inputReallyChanged = true;
                    }
                    var color = inputReallyChanged || dataStyleChanged ? COLOR_CHANGED : '';
                    var backgoudColor = inputReallyChanged ? 'yellow' : '';
                    $(this).css('color', color); // .css('background-color', backgoudColor);
                    $('label[for="'+$(this).attr('id')+'"]').css('color', color);
                    break;

                case 'textarea':
                    value = $(this).val();

                    var dataEmptyValue = $(this).attr('data-nette-empty-value');
                    if (dataEmptyValue && (dataEmptyValue !== '') && (value === dataEmptyValue)) {
                        value = '';
                    } else {
                        if ($(this).attr('data-CHGD-remove-whitespaces') !== undefined) {
                            value = value.replace(/\s/g, "");
                        }
                    }
                    
                    if (value !== origValue) {
                        inputReallyChanged = true;
                    }
                    var color = inputReallyChanged || dataStyleChanged ? COLOR_CHANGED : '';
                    var backgoudColor = inputReallyChanged ? 'yellow' : '';
                    $(this).css('color', color); // .css('background-color', backgoudColor);
                    $('label[for="'+$(this).attr('id')+'"]').css('color', color);
                    break;

                default:
                    break;
            }

            if (inputReallyChanged) {
                /*
                 console.log('name="' + name + '", type="'+type+ '", value="'+value+'", origValue="' + origValue + '"');
                 console.log('    #### CHANGED');
                 */

                /* Oznaceni tabu s editaci pouze jedne zalozky potlaceno

                var tabName = $(this).closest(".tab-pane").attr('id'); // tab se zmenou
                // nastavit barvu v odpovidajicim linku
                $('ul.nav-pills > li > a[href="#'+tabName+'"]').css('color', COLOR_CHANGED).css('font-weight', 'bold');
                */


                changeDetected = true;
                numberOfChanges++;
            }
        }
    }
}


var inputsChanged = function(detectOnlyVisible = false) {
    //
    //  Detekce zda jsou ve formulari neulozene zmeny
    //
    changeDetected = false;
    numberOfChanges = 0;

    /*
     console.log('-->> START');
    */
    /*
        zatim se neresi hledani v dialogu, protoze vsude byla v dialogu zalozka
        pouze u prevozu neni, ale tam se zase nedela detekce vubec
    var modalOpenedDialog = $('.modal.in');
    */

    var href = $('.nav-pills .active > a').attr('href');
    var activeTab = href ? $('#' + href.substring(1)) : null;
    $('ul.nav-pills > li > a').removeAttr('style'); // nastavit puvodni barvu tabu

    if (activeTab && (activeTab.length > 0)) {
        //
        // je-li nalezen tab, hleda se jen uvnitr tabu
        //
        var possibleEl = $(activeTab).find('input[type="text"]:not(.odpocet), input[type="tel"]:not(.odpocet), input[type="radio"]:checked, input[type="checkbox"]:not(.odpocet), select:not(.odpocet), textarea:not(.odpocet)');
        if (detectOnlyVisible) {
            possibleEl = $(possibleEl).filter(":visible");
        }
        $(possibleEl).each(detectChanges);

        // funguje jen na zalozky !!!
        if (changeDetected) {
            $(activeTab).find('a.saveButton').removeClass('btn-primary').addClass('btn-success');
        } else {
            $(activeTab).find('a.saveButton').removeClass('btn-success').addClass('btn-primary');
        }
    }

    return changeDetected;
}

function getNumberOfChanges() {
    return numberOfChanges;
}

var specifiedInputsChanged = function(selector) {
    //
    //  Detekce zda jsou ve formulari neulozene zmeny
    //
    changeDetected = false;
    numberOfChanges = 0;

    /*
     console.log('-->> START');
     */
    /*$('ul.nav-pills > li > a').removeAttr('style'); // nastavit puvodni barvu tabu*/
    $(selector).each(detectChanges);

    var containsButton = $(selector).closest('modal.fade.in');
    if (containsButton.length === 0) {
        containsButton =  $('#' + $('.nav-pills .active > a').attr('href').substring(1));
    }
    if (containsButton.length) {
        $(containsButton).find('a.saveButton').removeClass('btn-primary').addClass('btn-success');
    }

    return changeDetected;
}

var getOriginalValue = function (el) {
    var name = $(el).attr('name');
    var originalSelector = 'input[name="' + '__CHGD__' + name + '"][type="hidden"]';
    var value;

    var type = $(el).prop("tagName").toLowerCase();
    if (type === 'input') {
        var subtype = $(el).attr('type');
        if ((subtype === 'checkbox') || (subtype === 'radio')) {
            type = subtype;
        }
    }

    if (type === 'checkbox') {
        value = $(originalSelector).val() > 0;
    } else {
        value = $(originalSelector).val();
    }
    return value;
}

var restoreOriginalValue = function (el) {
    var id = $(el).attr('id');
    var name = id.substring(id.indexOf('Form-')+5);

    var type = $(el).prop("tagName").toLowerCase();
    if (type === 'input') {
        var subtype = $(el).attr('type');
        if ((subtype === 'checkbox') || (subtype === 'radio')) {
            type = subtype;
        }
    }

    var originalSelector = 'input[name="' + '__CHGD__' + name + '"][type="hidden"]';
    var originalValue = $(originalSelector).val();

    if (originalValue) {
        $('label[for="'+$(el).attr('id')+'"]').removeAttr('style');
        switch (type) {
            case 'checkbox':
                $(el).prop( "checked", parseInt(originalValue)).removeAttr('style');
                break;

            case 'radio':
                alert('restoreOriginalValue: radio neni podporovane');
                break;

            case 'input':
            case 'tel':
            case 'textarea':
            case 'select':
                $(el).val(originalValue).removeAttr('style');
                break;

            default:
                break;
        }

        inputsChanged(true);
    }
}

$(document).ready(function() {

    $('body').on('click', '.detect', function () {
        inputsChanged(true);
    }).on('change', 'input[type="text"], input[type="tel"], input[type="radio"]:checked, input[type="checkbox"],select, textarea', function (e, data) {
        if ($(this).hasClass('k_uhrade') || $(this).hasClass('show_is_on') || $(this).hasClass('cenik_kod') ||
            $(this).hasClass('mnozstvi') || $(this).hasClass('jednotk_cena') || $(this).hasClass('dph') || $(this).hasClass('sleva_proc')) {
            return;
        }
        if (!data || !data.suppressOnLineDetection) {
            inputsChanged(true);
        }
    }).on('paste','form input, form textarea',  function () {
        //
        // vyvolani udalosti change na paste z clipboardu
        //
        var element = this;
        setTimeout(function () {
            $(element).trigger('change');
        }, 100);
    }).on('keydown', 'form input, form textarea, form select, div.dgscroll-divhead input, div.dgscroll-divhead textarea, div.dgscroll-divhead select, div#sendMailDialog-form input, div#sendMailDialog-form textarea, div#sendMailDialog-form select', function (e) {
        var closestForm = $(this).closest('form');
        var formSelector;
        if (closestForm.length > 0) {
            formSelector = 'form#'+$(this).closest('form').attr('id');
        } else {
            let emailDialog = $(this).closest('div#sendMailDialog-form');
            if (emailDialog.length > 0) {
                formSelector = 'div#sendMailDialog-form';
            } else {
                formSelector = 'div.dgscroll-divhead';
            }
        }
        var type = $(this).prop("tagName").toLowerCase();

        if (true /* !insideAutocomplete delalo problemy v polich s cenikovym kodem */) {
            if ((e.keyCode === 13) && ((type === 'select') || (type === 'textarea')) && e.shiftKey) {
                // otevreni selectu
            } else if ((e.keyCode === 13) && !e.ctrlKey) {
                if ($(formSelector).hasClass('on-enter-submit')) {
                    $('.saveButton').first().click();
                } else {
                    // na enter se chova jako na tab. Pouze na viditelne a editovatelne polozky
                    var inputs = $(formSelector + " input:enabled:not([type='submit']):not([type='checkbox']), "+formSelector+" textarea:enabled, "+formSelector+" select:enabled")
                        .filter(":visible")
                        .filter("[readonly!='readonly']");
                    var firstInput = inputs[0];
                    var lastInput = inputs[inputs.length-1];

                    if (this !== lastInput) {
                        inputs[inputs.index(this) + 1].focus();
                    } else {
                        firstInput.focus();
                    }
                    e.preventDefault();
                }
                return false;
            } else if ((e.keyCode === 9) && !e.shiftKey) {
                // Na tab skace cyklicky dokola
                var inputs = $(formSelector + " input:enabled:not([type='submit']):not([type='checkbox']), "+formSelector+" textarea:enabled, "+formSelector+" select:enabled")
                    .filter(":visible")
                    .filter("[readonly!='readonly']");
                var firstInput = inputs[0];
                var lastInput = inputs[inputs.length-1];

                if (this !== lastInput) {
                    inputs[inputs.index(this) + 1].focus();
                } else {
                    firstInput.focus();
                }
                e.preventDefault();
                return false;
            } else if ((e.keyCode === 9) && e.shiftKey) {
                // Na shift tab skace cyklicky dokola
                var inputs = $(formSelector + " input:enabled:not([type='submit']):not([type='checkbox']), "+formSelector+" textarea:enabled, "+formSelector+" select:enabled")
                    .filter(":visible")
                    .filter("[readonly!='readonly']");
                var firstInput = inputs[0];
                var lastInput = inputs[inputs.length-1];

                if (this !== firstInput) {
                    inputs[inputs.index(this) - 1].focus();
                } else {
                    lastInput.focus();
                }
                e.preventDefault();
                return false;
            }
        }
    }).on('keydown', 'input, select, option', function (e) {
        if (e.keyCode === 115) {
            // F4
            var type = $(this).prop("tagName").toLowerCase();
            switch (type) {
                case 'select':
                    // otevrit combo na F4
                    $(this).click();
                    break;
                case 'input':
                    // otevrit kalendar na F4
                    var groupDate = $(this).closest('div.input-group.date');
                    if (groupDate.length > 0) {
                        $(groupDate).find('.input-group-addon').click();
                    }
                    break;
            }
        }
    }).on('keydown', '*', function (e) {
        if (((e.keyCode === 13) && e.ctrlKey)) {
            //console.log('Ctrl-Enter');
            if (!window.hasOwnProperty("insideAutocomplete") || !insideAutocomplete) {
                let activeTabDiv = $('div.tab-pane.active.in:visible');
                if (activeTabDiv.length > 0) {
                    $(activeTabDiv).find(".saveButton").first().click();
                } else {
                    $(".saveButton").first().click();
                }
            }
            e.preventDefault();
            return false;
        }
    }).on('focusin', "form input[type='text'][readonly!='readonly']:visible:enabled, form input[type='number'][readonly!='readonly']:visible:enabled",function () {
        // selectovat text focusovaneho inputu
        this.select();
    }).on('focusin', "form textarea[readonly!='readonly']:visible:enabled",function () {
        var len = $(this).val().length;
        this.setSelectionRange(len, len);
    }).on('input', 'textarea[data-resize-textarea]', function (e) {
        resizeTextarea(this);
    });
});



