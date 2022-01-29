import axios from "axios";

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
    repositoryId.addEventListener("input", ev => {
        if (repositoryId.value.length === 24)
            createButton.classList.remove("disabled")
        else
            createButton.classList.add("disabled")
    });
    discardButton.addEventListener("click", ev => {
        repositoryId.value = "";
        createButton.removeClassName("disabled");
    });
    createButton.addEventListener("click", ev => {
        createButton.classList.add("disabled");
        discardButton.classList.add("disabled");
        createButton.innerText = "Sending";
        axios({
            method: 'POST',
            url: `http://localhost:3000/user/request/repository/${repositoryId.value}`,
        }).then(e => {
            discardButton.classList.remove("disabled");
            createButton.innerText = "Send";
            discardButton.click();
        }).catch(e => {
            discardButton.classList.remove("disabled");
            createButton.innerText = "Send";
            discardButton.click();
        })
    });

}

export const createRepos = (discardButton, createButton) => {
    const visibility = document.getElementById("floatingInVisibility");
    const name = document.getElementById("floatingInName");
    const description = document.getElementById("floatingInDesc");
    discardButton.addEventListener("click", ev => {
        name.value = "";
        description.value = "";
        createButton.removeClassName("disabled");
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
            createButton.classList.remove("disabled");
            discardButton.classList.remove("disabled");
            createButton.innerText = "Add";
            discardButton.click()
        }).catch(e => {
            createButton.classList.remove("disabled");
            discardButton.classList.remove("disabled");
            createButton.innerText = "Add";
            discardButton.click()
        })
    });

}