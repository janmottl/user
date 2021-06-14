/**
 *
 *  Spolecne funkce
 *
 */

function resizeTextarea(el) {
    //
    // natahovani textarea dle obsahu
    //
    $(el).css('height', 'auto');
    let borderWidth = parseInt($(el).css("border-top-width").slice(0, -2)) + parseInt($(el).css("border-bottom-width").slice(0, -2));
    $(el).css('height', (el.scrollHeight + borderWidth) + 'px').css('padding', '');
}

function replaceHistoryIfIdIsEmpty() {
    var lastToken = window.location.pathname.split('/').pop(); // zjistit posledni cast url
    if (!lastToken || (lastToken === '') || isNaN(lastToken)) {
        // je prazdne nebo neni cislo
        if((window.history != undefined) && (window.history.pushState != undefined)) {
            // nahradit v historii za neskodnou home page
            window.history.replaceState({}, document.title, linkNovy);
        }
    }
}

function adjustPopoverAfterScroll(scrolledDiv, isModal) {
    var scolledDivOffset = $(scrolledDiv).offset();

    var openedAutocompleteWidget =  $('ul.ui-menu.ui-widget.ui-widget-content.ui-autocomplete.ui-front:visible');
    if (openedAutocompleteWidget.length > 0) {
        $(openedAutocompleteWidget).each(function () {
            var widgetMenu = this;
            var relatedEl = $('#'+$(this).attr('data-rel-input'));
            var relatedElGroup = $(relatedEl).closest('div.input-group');

            if (relatedEl.length > 0) {
                var posRelatedEl = $(relatedEl).offset();

                var visible = isModal ||
                    (
                        (posRelatedEl.top+10 > scolledDivOffset.top) &&
                        ((posRelatedEl.top + $(relatedEl).height()) < (scolledDivOffset.top + $(scrolledDiv).height())) &&
                        (posRelatedEl.left > scolledDivOffset.left) &&
                        ((posRelatedEl.left + $(relatedEl).width()) < (scolledDivOffset.left + $(scrolledDiv).width()))
                    );

                if (visible) {
                    $(widgetMenu).css('top', ($(relatedElGroup).offset().top + $(relatedElGroup).height()).toString() + 'px')
                        .css('left', posRelatedEl.left);
                } else {
                    $(relatedEl).autocomplete( "close" );
                }
            }
        });
    } else {
        var dateWidget = $('div.datepicker.datepicker-dropdown.dropdown-menu');
        if (dateWidget.length > 0) {
            var relatedEl = $('#'+$(dateWidget).attr('data-rel-input'));
            var relatedElGroup = $(relatedEl).closest('div.input-group');

            if (relatedEl.length > 0) {
                var posRelatedEl = $(relatedEl).offset();

                var visible = isModal ||
                    (
                        (posRelatedEl.top+10 > scolledDivOffset.top) &&
                        ((posRelatedEl.top + $(relatedEl).height()) < (scolledDivOffset.top + $(scrolledDiv).height())) &&
                        (posRelatedEl.left > scolledDivOffset.left) &&
                        ((posRelatedEl.left + $(relatedEl).width()) < (scolledDivOffset.left + $(scrolledDiv).width()))
                    );

                if (visible) {
                    $(dateWidget).css('top', (posRelatedEl.top + $(relatedElGroup).height()).toString() + 'px')
                        .css('left', posRelatedEl.left);
                } else {
                    $(relatedElGroup).datepicker('hide');
                }
            }
        }
    }
}

function openLinkInNewWindow(url, title) {
    let winNew = window.open(url, title, "fullscreen");

    if (!!window.chrome && !!chrome.windows && !!chrome.windows.update) {
        // jedna se o Chrome
        chrome.windows.update(winNew, {
            url: url,
            focused: true,
            state: "maximized"
        });
    } else {
        if (winNew && (winNew.outerWidth < screen.availWidth || winNew.outerHeight < screen.availHeight))
        {
            winNew.moveTo(0,0);
            winNew.resizeTo(screen.availWidth, screen.availHeight);
        }
    }
}

function disableReadonlyInputs(areaSelector) {
    // diablovat kde nezabere readonly=readonly
    $(areaSelector).find(':checkbox[readonly="readonly"], select[readonly="readonly"], :file[readonly="readonly"]')
        .attr('disabled', true);
    // zabranit pristup na readonly inputy pres tabulator
    $(areaSelector).find('input, textarea, select')
        .filter("[readonly='readonly']")
        .attr('tabindex', '-1');
}

function setReadOnlyMode(areaSelector) {
    // diablovat vsechna pole
    $(areaSelector).find('input:not([name="nav_search_by"]), textarea, select').attr('disabled', true);
}

// obdobna funkce jako formatovani v php
var number_format = function (number, decimals, decPoint, thousandsSep) {
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number;
    var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
    var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep;
    var dec = (typeof decPoint === 'undefined') ? '.' : decPoint;

    var toFixedFix = function (n, prec) {
        var k = Math.pow(10, prec);
        return '' + (Math.round(n * k) / k)
            .toFixed(prec);
    };

    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }

    return s.join(dec);
};

// odstrani mezery a @ z rc
var removeWhitespaces = function (source) {
    if (source) {
        return source.replace( /\s|@/g, '');
    } else {
        return source;
    }
};

/**
* Adds time to a date. Modelled after MySQL DATE_ADD function.
* Example: dateAdd(new Date(), 'minute', 30)  //returns 30 minutes from now.
* https://stackoverflow.com/a/1214753/18511
*
* @param date  Date to start with
    * @param interval  One of: year, quarter, month, week, day, hour, minute, second
* @param units  Number of units of the given interval to add.
*/
function dateAdd(date, interval, units) {
    var ret = new Date(date); //don't change original date

    var checkRollover = function() {
        if(ret.getDate() !== date.getDate()) {
            ret.setDate(0);
        }
    }

    switch(interval.toLowerCase()) {
        case 'year'   :  ret.setFullYear(ret.getFullYear() + units); checkRollover();  break;
        case 'quarter':  ret.setMonth(ret.getMonth() + 3*units); checkRollover();  break;
        case 'month'  :  ret.setMonth(ret.getMonth() + units); checkRollover();  break;
        case 'week'   :  ret.setDate(ret.getDate() + 7*units);  break;
        case 'day'    :  ret.setDate(ret.getDate() + units);  break;
        case 'hour'   :  ret.setTime(ret.getTime() + units*3600000);  break;
        case 'minute' :  ret.setTime(ret.getTime() + units*60000);  break;
        case 'second' :  ret.setTime(ret.getTime() + units*1000);  break;
        default       :  ret = undefined;  break;
    }

    return ret;
}

function stringToDate(_date) {
    var _format = 'dd.mm.yyyy';
    var _delimiter = '.';
    var formatItems = _format.split(_delimiter);
    var dateItems = _date.split(_delimiter);
    var monthIndex = formatItems.indexOf("mm");
    var dayIndex = formatItems.indexOf("dd");
    var yearIndex = formatItems.indexOf("yyyy");
    var month = parseInt(dateItems[monthIndex]);
    month -= 1;
    return new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
}

function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    // other browser
    return false;
}

var var_isMobileDevice = false;

function isMobileDevice() {
    return var_isMobileDevice;
}

//
//  Vypocet svatku
//
var svatky = {};
svatky['01-01'] = 'Nový rok. Den obnovy samostatného českého státu';
svatky['05-01'] = 'Svátek práce';
svatky['05-08'] = 'Den vítězství';
svatky['07-05'] = 'Den slovanských věrozvěstů Cyrila a Metoděje';
svatky['07-06'] = 'Den upálení mistra Jana Husa';
svatky['09-28'] = 'Den české státnosti';
svatky['10-28'] = 'Den vzniku samostatného československého státu';
svatky['11-17'] = 'Den boje za svobodu a demokracii';
svatky['12-24'] = 'Štědrý den';
svatky['12-25'] = '1. svátek vánoční';
svatky['12-26'] = '2. svátek vánoční';

