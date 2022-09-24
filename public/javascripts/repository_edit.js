import axios from 'axios';
import {language, dictionary} from "./index";


const url = window.location.href.substring(0, window.location.href.length - 5);


export const initWarningModal = (modal) => {
    let warningModal = modal;
    let warningText = document.getElementById("warning-text");
    let undoneText = document.getElementById("warning-undone-text");
    let confirmButton = modal.getElementsByClassName("accept-btn")[0];

    const kickButtons = document.querySelectorAll(".kick-user");
    const rejectButtons = document.querySelectorAll(".btn-reject");
    const acceptButtons = document.querySelectorAll(".btn-accept");
    const authButtons = document.querySelectorAll(".btn-auth");
    const adminButtons = document.querySelectorAll(".btn-admin");
    const deauthButtons = document.querySelectorAll(".btn-deauth");
    let serverMethod;
    let urlExtension;
    confirmButton.addEventListener("click", ev=>{
        axios({
            method: serverMethod,
            url: `${url}/${urlExtension}`,
        }).then(ev => {
            confirmButton.classList.remove("disabled");
            confirmButton.parentElement.children[1].click();
            setTimeout(ev =>{location.reload()}, 100);
        });
        confirmButton.classList.add("disabled");
    });
    const confirm = (method, url, text, activateUndone = false) => {
        serverMethod = method;
        urlExtension = url;
        warningText.innerText = text;
        if (activateUndone)
            undoneText.classList.remove("d-none");
        else
            undoneText.classList.add("d-none");

    }

    const reject = (button) => {
        button.addEventListener("click", (evt) => {
            axios({
                method: 'DELETE',
                url: `${url}/permission/${button.id.substring(6)}`,
            }).then(e => location.reload()); // temp then
        })
    }

    const accept = (button) => {
        button.addEventListener("click", (evt) => {
            axios({
                method: 'POST',
                url: `${url}/permission/${button.id.substring(10)}`,
            }).then(e => location.reload()).catch(e=> location.reload());
        });
    }

    const kick = (button) => {
        button.addEventListener("click", (evt) => {
            // axios({
            //     method: 'DELETE',
            //     url: `${url.substring(0, url.length - 5)}/user/${button.id.substring(4)}`,
            // })
            confirm("DELETE", `user/${button.getAttribute("data-bs-id")}`,
                `${dictionary.u_kick_1[language]} ${getName(button)} ${dictionary.u_kick_2[language]}`, true);
        })
    }
    const authorizeEdit = (button) => {
        button.addEventListener("click", (evt) => {
            // axios({
            //     method: 'POST',
            //     url: `${url.substring(0, url.length - 5)}/user/${button.id.substring(4)}`,
            // })
            confirm("POST", `user/${button.getAttribute("data-bs-id")}/std`,
                `${dictionary.u_upgrade_1[language]} ${getName(button)} ${dictionary.u_upgrade_2[language]}`);
        });
    };

    const makeAdmin = (button) => {
        button.addEventListener("click", (evt) => {
            // axios({
            //     method: 'POST',
            //     url: `${url.substring(0, url.length - 5)}/user/${button.id.substring(2)}`,
            // })
            confirm("POST", `user/${button.getAttribute("data-bs-id")}/edit/admin`,
                `${dictionary.u_admin_1[language]} ${getName(button)} ${dictionary.u_admin_2[language]}`, true);
        });
    };
    const deauthorize = (button) => {
        button.addEventListener("click", (evt) => {
            // axios({
            //     method: 'POST',
            //     url: `${url.substring(0, url.length - 5)}/user/${button.id.substring(6)}`,
            // })
            confirm("POST", `user/${button.getAttribute("data-bs-id")}/edit`,
                `${dictionary.u_deauth_1[language]} ${getName(button)} ${dictionary.u_deauth_2[language]}`);
        });
    };

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

    if (acceptButtons) {
        acceptButtons.forEach((value, key) => {
            accept(value)
        });
    }
    if (authButtons) {
        authButtons.forEach((value, key) => {
            authorizeEdit(value)
        });
    }
    if (adminButtons) {
        adminButtons.forEach((value, key) => {
            makeAdmin(value)
        });
    }
    if (deauthButtons) {
        deauthButtons.forEach((value, key) => {
            deauthorize(value)
        });
    }
}

