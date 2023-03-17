var socket = io();
var cursorsElement = document.getElementById('cursors');

var letters = ['A','B','C','D','E','F','G'];

socket.on('user connection', function(cursors_obj) {
    cursorsElement.innerHTML = '';
    addTextBox(socket.id, cursors_obj[socket.id]);

    let otherCursors = {};
    for(const id in cursors_obj) {
        if (id !== socket.id) {
            otherCursors[id] = cursors_obj[id];
        }
    }

    for (const id in otherCursors) {
        addTextBox(id, otherCursors[id]);
    }
    
});

function addTextBox(id, val) {
    var row = document.createElement('li');
    var inputword = document.createElement('p');
    inputword.setAttribute('id', 'inputword-' + id);
    var testword = document.createElement('span');
    testword.setAttribute('id', 'testword-' + id);
    testword.setAttribute('class', 'testword');
    testword.innerHTML = val;
    var cursor = document.createElement('span');
    cursor.setAttribute('id', 'cursor-' + id);
    cursor.setAttribute('class', 'cursor');
    cursor.innerHTML = '|';

    inputword.appendChild(testword);
    inputword.appendChild(cursor);
    row.appendChild(inputword);
    cursors.appendChild(row);
}

socket.on('user disconnection', function(id) {
    var row = document.getElementById('inputword-' + id);
    if (!row) return;
    row.parentElement.remove();
});

//Creates the hexagon grid of 7 letters with middle letter as special color
function initialize_letters(){
    var hexgrid = document.getElementById('hexGrid')
    for(var i=0; i<letters.length; i++){
        var char = letters[i];
        
        var pElement = document.createElement("P");
        pElement.innerHTML = char;
        
        var aElement = document.createElement("A");
        aElement.className = "hexLink";
        aElement.href = "#";
        aElement.appendChild(pElement);
        aElement.addEventListener('click', clickLetter(char), false);

        var divElement = document.createElement('DIV');
        divElement.className = "hexIn"; 
        divElement.appendChild(aElement);
        
        var hexElement = document.createElement("LI");
        hexElement.className = "hex";
        hexElement.appendChild(divElement);
        if(i==3){
          aElement.id = "center-letter";
          centerLetter = letters[i];
        }
        hexgrid.appendChild(hexElement);
    }
}

function clickLetter(char) {
    return function curried_func(e){
        var tryword = document.getElementById("testword-" + socket.id);
        tryword.innerHTML = tryword.innerHTML + char.toUpperCase();
        socket.emit('wordupdate', tryword.innerHTML);
    }
}

Array.prototype.shuffle = function() {
    let input = this;
    for (let i = input.length-1; i >=0; i--) {
      let randomIndex = Math.floor(Math.random()*(i+1)); 
      let itemAtIndex = input[randomIndex]; 
      input[randomIndex] = input[i]; 
      input[i] = itemAtIndex;
    }
    return input;
  }
  
function shuffleLetters() {
    var hexgrid = document.getElementById('hexGrid');
    hexgrid.classList.remove('switching');
    window.setTimeout(function() {
        hexgrid.classList.add('switching');
    }, 50);
    
    letters.shuffle()
    //get center letter back to letter[3]
    var centerIndex = letters.indexOf(centerLetter);
    if(letters[3] != centerLetter) {
        var temp = letters[3];
        letters[3] = centerLetter;
        letters[centerIndex] = temp;
    }
    
    while (hexgrid.firstChild) {
        hexgrid.removeChild(hexgrid.firstChild);
    }
    
    initialize_letters()
}

function deleteLetter() {
    var tryWord = document.getElementById('testword-' + socket.id);
    if (tryWord.innerHTML.length > 0) {
        tryWord.innerHTML = tryWord.innerHTML.slice(0,-1);
    }
    socket.emit('wordupdate', tryWord.innerHTML);
}

socket.on('wordrefresh', function(html, id) {
    var tryword = document.getElementById("testword-" + id);
    tryword.innerHTML = html;
});