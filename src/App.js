import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSignInAlt, faBars, faSearch, faStepForward, faPlay, faSpinner} from '@fortawesome/free-solid-svg-icons'
import {Switch, Route, Link} from 'react-router-dom'
import firebase from 'firebase/app'

const API_KEY = "AIzaSyCwlrxe-0OpRgnkt31ng6LXGRGbTnX0Vb4";

class About extends Component {
  render() {
    return <main className="about">
      <h1>About Our App</h1>
      <section>
        <h3>App Description</h3>
        <p>
          The users of the application are guests in a space where Spotify music is played, in addition to hosts who play Spotify for their guests.
        </p>
        <p>
          Users will use the application to queue music and vote on changes to the current queue. That is, users have the ability to see the entire music queue. They may search up music and add it to the queue. Any songs in queue deemed too unpopular may be voted on to be removed from queue, or simply removed by the host. Queuing can be rate limited.
        </p>
        <p>
          This app will help solve the problem by abstracting and automating the process of queuing songs. This web app leverages the ubiquity of internet-connected devices to reduce the work on the host's part. Such abstraction has the added benefit of anonymizing the guests' preferences.
        </p>
      </section>
      <section>
        <h3>How to Use</h3>
        <ol>
          <li>Host clicks on a button to create a party, revealing a code.</li>
          <li>Guests click on a button to join a party using a code.</li>
          <li>Host begins playing music on Spotify like normal.</li>
          <li>Guests search for music and tap on results to add song to queue.</li>
          <li>Occasionally a pop-up may ask all users if they want to skip the current track or genre.
          </li>
        </ol>
      </section>
    </main>
  }
}

class Login extends Component {
  //handle signUp button
  handleSignUp = (event) => {
    event.preventDefault(); //don't submit

    this.props.signUpCallback(this.state.email, this.state.password);
    this.props.history.push("/")
  }
  //update state for specific field
  handleChange = (event) => {
    let field = event.target.name; //which input
    let value = event.target.value; //what value

    let changes = {}; //object to hold changes
    changes[field] = value; //change this field
    this.setState(changes); //update state
  }

