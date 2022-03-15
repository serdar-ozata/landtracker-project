import axios from "axios";
import isAlphanumeric from 'validator/lib/isAlphanumeric';
import isStrongPassword from "validator/es/lib/isStrongPassword";
import {language} from "./index";

const active = "custom-feedback-active";
const toastSuccess = document.getElementById("toastSuccess");
const toastMessage = document.getElementById("toast-message");
const toastError = document.getElementById("toastError");
const toastErrorCode = document.getElementById("toast-err-code");
const toastErrorMessage = document.getElementById("toast-err-message");

const dictionary = {
    def_err:{
        tr: "İsteğin ile ilgili bir sıkıntı var. Lütfen daha sonra tekrar dene. Hata Kodu: ",
        en: "There is something wrong in your request. Please try again later. Error Code: "
    },
    s_name:{
        tr: "İsmin başarıyla değiştirildi.",
        en: "Your name has been changed successfully!"
    },
    s_upgrade:{
        tr: "Hesabın yükseltildi.",
        en: "Your account has been upgraded. You are a premium user now!"
    },
    s_pass:{
        tr: "Şifren başarıyla değiştirildi.",
        en: "Your password has been successfully changed!"
    }
}

const showSuccess = (message) => {
    toastMessage.innerText = message;
    const toast = new bootstrap.Toast(toastSuccess);
    toast.show()
}

export const validateName = (input, feedbacks) => {
    const val = input.value.trim();
    const activeElement = input.parentElement.getElementsByClassName(active);
    if (activeElement.length > 0) {
        activeElement[0].classList.remove(active);
    }
    if (val.length === 0) {
        feedbacks[0].classList.add(active);
    } else if (val.length > 30) {
        feedbacks[1].classList.add(active);
    } else if (!isAlphanumeric(val, 'tr-TR', {ignore: " -"})) {
        feedbacks[2].classList.add(active);
    } else {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
        return true;
    }
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
    return false;
}

export const changeName = (discard, submit) => {
    const input = document.getElementById("inChangeName");
    const nameField = document.getElementById("name_field");
    const feedbacks = input.parentElement.getElementsByClassName("custom-feedback");
    input.addEventListener("input", function (ev) {
        const value = ev.target.value.trim();
        let length = value.length;
        if (length > 1) {
            submit.classList.remove("disabled");
        } else {
            submit.classList.add("disabled");
        }
    });
    submit.addEventListener("click", ev => {
        if (validateName(input, feedbacks)) {
            submit.classList.add("disabled");
            discard.classList.add("disabled");
            submit.innerText = "Saving";
            axios({
                method: 'PATCH',
                url: `http://localhost:3000/user/updateMe`,
                data: {
                    name: input.value
                }
            }).then(e => {
                discard.classList.remove("disabled");
                submit.innerText = "Send";
                nameField.innerText = input.value;
                discard.click();
                showSuccess(dictionary.s_name[language]);
            }).catch(e => {
                discard.classList.remove("disabled");
                submit.innerText = "Send";
                discard.click();
                showError(e.response.status);
            })
        }
    });
    discard.addEventListener("click", ev => {
        submit.classList.remove("disabled");
        input.value = "";
        input.classList.remove("is-invalid", "is-valid");
    });

}

export const upgrade = (discard, submit) => {
    const typeField = document.getElementById("type_field")
    submit.addEventListener("click", ev => {
        submit.classList.add("disabled");
        discard.classList.add("disabled");
        submit.innerText = "Upgrading";
        axios({
            method: 'PUT',
            url: `http://localhost:3000/user/upgrade`,
        }).then(e => {
            discard.classList.remove("disabled");
            submit.innerText = "Send";
            typeField.innerText = "Premium"
            discard.click();
            document.getElementById("upgrade-link").remove();
            showSuccess(dictionary.s_upgrade[language])
        }).catch(e => {
            discard.classList.remove("disabled");
            submit.innerText = "Send";
            discard.click();
            showError(e.response.status);
        })
    });
    discard.addEventListener("click", ev => {
        submit.classList.remove("disabled");
    });
}

