//const API_KEY = "AIzaSyAyXRt8Od6-FVEI6LbOQQfsPI4y8iAJ5Ro";
const API_KEY = "AIzaSyCwlrxe-0OpRgnkt31ng6LXGRGbTnX0Vb4";
var player;
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
      var results = JSON.parse(result).items;
      for (var item of results) {
        // console.log(item);

        var song = {
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          cover: item.snippet.thumbnails.default.url,
          id: item.id.videoId
        }
        if (song.id != undefined) {
          var card = generateCard(song);
          //Add cards to queue
          card.addEventListener('click', function(event) {
            song = JSON.parse($($(event.target).closest('.card')[0]).children()[2].innerHTML);
            // console.log(song);
            if(state.queue.length == 0){
              player.loadVideoById(song.id);
              player.playVideo();
            }
            state.queue.push(song);

            renderQueue();
          })
          $(".search-results .card-container")[0].appendChild(card)
        }
      }
    })
    .catch(error => console.log('error', error));
})


//Play Button
$("#play")[0].addEventListener('click',function(event){
  event.preventDefault();
  var playerState = player.getPlayerState();
  if(playerState == 1)
  {
    player.pauseVideo();
  }
  else if (playerState == 2){
    player.playVideo();
  }
})

$("#next")[0].addEventListener('click',function(){
    var duration = player.getDuration();
    player.seekTo(duration-1);
});

let roomFunctions = document.querySelector('.room-functions');
let newForm = document.createElement('input');
$("#join-room")[0].addEventListener('click', function() {
  newForm = document.createElement('input');
  newForm.setAttribute('placeholder', 'Enter room code');
  newForm.setAttribute('id', 'room-input');
  roomFunctions.appendChild(newForm);
  $("#join-room")[0].disabled = true;
})
$("#create-room")[0].addEventListener('click', function() {
  var newP = document.createElement('p');
  newP.textContent = "Room code: VFWR";
  roomFunctions.appendChild(newP);
  $("#create-room")[0].disabled = true;
})
// newForm.addEventListener('keydown', function(input) {
//   console.log(input);
// })

//Draw the queue
function renderQueue() {
  $('.card-container')[1].innerHTML = "";
  for (var song of state.queue) {
    var card = generateCard(song);
    card.innerHTML += "<button aria-label='Close Account Info Modal Box'>&times;</button>";


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
  /*var playlist = [];
  for(var song of state.queue){
    playlist.push(song.id);
  }
  player.cuePlaylist(playlist);*/
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