  //handle signIn button
  handleSignIn = (event) => {
    event.preventDefault(); //don't submit
    this.props.signInCallback(this.state.email, this.state.password);
    this.props.history.push("/")

  }
  render() {
    return <main className="about">
      <form>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" name="email" onChange={this.handleChange}/>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" name="password" onChange={this.handleChange}/>
        <button className="action-btn" onClick={this.handleSignUp}>Sign-up</button>
        <button className="action-btn" onClick={this.handleSignIn}>Sign-in</button>
      </form>
    </main>
  }
}

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

  //Signs up user with firebase
  handleSignUp = (email, password) => {

    this.setState({errorMessage: null}); //clear any old errors

    firebase.auth().createUserWithEmailAndPassword(email, password).then(() => firebase.auth().currentUser).catch((error) => this.setState({errorMessage: error.message}));
  }

  //Sign in with firebase
  handleSignIn = (email, password) => {
    this.setState({errorMessage: null}); //clear any old errors
    firebase.auth().signInWithEmailAndPassword(email, password).then().catch((error) => this.setState({errorMessage: error.message}));
  }

  //Sign Out
  handleSignOut = () => {
    this.setState({errorMessage: null}); //clear any old errors
    firebase.auth().signOut().then(this.setState({errorMessage: "Signed Out Successfully"})).catch((error) => this.setState({errorMessage: error.message}));

  }

  constructor() {
    super()
    let mql = window.matchMedia('(min-width: 468px)');
    mql.addListener(this.mqlListener);
    //menuDisplay controls whether or not nav is shown
    this.state = {
      desktopMode: mql.matches,
      displayMenu: mql.matches,
      queue: [],
      loading: true
    }
  }

  componentDidMount() {
    let unregFunc = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({user: user});
      } else {
        this.setState({user: null});
      }
      this.setState({loading: false});
    });
    this.setState({authUnRegFunc: unregFunc});

  }

  componentWillUnmount() {
    this.state.authUnRegFunc();
  }
  //add/remove from song queue
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

  renderMain = (props) => {
    let newProps = props
    newProps.dequeue = this.dequeue;
    newProps.enqueue = this.enqueue;
    newProps.songQueue = this.state.queue;
    newProps.signedIn = !(this.state.user === undefined);
    newProps.user = this.state.user;
    return (<Main {...newProps}/>)
  }

  renderLogin = (props) => {
    let newProps = props;
    newProps.signUpCallback = this.handleSignUp;
    newProps.signInCallback = this.handleSignIn;
    return (<Login {...newProps}/>)
  }

  render() {

    if (this.state.loading) {
      return (<div className="center">
        <div className="centerChild">
          <FontAwesomeIcon spin="spin" icon={faSpinner} size="5x"/>
        </div>
      </div>)
    } else {
      return (<div>
        <Header signOutCallback={this.handleSignOut} signedIn={!(this.state.user === undefined)} displayMenu={this.state.displayMenu} menuCallback={this.toggleMenu}/> {this.state.errorMessage && <p className="alert">{this.state.errorMessage}</p>}
        <Switch>
          <Route exact path="/" render={this.renderMain}/>
          <Route exact path="/about" component={About}/>
          <Route exact path="/login" render={this.renderLogin}/>
          <Route path="/:roomCode" render={this.renderMain}></Route>
        </Switch>
        <Footer/>
      </div>);
    }
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
                dest: "/about",
                text: "About"
              }, {
                dest: "https://github.com/info340b-wi20/project-ajayk111",
                text: "GitHub"
              }
            ].map((el) => <MenuItem key={el.text} displayMenu={this.props.displayMenu} dest={el.dest} text={el.text}/>)

          }
          <MenuItem onClick={this.props.signOutCallback} key={"login"} displayMenu={this.props.displayMenu} dest={"/login"} text={this.props.signedIn
              ? "Log Out"
              : "Log In"}/>
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
        <a href="index.html">MusiQueue</a>
      </h1>
    </li>);
  }
}

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      room: undefined
    };
  }

  componentDidUpdate(prevProps) {

    if (this.state.room !== this.props.match.params.roomCode) {
      this.setState({room: this.props.match.params.roomCode});
    }

  }
  componentWillUnmount() {
    if (this.state.roomRef !== undefined) {
      this.state.roomRef.off();
    }
  }
  componentDidMount() {
    //let roomCode = "dummyValue";
    let roomCode = this.props.match.params.roomCode;
    this.setState({room: roomCode});

    //Need the timeout to prevent async
    setTimeout(() => {
      if (this.state.room !== undefined) {

        this.setState({roomRef: firebase.database().ref("rooms")});
        this.state.roomRef.once("value").then((snapshot) => {
          //Get room Firebase ID
          let obj = snapshot.val();
          let new_roomID = Object.keys(obj).filter((el) => obj[el].roomCode === this.state.room)[0]
          this.setState({roomID: new_roomID});

        });

      }
    }, 50)

  }
  render() {

    return (<main>
      <Dashboard roomRef={this.state.roomRef} roomID={this.state.roomID} user={this.props.user} signedIn={this.props.signedIn} room={this.state.room} history={this.props.history} dequeue={this.props.dequeue} songQueue={this.props.songQueue} enqueue={this.props.enqueue}/>
      <Queue roomRef={this.state.roomRef} roomID={this.state.roomID} dequeue={this.props.dequeue} songQueue={this.props.songQueue}/>
    </main>);
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

        if (song.id !== undefined) {
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
    return (<div tabIndex="0" role="button" className="card" onClick={() => addToQueue(song)}>
      <p className="song-title">{song.title}</p>
      <p className="song-artist">{song.artist}</p>
      <p className="song-length">{JSON.stringify(song)}</p>

      <div className="song-art">
        <img alt="" src={song.cover}/>
      </div>
    </div>);
  }
}

class QueueCard extends Component {
  render() {
    let song = this.props.song;
    let removeFromQueue = this.props.dequeueCallback;
    return (<div className="card" tabIndex="0" role="button">
      <button className="close-button" aria-label="Close Account Info Modal Box" onClick={() => removeFromQueue(song)}>&times;</button>
      <p className="song-title">{song.title}</p>
      <p className="song-artist">{song.artist}</p>
      <p className="song-length">{JSON.stringify(song)}</p>

      <div className="song-art">
        <img alt="" src={song.cover}/>
      </div>
    </div>);
  }
}

class MediaControls extends Component {
  render() {
    let player = this.props.player;
    return (<div className="media-controls">

      <button id="play" aria-label="play pause" onClick={(event) => {
          event.preventDefault();

          let playerState = player.current.player.getPlayerState();
          if (playerState === 1) {
            player.current.player.pauseVideo();
          } else if (playerState === 2) {
            player.current.player.playVideo();
          }
        }}>
        <FontAwesomeIcon icon={faPlay}/>
      </button>
      <button id="next" aria-label="next" onClick={() => {
          let duration = player.current.player.getDuration();
          player.current.player.seekTo(duration - 1);
        }}>
        <FontAwesomeIcon icon={faStepForward}/>
      </button>
    </div>);
  }
}

