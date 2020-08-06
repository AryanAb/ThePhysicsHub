let W = window.innerWidth*0.8, H = W/2;
let bgW = W*0.5, bgH =H*0.8, count = 0;
let flag = false, canvas, nskip = 90000, dt=0.000002, g=9.81;
let ctx;
let running = true;

//Now the dropdown variables
let dd, i1, i1r1, i1r2, i1r3, i1r4;

let sliders = {
  li: null, k: null, speed: null, m: null,
};


function makeSliders(parents){

  //li
  {
    let title, slider, value;//Used to shorten writting
  //Values are held using closures!
    sliders["li"] = makeSlider(arguments[0]);
    slider = sliders["li"]["slider"];
    title = sliders["li"]['label'];
    value = sliders['li']['valueLabel'];
    title.innerHTML = "Spr l/m";
    value.innerHTML = "110";
    slider.min = 10;
    slider.max = 400;
    slider.value = 110;
    slider.step = 10;
    slider.oninput = () => {value.innerHTML = slider.value;
                           spring.li = Number(slider.value);};
  //Notice how Im using a closure to hold these variables whose names I will change
  };



  {
    let title, slider, value;//Used to shorten writting
    //Values are held using closures!
    //k
    sliders['k'] = makeSlider(arguments[1]);
    slider = sliders["k"]["slider"];
    title = sliders["k"]['label'];
    value = sliders['k']['valueLabel'];
    title.innerHTML = "k /Nm-1";
    value.innerHTML = "2";
    slider.min = .5;
    slider.max = 4;
    slider.value = 2;
    slider.step = .1;
    slider.oninput = () => {value.innerHTML = slider.value;
                           spring.k = Number(slider.value);};
    //Notice how Im using a closure to hold these variables whose names I will change
  };



  {
    let title, slider, value;//Used to shorten writting
    //Values are held using closures!
    //m
    sliders['m'] = makeSlider(arguments[2]);
    slider = sliders["m"]["slider"];
    title = sliders["m"]['label'];
    value = sliders['m']['valueLabel'];
    title.innerHTML = "Mass/kg";
    value.innerHTML = "10";
    slider.min = 5;
    slider.max = 25;
    slider.value = 10;
    slider.step = .1;
    slider.oninput = () => {value.innerHTML = slider.value;
                           spring.m = Number(slider.value);};
    //Notice how Im using a closure to hold these variables whose names I will change
  };

  //speed
  sliders['speed'] = makeSlider(arguments[3]);
  slider = sliders["speed"]["slider"];
  title = sliders["speed"]['label'];
  value = sliders['speed']['valueLabel'];
  title.innerHTML = "speed";
  value.innerHTML = "9";
  slider.min = 100;
  slider.max = nskip*2;
  slider.value = (nskip/1000).toFixed(0);
  slider.step = 100;
  slider.oninput = () => {
    value.innerHTML =  (Number(slider.value)/1000).toFixed(0);
    nskip =slider.value;};
  //Notice how Im using a closure to hold these variables whose names I will change
};

