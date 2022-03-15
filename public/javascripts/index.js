import '@babel/polyfill';
import {activateLogin, logout, resetPassword, sendResetPassword} from './login';
import {
    save,
    editMessage,
    copyId, activateTTs, initWarningModal
} from './repository_edit';
import {search, createRepos, createRequest, leaveRepos, deleteRepos} from "./repository"
import {changeName, changePassword, removeRequests, upgrade} from "./user_settings";
import {signup} from "./signup";

// DOM ELEMENTS
export const language = document.getElementById("language").innerText;

const loginForm = document.getElementById('loginCard');
const signupForm = document.getElementById("signupCard");
const forgotForm = document.getElementById("forgotForm");
const resetPassForm = document.getElementById("resetPassForm");

const saveButton = document.getElementById("saveSettings");
const searchInput = document.getElementById("search-input");
const disCreatebutton = document.getElementById("discardCreate");
const createButton = document.getElementById("submitCreate");
const requestButton = document.getElementById("submitRequest");
const requestDiscardButton = document.getElementById("discardRequest");

const nameDiscardButton = document.getElementById("nameDiscard");
const nameSubmitButton = document.getElementById("nameSubmit");
const upgradeSubmitButton = document.getElementById("upgradeSubmit");
const upgradeDiscardButton = document.getElementById("upgradeDiscard");
const passSubmitButton = document.getElementById("passSubmit");
const passDiscardButton = document.getElementById("passDiscard");
const requestCancelButtons = document.getElementsByClassName("request-cancel-btn");
const idCopyButton = document.getElementById("idCopyButton");
const logoutButton = document.getElementById("logout-icon");

const warningModal = document.getElementById("warningModal")
const requestMessageModal = document.getElementById('requestMessageModal');
const leaveModal = document.getElementById("leaveModal");
const deleteModal = document.getElementById("deleteModal");

if (warningModal) {
    initWarningModal(warningModal);
}
if (disCreatebutton) {
    createRepos(disCreatebutton, createButton);
}
if (requestButton) {
    createRequest(requestButton, requestDiscardButton);
}

if (saveButton) {
    save(saveButton);
}

if (searchInput) {
    search(searchInput);
}
if (nameDiscardButton) {
    changeName(nameDiscardButton, nameSubmitButton);
    upgrade(upgradeDiscardButton, upgradeSubmitButton);
}
if (requestMessageModal) {
    editMessage(requestMessageModal);
}
if (requestCancelButtons) {
    removeRequests(requestCancelButtons);
}
if (idCopyButton) {
    activateTTs();
    copyId(idCopyButton);
}
if (passSubmitButton) {
    changePassword(passDiscardButton, passSubmitButton);
}

if (leaveModal) {
    leaveRepos(leaveModal);
}
if (deleteModal) {
    deleteRepos(deleteModal);
}
if (loginForm) {
    activateLogin(loginForm);
}
if (signupForm) {
    signup(signupForm);
}
if (logoutButton) {
    logout(logoutButton);
}

if (forgotForm) {
    sendResetPassword(forgotForm);
}

if(resetPassForm){
    resetPassword(resetPassForm);
}