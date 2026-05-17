(function () {
    "use strict";

    const input = document.getElementById("id_new_images");
    if (!input) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = Number(input.dataset.maxSize || 5 * 1024 * 1024);
    const minImages = Number(input.dataset.minImages || 1);
    const maxImages = Number(input.dataset.maxImages || 10);
    let selectedFiles = [];

    const preview = document.createElement("div");
    preview.className = "work-images-preview";
    preview.innerHTML = '<div class="work-images-preview__status"></div><div class="work-images-preview__grid"></div>';
    input.insertAdjacentElement("afterend", preview);

    const status = preview.querySelector(".work-images-preview__status");
    const grid = preview.querySelector(".work-images-preview__grid");

    function getExistingRows() {
        return Array.from(document.querySelectorAll("#images-group tbody tr.form-row"))
            .filter((row) => !row.classList.contains("empty-form"));
    }

    function getExistingActiveCount() {
        return getExistingRows().filter((row) => {
            const idInput = row.querySelector('input[name^="images-"][name$="-id"]');
            const deleteInput = row.querySelector('input[name^="images-"][name$="-DELETE"]');
            return idInput?.value && !deleteInput?.checked;
        }).length;
    }

    function getTotalCount() {
        return getExistingActiveCount() + selectedFiles.length;
    }

    function showMessage(message) {
        status.textContent = message;
        status.classList.add("work-images-preview__status--error");
        window.setTimeout(() => {
            status.classList.remove("work-images-preview__status--error");
            render();
        }, 3200);
    }

    function validateFile(file) {
        if (!allowedTypes.includes(file.type)) {
            return "Можно загружать только JPEG, PNG или WebP.";
        }
        if (file.size > maxSize) {
            return "Размер каждого изображения должен быть не больше 5 MB.";
        }
        return "";
    }

    function syncInputFiles() {
        if (typeof DataTransfer === "undefined") return;

        const dataTransfer = new DataTransfer();
        selectedFiles.forEach((file) => dataTransfer.items.add(file));
        input.files = dataTransfer.files;
    }

    function render() {
        grid.innerHTML = "";
        status.textContent = `Изображений: ${getTotalCount()} из ${maxImages}`;

        selectedFiles.forEach((file, index) => {
            const item = document.createElement("div");
            item.className = "work-images-preview__item";

            const image = document.createElement("img");
            image.src = URL.createObjectURL(file);
            image.alt = file.name;
            image.onload = () => URL.revokeObjectURL(image.src);

            const name = document.createElement("div");
            name.className = "work-images-preview__name";
            name.textContent = file.name;

            const controls = document.createElement("div");
            controls.className = "work-images-preview__controls";

            const up = document.createElement("button");
            up.type = "button";
            up.textContent = "↑";
            up.title = "Поднять";
            up.disabled = index === 0;
            up.addEventListener("click", () => moveSelectedFile(index, -1));

            const down = document.createElement("button");
            down.type = "button";
            down.textContent = "↓";
            down.title = "Опустить";
            down.disabled = index === selectedFiles.length - 1;
            down.addEventListener("click", () => moveSelectedFile(index, 1));

            const remove = document.createElement("button");
            remove.type = "button";
            remove.textContent = "Удалить";
            remove.addEventListener("click", () => removeSelectedFile(index));

            controls.append(up, down, remove);
            item.append(image, name, controls);
            grid.appendChild(item);
        });
    }

    function addFiles(files) {
        const acceptedFiles = [];

        for (const file of files) {
            const error = validateFile(file);
            if (error) {
                showMessage(error);
                continue;
            }
            acceptedFiles.push(file);
        }

        if (getTotalCount() + acceptedFiles.length > maxImages) {
            showMessage(`Можно загрузить максимум ${maxImages} изображений.`);
            input.value = "";
            syncInputFiles();
            return;
        }

        selectedFiles = selectedFiles.concat(acceptedFiles);
        syncInputFiles();
        render();
    }

    function moveSelectedFile(index, direction) {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= selectedFiles.length) return;

        [selectedFiles[index], selectedFiles[targetIndex]] = [
            selectedFiles[targetIndex],
            selectedFiles[index],
        ];
        syncInputFiles();
        render();
    }

    function removeSelectedFile(index) {
        if (getTotalCount() <= minImages) {
            showMessage("У товара должно остаться минимум 1 изображение.");
            return;
        }

        selectedFiles.splice(index, 1);
        syncInputFiles();
        render();
    }

    function normalizeExistingOrders() {
        getExistingRows().forEach((row, index) => {
            const orderInput = row.querySelector('input[name^="images-"][name$="-order"]');
            if (orderInput) orderInput.value = index;
        });
    }

    function moveExistingRow(row, direction) {
        const rows = getExistingRows();
        const index = rows.indexOf(row);
        const target = rows[index + direction];
        if (!target) return;

        if (direction < 0) {
            target.before(row);
        } else {
            target.after(row);
        }
        normalizeExistingOrders();
    }

    function addExistingOrderControls() {
        getExistingRows().forEach((row) => {
            if (row.querySelector(".work-images-inline-order")) return;

            const orderCell = row.querySelector(".field-order") || row.lastElementChild;
            if (!orderCell) return;

            const controls = document.createElement("span");
            controls.className = "work-images-inline-order";

            const up = document.createElement("button");
            up.type = "button";
            up.textContent = "↑";
            up.title = "Поднять";
            up.addEventListener("click", () => moveExistingRow(row, -1));

            const down = document.createElement("button");
            down.type = "button";
            down.textContent = "↓";
            down.title = "Опустить";
            down.addEventListener("click", () => moveExistingRow(row, 1));

            controls.append(up, down);
            orderCell.appendChild(controls);
        });
    }

    function guardDeletingLastExistingImage(event) {
        const checkbox = event.target;
        if (!checkbox.matches('input[name^="images-"][name$="-DELETE"]')) return;

        if (getTotalCount() < minImages) {
            checkbox.checked = false;
            showMessage("Нельзя удалить последнее изображение товара.");
        } else {
            render();
        }
    }

    input.addEventListener("change", (event) => {
        addFiles(Array.from(event.target.files || []));
    });
    document.addEventListener("change", guardDeletingLastExistingImage);
    addExistingOrderControls();
    normalizeExistingOrders();
    render();
})();
