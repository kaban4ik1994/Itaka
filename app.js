Date.prototype.addDays = function (days) {
    this.setDate(this.getDate() + parseInt(days));
    return this;
}

Date.prototype.getFormattedDate = function getFormattedDate() {
    var year = this.getFullYear();
    var month = (1 + this.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    var day = this.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return day + '.' + month + '.' + year;
}

Array.prototype.last = function () {
    return this[this.length - 1];
}

Array.prototype.first = function () {
    return this[0];
}

function Itaka(baseToursUrl, baseCountriesUrl) {
    this._baseToursUrl = baseToursUrl;
    this._baseCountriesUrl = baseCountriesUrl;
};
//http://www.itaka.pl/ajax/search/?filter=&currpage=1&pricetype=person&eventtype=0&date_from=17.06.2015&date_to=17.12.2015&duration=&adults=2&childs=0&child_age%5B%5D=17.06.2010&standard=&price=&grade=&order=recommended%7Casc
Itaka.prototype.getToursAsync = function (filter, currpage, pricetype, eventtype, date_from, date_to, duration, adults,
	childs, child_age, standard, price, promotions, grade, order) {
    var currentTime = new Date();
    var baseUrl = this._baseToursUrl;
    filter = typeof filter !== 'undefined' ? filter : '';
    currpage = typeof currpage !== 'undefined' ? currpage : 1;
    pricetype = typeof pricetype !== 'undefined' ? pricetype : 'person';
    eventtype = typeof eventtype !== 'undefined' ? eventtype : 0;
    date_from = typeof date_from !== 'undefined' ? date_from : currentTime.getFormattedDate();
    currentTime.addDays(300);
    date_to = typeof date_to !== 'undefined' ? date_to : currentTime.getFormattedDate();
    duration = typeof duration !== 'undefined' ? duration : '';
    adults = typeof adults !== 'undefined' ? adults : 2;
    childs = typeof childs !== 'undefined' ? childs : 0;
    child_age = typeof child_age !== 'undefined' ? child_age : ["17.06.2010"];
    standard = typeof standard !== 'undefined' ? standard : '';
    price = typeof price !== 'undefined' ? price : '';
    promotions = typeof promotions !== 'undefined' ? promotions : ["itakihit"];
    grade = typeof grade !== 'undefined' ? grade : '';
    order = typeof order !== 'undefined' ? order : "recommended|asc";
    return $.ajax({
        url: baseUrl,
        type: "GET",
        dataType: 'json',
        data: {
            filter: filter, currpage: currpage, pricetype: pricetype, eventtype: eventtype, date_from: date_from, date_to: date_to, duration: duration, adults: adults,
            childs: childs, child_age: child_age, standard: standard, price: price, promotions: promotions, grade: grade, order: order
        }
    });
};

Itaka.prototype.getCountriesAsync = function (filter, currpage, pricetype, eventtype, date_from, date_to, duration, adults,
	childs, child_age, standard, price, promotions, grade, order) {
    var currentTime = new Date();
    var baseUrl = this._baseCountriesUrl;
    filter = typeof filter !== 'undefined' ? filter : '';
    currpage = typeof currpage !== 'undefined' ? currpage : 1;
    pricetype = typeof pricetype !== 'undefined' ? pricetype : 'person';
    eventtype = typeof eventtype !== 'undefined' ? eventtype : 0;
    date_from = typeof date_from !== 'undefined' ? date_from : currentTime.getFormattedDate();
    currentTime.addDays(300);
    date_to = typeof date_to !== 'undefined' ? date_to : currentTime.getFormattedDate();
    duration = typeof duration !== 'undefined' ? duration : '';
    adults = typeof adults !== 'undefined' ? adults : 2;
    childs = typeof childs !== 'undefined' ? childs : 0;
    child_age = typeof child_age !== 'undefined' ? child_age : ["17.06.2010"];
    standard = typeof standard !== 'undefined' ? standard : '';
    price = typeof price !== 'undefined' ? price : '';
    promotions = typeof promotions !== 'undefined' ? promotions : ["itakihit"];
    grade = typeof grade !== 'undefined' ? grade : '';
    order = typeof order !== 'undefined' ? order : "recommended|asc";
    return $.ajax({
        url: baseUrl,
        type: "GET",
        dataType: 'json',
        data: {
            filter: filter, currpage: currpage, pricetype: pricetype, eventtype: eventtype, date_from: date_from, date_to: date_to, duration: duration, adults: adults,
            childs: childs, child_age: child_age, standard: standard, price: price, promotions: promotions, grade: grade, order: order
        }
    });
};

$(function () {

    var page = 1;
    var itaka = new Itaka("http://localhost:28692/api/ItakaHit", "http://localhost:28692/api/Strony");
    showMoreTours(page);

    $('#load-more-offers').click(function () {
        $('#load-more-offers').css('display', 'none');
        $('#results-loading').css('display', '');
        page += 1;
        showMoreTours(page);
    });



    function showMoreTours(page) {
        itaka.getToursAsync(undefined, page).then(function(data) {
            data.results.forEach(function(element) {
                var tempArray = element.destination.split('\\');
                element.destination = tempArray.last();
                element.title = element.title.split('(').first();
            });
            if (!data.has_more) {
                $('#load-more-offers').remove();
            }
            $('#hotelSlider').append(
                $('#hotelTemplate').render(data.results));
            $("img.hotel_img").lazyload();
            $('#results-loading').css('display', 'none');
            $('#load-more-offers').css('display', '');
        });
    };
})