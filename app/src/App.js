import logo from './logo.svg';
import './App.css';
import React, {useState} from "react"
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyDVoG5_mhAHWTwdtqx2_2qnK44VFoV_oLM",
  authDomain: "financi-auth-db.firebaseapp.com",
  projectId: "financi-auth-db",
  storageBucket: "financi-auth-db.appspot.com",
  messagingSenderId: "580139333662",
  appId: "1:580139333662:web:f2944c0e6f622ddaff560f",
  measurementId: "G-NZQG8C15FE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);





function App() {
  let [state,setState] = useState({
    username:'abcde',
    email:'abcd@gmail.com',
    password:'googleuser'
  })
  const onRegister = (e)=>{
    e.preventDefault();
    console.log(state)
    createUserWithEmailAndPassword(auth, state.email, state.password)
    .then(async (userCredential) => {
      // Signed in 
      const user = userCredential.user;
      // ...
      let response = await fetch("https://8000-gitpodsampl-templatesve-1pluvodmdgu.ws-us81.gitpod.io/api/customers",{method:"POST", mode:"no-cors", headers:{'content-type':'application/json'}, body:
      JSON.stringify({
        email:user.email,
        uid:user.uid,
        user_name: state.username
      })})
      let data = await response.json()
      console.log(data)

      console.log(user)
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(error)
      // ..
    });
    
  }
  const onLogin = (e)=>{
    e.preventDefault();
    console.log(state)
    signInWithEmailAndPassword(auth, state.email, state.password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      // ...
      console.log(user)
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(error)
    });

    
  }
  return (
    <div className="App">
      <form onSubmit={onRegister}>
        <h1>Sign up</h1>
        <input type='username' placeholder='username' defaultValue={state.email} onChange={(e)=>setState((prev)=>({...prev, username: e.target.value}))} />
        <input type='email' placeholder='email' defaultValue={state.email} onChange={(e)=>setState((prev)=>({...prev, email: e.target.value}))} />
        <input type='password' placeholder='password'  defaultValue={state.password} onChange={(e)=>setState((prev)=>({...prev, password: e.target.value}))}/>
        <button>sign up</button>
      </form> 
    <hr />
    <form onSubmit={onLogin}>
      <h1>Signin</h1>
    <input type='email' placeholder='email' defaultValue={state.email} onChange={(e)=>setState((prev)=>({...prev, email: e.target.value}))} />
    <input type='password' placeholder='password'  defaultValue={state.password} onChange={(e)=>setState((prev)=>({...prev, password: e.target.value}))}/>
    <button>sign in</button>
    </form> 

    </div>

  );
}

export default App;
