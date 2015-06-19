  /**
 * User: doogi
 * Date: 16.04.13
 * Time: 17:56
 */

        $(function () {
            if (typeof SearchForm !== 'undefined') {
                var searchForm = new SearchForm($('#search-form'), search_validateUrl);


                //searchForm.initDateButton();
                //searchForm.initDateInputs(true);

                //searchForm.initCookieFiltersTailsPrice();
                //searchForm.initCookieChildrenDate();

                //searchForm.initDateInputs2(true, true);
                //searchForm.dateShowWatcher();

                //searchForm.initDropdownInput($('#duration-select'));
                //searchForm.initDropdownSelect($('#duration-select'));

                // ========================
                /**
                 * @todo: Alias select switch
                 */
                //        searchForm.initDropdownInput($('#destination-select'), function() {
                //            if(search_staticSelectedDestination) {
                //                $('#search-form').data('block-ajax', 'true').attr('action', search_mainSearchPageUrl);
                //            }
                //        });
                //        searchForm.initDropdownInput($('#departure-select'));
                //        searchForm.initDropdownInput($('#foods-select'));
                //        searchForm.initDropdownInput($('#category-select'));



                searchForm.initDropdownSelect($('#destination-select'), true, true);
                //searchForm.initDropdownSelect($('#departures-select'));

                if (!$(".impt11").length > 0) {

                  //  searchForm.initDropdownSelect($('#foods-select'));
                  //  searchForm.initDropdownSelect($('#standard-select'), false, false, '');
                  //  searchForm.initDropdownSelect($('#price-select'), false, false, '');
                  //  searchForm.initDropdownSelect($('#categories-select'));
                  //  searchForm.initDropdownSelect($('#promotions-select'));
                  //  searchForm.initDropdownSelect($('#easements-select'));
                  //  searchForm.initDropdownSelect($('#grade-select'));


                }
                else {

                 //   searchForm.initDropdownSelect($('#activity-select'));
                 //   searchForm.initDropdownSelect($('#difficulty-select'));
                }

              //  searchForm.initDropdownSelect($('#order-select'), false, false, null, true);
                //searchForm.initDropdownMultiselect($('#destination-select'));
                //searchForm.initDropdownMultiselect($('#departure-select'));
                //searchForm.initDropdownMultiselect($('#foods-select'));
                //searchForm.initDropdownMultiselect($('#category-select'));

                // ======================

                //searchForm.initParticipantsInput();

                //searchForm.initFilters();
                //searchForm.initOrderInput();
                //searchForm.initViewTypeInput();
                //searchForm.initPriceTypeInput();

                //$('#search-form').multiselectMobileValidation();

                //searchForm.initValidation();
                //searchForm.validate();

                //searchForm.initFiltersToggle();



                $('.fTo').multiselectExtend();

                $('.fTo .selectable').width(140);

            }
        });