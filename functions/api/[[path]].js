const J=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{"content-type":"application/json"}});
const slugify=s=>(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"muc";
const LN={vi:"vietnamese",en:"english"};
async function tx(env,t,f,o){
 if(!t||!t.trim())return t;
 try{if(env.AI){const r=await env.AI.run("@cf/meta/m2m100-1.2b",{text:t,source_lang:LN[f],target_lang:LN[o]});if(r&&r.translated_text)return r.translated_text}}catch(e){}
 try{const r=await fetch("https://api.mymemory.translated.net/get?q="+encodeURIComponent(t.slice(0,480))+"&langpair="+f+"|"+o);const j=await r.json();const x=j.responseData&&j.responseData.translatedText;if(x&&!/MYMEMORY WARNING/i.test(x))return x}catch(e){}
 throw new Error("Không dịch được")}
export async function onRequest({request,env,params}){
 const p=(params.path||[]).join("/"),m=request.method,db=env.DB,url=new URL(request.url);
 const auth=!!env.ADMIN_PASSWORD&&request.headers.get("x-admin")===env.ADMIN_PASSWORD;
 const need=()=>J({error:"Chưa đăng nhập"},401);
 try{
  if(p==="login")return auth?J({ok:1}):J({error:"Sai mật khẩu"},401);
  if(p==="settings"){
   if(m==="GET"){const r=await db.prepare("SELECT v FROM settings WHERE k='main'").first();return J(r?JSON.parse(r.v):{})}
   if(!auth)return need();
   await db.prepare("INSERT INTO settings(k,v) VALUES('main',?1) ON CONFLICT(k) DO UPDATE SET v=?1").bind(JSON.stringify(await request.json())).run();return J({ok:1})}
  if(p.startsWith("img")){
   if(m==="POST"){if(!auth)return need();const r=await db.prepare("INSERT INTO images(data) VALUES(?1)").bind(await request.text()).run();return J({url:"/api/img/"+r.meta.last_row_id})}
   const r=await db.prepare("SELECT data FROM images WHERE id=?1").bind(p.split("/")[1]).first();if(!r)return new Response("",{status:404});
   const [h,b]=r.data.split(",");
   return new Response(Uint8Array.from(atob(b),c=>c.charCodeAt(0)),{headers:{"content-type":h.slice(5,h.indexOf(";")),"cache-control":"public,max-age=31536000"}})}
  if(p==="translate"){if(!auth)return need();const b=await request.json();
   return J({texts:await Promise.all(b.texts.slice(0,20).map(t=>tx(env,t,b.from,b.to)))})}
  if(p==="contact"&&m==="POST"){const b=await request.json(),c=k=>String(b[k]||"").slice(0,2000);
   await db.prepare("INSERT INTO messages(name,phone,email,country,msg,created) VALUES(?1,?2,?3,?4,?5,?6)").bind(c("name"),c("phone"),c("email"),c("country"),c("message"),new Date().toISOString()).run();return J({ok:1})}
  if(p.startsWith("messages")){if(!auth)return need();
   if(m==="DELETE"){await db.prepare("DELETE FROM messages WHERE id=?1").bind(p.split("/")[1]).run();return J({ok:1})}
   const {results}=await db.prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 200").all();return J(results)}
  if(p.startsWith("items")){
   const key=p.split("/")[1],type=url.searchParams.get("type");
   if(m==="GET"){
    if(key){const r=await db.prepare("SELECT * FROM posts WHERE slug=?1"+(auth?"":" AND published=1")).bind(key).first();return r?J(r):J({error:"Không tìm thấy"},404)}
    const {results}=await db.prepare("SELECT id,slug,type,title,title_en,excerpt,excerpt_en,cover,cat,cat_en,published,created,sort FROM posts WHERE (?1 IS NULL OR type=?1)"+(auth?"":" AND published=1")+" ORDER BY sort ASC,created DESC,id DESC").bind(type).all();return J(results)}
   if(!auth)return need();
   if(m==="DELETE"){await db.prepare("DELETE FROM posts WHERE id=?1").bind(key).run();return J({ok:1})}
   const b=await request.json(),v=[b.type||"news",b.title||"",b.title_en||"",b.excerpt||"",b.excerpt_en||"",b.body||"",b.body_en||"",b.cover||"",b.cat||"",b.cat_en||"",b.published?1:0,b.created||new Date().toISOString().slice(0,10),parseInt(b.sort)||0];
   if(b.id){await db.prepare("UPDATE posts SET type=?1,title=?2,title_en=?3,excerpt=?4,excerpt_en=?5,body=?6,body_en=?7,cover=?8,cat=?9,cat_en=?10,published=?11,created=?12,sort=?13 WHERE id=?14").bind(...v,b.id).run();return J({ok:1})}
   const slug=slugify(b.title||b.title_en)+"-"+Date.now().toString(36).slice(-4);
   await db.prepare("INSERT INTO posts(type,title,title_en,excerpt,excerpt_en,body,body_en,cover,cat,cat_en,published,created,sort,slug) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14)").bind(...v,slug).run();return J({ok:1})}
  return J({error:"404"},404);
 }catch(e){return J({error:String(e.message||e)},500)}
}
