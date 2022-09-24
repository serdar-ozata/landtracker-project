import axios from "axios";
import {validateName} from "./user_settings";
import isEmail from "validator/es/lib/isEmail";

const active = "custom-feedback-active";

export const signup = (form) => {
    const fbTag = "custom-feedback";
    const email = document.getElementById("inEmail");
    const pass = document.getElementById("inPass");
    const passConfirm = document.getElementById("inPassConfirm");
    const name = document.getElementById("inName");
    const submitButton = document.getElementById("submitBtn");
    const successModal = document.getElementById("sModal");
    successModal.querySelectorAll(".btn").forEach(el => {
        el.addEventListener("click", (ev) => window.location.assign("/login"));
    });
    [email, pass, passConfirm, name].forEach(el => {
        el.addEventListener("input", function (ev) {
            el.classList.remove("is-invalid");
            el.classList.remove("valid");
        });
    });

    let modal = bootstrap.Modal.getOrCreateInstance(successModal);
    const emailFeedbacks = email.parentElement.getElementsByClassName(fbTag);
    const passFeedbacks = pass.parentElement.getElementsByClassName(fbTag);
    const nameFeedbacks = name.parentElement.getElementsByClassName(fbTag);
    submitButton.addEventListener("click", ev => {
        if (validateEmail() && validateName(name, name.parentElement, nameFeedbacks, 1, 30) && validatePassword()) {
            if (passConfirm.value === pass.value) {
                submitButton.classList.add("disabled");
                passConfirm.classList.remove("is-invalid");
                passConfirm.classList.add("is-valid");
                axios({
                    method: "POST",
                    url: `${window.location.href}`,
                    data: {
                        name: name.value,
                        password: pass.value,
                        passwordConfirm: passConfirm.value,
                        email: email.value
                    }
                }).then(ev => {
                    modal.show();
                }).catch(err => {
                    submitButton.classList.remove("disabled");
                    if (err.response.data.message === "Email taken") {
                        email.classList.remove("is-valid");
                        email.classList.add("is-invalid");
                        emailFeedbacks[1].classList.add(active);
                    }
                });

            } else {
                passConfirm.classList.remove("is-valid");
                passConfirm.classList.add("is-invalid");
            }
        }
    })

    function validatePassword() {
        const activeElement = pass.parentElement.getElementsByClassName(active);
        if (activeElement.length > 0) {
            activeElement[0].classList.remove(active);
        }
        let val = pass.value;
        if (val === "") {
            passFeedbacks[0].classList.add(active);
        } else if (val.length < 6) {
            passFeedbacks[1].classList.add(active);
        } else if (val.length > 20) {
            passFeedbacks[2].classList.add(active);
        } else if (val === name.value) {
            passFeedbacks[4].classList.add(active);
        } else {
            pass.classList.remove("is-invalid");
            pass.classList.add("is-valid");
            return true;
        }
        pass.classList.remove("is-valid");
        pass.classList.add("is-invalid");
        return false;
    }

    function validateEmail() {
        const activeElement = email.parentElement.getElementsByClassName(active);
        if (activeElement.length > 0) {
            activeElement[0].classList.remove(active);
        }
        if (isEmail(email.value)) {
            email.classList.remove("is-invalid");
            email.classList.add("is-valid");
            return true;
        } else {
            email.classList.remove("is-valid");
            email.classList.add("is-invalid");
            emailFeedbacks[0].classList.add(active);
            return false;
        }
    }
}