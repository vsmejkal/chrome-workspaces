const DEFAULT_OPTIONS = {
    onDrop: (fromIndex, toIndex) => {},
};

const CssClass = {
    DRAG_START: "sortable__drag-start",
    DRAG_OVER: "sortable__drag-over",
}

function sortable(container, options) {
    let elements = container.children ?? [];
    let draggedElement = null; // element
    options = { ...DEFAULT_OPTIONS, ...options };

    // Fix flashing cursor
    container.ondragenter = (event) => {
        event.preventDefault();
    }
    container.ondragover = (event) => {
        event.preventDefault();
    }

    for (let el of elements) {
        el.draggable = true;

        el.ondragstart = (event) => {
            draggedElement = el;
            el.classList.add(CssClass.DRAG_START);
            event.dataTransfer.effectAllowed = "move";
        };

        el.ondragend = () => {
            el.classList.remove(CssClass.DRAG_START);
        }

        el.ondragover = (event) => {
            event.preventDefault();
            removeDragOverCss(container);

            if (el === draggedElement) {
                return;
            }

            el.classList.add(CssClass.DRAG_OVER);
        };

        el.ondrop = (event) => {
            event.preventDefault();
            removeDragOverCss(container);

            if (el === draggedElement) {
                return;
            }

            let fromIndex = 0, toIndex = 0;
            for (let i = 0; i < elements.length; i++) {
                if (draggedElement === elements[i]) {
                    fromIndex = i;
                }
                if (el === elements[i]) {
                    toIndex = i;
                }
            }
            if (fromIndex < toIndex) {
                el.parentNode.insertBefore(draggedElement, el.nextSibling);
            } else {
                el.parentNode.insertBefore(draggedElement, el);
            }
            options.onDrop(fromIndex, toIndex)
        };
    }
}

function removeDragOverCss(container) {
    for (const item of container.getElementsByClassName(CssClass.DRAG_OVER)) {
        item.classList.remove(CssClass.DRAG_OVER);
    }
}

export default sortable;
