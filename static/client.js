const events = new EventSource("/");

events.onmessage = (event) => {
  for (const { name, otp } of JSON.parse(event.data)) {
    document.querySelector(`#${name} .otp`).innerText = otp;
  }
};

document.querySelector("form").onsubmit = async (e) => {
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
};

for (const e of document.querySelectorAll(".delete")) {
  e.addEventListener("click", async (e) => {
    if (confirm(`Delete ${e.target.parentElement.id} ?`)) {
      const res = await fetch("/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: e.target.parentElement.id,
        }),
      });
      if (res.status === 204) window.location.reload();
    }
  });
}

if (navigator.serviceWorker) navigator.serviceWorker.register("/sw.js");