var velikonoce = {};
var velikonoceVypocitane = {};

function easter_calculate(year) {
    var a = year % 19;
    var b = Math.floor(year / 100);
    var c = year % 100;
    var d = Math.floor(b / 4);
    var e = b % 4;
    var f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4);
    var k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var n0 = (h + l + 7 * m + 114);
    var n = Math.floor(n0 / 31) - 1;
    var p = n0 % 31 + 1;
    var easter = new Date(year, n, p);

    velikonoceVypocitane[year] = true;

    var velkyPatek = new Date(year, n, p);
    velkyPatek.setDate(easter.getDate() - 2);
    var dateString = $.datepicker.formatDate("yy-mm-dd", velkyPatek);
    velikonoce[dateString] = 'Velký pátek';

    var velikonocniPondeli = new Date(year, n, p);
    velikonocniPondeli.setDate(easter.getDate() + 1);
    dateString = $.datepicker.formatDate("yy-mm-dd", velikonocniPondeli);
    velikonoce[dateString] = 'Velikonoční pondělí';
}

function getSvatek(d) {
    //
    // vraci nazev svatku nebo null
    //

    // hledani svatku s pevnym datem
    var dateStringWithoutYear = $.datepicker.formatDate("mm-dd", d);
    if (svatky[dateStringWithoutYear]) {
        return svatky[dateStringWithoutYear];
    }

    var year = d.getFullYear();
    var dateString = $.datepicker.formatDate("yy-mm-dd", d);
    if (!velikonoceVypocitane[year]) {
        // vypocitat velikonoce pro dany rok
        easter_calculate(year);
    }
    if (velikonoce[dateString]) {
        return velikonoce[dateString];
    }

    return null; // neni svatek
}

function getSvatkyRoku(year, callback) {
    var datumStr;
    var datum;

    for (prop in svatky) {
        datumStr = year+'-'+prop;
        try {
            datum = $.datepicker.parseDate('yy-mm-dd', datumStr);
            callback(datum);
        }
        catch (err) {
            // datum zustane null
        }
    }


    if (!velikonoceVypocitane[year]) {
        // vypocitat velikonoce pro dany rok
        easter_calculate(year);
    }
    for (prop in velikonoce) {
        try {
            datum = $.datepicker.parseDate('yy-mm-dd', prop);
            if (datum.getFullYear() === year) {
                callback(datum);
            }
        }
        catch (err) {
            // datum zustane null
        }
    }
}

function setDenVtydnu(datumTxt, spanSelector, inputSelector) {
    if (datumTxt && (datumTxt !== '')) {
        var dayNamesShort = ["NE", "PO", "ÚT", "ST", "ČT", "PÁ", "SO"];
        try {
            var datum = $.datepicker.parseDate('d.m.yy', datumTxt);
            if (datum && (datum !== '')) {
                var nazevSvatku = getSvatek(datum);
                var denVtydnu = dayNamesShort[datum.getDay()];

                if (!nazevSvatku) {
                    $(spanSelector).text(denVtydnu).removeClass('svatekColor').removeAttr('data-toggle').removeAttr('title').tooltip('destroy');
                } else {
                    $(spanSelector).text(denVtydnu).addClass('svatekColor')
                        .attr('data-toggle', 'tooltip').attr('title', 'Svátek: '+nazevSvatku).tooltip('destroy').tooltip({container: 'body', trigger: "hover"});
                }
            } else {
                $(spanSelector).html('&nbsp;&nbsp;&nbsp;&nbsp;').removeClass('svatekColor');
            }
        }
        catch (err) {
            $(spanSelector).html('&nbsp;&nbsp;&nbsp;&nbsp;').removeClass('svatekColor');
        }
    } else {
        $(spanSelector).html('&nbsp;&nbsp;&nbsp;&nbsp;').removeClass('svatekColor');
    }
}

var formatPsc = function(psc) {
    return psc.substr(0, 3) + ' ' + psc.substr(3, 2);
};


var adaptObecPscByState = function (idAttr, stat) {
    if (idAttr.endsWith('_stat')) {
        var prefix = idAttr.substr(0, idAttr.indexOf('_stat'));
        var obecId = '#'+prefix + '_obec_nazev';
        var pscId = '#'+ prefix + '_obec_psc';
        var enable = !stat || (stat === '') || (stat.trim().toUpperCase() === 'CZ');
        $(obecId).autocomplete({
            disabled: !enable
        });
        if (!enable) {
            $(pscId).inputmask();
            $(obecId).closest('div').find('.input-group-addon.acomplIcon').addClass('disabled');
        } else {
            $(pscId).inputmask({mask: "9[9][9] [9][9]", insertMode: !1});
            $(obecId).closest('div').find('.input-group-addon.acomplIcon').removeClass('disabled');
        }
    }
};

function checkChangedState(idAttr) {
    if (idAttr.endsWith('_stat')) {
        let prefix = idAttr.substr(0, idAttr.indexOf('_stat'));
        let obec = $('#'+prefix + '_obec_nazev').val().trim();
        let psc = $('#'+ prefix + '_obec_psc').val().replace('_', '').trim();
        let obecNotEmpty = obec && (obec !== '') ? true : false;
        let pscNotEmpty = psc && (psc !== '') ? true : false;
        let title = 'Změna státu';
        let message = '';
        let dataTooltipStat = $('#'+ idAttr).attr('data-tooltip-stat');

        if (obecNotEmpty && pscNotEmpty) {
            message = 'Překontrolujte, zda název obce a PSČ odpovídá této změně';
        } else {
            if (pscNotEmpty) {
                message = 'Překontrolujte, zda PSČ odpovídá této změně';
            } else {
                if (obecNotEmpty) {
                    message = 'Překontrolujte, zda název obce odpovídá této změně';
                }
            }
        }

        if (dataTooltipStat === 'statnar') {
            if (obecNotEmpty) {
                message = 'Překontrolujte, zda název obce narození odpovídá této změně';
            }
        } else {
            if (dataTooltipStat === 'statprisl') {
                message = '';
            }
        }

        if (message !== '') {
            dialogAlert(null, title, message, 400);
        }
    }
}

/**
 *
 *  Osetreni formulare se snippety
 *
 */

function adjustGUIZobrazMode(activeDivSelector) {
    // ukazat tlacitka pro zobrazovaci mode
    $(".zobraz-mode").removeClass("disabled hidden").find('a, button').removeAttr('tabindex');
    // schovat tlacitka pro editacni mod
    $(activeDivSelector).find(".edit-mode").addClass("hidden");
    $(activeDivSelector).find("a.edit-mode-link").addClass('disabled');
    // ikona na tabech
    $("ul.nav > li").removeClass('edit');
}

function adjustGUIEditMode(activeDivSelector) {
    // schovat tlacitka pro zobrazovaci mode
    $(".zobraz-mode").addClass("disabled").find('a, button').attr('tabindex', '-1');
    // ukazat tlacitka pro editacni mod
    $(activeDivSelector).find(".zobraz-mode").addClass("hidden");
    $(activeDivSelector).find(".edit-mode").removeClass("hidden").find('.btn.btn-success').removeClass('btn-success').addClass('btn-primary');
    $(activeDivSelector).find("a.edit-mode-link").removeClass('disabled');
    // ikona na tabech
    $("ul.nav > li.active").addClass('edit');
}

function adjustSaveButton(activeDivSelector) {
    $(activeDivSelector).find('a.saveButton').removeClass('btn-success').addClass('btn-primary');
}

$(document).on('alert-danger', function (e, form) {
    disableReadonlyInputs(form);
});

