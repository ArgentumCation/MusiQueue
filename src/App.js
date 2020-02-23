import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBars, faSearch, faStepForward, faPlay} from '@fortawesome/free-solid-svg-icons'

const API_KEY = "AIzaSyCwlrxe-0OpRgnkt31ng6LXGRGbTnX0Vb4";

class App extends Component {

  //Keeps track of whether or not we are in desktop mode, resets the menu
  mqlListener = () => {
    this.setState({
      desktopMode: !this.state.desktopMode,
      displayMenu: !this.state.desktopMode
    })
  }

  //Toggle menu visibility
  toggleMenu = () => {

    this.setState({
      displayMenu: !this.state.displayMenu
    });
  }

  constructor() {
    super()
    let mql = window.matchMedia('(min-width: 468px)');
    mql.addListener(this.mqlListener);
    //menuDisplay controls whether or not nav is shown
    this.state = {
      desktopMode: mql.matches,
      displayMenu: mql.matches,
      queue: []
    }
  }

  render() {
    return (<div><Header displayMenu={this.state.displayMenu} menuCallback={this.toggleMenu}/>
      <Main/>
      <Footer/>
    </div>);
  }
}

class Header extends Component {
  render() {
    return (<header>
      <nav>
        <ul className="menu">
          <Logo/> {
            [
              {
                dest: "/",
                text: "Home"
              }, {
                dest: "about.html",
                text: "About"
              }, {
                dest: "https://github.com/info340b-wi20/project-ajayk111",
                text: "GitHub"
              }
            ].map((el) => <MenuItem key={el.text} displayMenu={this.props.displayMenu} dest={el.dest} text={el.text}/>)
          }
          <Toggle menuCallback={this.props.menuCallback}/>
        </ul>
      </nav>
    </header>);
  }

}

class Logo extends Component {
  render() {
    return (<li className="logo">
      <h1>
        <a href="index.html">Queuer</a>
      </h1>
    </li>);
  }
}
class Main extends Component {
  render() {
    return (<main>
      <Dashboard/>
      <Queue/>
    </main>);
  }
}

class Instructions extends Component {
  render() {
    return (<p>
      <strong>Instructions:
      </strong>Select "Join room" if somebody is already hosting a listening session. Otherwise, click "Create room" to begin a session. Then, search for a song below and click to add it to the queue. Click on a song in the queue to remove it</p>);
  }
}

class SearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    }
  }
  //Stores the value in the searchbox
  handleChange = (event) => {
    this.setState({value: event.target.value});
  }
  search = (event) => {
    event.preventDefault();
    //TODO:  Clear Search Results

    //Make the API Request
    let query = this.state.value;
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=" + query + "&key=" + API_KEY, requestOptions).then(response => response.text()).then(result => {
      var results = JSON.parse(result).items;
      var songList = []
      for (var item of results) {
        //Process API Response

        var song = {
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          cover: item.snippet.thumbnails.default.url,
          id: item.id.videoId
        }

        if (song.id != undefined) {
          songList.push(song);

        }

      }
      this.props.searchCallback(songList);
    }).catch(error => console.log('error', error));
  }
  render() {
    return (<form>
      <div className="search">
        <button aria-label="search" id="search-button" onClick={this.search}>
          <FontAwesomeIcon icon={faSearch}/>

        </button>
        <label htmlFor="searchbar"></label>
        <input type="text" onChange={this.handleChange} placeholder="Search for a song" name="searchbar" id="searchbar"></input>
      </div>
    </form>);
  }
}

class SearchCard extends Component {
  render() {
    let song = this.props.song;
    let addToQueue = this.props.enqueueCallback;
    return (<div className="card" onClick={() => addToQueue(song)}>
      <p className="song-title">{song.title}</p>
      <p className="song-artist">{song.artist}</p>
      <p className="song-length">{JSON.stringify(song)}</p>

      <div className="song-art">
        <img src={song.cover}/>
      </div>
    </div>);
  }
}

