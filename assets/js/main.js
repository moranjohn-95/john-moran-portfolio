const videoPreview = document.querySelector("[data-video-preview]");

if (videoPreview) {
  const previewVideo = videoPreview.querySelector(".project-preview-video");
  const reducedMotionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  const resetPlaybackTime = () => {
    try {
      previewVideo.currentTime = 0;
    } catch {
      return;
    }
  };

  const resetVideoPreview = () => {
    if (!previewVideo) {
      return;
    }

    previewVideo.pause();
    resetPlaybackTime();
    previewVideo.setAttribute("aria-hidden", "true");
    videoPreview.classList.remove("is-playing");
  };

  const playVideoPreview = () => {
    if (!previewVideo || reducedMotionQuery.matches) {
      return;
    }

    previewVideo.muted = true;
    previewVideo.controls = false;
    previewVideo.loop = false;
    resetPlaybackTime();
    previewVideo.setAttribute("aria-hidden", "false");
    videoPreview.classList.add("is-playing");

    const playback = previewVideo.play();

    if (playback && typeof playback.catch === "function") {
      playback.catch(resetVideoPreview);
    }
  };

  videoPreview.addEventListener("mouseenter", playVideoPreview);
  videoPreview.addEventListener("mouseleave", resetVideoPreview);

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", resetVideoPreview);
  }
}

document.querySelectorAll(".project-card-thumbnail").forEach((thumbnail) => {
  const hideBrokenThumbnail = () => {
    thumbnail.hidden = true;
  };

  if (thumbnail.complete && thumbnail.naturalWidth === 0) {
    hideBrokenThumbnail();
  }

  thumbnail.addEventListener("error", hideBrokenThumbnail);
});

const siteNav = document.querySelector(".site-nav");
const navToggle = document.querySelector(".nav-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");

if (siteNav && navToggle && primaryNavigation) {
  const setNavigationState = (isOpen) => {
    primaryNavigation.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  };

  navToggle.addEventListener("click", () => {
    setNavigationState(navToggle.getAttribute("aria-expanded") !== "true");
  });

  primaryNavigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setNavigationState(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
      setNavigationState(false);
      navToggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (navToggle.getAttribute("aria-expanded") === "true" && !siteNav.contains(event.target)) {
      setNavigationState(false);
    }
  });

  const compactNavigationQuery = window.matchMedia("(max-width: 62rem)");
  const closeNavigationOnDesktop = (event) => {
    if (!event.matches) {
      setNavigationState(false);
    }
  };

  if (typeof compactNavigationQuery.addEventListener === "function") {
    compactNavigationQuery.addEventListener("change", closeNavigationOnDesktop);
  }
}

const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  const submitButton = contactForm.querySelector(".contact-form-submit");
  const submitText = contactForm.querySelector(".contact-submit-text");
  const feedbackMessage = contactForm.querySelector("#contact-form-feedback");
  const successMessage = "Thank you for getting in touch! Your message has been sent successfully. I'll get back to you as soon as possible.";
  const errorMessage = "Something went wrong while sending your message. Please try again.";
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const accessKeyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const defaultSubmitText = submitText ? submitText.textContent : "Send Message";
  const requiredFields = [
    {
      element: contactForm.elements.name,
      label: "Name",
    },
    {
      element: contactForm.elements.email,
      label: "Email",
    },
    {
      element: contactForm.elements.message_subject,
      label: "Subject",
    },
    {
      element: contactForm.elements.message,
      label: "Message",
    },
  ];

  const setFeedback = (message, state) => {
    if (!feedbackMessage) {
      return;
    }

    feedbackMessage.textContent = message;
    feedbackMessage.classList.remove("contact-form-feedback--success", "contact-form-feedback--error");

    if (state) {
      feedbackMessage.classList.add(`contact-form-feedback--${state}`);
    }
  };

  const setSubmitting = (isSubmitting) => {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isSubmitting;
    submitButton.classList.toggle("is-loading", isSubmitting);

    if (submitText) {
      submitText.textContent = isSubmitting ? "Sending..." : defaultSubmitText;
    }
  };

  const setFieldValidity = (field, isInvalid) => {
    if (!field) {
      return;
    }

    if (isInvalid) {
      field.setAttribute("aria-invalid", "true");
    } else {
      field.removeAttribute("aria-invalid");
    }
  };

  const clearFieldValidity = () => {
    requiredFields.forEach(({ element }) => {
      setFieldValidity(element, false);
    });
  };

  const trimFieldValue = (field) => {
    const trimmedValue = field.value.trim();
    field.value = trimmedValue;
    return trimmedValue;
  };

  const validateContactForm = () => {
    const emptyFields = [];
    let firstInvalidField = null;

    requiredFields.forEach(({ element, label }) => {
      const value = trimFieldValue(element);
      const isInvalid = value.length === 0;

      setFieldValidity(element, isInvalid);

      if (isInvalid) {
        emptyFields.push(label);
        firstInvalidField = firstInvalidField || element;
      }
    });

    const emailField = contactForm.elements.email;
    const emailValue = emailField.value.trim();
    const isEmailInvalid = emailValue.length > 0 && !emailPattern.test(emailValue);

    if (isEmailInvalid) {
      setFieldValidity(emailField, true);
      firstInvalidField = firstInvalidField || emailField;
    }

    if (emptyFields.length > 0 && isEmailInvalid) {
      return {
        isValid: false,
        firstInvalidField,
        message: "Please complete all required fields and enter a valid email address.",
      };
    }

    if (emptyFields.length > 0) {
      return {
        isValid: false,
        firstInvalidField,
        message: `Please complete the required ${emptyFields.length === 1 ? "field" : "fields"}: ${emptyFields.join(", ")}.`,
      };
    }

    if (isEmailInvalid) {
      return {
        isValid: false,
        firstInvalidField,
        message: "Please enter a valid email address.",
      };
    }

    return {
      isValid: true,
      firstInvalidField: null,
      message: "",
    };
  };

  const getContactFormPayload = () => {
    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData);

    payload.access_key = typeof payload.access_key === "string" ? payload.access_key.trim() : "";

    return payload;
  };

  const validateWeb3FormsConfiguration = (payload) => {
    if (!accessKeyPattern.test(payload.access_key)) {
      return {
        isValid: false,
        message: "The contact form is not configured correctly. Please add a valid Web3Forms access key.",
      };
    }

    return {
      isValid: true,
      message: "",
    };
  };

  const submitContactForm = async (payload) => {
    const response = await fetch(contactForm.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success !== true) {
      throw new Error(result.message || result.error || errorMessage);
    }

    return result;
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFeedback("", "");

    const validation = validateContactForm();

    if (!validation.isValid) {
      setFeedback(validation.message, "error");

      if (validation.firstInvalidField) {
        validation.firstInvalidField.focus();
      }

      return;
    }

    if (contactForm.elements.botcheck && contactForm.elements.botcheck.checked) {
      setFeedback(errorMessage, "error");
      return;
    }

    const payload = getContactFormPayload();
    const configuration = validateWeb3FormsConfiguration(payload);

    if (!configuration.isValid) {
      setFeedback(configuration.message, "error");
      return;
    }

    setSubmitting(true);

    try {
      await submitContactForm(payload);
      contactForm.reset();
      clearFieldValidity();
      setFeedback(successMessage, "success");
    } catch (error) {
      setFeedback(error.message || errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  });
}