let spring = {
  li: bgH/3, lf:200, k:2, dl: 0,
};
let pend = {
  pos : [bgW/3, bgH*0.4], hinge: [0, 0], acc: [0, 0],
  v : [0, 0], spring: spring, bg: /*own canvas*/null,
  ceilingLen: /*Length of support*/bgW/6, c:[20, 40, 200],
  m:/*mass*/10, posData: [],
  translationTo:[bgW/2, .1*bgH],
  translationBack:[-bgW/2,-.1*bgH],
  translate: function(bg,tag){
    if (tag=="start"){bg.translate(...this.translationTo);}
    else {bg.translate(...this.translationBack);};
  },
  drawOn: function makebodypend(bg){
    //Get the canvas to a position where it is esier to draw
    this.translate(bg, "start");

    //Drawing ceiling
    bg.stroke(255);bg.strokeWeight(2);
    bg.line(-this.ceilingLen, 0, this.ceilingLen, 0);
    //bg.line(0, 0, this.pos[0], this.pos[1]);
    drawSpring([0, 0], [this.pos[0], this.pos[1]],13, bg);

    //drawing hinge
    bg.fill(255); bg.stroke(0);
    bg.ellipse(0, 0, 13, 13);

    //Drawing mass
    bg.fill(this.c);
    bg.ellipse(this.pos[0], this.pos[1], this.m*4, this.m*4);

    //Return canvas to original position
    this.translate(bg, "back");
  },

  evolve: function evolve(){
    for (let i=0; i<nskip; i++){
      spring.lf = sqrt(this.pos[1]**2+this.pos[0]**2);
      spring.dl = spring.li - spring.lf;
      this.v[0] += (spring.dl*spring.k*(this.pos[0]/spring.lf/this.m))*dt;
      this.v[1] += (spring.dl*spring.k*(this.pos[1]/spring.lf)/this.m+9.8)*dt;
      this.pos[0]+=this.v[0]*dt;
      this.pos[1]+=this.v[1]*dt;
    };
  },
};

function drawSpring(p1, p2,n=13, bg){
  //n is the number of points in the chain!
  p2[1]-=pend.m*1.5;
  let L = sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2);
  co = (p2[0]-p1[0])/L;
  si = (p2[1]-p1[1])/L;
  let s = L/(n+1);

  //beggining and end of spring
  let x = [0, s];
  let y = [0, 0];
  x[n] = L-s;
  x[n+1] = L;
  y[n] = 0;
  y[n+1] = 0;

  //body of spring
  for (let i = 2; i<n; i++){
    x[i] = i*s;
    y[i] = (i%2 == 0)? -12:+40;
  };

  //Rotating and translating
  for (let i = 0 ; i<x.length;i++){
    let x0 = x[i], y0 = y[i];
    x[i] = x0*co-y0*si+p1[0];
    y[i] = y0*co+x0*si+p1[1];
  };

  bg.noFill();
  for (let i=0; i<x.length-2; i+=2){
    bg.bezier(x[i], y[i], x[i+1], y[i+1], x[i+2], y[i+2],x[i+2], y[i+2]);
  };
};

function setup() {
  canvas = createCanvas(W, H);
  canvas.parent("simwrapper");

  //Making resizable figures
  pg = createGraphics(bgW, bgH);
  bg = createGraphics(bgW, bgH);
  pg.pixelDensity(1);
  bg.pixelDensity(1);
  pg.elt.id="mycanvas";
  ctx = document.getElementById("mycanvas").getContext("2d");
  ctx.fillStyle = "rgba(0, 0, 0, 1)";

  //making dropdown
  dd = makeDropdown(canvas);
  i1 = makeItem(dd);
  i1.parentElement.children[1].innerHTML = "Parameters";
  i1r1 = makeRow(i1);
  i1r2 = makeRow(i1);
  i1r3 = makeRow(i1);
  i1r4 = makeRow(i1);
  makeSliders(i1r1, i1r2, i1r3, i1r4);
  setPedroStyle(canvas);
  pixelDensity(3);
  pg.pixelDensity(3);
  bg.pixelDensity(3);
}
function draw() {
  bg.clear();
  background(0);
  ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
  ctx.fillRect(0, 0, bgW, bgH);
  ctx.strokeStyle = "rgba(255, 255, 255, 1)";
  ctx.beginPath();
  ctx.moveTo(pend.pos[0]+bgW/2, pend.pos[1]+bgH/10);
  if (running){
    pend.evolve();
  };
  ctx.lineTo(pend.pos[0]+bgW/2, pend.pos[1]+bgH/10);
  ctx.stroke();
  pend.drawOn(bg);
  image(pg, 0, 0);
  image(bg, 0, 0);
  (count<1000000)? count++:count=0;
};