class RoomCodeDisplay extends Component {
  render() {

    return (<h2>{this.props.code}</h2>)
  }
}

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.player = React.createRef();
    this.state = {
      searchResults: [],
      playerVisible: false,
      showRoomInput: false
    }
  }

  showPlayer() {
    this.setState({playerVisible: true})
  }

  updateSearchResults = (songs) => {
    this.setState({searchResults: songs})
  }

  addToQueue = (song) => {

    if (this.props.songQueue === 0) {
      this.showPlayer()
    }
    //If the user is in a room
    if (this.props.room !== undefined) {
      //Add the song to the queue

      this.props.roomRef.child(this.props.roomID + "/queue").push(song);
    }
    this.player.current.player.loadVideoById(song.id);

    this.props.enqueue(song)
  }

  createRoom = () => {
    let code = Math.random().toString(36).substring(2, 6);
    let obj = {
      roomCode: code,
      host: this.props.user.uid,
      queue: {}
    }
    firebase.database().ref("rooms").push(obj).catch((error) => console.log(error));
    this.props.history.push("/" + code);

  }
  //Stores the value in the searchbox
  handleChange = (event) => {
    this.setState({roomToJoin: event.target.value});
  }
  render() {

    return (<div className="dashboard">
      <RoomCodeDisplay code={this.props.room}/>
      <p>
        <strong>Instructions:&nbsp;
        </strong>
        Select "Join room" if somebody is already hosting a listening session. Otherwise, click "Create room" to begin a session. Then, search for a song below and click to add it to the queue. Click on a song in the queue to remove it</p>
      <div>
        <div className="room-functions">
          <button disabled={!this.props.signedIn} type="button" id="join-room" className="action-btn" onClick={() => this.setState({showRoomInput: true})}>Join room</button>
          <button type="button" disabled={!this.props.signedIn} id="create-room" onClick={this.createRoom} className="action-btn">Create room</button>
        </div>
<form>
        <div style={{
            display: this.state.showRoomInput
              ? 'flex'
              : 'none'
          }} className="join-room-box">

          <button aria-label="search" id="search-button" onClick={() => {
            this.props.history.push("/"+this.state.roomToJoin);
            this.setState({showRoomInput: false})
          }}>
            <FontAwesomeIcon icon={faSignInAlt}/>
          </button>
          <label htmlFor="joinhbar"></label>
          <input type="text" onChange={this.handleChange} placeholder="Enter room code" name="joinbar" id="joinbar"></input>

        </div>
</form>
      </div>

      <SearchForm searchCallback={this.updateSearchResults}/>

      <div style={{
          display: this.state.playerVisible
            ? 'block'
            : 'none'
        }}>
        <YouTube songQueue={this.props.songQueue} dequeue={this.props.dequeue} ref={this.player} show={this.showPlayer} YTid="8tPnX7OPo0Q"/>
      </div>
      <MediaControls player={this.player}/>
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

class YouTube extends Component {
  constructor(props) {
    super(props);
    this.player = {};
  }
  componentDidMount() {
    let loadYT;
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
            if (event.data === YT.PlayerState.ENDED) {
              // console.log(this.props.songQueue.length);
              this.props.dequeue(this.props.songQueue[0]);
              // 1(this.props.songQueue[0]);
              if (this.props.songQueue.length > 0) {
                this.player.loadVideoById(this.props.songQueue[0].id)
              }

            }
          }
        },
        playerVars: {
          'origin': window.location.origin
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
  constructor(props) {
    super(props)
    this.state = {
      queue: []
    };
  }
  componentDidMount() {
    setTimeout(() => {

      if (this.props.roomID !== undefined) {
        this.props.roomRef.child(this.props.roomID).on('value', (snapshot) => {
          let queueObj = snapshot.val().queue
          if (queueObj !== undefined) {
            this.setState({
              queue: Object.values(snapshot.val().queue)
            });
          }
        })
      }
    }, 1000)
  }
  componentDidUpdate(prevProps) {}
  render() {

    return (<div className="queue">
      <div className="queue-header">Queue</div>
      <div className="card-container">
        {this.state.queue.map((el) => <QueueCard dequeueCallback={this.removeFromQueue} key={el.id} song={el}/>)}
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
    if (!dest.startsWith('http')) {
      return (<li className="item" style={{
          display: dispayString
        }}>

        <Link to={dest} onClick={this.props.onClick}>{text}</Link>
      </li>)
    } else {
      return (<li className="item" style={{
          display: dispayString
        }}>

        <a href={dest}>{text}</a>
      </li>)
    }

  }
}

class Toggle extends Component {
  render() {
    return (<li className="toggle" onClick={this.props.menuCallback}>
      <button className="toggle">
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
