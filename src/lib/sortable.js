const DEFAULT_OPTIONS = {
  onDrop: (fromIndex, toIndex) => {},
};

function sortable(container, options) {
  let elements = container.children ?? [];
  let dragging = null; // element
  options = { ...DEFAULT_OPTIONS, ...options };

  for (let el of elements) {
    el.draggable = true;

    el.ondragstart = (event) => {
      dragging = el;
    };

    el.ondragover = (event) => {
      event.preventDefault();
    };

    el.ondrop = (event) => {
      event.preventDefault();
      if (el == dragging) {
        return;
      }
      let fromIndex = 0,
        toIndex = 0;
      for (let i = 0; i < elements.length; i++) {
        if (dragging == elements[i]) {
          fromIndex = i;
        }
        if (el == elements[i]) {
          toIndex = i;
        }
      }
      if (fromIndex < toIndex) {
        el.parentNode.insertBefore(dragging, el.nextSibling);
      } else {
        el.parentNode.insertBefore(dragging, el);
      }
      options.onDrop(fromIndex, toIndex)
    };
  }
}

export default sortable;
