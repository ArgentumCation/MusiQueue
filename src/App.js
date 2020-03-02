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

  enqueue = (song) => {
    let queue = this.state.queue;
    queue.push(song);
    this.setState({queue: queue})
  }
  dequeue = (song) => {
    let queue = this.state.queue;
    const index = queue.indexOf(song, 0)
    if (index > -1) {
      queue.splice(index, 1)
    }
    this.setState({queue: queue})
  }

  render() {
    return (<div><Header displayMenu={this.state.displayMenu} menuCallback={this.toggleMenu}/>
      <Main dequeue={this.dequeue} enqueue={this.enqueue} songQueue={this.state.queue}/>
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
      <Dashboard dequeue={this.props.dequeue} songQueue={this.props.songQueue} enqueue={this.props.enqueue}/>
      <Queue dequeue={this.props.dequeue} songQueue={this.props.songQueue}/>
    </main>);
  }
}

class Instructions extends Component {
  render() {
    return (<p>
      <strong>Instructions:
      </strong> Select "Join room" if somebody is already hosting a listening session. Otherwise, click "Create room" to begin a session. Then, search for a song below and click to add it to the queue. Click on a song in the queue to remove it</p>);
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
    let myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");

    let requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=" + query + "&key=" + API_KEY, requestOptions).then(response => response.text()).then(result => {
      let results = JSON.parse(result).items;
      let songList = []
      for (const item of results) {
        //Process API Response

        let song = {
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

class QueueCard extends Component {
  render() {
    let song = this.props.song;
    let removeFromQueue = this.props.dequeueCallback;
    return (<div className="card">
      <button className="close-button" aria-label="Close Account Info Modal Box" onClick={() => removeFromQueue(song)}>&times;</button>
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
      playerVisible: false
    }
  }

  showPlayer() {
    this.setState({playerVisible: true})
  }

  updateSearchResults = (songs) => {
    this.setState({searchResults: songs})
  }

  addToQueue = (song) => {
    if (this.props.songQueue == 0) {
      this.showPlayer()

      this.player.current.player.loadVideoById(song.id);

    }
    this.props.enqueue(song)

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

      <div style={{
          display: this.state.playerVisible
            ? 'block'
            : 'none'
        }}>
        <YouTube songQueue={this.props.songQueue} dequeue={this.props.dequeue} ref={this.player} show={this.showPlayer} YTid="8tPnX7OPo0Q"/>
      </div>
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
            ? this.props.songList.map((el) => <SearchCard enqueueCallback={addToQueue} key={el.id} song={el}/>)
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
          onStateChange: (event) => {
            if (event.data == YT.PlayerState.ENDED) {
              console.log(this.props.songQueue.length);
              this.props.dequeue();
              console.log(this.props.songQueue[0]);
              if (this.props.songQueue.length > 0) {
                this.player.loadVideoById(this.props.songQueue[0].id)
              }

            }
          }
        }
      });

    })
  }

  onPlayerReady = (event) => {
    event.target.playVideo();
  }

  render() {
    return (<div id='player'></div>)
  }
}

class Queue extends Component {
  removeFromQueue = (song) => {
    this.props.dequeue(song)
  }
  componentDidUpdate(prevProps) {}
  render() {
    return (<div>
      <div className="queue-header">Queue</div>
      <div className="card-container">
        {this.props.songQueue.map((el) => <QueueCard dequeueCallback={this.removeFromQueue} key={el.id} song={el} 
           />)}
      </div>
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
