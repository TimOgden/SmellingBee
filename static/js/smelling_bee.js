var socket = io();
var cursorsElement = document.getElementById('cursors');
var usersElement = document.getElementById('users');
var pointsSliderElement = document.getElementById('pointsSlider');
var pointsCategoryElement = document.getElementById('pointsCategory');
var email = '';

var letters = '';

var words = {};

function loggedInThroughGoogle(googleUser) {
    $.ajax({
        type: 'POST',
        url: '/loginGoogle',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(googleUser),
        success: function(data) {
            socket.emit('google signin', data);
            email = data.email;
        },
        error: function(error) {
            console.log(error);
        }
    });

    $.ajax({
        type: 'GET',
        url: '/words',
        contentType: 'application/json',
        dataType: 'json',
        success: function(data) {
            words = data;
            letters = words.all_letters;
            initialize_letters(words.all_letters);
            refreshFoundWords(words);
            updatePoints(words);
        },
        error: function(error) {
            console.log(error);
        }    
    })
    
}

function updatePoints(words) {
    pointsSliderElement.setAttribute('max', words.max_points);
    pointsSliderElement.setAttribute('value', words.current_points);

    var score = words.current_points / words.max_points;
    var scoreCategory = 'Beginner';

    if(score === 1) {
        scoreCategory = 'Queen Bee';
    } else if(score >= .7) {
        scoreCategory = 'Genius';
    } else if(score >= .5) {
        scoreCategory = 'Amazing';
    } else if(score >= .4) {
        scoreCategory = 'Great';
    } else if(score >= .25) {
        scoreCategory = 'Nice';
    } else if(score >= .15) {
        scoreCategory = 'Solid';
    } else if(score >= .08) {
        scoreCategory = 'Good';
    } else if(score >= .05) {
        scoreCategory = 'Moving Up';
    } else if(score >= .02) {
        scoreCategory = 'Good Start';
    }
    pointsCategoryElement.innerHTML = scoreCategory;
}


function refreshFoundWords(words) {
    var foundWords = document.getElementById('foundWords');
    foundWords.innerHTML = '';
    for(var i = 0; i < words.all_words.length; i++) {
        if(words.all_words[i].foundBy) {
            var newWordElement = document.createElement('li');
            newWordElement.setAttribute('class', 'foundWordItem');
            var newWord = document.createElement('p');
            var userImage = document.createElement('img');
            // userImage.setAttribute('id', `profile-picture-${id}`);
            userImage.setAttribute('referrer', 'no-referrer');
            userImage.setAttribute('src', words.all_words[i].profilePicture);
            userImage.setAttribute('class', 'profile-picture');
            // userImage.setAttribute('style', `border-color: rgb(${val.color.slice(1, -1)})`);

            newWord.innerHTML = words.all_words[i].word.charAt(0) + words.all_words[i].word.slice(1).toLowerCase();
            newWordElement.appendChild(newWord);
            if (words.all_words[i].profilePicture) {
                newWordElement.appendChild(userImage);
            }
            
            foundWords.appendChild(newWordElement);
        }
    }
}

socket.on('wordsubmit', function(words) {
    this.words = words;
    refreshFoundWords(words);
    updatePoints(words);
});

socket.on('pointsscore', function(obj) {
    if(obj.alreadyFound) {
        wrongInput('#already-found', obj.id);
    }
    else if(!obj.hasCenterLetter) {
        wrongInput('#miss-center', obj.id);
    }
    else if(!obj.validWord) {
        wrongInput('#invalid-word', obj.id);
    } else if(obj.points) {
        showPoints(obj.points);
        if(obj.isPangram) {
            rightInput('#pangram');
        } else if(obj.points < 5) {
            rightInput('#good');
        } else if(obj.points < 7) {
            rightInput('#great');
        } else {
            rightInput('#amazing');
        }
        
    }
});

