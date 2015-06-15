function Itaka (baseToursUrl, baseCountriesUrl) {
	this._baseToursUrl = baseToursUrl;
	this._baseCountriesUrl = baseCountriesUrl;
};

Itaka.prototype.getTours = function (filter, currpage, pricetype, eventtype, date_from, date_to, duration, adults,
	childs, child_age , standard, price, promotions, grade, order) {
	var baseUrl = this._baseToursUrl;
	filter = typeof filter !== 'undefined' ? filter : '';
	currpage = typeof currpage !== 'undefined' ? currpage : 1;
	pricetype = typeof pricetype !== 'undefined' ? pricetype : 'person';
	eventtype = typeof eventtype !== 'undefined' ? eventtype : 0;
	date_from = typeof date_from !== 'undefined' ? date_from : '';
	date_to = typeof date_to !== 'undefined' ? date_to : '';
	duration = typeof duration !== 'undefined' ? duration : '';
	adults = typeof adults !== 'undefined' ? adults : 2;
	childs = typeof childs !== 'undefined' ? childs : 0;
	child_age = typeof child_age !== 'undefined' ? child_age : ["12.06.2010"];
	standard = typeof standard !== 'undefined' ? standard : '';
	price = typeof price !== 'undefined' ? price : '';
	promotions = typeof promotions !== 'undefined' ? promotions : ["itakihit"];
	grade = typeof grade !== 'undefined' ? grade : '';
	order = typeof order !== 'undefined' ? order : "recommended|asc";

	 $.ajax({
		url: baseUrl,
		type: "GET",
		dataType: 'jsonp',
		mimeType: 'xhr',
		jsonp: false,
		jsonpCallback: 'jQuery.parseJSON',
		data: { filter: filter, currpage: currpage, pricetype: pricetype, eventtype: eventtype, date_from: date_from, date_to: date_to, duration: duration, adults: adults, 
		childs: childs, child_age: child_age, standard: standard, price: price, promotions: promotions, grade: grade, order: order },
		success: function (data){
			console.log(data);
		},
		error: function (xhr, status, error){
			  var r = jQuery.parseJSON(xhr.responseText);
			  console.log(r);
		},
	 	always: function (data){
	 		console.log(data);
	 	}})
};


$(function(){
	var itaka = new Itaka("http://www.itaka.pl/ru/strony/4466.php", "");
	itaka.getTours();
})