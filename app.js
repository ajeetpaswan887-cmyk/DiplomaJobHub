let branch="All";
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function load(){
 const params=new URLSearchParams(location.search);
 const type=params.get("type")||"";
 const selected=[...document.querySelectorAll(".type:checked")].map(x=>x.value);
 const p=new URLSearchParams({branch, q:$("#q").value.trim(), sort:$("#sort").value});
 if(type)p.set("type",type); else if(selected.length)p.set("types",selected.join(","));
 const r=await fetch("/api/jobs?"+p,{credentials:"same-origin"});
 const data=await r.json();
 $("#total").textContent=data.counts.total; $("#gov").textContent=data.counts.government; $("#psu").textContent=data.counts.psu; $("#priv").textContent=data.counts.private; $("#app").textContent=data.counts.apprenticeship;
 $("#msg").textContent=`${data.jobs.length} publisher-approved fresher listing(s)`;
 $("#jobs").innerHTML=data.jobs.length?data.jobs.map(card).join(""):"<div class='panel'>No matching fresher jobs found.</div>";
 $("#hot").innerHTML=data.hot.map((j,i)=>`<div class="hotitem"><b>${i+1}. ${esc(j.company)}</b><small>${esc(j.post)} • Last Date ${new Date(j.deadline).toLocaleDateString("en-IN")}</small></div>`).join("");
}
function card(j){return `<article class="job"><div><div class="company">${esc(j.company)}</div><small>${esc(j.source_name||"Official source")}</small><span class="tag">✓ Fresher / 0 Exp.</span></div><div><div class="branchtext">${esc(j.branch)}</div><small>${esc(j.type)}</small></div><div><b>${esc(j.post)}</b><small>📍 ${esc(j.location)}</small></div><div><div class="deadline">${new Date(j.deadline).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</div><small>${esc(j.salary||"See notification")}</small></div><div class="actions"><a class="apply" href="${esc(j.apply_url)}" target="_blank" rel="noopener noreferrer nofollow">Apply Now</a><a class="notify" href="${esc(j.notification_url)}" target="_blank" rel="noopener noreferrer nofollow">Notification</a></div></article>`}
document.querySelectorAll(".branch").forEach(b=>b.addEventListener("click",()=>{branch=b.dataset.b;document.querySelectorAll(".branch").forEach(x=>x.classList.remove("active"));b.classList.add("active");load()}));
document.querySelectorAll(".type").forEach(x=>x.addEventListener("change",load));
$("#search").addEventListener("click",load); $("#q").addEventListener("keydown",e=>{if(e.key==="Enter")load()}); $("#sort").addEventListener("change",load);
load();