$.nette.ext('concordiaForm', {
    prepare: function (settings) {
        this.url = settings.url;
        this.data = settings.data;
        this.isSubmit = settings.nette && settings.nette.isSubmit;
        this.formEvent = null;
        // mimo submit je this.data.parentDivId zadano primo v get parametrech
        if (this.isSubmit) {
            var keepEditMode = false;

            if (settings.nette.el) {
                var attrKeepEditMode = $(settings.nette.el).attr('keepEditMode');
                keepEditMode = attrKeepEditMode && (attrKeepEditMode === 'true');
                var headerSnippet = $(settings.nette.el).attr('headerSnippet');
                if (headerSnippet && (headerSnippet !== '')) {
                    this.headerSnippet = headerSnippet;
                } else {
                    this.headerSnippet = 'headerSnippet';
                }
            }

            // u zalozek se hleda od formulare prvni nadrizeny div.tab-pane
            // u dialogu je nutne pridat class parentDiv nadrazenemu divu
            this.data.parentDivId = $(settings.nette.form).closest('div.tab-pane').attr('id');

            if (this.data.parentDivId && (this.data.parentDivId !== "")) {
                this.data.adjustGUI = true;
            } else {
                this.data.parentDivId = $(settings.nette.form).closest('div.parentDiv').attr('id');
                this.data.adjustGUI = false;
            }

            if (keepEditMode) {
                this.data.adjustGUI = false;
            }
        }
        $('[data-toggle="popover"]').popover("destroy");
    },
    success: function (payload) {
        let fatalErrorText = 'Fatal error';
        function isObject (value) {
            return value && typeof value === 'object' && value.constructor === Object;
        }

        if (!isObject(payload) && payload.indexOf(fatalErrorText) !== -1) {
            $('div.snippetError').removeClass('hidden')
                .html('<a href="javascript:void(0)" class="alert-close close pull-right" aria-label="Zavřít">&times;</a>' +
                    'Chyba komunikace se serverem (Ajax snippet). <br>' + payload);
            return;
        }

        var existsForm = false;
        var existsInitEditing = false;

        $('div.snippetError').addClass('hidden');

        function triggerEvent(forceEventType) {
            if (payload && payload.snippets) {
                Object.keys(payload.snippets).forEach(function(snippet,index) {
                    //
                    // zjisti udalost podle readonly="readonly".
                    // podle toho nastavi GUI a rozesle udalost
                    //
                    var snippetEl = $('div#' + snippet);
                    var eventType = 'initViewing';

                    if (forceEventType && (forceEventType !== "")) {
                        eventType = forceEventType;
                    } else {
                        var formEl = $(snippetEl).find('form');
                        if (formEl.length > 0)  {
                            existsForm = true;
                            eventType = $(snippetEl).find('form[readonly="readonly"]:not([id*="operationSubmitForm"])').length > 0 ? 'initViewing': 'initEditing';
                            existsInitEditing = existsInitEditing || (eventType === 'initEditing');
                        }
                    }

                    if (eventType === 'initViewing') {
                        setReadOnlyMode(snippetEl);
                        baseViewingInit(snippetEl);
                    } else {
                        disableReadonlyInputs(snippetEl);
                        baseControlsInit(snippetEl);
                    }

                    $(snippetEl).trigger(eventType, snippet);
                });
            }
        }

        triggerEvent();

        $('.saveButton').prop('disabled', false).removeClass('processing disabled'); // povolit opet stisknuti tlacitka

        if (this.isSubmit) {
            var alertDanger = 'div#snippet--headerSnippet div.server-alert.alert-danger';
            if (this.headerSnippet) {
                alertDanger = 'div#snippet--'+this.headerSnippet+' div.server-alert.alert-danger';
            }
            if ($(alertDanger).length) {
                //
                // NEuspesna serverova validace
                //
                if (this.data.adjustGUI && this.data.parentDivId && existsForm) {
                    if (existsInitEditing) {
                        focusFirstTabInput($('div#' + this.data.parentDivId));
                    } else {
                        adjustGUIZobrazMode('div#'+this.data.parentDivId);
                    }
                }

                // zaslat udalost o neuspesne validaci
                $("ul#myTabs").trigger("validationFinished", {validationOK: false, validationPhase: 'srv'});
            } else {
                //
                // uspesna serverova validace
                //
                if (this.data.adjustGUI && this.data.parentDivId) {
                    adjustGUIZobrazMode('div#'+this.data.parentDivId);
                } else {
                    // pro keeEditMode
                    adjustSaveButton('div#'+this.data.parentDivId);
                }

                // zaslat udalost o uspesne validaci
                $("ul#myTabs").trigger("validationFinished", {validationOK: true, validationPhase: 'srv'});
            }
        } else {
            if (this.data && this.data.clicked && (this.data.clicked === "editovat")) {
                // vstup do editacniho modu
                if (this.data.adjustGUI && this.data.parentDivId) {
                    adjustGUIEditMode('div#' + this.data.parentDivId);
                }
                // zmeny zustaly obarvene a tak neni nutne volat inputsChanged()
            } else {
                // stornovano
                if (this.data && this.data.adjustGUI && this.data.parentDivId) {
                    adjustGUIZobrazMode('div#' + this.data.parentDivId);
                }
            }
        }

        setAllAlertsSize();

        if (this.headerSnippet) {
            let alerts = 'div#snippet--'+this.headerSnippet+' div.server-alert';
            $(alerts).css('display', 'none').slideDown(function () {
                if (!$(this).hasClass('alert-danger')) {
                    $(this).css('padding', '0');
                }
            });
        }
    },
    error: function (xhr, textStatus, errorThrown) {
        var userMessage = "";

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

        $('div.snippetError').removeClass('hidden')
            .html('<a href="javascript:void(0)" class="alert-close close pull-right" aria-label="Zavřít">&times;</a>'+
                'Chyba komunikace se serverem (Ajax snippet). '+userMessage)
            .css('display', 'none').slideDown();
    }
}),
    {
        isSubmit: false,
        url: "",
        data: null,
        parentDivId: null,
        adjustGUI: true,
        formEvent: null,
        headerSnippet: 'headerSnippet'
    };


//
// spustit pri nacteni stranky
//

// aby se navbar colapsoval po clicku na mobilu
$(document).on('click', '.navbar-collapse.in', function (e) {
    if ($(e.target).is('a') && $(e.target).attr('class') !== 'dropdown-toggle') {
        $(this).collapse('hide');
    }
});


/**
 *
 *  Viewing - osetreni zobrazeni
 *
 */

function setCzechNumberFormat(areaSelector) {
    $(areaSelector).find('input.formatNumber').each(function () {
        // nahrada desetinne tecky za carku ve validacnich pravidlech.
        // carka se prevadi na serveru ve filtru na tecku
        var netteRules = $(this).attr('data-nette-rules');
        if (netteRules) {
            $(this).attr('data-nette-rules',  netteRules.replace('.?', ',?'));
        }

        var pattern = $(this).attr('pattern');
        if (pattern) {
            $(this).attr('pattern',  pattern.replace('.?', ',?'));
        }
    });
    $(areaSelector).find('input.dph').each(function () {
        // je treba doplnit pravidla, aby to zvladlo s _ dodanym inputmask
        // na serveru to musi byt bez _, aby to kontrolovalo bez dodabnych znaku z inputmask
        var netteRules = $(this).attr('data-nette-rules');
        if (netteRules) {
            $(this).attr('data-nette-rules', netteRules.replace(/\([0-9]\)/g, function(string, first) {
                // nahradi pro vsechna jednociferna cisla v zavorce
                let digit = string.substr(1, 1);
                return '(' + digit +')|(' + digit +'\_)|(\_' + digit + ')';
            }));
        }
    });
}

