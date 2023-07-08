if (window.matchMedia("(display-mode: standalone)").matches) {
  window.resizeTo(500, 800);
}

const arrayBufferToBase64 = (ab) => btoa(String.fromCharCode(...new Uint8Array(ab)));
const base64ToArrayBuffer = (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0)).buffer;

document.querySelector(".register")?.addEventListener("click", async (e) => {
  try {
    const registrationOptions = await fetch("/register").then((e) => e.json());
    registrationOptions.challenge = base64ToArrayBuffer(registrationOptions.challenge);
    registrationOptions.user = {
      id: new Uint8Array(16),
      name: "soruly",
      displayName: "ソ瑠璃",
    };
    const {
      authenticatorAttachment,
      id,
      rawId,
      response: { attestationObject, clientDataJSON },
      type,
    } = await navigator.credentials.create({
      publicKey: registrationOptions,
    });

    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authenticatorAttachment,
        id,
        rawId: arrayBufferToBase64(rawId),
        response: {
          attestationObject: arrayBufferToBase64(attestationObject),
          clientDataJSON: arrayBufferToBase64(clientDataJSON),
        },
        type,
      }),
    });
    if (res.status === 204) document.querySelector(".login").click();
  } catch (e) {
    alert(e);
  }
});

document.querySelector(".login")?.addEventListener("click", async (e) => {
  const assertionOptions = await fetch("/login").then((e) => e.json());
  assertionOptions.challenge = base64ToArrayBuffer(assertionOptions.challenge);
  try {
    const {
      authenticatorAttachment,
      id,
      rawId,
      response: { authenticatorData, clientDataJSON, signature, userHandle },
      type,
    } = await navigator.credentials.get({
      publicKey: {
        ...assertionOptions,
        allowCredentials: assertionOptions.allowCredentials.map(({ type, id }) => ({
          type,
          id: base64ToArrayBuffer(id),
        })),
      },
    });

    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authenticatorAttachment,
        id,
        rawId: arrayBufferToBase64(rawId),
        response: {
          authenticatorData: arrayBufferToBase64(authenticatorData),
          clientDataJSON: arrayBufferToBase64(clientDataJSON),
          signature: arrayBufferToBase64(signature),
          userHandle,
        },
        type,
      }),
    });
    if (res.status === 204) window.location.reload();
  } catch (e) {
    alert(e);
  }
});

if (document.querySelector(".list")) {
  const events = new EventSource("/");
  let animation = null;
  events.onmessage = async (event) => {
    animation && animation.pause();
    animation = document.querySelector(".counter").animate(
      [
        { transform: `scaleX(1)`, transformOrigin: "left" },
        { transform: `scaleX(0)`, transformOrigin: "left" },
      ],
      {
        duration: JSON.parse(event.data).nextUpdate,
        iterations: 1,
        easing: "linear",
      },
    );
    const list = JSON.parse(event.data).list;
    for (const item of document.querySelectorAll(".list .item")) {
      item.querySelector(".otp").innerText = list.find((e) => e.id === item.dataset.id).otp;
    }
  };
}

document.querySelector(".overlay")?.addEventListener("click", (e) => {
  if (e.target.parentElement === document.body)
    document.querySelector(".overlay").classList.add("invisible");
});

document.querySelector(".add")?.addEventListener("click", (e) => {
  document.querySelector(".overlay").classList.remove("invisible");
});

document.querySelector("form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const res = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: e.target.querySelector(`[name=name]`).value,
      otp: e.target.querySelector(`[name=otp]`).value,
    }),
  });
  if (res.status === 204) window.location.reload();
  return false;
});

for (const e of document.querySelectorAll(".delete")) {
  e.addEventListener("click", async (e) => {
    if (
      confirm(`Delete ${e.target.parentElement.parentElement.querySelector(".title").innerText} ?`)
    ) {
      const res = await fetch("/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: e.target.parentElement.parentElement.dataset.id,
        }),
      });
      if (res.status === 204) window.location.reload();
    }
  });
}

if ("BarcodeDetector" in window) {
  const getCodeFromString = (str) => {
    try {
      const url = new URL(str);
      if (url.protocol === "otpauth:" && url.searchParams.get("secret")) {
        return {
          label: url.pathname.split("/").pop(),
          secret: url.searchParams.get("secret"),
          issuer: url.searchParams.get("issuer") ?? null,
        };
      }
    } catch (e) {
      return null;
    }
  };

  let mediaStream = null;
  document.querySelector(".scan").classList.remove("hidden");
  document.querySelector(".scan").addEventListener("click", async (e) => {
    const barcodeDetector = new BarcodeDetector({ formats: ["qr_code"] });
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: "environment" },
    });
    const video = document.querySelector(".camera");
    video.srcObject = mediaStream;
    video.onloadedmetadata = (e) => video.play();
    document.querySelector(".scanner").classList.remove("hidden");
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (video.readyState !== 4) continue;
      const results = await barcodeDetector.detect(video);
      if (results.some((e) => getCodeFromString(e.rawValue))) {
        window.navigator.vibrate(100);
        const { label, secret, issuer } = getCodeFromString(
          results.find((e) => getCodeFromString(e.rawValue)).rawValue,
        );
        document.querySelector(".scanner").classList.add("hidden");
        document.querySelector(`[name=name]`).value = issuer ? `${issuer} (${label})` : label;
        document.querySelector(`[name=otp]`).value = secret;
        document.querySelector(".overlay").classList.remove("invisible");
        for (const track of mediaStream.getTracks()) {
          track.stop();
        }
        break;
      }
    }
  });
  document.querySelector(".close").addEventListener("click", async (e) => {
    for (const track of mediaStream.getTracks()) {
      track.stop();
    }
    document.querySelector(".scanner").classList.add("hidden");
  });
}

if (navigator.serviceWorker) navigator.serviceWorker.register("/sw.js");
