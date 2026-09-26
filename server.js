const http=require("http"),fs=require("fs"),path=require("path");
const PORT=Number(process.env.PORT)||8788,ROOT=__dirname,firma=JSON.parse(fs.readFileSync(path.join(ROOT,"firma.json"),"utf8"));
function json(res,status,data){res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});res.end(JSON.stringify(data))}
function sendFile(res,file,type){try{res.writeHead(200,{"Content-Type":type});res.end(fs.readFileSync(path.join(ROOT,file)))}catch{res.writeHead(404);res.end("Not found")}}
function page(res){sendFile(res,"index.html","text/html; charset=utf-8")}
function save(file,data){const p=path.join(ROOT,file);let a=[];try{a=JSON.parse(fs.readFileSync(p,"utf8"))}catch{}data.id=Date.now();data.createdAt=new Date().toISOString();if(Array.isArray(data.files)&&data.files.length){const dir=path.join(ROOT,"uploads");fs.mkdirSync(dir,{recursive:true});data.files=data.files.map((f,i)=>{const ext=path.extname(f.name)||".bin";const name=data.id+"_"+i+ext;const out=path.join(dir,name);const b=String(f.data).split(",").pop();fs.writeFileSync(out,Buffer.from(b,"base64"));return {name:f.name,type:f.type,path:"uploads/"+name}})}a.push(data);fs.writeFileSync(p,JSON.stringify(a,null,2));return data}
async function sendNotification(x){
  const apiKey=process.env.RESEND_API_KEY;
  const to=process.env.NOTIFY_EMAIL;
  if(!apiKey||!to){console.log("E-posta bildirimi ayarlı değil. API anahtarı:",!!apiKey,"hedef:",!!to);return {sent:false,reason:"not_configured"}}
  const subject=x.type==="talep"?"Yeni müşteri talebi - "+(x.category||"Hizmet"):x.type==="şikayet"?"Yeni şikayet / geri bildirim":"Yeni müşteri memnuniyet geri bildirimi";
  const lines=[
    "ALTIN İNŞAAT DEKORASYON - Yeni Kayıt","",
    "Tür: "+x.type,
    "Hizmet: "+(x.category||"-"),
    "İlçe: "+(x.district||"-"),
    "Telefon: "+(x.phone||"-"),"",
    x.type==="talep"?"İş açıklaması: "+(x.problem||"-"):("Mesaj: "+(x.review||"-")),
    x.rating?"Puan: "+x.rating+"/5":"",
    "","Kayıt zamanı: "+x.createdAt
  ].filter(Boolean).join("\n");
  try{
    const r=await fetch("https://api.resend.com/emails",{
      method:"POST",
      headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json"},
      body:JSON.stringify({from:"onboarding@resend.dev",to:[to],subject,text:lines})
    });
    const j=await r.json().catch(()=>({}));
    if(!r.ok){console.error("Resend hatası:",r.status,j);return {sent:false,reason:"resend_error"}}
    console.log("E-posta bildirimi gönderildi:",j.id||"ok");
    return {sent:true}
  }catch(e){console.error("E-posta bağlantı hatası:",e.message);return {sent:false,reason:"network_error"}}
}
async function handle(req,res){
  let body="";
  req.on("data",c=>body+=c);
  req.on("end",async()=>{
    try{
      const x=JSON.parse(body||"{}"),type=x.type;
      if(type==="talep"&&(!x.problem||!x.phone))return json(res,400,{error:"problem ve telefon gerekli"});
      if(type==="memnuniyet"&&(!Number.isInteger(Number(x.rating))||Number(x.rating)<1||Number(x.rating)>5||!x.review))return json(res,400,{error:"1-5 arası puan ve yorum gerekli"});
      if(type==="şikayet"&&(!x.review||!x.phone))return json(res,400,{error:"şikayet ve telefon gerekli"});
      if(!["talep","memnuniyet","şikayet"].includes(type))return json(res,400,{error:"geçersiz kayıt tür"});
      const saved=save(type==="talep"?"requests.json":"feedback.json",x);
      const notification=await sendNotification(saved);
      json(res,200,{ok:true,saved:true,notification:notification.sent,notificationReason:notification.reason||null});
    }catch(e){console.error(e);json(res,400,{error:"geçersiz veri"})}
  })
}
const server=http.createServer((req,res)=>{if(req.method==="GET"&&req.url==="/")return page(res);if(req.method==="GET"&&req.url==="/robots.txt")return sendFile(res,"robots.txt","text/plain; charset=utf-8");if(req.method==="GET"&&req.url==="/sitemap.xml")return sendFile(res,"sitemap.xml","application/xml; charset=utf-8");if(req.method==="GET"&&req.url==="/api/health")return json(res,200,{ok:true,service:firma.firma});if(req.method==="POST"&&(req.url==="/api/request"||req.url==="/api/feedback"))return handle(req,res);res.writeHead(404);res.end("Not found")});
server.listen(PORT,"0.0.0.0",()=>console.log(firma.firma+" port "+PORT));