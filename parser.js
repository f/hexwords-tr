const words = (async function () {
  const words = await (await fetch("https://sozluk.gov.tr/autocomplete.json")).json()

  const HEX_LIKE_CHARS = 'abcdefoiısgğşötz'.split('')

  const result = words
    .map(w => w.madde.toLocaleLowerCase('tr'))
    .filter(w => [3, 6, 8].includes(w.length)) // Colors can be 3 and 6, 8 can be with alpha.
    .filter(w => w
      .split('')
      .every(l => HEX_LIKE_CHARS.includes(l))
    )
    .map(w => [
      w,
      '#' + w.replace(/[iı]/g, '1')
             .replace(/[öo]/g, '0')
             .replace(/[sş]/g, '5')
             .replace(/[ğg]/g, '6')
             .replace(/t/g, '7')
             .replace(/z/g, '2')
             .toLocaleUpperCase('tr')
    ])

  return result
})();

//Initilize
async function init(){
  words.then((res)=>{
    listCards(res)
  })
}


//List current array
function listCards(items){
    clearBoard();
    items.forEach(element => {
      addCard(element[1], element[0])
    });
}

//Clear all cards
function clearBoard(){
  var cardsWrapper = document.getElementsByClassName("cards-wrapper")[0];
  cardsWrapper.innerHTML = "";
}

function addCard(hexcode, word) {
  //Reaching cardWrapper element
  var cardsWrapper = document.getElementsByClassName("cards-wrapper")[0];

  //Creating card element
  var colorCard = document.createElement("div");

  //Creating <br>
  var spacing = document.createElement("br");

  //Creating small text for display hexcode of word
  var hexCode = document.createElement("small");
  hexCode.innerText = colorCard.innerText = hexcode

  //Creating copy button with icon
  var copyIcon = document.createElement("button");
  var img = document.createElement("img")
  img.src = "./assets/copyIcon.svg"
  copyIcon.appendChild(img)
  copyIcon.classList.add("copy-icon")
  copyIcon.addEventListener("click", copyHexColor.bind(this, hexcode)); //event(click) listener for copy icons

  //Adding elements to colorCard
  colorCard.classList.add("color-card");
  colorCard.innerText = word
  colorCard.appendChild(spacing)
  colorCard.appendChild(hexCode)
  colorCard.appendChild(copyIcon)

  //Set dynamic values
  colorCard.style.backgroundColor = hexcode;
  
  //Adding colorCard to cardsWrapper 
  cardsWrapper.appendChild(colorCard);
  if(isDarkColor(window.getComputedStyle(colorCard).backgroundColor)){
    img.style.filter = "invert(1)"
    colorCard.style.color = "#fff"
  }
}

//For copying hexcode to clipboard
function copyHexColor(hex){
  navigator.clipboard.writeText(hex)
  showCallout(hex)
}

  // This function for show callout when user clicks copy. By changing animation attr, slides callout x axis
function showCallout(hex){
  var callout = document.getElementById("callout")
  callout.innerText = "Color " + hex + " copied to clipboard";
  callout.style.display = "block"

  window.setTimeout(function(){
    callout.style.animation="leftToRight 0.5s ";
  }, 4500)
  window.setTimeout(function(){
    callout.style.display = "none"
  }, 5000)
}

  // I gave custom value to lum (default was 186) variable. This function can improve.
function isDarkColor(color) {
  const colors = color.match(/\d+/g).map(Number) 
  var lum = (((0.299 * colors[0]) + ((0.587 * colors[1]) + (0.114 * colors[2]))));
  return lum < 50
}

//Search By Word
function getSearchText(){
 var text = document.getElementById("search-text").value
  words.then(res => {
    const filtered = res.filter(item => item[0].includes(text))
    listCards(filtered)
  })
}

//Search By Hex
function getSearchProximity(){
  document.getElementById("search-proximity").value = document.getElementById("set-proximity").value
  text = hexToRgb(document.getElementById("set-proximity").value)
  
  var sortedList = words.then((res) => {
    sortedList = res.map(item => {
      return [item[0], item[1], getProximity(hexToRgb(item[1]).match(/\d+/g).map(Number), text.match(/\d+/g).map(Number))]
    }).sort((a,b) => {return a[2] - b[2]})
    listCards(sortedList)
  })
  
 }

 //https://stackoverflow.com/questions/13586999/color-difference-similarity-between-two-values-with-js (I got Proximity function from there <3)
 function getProximity(rgbA, rgbB) {
  let labA = rgb2lab(rgbA);
  let labB = rgb2lab(rgbB);
  let deltaL = labA[0] - labB[0];
  let deltaA = labA[1] - labB[1];
  let deltaB = labA[2] - labB[2];
  let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  let deltaC = c1 - c2;
  let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  let sc = 1.0 + 0.045 * c1;
  let sh = 1.0 + 0.015 * c1;
  let deltaLKlsl = deltaL / (1.0);
  let deltaCkcsc = deltaC / (sc);
  let deltaHkhsh = deltaH / (sh);
  let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}

function rgb2lab(rgb){
  let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

function hexToRgb(hex) {
  hex = hex.substring(1)
  if (hex.length === 3) {
    hex = hex.split('').map(function (h) {
		return h + h;
	}).join('');
}
  var bigint = parseInt(hex, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;
  return r + "," + g + "," + b;
}




//Here is where it start
init();


