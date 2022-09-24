import axios from "axios";
import {active, showError, showSuccess, validateName} from "./user_settings";
import {dictionary, language} from "./index";


const REPO_LENGTH = "/repository/".length;

function validateCropDates(planted, harvested, parent) {
    const feedbacks = parent.querySelectorAll(".custom-feedback");
    const activeElement = parent.getElementsByClassName(active);
    let invalidPlanted = false;
    // 0 true, 1 uninitialized, 2 false
    let invalidHarvested = 1;
    if (activeElement.length > 0) {
        activeElement[0].classList.remove(active);
    }

    if (planted.value === "") {
        feedbacks[0].classList.add(active);
        invalidPlanted = true;
    } else if (planted.value > Date.now()) {
        feedbacks[1].classList.add(active);
        invalidPlanted = true;
    } else if (harvested) {
        const harvestedParent = harvested.parentElement.parentElement;
        const harvestedFeedbacks = harvestedParent.querySelectorAll(".custom-feedback");
        const harvestedActiveFB = harvestedParent.querySelector(active);
        if (harvestedActiveFB) {
            harvestedActiveFB.classList.remove(active);
        }
        if (harvested.value === "") {
            harvestedFeedbacks[0].classList.add(active);
            invalidHarvested = 0;
        } else {
            invalidHarvested = 2;
            if (planted.value > harvested.value) {
                feedbacks[2].classList.add(active);
                invalidPlanted = true;
            }
        }
    }
    if (invalidPlanted) {
        planted.classList.remove("is-valid");
        planted.classList.add("is-invalid");
    } else {
        planted.classList.remove("is-invalid");
        planted.classList.add("is-valid");
    }
    if (invalidHarvested === 0) {
        harvested.classList.remove("is-valid");
        harvested.classList.add("is-invalid");
    } else if (invalidHarvested === 2) {
        harvested.classList.remove("is-invalid");
        harvested.classList.add("is-valid");
    }
    return !(invalidHarvested < 1 || invalidPlanted);
}

function getBaseUrl() {
    // url
    const repoEndIndex = window.location.href.indexOf("/repository/") + REPO_LENGTH;
    const slashIndex = window.location.href.substring(repoEndIndex).indexOf("/");
    // last excluded so, add 1 to the end index
    return window.location.href.substring(0, slashIndex + repoEndIndex + 1) + "lands/";
}

function validateAddress(input, parent, minLength, maxLength) {
    const val = input.value.trim();
    const feedbacks = parent.querySelectorAll(".custom-feedback");
    const activeElement = parent.getElementsByClassName(active);
    if (activeElement.length > 0) {
        activeElement[0].classList.remove(active);
    }
    if (val.length < minLength) {
        feedbacks[0].classList.add(active);
    } else if (val.length > maxLength) {
        feedbacks[1].classList.add(active);
    } else {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
        return true;
    }
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
    return false;
}

function restoreButtons(submit, discard) {
    disableEl(submit, false);
    disableEl(discard, false);
    discard.click();
    submit.textContent = dictionary.b_save[language];
}

function hideErrors(el) {
    const activeEls = el.parentElement.getElementsByClassName(active);
    if (activeEls.length > 0)
        activeEls[0].classList.remove(active);
    el.classList.remove("is-valid", "is-invalid");
}

function clearFields(...els) {
    els.forEach(el => {
        hideErrors(el);
        el.value = "";
    });
}

