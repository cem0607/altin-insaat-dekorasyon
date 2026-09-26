const http=require("http"),fs=require("fs"),path=require("path");
const PORT=Number(process.env.PORT)||8788,ROOT=__dirname,firma=JSON.parse(fs.readFileSync(path.join(ROOT,"firma.json"),"utf8"));
function json(res,status,data){res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});res.end(JSON.stringify(data))}
function sendFile(res,file,type){try{res.writeHead(200,{"Content-Type":type});res.end(fs.readFileSync(path.join(ROOT,file)))}catch{res.writeHead(404);res.end("Not found")}}
function page(res){sendFile(res,"index.html","text/html; charset=utf-8")}
const hizmetler={
"/su-tesisati-ankara":{title:"Ankara Su Tesisatı | Altın İnşaat Dekorasyon",desc:"Ankara su tesisatı, su kaçağı, gider, musluk, lavabo ve tesisat arızaları için Altın İnşaat Dekorasyon. Sincan ve Ankara ilçeleri.",h:"Ankara Su Tesisatı",text:"Ankara'da su tesisatı, su kaçağı, gider, musluk, batarya, lavabo ve tesisat arızaları için hizmet talebi alıyoruz."},
"/elektrik-ankara":{title:"Ankara Elektrik Ustası | Altın İnşaat Dekorasyon",desc:"Ankara elektrik tesisatı, priz, sigorta, aydınlatma ve elektrik arızaları için Altın İnşaat Dekorasyon.",h:"Ankara Elektrik Tesisatı",text:"Ankara'da elektrik tesisatı, priz, sigorta, aydınlatma ve elektrik arızaları için hizmet talebi alıyoruz."},
"/mobilya-ankara":{title:"Ankara Mobilya | Mutfak Dolabı ve Özel Mobilya",desc:"Ankara mobilya, mutfak dolabı, gardırop, vestiyer ve özel imalat için Altın İnşaat Dekorasyon.",h:"Ankara Mobilya ve Özel İmalat",text:"Ankara'da mutfak dolabı, gardırop, vestiyer, masa ve özel ölçü mobilya işleri için hizmet talebi alıyoruz."},
"/tadilat-dekorasyon-ankara":{title:"Ankara Tadilat ve Dekorasyon | Altın İnşaat Dekorasyon",desc:"Ankara tadilat ve dekorasyon; banyo, mutfak, boya, fayans ve yenileme işleri.",h:"Ankara Tadilat ve Dekorasyon",text:"Ankara'da banyo, mutfak, boya, fayans, seramik ve genel tadilat-dekorasyon işleri için hizmet talebi alıyoruz."},
"/tamirat-ankara":{title:"Ankara Tamirat Ustası | Altın İnşaat Dekorasyon",desc:"Ankara tamirat ve onarım işleri için Altın İnşaat Dekorasyon. Ev ve iş yerleri için hizmet talebi.",h:"Ankara Tamirat ve Onarım",text:"Ankara'da ev ve iş yerleri için çeşitli tamirat, onarım ve arıza işleri konusunda hizmet talebi alıyoruz."},
"/altyapi-ankara":{title:"Ankara Altyapı İşleri | Altın İnşaat Dekorasyon",desc:"Ankara altyapı, kanalizasyon, rögar, drenaj ve yağmur suyu işleri için Altın İnşaat Dekorasyon.",h:"Ankara Altyapı Hizmetleri",text:"Ankara'da altyapı, kanalizasyon, rögar, drenaj ve yağmur suyu uygulamaları için hizmet talebi alıyoruz."},
"/ic-kapi-ankara":{title:"Ankara İç Kapı | Altın İnşaat Dekorasyon",desc:"Ankara iç kapı, kapı montajı, kasa, kilit ve menteşe işleri için Altın İnşaat Dekorasyon.",h:"Ankara İç Kapı Hizmetleri",text:"Ankara'da iç kapı, kapı montajı, kasa, kilit ve menteşe işleri için hizmet talebi alıyoruz."}
};
function servicePage(res,key){
 const x=hizmetler[key];
 if(!x)return page(res);
 const html=`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${x.title}</title><meta name="description" content="${x.desc}"><meta name="robots" content="index,follow"><link rel="canonical" href="https://altin-insaat-dekorasyon.onrender.com${key}"><meta property="og:title" content="${x.title}"><meta property="og:description" content="${x.desc}"><meta property="og:type" content="website"><script type="application/ld+json">{"@context":"https://schema.org","@type":"Service","name":"${x.h}","provider":{"@type":"LocalBusiness","name":"ALTIN İNŞAAT DEKORASYON","url":"https://altin-insaat-dekorasyon.onrender.com/","telephone":"+905064780495"},"areaServed":{"@type":"City","name":"Ankara"}}</script><style>body{font-family:Arial,sans-serif;background:#f1f4f7;color:#17202a;margin:0}.box{max-width:760px;margin:40px auto;padding:24px;background:#fff;border-radius:20px;box-shadow:0 7px 25px #102a4310}h1{color:#102a43}a{display:inline-block;background:#176fa7;color:#fff;padding:14px 18px;border-radius:12px;text-decoration:none;margin:6px 6px 0 0}.tel{background:#d7a62a;color:#17202a}</style></head><body><main class="box"><p>📍 Ankara • Sincan ve ilçeleri</p><h1>${x.h}</h1><p>${x.text}</p><h2>Nasıl ilerliyoruz?</h2><p>İşi anlatın, gerekiyorsa fotoğraf veya video gönderin. Kapsamı görüşüp keşif ve uygulanacak malzemeye göre planlama yapıyoruz.</p><a href="/">Talep oluştur</a><a class="tel" href="tel:+905064780495">📞 0506 478 04 95</a><a href="https://wa.me/905064780495">💬 WhatsApp</a><p><a href="/">← Ana sayfaya dön</a></p></main></body></html>`;
 res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"public, max-age=300"});res.end(html);
}
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
const server=http.createServer((req,res)=>{if(req.method==="GET"&&hizmetler[req.url.split("?")[0]])return servicePage(res,req.url.split("?")[0]);if(req.method==="GET"&&req.url==="/")return page(res);if(req.method==="GET"&&req.url==="/robots.txt")return sendFile(res,"robots.txt","text/plain; charset=utf-8");if(req.method==="GET"&&req.url==="/sitemap.xml")return sendFile(res,"sitemap.xml","application/xml; charset=utf-8");if(req.method==="GET"&&req.url==="/api/health")return json(res,200,{ok:true,service:firma.firma});if(req.method==="POST"&&(req.url==="/api/request"||req.url==="/api/feedback"))return handle(req,res);res.writeHead(404);res.end("Not found")});
server.listen(PORT,"0.0.0.0",()=>console.log(firma.firma+" port "+PORT));