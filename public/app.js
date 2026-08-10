let branch = "All";

const $ = (selector) => document.querySelector(selector);

let allJobs = [];

/* =========================
   LOAD JOB DATA
========================= */

async function loadJobs() {
  try {
    const response = await fetch("./jobs.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("jobs.json not found");
    }

    const data = await response.json();

    allJobs = Array.isArray(data)
      ? data
      : Array.isArray(data.jobs)
        ? data.jobs
        : [];

    renderJobs();

  } catch (error) {
    console.error(error);

    const jobsBox = $("#jobs");

    if (jobsBox) {
      jobsBox.innerHTML = `
        <div class="empty">
          <h3>⚠️ Jobs load nahi ho pa rahi hain</h3>
          <p>Please refresh the website.</p>
        </div>
      `;
    }
  }
}


/* =========================
   FILTER + SEARCH
========================= */

function renderJobs() {

  const searchInput = $("#q");

  const searchText = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

  const selectedTypes = [
    ...document.querySelectorAll(".type:checked")
  ].map(box => box.value.toLowerCase());

  const fresherOnly =
    document.querySelector(".fresher-filter input:checked") !== null;

  const filteredJobs = allJobs.filter(job => {

    /* Branch filter */

    const branches = Array.isArray(job.branches)
      ? job.branches
      : [];

    const branchMatch =
      branch === "All" ||
      branches.some(b =>
        String(b).toLowerCase() === branch.toLowerCase()
      );


    /* Job type filter */

    const category = String(
      job.category || ""
    ).toLowerCase();

    const typeMatch =
      selectedTypes.length === 0 ||
      selectedTypes.includes(category);


    /* Fresher filter */

    const fresherMatch =
      !fresherOnly ||
      job.fresherOnly === true;


    /* Search */

    const searchableText = [

      job.title,
      job.company,
      job.category,
      job.qualification,
      job.location,
      job.salary,

      ...(Array.isArray(job.branches)
        ? job.branches
        : [])

    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();


    const searchMatch =
      searchText === "" ||
      searchableText.includes(searchText);


    return (
      branchMatch &&
      typeMatch &&
      fresherMatch &&
      searchMatch
    );
  });


  /* Total jobs */

  if ($("#total")) {
    $("#total").textContent = filteredJobs.length;
  }

  if ($("#msg")) {
    $("#msg").textContent =
      `${filteredJobs.length} job${filteredJobs.length === 1 ? "" : "s"} found`;
  }


  /* Display jobs */

  const jobsBox = $("#jobs");

  if (jobsBox) {

    if (filteredJobs.length === 0) {

      jobsBox.innerHTML = `
        <div class="empty">
          <h3>🔎 No jobs found</h3>
          <p>
            Search another job, company, branch or location.
          </p>
        </div>
      `;

    } else {

      jobsBox.innerHTML =
        filteredJobs.map(createJobCard).join("");
    }
  }


  /* Hot jobs */

  const hotBox = $("#hot");

  if (hotBox) {

    const hotJobs = allJobs.slice(0, 5);

    hotBox.innerHTML =
      hotJobs.length
        ? hotJobs.map(createJobCard).join("")
        : "<p>No jobs available.</p>";
  }
}


/* =========================
   JOB CARD
========================= */

function createJobCard(job) {

  const title =
    escape
