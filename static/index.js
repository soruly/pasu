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
      duration: animation ? 30000 : Math.ceil(Date.now() / 30000) * 30000 - Date.now(),
      iterations: 1,
      easing: "linear",
    }
  );
  for (const { name, otp } of JSON.parse(event.data)) {
    document.querySelector(`#${name} .otp`).innerText = otp;
  }
};

document.querySelector(".overlay")?.addEventListener("click", (e) => {
  if (e.target.parentElement === document.body)
    document.querySelector(".overlay").classList.add("hidden");
});

document.querySelector(".add")?.addEventListener("click", (e) => {
  document.querySelector(".overlay").classList.remove("hidden");
});

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
    if (confirm(`Delete ${e.target.parentElement.parentElement.id} ?`)) {
      const res = await fetch("/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: e.target.parentElement.parentElement.id,
        }),
      });
      if (res.status === 204) window.location.reload();
    }
  });
}

if (navigator.serviceWorker) navigator.serviceWorker.register("/sw.js");
