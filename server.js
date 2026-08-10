require("dotenv").config();
const express=require("express"), helmet=require("helmet"), rateLimit=require("express-rate-limit"), session=require("express-session"), SQLiteStore=require("connect-sqlite3")(session), bcrypt=require("bcryptjs"), crypto=require("crypto"), path=require("path"), Database=require("better-sqlite3");

const app=express(); const PORT=Number(process.env.PORT||3000);
const IS_PROD=process.env.NODE_ENV==="production";
if(IS_PROD && !process.env.TRUST_PROXY) throw new Error("Set TRUST_PROXY in production behind a reverse proxy.");
if(process.env.TRUST_PROXY) app.set("trust proxy", Number(process.env.TRUST_PROXY));
app.disable("x-powered-by");
app.use(helmet({contentSecurityPolicy:false,referrerPolicy:{policy:"no-referrer"}}));
app.use(express.json({limit:"100kb"}));
app.use(express.urlencoded({extended:false,limit:"20kb"}));
app.use(rateLimit({windowMs:15*60*1000,max:300,standardHeaders:true,legacyHeaders:false}));
app.use(session({
  store:new SQLiteStore({db:"sessions.sqlite",dir:"./data"}),
  secret:process.env.SESSION_SECRET||(()=>{if(IS_PROD) throw new Error("SESSION_SECRET required"); return crypto.randomBytes(32).toString("hex")})(),
  resave:false,saveUninitialized:false,
  cookie:{httpOnly:true,secure:IS_PROD,sameSite:"lax",maxAge:2*60*60*1000}
}));
const db=new Database("./data/jobs.sqlite"); db.pragma("journal_mode=WAL"); db.pragma("foreign_keys=ON");
db.exec(`CREATE TABLE IF NOT EXISTS jobs(id INTEGER PRIMARY KEY AUTOINCREMENT,company TEXT NOT NULL,branch TEXT NOT NULL,type TEXT NOT NULL,post TEXT NOT NULL,location TEXT NOT NULL,deadline TEXT NOT NULL,salary TEXT,source_name TEXT NOT NULL,apply_url TEXT NOT NULL,notification_url TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS admin_users(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL);`);

function clean(v,max=300){return String(v??"").trim().slice(0,max)}
function validUrl(u){try{const x=new URL(u);return ["https:"].includes(x.protocol)}catch{return false}}
function validJob(o){const allowedB=["Electrical","Mechanical","Civil"], allowedT=["Government","PSU","Private","Apprenticeship"];return allowedB.includes(o.branch)&&allowedT.includes(o.type)&&clean(o.company,120)&&clean(o.post,160)&&clean(o.location,120)&&/^\d{4}-\d{2}-\d{2}$/.test(o.deadline)&&validUrl(o.apply_url)&&validUrl(o.notification_url)}
function csrf(req){if(!req.session.csrf) req.session.csrf=crypto.randomBytes(24).toString("hex");return req.session.csrf}
function auth(req,res,next){if(!req.session.adminId)return res.status(401).json({error:"Unauthorized"});next()}
function csrfCheck(req,res,next){if(req.get("X-CSRF-Token")!==req.session.csrf)return res.status(403).json({error:"CSRF check failed"});next()}

