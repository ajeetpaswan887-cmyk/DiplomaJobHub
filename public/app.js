let branch = "All";

const $ = (s) => document.querySelector(s);

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

async function load() {
  try {
    const r = await fetch("./jobs.json", {
      cache: "no-store"
    });

    if (!r.ok) {
      throw new Error("jobs.json load failed");
    }

    const data = await r.json();

    const allJobs = Array.isArray(data)
      ? data
      : Array.isArray(data.jobs)
        ? data.jobs
        : [];

    const q = ($("#q")?.value || "").trim().toLowerCase();

    const types = [...document.querySelectorAll(".type:checked")]
      .map(x => x.value);

    const filtered = allJobs.filter(job => {

      const branches = Array.isArray(job.branches)
        ? job.branches
        : [];

      const branchOK =
        branch === "All" ||
        branches.includes(branch);

      const typeOK =
        types.length === 0 ||
        types.includes(job.category);

      const text = [
        job.title,
        job.company,
        job.category,
        job.qualification,
        job.location,
        branches.join(" ")
      ].join(" ").toLowerCase();

      const searchOK =
        !q || text.includes(q);

      return branchOK && typeOK && searchOK;
    });

    if ($("#total")) {
      $("#total").textContent = allJobs.length;
    }

    if ($("#msg")) {
      $("#msg").textContent =
        `${filtered.length} jobs found`;
    }

    if ($("#jobs")) {
      $("#jobs").innerHTML =
        filtered.length
          ? filtered.map(card).join("")
          : `
            <div class="empty">
              <h3>🔎 No jobs found</h3>
              <p>Try another branch, job type or search.</p>
            </div>
          `;
    }

    if ($("#hot")) {
      const hotJobs = allJobs.slice(0, 5);

      $("#hot").innerHTML = hotJobs.length
        ? hotJobs.map(card).join("")
        : "<p>No jobs available.</p>";
    }

  } catch (error) {

    console.error(error);

    if ($("#jobs")) {
      $("#jobs").innerHTML = `
        <div class="empty">
          <h3>⚠️ Jobs load nahi ho pa rahi hain</h3>
          <p>Please try again after refreshing the website.</p>
        </div>
      `;
    }

    if ($("#msg")) {
      $("#msg").textContent = "Unable to load jobs";
    }
  }
}

function card(j) {

  const branches = Array.isArray(j.branches)
    ? j.branches.join(", ")
    : "";

  const source = j.source || j.applyUrl || "#";
  const apply = j.applyUrl || j.source || "#";

  return `
    <article class="job-card">

      <div class="job-top">
        <span class="badge">
          ${esc(j.category || "Job")}
        </span>

        ${
          j.fresherOnly
            ? `<span class="badge fresher">Fresher</span>`
            : ""
        }
      </div>

      <h3>${esc(j.title || "Diploma Job")}</h3>

      <p class="company">
        🏢 ${esc(j.company || "Company")}
      </p>

      <p>
        🎓 <b>Qualification:</b>
        ${esc(j.qualification || "Diploma")}
      </p>

      <p>
        ⚡ <b>Branch:</b>
        ${esc(branches || "Relevant")}
      </p>

      <p>
        📍 <b>Location:</b>
        ${esc(j.location || "India")}
      </p>

      <p>
        💰 <b>Salary:</b>
        ${esc(j.salary || "As per notification")}
      </p>

      <div class="job-actions">

        <a
          href="${esc(source)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source
        </a>

        <a
          class="apply-btn"
          href="${esc(apply)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apply Now →
        </a>

      </div>

    </article>
  `;
}


/* Branch buttons */

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


/* Job type filters */

document.querySelectorAll(".type").forEach(box => {

  box.addEventListener("change", load);

});


/* Search */

const searchBtn = $("#search");

if (searchBtn) {
  searchBtn.addEventListener("click", load);
}


/* Enter key search */

const searchBox = $("#q");

if (searchBox) {

  searchBox.addEventListener("keydown", e => {

    if (e.key === "Enter") {
      load();
    }

  });

}


/* Initial load */

load();
