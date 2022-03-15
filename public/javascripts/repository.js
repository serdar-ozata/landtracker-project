import axios from "axios";
import isHexadecimal from "validator/lib/isHexadecimal"
import {showError} from "./user_settings";
import {language} from "./index";

const toastSuccess = document.getElementById("toastSuccess");
const toastMessage = document.getElementById("toast-message");
const active = "custom-feedback-active";

const dictionary = {
    r_sent:{
        tr: "İsteğiniz gönderildi.",
        en:"Request sent successfully."
    },
    r_joined:{
        tr: "Depoya katıldınız.",
        en:"You have joined to the repository."
    },
    d_left:{
        en: "You left",
        tr: "Ayrıldığınız depo"
    },
    d_delete:{
        en: "You deleted" ,
        tr: "Sildiğiniz depo"
    }
}

export const search = input => {
    let repositories = new Map();
    document.querySelectorAll(".repos-card").forEach(card => {
        repositories.set(card.children[0].children[1].children[0].children[0].children[0].innerText.toLowerCase(), card);
    });

    input.addEventListener("input", ev => {
        const searchVal = ev.target.value.trim().toLowerCase();
        if (searchVal === "") {
            repositories.forEach(val => {
                val.removeAttribute("hidden");
            });
        } else {
            repositories.forEach(((value, key) => {
                if (key.includes(searchVal))
                    value.removeAttribute("hidden");
                else
                    value.setAttribute("hidden", true);
            }));
        }
    });
}


export const createRequest = (createButton, discardButton) => {
    const repositoryId = document.getElementById("floatingInRequest");
    const repositoryMessage = document.getElementById("floatingInMessage");
    const feedbacks = repositoryId.parentElement.getElementsByClassName("custom-feedback");
    const idContainers = document.getElementsByClassName("id-container");
    let ids = new Set();
    for (let i = 0; i < idContainers.length; i++) {
        ids.add(idContainers[i].getAttribute('data-bs-id'));
    }
    repositoryId.addEventListener("input", ev => {
        let idInput = repositoryId.value;
        repositoryId.classList.remove("is-invalid");
        if (idInput.length === 24 && isHexadecimal(idInput))
            createButton.classList.remove("disabled")
        else
            createButton.classList.add("disabled")
    });
    discardButton.addEventListener("click", ev => {
        repositoryId.value = "";
        repositoryId.classList.remove("is-valid", "is-invalid");
        removeActive();
        createButton.classList.remove("disabled");
    });
    createButton.addEventListener("click", ev => {
        if (checkCurrentRepositories(repositoryId.value)) {
            createButton.classList.add("disabled");
            discardButton.classList.add("disabled");
            createButton.innerText = "Sending";
            axios({
                method: 'POST',
                url: `http://localhost:3000/user/request/repository/${repositoryId.value}`,
                data: {
                    message: repositoryMessage.value
                }
            }).then(e => {
                discardButton.classList.remove("disabled");
                createButton.innerText = "Send";
                discardButton.click();
                if (e.data.message === "Sent") {
                    showSuccess(dictionary.r_sent[language]);
                } else if (e.data.message === "Accepted") {
                    showSuccess(dictionary.r_joined[language]);
                }
            }).catch(e => {
                discardButton.classList.remove("disabled");
                createButton.innerText = "Send";
                if (e.response.status < 500) {
                    createButton.classList.remove("disabled");
                    removeActive();
                    console.log(e.response.status);
                    if(e.response.status === 405){
                        if (e.response.data.message === "Reached invite limit"){
                            feedbacks[4].classList.add(active);
                        } else {
                            feedbacks[5].classList.add(active);
                        }
                    } else if (e.response.data.message === "Invalid repository id") {
                        feedbacks[0].classList.add(active);
                    } else if (e.response.data.message === "Private Repository") {
                        feedbacks[1].classList.add(active);
                    } else if (e.response.data.message === "Sent before") {
                        feedbacks[2].classList.add(active);
                    }
                    repositoryId.classList.add("is-invalid");
                } else {
                    discardButton.click();
                }
            })
        } else {
            const activeEl = repositoryId.parentElement.getElementsByClassName(active);
            if (activeEl.length === 0 || activeEl[0] !== feedbacks[3]) {
                if (activeEl.length !== 0)
                    activeEl[0].classList.remove(active);
                repositoryId.classList.add("is-invalid");
                feedbacks[3].classList.add(active);

            }

        }
    });

    function checkCurrentRepositories(id) {
        return !ids.has(id);
    }
    function removeActive() {
        const activeEl = repositoryId.parentElement.getElementsByClassName(active);
        if (activeEl.length > 0) {
            activeEl[0].classList.remove(active);
        }
    }
}