function baseViewingInit(areaSelector) {
    setCzechNumberFormat (areaSelector);

    // inicializace tooltipu
    if (!isMobileDevice()) {
        $('[data-toggle="tooltip"]').tooltip({trigger: "hover"});
    } else {
        $('[data-toggle="tooltip"]').tooltip().click(function () {
            let sourceElement = this;
            setTimeout(function () {
                $(sourceElement).tooltip("hide");
            }, 5000);
        });
    }

    $(areaSelector).find('form textarea[data-resize-textarea]:visible').each(function () {
       resizeTextarea(this);
    });

    $(areaSelector).find('span.input-group-addon.day-of-week ~ input').each(function () {
        let spanElement = $(this).closest('div').find('span.input-group-addon.day-of-week');
        if ($(this).attr('readonly') !== undefined) {
            $(spanElement).attr('readonly', 'readonly');
        }
        setDenVtydnu($(this).val(), spanElement, this);
    });

    $(areaSelector).find('span.stat-nazev-addon').each(function () {
        let spanHeight = $(this).outerHeight();
        if (spanHeight > 32) {
            // jsou tam dva radky. Optimalizace aby se nemusela pokazde zjistovat vyska inputu
            let input = $(this).closest('.input-group').find('input');
            if (input.length > 0) {
                $(input).css('height', spanHeight+'px');
            }
        }
    });

}

// spustit pri reloadu stranky
baseViewingInit('body');

// pri resize window upravit textarea
$(window).resize(function() {
    $('form textarea[data-resize-textarea]:visible').each(function () {
        resizeTextarea(this);
    });
});

//
// pri aktivaci tabu resize textarea a navigace
//
$('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
    var target = $(e.target).attr("href") // activated tab
    $('div'+target).find('textarea[data-resize-textarea]').each(function () {
        resizeTextarea(this);
    });
});


/**
 *
 *  Controls
 *
 */

//
// Prvotni nastaveni fokusu na prvni input
//
function focusFirstTabInput(areaSelector) {
    var inputs = $(areaSelector).find("form input:enabled:not([type='submit']), form textarea:enabled, form select:enabled")
        .filter(":visible")
        .filter("[readonly!='readonly']");
    if (inputs.length && inputs[0]) {
        inputs[0].focus();
    }
}


//
// potlacuje dialog pri zmene stranky
//
var suppressOnBeforeUnload = false;

window.onbeforeunload = function() {
    if (!suppressOnBeforeUnload && inputsChanged(true)) {
        return 'Na stránce jsou neuložené změny. Opravdu ji chcete opustit?';
    }
};

//
// funkce pro podporu zadavani titulu
//
function getLastTypedTerm(term) {
    var separatorIndex = term.lastIndexOf(';');
    return separatorIndex >= 0 ? term.substr(separatorIndex + 2) : term;
}

function getRecentTerms(term) {
    var separatorIndex = term.lastIndexOf(';');
    return separatorIndex >= 0 ? term.substr(0, separatorIndex + 1) : '';
}

//
// kvuli osetreni entru v autocomplete
//
var insideAutocomplete = false;
focusAutocomplete = function () {
    insideAutocomplete = true;
};
closeAutocomplete = function () {
    insideAutocomplete = false
};
//
// kvuli zachovani hodnoty pri pruchodu klavesami
//
var acomlPrevValue = '';
function setAcomplPreviousValue() {
    acomlPrevValue = $(':focus').val();
}
function getAcomplPreviousValue() {
    return acomlPrevValue;
}


var initDatepicker = function (dateInputs) {
    //
    // Incializuje datepickery podle pole inputy
    //
    if (!isMobileDevice()) {
        $(dateInputs).keyup(function (e) {
            // po stisknuti mezery nastavit aktualni datum
            if ((e.keyCode === 0 || e.keyCode === 32)) {
                var todayStr = $.datepicker.formatDate("dd.mm.yy", new Date());
                $(this).closest('.input-group.date').datepicker('update', todayStr);
                $(this).trigger('change').focus();
                removeErrors(this);
                e.preventDefault();
                return false;
            }
        });
    }

    $(dateInputs).inputmask({"alias": "dd.mm.yyyy", "placeholder": "dd.mm.rrrr",
        yearrange: {
            minyear: 1,
            maxyear: 2099
        }
    });

    $(dateInputs).closest('.input-group.date').datepicker({
        orientation: 'bottom',
        format: "dd.mm.yyyy",
        weekStart: 1,
        maxViewMode: 2,
        todayBtn: "linked",
        //clearBtn: true,
        language: "cs",
        daysOfWeekHighlighted: "0,6",
        autoclose: true,
        todayHighlight: true,
        showOnFocus:false,
        disableTouchKeyboard: true,
        keyboardNavigation: true,
        enableOnReadonly:true,
        beforeShowDay: function(d) {
            var nazevSvatku = getSvatek(d);

            if (nazevSvatku !== null) {
                return {
                    enabled:true,
                    tooltip:nazevSvatku,
                    classes:'svatek'
                };
            }
            // neni svatek
        }
    }).on('changeDate', function() {
        // po zmene data z pickeru nastavit focus na input, aby se neztratil hlavne v IE.
        var input = $(this).find('input');
        if (!isMobileDevice()) {
            if (!$(input).is(":focus")) {
                $(input).focus();
            }
        }
    }).on('show', function(e) {
        // nastavit do pickeru odkaz na zdrojove pole
        var relInput = $(this).find('input').attr('id');
        $('div.datepicker.datepicker-dropdown.dropdown-menu').attr('data-rel-input', relInput);
    });

    if (!isMobileDevice()) {
        // po kliknuti na knoflik s ikonou kalendare dat focus na input
        var addOns = $(dateInputs).closest('div.input-group.date').find('span.input-group-addon');
        $(addOns).click(function () {
            $(this).closest('div.input-group').find('input').focus();
        });
    }
};


