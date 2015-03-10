/*GLOBAL VARIABLES*/

//variables to hold coordinates
var long;
var latt;

//var to hold the canvas and new image container
var imgMap = new Image(400,400);
var canvas = document.createElement("canvas");
canvas

//set the context and give canvas an ID and size
var ctx = canvas.getContext("2d");
canvas.setAttribute("id","map");
canvas.setAttribute("width", "400px");
canvas.setAttribute("height", "400px");



// JavaScript Document
var pages = [], links = [];
var numLinks = 0;
var numPages = 0;
var pageTime = 800;//same as CSS transition

//create the pageShow type event.
var pageshow = document.createEvent("CustomEvent");
pageshow.initEvent("pageShow", false, true);



/**************************
        CODE START
**************************/

document.addEventListener("DOMContentLoaded", function(){
	//device ready listener
	pages = document.querySelectorAll('[data-role="page"]');	
	numPages = pages.length;
	links = document.querySelectorAll('[data-role="pagelink"]');
	numLinks = links.length;
    
    
	for(var i=0;i<numLinks; i++){
        
        //either add a touch or click listener
        if(detectTouchSupport( )){
            links[i].addEventListener("touchend", handleTouch, false);
        }
        
		links[i].addEventListener("click", handleNav, false);	
	}
    
  //add the listener for pageshow to each page
  for(var p=0; p < numPages; p++){
    pages[p].addEventListener("pageShow", handlePageShow, false);
  }
	loadPage(null);
    
    
   
});

function handleNav(ev){
	ev.preventDefault();
	var href = ev.target.href;
	var parts = href.split("#");
	loadPage( parts[1] );	
  return false;
}

function handlePageShow(ev){
    
   
    ev.target.className = "active";
    
    if (ev.currentTarget.id == "map"){
        
         GPScheck();
    } else if (ev.currentTarget.id == "contacts"){
        
    
        var options = new ContactFindOptions();
		options.filter = "";
		options.multiple = true;
		filter = ["displayName"];

		navigator.contacts.find(filter, successF, errorF, options);
       
    }
}


function loadPage( url ){
	if(url == null){
		//home page first call
		pages[0].className = 'active';
		history.replaceState(null, null, "#home");	
	}else{
    for(var i=0; i < numPages; i++){
      pages[i].className = "hidden";
      //get rid of all the hidden classes
      //but make them display block to enable anim.
      if(pages[i].id == url){
        pages[i].className = "show";
        //add active to the proper page
        history.pushState(null, null, "#" + url);
        setTimeout(addDispatch, 50, i);
      }
    }
    //set the activetab class on the nav menu
    for(var t=0; t < numLinks; t++){
      links[t].className = "";
      if(links[t].href == location.href){
        links[t].className = "activetab";
      }
    }
	}
}

//function to dispatch the click event when touched to avoid 300ms delay
function handleTouch(ev){
  ev.preventDefault();
  ev.stopImmediatePropagation();
  var touch = ev.changedTouches[0];        //this is the first object touched
  var newEvt = document.createEvent("MouseEvent");	
  //old method works across browsers, though it is deprecated.
  newEvt.initMouseEvent("click", true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY);
  ev.currentTarget.dispatchEvent(newEvt);
  //send the touch to the click handler
}


function addDispatch(num){
  pages[num].dispatchEvent(pageshow);
  //num is the value i from the setTimeout call
  //using the value here is creating a closure
}

function detectTouchSupport( ){
  msGesture = navigator && navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0 && MSGesture;
  var touchSupport = (("ontouchstart" in window) || msGesture || (window.DocumentTouch && document instanceof DocumentTouch));
  return touchSupport;
}


    

function successF(contacts){
    
    var x = Math.floor(Math.random() * contacts.length);
    console.log(x);
    var randCon = document.getElementById("randomContact")
    
    randCon.innerHTML = "Name: " + contacts[x].name.formatted + "<br>" + "Phone: " + contacts[x].phoneNumbers[0].value;
    
    
}

function errorF(){
    console.log("contact error");   
}

/***************************

GPS GEOLOCATION FUNCTIONS

***************************/

function GPScheck( ){
      //check to see if the user's device supports GPS
  if( navigator.geolocation ){ 
    //code goes here to find position
    var params = {enableHighAccuracy: false, timeout:60000, maximumAge:60000};
    //enableHighAccuracy means try to use GPS and drain the battery
    //for improved accuracy within a few meters.
    //maximum age is how long to cache the location info
    //timeout is how long to wait for the network to respond after the user says ok
    navigator.geolocation.getCurrentPosition( reportPosition, gpsError, params ); 
    
    //to continually check the position (in case it changes) use
    // navigator.geolocation.watchPosition( reportPosition, gpsError, params)
      
      
  }else{
    //browser does not support geolocation api
    alert("Sorry, but your browser does not support location based awesomeness.")
  }
}

//find the position
function reportPosition( position ){ 

    //var output = document.querySelector("#output");
    long = position.coords.longitude;
    latt = position.coords.latitude;
    
    //set the img source with co-ordinates
    imgMap.src = ("http://maps.googleapis.com/maps/api/staticmap?&zoom=14&size=400x400&maptype=roadmap&markers=color:blue%7Clabel:A%7C"+latt+","+long);
        
    
    //when image has loaded, draw it on the canvas
    imgMap.onload = function() {
          ctx.drawImage(this, 0, 0);
        };
   
    
    var mapOut = document.getElementById("output");
    
    
    //append new elements to page
    mapOut.appendChild(canvas);
    
}

//run when error and show error
function gpsError( error ){   
  var errors = {
    1: 'Permission denied',
    2: 'Position unavailable',
    3: 'Request timeout'
  };
  alert("Error: " + errors[error.code]);
}