import axios from 'axios';
import isEmail from "validator/es/lib/isEmail";

const active = "custom-feedback-active";

export const activateLogin = async (form) => {
    const feedbacks = document.getElementsByClassName("custom-feedback");
    const login = async (email, password) => {
        email.addEventListener("input", e => {
            email.classList.remove("is-invalid");
            email.classList.remove("is-valid");
        });
        const activeElements = document.getElementsByClassName(active);
        if (activeElements.length > 0) {
            activeElements[0].classList.remove(active);
        }
        if (isEmail(email.value)) {
            if (password.value.length > 7) {
                try {
                    const res = await axios({
                        method: 'POST',
                        url: 'http://localhost:3000/login',
                        data: {
                            email: email.value,
                            password: password.value
                        }
                    });
                    if (res.data.status === 'success') {
                        window.location.assign("/repository")
                    }
                } catch (err) {
                    if (err.response.data.message === "EorP") {
                        feedbacks[2].classList.add(active);
                    } else if (err.response.data.message === "AcErr") {
                        feedbacks[3].classList.add(active);
                    }
                }
            } else {
                feedbacks[1].classList.add(active);
                password.classList.add("is-invalid");
            }
        } else {
            feedbacks[0].classList.add(active);
            email.classList.add("is-invalid");
        }

    };
    axios({
        method: 'GET',
        url: 'http://localhost:3000/loggedIn',
    })
        .then(res => {
            window.location.assign("/repository")
        })
        .catch(err => {

            form.addEventListener('submit', e => {
                e.preventDefault();
                const email = document.getElementById('LoginEmail');
                const password = document.getElementById('LoginPassword');
                login(email, password);
            })
        });
    activateEmailToast();
}

function activateEmailToast() {
    const toastElement = document.getElementById("emailConfirmToast");
    if (toastElement) {
        const toast = new bootstrap.Toast(toastElement)
        toast.show()
    }
}

export const logout = (button) => {
    button.addEventListener("click", ev => {
        axios({
            method: "POST",
            url: `${window.location.origin}/logout`
        })
        window.location.assign("/login");
    });
};

export const sendResetPassword = (form) => {
    const email = document.getElementById("resetEmail");
    const feedbacks = document.getElementsByClassName("custom-feedback");

    email.addEventListener("input", e => {
        email.classList.remove("is-invalid");
        email.classList.remove("is-valid");
    });
    form.addEventListener("submit", ev => {
        ev.preventDefault();
        ev.stopPropagation();
        const val = email.value;
        const activeElement = email.parentElement.getElementsByClassName(active);
        if (activeElement.length > 0) {
            activeElement[0].classList.remove(active);
        }
        if (isEmail(val)) {
            email.classList.add("is-valid");
            axios({
                method: "POST",
                url: `${window.location.origin}/forgotPassword`,
                data: {
                    email: val
                }
            }).then(e => {
                const rows = document.getElementsByClassName("mb-3");
                const hidden = "visually-hidden";
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].classList.contains(hidden)) {
                        rows[i].classList.remove(hidden)
                    } else {
                        rows[i].classList.add(hidden)
                    }
                }
            }).catch(e => {
                email.classList.add("is-invalid");
                if (e.response.status === 405) {
                    feedbacks[2].classList.add(active);
                } else {
                    feedbacks[1].classList.add(active);
                }
            });
        } else {
            email.classList.add("is-invalid");
            feedbacks[0].classList.add(active);
        }
    });
}

export const resetPassword = form => {
    const pass = document.getElementById("inPass");
    const passConfirm = document.getElementById("inPassConfirm");
    const feedbacks = document.getElementsByClassName("custom-feedback");
    [pass, passConfirm].forEach(el => {
        el.addEventListener("input", ev => ev.target.classList.remove("is-valid", "is-invalid"));
    });

    form.addEventListener("submit", ev => {
        ev.preventDefault();
        ev.stopPropagation();
        if (validatePassword()) {
            if (passConfirm.value === pass.value) {
                axios({
                    method: "PATCH",
                    url: window.location.href,
                    data: {
                        password: pass.value,
                        passwordConfirm: passConfirm.value
                    }
                }).then(() => {
                    window.location.assign("/login");
                }).catch(err => {
                    feedbacks[2].classList.add(active);
                    console.log(err);
                });
            } else {
                passConfirm.classList.remove("is-valid");
                passConfirm.classList.add("is-invalid");
            }
        }
    });

    function validatePassword() {
        const activeElement = pass.parentElement.getElementsByClassName(active);
        if (activeElement.length > 0) {
            activeElement[0].classList.remove(active);
        }
        let val = pass.value;
        if (val === "") {
            feedbacks[0].classList.add(active);
        } else if (val.length < 7) {
            feedbacks[1].classList.add(active);
        } else if (val.length > 30) {
            feedbacks[2].classList.add(active);
        } else {
            pass.classList.remove("is-invalid");
            pass.classList.add("is-valid");
            if (val === passConfirm.value) {
                passConfirm.classList.remove("is-invalid");
                passConfirm.classList.add("is-valid");
                return true;
            } else {
                passConfirm.classList.remove("is-valid");
                passConfirm.classList.add("is-invalid");
                return false;
            }
        }
        pass.classList.remove("is-valid");
        pass.classList.add("is-invalid");
        return false;
    }
}