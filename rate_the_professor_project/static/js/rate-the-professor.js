// -------- TOGGLE RATING FORM VISIBILITY ----------------------------//
$( "#edit_rating_btn" ).click(function() {
	$( "#rating_form_div" ).slideToggle( "slow" );
});

// ------------ LOGIN AJAX -------------------------------------------//
var frm = $('#login_form');
frm.submit(function () {
	$.ajax({
		type: "POST",
		url: "/rate_the_professor/login/",
		data: frm.serialize(),
		success: function (data) {
			window.location = data;
		},
		error: function(data) {
			$('#login_result').html("Invalid login details supplied.");
		}
	});
	return false;
});

// ------------ DYNAMIC PROFESSOR SEARCH FORM ----------------------- //
var data1;
$('#query').keyup(function(event) {
	var query = $('#query').val();

	if (query !== "") {
		$.get('/rate_the_professor/suggest_professor/', {suggestion: query, max_results: 4}, function(data){
			if (data !== data1)
				$('#search-dropdown').css("display", "none");
			$('#search-dropdown').html(data);
			$('#search-dropdown').css("display", "block");
			data1 = data; 
		});
	} else {
		$('#search-dropdown').css("display", "none");
		$('#search-dropdown').html("");
	}
});

// ------- MAKE THE SEARCH DROPDOWN MENU DISAPPEAR ON FOCUSOUT ------ //
$('#query').focusout(function() {
	setTimeout(function() {
		$('#search-dropdown').css("display", "none")
	}, 300);
})

// ---------- HITTING ENTER IN THE SEARCH BAR ------------------------//
var data2 = "";
$("#search_form").submit(function(event) {
	event.preventDefault();
	//var startHtml = "<h4 class='pullup'>Search Results</h4><hr><ul>";
	var startHtml = "<button type='button' class='close'>&times;</button><h4>Search Results</h4><hr><ul>";
	var $form = $( this ),
	url = $form.attr( 'action' );
	var posting = $.get( url, { suggestion: $('#query').val(), max_results: 0 } );
	posting.done(function( data ) {
		if (data !== "") {
			if (data2 !== data)
				$('#search-results').html(startHtml + data + "</ul>");
			
			$('#search-results').hide();
			$('#search-results').slideDown('fast');
			$('#query').val("");
			$('#search-dropdown').hide('fast');
			//$('#suggested_professors').html("");
			data2 = data;
		}
	});
});

// ------------ ADD EVENT TO SEARCH RESULTS CLOSE BUTTON ------------ //

$('#search-results').on("click", ".close", function() {
	$('#search-results').slideUp('fast');
})

// ----- CHANGE NUMERICAL RATING COLOUR DEPENDING ON VALUE ---------- //
function colourNumberRating() {
	var rating = $('.number-rating');
	var green = "#00FF00";
	var red = "#FF0000";
	var orange = "#FF9900";

	rating.css("font-weight", "bold");

	rating.each(function(i) {
		if ($(this).html() > 3.33)
			$(this).css("color", green);
		else if ($(this).html() < 1.67)
			$(this).css("color", red);
		else
			$(this).css("color", orange);
	});
}


// -------------- CHANGE RECENT COMMENT RATINGS TO STARS ------------ //
var MAX_RATING = 5;
var SMALL_RATING = 0;
var BIG_RATING = 1;

function ratingToStars() {
	processRatingToStars($('.small-rating'), SMALL_RATING);
	processRatingToStars($('.big-rating'), BIG_RATING);
}

function processRatingToStars(elem, RATING_TYPE) {
	elem.each(function(i){
		var rating = $(this).html();
		var fullStars = Math.floor(rating);
		var halfStars = Math.floor(rating * 2) % 2;

		var html = "<div class='comment-rating-block'>";

		var starColours = ["star_g", "star_o", "star_r", "star_gy"];
		var starSizes = ["_small", ""];
		var coloursEnum = {"GREEN" : 0, "ORANGE" : 1, "RED" : 2, "GREY" : 3};

		var starColour;
		var starSize;

		if (rating > 3.33)
			starColour = coloursEnum.GREEN;
		else if (rating < 1.67)
			starColour = coloursEnum.RED;
		else
			starColour = coloursEnum.ORANGE;

		if (RATING_TYPE == 0)
			starSize = SMALL_RATING;
		else if (RATING_TYPE == 1)
			starSize = BIG_RATING;

		for (var i = 0; i < fullStars; i++)
			html += "<img src='/static/img/" + starColours[starColour] + starSizes[starSize] + ".png'>";
		for (var i = 0; i < halfStars; i++)
			html += "<img src='/static/img/" + starColours[starColour] + "_half" + starSizes[starSize] + ".png'>";
		for (var i = 0; i < (MAX_RATING - fullStars - halfStars); i++)
			html += "<img src='/static/img/star_gy" + starSizes[starSize] + ".png'>";

		html += "</div>"
		$(this).html(html);
	});
}

// ---------- DISPLAY DYNAMIC STARS ON PROFESSOR'S PAGE ----------- //
var ratings;

function initialiseProfessorRatingsForm() {			
	var ratingFormElems = $('.prof-rating-form').find("input");
	ratingFormElems.each(function(i){
		if (i < 6)
			$(this).after("<span class='rating-form' id='rating" + i + "'><input id='star1' type='radio' name='rating' value='1.0'><img class='stars' src='/static/img/star_gy.png' %}><input id='star2' type='radio' name='rating' value='2.0'><img class='stars' src='/static/img/star_gy.png'><input id='star3' type='radio' name='rating' value='3.0'><img class='stars' src='/static/img/star_gy.png'><input id='star4' type='radio' name='rating' value='4.0'><img class='stars' src='/static/img/star_gy.png'><input id='star5' type='radio' name='rating' value='5.0'><img class='stars' src='/static/img/star_gy.png'>");
	});

	$(".stars").hover(
		function() {
			$(this).prevAll("img").prop("src", "/static/img/star_r.png");
			$(this).prop("src", "/static/img/star_r.png");
		}, function() {
			var ratingId = $(this).parent().attr("id");
			refreshRating(ratingId);
		}
	);
	
	$(".stars").click(function() {
		var ratingId = $(this).parent().attr("id");
		var ratingValue = $(this).prev().attr("value");
		var ratingIdNumber = ratingId.substr(6, ratingId.length - 6);
		
		ratings[ratingIdNumber] = ratingValue;
		$('#' + ratingId).prev().val(ratingValue);
		refreshRating(ratingId);
	});

	var ratingExists = true;
	var ratingIds = 0;
	
	while (ratingExists) {
		if ($('#rating' + ratingIds).length > 0)
			ratingIds++;
		else
			ratingExists = false;
	}
	
	ratings = new Array(ratingIds);
	
	for (var i = 0; i < ratings.length; i++)
		ratings[i] = 0;
}

function getSelectedRating(ratingId) {
	var ratingIdNumber = ratingId.substr(6, ratingId.length - 6);
	return ratings[ratingIdNumber];
}

function refreshRating(ratingId) {
	var MAX_RATING = 5;
	var starRating = getSelectedRating(ratingId);
	for (var i = 1; i <= MAX_RATING; i++) {
		if (i <= starRating)
			$("#" + ratingId).children("#star" + i).next().prop("src", "/static/img/star_y.png");
		else
			$("#" + ratingId).children("#star" + i).next().prop("src", "/static/img/star_gy.png");
	}
}

$(document).ready(function() {
	ratingToStars();
	colourNumberRating();
	initialiseProfessorRatingsForm();
});