function baseControlsInit(areaSelector) {

    baseViewingInit(areaSelector);

    // schovat tlacitko s class="save"
    $('input.save').closest('div.form-group').addClass('hidden');

    // masky zadane v elementu
    $(areaSelector).find(":input[data-inputmask]").inputmask();

    //
    // date picker
    //
    var dateInputs = $(areaSelector).find('.input-group.date').find('input[readonly!="readonly"]');
    if (dateInputs.length) {
        initDatepicker(dateInputs);
        $(dateInputs).filter('[data-warning-date-flag]').change(function () {
            let dataWarningDateFlag = $(this).attr('data-warning-date-flag');
            let diff = dateDiffActualDate($(this).val());

            if (dataWarningDateFlag && (dataWarningDateFlag.length >= 3)) {
                if (diff === 0) {
                    if (dataWarningDateFlag.charAt(1) === 'x') {
                        dialogAlert(null, 'Varování - neobvyklé datum', 'Zadáno dnešní datum', 400);
                    }
                } else {
                    if (diff < 0) {
                        if (dataWarningDateFlag.charAt(2) === 'x') {
                            dialogAlert(null, 'Varování - neobvyklé datum', 'Zadáno datum za ' + Math.abs(diff) + ' dny', 400)
                        }
                    } else {
                        if (dataWarningDateFlag.charAt(0) === 'x') {
                            dialogAlert(null, 'Varování - neobvyklé datum', 'Zadáno datum před ' + diff + ' dny', 400)
                        }
                    }
                }
            }

        });
    }

    //
    // clock picker
    //
    var clockElems = $(areaSelector).find('.clockpicker');
    if (clockElems.length) {
        $(clockElems).each(function () {
            $(this).clockpicker({
                //autoclose: true,
                donetext: 'OK',
                afterDone: function () {
                    if (this && this.input && (this.input.length > 0)) {
                        $(this.input.length).trigger('change').focus();
                    }
                },
                beforeShow: function () {
                    if (this && this.input && (this.input.length > 0)) {
                        this.options.placement = 'bottom';
                        this.options.align = 'left';
                        var clockPickerBottomPosWidth = 220;
                        var thisOffset = $(this.input).offset();
                        var container = $('body');
                        var containerOffset = $(container).offset();

                        if (thisOffset && containerOffset) {
                            // zjisti velikost presahu pri pozici pod (leftAlignOverlap) a pri poloze zleva (leftPosOverlap)
                            var leftAlignOverlap =  parseInt(thisOffset.left) + clockPickerBottomPosWidth
                                - parseInt(containerOffset.left) - parseInt($(container).css('padding-left')) - $(container).width();
                            /*
                            console.log('leftAlignOverlap: '+ leftAlignOverlap);
                            */
                            if (leftAlignOverlap > 0) {
                                // pokud presahuje pri pozici pri (leftAlignOverlap) tak se zarovna zprava
                                this.options.placement = 'bottom';
                                this.options.align = 'right';
                            }
                        }
                    }
                },
                vibrate: true
            });
        }).find('input').off('focus.clockpicker click.clockpicker');   // potlacit otevirani pri fokusu inoutu a kliku
    }

    //
    // Standardizovany autocomplete - acomplsimple
    //
    var acomlElems = $(areaSelector).find('.acomplSimple');
    if (acomlElems.length) {
        $(acomlElems).autocomplete({
            focus: focusAutocomplete,
            close: closeAutocomplete,
            minLength: 0,
            delay: 300,
            create: function () {
                var widget = $(this).data('ui-autocomplete');
                $(widget.menu.element).attr('data-rel-input', this.id);
                if (($(this).closest('div.modal-body').length > 0) || ($(this).closest('div.ui-dialog').length > 0)) {
                    $(widget.menu.element).css('z-index', 1100);
                }
            },
            source: function (request, response) {
                var acompl = $(':focus').attr('acompl');
                var singlevalue = $(':focus').attr('singlevalue');
                $.ajax({
                    async: true,
                    url: simpleAutocompleteSource,
                    data: {acompl: acompl,
                        singlevalue: singlevalue,
                        term: request.term
                    }
                }).done(function (msg) {
                    response(msg)
                });
            },
            open: function (event, ui) {
                setAcomplPreviousValue();
                if ($(this).hasClass('dph')) {
                    // pro dph zarovnat hodnoty doprava a zuzit naseptavac
                    var widget = $(this).data('ui-autocomplete');
                    $(widget.menu.element).css('width', '35');
                    $(widget.menu.element).find('div').css('text-align', 'right').css('padding', '0 3px 3px 3px');
                }
            },
            select: function (event, ui) {
                if (event.originalEvent.key !== 'Tab') {
                    this.value = ui.item.value;
                    $(this).trigger('change');
                } else {
                    this.value = getAcomplPreviousValue();
                }
                return false;
            },
            focus: function (event, ui) {
                this.value = getAcomplPreviousValue();
                return false;
            },
        });

    }

    $(areaSelector).find('.acomplIcon').click(function () {
        var input = $(this).closest('div.input-group').find('input[readonly!="readonly"]');
        if (input.length && ($(input).attr('readonly') !== 'readonly')) {
            $(input).focus().autocomplete( "search", "*" );
        }
    });


    //
    // Tituly
    //

    // doplneni orezanych mezer na konci seznamu titulu
    var titulInputs = $(areaSelector).find('.titul_pred, .titul_za');
    var i;
    for (i = 0; i < titulInputs.length; i++) {
        if (titulInputs[i].value && (titulInputs[i].value !== "")) {
            if (titulInputs[i].value.substr(-1, 1) === ';') {
                titulInputs[i].value += ' ';
            } else {
                titulInputs[i].value += '; ';
            }
        }
    }

    var titulPredElems = $(areaSelector).find('.titul_pred[readonly!="readonly"]');
    if (titulPredElems.length) {
        $(titulPredElems).autocomplete({
            create: function () {
                var widget = $(this).data('ui-autocomplete');
                $(widget.menu.element).attr('data-rel-input', this.id);
                if (($(this).closest('div.modal-body').length > 0) || ($(this).closest('div.ui-dialog').length > 0)) {
                    $(widget.menu.element).css('z-index', 1100);
                }
            },
            focus: function () {
                insideAutocomplete = true;
                // prevent value inserted on focus
                return false;
            },
            close: closeAutocomplete,
            minLength: 0,
            delay: 300,
            source: function (request, response) {
                var termix = getLastTypedTerm(request.term);
                $.ajax({
                    async: true,
                    url: titulPredAutocompleteSource,
                    data: {term: termix}
                }).done(function (msg) {
                    response(msg)
                });
            },
            select: function (event, ui) {
                if (ui.item !== null && ui.item !== undefined) {
                    endOfTitul = ui.item.value.indexOf(',');
                    if (endOfTitul > 0) {
                        titul = ui.item.value.substr(0, endOfTitul);
                        this.value = getRecentTerms(this.value) + titul + '; ';
                    }
                }
                $(this).trigger('change');
                return false;
            }
        });
    }

    var titulZaElems = $(areaSelector).find('.titul_za[readonly!="readonly"]');
    if (titulZaElems.length) {
        $(titulZaElems).autocomplete({
            create: function () {
                var widget = $(this).data('ui-autocomplete');
                $(widget.menu.element).attr('data-rel-input', this.id);
                if (($(this).closest('div.modal-body').length > 0) || ($(this).closest('div.ui-dialog').length > 0)) {
                    $(widget.menu.element).css('z-index', 1100);
                }
            },
            focus: function () {
                insideAutocomplete = true;
                // prevent value inserted on focus
                return false;
            },
            close: closeAutocomplete,
            minLength: 0,
            delay: 300,
            source: function (request, response) {
                var termix = getLastTypedTerm(request.term);
                $.ajax({
                    async: true,
                    url: titulZaAutocompleteSource,
                    data: {term: termix}
                }).done(function (msg) {
                    response(msg)
                });
            },
            select: function (event, ui) {
                if (ui.item !== null && ui.item !== undefined) {
                    endOfTitul = ui.item.value.indexOf(',');
                    if (endOfTitul > 0) {
                        var titul = ui.item.value.substr(0, endOfTitul);
                        this.value = getRecentTerms(this.value) + titul + '; ';
                    }
                }
                $(this).trigger('change');
                return false;
            }
        });
    }

    //
    //  Adresa - obec, adresa, psc, stat
    //
    var obecElems = $(areaSelector).find('.obec_nazev[readonly!="readonly"]');
    if (obecElems.length) {
        function selectFocusHandle(autocomlThis, event, ui) {
            var obecId = $(':focus').attr('id');
            if (obecId && (obecId !== '')) {
                var pscNameSelector = '#' + obecId.substr(0, obecId.indexOf('_nazev')) + '_psc';
                if (ui.item !== null && ui.item !== undefined) {
                    if (ui.item.value !== '{not-valid-value}') {
                        // nejde o specialni value uzivane jako label
                        var endOfObec = ui.item.value.indexOf(',');
                        if (endOfObec > 0) {
                            var obec = ui.item.value.substr(0, endOfObec);
                            var rest = ui.item.value.substr(endOfObec + 2);
                            var endOfPsc = rest.indexOf(',');
                            if (endOfPsc > 0) {
                                var psc = rest.substr(0, endOfPsc);
                                $(pscNameSelector).val(formatPsc(psc)).trigger('change');
                                autocomlThis.value = obec;
                            }
                        }
                    } else {
                        autocomlThis.value = '';
                    }
                } else {
                    autocomlThis.value = '';
                }
            }
        }

        $(obecElems).autocomplete({
            close: closeAutocomplete,
            minLength: 0,
            delay: 300,
            create: function () {
                var widget = $(this).data('ui-autocomplete');
                $(widget.menu.element).attr('data-rel-input', this.id);
                if (($(this).closest('div.modal-body').length > 0) || ($(this).closest('div.ui-dialog').length > 0)) {
                    $(widget.menu.element).css('z-index', 1100);
                }
            },
            open: function () {
                setAcomplPreviousValue();
                /* z neznamych duvodu tady nechodu udalost create, proto reseno na open */
                var widget = $(this).data('ui-autocomplete');
                $(widget.menu.element).attr('data-rel-input', this.id);
                if (($(this).closest('div.modal-body').length > 0) || ($(this).closest('div.ui-dialog').length > 0)) {
                    $(widget.menu.element).css('z-index', 1100);
                }
            },
            source: function (request, response) {
                var obecId = $(':focus').attr('id');
                var pscNameSelector = '#' + obecId.substr(0, obecId.indexOf('_nazev')) + '_psc';
                var psc = $(pscNameSelector).val();
                if (psc && (psc !== '')) {
                    psc = psc.replace( /\s|_/g, '');
                } else {
                    psc = '';
                }
                $.ajax({
                    async: true,
                    url: obecAutocompleteSource,
                    data: {psc: psc, obec: request.term}
                }).done(function (msg) {
                    response(msg)
                });
            },
            select: function (event, ui) {
                if (event.originalEvent.key !== 'Tab') {
                    selectFocusHandle(this, event, ui);
                    $(this).trigger('change');
                } else {
                    this.value = getAcomplPreviousValue();
                }
                return false;
            },
            focus: function (event, ui) {
                focusAutocomplete();
                this.value = getAcomplPreviousValue();
                return false;
            },
        });
    }

    $(areaSelector).find('.psc[readonly!="readonly"]').change(
        function() {
            // pokud se zmenilo psc tak vycistit obec
            var obecSelector = '#' + this.id.substr(0, this.id.indexOf('_psc')) + '_nazev';
            $(obecSelector).val('');
        }
    );

    // Stat a nastaveni masky a reset autocomplete na obec
    var statElem = $(areaSelector).find('.stat[readonly!="readonly"]');
    if (statElem.length) {
        $(statElem).autocomplete({
            focus: focusAutocomplete,
            close: closeAutocomplete,
            minLength: 0,
            delay: 300,
            create: function () {
                var widget = $(this).data('ui-autocomplete');
                $(widget.menu.element).attr('data-rel-input', this.id);
                if (($(this).closest('div.modal-body').length > 0) || ($(this).closest('div.ui-dialog').length > 0)) {
                    $(widget.menu.element).css('z-index', 1100);
                }
            },
            source: function (request, response) {
                let acceptUnknown = $(':focus').attr('data-accept-unknown') !== undefined ? 'true' : 'false';
                $.ajax({
                    async: true,
                    url: statAutocompleteSource,
                    data: {term: request.term,
                           acceptUnknown: acceptUnknown
                    }
                }).done(function (msg) {
                    response(msg)
                });
            },
            select: function (event, ui) {
                if (event.originalEvent.key !== 'Tab') {
                    if (ui.item !== null && ui.item !== undefined) {
                        var endOfMpz = ui.item.value.indexOf(',');
                        if (endOfMpz > 0) {
                            this.value = ui.item.value.substr(0, endOfMpz);
                        }
                    }
                    $(this).trigger('change');
                } else {
                    this.value = getAcomplPreviousValue();
                }
                return false;
            },
            open: function() {
                setAcomplPreviousValue();
            },
            focus: function () {
                this.value = getAcomplPreviousValue();
                return false;
            }
        }).change(function () {
            var idAttr = $(this).attr('id');
            var statKod = $(this).val();
            adaptObecPscByState(idAttr, statKod);

            let inputEl = this;
            let spanNazev = $(this).closest('.input-group').find('span.stat-nazev-addon');
            let acceptUnknown = $(this).attr('data-accept-unknown') !== undefined ? 'true' : 'false';
            flashMessage ('', '#'+idAttr);
            if (statKod && (statKod !== '')) {
                $.getJSON(statValidateSource,  {kod: statKod, acceptUnknown: acceptUnknown},
                    function (data) {
                        let nazev = '';
                        if (data['returns'] === 'true') {
                            nazev = data['nazev'];
                            $(inputEl).val(data['kod']);
                            flashMessage ('', '#'+idAttr);
                            checkChangedState(idAttr);
                        } else {
                            nazev = 'Neplatný kód státu';
                            flashMessage ('Neplatný kód státu', '#'+idAttr);
                        }
                        $(spanNazev).text(nazev);
                    });
            } else {
                $(spanNazev).text('');
            }

            setTimeout(function () {
                let inputHeight = $(inputEl).outerHeight();
                let spanHeight = $(spanNazev).outerHeight();
                if (inputHeight < spanHeight) {
                    $(inputEl).css('height', spanHeight+'px');
                } else {
                    $(inputEl).css('height', '');
                }
            }, 300);

        });
    }

    // inicializovat masku na psc a autocomplete podle obsahu dat
    $('.stat').each(function () {
        var idAttr = $(this).attr('id');
        var stat = $(this).val();
        adaptObecPscByState(idAttr, stat);
    });

    var kontaktElems = $(areaSelector).find('.kontakt[readonly!="readonly"]');
    if (kontaktElems.length) {
        $(kontaktElems).autocomplete({
            focus: focusAutocomplete,
            close: closeAutocomplete,
            minLength: 0,
            delay: 300,
            create: function () {
                var widget = $(this).data('ui-autocomplete');
                $(widget.menu.element).attr('data-rel-input', this.id);
                if (($(this).closest('div.modal-body').length > 0) || ($(this).closest('div.ui-dialog').length > 0)) {
                    $(widget.menu.element).css('z-index', 1100);
                }
            },
            source: function (request, response) {
                $.ajax({
                    async: true,
                    url: kontaktAutocompleteSource,
                    data: {term: request.term,
                           tag : $(':focus').attr('data-kontakt-tag')}
                }).done(function (msg) {
                    response(msg)
                });
            },
            select: function (event, ui) {
                if (event.originalEvent.key !== 'Tab') {
                    var kontaktId = $(':focus').attr('id');
                    var baseSelector = '#' + kontaktId.substr(0, kontaktId.indexOf('nazev'));
                    if (ui.item !== null && ui.item !== undefined) {
                        if (ui.item.value !== '{not-valid-value}') {
                            // nejde o specialni value uzivane jako label
                            var endOfNazev = ui.item.value.indexOf(';');
                            if (endOfNazev !== -1) {
                                var nazev = ui.item.value.substr(0, endOfNazev);
                                var rest = ui.item.value.substr(endOfNazev + 2);
                                this.value = nazev;

                                var endOfOddeleni = rest.indexOf(';');
                                if (endOfOddeleni !== -1) {
                                    var oddeleni = rest.substr(0, endOfOddeleni);
                                    $(baseSelector + 'oddeleni').val(oddeleni);
                                    var rest = rest.substr(endOfOddeleni + 2);

                                    var endOfObec = rest.indexOf(';');
                                    if (endOfObec !== -1) {
                                        var obec = rest.substr(0, endOfObec);
                                        $(baseSelector + 'obec_nazev').val(obec);
                                        var rest = rest.substr(endOfObec + 2);

                                        var endOfPsc = rest.indexOf(';');
                                        if (endOfPsc !== -1) {
                                            var psc = rest.substr(0, endOfPsc).replace(' ', '');
                                            $(baseSelector + 'obec_psc').val(formatPsc(psc));
                                            var adresa = rest.substr(endOfPsc + 2);
                                            $(baseSelector + 'adresa').val(adresa);
                                            $(baseSelector + 'stat').val('');
                                        }
                                    }
                                }
                            }
                            inputsChanged(true);
                        } else {
                            this.value = '';
                        }
                    } else {
                        this.value = '';
                    }
                    $(this).trigger('change');
                } else {
                    this.value = getAcomplPreviousValue();
                }
                return false;
            },
            open: function() {
                setAcomplPreviousValue();
            },
            focus: function () {
                this.value = getAcomplPreviousValue();
                return false;
            }
        });
    }

    var kontaktElems = $(areaSelector).find('input.kontaktEmail');
        if (kontaktElems.length) {
            $(kontaktElems).each(function () {
                let label = $(this).attr('data-label');
                $(this).wrapAll('<div class="kontaktEmail-group">');
                $(this).before('<div class="legend-kontaktEmail">'+label+'</div>');
            });

            $(kontaktElems).filter('[readonly!="readonly"]').tagsInput({
                // allows new tags
                interactive: true,
                // custom placeholder
                placeholder: '',
                // width/height
                width: 'auto',
                height: 'auto',
                // hides the regular input field
                hide: true,
                // custom delimiter
                delimiter: ';',
                // duplicate validation
                //unique: true,
                // removes tags with backspace
                removeWithBackspace: true,
                // an array of whitelisted values
                whitelist: null,
                // a pattern you can use to validate the input
                validationPattern: new RegExp(/^([^<]*<)?\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+[>]?$/),
                autocomplete: {
                    focus: focusAutocomplete,
                    close: closeAutocomplete,
                    minLength: 0,
                    delay: 300,
                    create: function () {
                        var widget = $(this).data('ui-autocomplete');
                        $(widget.menu.element).attr('data-rel-input', this.id);
                        if (($(this).closest('div.modal-body').length > 0) || ($(this).closest('div.ui-dialog').length > 0)) {
                            $(widget.menu.element).css('z-index', 1100);
                        }
                        $(this).data('ui-autocomplete')._renderItem = function (ul, item) {
                            //
                            // render doplnuje class akce, ktery se uziva pro podzeleni akcnich kodu
                            //
                            var value = item.value;
                            var listItem;
                            var posSelected;

                            if (item && item.value) {
                                posSelected = value.indexOf('>sel');
                                if (posSelected !== -1) {
                                   value = value.substring(0, posSelected);
                                }
                            } else {
                                value = '';
                            }

                            listItem = $("<li>")
                                .append('<div>' + value + '</div>')
                                .appendTo(ul);
                            if (posSelected >= 0) {
                                listItem.addClass("email-already-selected ui-state-disabled");
                            }
                            return listItem;
                        }
                    },
                    source: function (request, response) {
                        let focused = $(':focus');
                        if (focused.length > 0) {
                            let emailAddressList = emailAddressListAllVisible(focused);
                            $.ajax({
                                async: true,
                                url: kontaktEmailAutocompleteSource,
                                data: {
                                    term: request.term,
                                    emailAddressList: emailAddressList
                                }
                            }).done(function (msg) {
                                response(msg)
                            });
                        }
                    },
                },
            }).each(function () {
                let tagInput = $(this).closest('div').find('input.tag-input');
                let tagInputId = $(tagInput).attr('id');
                let tagInputGrId = tagInputId +'_igr';
                let containerEl = $(this).closest('.container').first().find('div[id]');
                let containerId;
                if (containerEl.length > 0) {
                    containerId = $(containerEl).attr('id');
                } else {
                    containerId = 'sendMailDialog-form';
                }
                $(this).closest('.container').attr('id');
                $(tagInput).attr('autocomplete', 'noautocomplete');
                $(tagInput).wrapAll('<div class="input-group" id="'+tagInputGrId+'" style="padding: 5px;">');
                $('#'+tagInputGrId).append('<span class="input-group-addon acomplIcon kontaktEmail"><i class="fa fa-chevron-down" aria-hidden="true"></i></span>\n' +
                                     '<span class="input-group-addon searchKontaktEmail" data-toggle="tooltip" title="Vybrat příjemce e-mailu z Kontaktů" data-container="' +
                                    '#' + containerId+'"><i class="fa fa fa-bars" aria-hidden="true"></i></span>');
                $('#'+tagInputGrId).find('.searchKontaktEmail').tooltip('destroy').tooltip({trigger: "hover"});
            });

            $(areaSelector).find('.input-group-addon.acomplIcon.kontaktEmail').click(function () {
                var input = $(this).closest('div.input-group').find('input[readonly!="readonly"]');
                if (input.length && ($(input).attr('readonly') !== 'readonly')) {
                    $(input).focus().autocomplete( "search", "*" );
                }
            });
        }

    focusFirstTabInput(areaSelector);

    //
    // automaticky otevre autcomplete pokud jiz neni vyplnene
    //
    $(areaSelector).find(".titul_pred, .titul_za, .acomplSimple, .obec_nazev, .kontakt").focusin(function () {
        if ($(this).is("[readonly!='readonly']:visible:enabled")) {
            if ($(this).val() === '') {
                $(this).autocomplete("search", '');
            } else {
                if ($(this).hasClass('dph') || $(this).hasClass('obec_nazev') || $(this).hasClass('jednotka')) {
                    $(this).autocomplete("search", '');
                }
            }
        }
    });

    $(areaSelector).find(".tag-input.ui-autocomplete-input").change(function () {
        if ($(this).is("[readonly!='readonly']:visible:enabled")) {
            if ($(this).val() === '') {
                $(this).autocomplete("search", '');
            }
        }
    });
}


