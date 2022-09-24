import axios from "axios";
import isAlphanumeric from 'validator/lib/isAlphanumeric';
import {dictionary, language} from "./index";

export const active = "custom-feedback-active";
const toastSuccess = document.getElementById("toastSuccess");
const toastMessage = document.getElementById("toast-message");
const toastError = document.getElementById("toastError");
const toastErrorCode = document.getElementById("toast-err-code");
const toastErrorMessage = document.getElementById("toast-err-message");

exports.showSuccess = (message) => {
    toastMessage.innerText = message;
    const toast = new bootstrap.Toast(toastSuccess);
    toast.show()
}

exports.validateName = (input, parent, feedbacks, minLength, maxLength) => {
    const val = input.value.trim();
    const activeElement = parent.getElementsByClassName(active);
    if (activeElement.length > 0) {
        activeElement[0].classList.remove(active);
    }
    if (val.length < minLength) {
        feedbacks[0].classList.add(active);
    } else if (val.length > maxLength) {
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
    updateUser(discard, submit, "name", input, nameField, () => input.value)
    // const feedbacks = input.parentElement.getElementsByClassName("custom-feedback");
    // input.addEventListener("input", function (ev) {
    //     const value = ev.target.value.trim();
    //     let length = value.length;
    //     if (length > 1) {
    //         submit.classList.remove("disabled");
    //     } else {
    //         submit.classList.add("disabled");
    //     }
    // });
    // submit.addEventListener("click", ev => {
    //     if (exports.validateName(input, input.parentElement, feedbacks, 1, 30)) {
    //         submit.classList.add("disabled");
    //         discard.classList.add("disabled");
    //         submit.innerText = dictionary.b_saving[language];
    //         axios({
    //             method: 'PATCH',
    //             url: `${window.location.origin}/user/updateMe`,
    //             data: {
    //                 name: input.value
    //             }
    //         }).then(e => {
    //             discard.classList.remove("disabled");
    //             submit.innerText = "Send";
    //             nameField.innerText = input.value;
    //             discard.click();
    //             exports.showSuccess(dictionary.s_name[language]);
    //         }).catch(e => {
    //             discard.classList.remove("disabled");
    //             submit.innerText = "Send";
    //             discard.click();
    //             showError(e.response.status);
    //         })
    //     }
    // });
    // discard.addEventListener("click", ev => {
    //     submit.classList.remove("disabled");
    //     input.value = "";
    //     input.classList.remove("is-invalid", "is-valid");
    // });

}

export const upgrade = (discard, submit) => {
    const typeField = document.getElementById("type_field")
    submit.addEventListener("click", ev => {
        submit.classList.add("disabled");
        discard.classList.add("disabled");
        submit.innerText = dictionary.b_upgrading[language];
        axios({
            method: 'PUT',
            url: `${window.location.origin}/user/upgrade`,
        }).then(e => {
            discard.classList.remove("disabled");
            submit.innerText = dictionary.b_send[language];
            typeField.innerText = "Premium"
            discard.click();
            document.getElementById("upgrade-link").remove();
            exports.showSuccess(dictionary.s_upgrade[language])
        }).catch(e => {
            discard.classList.remove("disabled");
            submit.innerText = dictionary.b_send[language];
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
            submit.innerText = dictionary.b_saving[language];
            axios({
                method: 'PATCH',
                url: `${window.location.origin}/user/updatePassword`,
                data: {
                    oldPassword: oldPass.value,
                    password: pass.value,
                    passwordConfirm: passConfirm.value
                }
            }).then(e => {
                discard.classList.remove("disabled");
                submit.innerText = dictionary.b_save[language];
                discard.click();
                exports.showSuccess(dictionary.s_pass[language]);
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
                submit.innerText = dictionary.b_save[language];
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
                url: `${window.location.origin}/user/request/${btn.id.substring(3)}`
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

export const changeAreaPreference = (discard, submit) => {
    const field = document.getElementById("unitField");
    const input = document.getElementById("inAreaUnit");
    updateUser(discard, submit, "areaUnit", input, field, () => input.children[input.selectedIndex].textContent)
}
export const changeLocationPreference = (discard, submit) => {
    const field = document.getElementById("mapLocationField");
    const input = document.getElementById("inLocation");
    updateUser(discard, submit, "mLocation", input, field, () => input.value)
}
export const changeZoomPreference = (discard, submit) => {
    const field = document.getElementById("mapZoomField");
    const input = document.getElementById("inZoom");
    updateUser(discard, submit, "mZoom", input, field, () => input.value, true);
    let initialValue = input.value;
    input.addEventListener("input", () => {
        const val = input.value;
        if (val === initialValue || val > 12 || val < 5) {
            submit.classList.add("disabled");
        } else
            submit.classList.remove("disabled");
    })
}

function updateUser(discard, submit, valueName, input, field, textUpdateFunc, customSubmitCheck = false) {
    let initialValue = input.value;
    if (!customSubmitCheck) {
        input.addEventListener("input", () => {
            if (input.value === initialValue) {
                submit.classList.add("disabled");
            } else
                submit.classList.remove("disabled");
        });
    }
    submit.addEventListener("click", () => {
        submit.classList.add("disabled");
        discard.classList.add("disabled");
        const data = {};
        data[valueName] = input.value;
        submit.innerText = dictionary.b_saving[language];
        axios({
            method: 'PATCH',
            url: `${window.location.origin}/user/updateMe`,
            data
        }).then(e => {
            discard.classList.remove("disabled");
            submit.innerText = dictionary.b_save[language];
            field.innerText = textUpdateFunc();
            discard.click();
            exports.showSuccess(dictionary.s_a_unit[language]);
            initialValue = input.value;
        }).catch(e => {
            discard.classList.remove("disabled");
            submit.innerText = dictionary.b_save[language];
            discard.click();
            showError(e.response.status);
        })
    })
}

export const showError = (code, message = dictionary.def_err[language]
    , delay = 7) => {
    toastErrorMessage.innerText = message + code;
    toastErrorCode.innerText = " ";
    const toast = new bootstrap.Toast(toastError, {delay: delay * 1000});

    toast.show();
}

