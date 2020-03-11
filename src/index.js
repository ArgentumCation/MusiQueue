import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import firebase from 'firebase/app'
import 'firebase/auth';
import 'firebase/database';
import {BrowserRouter} from 'react-router-dom'


const firebaseConfig = {
  apiKey: "AIzaSyA2iLQIq3crzJzsi4YF1ZsKrQS0kWNS06Y",
  authDomain: "musiqueue-9d70b.firebaseapp.com",
  databaseURL: "https://musiqueue-9d70b.firebaseio.com",
  projectId: "musiqueue-9d70b",
  storageBucket: "musiqueue-9d70b.appspot.com",
  messagingSenderId: "186168963813",
  appId: "1:186168963813:web:3488f84b0e2118f8545a0c"
};
firebase.initializeApp(firebaseConfig);



ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('root'));
