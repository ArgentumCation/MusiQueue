var state = {
  queue: []
}
$("#search-button")[0].addEventListener('click', function(event) {

  //Clear Search Results
  $(".search-results .card-container")[0].innerHTML = "";
  event.preventDefault();
  var query = $("#searchbar")[0].value;


  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=" + query + "&key=" + API_KEY, requestOptions)
    .then(response => response.text())
    .then(result => {
      results = JSON.parse(result).items;
      for (item of results) {
        // console.log(item);

        song = {
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          cover: item.snippet.thumbnails.default.url,
          id: item.id.videoId
        }
        if (song.id != undefined) {
          card = generateCard(song);
          card.addEventListener('click', function(event) {
            song = JSON.parse($($(event.target).closest('.card')[0]).children()[2].innerHTML);
            // console.log(song);
            state.queue.push(song);
            renderQueue();
          })
          $(".search-results .card-container")[0].appendChild(card)
        }
      }
    })
    .catch(error => console.log('error', error));
})

let roomFunctions = document.querySelector('.room-functions');
$("#join-room")[0].addEventListener('click', function() {
  newForm = document.createElement('input');
  newForm.setAttribute('placeholder', 'Enter room code');
  roomFunctions.appendChild(newForm);
  $("#join-room")[0].disabled = true;
})
$("#create-room")[0].addEventListener('click', function() {
  newP = document.createElement('p');
  newP.textContent = "Room code: VFWR";
  roomFunctions.appendChild(newP);
  $("#create-room")[0].disabled = true;
})

//Draw the queue
function renderQueue() {
  $('.card-container')[1].innerHTML = "";
  for (var song of state.queue) {
    card = generateCard(song);

    //Event listener to remove the a song from queue
    card.addEventListener('click', function(event) {
      var song = JSON.parse($($(event.target).closest('.card')[0]).children()[2].innerHTML);
      var songIndex = state.queue.findIndex((element) => {
        return element.id == song.id;
      });
      state.queue.splice(songIndex,1);
      renderQueue();
    })
    $('.card-container')[1].appendChild(card);
  }
}


function generateCard(song) {
  var card = document.createElement('div');
  card.className = "card";

  var songTitle = document.createElement('p');
  songTitle.innerHTML = song.title;
  songTitle.className = "song-title";
  var songArtist = document.createElement('p');
  songArtist.className = "song-artist";
  songArtist.innerHTML = song.artist;
  var songJSON = document.createElement('p');
  songJSON.className = "song-length";
  songJSON.innerHTML = JSON.stringify(song);



  var image = document.createElement('div');
  image.className = "song-art"
  var picture = document.createElement('img')
  picture.src = song.cover;
  image.appendChild(picture);
  card.appendChild(songTitle);
  card.appendChild(songArtist);
  card.appendChild(songJSON);
  card.appendChild(image);
  return card;
}