/**
 *
 *  Osetreni linku a buttonu
 *
 */

$('body').on('click', 'a.edit', function () {
    // prepnuti do editacniho modu spolecne s downloadem snippetu
    let activeTab = $('.nav-pills:visible .active > a').attr('href').substring(1);
    let snippet = activeTab.substring('frm-group-'.length) + 'Snippet';
    $.nette.ajax({
        url: reloadSnippetAutocompleteSource,
        data: {
            snippet: snippet,
            headerSnippet: "headerSnippet",
            clicked: "editovat",
            parentDivId: activeTab,
            adjustGUI: true
        }
    });
});


function saveButtonClicked () {
    //
    // zpoždění aby doběhly asynchronní kontroly
    //
    setTimeout(function () {
        let activeTabDiv = $('div.tab-pane.active.in:visible');
        // Je treba enablovat selecty, aby nas nevyhodila validace
        $(activeTabDiv).find('.enableOnSave').attr('disabled', false);

        // osetreni poli s tinyMCE
        if ((typeof(tinyMCE) != "undefined") && tinyMCE.activeEditor) {
            // je aktivni
            tinyMCE.triggerSave();
        }

        // stisknuti skryteho tlacitka
        if (activeTabDiv.length > 0) {
            $(activeTabDiv).find("input[name='save']").first().click();
        } else {
            $("input[name='save']").first().click();
        }
    }, 100);
}

