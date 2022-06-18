const arrayBufferToBase64 = (ab) => btoa(String.fromCharCode(...new Uint8Array(ab)));
const base64ToArrayBuffer = (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0)).buffer;

(async (e) => {
  try {
    const registrationOptions = await fetch("/register").then((e) => e.json());
    registrationOptions.challenge = base64ToArrayBuffer(registrationOptions.challenge);
    registrationOptions.user = {
      id: new Uint8Array(16),
      name: "soruly",
      displayName: "soruly",
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
    if (res.status === 204) window.location.href = "/";
  } catch (e) {
    document.body.innerText = e;
  }
})();
