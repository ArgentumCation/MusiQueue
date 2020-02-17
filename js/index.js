$("#search-button")[0].addEventListener('click', function (event) {
    event.preventDefault();
    var query = $("#searchbar")[0].value;
    const API_KEY = "AIzaSyAyXRt8Od6-FVEI6LbOQQfsPI4y8iAJ5Ro";

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
                $(".search-results .card-container")[0].appendChild(
                    generateCard(
                        item.snippet.title,
                        item.snippet.channelTitle,
                        item.snippet.thumbnails.default.url))
            }
        }
        )
        .catch(error => console.log('error', error));
})

function generateCard(title, artist, img, length = undefined) {
    var card = document.createElement('div');
    card.className = "card";

    var songTitle = document.createElement('p');
    songTitle.innerHTML = title;
    songTitle.className = "song-title";
    var songArtist = document.createElement('p');
    songArtist.className = "song-artist";
    songArtist.innerHTML = artist;
    var songLength = document.createElement('p');
    songLength.className = "song-length";

    if (length != undefined) {
        songLength.innerHTML = length;
    }


    var image = document.createElement('div');
    image.className = "song-art"
    var picture = document.createElement('img')
    picture.src = img;
    image.appendChild(picture);
    card.appendChild(songTitle);
    card.appendChild(songArtist);
    card.appendChild(songLength);
    card.appendChild(image);
    return card;
}