export const setupMap = function () {
    const modal = document.getElementById("create-asset")
    // -- point input --
    // add button and toast
    let adding = false;
    const toastEl = document.getElementById("toastAssetAdd");
    const [toastColorPickerList, toastText] = toastEl.querySelectorAll("li");
    const colorField = toastColorPickerList.querySelector("#inColor");
    const assetAddButton = document.getElementById("assetAddButton");
    const toast = new bootstrap.Toast(toastEl, {autohide: false});
    const toastCloseBtn = toastEl.querySelector("button.btn-close");
    const toastContinueBtn = toastEl.querySelector("button.btn.btn-outline-secondary.btn-sm")
    let color = colorField.value;
    assetAddButton.addEventListener("click", ev => {
        if (!adding) {
            toast.show();
            setPointSelected(false);
            toggleToastBtn(false);
            adding = true;
            assetAddButton.innerText = "Cancel";
        } else {
            toastCloseBtn.click();
        }
    });
    toastCloseBtn.addEventListener("click", evt => {
        adding = false;
        marker?.remove();
        marker = undefined;
        assetAddButton.innerText = "Add";
    })
    colorField.addEventListener("change", evt => {
        color = evt.target.value;
        if (marker) {
            marker.remove();
            marker = new mapboxgl.Marker({color}).setLngLat(marker.getLngLat()).addTo(map);
        }
    });
    // assets
    const canvasBody = document.querySelector(".offcanvas-body");
    const assetRows = canvasBody.querySelectorAll(".row");
    // map
    const mapEl = document.getElementById("map");
    const locationType = mapEl.getAttribute("location");
    let center = [-74.5, 40];
    {
        switch (locationType) {
            case "First":
                for (let i = 0; i < assetRows.length; i++) {
                    const cords = getCords(i);
                    if (cords) {
                        center = cords;
                        break;
                    }
                }
                break;
            case "Last":
                for (let i = assetRows.length - 1; i >= 0; i--) {
                    const cords = getCords(i);
                    if (cords) {
                        center = cords;
                        break;
                    }
                }
                break;
            case "Center":
                center[0] = 0;
                center[1] = 0;
                let count = 0;
                for (let i = 0; i < assetRows.length; i++) {
                    const cords = getCords(i);
                    if (cords) {
                        count++;
                        center[0] += cords[0];
                        center[1] += cords[1];
                    }
                }
                center[0] /= count;
                center[1] /= count;
                break;
        }

        function getCords(index) {
            const rowEl = assetRows[index];
            const dataEl = rowEl.querySelector(".asset-data");
            if (!dataEl) return undefined;
            return JSON.parse(dataEl.textContent).location.coordinates;
        }
    }

    mapboxgl.accessToken = 'pk.eyJ1Ijoic2VyZGFyLW96YXRhIiwiYSI6ImNsOGdkZ3Q3eTFsMDkzdnE5cHAwZWlkYnUifQ.mCfoW0i9br4f9NsDLl1kJA';
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center, // starting position [lng, lat]
        zoom: mapEl.getAttribute("zoom"), // starting zoom
        projection: 'globe' // display the map as a 3D globe
    });
    // asset creation
    let marker = undefined;
    map.on('click', (event) => {
        if (adding) {
            if (marker) {
                marker.setLngLat(event.lngLat);
            } else {
                toggleToastBtn(true);
                setPointSelected(true);
                marker = new mapboxgl.Marker({color}).setLngLat(event.lngLat).addTo(map);
            }
        }
    });

    function setPointSelected(selected) {
        toastText.innerText = selected ? dictionary.t_select[language] : dictionary.t_notselect[language];
    }

    function toggleToastBtn(enable) {
        if (enable)
            toastContinueBtn.removeAttribute("disabled");
        else
            toastContinueBtn.setAttribute("disabled", "");
    }

    // -- post input --
    // handle toggling
    const collapseElementList = modal.querySelectorAll('.collapse')
    const collapseList = [new bootstrap.Collapse(collapseElementList[0]),
        new bootstrap.Collapse(collapseElementList[1], {toggle: false}),
        new bootstrap.Collapse(collapseElementList[2], {toggle: false})]
    const btnGroup = modal.querySelector(".btn-group");
    let currentSelectIndex = 0;
    btnGroup.addEventListener("input", ev => {
        const id = ev.target.id;
        let index;
        switch (id) {
            case "radioFarm":
                index = 0;
                break;
            case "radioRealEstate":
                index = 1;
                break;
            case "radioLand":
                index = 2;
                break;
            default:
                return;
        }
        if (currentSelectIndex === index) return;

        collapseList[currentSelectIndex].hide();
        currentSelectIndex = index;
    })
    for (let i = 0; i < 3; i++) {
        let el = collapseElementList[i];
        el.addEventListener("hidden.bs.collapse", ev => {
            collapseList[currentSelectIndex].show()
        })
        el.addEventListener("shown.bs.collapse", ev => {
            if (currentSelectIndex === i) return;
            collapseList[i].hide()
        })
    }
    // url
    const url = getBaseUrl();

    // crop currency
    let currencyValue;
    const currencySelector = document.getElementById("inCurrency");
    const cropCurrency = document.getElementById("cropCostLabel");
    const applyCurrencyName = () => {
        currencyValue = currencySelector.value;
        cropCurrency.innerText = `Price (${currencyValue})`;
    };
    applyCurrencyName();
    currencySelector.addEventListener("change", applyCurrencyName);


    // crop planted
    const cropNameField = document.getElementById("inCropName");
    const cropCostField = document.getElementById("inCropCost");
    const plantedAtField = document.getElementById("inCropPlanted");
    const cropCheck = document.getElementById("cropCheck")
    let cropChecked = cropCheck.checked;
    toggleCropFields(cropChecked);

    cropCheck.addEventListener("input", ev => {
        cropChecked = ev.target.checked;
        toggleCropFields(cropChecked);
    })


    // input validation
    const nameField = document.getElementById("inName");
    const groupField = document.getElementById("inGroup");
    const priceField = document.getElementById("inPrice");
    const descriptionField = document.getElementById("inDesc");
    const addressField = document.getElementById("inAddress");
    const submit = document.getElementById("submitAssetCreate");
    const discard = document.getElementById("discardAssetCreate");

    const areaField = document.getElementById("inArea");
    const areaUnitSelector = document.getElementById("inAreaUnit");

    const estateTypeField = document.getElementById("inEstateType");
    const floorField = document.getElementById("inFloor");

    const usedForField = document.getElementById("inUsedFor");
    discard.addEventListener("click", ev => {
        clearFields(nameField, groupField, priceField, descriptionField, addressField, areaField);
        submit.classList.remove("disabled");
    })
    submit.addEventListener("click", ev => {
        const nameFParent = nameField.parentElement.parentElement;
        const cropFParent = cropNameField.parentElement.parentElement;
        if (validateName(nameField, nameFParent, nameFParent.querySelectorAll(".custom-feedback"), 3, 30) &&
            validateAddress(addressField, addressField.parentElement.parentElement, 3, 100)) {

            enableButtons(false);
            const data = {
                name: nameField.value,
                group: groupField.value,
                value: priceField.value,
                description: descriptionField.value,
                address: addressField.value,
                markerType: "Point",
                coordinates: [marker.getLngLat().lng, marker.getLngLat().lat],
                areaUnit: areaUnitSelector.value,
                area: areaField.value,
                color: colorField.value
            }
            switch (currentSelectIndex) {
                case 0:
                    data.kind = "Farm Land";
                    if (cropChecked) {
                        if (!validateName(cropNameField, cropFParent, cropFParent.querySelectorAll(".custom-feedback"),
                            3, 25)) {
                            enableButtons(true);
                            return;
                        }
                        data.currentCrop = {
                            plantedAt: plantedAtField.value,
                            cropName: cropNameField.value,
                            cost: cropCostField.value,
                        }
                    }
                    break;
                case 1:
                    data.kind = "Real Estate";
                    data.type = estateTypeField.value;
                    data.floor = floorField.value;
                    break;
                case 2:
                    data.kind = "Land";
                    data.usedFor = usedForField.value;
                    break;
            }
            axios({
                method: 'POST',
                url,
                data
            }).then(e => {
                enableButtons(true);
                [nameField, groupField, priceField, usedForField, descriptionField, addressField, cropNameField].forEach(el => {
                    el.value = "";
                });
                discard.click();
                toastCloseBtn.click();
                showSuccess(dictionary.s_asset[language]);
                setTimeout(() => window.location.reload(), 1000);
            }).catch(e => {
                enableButtons(true);
                toastCloseBtn.click();
                discard.click();
                showError(e.response.status);
            })

            function enableButtons(enable) {
                if (enable) {
                    submit.classList.remove("disabled");
                    discard.classList.remove("disabled");
                    submit.innerText = "Add";
                } else {
                    submit.innerText = "Adding";
                    submit.classList.add("disabled");
                    discard.classList.add("disabled");
                }
            }
        }
    });


    function toggleCropFields(enable) {
        [cropNameField, cropCostField, plantedAtField].forEach(el => {
            if (enable)
                el.removeAttribute("disabled");
            else
                el.setAttribute("disabled", "");
        })
    }

    // -- map list--
    // show data & init search
    const infoModal = document.getElementById("assetInfoModal");
    const bsInfoModal = new bootstrap.Modal(infoModal);
    const infoBody = infoModal.querySelector(".modal-body");
    const [typeGroupRow, descriptionRow, addressRow, priceAreaRow, usedForRow, realEstateRow, currentCropRow] = infoBody.querySelectorAll(".row");
    const costField = currentCropRow.children[2];
    const infoHeader = infoModal.querySelector(".modal-header").children[0];
    const hrCurrentCrop = document.getElementById("hrCurrentCrop");

    // stores pairs, first el of the pair is an array that contains name, group, and type; second one is the element itself
    const searchMap = [];

    for (let i = 0; i < assetRows.length; i++) {
        let rowEl = assetRows[i];
        let dataEl = rowEl.querySelector(".asset-data");
        if (!dataEl) continue;
        const data = JSON.parse(dataEl.textContent);
        if (!data) continue;
        if (data.group == null || data.group === "") {
            data.group = "none";
        }
        searchMap.push([[data.name.toLowerCase(), data.group.toLowerCase(), data.kind.toLowerCase()], rowEl]);
        const [infoBtn, goToBtn] = rowEl.querySelectorAll(".btn");

        infoBtn.addEventListener("click", ev => {
            if (bsInfoModal._isShown) return;
            infoHeader.textContent = data.name;
            setTextAt(typeGroupRow, 0, data.kind);
            setTextAt(typeGroupRow, 1, data.group);
            if (data.description) {
                hide(descriptionRow, false);
                setTextAt(descriptionRow, 1, data.description);
            } else {
                hide(descriptionRow, true);
            }
            setTextAt(addressRow, 1, data.address);

            const isAreaNull = data.area == null && data.area !== 0;
            const isPriceNull = data.value == null && data.value !== 0;

            if (isPriceNull && isAreaNull) {
                hide(priceAreaRow, true);
            } else {
                hide(priceAreaRow, false);
                if (!isAreaNull) {
                    setTextAt(priceAreaRow, 2, data.area);
                }
                if (!isPriceNull) {
                    hide(priceAreaRow, false);
                    setTextAt(priceAreaRow, 1, data.value + " " + data.currency);
                }
            }

            switch (data.kind) {
                case "Farm Land":
                    hide(realEstateRow, true);
                    hide(usedForRow, true);
                    if (data.currentCrop) {
                        hide(currentCropRow, false);
                        setTextAt(currentCropRow, 0, data.currentCrop.cropName);
                        const date = data.currentCrop.plantedAt;
                        const last = date.indexOf('T');
                        setTextAt(currentCropRow, 1, date.substring(0, last));
                        if (data.currentCrop.cost) {
                            hide(costField, false);
                            hide(hrCurrentCrop, false);
                            setTextAt(currentCropRow, 2, data.currentCrop.cost);
                        } else {
                            hide(costField, true);

                        }
                    } else {
                        hide(hrCurrentCrop, true);
                        hide(currentCropRow, true);
                    }
                    break;
                case "Real Estate":
                    hide(usedForRow, true);
                    hide(currentCropRow, true);
                    hide(realEstateRow, false);
                    setTextAt(realEstateRow, 1, data.type);
                    setTextAt(realEstateRow, 2, data.floor);
                    break;
                case "Land":
                    hide(realEstateRow, true);
                    hide(currentCropRow, true);
                    if (data.usedFor) {
                        hide(usedForRow, false);
                        setTextAt(usedForRow, 1, data.usedFor);
                    } else {
                        hide(usedForRow, true);
                    }
                    break;
            }
            bsInfoModal.show();
        });
        goToBtn.addEventListener("click", ev => {
            if (data.location.type === "Point") {
                let cords = data.location.coordinates;
                map.easeTo({center: [cords[0], cords[1]], zoom: 9});
            }
        });
        // markers
        const popupUl = document.createElement("ul");
        popupUl.classList.add("list-group", "list-group-flush");
        const popupName = createLiEl();
        popupName.textContent = `name:\t${data.name}`;
        if (data.group) {
            const popupGroup = createLiEl();
            popupGroup.textContent = `group:\t ${data.group}`;
        }
        if (data.description) {
            const popupDescription = createLiEl();
            popupDescription.textContent = `description:\t ${data.description}`;
        }
        if (data.address) {
            const popupAddress = createLiEl();
            popupAddress.textContent = `address:\t ${data.address}`;
        }

        let marker = new mapboxgl.Marker({color: data.color})
            .setLngLat(data.location.coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(popupUl.outerHTML))
            .addTo(map);


        function createLiEl() {
            const el = document.createElement("li");
            el.classList.add("list-group-item")
            popupUl.appendChild(el);
            return el;
        }
    }
    // search
    const searchInput = document.getElementById("map-search-input");
    searchInput.addEventListener("input", ev => {
        search(searchMap, ev.target.value, 0);
    });
}

