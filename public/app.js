let branch = "All";

const $ = s => document.querySelector(s);

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

async function load() {
  try {
    const params = new URLSearchParams(location.search);
    const type = params.get("type") || "";

    const selected = [
      ...document.querySelectorAll(".type:checked")
    ].map(x => x.value);

    const q = ($("#q")?.value || "").trim().toLowerCase();

    const res = await fetch("./jobs.json", { cache: "no-store" });

    if (!res.ok) {
      throw new Error("jobs.json load failed");
    }

    const data = await res.json();

    let jobs = Array.isArray(data.jobs) ? data.jobs : [];

    jobs = jobs.filter(j => {
      const branchOK =
        branch === "All" ||
        (Array.isArray(j.branches) && j.branches.includes(branch));

      const typeOK =
        !type &&
        selected.length === 0
          ? true
          : selected.length === 0
            ? true
            : selected.includes(j.category);

      const searchText = [
        j.title,
        j.company,
        j.category,
        j.location,
        j.qualification,
        ...(j.branches || [])
      ].join(" ").toLowerCase();

      const searchOK = !q || searchText.includes(q);

      return branchOK && typeOK && searchOK;
    });

    $("#total").textContent = jobs.length;

    const msg = $("#msg");
    if (msg) {
      msg.textContent = `${jobs.length} opportunities found`;
    }

    $("#jobs").innerHTML = jobs.map(card).join("");

    const hot = $("#hot");
    if (hot) {
      hot.innerHTML = jobs.slice(0, 5).map(card).join("");
    }

  } catch (error) {
    console.error(error);

    $("#jobs").innerHTML = `
      <div class="panel">
        <b>Jobs temporarily unavailable.</b>
        <p>Please refresh the page.</p>
      </div>
    `;
  }
}

function card(j) {
  return `
    <article class="job-card">
      <h3>${esc(j.title)}</h3>

      <p><b>${esc(j.company)}</b></p>

      <p>
        <span>${esc(j.category)}</span>
        ${j.fresherOnly ? " • Fresher" : ""}
      </p>

      <p>🎓 ${esc(j.qualification)}</p>

      <p>📍 ${esc(j.location)}</p>

      <p>💰 ${esc(j.salary)}</p>

      <p>
        ${(j.branches || [])
          .map(b => `<span class="tag">${esc(b)}</span>`)
          .join(" ")}
      </p>

      <a
        href="${esc(j.applyUrl || j.source || "#")}"
        target="_blank"
        rel="noopener"
        class="apply-btn"
      >
        View Official Notification
      </a>
    </article>
  `;
}

document.querySelectorAll(".branch").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".branch")
      .forEach(x => x.classList.remove("active"));

    btn.classList.add("active");
    branch = btn.dataset.b || "All";
    load();
  });
});

document.querySelectorAll(".type").forEach(input => {
  input.addEventListener("change", load);
});

const search = $("#search");
if (search) search.addEventListener("click", load);

const q = $("#q");
if (q) {
  q.addEventListener("keydown", e => {
    if (e.key === "Enter") load();
  });
}

load();