/*This file contains many functions that can be used to
add a wonderful dropdown to a p5 canvas!!!

follows instructions for use:

INSTRUCTION MANUAL FOR DROPDOWN
-------------------------------

1. Creating the dropdown:
	To make the dropdown you must make use of the function makeDropdown();
	This function takes a p5 canvas element as argument.

	makeDropdown(canvas); --> returns html element for placement of items.
	In case the canvas is placed directly on the body of the document, a
	new canvas container will be created!!! This is necessary for technical
	reasons. So MAKE SURE THE CANVAS IS ALREADY IN IT's FINAL CONTAINER before
	using this function!!!!

	Changing the text inside the main dropdown button:
		let dd = makeDropdown(canvas);
		dd.parentElement.children[1].innerHTML = "My title";

  After making the dropdown, you can use the function setPedroStyle(canvas);
  this makes it look pretty.


2. Adding items to the dropdown
	To add items to the dropdown, you must make use of the function makeItem();
	This function takes an html dropdown contents container returned by makeDropdown();

	makeItem(makeDropdown(canvas)) --> returns html container for ITEM

	If you wish to change the title inside this item you must do as follows:
		let dd = makeDropdown(canvas);
		let item1 = makeItem(dd);
		item1.parentElement.children[1].innerHTML = "Mytitle";

3. Adding rows to dropdown Item
	To add a row to an html item, which lies inside the dropdown,
	you must make use of the function makeRow(), which takes it's parent
	html item as an argument.
	The flow could be seen like this:
		let dd = makeDropdown(canvas);
		let item1 = makeItem(dd);
		let item1Row1 = makeRow(item1);

	This function returns the html element that represents the row inside item.

	To add text to this element simply write:
		item1Row1.innerHTML = "YOUR text";

	To add a widget to this element, use one of the functions pedro will provide.

	As of right now there is only one widget available which is the SLIDER!!!
	To make a slider inside a row element simply use the function makeSlider();
		exmple:
			sliderContainer = makeSlider(rowElement);
	sliderContainer.["label"].innerHTML is the title of your slider
	sliderContainer.['slider'] is your html slider
	sliderContainer.['valueLabel'].innerHTML is the place allocated for showing the current value of the slider

4. Making the slider look pretty!
	After making the dropdown, you can use the function setPedroStyle(canvas);
	to add the css styling to the dropdown and make it look and work like a dropdown.


	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	NOTE: MAKE SURE TO ONLY USE THIS FUNCTION AFTER makeDropdown(canvas) IS USED!
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

5. Adding checkboxes to the dropdown:
  it is pretty simple actually, follow the same procedures as the dropdown.

  makeDropdown(row); --> return {"label": label, "checkbox": checkBox};
  let row = makeRow(item);
  let checkboxContainer = createCheckbox(row);
  let checkbox1 = checkboxContainer['checkbox'];
  let checkbox1Label = checkboxContainer['label']''
  Change the label with checkbox1Label.innerHTML = 'MY label';
  Google event's that you can attach to your html checkbox!

EXAMPLE OF A SIMPLE DROPDOWN:
	//Creating canvas and dropdown
	let canvas = createCanvas(500, 400);
	let dd = makeDropdown(canvas);

	//Changing the name of dropdown button
	dd.parentElement.children[1].innerHTML = "MyOptions";

	//Setting style
	setPedroStyle(canvas);

	//Further adding to the dropdown
	let item1 = makeItem(dd);
	let row1 = makeRow(item1);
	let sliderContainer = makeSlider(row1);
	let sliderTitle = sliderContainer['label'];
	let slider = sliderContainer.['slider'];
	let sliderValue = sliderContainer['valueLabel'];

	//Using slider as we wish:
	slider.max = 200;
	slider.min = 100;
	slider.step = 0.1;
	slider.value = 150;
	slider.oninput = () => {sliderValue.innerHTML = Number(slider.value).toFixed(0)};
	sliderValue.innerHTML = slider.value;//Updates the text to the new slider value
	sliderTitle.innerHTML = "Title";


Additional information:
	if you want to add another dropdown inside a row of an item you can simply
	use makeItem(), and the supply your row as an argument.

	If you wish to add a random html element into a row of the dropdown
	you can follow the same steps I will follow below. In this case
	I will use an html BUTTON as for the example. But this works for any
	html element OTHER THAN A CANVAS!

		let button = document.createElement("button");
		button.innerHTML = "HELLO";
		row = makeRow(item);
		row.appendChild(button);
*/