function validateCropMove(harvested, plantedVal) {
    const parent = harvested.parentElement.parentElement
    const feedbacks = parent.querySelectorAll(".custom-feedback");
    const activeEls = parent.getElementsByClassName(active);
    if (activeEls.length > 0) {
        activeEls[0].classList.remove(active);
    }
    const val = harvested.value;
    if (val === "") {
        feedbacks[0].classList.add(active);
    } else if (plantedVal > val) {
        feedbacks[1].classList.add(active);
    } else {
        harvested.classList.add("is-valid");
        harvested.classList.remove("is-invalid");
        return true;
    }
    harvested.classList.remove("is-valid");
    harvested.classList.add("is-invalid");
    return false;
}


export const setupList = function (searchInput) {
    const searchMap = [];
    const assetHeaders = document.querySelectorAll(".accordion-header");

    // delete functionality
    const deleteModalEl = document.getElementById("deleteModal");
    const deleteModal = new bootstrap.Modal(deleteModalEl);
    let deleteTargetId;
    const [deleteAcceptBtn, deleteCancelBtn] = deleteModalEl.querySelector(".modal-footer").children;
    deleteAcceptBtn.addEventListener("click", evt => {
        disableEl(deleteAcceptBtn, true);
        disableEl(deleteCancelBtn, true);
        axios({
            method: 'DELETE',
            url: `${url}${deleteTargetId}`,
        }).then(e => {
            restoreButtons();
            document.getElementById(`h${deleteTargetId}`).remove();
            showSuccess(dictionary.d_success[language]);
        }).catch(e => {
            restoreButtons();
            showError(e.response.status);
        })

        function restoreButtons() {
            disableEl(deleteAcceptBtn, false);
            disableEl(deleteCancelBtn, false);
            deleteCancelBtn.click();
        }
    });

    // previous crop create modal
    const prevCropModalEl = document.getElementById("create-prev-crop");
    const prevCropModal = new bootstrap.Modal(prevCropModalEl);
    const prevCropDiscard = document.getElementById("discardPrevCropCreate");
    const prevCropSubmit = document.getElementById("submitPrevCropCreate");

    const prevCropHarvestedField = document.getElementById("inCropHarvested");
    const prevCropPlantedField = document.getElementById("inCropPlanted");
    const prevCropCostField = document.getElementById("inCropCost");
    const prevCropRevenueField = document.getElementById("inCropRevenue");
    const prevCropNameField = document.getElementById("inCropName")
    const prevCropFParent = prevCropNameField.parentElement.parentElement;

    let targetId;
    prevCropSubmit.addEventListener("click", () => {
        // validation
        if (!validateName(prevCropNameField, prevCropFParent, prevCropFParent.querySelectorAll(".custom-feedback"),
            3, 25)) return;
        if (!validateCropDates(prevCropPlantedField, prevCropHarvestedField, prevCropPlantedField.parentElement.parentElement)) return;
        const data = {
            plantedAt: prevCropPlantedField.value,
            harvestedAt: prevCropHarvestedField.value,
            cropName: prevCropNameField.value,
            cost: prevCropCostField.value ? prevCropCostField.value : undefined,
            revenue: prevCropRevenueField.value ? prevCropRevenueField.value : undefined,
        }
        axios({
            method: 'POST',
            url: `${url}${targetId}/crop/`,
            data
        }).then(() => {
            showSuccess(dictionary.s_edit[language]);
            restoreButtons(prevCropSubmit, prevCropDiscard);
            setTimeout(() => window.location.reload(), 1000);
        }).catch(e => {
            showError(e.response.status);
            restoreButtons(prevCropSubmit, prevCropDiscard);
        });

        // function restoreButtons() {
        //     disableEl(prevCropSubmit, false);
        //     disableEl(prevCropDiscard, false);
        //     prevCropDiscard.click();
        //     prevCropSubmit.textContent = dictionary.b_save[language];
        // }
    });

    prevCropDiscard.addEventListener("click", () => {
        prevCropNameField.value = "";
        prevCropRevenueField.value = "";
        prevCropCostField.value = "";
    });
    // move current crop
    const moveCropEl = document.getElementById("move-current-crop");
    const moveCropModal = new bootstrap.Modal(moveCropEl);
    const curCropDiscard = document.getElementById("discardMoveCropCreate");
    const curCropSubmit = document.getElementById("submitMoveCropCreate");

    const curCropRevenueField = document.getElementById("inCurCropRevenue");
    const curCropHarvestedField = document.getElementById("inCurCropHarvested")

    let curCropPlantedValue = undefined;

    curCropSubmit.addEventListener("click", () => {
        if (!validateCropMove(curCropHarvestedField, curCropPlantedValue)) return;
        const data = {
            harvestedAt: curCropHarvestedField.value,
            revenue: curCropRevenueField.value ? curCropRevenueField.value : undefined,
        }
        axios({
            method: 'PUT',
            url: `${url}${targetId}/crop/current`,
            data
        }).then(() => {
            showSuccess(dictionary.s_edit[language]);
            restoreButtons(curCropSubmit, curCropDiscard);
            setTimeout(() => window.location.reload(), 1000);
        }).catch(e => {
            showError(e.response.status);
            restoreButtons(curCropSubmit, curCropDiscard);
        });


    });
    curCropDiscard.addEventListener("click", () => {
        curCropRevenueField.value = "";
        clearFields(curCropHarvestedField);
    });

    // add crop
    const addCropEl = document.getElementById("create-crop");
    const addCropModal = new bootstrap.Modal(addCropEl);

    const addCropNameField = document.getElementById("inCurCropName");
    const addCropCostField = document.getElementById("inCurCropCost");
    const addCropPlantedField = document.getElementById("inCurCropPlanted");

    const addCropDiscard = document.getElementById("discardCurCropCreate");
    const addCropSubmit = document.getElementById("submitCurCropCreate");

    addCropSubmit.addEventListener("click", () => {
        const parent = addCropNameField.parentElement;
        if (!validateName(addCropNameField, parent, parent.querySelectorAll(".custom-feedback"), 3, 25)) return;
        if (!validateCropDates(addCropPlantedField, undefined, addCropPlantedField.parentElement.parentElement)) return;
        const data = {
            cropName: addCropNameField.value,
            plantedAt: addCropPlantedField.value ? addCropCostField.value : undefined,
            cost: addCropCostField.value ? addCropCostField.value : undefined,
        }
        axios({
            method: 'POST',
            url: `${url}${targetId}/crop/current`,
            data
        }).then(() => {
            showSuccess(dictionary.s_edit[language]);
            restoreButtons(addCropSubmit, addCropDiscard);
            setTimeout(() => window.location.reload(), 1000);
        }).catch(e => {
            showError(e.response.status);
            restoreButtons(addCropSubmit, addCropDiscard);
        });


    });
    addCropDiscard.addEventListener("click", () => {
        clearFields(addCropPlantedField, addCropNameField);
        addCropCostField.value = "";
    });

    // process assets
    const url = getBaseUrl();
    const deleteText = deleteModalEl.querySelector("h5.mb-0");
    for (let i = 0; i < assetHeaders.length; i++) {
        const assetNameEl = assetHeaders[i].children[0].children[0];
        const assetEl = assetHeaders[i].parentElement;
        const kind = assetEl.querySelector(".asset-kind").getAttribute("kind");
        const groupName = assetEl.getAttribute("groupname");
        // search
        searchMap.push([[assetNameEl.textContent.toLowerCase(), groupName.toLowerCase(), kind.toLowerCase()], assetEl]);
        // edit
        const editBtn = assetEl.querySelector(".accordion-edit-btn");
        // continue if user is not authorized
        if (!editBtn) continue;

        const aid = assetHeaders[i].id.substring(1);
        const saveBtn = assetEl.querySelector(".btn-outline-success");
        const deleteBtn = assetEl.querySelector("li button.btn-danger")
        const expandBtn = assetEl.querySelector(".btn-check");

        // farm land specific buttons
        const moveCropBtn = assetEl.querySelector("li .move-cur-crop");
        const addPrevCropBtn = assetEl.querySelector("li .add-prev-crop");
        const addCropBtn = assetEl.querySelector("li .add-crop");

        // edit functionality & click event listeners
        const inputs = assetEl.children[1].querySelectorAll("input");
        let inputsOn = false;
        let savedData;
        let saved = false;
        let collapsed = false;

        let firstExpand = true;
        expandBtn.addEventListener("change", ev => {
            collapsed = !collapsed;
            if (collapsed) {
                if (firstExpand) {
                    firstExpand = false;
                    inputs.forEach(el => {
                        if (el.hide)
                            resize(el);
                    })
                }
                editBtn.classList.remove("disabled");
            } else {
                editBtn.classList.add("disabled");
            }
        });
        let currencyIn = undefined;
        for (let k = 0; k < inputs.length; k++) {
            const el = inputs[k];
            const hide = el.parentElement.querySelector('.accordion-input-hide');
            if (hide) {
                el.hide = hide;
            }
            if (el.getAttribute("field") === "value")
                currencyIn = assetEl.querySelector("select.floatingInput.accordion-input");
            el.addEventListener("input", () => {
                if (el.hide)
                    resize(el);
                const changed = el.value !== savedData[k];
                if (changed) {
                    disableEl(saveBtn, false);
                } else {
                    disableEl(saveBtn, !isThereChange())
                }
            });

        }
        deleteBtn.addEventListener("click", () => {
            deleteModal.show();
            deleteText.textContent = dictionary.d_text1[language] + assetNameEl.textContent + dictionary.d_text2[language];
            deleteTargetId = aid;
        });

        // if farm land
        // addPrevCropBtn always exists if the type is farm land
        if (addPrevCropBtn) {
            addPrevCropBtn.addEventListener("click", () => {
                targetId = aid;
                prevCropModal.show();
            });
            const curCropRow = assetEl.querySelector(".cur-crop-row");
            if (curCropRow) {
                moveCropBtn.addEventListener("click", () => {
                    targetId = aid;
                    for (let el of curCropRow.querySelectorAll("input")) {
                        if (el.getAttribute("field") === "currentCrop.plantedAt") {
                            curCropPlantedValue = el.value;
                            break;
                        }
                    }
                    moveCropModal.show();
                });
            } else {
                // add current crop
                addCropBtn.addEventListener("click", () => {
                    targetId = aid;
                    addCropModal.show();
                });
            }
            // reformat dates
            const dateFields = assetEl.querySelectorAll(".crop-date");
            dateFields.forEach(el => formatDate(el));
        }

        saveBtn.addEventListener("click", () => {
            let data = {};
            // savedData is already initialized if saveBtn is clickable
            let k;
            for (k = 0; k < savedData.length; k++) {
                if (k < inputs.length) {
                    addData(inputs[k]);
                } else if (currencyIn && k === currencyIn.saveIndex) {
                    addData(currencyIn);
                }
            }
            if (isEmpty(data)) {
                console.error("This shouldn't have happened");
            } else {
                saveBtn.textContent = dictionary.b_saving[language];
                disableEl(saveBtn, true);
                disableEl(editBtn, true);
                axios({
                    method: 'PATCH',
                    url: `${url}${aid}`,
                    data
                }).then(e => {
                    saved = true;
                    showSuccess(dictionary.s_edit[language]);
                    restoreButtons();
                }).catch(e => {
                    showError(e.response.status);
                    restoreButtons();
                })
            }

            function restoreButtons() {
                disableEl(saveBtn, false);
                disableEl(editBtn, false);
                editBtn.click();
                saveBtn.textContent = dictionary.b_save[language];
            }

            function addData(el) {
                if (el.value !== savedData[k]) {
                    setKey(data, el.getAttribute("field"), el.value)
                    console.log(data);
                }
            }
        });

        editBtn.addEventListener("click", ev => {
            inputsOn = !inputsOn;
            // pre process
            if (inputsOn) {
                savedData = [];
                editBtn.textContent = dictionary.b_cancel[language];
            } else {
                editBtn.textContent = dictionary.b_edit[language];
            }
            // process
            for (let k = 0; k < inputs.length; k++) {
                const el = inputs[k];
                if (inputsOn) {
                    el.removeAttribute("disabled");
                    savedData.push(el.value);
                } else {
                    el.setAttribute("disabled", "");
                    if (!saved) {
                        el.value = savedData[k];
                        if (el.hide) {
                            resize(el);
                        }
                    }
                }
            }
            if (currencyIn) {
                if (inputsOn) {
                    currencyIn.removeAttribute("disabled");
                    savedData.push(currencyIn.value);
                    currencyIn.saveIndex = savedData.length - 1;
                } else {
                    currencyIn.setAttribute("disabled", "");
                    if (!saved) {
                        currencyIn.value = savedData[currencyIn.saveIndex];
                    }
                }
            }
            // post process
            disableEl(saveBtn, true);
            saved = false;
        });


        function isThereChange() {
            let k;
            for (k = 0; k < savedData.length; k++) {
                let el;
                if (k < inputs.length) {
                    el = inputs[k];
                } else if (currencyIn && k === currencyIn.saveIndex) {
                    el = currencyIn;
                }
                if (!el) continue;
                if (el.value !== savedData[k]) {
                    return true;
                }
            }
            return false;
        }

    }
// search
    const searchSelect = document.querySelector("#searchGroup select");
    searchSelect.addEventListener("change", () => search(searchMap, searchInput.value, searchSelect.selectedIndex));
    searchInput.addEventListener("input", ev => search(searchMap, ev.target.value, searchSelect.selectedIndex));

}


