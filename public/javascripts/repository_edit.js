import axios from 'axios';

export const reject = (button) => {
    const url = window.location.href;
    button.addEventListener("click", (evt) => {
        axios({
            method: 'DELETE',
            url: `${url.substring(0, url.length - 5)}/permission/${button.id.substring(6)}`,
        })
    });
}
export const kick = (button) => {
    const url = window.location.href;
    button.addEventListener("click", (evt) => {
        axios({
            method: 'DELETE',
            url: `${url.substring(0, url.length - 5)}/user/${button.id.substring(4)}`,
        })
    });
}
export const accept = (button) => {
    const url = window.location.href;
    button.addEventListener("click", (evt) => {
        axios({
            method: 'POST',
            url: `${url.substring(0, url.length - 5)}/permission/${button.id.substring(10)}`,
        })
    });
};
export const authorizeEdit = (button) => {
    const url = window.location.href;
    button.addEventListener("click", (evt) => {
        axios({
            method: 'POST',
            url: `${url.substring(0, url.length - 5)}/user/${button.id.substring(4)}`,
        })
    });
};

export const makeAdmin = (button) => {
    const url = window.location.href;
    button.addEventListener("click", (evt) => {
        axios({
            method: 'POST',
            url: `${url.substring(0, url.length - 5)}/user/${button.id.substring(2)}`,
        })
    });
};
export const deauthorize = (button) => {
    const url = window.location.href;
    button.addEventListener("click", (evt) => {
        axios({
            method: 'POST',
            url: `${url.substring(0, url.length - 5)}/user/${button.id.substring(6)}`,
        })
    });
};

export const save = (button) => {
    const name = document.getElementById("inName");
    const description = document.getElementById("inDescription");
    const radioAuth = document.getElementById("radio-auth");
    const checkAuth = document.getElementById("checkAuth");
    let oldMap = {
        name: name.value,
        description: description.value,
        auth: checkAuth.checked
    }
    if (radioAuth.childElementCount === 3) {
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
    radioAuth.addEventListener("change", ev => {
        const target = ev.target;
        const matched = target.id === oldMap.privacy;
        map.privacy = matched;
        checkMaps(matched);
    });
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
    checkAuth.addEventListener("change", ev => {
        const target = ev.target;
        const matched = target.checked === oldMap.auth;
        map.auth = matched;
        checkMaps(matched);
    });
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