class MediaControls extends Component {
  render() {
    return (<div className="media-controls">

      <button id="play" aria-label="play pause">
        <FontAwesomeIcon icon={faPlay}/>
      </button>
      <button id="next" aria-label="next">
        <FontAwesomeIcon icon={faStepForward}/>
      </button>
    </div>);
  }
}

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.player = React.createRef();
    this.state = {
      searchResults: [],
      queue: []
    }
  }

  updateSearchResults = (songs) => {
    this.setState({searchResults: songs})
  }

  addToQueue = (song) => {
    if (this.state.queue.length == 0) {
      console.log(song.id);

      //this.player.current.player.loadVideoById('8Oz8gCJy2-Q');
      this.player.current.player.loadVideoById(song.id);

    }
    this.state.queue.push(song);
  }

  render() {
    return (<div className="dashboard">
      <Instructions/>
      <div className="room-functions">
        <button type="button" id="join-room" className="btn btn-primary btn-lg">Join room</button>
        <button type="button" id="create-room" className="btn btn-secondary btn-lg">Create room</button>
      </div>
      <input type="text" id="room-input" placeholder="Enter room code"/>

      <SearchForm searchCallback={this.updateSearchResults}/>
      <YouTube ref={this.player} YTid="8tPnX7OPo0Q"/>

      <MediaControls/>
      <SearchResults enqueueCallback={this.addToQueue} songList={this.state.searchResults}/>
    </div>);
  }
}

class SearchResults extends Component {

  render() {
    let addToQueue = this.props.enqueueCallback;
    return (<div className="search-results">
      <div className="card-container">
        {
          (this.props.songList)
            ? this.props.songList.map((el) => <SearchCard enqueueCallback={addToQueue} song={el}/>)
            : ' '
        }
      </div>
    </div>);
  }
}
let loadYT;
class YouTube extends Component {
  constructor(props) {
    super(props);
    this.player = {};
  }
  componentDidMount() {
    if (!loadYT) {
      loadYT = new Promise((resolve) => {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
        window.onYouTubeIframeAPIReady = () => resolve(window.YT)
      })
    }
    loadYT.then((YT) => {
      this.player = new YT.Player('player', {
        videoId: this.props.YTid,
        events: {
          onReady: this.onPlayerReady,
          onStateChange: this.onPlayerStateChange
        }
      })
    })
  }

  onPlayerReady = (event) => {
    event.target.playVideo();

  }

  //Todo
  onPlayerStateChange = (event) => {
    if (typeof this.props.onStateChange === 'function') {
      this.props.onStateChange(event)
    }
  }

  render() {

    return (<div id='player'></div>)
  }
}

class Player extends Component {

  onPlayerReady(event) {
    event.target.playVideo();
  }

  loadPlayer() {
    var YT;
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    var player;
    function onYouTubeIframeAPIReady() {

      player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: 'M7lc1UVf-VE',
        events: {
          'onReady': this.onPlayerReady
        }
      });
    }

  }
  render() {
    this.loadPlayer();
    return (<div id="player"></div>);
  }
}

class Queue extends Component {
  render() {
    return (<div>
      <div className="queue-header">Queue</div>
      <div className="card-container"></div>
    </div>);
  }
}
class MenuItem extends Component {
  render() {
    let dest = this.props.dest;
    let text = this.props.text;
    let displayMenu = this.props.displayMenu;
    let dispayString = displayMenu
      ? "block"
      : "none";
    return (<li className="item" style={{
        display: dispayString
      }}>
      <a href={dest}>{text}</a>
    </li>)
  }
}

class Toggle extends Component {
  render() {
    return (<li className="toggle" onClick={this.props.menuCallback}>
      <button>
        <FontAwesomeIcon icon={faBars}/>

      </button>
    </li>);
  }
}

class Footer extends Component {
  render() {
    return (<footer>
      &copy; 2020 Ajay Kristipati, Daniel Lin, Sailesh Sivakumar
    </footer>);
  }
}

export default App;