function makeCheckbox(parent){
  if (arguments.length == 0){
    parent = document.body;
  };
  console.log(parent);

  //Now since we must have a parent
  let cbContainer = document.createElement("label");
  cbContainer.className += "cbContainer";
  parent.appendChild(cbContainer);

  //now we make labels and checkbox
  let label = document.createElement("span");
  label.innerHTML = "Property";
  cbContainer.appendChild(label);

  let checkBox = document.createElement("input");
  checkBox.setAttribute("type", "checkbox");
  cbContainer.appendChild(checkBox);
  return {"label": label, "checkbox": checkBox};
};

function makeRow(parent) {
  //Makes a row in the returned element from makeItem
  let row = document.createElement("li");
  parent.appendChild(row);
  return row;
};


function makeItem(parent) {
  //First make a variabel responsable for naming rows
  if (typeof ddItemCount == "undefined") {
    window.ddItemCount = 0; //It is a global variable
  };

  //This function let's you define rows in a parent.
  //This parent could be the returned element of makeDropdown OR
  //a row from another ITEM.
  let item = document.createElement("div");
  item.className = "item";
  parent.appendChild(item);

  //Differenciates between droped and normal states
  let itemCheck = document.createElement("input");
  itemCheck.type = "checkbox";
  itemCheck.id = "checkbox" + ddItemCount; //Needed for labels
  item.appendChild(itemCheck);

  //Making the label
  let itemCheckLabel = document.createElement("label");
  itemCheckLabel.innerHTML += String(ddItemCount);
  itemCheckLabel.setAttribute("for", "checkbox" + ddItemCount);
  ddItemCount++;
  //Increase itemCount by one!!!
  item.appendChild(itemCheckLabel);


  //Making a container for the rows
  /*THIS IS THE PARENT FOR THE ROWS!!!!!!*/
  let rowContainer = document.createElement("ul");
  item.appendChild(rowContainer);
  return rowContainer;
};

function makeDropdown(canvas) {
  let div = document.createElement("div");

  //Creating a canvas container for easier placement!!!
  let canvasContainer; //Only ysed if canvas is in body
  if (document.body == canvas.elt.parentElement) {
    canvasContainer = document.createElement("div");
    canvasContainer.id = "VeryUniqueOriginalCanvasContainer";
    document.body.appendChild(canvasContainer);

    canvas.elt.parentNode.removeChild(canvas.elt);
    canvasContainer.appendChild(canvas.elt);
    //Leaving canvas without a parent for the "if" statement
  } else {
    canvasContainer = canvas.elt.parentElement;
  };

  let positionContainer = document.createElement('div');
  positionContainer.id = "SomeCreativeID"; //CSS reasons
  canvasContainer.appendChild(positionContainer);

  //This contains the ENTIRE dropdown.
  let ddContainer = document.createElement('div');
  ddContainer.className = "ddContainer";
  positionContainer.appendChild(ddContainer);

  //Now we make the dropdown Button
  let mainDdButton = document.createElement("input");
  mainDdButton.type = "checkbox";
  mainDdButton.id = "Root";
  ddContainer.appendChild(mainDdButton);

  let mainDdButtonLabel = document.createElement("label");
  mainDdButtonLabel.setAttribute("for", "Root");
  mainDdButtonLabel.style = "font-size: 1.5em; margin-left: 1em;";
  mainDdButtonLabel.innerHTML = "Options";
  ddContainer.appendChild(mainDdButtonLabel);

  //This is the parent elemnt for any "ITEM" elements you make
  let ddContents = document.createElement("div");
  ddContents.className = "dd";
  ddContainer.appendChild(ddContents);
  return ddContents; //This is the parent of ITEM!!!
};

