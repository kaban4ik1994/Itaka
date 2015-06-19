
        var SearchForm;
        SearchForm = function ($form, validationUrl) {
            "use strict";
            var $mainDate = $("#date-range"),
                $dateFromInput = $('#date_from'),
                $dateToInput = $('#date_to'),
                $dateInputs = $dateFromInput.add($dateToInput),

                $destinationSelect = $('#destination-select'),
                $departureSelect = $('#departures-select'),
                $filtersList = $('#filter-tabs'),
                $filtersInput = $('#filter-input'),
                $orderList = $('#order-menu'),
                $orderOpener = $('#order-opener'),
                $orderInput = $('#order-input'),
                $priceTypes = $('#price-types'),
                $viewTypes = $('#view-types'),
                $priceTypeInput = $('#price-type-input'),
                $calRange = $('#cal-range'),
                $collapseFilterBtn = $('#collapseFilterBtn'),
                validationXhr = null,
                $locale = $('html').attr('lang'),
                calendarState = "from",//from, to, blocked - calendar states
                EVENT_TYPE_HOTELS = "31",
                _that = this;

            this.initAutoCompleteInput = function ($select) {
                var selected = $select.children(":selected"),
                    $options = $select.find('option'),
                    $listAll = $('<ul class="typeahead-all dropdown-menu"/>'),
                    $button = $("<button />").attr({
                        "tabIndex": -1,
                        "title": "Pokaż wszystko",
                        "class": "search-combobox"
                    }),
                    $input = $("<input />").attr({
                        'type': 'text',
                        'placeholder': $select.data('placeholder'),
                        'data-provide': 'typeahead',
                        'value': ''
                    }),
                    temp;

                /*
                 * input creation
                 */

                $select.hide();
                $input.insertAfter($select);

                /*
                 * list of all options creation
                 */
                $listAll.css({
                    "left": ($input.offset().left) + "px",
                    "top": ($input.offset().top + $input.height()) + "px"
                });

                $options.each(function () {
                    if ($(this).attr('value').length && !$(this).is(':disabled')) {
                        var value = $(this).text();

                        var $listNode = $('<a />')
                            .attr('href', '#')
                            .html(value);

                        $listAll.append($('<li data-value="' + $(this).attr('value') + '" />').append($listNode));
                    }
                });

                $listAll.on('click', 'a', function () {
                    var item = $(this).parent().data('value');

                    $select.val(item).change();
                    $input.val($select.find(':selected').text().replace('&emsp;', '')).removeClass('placeholder');

                    $listAll.hide();
                    return false;
                }).on('mouseenter', function () {
                    $(this).find('.active').removeClass('active');
                }).insertAfter($input);

                $('body').click(function (event) {
                    if ($listAll.is(':visible') && !$(event.target).closest($listAll).length && !$(event.target).closest($button).length) {
                        $listAll.hide();
                    }
                });

                /*
                 * button creation
                 */
                $button.click(function (ev) {
                    $listAll.children().removeClass('active selected');
                    $listAll.children('[data-value="' + $input.val() + '"]').addClass('active selected');
                    $listAll.toggle();

                    _that.initScroll($listAll);

                    ev.preventDefault();
                }).insertAfter($input);

                /*
                 * typeahead initialization
                 */

                $input.typeahead({
                    items: 1000,
                    source: function (query, process) {
                        $input.data('typeahead').$menu.data('jsp', false);

                        var intervalId = setInterval(
                            $.proxy(
                                function () {
                                    if (this.$menu.is(':visible')) {
                                        if (typeof this.$menu.data('jsp') != 'object') {
                                            this.$menu.jScrollPane({
                                                showArrows: true,
                                                horizontalGutter: 30,
                                                verticalGutter: 30,
                                                mouseWheelSpeed: 30,
                                                contentWidth: '0px'
                                            });

                                            this.$menu.height(this.$menu.data('jsp').getContentHeight());
                                            this.$menu.data('jsp').reinitialise();
                                        }

                                        clearInterval(intervalId);
                                    }
                                },
                                this
                            ), 50
                        );

                        var matches = [];

                        $options.each(function () {
                            if ($(this).attr('value').length && !$(this).is(':disabled')) {
                                var value = $(this).text();

                                matches.push($(this).text().replace('&emsp;', ''));
                            }
                        });

                        return matches;
                    },
                    updater: function (item) {
                        $options.each(function () {
                            if (item === $(this).text()) {
                                $select.val($(this).attr('value'));

                                return false;
                            }
                        });
                        return item;
                    }


                });

                $select.on('change', function () {
                    if (!$select.find(':selected').attr('value').length) {
                        $input.val('');
                    }
                    else {
                        $input.val($select.find(':selected').text());
                    }
                });

                $input.on('change', function () {
                    var value = $(this).val();

                    $select.val('');
                    if (value.length) {
                        $listAll.find('li').each(function () {
                            if (!$(this).data('disabled') && (value.toLowerCase() === $(this).text().toLowerCase().replace(/^\s+|\s+$/g, '') || value.toLowerCase() === $(this).data('value').toLowerCase())) {
                                $(this).find('a').click();

                                return false;
                            }
                        });
                    }
                });

                /*
                 * validation support
                 */
                $select.on('search.validate', function (ev, data) {
                    $select.children().each(function () {
                        var values = $(this).attr('value'),
                            valuesArr = values.split(',');

                        if (_.intersection(data, valuesArr).length === 0) {
                            $(this).attr('disabled', true);
                            $listAll.find('li[data-value="' + values + '"]').data('disabled', true).hide();
                        }
                        else {
                            $(this).attr('disabled', false);
                            $listAll.find('li[data-value="' + values + '"]').data('disabled', false).show();
                        }
                    });

                    /*$listAll.find('li').each(function () {
                        var values = $(this).data('value').split(',');
                        if (_.intersection(data, values).length === 0) {
                            $(this).data('disabled', true).hide();
                        }
                        else {
                            $(this).data('disabled', false).show();
                        }
                    });*/
                });
            };

            this.initDestinationInput = function () {
                this.initAutoCompleteInput($destinationSelect);
            }

            this.initDepartureInput = function () {
                this.initAutoCompleteInput($departureSelect);
            }

            this.initSelectsChrome = function () {
                // don't delete it's a new approach to deal with chrome select bug - it could be usefull :)
                //        if( navigator.userAgent.indexOf("Chrome") > -1) {
                //
                //            $('select option:selected').each(function(){
                //                var $main   =   $(this).closest('div');
                //                if ( $(this).data('label') ) { var orginalSelect = $(this).data('label'); }
                //                else    { var orginalSelect = $(this).val(); }
                //                $(this).closest('div').find('.dropdown-menu').find('.selected').removeClass('selected');
                //                $(this).closest('div').find('.dropdown-menu li').each(function(i,value){
                //                    if  ( orginalSelect == $(value).find('a').text() ) {
                //                        $main.find('.dropdown-toggle').text( orginalSelect );
                //                        $(this).addClass('active selected');
                //                        return false;
                //                    }
                //                });
                //                if  ( $main.find('input').length == 1 )  { $main.find('input').val( orginalSelect )  }
                //            });
                //        }

            };


            this.initDropdownInput = function ($select, dropdownCallback) {
                $select.hide().next().show();

                $select.parent().find('.dropdown-menu')
                    .on('click', 'a[data-value]', function (ev) {

                        var $that = $(this);


                        $that.closest('.dropdown-menu').find('.selected').removeClass('selected');
                        $that.parent().addClass('active selected');
                        $select.parent().find('.dropdown-toggle').text((typeof $that.data('label') !== 'undefined' && $that.data('label').length) ? $that.data('label') : $that.text());

                        $select.val($that.data('value'));

                        if (typeof (dropdownCallback) === 'function') {
                            dropdownCallback($select);
                        }

                        $select.change();

                        ev.preventDefault();


                    })
                    .on('mouseenter', function () {
                        $(this).find('.active:not(.item)').removeClass('active');

                    });


                /*
                 * validation support
                 */
                $select.on('search.validate', function (ev, data) {
                    var $list = $select.next().find('.dropdown-menu');

                    $select.children().each(function () {
                        if ($(this).attr('value').length) {
                            var values = $(this).attr('value'),
                                valuesArr = values.split(',');

                            if (_.intersection(data, valuesArr).length === 0) {
                                $(this).attr('disabled', true);

                                $list.find('li a[data-value="' + values + '"]').closest('li').hide();
                            }
                            else {
                                $(this).attr('disabled', false);

                                $list.find('li a[data-value="' + values + '"]').closest('li').show();
                            }
                        }
                    });

                    /*$select.next().find('.dropdown-menu li').each(function () {
                     if ($(this).children('a').data('value').toString().length) {
                     var values = $(this).children('a').data('value').toString().split(',');
                     if (_.intersection(data, values).length === 0) {
                     $(this).hide();
                     }
                     else {
                     $(this).show();
                     }
                     }
                     });*/
                });

                /*
                 * scroll init
                 */
                $(document).on('click.dropdown.data-api', '[data-toggle=dropdown],[class=search-combobox]', function () {
                    var $dropdown = $('[data-js-value="' + $select.next().find('ul.dropdown-menu').data('js-value') + '"]');

                    if ($dropdown.is(':visible')) {
                        if (typeof $dropdown.data('jsp') != 'object') {
                            $dropdown.jScrollPane({
                                showArrows: true,
                                horizontalGutter: 30,
                                verticalGutter: 30,
                                mouseWheelSpeed: 30,
                                contentWidth: '0px'
                            });

                            $dropdown.on('click', '.jspVerticalBar', function (ev) {
                                ev.stopPropagation();
                            });


                        }
                        else {
                            $dropdown.data('jsp').reinitialise();
                        }

                        $dropdown.height($dropdown.data('jsp').getContentHeight());
                        $dropdown.data('jsp').reinitialise();
                    }
                });
            }

            /**
             * @param $select
             * @param filterEnable
             * @param chosenBoxEnable
             * @param defaultValue
             *
             * @todo: input params as array with default values instead of params separated by commas
             */
            this.initDropdownSelect = function ($select, filterEnable, chosenBoxEnable, defaultValue, hideUnselectAll) {
                var filterEnable = filterEnable || false,
                    chosenBoxEnable = chosenBoxEnable || false,
                    defaultValue = (typeof defaultValue !== 'undefined') ? defaultValue : null,
                    hideUnselectAll = hideUnselectAll || false,
                    selectable,
                    $unselectAllButton = $('<button />').addClass('unselect-all').html('&times;').attr('title', search_selectUnselectAll);

                function updateOfChosenLabelsAndUnselectAll($input, $select) {
                    var selectable = $select.data('selectable'),
                        $chosenOptions = selectable.getSelectedOptions(),
                        chosenLabels = [];

                    if ($chosenOptions.length) {
                        $chosenOptions.each(function () {
                            chosenLabels.push($(this).data('label') || $(this).text());
                        });

                        selectable.$button.attr('title', search_selectChosenLabel + ': ' + chosenLabels.join(', '));
                        $unselectAllButton.toggle(!hideUnselectAll ? true : false);
                    }
                    else {
                        selectable.$button.attr('title', '');
                        $unselectAllButton.toggle(false);
                    }
                }

                $select.selectable({
                    defaultValue: defaultValue,
                    enableFiltering: filterEnable,
                    showChosenBox: chosenBoxEnable,
                    noMatchInfo: search_selectFilterNoMatches,
                    chosenFieldsetLabel: search_selectChosenLabel,
                    buttonText: function (options, select) {
                        if (options.length == 0) {
                            return search_defaultSelectLabel;
                        }
                        else if (options.length > 1) {
                            var chosenCount = _.template(search_selectChosenCounter);
                            //underscore updated 1.8.2
                            //return _.template(search_selectChosenCounter, { counter: options.length });
                            return chosenCount({ counter: options.length });
                        }
                        else {
                            var selected = '';
                            options.each(function () {
                                var label = ($(this).data('label') !== undefined) ? $(this).data('label') : $(this).text();

                                selected += label + ', ';
                            });

                            selected = selected.substr(0, selected.length - 2);

                            if (selected.length > 29) {
                                selected = selected.substr(0, 29) + '&hellip;';
                            }

                            return selected;
                        }
                    },
                    afterFilter: function () {
                        selectable.$optionsContainer.trigger('reinit.scrollpane');
                    },
                    afterKeyPressed: function (event, $activeElement) {
                        selectable.$optionsContainer.trigger('reposition.scrollpane', { element: $activeElement });
                    },
                    afterListItemCreate: function ($option, $listItem) {
                        if (typeof $option.data('description') !== 'undefined' && $option.data('description').length) {
                            var $info = $('<span />').addClass('group-description');
                            $info.text($option.data('description'));

                            $listItem.find('label').append($info);
                        }

                        if (typeof $option.data('class') !== 'undefined' && $option.data('class').length) {
                            $listItem.addClass($option.data('class'));
                        }

                        return $listItem;
                    },
                    afterChange: updateOfChosenLabelsAndUnselectAll
                });

                selectable = $select.data('selectable');
                $unselectAllButton
                    .hide()
                    .appendTo($select.prev())
                    .on('click', function (ev) {
                        selectable.unselectAll();

                        ev.preventDefault();
                    });

                updateOfChosenLabelsAndUnselectAll(null, $select);

                /*
                 * validation support
                 */
                $select.on('search.validate', function (ev, data) {
                    $select.find('option').each(function () {
                        if ($(this).attr('value').length) {
                            var values = $(this).attr('value'),
                                valuesArr = values.split(','),
                                available = _.intersection(data, valuesArr).length > 0;

                            $(this).attr('disabled', !available);
                            selectable.$optionsContainer.find('li input[value="' + values + '"]').closest('li').toggleClass('option-disabled unavailable', !available);
                        }
                    });

                    selectable.$optionsContainer.find('fieldset').each(function () {
                        $(this).toggle(!!$(this).find('li:not(.unavailable)').length);
                    });

                    selectable.updateButtonText();
                    selectable.fillChosenBox();
                    updateOfChosenLabelsAndUnselectAll(null, $select);

                    selectable.$optionsContainer.trigger('reinit.scrollpane');
                });

                this.initScroll($select.next().find('.options-container'));
                /*show filters*/
                $('.searchbig .affix-wrapper').show();
            }

            this.initDropdownMultiselect = function ($select, filterEnable) {
                filterEnable = filterEnable || false;

                $select.multiselect({
                    enableFiltering: filterEnable,
                    enableCaseInsensitiveFiltering: filterEnable,
                    filterBehavior: 'both',
                    preventInputChangeEvent: true,
                    buttonText: function (options, select) {
                        if (options.length === 0) {
                            return select.find('option[value=""]').text();
                        }
                        else if (options.length > 1) {
                            return options.length + ' zaznaczone';
                        }
                        else {
                            var selected = '';
                            options.each(function () {
                                var label = ($(this).attr('label') !== undefined) ? $(this).attr('label') : $(this).text();

                                selected += label + ', ';
                            });

                            selected = selected.substr(0, selected.length - 2);

                            if (selected.length > 21) {
                                selected = selected.substr(0, 21) + '&hellip;';
                            }

                            return selected;
                        }
                    },
                    onOptionCreate: function (option) {
                        return ($(option).attr('value').toString().length > 0);
                    }
                });

                /*
                 * validation support
                 */
                $select.on('search.validate', function (ev, data) {
                    var $list = $select.next().find('.dropdown-menu');

                    $select.children().each(function () {
                        if ($(this).attr('value').length) {
                            var values = $(this).attr('value'),
                                valuesArr = values.split(',');

                            if (_.intersection(data, valuesArr).length === 0) {
                                $(this).attr('disabled', true);

                                $list.find('li input[value="' + values + '"]').closest('li').hide();

                            }
                            else {
                                $(this).attr('disabled', false);

                                $list.find('li input[value="' + values + '"]').closest('li').show();
                            }

                        }
                    });

                    /*$select.next().find('.dropdown-menu li').each(function () {
                     if ($(this).find('input').attr('value').toString().length) {
                     var values = $(this).find('input').attr('value').toString().split(',');
                     if (_.intersection(data, values).length === 0) {
                     $(this).hide();
                     }
                     else {
                     $(this).show();
                     }
                     }
                     });*/
                });

                this.initScroll($select.next().find('ul.dropdown-menu'));
            }

            this.initChildsInput = function () {
                this.initChildsAgesDatepicker();
                this.initDropdownSelect($('#childs-select'), false, false, false, true);

                $('#childs-select').on('change', $.proxy(function () { this.childAgesCallback($('#childs-select')); }, this));
            }

            this.initCookieChildrenDate = function () {

                //after create form change values
                var cookieArr = _that.checkCookie('childDates');

                //datepicker show

                if (typeof (cookieArr) !== 'undefined' && cookieArr !== null && cookieArr.length > 0) {
                    //$select.val( cookieArr.length );

                    var childsSelected = ':eq(' + (cookieArr.length) + ')';
                    $('#childs-select').val($('#childs-select option' + childsSelected).val());

                    $('#childs-select option' + childsSelected).prop('selected', true);

                    if ($('.fKids').length > 0) {
                        $('.fKids a.btn').text(cookieArr.length);
                    }
                    //$('#childs-select').next().find('a').data('value', cookieArr.length )

                    // only for main page set select
                    if ($calRange.length > 0) {

                        $('#childs-select').next().find('ul li').each(function (i) {

                            if ($(this).hasClass("selected")) { $(this).removeClass('selected'); }
                            if (i === cookieArr.length) { $(this).addClass('selected'); }
                        });
                    }

                    _that.childAgesCallback($('#childs-select'));

                }

                if (typeof (cookieArr) !== 'undefined' && cookieArr !== null) {
                    $('.dropdown .datepicker input').each(function (i, value) {
                        if (cookieArr.length - 1 >= i) { $(this).val(cookieArr[i]); }
                    });
                }
            }

            this.resetCookie = function () {
                $.cookie('childDates', null, { expires: 100, path: '/' });
            }


            this.saveCookieChildrenDate = function () {
                var childDataDates = $('#childs-ages input').serialize();
                $.cookie('childDates', childDataDates, { expires: 100, path: '/' });
            }

            this.checkCookie = function (cookieName) {
                var cookieChilds = $.cookie(cookieName);
                if (typeof (cookieChilds) !== 'undefined' && cookieChilds != null) {
                    var cookieArr = cookieChilds.match(/\d\d\.\d\d\.\d\d\d\d/g);
                    return cookieArr;
                }
            }

            this.replaceCookieInput = function ($replace) {
                //console.log ("replace inputs");
                var cookieArr = _that.checkCookie('childDates');
                if (typeof (cookieArr) !== 'undefined' && cookieArr != null) {
                    $('.dropdown .datepicker input').each(function (i, value) {
                        //$replace.each( function(i,value ){
                        if (cookieArr.length - 1 >= i) { $(this).val(cookieArr[i]); }

                    });
                }
            }

            this.initCookieFiltersTailsPrice = function () {
                var cookie = $.cookie('FilterTailsPrice'),
                    cookieFTP = [];

                if (typeof (cookie) !== 'undefined' && cookie !== null) {
                    //initialization of Price -> family/person value is on PHP side
                    cookieFTP = JSON.parse(cookie);
                    if (checkCookievalue('as-thumbs')) {
                        $viewTypes.find('a').removeClass('active');
                        $viewTypes.find('a:last').addClass('active');
                        $('#search-results').addClass('as-thumbs').removeClass('as-list');

                    }
                    if (checkCookievalue('collapse')) {
                        $collapseFilterBtn.addClass('fexpand').removeClass('fcollapse');
                        $('.filters').removeClass('pernam');
                    }
                }

                function checkCookievalue(optionName) {
                    var cookieIndex = _.indexOf(cookieFTP, optionName);
                    if (cookieIndex !== -1) { return true; }
                    else { return false; }
                }

                function toggleCookieOption(optionName) {
                    var cookieIndex = _.indexOf(cookieFTP, optionName);
                    if (cookieIndex !== -1) {
                        cookieFTP.splice(cookieIndex, 1);
                    }
                    else {
                        cookieFTP.push(optionName);
                    }
                }

                function saveCookie() {
                    var cookieForSave = JSON.stringify(cookieFTP);
                    $.cookie('FilterTailsPrice', cookieForSave, { expires: 7, path: '/' });
                }
                function updateCookieTails() {
                    toggleCookieOption("as-thumbs"); saveCookie();
                }
                function updateCookieFilters() {
                    toggleCookieOption("collapse"); saveCookie();
                }

                function updateCookiePrice() {
                    toggleCookieOption("all"); saveCookie();
                }

                $viewTypes.on('change', updateCookieTails);
                $collapseFilterBtn.on('change', updateCookieFilters);
                $priceTypeInput.on('change', updateCookiePrice);
            }


            this.initChildsAgesDatepicker = function () {

                $('#childs-ages > div input').datepicker({
                    'language': 'pl',
                    'startView': 2,
                    'format': 'dd.mm.yyyy',
                    'startDate': '-16y',
                    'endDate': '-1d'


                }).on('changeDate', function () {

                    // cookie on change date
                    _that.saveCookieChildrenDate(this);
                    $(this).datepicker('hide');
                });

                $('#childs-ages').on('click', '.datekids-opener', function (ev) {
                    $(this).prev().datepicker('show');

                    ev.preventDefault();
                });
            }

            this.childAgesCallback = function ($select) {
                var that = this;

                var value = $select.val();
                if (value > 0) {
                    var fieldsCount = $('#childs-ages > div').length;


                    if (fieldsCount < value) {
                        for (var i = fieldsCount + 1; i <= value; i++) {
                            var $newInput = $('#childs-ages > div:last').clone();

                            //cookie set children
                            $newInput.find('input').datepicker({
                                'language': 'pl',
                                'format': 'dd.mm.yyyy',
                                'startView': 2,
                                'startDate': '-16y',
                                'endDate': '-1d'
                            }).on('changeDate', function () {
                                //  cookie on change date
                                _that.saveCookieChildrenDate();

                                $(this).datepicker('hide');
                            });

                            $newInput.find('label').text(search_childTitlePrefix + ' ' + i);

                            $newInput.insertAfter($('#childs-ages > div:last'));
                        }
                    }
                    else {
                        var deleteCount = fieldsCount - value;
                        while (deleteCount--) {
                            $('#childs-ages > div:last').remove();
                        }

                        // cookie save on select childre - to remove date
                        _that.saveCookieChildrenDate();
                    }

                    if (!$('#childs-ages').is(':visible')) {
                        _that.replaceCookieInput();

                        $('#childs-ages').slideDown();
                    }
                }
                else {
                    $('#childs-ages').slideUp();

                    //reset cookie
                    _that.resetCookie();

                }

                //set after creation

            }
            this.initParticipantsInput = function () {
                var that = this;

                this.initChildsAgesDatepicker();
                this.participantRecount();

                $('#childs-select, #adults-select').on('change', function (ev) {
                    that.participantRecount();
                    that.childAgesCallback($('#childs-select'));

                    //          commented to catch for history API
                    //          ev.stopPropagation();
                });

                $('.fParticipants > .dropdown-menu').on('click', '.childs-ages-commit', function (ev) {
                    $('.fParticipants > .dropdown-toggle').data('childs', $('#childs-select').val());
                    $('.fParticipants > .dropdown-toggle').data('adults', $('#adults-select').val());

                    $('.fParticipants > .dropdown-toggle').dropdown('toggle');

                    $form.submit();

                    ev.preventDefault();
                }).on('click', '.childs-ages-rollback', function (ev) {
                    $('#childs-select').val($('.fParticipants > .dropdown-toggle').data('childs')).change();
                    $('#adults-select').val($('.fParticipants > .dropdown-toggle').data('adults')).change();

                    $('.fParticipants > .dropdown-toggle').dropdown('toggle');

                    ev.preventDefault();
                });

                $('.fParticipants > .dropdown-menu').on('click', function (e) {
                    e.stopPropagation();
                });
            }

            this.participantRecount = function () {
                var label;
                var adultsLabel = _.template(search_labelAdults);
                var childLabel = _.template(search_labelChilds);

                label = adultsLabel({ count: $('#adults-select').val() });
                if ($('#childs-select').val() > 0) {

                    label += childLabel({ count: $('#childs-select').val() });
                }

                $('#participants-count').text(label);
            }

            this.initFilters = function () {
                $filtersList.on('click', 'a', function (ev) {
                    if (!$(this).parent().hasClass('active')) {
                        $filtersInput.val($(this).data('filter')).change();

                        $filtersList.children('li').removeClass('active');
                        $(this).parent().addClass('active');
                    }

                    ev.preventDefault();
                });
            }

            this.initOrderInput = function () {
                $orderList.on('click', 'a', function (ev) {
                    var $this = $(this);

                    $orderList.find('li').removeClass('active');
                    $this.parent().addClass('active');

                    $orderInput.val($this.data('value')).change();
                    $orderOpener.text($this.data('label'));

                    ev.preventDefault();
                });

                $orderList.find('a.active').click();
            }

            this.initPriceTypeInput = function () {
                $priceTypes.on('click', 'a', function (ev) {
                    var $this = $(this);

                    $priceTypes.find('a').removeClass('active');
                    $this.addClass('active');

                    $priceTypeInput.val($this.data('value')).change();

                    ev.preventDefault();
                });

                if ($priceTypeInput.val() === "person") {
                    $('.pt_perperson a').addClass('active');
                }
                else {
                    $('.pt_perfamily a').addClass('active');
                }

                //$priceTypes.find('a[data-value="' + $priceTypeInput.val() + '"]').click();

            }

            this.initViewTypeInput = function () {
                $viewTypes.on('click', 'a', function (ev) {
                    var $this = $(this);

                    $viewTypes.find('a').removeClass('active');
                    $this.addClass('active').change(); //change for cookieFiltersPriceTails

                    $('#search-results').toggleClass('as-thumbs as-list');

                    ev.preventDefault();
                });
            }

            this.initValidation = function () {
                var that = this;

                $form.on('change', ':input', function (ev) {
                    that.validate();
                });
            }

            this.validate = function () {
                var params = _.reject($form.serializeArray(), function (val) {
                    return (val.name === 'page');
                });

                if (validationXhr) {
                    validationXhr.abort();
                }

                if ($("#event-types").find("input:checked").val() === EVENT_TYPE_HOTELS) {
                    //hotels prevent
                    return true;
                }

                if (validationUrl) {
                    validationXhr = $.getJSON(validationUrl, params, function (data) {
                        validationXhr = null;

                        $destinationSelect.trigger('searchmobile.validate', [data.mobileSelectOptions]);
                        $destinationSelect.trigger('search.validate', [data.destinations]);
                        $departureSelect.trigger('search.validate', [data.from]);

                        if ($('#foods-select').length) {
                            $('#foods-select').trigger('search.validate', [data.foods]);
                        }

                        $destinationSelect.trigger('searchmobile_afterajax.validate');
                    });
                }
            }

            // custom calendar datarange
            this.initDateInputs2 = function (options, autoSubmit) {
                var autoSubmit = autoSubmit || false;
                //options != undefined means invoke calendar for search form

                var endDateRange = moment($mainDate.data('enddaterange'), "DD-MM-YYYY"),
                    today = moment().hour(0).minute(0).second(0),
                    from = moment($mainDate.data('from'), "DD-MM-YYYY"),
                    to = moment($mainDate.data('to'), "DD-MM-YYYY"),
                    calMonthView = moment($mainDate.data('from'), "DD-MM-YYYY").add("month", 1),
                    calMonthViewTo = moment($mainDate.data('to'), "DD-MM-YYYY").add("month", 1),
                    fromClickedDate = moment($mainDate.data('from'), "DD-MM-YYYY"),
                    toClickedDate = moment($mainDate.data('enddaterange'), "DD-MM-YYYY"),
                    arrowDirecFrom = "right",
                    arrowBufferFrom = "right",
                    arrowDirecTo = "right",
                    arrowBufferTo = "right",
                    isSearchBig = $('.searchbig').length > 0,
                    that = this,
                    calClickRange = 13,
                    calMinSetRange = 1,
                    firstClickDateTo = true,
                    setFirstClickToOneDay = false,
                    calState = ["leftReady"];

                function convertDateSearchBig(whichInput) {
                    if (whichInput === "from") {
                        var dateFull = ($mainDate.data('from')).split('.');
                    }
                    else {
                        var dateFull = ($mainDate.data('to')).split('.');
                    }

                    var dateShort = dateFull[0] + "." + dateFull[1];

                    return dateShort;

                }

                function language(lang) {
                    switch (lang) {
                        case "ru": return {
                            daysMin: ["Вск", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Суб"],
                            months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
                            monthsShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
                        };
                        case "pl": return {
                            daysMin: ["N", "Pn", "Wt", "Śr", "Cz", "Pt", "So"],
                            months: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
                            monthsShort: ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"]
                        };
                        case "en": return {
                            daysMin: ["S", "M", "T", "W", "T", "F", "S"],
                            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                        };
                        case "lt": return {
                            daysMin: ["Sek", "Pir", "Ant", "Tre", "Ket", "Pen", "Šeš"],
                            months: ["Sausis", "Vasaris", "Kovas", "Balandis", "Gegužė", "Birželis", "Liepa", "Rugpjūtis", "Rugsėjis", "Spalis", "Lapkritis", "Gruodis"],
                            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                        };
                    }
                }

                function renderLabels(clearLabels) {
                    if (typeof clearLabels === 'undefined') {
                        switch (calState[0]) {
                            case 'leftReady':
                                //$dateFromInput.focus();
                                $dateFromInput.parent().addClass('placeholder-focus').removeClass('lightholder').removeClass('placeholder-hide');
                                $dateToInput.parent().addClass('lightholder');
                                $('.infield-from,.infield-to').removeClass('blocked');
                                //exception for search results
                                $('#main').find('.searchbig .fRow > label:first').addClass('moveTerm');


                                $dateToInput.parent().removeClass('placeholder-focus').addClass('placeholder-hide').addClass('lightholder');
                                break;
                            case "rightReady":
                                //$dateToInput.focus();
                                $dateToInput.parent().addClass('placeholder-focus').removeClass('lightholder').removeClass('placeholder-hide');
                                $dateFromInput.parent().addClass('placeholder-focus').addClass('lightholder').removeClass('placeholder-hide');
                                $('.infield-from,.infield-to').removeClass('blocked');
                                //exception for search results
                                $('#main').find('.searchbig .fRow > label:first').addClass('moveTerm');
                                break;
                            case "blocked":
                                $dateInputs.parent().addClass('placeholder-focus').removeClass('lightholder').removeClass('placeholder-hide');
                                $('.infield-from,.infield-to').addClass('blocked');
                                //exception for search results
                                $('#main').find('.searchbig .fRow > label:first').addClass('moveTerm');

                                $dateFromInput.parent().removeClass('placeholder-focus').addClass('placeholder-hide').addClass('lightholder');
                        }
                    }
                    else {
                        $dateToInput.parent().removeClass('placeholder-focus').addClass('placeholder-hide').addClass('lightholder');
                        $dateFromInput.parent().removeClass('placeholder-focus').addClass('placeholder-hide').addClass('lightholder');
                        if ($('.searchbig').length > 0) { $('.infield-from,.infield-to').removeClass('blocked'); }
                        //for search results
                        $('#main').find('.fRow > label:first').removeClass('moveTerm');
                    }
                }

                function changeDateToAfterFirstClick() {
                    if ($("#event-types").find(".checked input").val() === EVENT_TYPE_HOTELS) { setFirstClickToOneDay = true; }

                    if (!isSearchBig && !setFirstClickToOneDay) {

                        var todayOneMonthAfter = moment().hour(0).minute(0).second(0).add("month", 1);
                        var firstChooseDate = moment($('#fDate-cal__from').DatePickerGetDate()[0]);

                        if (firstChooseDate.isAfter(today)) {
                            if (endDateRange.isBefore(firstChooseDate.add('month', 1), 'month')) {

                                firstChooseDate.subtract('month', 1);
                            }
                            $mainDate.data('to', firstChooseDate.format("DD.MM.YYYY"));
                            $('#fDate-cal__to').DatePickerSetDate(moment(firstChooseDate.toDate()), true);
                        }
                        else {
                            $mainDate.data('to', todayOneMonthAfter.format("DD.MM.YYYY"));
                            $('#fDate-cal__to').DatePickerSetDate(moment(todayOneMonthAfter.toDate()), true);
                        }

                        //global don't need to convert from HTML data every time;
                        toClickedDate = firstChooseDate.clone();

                        initBlockCalendar();
                        $('input[name="date_to"]').val($mainDate.data('to'));
                        $dateToInput.val($mainDate.data('to')).change();
                    }
                    if (!isSearchBig && setFirstClickToOneDay) {

                        var todayOneDayAfter = moment().hour(0).minute(0).second(0).add("day", 1);
                        var firstChooseDateHotels = moment($('#fDate-cal__from').DatePickerGetDate()[0]);

                        if (firstChooseDateHotels.isAfter(today)) {
                            if (endDateRange.isBefore(firstChooseDateHotels.add('day', 1), 'day')) {

                                firstChooseDateHotels.subtract('day', 1);
                            }
                            $mainDate.data('to', firstChooseDateHotels.format("DD.MM.YYYY"));
                            $('#fDate-cal__to').DatePickerSetDate(moment(firstChooseDateHotels.toDate()), true);
                        }
                        else {
                            $mainDate.data('to', todayOneDayAfter.format("DD.MM.YYYY"));
                            $('#fDate-cal__to').DatePickerSetDate(moment(todayOneDayAfter.toDate()), true);
                        }

                        //global don't need to convert from HTML data every time;
                        toClickedDate = firstChooseDateHotels.clone();

                        initBlockCalendar();
                        $('input[name="date_to"]').val($mainDate.data('to'));
                        $dateToInput.val($mainDate.data('to')).change();
                    }

                }

                $('input[name="date_from"],input[name="date_to"]').on('change', function (ev) {

                    //highlights dates in calendar and validate
                    if ($(ev.target).is('#date_from')) {
                        $('#fDate-cal__from').DatePickerSetDate(moment($mainDate.data('from'), "DD.MM.YYYY").toDate());
                    }
                    else {
                        $('#fDate-cal__to').DatePickerSetDate(moment($mainDate.data('to'), "DD.MM.YYYY").toDate());
                    }

                    blockCalendar(ev);

                    ev.preventDefault();
                    that.validate();
                }).on('click', function (ev) {
                    // ev.stopPropagation();
                });

                $('.fDate-cal__from .popover-close,.fDate-cal__to .popover-close').on('click.calendar', function (ev) {
                    //                $dateFromInput.val( moment ( $daterangeOpener.data('from') ).format("DD.MM.YYYY") ).change();
                    //                $dateToInput.val( moment ( $daterangeOpener.data('to') ).format("DD.MM.YYYY") ).change();
                    //
                    $(this).dropdown('toggle');
                    renderLabels(true);
                    //                renderLabels(true);
                    //                that.validate();
                    ev.preventDefault();
                });
                $dateToInput.one('click.calendar', changeDateToAfterFirstClick);


                //        $calRange.on('rotate.calendar', function() {
                //            calState    =   calState.concat( calState.shift() );
                //
                //            renderLabels();
                //        })

                $(document).on('click.dropdown-menu.data-api', function () {
                    renderLabels(true);
                });

                //ON SEARCH FORM

                //        $mainDate.on('click.infield', function (ev) {
                //            if ( $("#date-range").find('.placeholder-focus').length > 0 ) {
                //                calState[0] = "rightReady";
                //                renderLabels();
                //
                //                renderLabels(true);
                //            }
                //            else{
                //                renderLabels();
                //            }
                //        });

                $dateInputs.on('click.infield', function (ev) {
                    if ($(this).is('#date_from')) {
                        calState[0] = "leftReady";
                        renderLabels();
                    }
                    else {
                        calState[0] = "blocked";
                        renderLabels();
                    }

                });

                /*
                $('.datepicker').find(".datepickerDisabled").on('click', function (ev) {

                    console.log ( calState[0], "ten stan" );
                    if ( calState[0] === "blocked") {
                        $.when( $calRange.trigger('rotate.calendar') ).done(function(){
                            $('#render-cal').DatePickerSetDate( $('#render-cal').DatePickerGetDate()[0] );
                        });
                    }
                });
                */

                //render and refresh calendar after blocked mode

                function from_date() {
                    var today = new Date();
                    var tommorow = new Date();
                    tommorow.setMonth(today.getMonth() + 1);
                    return ('0' + tommorow.getDate()).slice(-2) + '.' + ('0' + tommorow.getMonth()).slice(-2) + '.' + tommorow.getFullYear();
                }

                function to_date(range) {
                    var today = new Date();
                    var tommorow = new Date();

                    tommorow.setMonth(today.getMonth() + 1);
                    tommorow.setDate(to.getDate() + range);

                    return ('0' + tommorow.getDate()).slice(-2) + '.' + ('0' + tommorow.getMonth()).slice(-2) + '.' + today.getFullYear();
                }

                //$mainDate.data('to',  to.toDate() );
                //$daterangeDropdown.data('from', from.toDate() );

                $('#fDate-cal__from').DatePicker({
                    showOn: 'click',
                    inline: true,
                    starts: 1,
                    //date: [from.toDate()],
                    calendars: 2,
                    locale: language($locale),
                    mode: 'single',
                    current: calMonthView.toDate(),

                    onRenderCell: function (h, d) {
                        var endClass = "",
                            disa = false;
                        if (endDateRange.isBefore(d)) { endClass = "datepickerEndSeason"; disa = true; }
                        if (today.isAfter(d, "day")) { endClass = "datepickerPast "; disa = true; }
                        //                if  ( moment ( this.date[0] ).isSame (d,"days")) { endClass = "datepickerLeft"; }
                        //                if  ( moment ( this.date[1] ).isSame (d,"days")) { endClass = "datepickerRight"; }
                        //                if  ( moment ( this.date[0] ).isAfter (d,"days") &&  (calState[0] === "rightReady" || calState[0] === "blocked" ) ) { disa = true; }
                        //                if  ( moment ( this.date[1] ).isBefore (d,"days") && calState[0] === "blocked" ) { disa = true; }
                        //                if  ( calState[0] == "rightReady"  ) { endClass = endClass + " " + "datepickerHoverTo"; }
                        //                if  ( calState[0] == "blocked"  ) { endClass = endClass + " " + "datepickerHoverNone"; }
                        //
                        return {
                            selected: false,
                            disabled: disa,
                            className: endClass
                        };
                    },
                    onChange: calClickChangeFrom
                });
                //

                $('#fDate-cal__to').DatePicker({
                    showOn: 'click',
                    inline: true,
                    starts: 1,
                    //date: [to.toDate()],
                    calendars: 2,
                    locale: language($locale),
                    mode: 'single',
                    current: calMonthViewTo.toDate(),

                    onRenderCell: function (h, d) {
                        var endClass = "",
                            disa = false;

                        if (endDateRange.isBefore(d)) { endClass = "datepickerEndSeason"; disa = true; }
                        if (today.isAfter(d, "day")) { endClass = "datepickerPast "; disa = true; }
                        if (today.isSame(d, "day")) { endClass = "datepickerDisabled"; }
                        //                if  ( moment ( this.date[0] ).isSame (d,"days")) { endClass = "datepickerLeft"; }


                        if (moment($('input[name=date_from]').val(), "DD-MM-YYYY").isSame(d, "days")) { disa = true; }
                        //                if  ( moment ( $('input[name=date_from]').val(), "DD-MM-YYYY").add("day",1).isSame (d,"days")) { disa = true; }

                        //if ( Number( $('#autosuggest-input').data('hotels-max-offer')) === 28 &&
                        //    moment ( $('input[name=date_from]').val(), "DD-MM-YYYY").add("day",28).isBefore (d,"days") ){
                        //    disa = true;
                        //}
                        //                if  ( moment ( this.date[1] ).isSame (d,"days")) { endClass = "datepickerRight"; }
                        if (fromClickedDate.isAfter(d, "days")) { disa = true; }
                        //                if  ( moment ( this.date[1] ).isBefore (d,"days") && calState[0] === "blocked" ) { disa = true; }
                        //                if  ( calState[0] == "rightReady"  ) { endClass = endClass + " " + "datepickerHoverTo"; }
                        //                if  ( calState[0] == "blocked"  ) { endClass = endClass + " " + "datepickerHoverNone"; }

                        return {
                            selected: false,
                            disabled: disa,
                            className: endClass

                        };
                    },
                    onChange: calClickChangeTo

                });

                //init dates from validate inputs (backend) to alias inputs
                $('#fDate-cal__from').DatePickerSetDate(moment($mainDate.data('from'), "DD.MM.YYYY").toDate());
                $('#fDate-cal__to').DatePickerSetDate(moment($mainDate.data('to'), "DD.MM.YYYY").toDate());
                if (isSearchBig && $(window).width() > 767) {

                    var aliasDateFrom = convertDateSearchBig("from");
                    var aliasDateTo = convertDateSearchBig("to");

                    $dateToInput.val(aliasDateTo);
                    $dateFromInput.val(aliasDateFrom);

                }
                initBlockCalendar();

                $('#fDate-cal__from,#fDate-cal__to').find('.datepicker').on("click.calendar", "thead i", blockCalendar);

                function initBlockCalendar(jump) {

                    var dateFromView = moment($('#fDate-cal__from').DatePickerGetDate()[2]);
                    var dateToView = moment($('#fDate-cal__to').DatePickerGetDate()[2]);

                    if (!jump) {
                        //not check after add one month ( auto jump )
                        eachCalendar($('#fDate-cal__from'), dateFromView);
                    }

                    eachCalendar($('#fDate-cal__to'), dateToView);

                    function eachCalendar($el, dateView) {
                        if (today.isAfter(dateView, "year") && today.isAfter(dateView.subtract("month", 2), "month")) {
                            $el.find('.datepickerBlock:first .datepickerGoPrev').addClass("icon-arrow-none");
                        }
                        if (endDateRange.isBefore(dateView, "year") && endDateRange.isBefore(dateView.add("month", 2), "month")) {
                            $el.find('.datepickerBlock:last .datepickerGoNext').addClass("icon-arrow-none");
                        }
                    }

                }

                function blockCalendar(ev) {
                    /*jshint validthis: true */
                    var $el = $(this);

                    if ($(this).closest('.datepicker').parent().is('#fDate-cal__from')) {
                        if ($(this).hasClass('icon-arrow-right')) {
                            arrowDirecFrom = "right";
                        }
                        else {
                            arrowDirecFrom = "left";
                        }
                    }
                    else {
                        if ($(this).hasClass('icon-arrow-right')) {
                            arrowDirecTo = "right";
                        }
                        else {
                            arrowDirecTo = "left";
                        }
                    }

                    var dateFromView = moment($('#fDate-cal__from').DatePickerGetDate()[2]);
                    var dateToView = moment($('#fDate-cal__to').DatePickerGetDate()[2]);

                    if ($(this).closest('.datepicker').parent().is('#fDate-cal__from')) {
                        eachCalendarBlock(arrowDirecFrom, arrowBufferFrom, dateFromView);
                        arrowBufferFrom = arrowDirecFrom;
                    }
                    else {
                        eachCalendarBlock(arrowDirecTo, arrowBufferTo, dateToView);
                        arrowBufferTo = arrowDirecTo;
                    }

                    function eachCalendarBlock(arrowDirect, arrowBuffer, dateView) {


                        if ((arrowDirect === "right" && arrowBuffer === "right") || (arrowDirect === "right" && arrowBuffer === "left")) {
                            if (endDateRange.isBefore(dateView.add("month", 2), "month")) {
                                $el.parent().addClass("icon-arrow-none");
                            }
                            else {
                                $el.closest('tbody').find('.datepickerBlock:first .datepickerGoPrev').removeClass("icon-arrow-none");
                            }
                        }

                        if ((arrowDirect === "left" && arrowBuffer === "left") || (arrowDirect === "left" && arrowBuffer === "right")) {
                            if (today.isAfter(dateView.subtract("month", 3), "month")) {
                                $el.parent().addClass("icon-arrow-none");
                            }
                            else {
                                $el.closest('tbody').find('.datepickerBlock:last .datepickerGoNext').removeClass("icon-arrow-none");
                            }
                        }

                        if (arrowDirect === "left" && arrowBuffer === "right") {
                            $el.closest('tbody').find('.datepickerBlock:last .datepickerGoNext').removeClass("icon-arrow-none");

                        }
                        //console.log ( dateView.format('MM-YYYY'),arrowDirecFrom,arrowBufferFrom );
                    }
                }


                function calClickChangeFrom(dates, el) {
                    var clickedDate = moment($('#fDate-cal__from').DatePickerGetDate()[0]);
                    fromClickedDate = clickedDate.clone();

                    //refresh calendar without change event
                    if (clickedDate.isSame(toClickedDate) || clickedDate.isAfter(toClickedDate)) {

                        var updateDateToCalendar = clickedDate.clone();

                        if (endDateRange.isBefore(updateDateToCalendar.add('month', 1))) {
                            updateDateToCalendar.subtract('month', 1);
                            toClickedDate = updateDateToCalendar.clone();
                        }

                        toClickedDate = updateDateToCalendar.clone();

                        $mainDate.data('to', updateDateToCalendar.format("DD.MM.YYYY"));
                        toInputAlias();

                        $('input[name="date_to"]').val($mainDate.data('to'));
                        $('#fDate-cal__to').DatePickerSetDate(moment($mainDate.data('to'), "DD.MM.YYYY").toDate(), true);
                        initBlockCalendar(true);
                    }
                    else {
                        $('#fDate-cal__to').DatePickerSetDate(moment($mainDate.data('to'), "DD.MM.YYYY").toDate());

                    }
                    //refresh second calendar
                    $mainDate.data('from', clickedDate.format("DD.MM.YYYY"));

                    renderLabels(true);
                    $('#fDate-open__from').dropdown('toggle');
                    //alias input
                    fromInputAlias();

                    //validate real input
                    $('input[name="date_from"]').val($mainDate.data('from')).change();
                }
                function calClickChangeTo(dates, el) {
                    var clickedDate = moment($('#fDate-cal__to').DatePickerGetDate()[0]);
                    toClickedDate = clickedDate.clone();

                    $mainDate.data('to', clickedDate.format("DD.MM.YYYY"));

                    renderLabels(true);
                    $('#fDate-open__to').dropdown('toggle');

                    toInputAlias();

                    //validate real input
                    $('input[name="date_to"]').val($mainDate.data('to')).change();
                }

                function fromInputAlias() {
                    if (isSearchBig && $(window).width() > 767) {
                        var aliasDate = convertDateSearchBig("from");
                        $dateFromInput.val(aliasDate);
                        $form.submit();
                    }
                    else {
                        $dateFromInput.val($mainDate.data('from'));
                    }

                }

                function toInputAlias() {
                    //alias inputs
                    if (isSearchBig && $(window).width() > 767) {
                        var aliasDate = convertDateSearchBig("to");
                        $dateToInput.val(aliasDate);
                        $form.submit();
                    }
                    else {
                        $dateToInput.val($mainDate.data('to'));
                    }
                }

                function changeCalDropdown(ev, el) {
                    $daterangeOpener.dropdown('toggle');
                }
            }

            this.initFiltersToggle = function () {
                $(window).on('load', function () {
                    $(window).on('resize.searchfilters', showHideInputs);
                    $(window).on('scroll.affix.data-api', showHideInputs);
                });



                $collapseFilterBtn.on('click.searchfilters', fToggle);
                if ($(document).width() > 641) {
                    $('#filters-txt').hide();

                }

                function showHideInputs() {

                    //if  ( $(document).width() < 730  ) { return true; }

                    var $panel = $('#search-form').width(),
                        $elem = $('.fRow:first').width(),
                        maxElem = $('.searchbig .fRow').length,
                        maxInline = Math.floor($panel / $elem),
                        elemVisible = $('.searchbig .fRow').filter(function () {
                            return $(this).css('display') !== 'none';
                        }).length;

                    //console.log ( maxInline,maxElem,$panel,$elem,elemVisible );
                    if ($(".filters").hasClass('affix-top') && $(document).width() > 730) {
                        $('.searchbig .fRow').show();
                        $('#filters-txt').hide();

                    }
                    else {
                        if (elemVisible > maxInline && !$(".filters").hasClass('pernam') && $(document).width() > 730) {
                            //$('.searchbig .fRow:nth-of-type('+maxInline+')').nextAll().hide();
                            $('.searchbig .fRow').hide();
                            $collapseFilterBtn.addClass('fexpand');
                            $collapseFilterBtn.removeClass('fcollapse');

                            if ($(this).hasClass('fexpand')) {
                                //    $('#filters-txt').text( $('#filters-txt').data('filtercollapse') ).show();
                            }
                            else {
                                $('#filters-txt').text($('#filters-txt').data('filterexpand')).show();
                            }

                        }
                        else {
                            //$('.fRow:nth-of-type('+(maxInline+1)+')').prevAll().show();

                            //$btnFilters.addClass('fcollapse');
                            //$btnFilters.removeClass('fexpand');

                        }
                    }

                }
                function fToggle(ev) {
                    /*jshint validthis: true */
                    ev.preventDefault();
                    var $filters = $('.filters');

                    //add pernam
                    if ($filters.hasClass('affix')) {
                        if ($filters.hasClass('pernam')) { $filters.removeClass('pernam'); }
                        else { $filters.addClass('pernam'); }
                    }

                    if ($(this).hasClass('fexpand')) {
                        $('.searchbig .fRow').show();

                        if ($(document).width() > 640) {
                            $('#filters-txt').text($('#filters-txt').data('filtercollapse')).hide();

                        }

                        $(this).addClass('fcollapse');
                        $(this).removeClass('fexpand');
                    }
                    else {
                        //$(window).trigger('resize.searchfilters');

                        $('.searchbig .fRow').hide();

                        $('#filters-txt').text($('#filters-txt').data('filterexpand')).show();
                        $(this).addClass('fexpand');
                        $(this).removeClass('fcollapse');
                    }

                    $(this).change();

                }
            }

            this.initScroll = function (dropdownSelector) {
                if (typeof isOldIE === 'undefined' || !isOldIE) {
                    var $dropdown = $(dropdownSelector);

                    $(document).on('click.dropdown.data-api,', '[data-toggle=dropdown],[class=search-combobox]', function () {
                        if ($dropdown.is(':visible')) {
                            if (typeof $dropdown.data('jsp') != 'object') {
                                $dropdown.jScrollPane({
                                    showArrows: true,
                                    horizontalGutter: 30,
                                    verticalGutter: 30,
                                    mouseWheelSpeed: 30,
                                    contentWidth: '0px'
                                });

                                $dropdown.on('click', '.jspVerticalBar', function (ev) {
                                    ev.stopPropagation();
                                });
                            }
                            else {
                                $dropdown.data('jsp').reinitialise();
                            }

                            $dropdown.height($dropdown.data('jsp').getContentHeight());
                            $dropdown.data('jsp').reinitialise();
                        }
                    });

                    $dropdown.on('reinit.scrollpane', function () {
                        // not DRY :(
                        if ($dropdown.is(':visible')) {
                            if (typeof $dropdown.data('jsp') != 'object') {
                                $dropdown.jScrollPane({
                                    showArrows: true,
                                    horizontalGutter: 30,
                                    verticalGutter: 30,
                                    mouseWheelSpeed: 30,
                                    contentWidth: '0px'
                                });

                                $dropdown.on('click', '.jspVerticalBar', function (ev) {
                                    ev.stopPropagation();
                                });

                            }
                            else {
                                $dropdown.data('jsp').reinitialise();
                            }

                            $dropdown.height($dropdown.data('jsp').getContentHeight());
                            $dropdown.data('jsp').reinitialise();
                        }
                    });

                    $dropdown.on('reposition.scrollpane', function (ev, data) {
                        $dropdown.data('jsp').scrollToElement(data.element);
                    });
                }

            }
        };