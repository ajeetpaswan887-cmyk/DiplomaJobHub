let branch = "All";

const $ = s => document.querySelector(s);

async function load() {
  try {
    const params = new URLSearchParams(location.search);
    const type = params.get("type") || "";

    const selected = [
      ...document.querySelectorAll(".type:checked")
    ].map(x => x.value);

    const q = $("#q")?.value?.trim().toLowerCase() || "";

    const r = await fetch("./jobs.json", {
      cache: "no-store"
    });

    if (!r.ok) throw new Error("jobs.json not found");

    const data = await r.json();

    let jobs = Array.isArray(data.jobs) ? data.jobs : [];

    if (branch !== "All") {
      jobs = jobs.filter(j =>
        Array.isArray(j.branches) &&
        j.branches.some(b =>
          String(b).toLowerCase() === branch.toLowerCase()
        )
      );
    }

    if (selected.length) {
      jobs = jobs.filter(j =>
        selected.includes(j.category)
      );
    }

    if (type) {
      jobs = jobs.filter(j =>
        j.category === type
      );
    }

    if (q) {
      jobs = jobs.filter(j =>
        Object.values(j).some(v =>
          JSON.stringify(v).toLowerCase().includes(q)
        )
      );
    }

    $("#total").textContent = jobs.length;

    if ($("#msg")) {
      $("#msg").textContent =
        jobs.length
          ? `${jobs.length} opportunities found`
          : "No matching jobs found";
    }

    $("#jobs").innerHTML =
      jobs.map(card).join("");

    if ($("#hot")) {
      const hot = Array.isArray(data.hot)
        ? data.hot
        : jobs.slice(0, 5);

      $("#hot").innerHTML =
        hot.map(card).join("");
    }

  } catch (error) {
    console.error(error);

    $("#jobs").innerHTML = `
      <article class="job-card">
        <h3>Jobs temporarily unavailable</h3>
        <p>Please try again shortly.</p>
      </article>
    `;

    if ($("#msg")) {
      $("#msg").textContent =
        "Job data loading error";
    }
  }
}

function card(j) {
  const branches = Array.isArray(j.branches)
    ? j.branches.join(", ")
    : "";

  const apply =
    j.applyUrl ||
    j.officialApply ||
    j.url ||
    "#";

  return `
    <article class="job-card">
      <div class="job-top">
        <span class="badge">${esc(j.category || "Job")}</span>
        ${
          j.fresherOnly
            ? `<span class="badge">Fresher</span>`
            : ""
        }
      </div>

      <h3>${esc(j.title || "Job Opportunity")}</h3>

      <p><b>Company:</b> ${esc(j.company || "-")}</p>
      <p><b>Branch:</b> ${esc(branches || "-")}</p>
      <p><b>Qualification:</b> ${esc(j.qualification || "-")}</p>
      <p><b>Location:</b> ${esc(j.location || "-")}</p>

      ${
        j.lastDate
          ? `<p><b>Last Date:</b> ${esc(j.lastDate)}</p>`
          : ""
      }

      ${
        j.salary
          ? `<p><b>Salary/Stipend:</b> ${esc(j.salary)}</p>`
          : ""
      }

      <a class="apply-btn"
         href="${esc(apply)}"
         target="_blank"
         rel="noopener noreferrer">
        Official Apply ↗
      </a>
    </article>
  `;
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.querySelectorAll(".branch").forEach(btn => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".branch")
      .forEach(x => x.classList.remove("active"));

    btn.classList.add("active");

    branch = btn.dataset.b || "All";

    load();
  });
});

document.querySelectorAll(".type").forEach(box => {
  box.addEventListener("change", load);
});

$("#q")?.addEventListener("input", load);

$("#search")?.addEventListener("click", load);

load();
