import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useRef, useState } from 'react';

firebase.initializeApp({
  apiKey: "AIzaSyBQ1wDJ7d1h8Rga-8dZYGbsU_fbrx7uBls",
  authDomain: "chit-chat-26021.firebaseapp.com",
  projectId: "chit-chat-26021",
  storageBucket: "chit-chat-26021.appspot.com",
  messagingSenderId: "152023565082",
  appId: "1:152023565082:web:8996455b21ad7970e422a3",
  measurementId: "G-FQW7GWB9L6"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <h1>💬 Chit Chat</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn(){

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <h1 className='tagline'>Join in the fun conversation and bring along your people!</h1>
      <button className='sign-in' onClick={signInWithGoogle}>Sign In with Google</button>
      <p className='warning'>By joining chit-chat, you agree to the community guidelines.</p>
    </>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button className='sign-out' onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom(){
  const tmp = useRef();
  const msgRef = firestore.collection('messages');
  const query = msgRef.orderBy('createdAt').limit(25);

  const [formValue, setFormValue] = useState('');
  const [messages] = useCollectionData(query, {idField: 'id'});
  
  const sendMessage = async(e) => {
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    await msgRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });
    setFormValue('');
    tmp.current.scrollIntoView({behavior: 'smooth'})
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={tmp}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Say something nice"/>
        <button type="submit" disabled={!formValue}>↗️</button>
      </form>
    </>
  )
}

function ChatMessage(props){
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || "https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2Fs3.amazonaws.com%2Fappforest_uf%2Ff1485665415623x323958275606855740%2FAA_icon.png?w=&h=&auto=compress&dpr=1&fit=max"} alt="dp"/>
      <p>{text}</p>
    </div>
  </>)
}

export default App;
