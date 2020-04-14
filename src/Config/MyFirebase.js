import firebase from 'firebase'

const firebaseConfig = {
    apiKey: "AIzaSyDZQfW21jTrcYI4plDTTPuvPMjJ_pueHM4",
    authDomain: "awesomechat-d3b95.firebaseapp.com",
    databaseURL: "https://awesomechat-d3b95.firebaseio.com",
    projectId: "awesomechat-d3b95",
    storageBucket: "awesomechat-d3b95.appspot.com",
    messagingSenderId: "160099855494",
    appId: "1:160099855494:web:75deb414a21bd5885ab507",
    measurementId: "G-PLLFCMYE0L"
};

firebase.initializeApp(firebaseConfig)
firebase.firestore().settings({
    timestampsInSnapshots: true
})

export const myFirebase = firebase
export const myFirestore = firebase.firestore()
export const myStorage = firebase.storage()
