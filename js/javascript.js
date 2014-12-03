//function to load XML file
function loadXMLDoc(dname)
{
if (window.XMLHttpRequest)
  {
  xhttp=new XMLHttpRequest();
  }
else
  {
  xhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
xhttp.open("GET",dname,false);
xhttp.send();
return xhttp.responseXML;
}


$(document).ready(function() {
	
	//loading screen
	setTimeout(function(){
		$('#loading').fadeTo(1200,0, function(){
			$('#loading').css('z-index','0');
		});
	},1200);
	
	activateNav();

	/* Scroll event handler */
    $(window).bind('scroll',function(e){
    	activateNav();
    });
    

    $('nav ul li:nth-child(1)').click(function(){
    	$('html, body').animate({
    		scrollTop:0
    	}, 1000, function() {
	    	//parallaxScroll(); // Callback is required for iOS
		});
    	return false;
	});
	$('nav ul li:nth-child(2)').click(function(){
    	$('html, body').animate({
    		scrollTop:1130
    	}, 1000, function() {
	    	//parallaxScroll(); // Callback is required for iOS
		});
    	return false;
	});
	$('nav ul li:nth-child(3)').click(function(){
    	$('html, body').animate({
    		scrollTop:2337
    	}, 1000, function() {
	    	//parallaxScroll(); // Callback is required for iOS
		});
    	return false;
	});
	$('nav ul li:nth-child(4)').click(function(){
    	$('html, body').animate({
    		scrollTop:3530
    	}, 1000, function() {
	    	//parallaxScroll(); // Callback is required for iOS
		});
    	return false;
	});
	
	
	//The message window
	//fade in
/*
	setTimeout(function(){
		$('#loading').fadeTo(1200,0, function(){
			$('#loading').css('z-index','0');
		});
	},1200);
*/
	
	//close the window
	$('#message .close').click(function(){
   	//$('#message').css("display", "none");
   	
   	setTimeout(function(){
   		$('#message').fadeTo(150,0, function(){
   			$('#message').css('z-index','0');
   		});
   	},0);
   	
	});
});



//FUNCTIONS

/* Set navigation images to an active state as the user scrolls */
function activateNav(){
	var aboutOffs = $('#about').offset().top;
	var contactOffs = $('#contact').offset().top;
	var imagesOffs = $('#images').offset().top;

	var section1Top =  -100;
	// The top of each section is offset by half the distance to the previous section.
	var section2Top =  aboutOffs - ((imagesOffs - aboutOffs) / 4);
	var section3Top =  contactOffs - ((imagesOffs - contactOffs) / 3);
	var section4Top =  imagesOffs - (($(document).height() - imagesOffs) / 2);
	$('nav ul li').removeClass('active');
	
	if($(document).scrollTop() >= section1Top && $(document).scrollTop() < section2Top){
		$('nav ul li:nth-child(1)').addClass('active');
	} else if ($(document).scrollTop() >= section2Top && $(document).scrollTop() < section3Top){
		$('nav ul li:nth-child(2)').addClass('active');
	} else if ($(document).scrollTop() >= section3Top && $(document).scrollTop() < section4Top){
		$('nav ul li:nth-child(3)').addClass('active');
	} else if ($(document).scrollTop() >= section4Top){
		$('nav ul li:nth-child(4)').addClass('active');
	}
}