$('body').on('click', '.saveButton', function () {
    if (!$(this).hasClass('processing')) {
        $(this).prop('disabled', true).addClass('processing disabled'); // zabranit opakovanemu stisknuti tlacitka dokud request nedobehne

        let rect = this.getBoundingClientRect();
        $('.processing-spinner').css('left', rect.left).css('top', rect.top).removeClass('hidden');

        saveButtonClicked();
    }

}).on('click', 'a.storno', function () {
    var stopEventFunction = function () {
        $("#confirmDialog").off( "stop", stopEventFunction).off( "continue", continueEventFunction);
    };
    var continueEventFunction = function () {
        $("#confirmDialog").off( "stop", stopEventFunction).off( "continue", continueEventFunction);

        // ukonceni editacniho modu bez ulozeni
        var activeTab = $('.nav-pills:visible .active > a').attr('href').substring(1);
        var snippet = activeTab.substring('frm-group-'.length) + 'Snippet';
        $.nette.ajax({
            url: reloadSnippetAutocompleteSource,
            data: {
                snippet: snippet,
                headerSnippet: "headerSnippet",
                clicked: "zobrazit",
                parentDivId: activeTab,
                adjustGUI: true
            }
        });
    };

    // do zobrazovaciho modu
    if (!inputsChanged(true)) {
        // bez potvrzeni uzivatele
        continueEventFunction();
    } else {
        // jsme v editu s rozjetymi zmenami, je nutne potvrzeni od uzivatele
        myConfirm(stopEventFunction, continueEventFunction);
    }
}).on('click', 'a.storno_back', function () {
    var stopEventFunction = function () {
        $("#confirmDialog").off( "stop", stopEventFunction).off( "continue", continueEventFunction);
    };
    var continueEventFunction = function () {
        $("#confirmDialog").off("stop", stopEventFunction).off("continue", continueEventFunction);

        window.history.back();
    }

    // do zobrazovaciho modu
    if (!inputsChanged(true)) {
        // bez potvrzeni uzivatele
        continueEventFunction();
    } else {
        // jsme v editu s rozjetymi zmenami, je nutne potvrzeni od uzivatele
        myConfirm(stopEventFunction, continueEventFunction);
    }
}).on('change', 'span.input-group-addon.day-of-week ~ input', function () {
        let spanElement = $(this).closest('div').find('span.input-group-addon.day-of-week');
        setDenVtydnu($(this).val(), spanElement, this);
}).on('click', '.addressLocate, .kontaktLocate', function () {
    let adresa = '';
    let psc = '';
    let obec = '';
    let stat = '';

    if ($(this).hasClass('addressLocate')) {
        let formGroup = $(this).closest('div.form-group');
        adresa = $(formGroup).find('input[name*="adresa"]').first().val();
        psc = $(formGroup).find('input[name*="psc"]').first().val();
        obec = $(formGroup).find('input[name*="obec_nazev"]').first().val();
        stat = $(formGroup).find('input[name*="stat"]').first().val();
    } else {
        if ($(this).hasClass('kontaktLocate')) {
            let form = $(this).closest('form');
            let baseName = $(this).closest('div.input-group').find('input').attr('name');
            if (baseName && (baseName !== '')) {
                baseName = baseName.replace('_nazev', '');
                adresa = $(form).find('input[name="' + baseName + '_adresa"]').first().val();
                psc = $(form).find('input[name="' + baseName + '_psc"]').first().val();
                obec = $(form).find('input[name="' + baseName + '_obec_nazev"]').first().val();
                stat = $(form).find('input[name="' + baseName + '_stat"]').first().val();
            }
        }
    }

    if (!adresa || (adresa === '')) {
        alert('Nebyla zadána adresa');
        return;
    }

    var locate = '';

    /*
    if (stat && (stat !== '')) {
        locate = stat;
    }
    */
    if (psc && (psc !== '')) {
        locate = locate + ' ' + psc;
    }
    if (obec && (obec !== '')) {
        locate = locate + ' ' + obec;
    }
    locate = locate + ' ' + adresa;

    if (locate && locate !== '') {
        var url = 'https://www.google.com/maps/search/?api=1&query=' + locate;
        window.open(url, '_blank')
    } else {
        alert('Nebylo zadáno místo');
    }
});