export const save = (button) => {
    const name = document.getElementById("inName");
    const description = document.getElementById("inDescription");
    const radioAuth = document.getElementById("radio-auth");
    const checkAuth = document.getElementById("checkAuth");

    let oldMap = {
        name: name.value,
        description: description.value,
    }
    oldMap.auth = checkAuth ? checkAuth.checked : undefined;
    if (radioAuth && radioAuth.childElementCount === 3) {
        for (let i = 0; i < 3; i++) {
            let el = radioAuth.children[i].children[0];
            if (el.checked) {
                oldMap.privacy = el.id;
                break;
            }
        }
    }
    const map = {
        name: true,
        description: true,
        auth: true,
        privacy: true
    }
    name.addEventListener("change", ev => {
        const target = ev.target;
        const matched = target.value === oldMap.name;
        map.name = matched;
        checkMaps(matched);
    });

    description.addEventListener("change", ev => {
        const target = ev.target;
        const matched = target.value === oldMap.description;
        map.description = matched;
        checkMaps(matched);
    });

    if (radioAuth) {
        radioAuth.addEventListener("change", ev => {
            const target = ev.target;
            const matched = target.id === oldMap.privacy;
            map.privacy = matched;
            checkMaps(matched);
        });
    }

    if (checkAuth) {
        checkAuth.addEventListener("change", ev => {
            const target = ev.target;
            const matched = target.checked === oldMap.auth;
            map.auth = matched;
            checkMaps(matched);
        });
    }
    button.addEventListener("click", async ev => {
        let promises = [];
        button.classList.add("disabled");
        button.innerText = "Saving";
        const data = {};
        let basicReq = false;
        let highReq = false;
        if (!map.name) {
            data.name = name.value;
            oldMap.name = data.name;
            basicReq = true;
        }
        if (!map.description) {
            data.description = description.value;
            oldMap.description = data.description;
            basicReq = true;
        }
        if (!map.auth) {
            promises.push(axios({
                method: 'PATCH',
                url: `${window.location.href}/auth`,
                data: {auth: checkAuth.checked}
            }));
            oldMap.auth = checkAuth.checked;
        }
        if (!map.privacy) {
            for (let i = 0; i < 3; i++) {
                let el = radioAuth.children[i].children[0];
                if (el.checked) {
                    data.privacy = el.id;
                    oldMap.privacy = data.privacy;
                    basicReq = true;
                    break;
                }
            }
        }
        if (basicReq) {
            promises.push(axios({
                method: 'PATCH',
                url: `${window.location.href}`,
                data
            }));
        }
        await Promise.all(promises);
        button.innerText = "Save";
    });

    function checkMaps(matched) {
        if (matched) {
            if (map.name && map.description && map.auth && map.privacy)
                button.classList.add("disabled");
        } else {
            button.classList.remove("disabled");
        }
    }
}

export const editMessage = (modal) => {
    modal.addEventListener('show.bs.modal', function (event) {

        const button = event.relatedTarget
        const message = button.getAttribute('data-bs-message')
        const owner = button.getAttribute('data-bs-owner')

        const modalTitle = document.querySelector('.modal-title')
        const modalBodyInput = modal.querySelector('.modal-body p')

        modalTitle.textContent = `${owner}'${dictionary.r_message[language]}`
        modalBodyInput.innerText = message
    })
}

export const copyId = (btn) => {
    const repoId = document.getElementById("repId").innerText;
    const tooltip = new bootstrap.Tooltip(btn, {
        trigger: "manual",
    });
    let manual = false;
    btn.addEventListener("click", ev => {
        navigator.clipboard.writeText(repoId).then(ev => {
            tooltip.hide();
            manual = true;
            btn.setAttribute("data-bs-original-title", dictionary.c_tt_done[language])
        }).then(e => console.log("success")).catch(e => console.log("couldn't copy"))
    });
    btn.addEventListener("mouseover", ev => {
        tooltip.show();
    })
    btn.addEventListener("mouseleave", ev => {
        tooltip.hide();
    })
    btn.addEventListener("hidden.bs.tooltip", ev => {
        if (manual) {
            manual = false;
            setTimeout(() => {
                tooltip.show();
            }, 1);
        } else {
            btn.setAttribute("data-bs-original-title", dictionary.c_tt_init[language])
        }
    });
}

export const activateTTs = () => {
    const ttList = document.getElementsByClassName("tt");
    for (let i = 0; i < ttList.length; i++) {
        new bootstrap.Tooltip(ttList[i]);
    }
}

const getName = (btn) =>{
    return btn.parentElement.parentElement.parentElement.parentElement.children[0].children[0].innerText;
}