import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import firebase from 'firebase/app'
import 'firebase/auth';
import 'firebase/database';
import {BrowserRouter} from 'react-router-dom'


const firebaseConfig = {
  // ...
};
firebase.initializeApp(firebaseConfig);



ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('root'));