function setPedroStyle(canvas) {
  //Canvas is the element you get from createCanvas();
  let id; //Necesary for canvas positioning
  if (arguments.length == 0) {
    id = "VeryUniqueOriginalCanvasContainer";
  } else {
    id = canvas.elt.parentNode.id;
    //In case canvas is already inside another element.
  };
  //NOW THE CSS
  var style = document.createElement('style');
  style.innerHTML = `
/*Making it go inside the canvas*/
#SomeCreativeID{
  position: absolute;
  display: flex;
  min-width: 17em;
  max-height: 60%;
  z-index: 99;
  overflow-y: auto;
  overflow-x: hidden;
  margin-left: auto;
  right: 0%;
}
#SomeCreativeID>div{
  padding-left: 0;
}

#${id}{
  position:relative;
  background-color: blue;
  display: inline-flex;
}

/*functionality*/
.item, li, label{
  cursor: pointer;
  z-index: 3;
}

/*Functionality*/
.ddContainer>input[type="checkbox"], .dd>.item>input[type=checkbox], .item>ul, .dd{
  display: none;
}

#Root:checked ~ .dd, .item>input:checked ~ ul{
  display: block;
}

#Root:checked ~ label{
  background-color: #222;
}

#Root:checked ~ label::before, .item>input:checked ~ label::before{
  transform: rotate(-90deg);
  display: inline-block;
  transition-duration: .2s;
  transform: rotate(-180deg);
}

#Root:not(:checked) ~ label::before, .item>input:not(:checked)~label::before{
  transform: rotate(-90deg);
  display: inline-block;
  transition-duration: .2s;
}

/*Making it pretty*/
.ddContainer{
  background-color: #111;
  display: inline-flex;
  width: 100%;
  height: 100%;
  padding: 0;
  flex-direction: column;
  font-size: .99em;
  color:white;
  font-family: sans-serif;
}

.ddContainer>label{
  min-height: 1.5em;
  display: flex;
  margin: 0;
  padding: 0;
  align-items: center;
  justify-contents: center;
  border-radius: 0.2em;
}
.item{
  margin: 0;
  padding: 0;
}

.item>label{
  font-weight: 600;
  font-size: 1em;
  padding-left: 0.3em;
  background-color: #222;
  display: flex;
  align-items: center;
  border-bottom: 0.05em solid #333;
  border-top: 0.05em solid #333;
  border-radius: 0.2em;
  margin-top: 0.025em;
  margin-bottom: 0.05em;
  padding: 0.5em;
  min-height: 1.5em;
}


div.item>ul>li{
  border-radius: 0.2em;
  min-height: 2em;
  padding-left: .4em;
  padding-right: .8em;
  margin-top: 0;
  margin-bottom: 0;
  background: #222;
  display: flex;
  align-items: center;
  font-size: .8em;
}

.item>label::before, .ddContainer>label::before{
  content: "‹";
  margin-left: 0.4em;
  margin-right: 0.4em;
}


.item>ul{
  list-style: none;
  padding-left: 9%;
  margin: 0;
  min-height: 2em;
  background-color: #222;
  border-radius: .2em;
}

.item>ul>li:hover, .item:hover ~ ul, .item>label:hover{
  background-color: #333;
}

 label:hover{
  transform: scale(1.01);
  background-color: #333;
}

/* width */
#SomeCreativeID::-webkit-scrollbar{
  width: .5em;
}

/* Handle */
#SomeCreativeID::-webkit-scrollbar-thumb {
  background: #666;
}

/* Handle on hover */
#SomeCreativeID::-webkit-scrollbar-thumb:hover {
  background: #444;
}


/*NOW WE HAVE THE SLIDERS*/
.rangeValue, .sliderTitle{
  display: flex;
  text-align: center;
  margin: 0;
  width: 30%;
  padding: 0;
}
.rangeValue{
  width: 10%;
  padding-left: 6%;
}

.sliderContainer{
  display: flex;
  justify-content: space-around;
  color: white;
  margin: 0em;
  padding: .4em;
  border-radius: 0.5em;
  width: 100%;
  opacity: 0.85;
}

.sliderContainer:hover{
  opacity:1;
}

.sliderContainer>input[type=range]{
  -webkit-appearance: none;
  background: transparent;
  width: 50%;
}
.sliderContainer>input[type=range]:focus {
  outline: none;
}
.sliderContainer>input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: .3em;
  cursor: pointer;
  background: #3071a9;
  border-radius: .9em;
  border: .05em solid #010101;
}
.sliderContainer>input[type=range]::-webkit-slider-thumb {
  border: 1px solid #000000;
  height: 1.3em;
  width: 1.3em;
  border-radius: 1.3em;
  background: #ffffff;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -0.55em;
  transition-duration: .2s;
}

.sliderContainer>input[type=range]::-webkit-slider-thumb:hover{
  transform: scale(1.1);
}
.sliderContainer>input[type=range]::-moz-range-thumb:hover{
  transform: scale(1.1);
}

.sliderContainer>input[type=range]::-ms-thumb:hover{
  transform: scale(1.1);
}

.sliderContainer>input[type=range]::-moz-range-track{
  width: 100%;
  height: .3em;
  cursor: pointer;
  background: #3071a9;
  border-radius: .9em;
  border: .05em solid #010101;
}

.sliderContainer>input[type=range]::-moz-range-thumb {
  border: 1px solid #000000;
  height: 1.3em;
  width: 1.3em;
  border-radius: 1.3em;
  background: #ffffff;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -0.55em;
  transition-duration: .2s;
}

.sliderContainer>input[type=range]::-ms-track {
 width: 100%;
  height: .3em;
  cursor: pointer;
  background: #3071a9;
  border-radius: .9em;
  border: .05em solid #010101;
}
.sliderContainer>input[type=range]::-ms-fill-lower {
  background: #2a6495;
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}
.sliderContainer>input[type=range]::-ms-fill-upper {
  background: #3071a9;
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}
.sliderContainer>input[type=range]::-ms-thumb {
 border: 1px solid #000000;
  height: 1.3em;
  width: 1.3em;
  border-radius: 1.3em;
  background: #ffffff;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -0.55em;
  transition-duration: .2s;
}


/*NOW TIME FOR CHECKBOXES*/
.cbContainer{
  display: flex;
  min-height: 2em;
  width: 100%;
  height: 100%;
  color: white;
  align-items: center;
  opacity: 0.8;
  transition-duration: .2s;
}
.cbContainer:hover{
  opacity: 1;
}

.cbContainer input[type=checkbox]{
  margin-left: auto;
  margin-right: .5em;
}

.cbContainer span{
  margin-left: .5em;
  margin-right: auto;
}

`;
  document.head.appendChild(style);
};


function makeSlider(parent) {
  /*Returns the container that has 3 elements accesible by
  element.children[index]. Where index=0: title,
  index=1: slider, index=2: number;*/
  if (typeof numberSliders == "undefined") {
    window.numberSliders = 0
  };
  let sliderContainer = document.createElement("div");
  sliderContainer.classList.add("sliderContainer");
  sliderContainer.id = `slider${numberSliders}`;

  let sliderTitle = document.createElement("span");
  sliderTitle.className = "sliderTitle";
  sliderTitle.innerHTML = "slider" + numberSliders++;

  let slider = document.createElement("input");
  slider.type = "range";
  slider.class = "slider";

  let sliderValue = document.createElement("span");
  sliderValue.innerHTML = slider.value;
  sliderValue.className = "rangeValue";

  slider.oninput = () => {
    sliderValue.innerHTML = slider.value
  };

  sliderContainer.appendChild(sliderTitle);
  sliderContainer.appendChild(slider);
  sliderContainer.appendChild(sliderValue);

  parent.appendChild(sliderContainer);
  console.log(sliderContainer);
  return {"label": sliderTitle, "slider": slider, "valueLabel": sliderValue};
};
