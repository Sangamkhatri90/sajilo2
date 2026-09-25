(() => {
  const CONTROL_SELECTOR = "input, textarea";
  const PRESERVED_VALUE_ATTRIBUTE = "data-preserve-input";
  const PRESERVED_AUTOCOMPLETE_ATTRIBUTE = "data-keep-autocomplete";
  const IGNORED_INPUT_TYPES = new Set([
    "button",
    "checkbox",
    "color",
    "hidden",
    "image",
    "radio",
    "range",
    "reset",
    "submit"
  ]);

  function configureControl(control) {
    if (!(control instanceof HTMLInputElement) && !(control instanceof HTMLTextAreaElement)) {
      return;
    }

    if (control.hasAttribute(PRESERVED_AUTOCOMPLETE_ATTRIBUTE)) {
      return;
    }

    if (control instanceof HTMLInputElement && control.type === "password") {
      control.setAttribute("autocomplete", "new-password");
      return;
    }

    control.setAttribute("autocomplete", "off");
  }

  function configureForm(form) {
    if (form.hasAttribute(PRESERVED_AUTOCOMPLETE_ATTRIBUTE)) {
      return;
    }

    form.setAttribute("autocomplete", "off");
  }

  function configureRoot(root) {
    if (!root || typeof root.querySelectorAll !== "function") {
      return;
    }

    if (root instanceof HTMLFormElement) {
      configureForm(root);
    }

    if (root instanceof HTMLInputElement || root instanceof HTMLTextAreaElement) {
      configureControl(root);
    }

    root.querySelectorAll("form").forEach(configureForm);
    root.querySelectorAll(CONTROL_SELECTOR).forEach(configureControl);
  }

  function clearControl(control) {
    if (!(control instanceof HTMLInputElement) && !(control instanceof HTMLTextAreaElement)) {
      return;
    }

    if (control.disabled || control.readOnly || control.hasAttribute(PRESERVED_VALUE_ATTRIBUTE)) {
      return;
    }

    if (control instanceof HTMLInputElement && IGNORED_INPUT_TYPES.has(control.type)) {
      return;
    }

    control.value = "";
  }

  function clearForm(form) {
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    Array.from(form.elements).forEach((control) => {
      if (control.form === form) {
        clearControl(control);
      }
    });
  }

  function clearTarget(target) {
    if (target instanceof HTMLFormElement) {
      clearForm(target);
      return;
    }

    if (target && typeof target.querySelectorAll === "function") {
      target.querySelectorAll(CONTROL_SELECTOR).forEach(clearControl);
      return;
    }

    document.querySelectorAll(CONTROL_SELECTOR).forEach(clearControl);
  }

  function handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    window.setTimeout(() => {
      if (form.isConnected) {
        clearForm(form);
      }
    }, 0);
  }

  function start() {
    configureRoot(document);
    document.addEventListener("submit", handleSubmit, true);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            configureRoot(node);
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  window.clearUniversalInputValues = clearTarget;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
