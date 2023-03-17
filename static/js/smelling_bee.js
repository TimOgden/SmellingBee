var socket = io();
var cursors = document.getElementById('cursors');

socket.on('user connection', function(cursors_obj) {
    console.log(cursors_obj);
    var cursorsElement = document.getElementById('cursors');
    cursorsElement.innerHTML = '';
    for (const id in cursors_obj) {
        var row = document.createElement('li');
        var inputword = document.createElement('p');
        inputword.setAttribute('id', 'inputword-' + id);
        var testword = document.createElement('span');
        testword.setAttribute('id', 'testword-' + id);
        testword.setAttribute('class', 'testword');
        var cursor = document.createElement('span');
        cursor.setAttribute('id', 'cursor-' + id);
        cursor.setAttribute('class', 'cursor');
        cursor.innerHTML = cursors_obj[id];

        inputword.appendChild(testword);
        inputword.appendChild(cursor);
        row.appendChild(inputword);
        cursors.appendChild(row);
    }
    
});

socket.on('user disconnection', function(id) {
    var row = document.getElementById('inputword-' + id);
    if (!row) return;
    row.parentElement.remove();
});

function test_letters() {
    initialize_letters(['A','B','C','D','E','F','G']);
}

//Creates the hexagon grid of 7 letters with middle letter as special color
function initialize_letters(letters){
    console.log('initializing letters!');
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
        console.log('test');
        socket.broadcast.emit('wordupdate', tryword.innerHTML);
    }
}

socket.on('wordrefresh', function(html, id) {
    console.log('updating word for ' + id);
    var tryword = document.getElementById("testword-" + id);
    tryword.innerHTML = html;
});