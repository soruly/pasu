const arrayBufferToBase64 = (ab) => btoa(String.fromCharCode(...new Uint8Array(ab)));
const base64ToArrayBuffer = (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0)).buffer;

(async (e) => {
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
})();