export const changePassword = (discard, submit) => {
    const oldPass = document.getElementById("inOldPass");
    const pass = document.getElementById("inPass");
    const passConfirm = document.getElementById("inPassConfirm");
    const passForm = document.getElementById('passForm');
    const feedBacks = pass.parentElement.getElementsByClassName("custom-feedback");
    const oldFeedBacks = oldPass.parentElement.getElementsByClassName("custom-feedback");

    passForm.addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (validatePassForm()) {
            submit.classList.add("disabled");
            discard.classList.add("disabled");
            submit.innerText = "Saving";
            axios({
                method: 'PATCH',
                url: `http://localhost:3000/user/updatePassword`,
                data: {
                    oldPassword: oldPass.value,
                    password: pass.value,
                    passwordConfirm: passConfirm.value
                }
            }).then(e => {
                discard.classList.remove("disabled");
                submit.innerText = "Save";
                discard.click();
                showSuccess(dictionary.s_pass[language]);
            }).catch(e => {
                if (e.response.status < 500) {
                    if (e.response.data.message === "Incorrect password") {
                        oldPass.classList.add("is-invalid");
                        oldFeedBacks[1].classList.add(active);
                    } else {
                        showError(e.response.status);
                    }
                } else {
                    showError(e.response.status);
                }
                discard.classList.remove("disabled");
                submit.classList.remove("disabled");
                submit.innerText = "Save";
            })
        }

    }, false)
    discard.parentElement.parentElement.parentElement.parentElement.parentElement.addEventListener("hidden.bs.modal", ev => {
        passConfirm.value = "";
        pass.value = "";
        submit.classList.remove("disabled");
        pass.classList.remove("is-invalid", "is-valid");
        passConfirm.classList.remove("is-invalid", "is-valid");
    });

    function validatePassForm() {
        let confirmed = false;
        let oldValid = validateOldPass();
        if (validatePass()) {
            if (passConfirm.value === pass.value) {
                confirmed = true;
                passConfirm.classList.remove("is-invalid");
                passConfirm.classList.add("is-valid");
            } else {
                passConfirm.classList.remove("is-valid");
                passConfirm.classList.add("is-invalid");
            }
        }
        return confirmed && oldValid;
    }

    function validatePass() {
        const activeElement = pass.parentElement.getElementsByClassName(active);
        if (activeElement.length > 0) {
            activeElement[0].classList.remove(active);
        }
        let val = pass.value;
        if (val === "") {
            feedBacks[0].classList.add(active);
        } else if (val.length < 6) {
            feedBacks[1].classList.add(active);
        } else if (val.length > 20) {
            feedBacks[2].classList.add(active);
        } else {
            pass.classList.remove("is-invalid");
            pass.classList.add("is-valid");
            return true;
        }
        pass.classList.remove("is-valid");
        pass.classList.add("is-invalid");
        return false;

    }


    function validateOldPass() {
        const activeElement = oldPass.parentElement.getElementsByClassName(active);
        let removed = activeElement.length === 0;
        if (!removed && activeElement[0] !== oldFeedBacks[0]) {
            activeElement[0].classList.remove(active);
            removed = true;
        }
        if (oldPass.value.length < 8 || oldPass.value.length > 30) {
            oldPass.classList.remove("is-valid");
            oldPass.classList.add("is-invalid");
            if (removed) {
                oldFeedBacks[0].classList.add(active);
            }
            return false;
        } else {
            oldPass.classList.remove("is-invalid")
            oldPass.classList.add("is-valid");
            if (!removed) {
                activeElement[0].classList.remove(active);
            }
            return true;
        }
    }

}

export const removeRequests = (cancelButtons) => {
    const requestCounter = document.getElementById("request-count");
    for (let i = 0; i < cancelButtons.length; i++) {
        let btn = cancelButtons[i];
        btn.addEventListener("click", ev => {
            btn.classList.add("disabled");
            btn.innerText = "Canceling";
            axios({
                method: "DELETE",
                url: `http://localhost:3000/user/request/${btn.id.substring(3)}`
            }).then(r => {
                btn.parentElement.parentElement.remove();
                requestCounter.innerText = (requestCounter.innerText - 1).toString();
                btn.classList.remove("disabled");
                btn.innerText = "Cancel";
            }).catch(r => {

                btn.classList.remove("disabled");
                btn.innerText = "Cancel";
            })
        });
    }
};

export const showError = (code, message=dictionary.def_err[language]
                          , delay= 7) => {
    toastErrorMessage.innerText = message;
    toastErrorCode.innerText = code;
    const toast = new bootstrap.Toast(toastError,{delay: delay * 1000});

    toast.show();
}

