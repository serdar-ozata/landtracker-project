import '@babel/polyfill';
import {login, logout} from './login';
import {reject, kick, accept, authorizeEdit, makeAdmin, deauthorize, save} from './repository_edit';
import {search, createRepos, createRequest} from "./repository"
import axios from "axios";

// DOM ELEMENTS
const loginForm = document.querySelector('.card-login');
const kickButtons = document.querySelectorAll(".kick-user");
const rejectButtons = document.querySelectorAll(".btn-reject");
const acceptButtons = document.querySelectorAll(".btn-accept");
const authButtons = document.querySelectorAll(".btn-auth");
const adminButtons = document.querySelectorAll(".btn-admin");
const deauthButtons = document.querySelectorAll(".btn-deauth");
const saveButton = document.getElementById("saveSettings");
const searchInput = document.getElementById("search-input");
const disCreatebutton = document.getElementById("discardCreate");
const createButton = document.getElementById("submitCreate");
const requestButton = document.getElementById("submitRequest");
const requestDiscardButton = document.getElementById("discardRequest");
if (loginForm){
    axios({
        method: 'GET',
        url: 'http://localhost:3000/loggedIn',
    })
        .then(res => {
            window.location.assign("/repository")
        })
        .catch(err => {
            console.log(err);
            loginForm.addEventListener('submit', e => {
                e.preventDefault();
                const email = document.getElementById('LoginEmail').value;
                const password = document.getElementById('LoginPassword').value;
                login(email, password);
            })
        });
}

if(disCreatebutton){
    createRepos(disCreatebutton, createButton);
}
if(requestButton){
    createRequest(requestButton, requestDiscardButton);
}
if (kickButtons) {
    kickButtons.forEach((value, key) => {
       kick(value);
    });
}
if (rejectButtons) {
    rejectButtons.forEach((value, key) => {
        reject(value)
    });
}

if(acceptButtons){
    acceptButtons.forEach((value, key) => {
        accept(value)
    });
}
if(authButtons){
    authButtons.forEach((value, key) => {
        authorizeEdit(value)
    });
}
if(adminButtons){
    adminButtons.forEach((value, key) => {
        makeAdmin(value)
    });
}
if(deauthButtons){
    deauthButtons.forEach((value, key) => {
        deauthorize(value)
    });
}
if(saveButton){
    save(saveButton);
}

if(searchInput){
    search(searchInput);
}