// this func can be replaced later with a more efficient one
function search(map, word, mod) {
    word = word.toLowerCase();
    if (word.trim() === "") {
        map.forEach(([key, val]) => hide(val, false));
        return;
    }

    map.forEach(([key, val]) => {
        let found;
        if (mod === 0) {
            found = key[0].includes(word) || key[1].includes(word) || key[2].includes(word);
        } else {
            found = key[mod - 1].includes(word);
        }
        if (found) {
            hide(val, false)
        } else
            hide(val, true)
    });
}

function resize(el) {
    el.hide.textContent = el.value;
    el.style.width = el.hide.offsetWidth + "px";
}

function hide(el, hide) {
    if (hide) el.classList.add("visually-hidden");
    else el.classList?.remove("visually-hidden");
}

function setTextAt(el, index, text) {
    el.children[index].children[1].textContent = text;
}

function disableEl(el, disable) {
    if (disable)
        el.classList.add("disabled");
    else
        el.classList.remove("disabled");
}

// doesn't work  :(
function parseJSON(text) {
    let ret = {};
    let index = 0;
    parse(ret);

    return ret;

    function parse(obj) {
        let typeCaught = false;
        let typeName;


        while (index < text.length) {
            switch (text[index]) {
                case '{': // new variable
                    index++;
                    if (typeCaught) {
                        obj[typeName] = {};
                        parse(obj[typeName]);
                    } else
                        parse(obj);
                    break;
                case '}':
                    index++;
                    return;
                case ' ':
                case '\n':
                case '\t':
                case ',':
                    index++;
                    break;
                case '[': // handle arrays
                    if (!typeCaught) throw "Invalid JSON";
                    const vLastIndex = text.indexOf(']', index + 1);
                    let val = text.substring(index, vLastIndex + 1);
                    index = vLastIndex + 1;
                    setVariable(val);
                    break;
                default: // handle rest
                    if (typeCaught) {
                        const aIndex = text.indexOf(',', index + 1);
                        const bIndex = text.indexOf('}', index + 1);
                        const vLastIndex = aIndex < bIndex ? aIndex : bIndex;
                        let val = text.substring(index, vLastIndex);
                        index = vLastIndex;
                        if (val[0] === '\'')
                            val = val.substring(1, val.length - 1);
                        setVariable(val);
                    } else {
                        const vLastIndex = text.indexOf(':', index + 1);
                        typeName = text.substring(index, vLastIndex);
                        typeCaught = true;
                        index = vLastIndex + 1;
                        typeName = typeName.trim();
                    }
                    break;

            }
        }

        function setVariable(val) {
            obj[typeName] = val.trim();
            typeCaught = false;
        }

    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function formatDate(dateEl) {
    const date = dateEl.getAttribute("in");
    dateEl.removeAttribute("in");
    const last = date.indexOf('T');
    dateEl.value = date.substring(0, last);
}


function setKey(obj, key, val) {
    const arr = key.split('.');
    let ret = obj;
    let i;
    for (i = 0; i < arr.length - 1; i++) {
        const k = arr[i];
        if (ret[k] === undefined) {
            ret[k] = {};
        }
        ret = ret[k];
    }
    ret[arr[i]] = val;
}

function createKey(obj, key) {
    const arr = key.split('.');
    let ret = obj;
    arr.forEach(k => ret = ret[k]);
    ret = {};
}










