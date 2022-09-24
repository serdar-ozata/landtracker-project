//import '@babel/polyfill';
import {activateLogin, logout, resetPassword, sendResetPassword} from './login';
import {activateTTs, copyId, editMessage, initWarningModal, save} from './repository_edit';
import {createRepos, createRequest, deleteRepos, leaveRepos, repoSearch} from "./repository"
import {
    changeAreaPreference,
    changeLocationPreference,
    changeName,
    changePassword, changeZoomPreference,
    removeRequests,
    upgrade
} from "./user_settings";
import {signup} from "./signup";
import {setupList, setupMap} from "./assets";

// dictionary
export const dictionary = {
    def_err: {
        tr: "İsteğin ile ilgili bir sıkıntı var. Lütfen daha sonra tekrar dene. Hata Kodu: ",
        en: "There is something wrong in your request. Please try again later. Error Code: "
    },
    s_name: {
        tr: "İsmin başarıyla değiştirildi.",
        en: "Your name has been changed successfully!"
    },
    s_upgrade: {
        tr: "Hesabın yükseltildi.",
        en: "Your account has been upgraded. You are a premium user now!"
    },
    s_pass: {
        tr: "Şifren başarıyla değiştirildi.",
        en: "Your password has been successfully changed!"
    }, r_sent: {
        tr: "İsteğiniz gönderildi.",
        en: "Request sent successfully."
    },
    r_joined: {
        tr: "Depoya katıldınız.",
        en: "You have joined to the repository."
    },
    d_left: {
        en: "You left",
        tr: "Ayrıldığınız depo"
    },
    d_delete: {
        en: "You deleted",
        tr: "Sildiğiniz depo"
    },
    c_tt_init: {
        tr: "Panoya kopyala",
        en: "Copy to clipboard"
    },
    c_tt_done: {
        tr: "Kopyalandı",
        en: "Copied"
    },
    u_upgrade_1: {
        en: "Are you sure about allowing the user",
        tr: ""
    },
    u_upgrade_2: {
        en: "to edit this repository?",
        tr: "adlı kullanıcısına depoyu düzenleme yetkisi vermek istediğinize emin misiniz?"
    },
    u_kick_1: {
        en: "Are you sure about kicking",
        tr: ""
    },
    u_kick_2: {
        en: " ?",
        tr: "adlı kullanıcıyı atmak istediğinizden emin misiniz?"
    },
    u_admin_1: {
        en: "Are you sure about making the user",
        tr: ""
    },
    u_admin_2: {
        en: "admin? This means you will no longer be the owner of this repository.",
        tr: "adlı kullancıyı yönetici yapmak istediğinize emin misiniz? Bu ayrıca sizi yöneticilikten düşürücektir."
    },
    u_deauth_1: {
        en: "Are you sure about deauthorizing ",
        tr: ""
    },
    u_deauth_2: {
        en: "?",
        tr: "adlı kullanıcının düzenleme yetkisini almak istediğinize emin misiniz?"
    },
    r_message: {
        en: "s message",
        tr: "nın mesajı"
    },
    s_asset: {
        tr: "Varlık başarıyla eklendi.",
        en: "Asset added successfully!"
    },
    t_notselect: {
        tr: "Devam etmek için bir nokta seçin",
        en: "Select a point from the map to continue",
    },
    t_select: {
        tr: "Nokta kaydedildi",
        en: "Point saved"
    },
    d_text1: {
        en: "Are you sure about deleting ",
        tr: ""
    },
    d_text2: {
        en: " ?",
        tr: "'yı silmek istediğinize emin misiniz?"
    },
    b_save: {
        en: "Save",
        tr: "Kaydet"
    },
    b_saving: {
        en: "Saving",
        tr: "Kaydediliyor"
    },
    b_edit: {
        en: "Edit",
        tr: "Düzenle"
    },
    b_cancel: {
        en: "Cancel",
        tr: "İptal Et"
    },
    s_edit: {
        en: "Changes have been applied successfully",
        tr: "Değişiklikler başarıyla uygulandı"
    },
    d_success: {
        en: "Asset deleted",
        tr: "Varlık silindi"
    },
    b_send: {
        en: "Send",
        tr: "Gönder"
    },
    b_sending: {
        en: "Sending",
        tr: "Gönderiliyor"
    },
    b_upgrading: {
        en: "Upgrading",
        tr: "Yükseltiliyor"
    },
    s_a_unit: {
        en: "The preferences have changed succesfully",
        tr: "Tercihleriniz başarıyla değiştirildi"
    }
}

// DOM ELEMENTS

export const language = document.getElementById("language").innerText;

const loginForm = document.getElementById('loginCard');
const signupForm = document.getElementById("signupCard");
const forgotForm = document.getElementById("forgotForm");
const resetPassForm = document.getElementById("resetPassForm");

const saveButton = document.getElementById("saveSettings");
const repositorySearchInput = document.getElementById("repository-search-input");
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

const areaPreferenceSubmit = document.getElementById("areaSubmit");
const locationSubmit = document.getElementById("locationSubmit");
const zoomSubmit = document.getElementById("zoomSubmit");

const listSearchInput = document.getElementById("list-search-input");

const map = document.getElementById("map");


if (warningModal) {
    initWarningModal(warningModal);
}
if (disCreatebutton) {
    createRepos(disCreatebutton, createButton);
}
if (requestButton) {
    createRequest(requestButton, requestDiscardButton);
}
if (areaPreferenceSubmit) {
    const areaPreferenceDiscard = document.getElementById("areaDiscard");
    changeAreaPreference(areaPreferenceDiscard, areaPreferenceSubmit);
}
if (saveButton) {
    save(saveButton);
}
if (listSearchInput) {
    setupList(listSearchInput)
}
if (repositorySearchInput) {
    repoSearch(repositorySearchInput);
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

if (resetPassForm) {
    resetPassword(resetPassForm);
}
if(locationSubmit){
    const locationDiscard = document.getElementById("locationDiscard");
    changeLocationPreference(locationDiscard,locationSubmit);
}
if(zoomSubmit){
    const zoomDiscard = document.getElementById("zoomDiscard");
    changeZoomPreference(zoomDiscard, zoomSubmit);
}

if (map) {
    setupMap();
}