$('div.modal[role="dialog"]').scroll(function () {
    // upravit pozice naseptavacu a datepickeru
    adjustPopoverAfterScroll(this, true);
});

/**
 *
 * Dialogy
 *
 */

function myConfirm(stopEventFunction, continueEventFunction) {
    if (stopEventFunction) {
        $("#confirmDialog").on("stop", stopEventFunction);
    }
    if (continueEventFunction) {
        $("#confirmDialog").on("continue", continueEventFunction);
    }
    $("#confirmDialog").dialog("open").closest('div[role="dialog"]').css('width', 'auto');
    $('#confirmDialog ~ div.ui-dialog-buttonpane').find('div.ui-dialog-buttonset').css('margin-right', '55px');
}

function myInfoDownload() {
    $("#infoDownloadDialog").dialog("open");
}


function dialogInfo(continueEventFunction,
                    dialogTitle, dialogText, dialogSize) {
    dialogSize = dialogSize > 0 ? dialogSize : 325;
    var dialogHtml = '<div id="infoDialog" class="info" title="' +
        dialogTitle + '" >' +
        dialogText +
        '</div>';
    $(dialogHtml).dialog({
        width: dialogSize,
        autoOpen: false,
        modal: true,
        closeOnEscape: false,
        dialogClass: "dlg-no-close",
        buttons: [
            {
                text: "Zavřít",
                click: function () {
                    $(this).trigger("continue").dialog("close").remove();
                }
            }
        ],
    });

    if (continueEventFunction) {
        $("#infoDialog").on("continue", continueEventFunction);
    }
    $("#infoDialog").dialog("open");
}

function dialogAlert(continueEventFunction,
                    dialogTitle, dialogText, dialogSize) {
    dialogSize = dialogSize > 0 ? dialogSize : 325;
    var dialogHtml = '<div id="alertDialog" class="dialog-alert" title="' +
        dialogTitle + '" >' +
        dialogText +
        '</div>';
    $(dialogHtml).dialog({
        width: dialogSize,
        autoOpen: false,
        modal: true,
        closeOnEscape: false,
        dialogClass: "dlg-no-close",
        buttons: [
            {
                text: "Zavřít",
                click: function () {
                    $(this).trigger("continue").dialog("close").remove();
                }
            }
        ],
    });

    if (continueEventFunction) {
        $("#alertDialog").on("continue", continueEventFunction);
    }
    $("#alertDialog").dialog("open");
}


function dialogConfirm(stopEventFunction, continueEventFunction,
                       dialogTitle, dialogQuestion, dialogSize,
                       nextElements) {
    dialogSize = dialogSize > 0 ? dialogSize : 325;
    if (nextElements === undefined) {
        nextElements = '';
    }

    var dialogHtml = '<div id="confirmObjDefaultDialog" title="' +
        dialogTitle +
        '" style="color: orangered;">'+
        dialogQuestion + nextElements +
        '</div>';
    $(dialogHtml).dialog({
        width: dialogSize,
        autoOpen: false,
        modal: true,
        closeOnEscape: true,
        resizable: false,
        dialogClass: "dlg-no-close",
        buttons: [
            {
                text: "Ano",
                click: function() {
                    $(this).trigger("continue").dialog("close").remove();
                }
            },
            {
                text: "Ne",
                click: function() {
                    $(this).trigger("stop").dialog("close").remove();
                }
            }
        ],
        close: function() {
            $(this).trigger("stop").remove();
        },
    });

    if (stopEventFunction) {
        $("#confirmObjDefaultDialog").on( "stop", stopEventFunction);
    }
    if (continueEventFunction) {
        $("#confirmObjDefaultDialog").on( "continue", continueEventFunction);
    }
    $("#confirmObjDefaultDialog").dialog("open");
}


function dialogThreeButtons(stopEventFunction, continueEventFunction, otherEventFunction,
                       dialogTitle, dialogQuestion, continueLabel, otherLabel, dialogSize) {
    dialogSize = dialogSize > 0 ? dialogSize : 325;
    var dialogHtml = '<div id="confirmObjDefaultDialog" title="' +
        dialogTitle +
        '" style="color: orangered;">'+
        dialogQuestion +
        '</div>';
    $(dialogHtml).dialog({
        width: dialogSize,
        autoOpen: false,
        modal: true,
        closeOnEscape: true,
        resizable: false,
        dialogClass: "dlg-no-close",
        buttons: [
            {
                text: continueLabel,
                click: function() {
                    $(this).trigger("continue").dialog("close").remove();
                }
            },
            {
                text: otherLabel,
                click: function() {
                    $(this).trigger("other").dialog("close").remove();
                }
            },
            {
                text: "Ne",
                click: function() {
                    $(this).trigger("stop").dialog("close").remove();
                }
            },
        ],
        close: function() {
            $(this).trigger("stop").remove();
        },
    });

    if (stopEventFunction) {
        $("#confirmObjDefaultDialog").on( "stop", stopEventFunction);
    }
    if (continueEventFunction) {
        $("#confirmObjDefaultDialog").on( "continue", continueEventFunction);
    }
    if (otherEventFunction) {
        $("#confirmObjDefaultDialog").on( "other", otherEventFunction);
    }
    $("#confirmObjDefaultDialog").dialog("open");
}