app.get("/health",(req,res)=>res.json({ok:true,service:"DiplomaJobHub"}));
app.get("/api/jobs",(req,res)=>{const branch=clean(req.query.branch,20),q=clean(req.query.q,100),type=clean(req.query.type,30),types=clean(req.query.types,100),sort=req.query.sort==="deadline"?"deadline":"latest";let sql=`SELECT * FROM jobs WHERE status='published' AND deadline>=date('now')`,args=[];
if(branch&&branch!=="All"){sql+=" AND branch=?";args.push(branch)} if(type){sql+=" AND type=?";args.push(type)} else if(types){const ts=types.split(",").filter(x=>["Government","PSU","Private","Apprenticeship"].includes(x));if(ts.length){sql+=` AND type IN (${ts.map(()=>"?").join(",")})`;args.push(...ts)}}
if(q){sql+=" AND (company LIKE ? OR post LIKE ? OR location LIKE ? OR branch LIKE ?)";args.push(...Array(4).fill("%"+q+"%"))}
sql+=" ORDER BY "+(sort==="deadline"?"deadline ASC":"created_at DESC")+" LIMIT 100";
const jobs=db.prepare(sql).all(...args), counts={total:jobs.length,government:jobs.filter(x=>x.type==="Government").length,psu:jobs.filter(x=>x.type==="PSU").length,private:jobs.filter(x=>x.type==="Private").length,apprenticeship:jobs.filter(x=>x.type==="Apprenticeship").length};
res.json({jobs,counts,hot:jobs.slice().sort((a,b)=>a.deadline.localeCompare(b.deadline)).slice(0,5)})});
app.get("/api/admin/me",(req,res)=>req.session.adminId?res.json({ok:true,csrf:csrf(req)}):res.status(401).json({error:"Unauthorized"}));
app.get("/api/admin/dashboard",auth,(req,res)=>{res.json({csrf:csrf(req),pending:db.prepare("SELECT * FROM jobs WHERE status='pending' ORDER BY created_at DESC").all(),published:db.prepare("SELECT * FROM jobs WHERE status='published' ORDER BY created_at DESC").all()})});
const loginLimiter=rateLimit({windowMs:15*60*1000,max:8,message:{error:"Too many login attempts. Try again later."}});
app.post("/api/admin/login",loginLimiter,async(req,res)=>{const u=clean(req.body.username,80),p=String(req.body.password||"");const row=db.prepare("SELECT * FROM admin_users WHERE username=?").get(u);if(!row||!(await bcrypt.compare(p,row.password_hash)))return res.status(401).json({error:"Invalid credentials"});await new Promise((resolve,reject)=>req.session.regenerate(e=>e?reject(e):resolve()));req.session.adminId=row.id;req.session.csrf=crypto.randomBytes(24).toString("hex");res.json({ok:true,csrf:req.session.csrf})});
app.post("/api/admin/logout",auth,csrfCheck,(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.post("/api/admin/jobs",auth,csrfCheck,(req,res)=>{const o=req.body;if(!validJob(o))return res.status(400).json({error:"Invalid job data or non-HTTPS URL"});const s=db.prepare(`INSERT INTO jobs(company,branch,type,post,location,deadline,salary,source_name,apply_url,notification_url,status) VALUES(?,?,?,?,?,?,?,?,?,?,?)`);s.run(clean(o.company,120),o.branch,o.type,clean(o.post,160),clean(o.location,120),o.deadline,clean(o.salary,100),clean(o.source_name,160),o.apply_url,o.notification_url,"published");res.json({ok:true})});
app.post("/api/admin/jobs/:id/publish",auth,csrfCheck,(req,res)=>{db.prepare("UPDATE jobs SET status='published',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='pending'").run(Number(req.params.id));res.json({ok:true})});
app.post("/api/admin/jobs/:id/reject",auth,csrfCheck,(req,res)=>{db.prepare("UPDATE jobs SET status='rejected',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='pending'").run(Number(req.params.id));res.json({ok:true})});
app.delete("/api/admin/jobs/:id",auth,csrfCheck,(req,res)=>{db.prepare("DELETE FROM jobs WHERE id=? AND status='published'").run(Number(req.params.id));res.json({ok:true})});

// Demo AI scan: creates a pending record only. Replace this endpoint with a server-side worker that
// reads permitted official feeds/APIs and calls an AI classifier using a secret stored in process.env.
app.post("/api/admin/scan",auth,csrfCheck,(req,res)=>{db.prepare(`INSERT INTO jobs(company,branch,type,post,location,deadline,salary,source_name,apply_url,notification_url,status) VALUES(?,?,?,?,?,?,?,?,?,?,?)`).run("AI Demo Discovery","Mechanical","Private","Diploma Trainee — Fresher","India","2099-12-31","See official notice","DEMO — replace with verified official source","https://example.com","https://example.com","pending");res.json({ok:true,message:"AI demo scan added one job to the review queue. Production scan must use verified official sources."})});

app.use(express.static(path.join(__dirname,"public"),{extensions:["html"],index:"index.html",dotfiles:"deny"}));
app.get("/admin",(req,res)=>res.sendFile(path.join(__dirname,"public","admin.html")));
app.use((req,res)=>res.status(404).send("Not found"));
app.listen(PORT,()=>console.log(`DiplomaJobHub listening on ${PORT}`));