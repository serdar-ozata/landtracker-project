import '@babel/polyfill';
import {login, logout} from './login';
//import {updateSettings} from './updateSettings';
import axios from "axios";

// DOM ELEMENTS
const loginForm = document.querySelector('.card-login');
if (loginForm)

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