socket.on('redraw cursors', function(cursors_obj) {
    cursorsElement.innerHTML = '';
    usersElement.innerHTML = '';
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
    row.setAttribute('id', 'cursorrow-' + id);
    var inputword = document.createElement('p');
    inputword.setAttribute('id', 'inputword-' + id);
    var testword = document.createElement('span');
    testword.setAttribute('id', 'testword-' + id);
    testword.setAttribute('class', 'testword');
    testword.innerHTML = val.tryword ? val.tryword : '';
    testword.setAttribute('style', `color: rgb(${val.color.slice(1,-1)})`);

    var cursor = document.createElement('span');
    cursor.setAttribute('id', 'cursor-' + id);
    cursor.setAttribute('class', 'cursor');
    cursor.setAttribute('style', `color: rgb(${val.color.slice(1,-1)})`);
    cursor.innerHTML = '|';

    inputword.appendChild(testword);
    inputword.appendChild(cursor);
    row.appendChild(inputword);
    cursors.appendChild(row);

    var users = document.getElementById('users');
    var userImage = document.createElement('img');
    userImage.setAttribute('referrerpolicy', 'no-referrer');
    userImage.setAttribute('id', `profile-picture-${id}`);
    userImage.setAttribute('src', val.profilePicture);
    userImage.setAttribute('class', 'profile-picture');
    userImage.setAttribute('style', `border-color: rgb(${val.color.slice(1, -1)})`);
    users.appendChild(userImage);
}

socket.on('user disconnection', function(id) {
    var row = document.getElementById('inputword-' + id);
    if (row) row.parentElement.remove();

    var img = document.getElementById(`profile-picture-${id}`);
    if (img) img.remove();
});

//Creates the hexagon grid of 7 letters with middle letter as special color
function initialize_letters(letters){
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

function toggleDropdown() {
    var foundWordsContainer = document.getElementById('foundWordsContainer');
    if(foundWordsContainer.classList.contains('dropped')) {
        foundWordsContainer.classList.remove('dropped');
    } else {
        foundWordsContainer.classList.add('dropped');
    }
}

function clickLetter(char) {
    return function curried_func(e){
        var tryword = document.getElementById("testword-" + socket.id);
        tryword.innerHTML = tryword.innerHTML + char.toUpperCase();
        socket.emit('wordupdate', tryword.innerHTML);
    }
}

function wrongInput(selector, id){
    $(selector).fadeIn(1000);
    $(selector).fadeOut(500);
    // $(`#cursor-${id}`).hide();
    $( `#cursorrow-${id}` ).effect("shake", {times:2.5}, 250, function(){
        clearInput();
        // $(`#cursor-${id}`).show();
      } );
  
  }
  
  function rightInput(selector, id){
    $(selector).fadeIn(200).delay(500).fadeOut(1500);
    
    clearInput(id);
  }
  
  function clearInput(id){
    $("#testword-" + id).empty();
  }
  
  function showPoints(pts){
    $(".points").html("+" + pts);
  
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
    
    initialize_letters(letters)
}

function deleteLetter() {
    var tryWord = document.getElementById('testword-' + socket.id);
    if (tryWord.innerHTML.length > 0) {
        tryWord.innerHTML = tryWord.innerHTML.slice(0,-1);
    }
    socket.emit('wordupdate', tryWord.innerHTML);
}

function submitWord() {
    var tryWord = document.getElementById('testword-' + socket.id);
    if (tryWord.innerHTML.length === 0) {
        return;
    }

    if(tryWord.innerHTML.length < 4){ 
        wrongInput("#too-short", socket.id);
        return;
    }

    socket.emit('wordsubmit', tryWord.innerHTML, email);
    tryWord.innerHTML = '';
    socket.emit('wordupdate', tryWord.innerHTML);
}

socket.on('wordrefresh', function(html, id) {
    var tryword = document.getElementById("testword-" + id);
    tryword.innerHTML = html;
});

$(document).on('keydown', function(e) {
    var tryword = document.getElementById('testword-' + socket.id);
    if(e.key === 'Enter') {
        submitWord();
        return;
    }
    if(e.key === 'Backspace') {
        var currentWord = tryword.innerHTML;
        if (currentWord.length) {
            tryword.innerHTML = currentWord.slice(0, currentWord.length - 1);
        }
        return;
    }
    
    var letter = e.key.toUpperCase();
    if(/[A-Z]/.test(letter) && letters.includes(letter)) {
        tryword.innerHTML += letter;
    }
});