export const createRepos = (discardButton, createButton) => {
    const visibility = document.getElementById("floatingInVisibility");
    const name = document.getElementById("floatingInName");
    const description = document.getElementById("floatingInDesc");
    discardButton.addEventListener("click", ev => {
        name.value = "";
        description.value = "";
        createButton.classList.remove("disabled");
    });
    name.addEventListener("input", ev => {
        if (name.value.length < 2)
            createButton.classList.add("disabled")
        else
            createButton.classList.remove("disabled")
    });
    createButton.addEventListener("click", ev => {
        createButton.classList.add("disabled");
        discardButton.classList.add("disabled");
        createButton.innerText = "Adding";
        axios({
            method: 'POST',
            url: `${window.location.href}`,
            data: {
                name: name.value,
                description: description.value,
                privacy: visibility.value
            }
        }).then(e => {
            window.location.reload();
            createButton.classList.remove("disabled");
            discardButton.classList.remove("disabled");
            createButton.innerText = "Add";
            discardButton.click();

        }).catch(e => {
            createButton.classList.remove("disabled");
            discardButton.classList.remove("disabled");
            createButton.innerText = "Add";
            discardButton.click();
            if(e.response.status === 405){
                showError(405, "You exceeded the repository limit which means you cannot create a repository anymore." +
                    " Delete some of your repositories or leave from the repositories that you \"can edit\". Error Code: ", 20);
            }
        })
    });

}


export const leaveRepos = (modal) => {
    let leaveBtn = undefined;
    modal.addEventListener('show.bs.modal', function (event) {
        leaveBtn = event.relatedTarget;
    });

    const buttons = modal.getElementsByClassName("btn");
    buttons[0].addEventListener("click", ev => {
        if (leaveBtn) {
            const id = leaveBtn.getAttribute('data-bs-id');
            axios.delete(`${window.location.href}/${id}`).then(e => {
                const card = leaveBtn.parentElement.parentElement.parentElement;
                showSuccess(`${dictionary.d_left[language]}: ${card.children[0].children[1].getElementsByClassName("card-title")[0].innerText}`);
                card.remove();
            }).catch(e => {
                showError(e.response.status);
                leaveBtn.classList.remove("disabled");
            });
            buttons[1].click();
            leaveBtn.classList.add("disabled");
        }
    });
}

export const deleteRepos = (modal) => {
    let deleteBtn = undefined;
    modal.addEventListener('show.bs.modal', function (event) {
        deleteBtn = event.relatedTarget;
    });

    const buttons = modal.getElementsByClassName("btn");
    buttons[0].addEventListener("click", ev => {
        if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-bs-id');
            axios.delete(`${window.location.href}/${id}/edit/auth`).then(e => {
                const card = deleteBtn.parentElement.parentElement.parentElement;
                showSuccess(`${dictionary.d_delete[language]}: ${card.children[0].children[1].getElementsByClassName("card-title")[0].innerText}`);
                card.remove();
            }).catch(e => {
                showError(e.response.status);
                deleteBtn.classList.remove("disabled");
            });
            buttons[1].click();
            deleteBtn.classList.add("disabled");
        }
    });
}

export const showSuccess = (message) => {
    toastMessage.innerText = message
    const toast = new bootstrap.Toast(toastSuccess);
    toast.show()
}
