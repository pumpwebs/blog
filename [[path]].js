const J=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{"content-type":"application/json"}});
const slugify=s=>(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"bai-viet";
export async function onRequest({request,env,params}){
 const p=(params.path||[]).join("/"),m=request.method,db=env.DB;
 const auth=!!env.ADMIN_PASSWORD&&request.headers.get("x-admin")===env.ADMIN_PASSWORD;
 try{
  if(p==="login")return auth?J({ok:1}):J({error:"Sai mật khẩu"},401);
  if(p==="settings"){
   if(m==="GET"){const r=await db.prepare("SELECT v FROM settings WHERE k='main'").first();return J(r?JSON.parse(r.v):{})}
   if(!auth)return J({error:"Chưa đăng nhập"},401);
   await db.prepare("INSERT INTO settings(k,v) VALUES('main',?1) ON CONFLICT(k) DO UPDATE SET v=?1").bind(JSON.stringify(await request.json())).run();return J({ok:1})}
  if(p.startsWith("img")){
   if(m==="POST"){if(!auth)return J({error:"Chưa đăng nhập"},401);
    const r=await db.prepare("INSERT INTO images(data) VALUES(?1)").bind(await request.text()).run();return J({url:"/api/img/"+r.meta.last_row_id})}
   const r=await db.prepare("SELECT data FROM images WHERE id=?1").bind(p.split("/")[1]).first();if(!r)return new Response("",{status:404});
   const [h,b]=r.data.split(",");
   return new Response(Uint8Array.from(atob(b),c=>c.charCodeAt(0)),{headers:{"content-type":h.slice(5,h.indexOf(";")),"cache-control":"public,max-age=31536000"}})}
  if(p.startsWith("posts")){
   const key=p.split("/")[1];
   if(m==="GET"){
    if(key){const r=await db.prepare("SELECT * FROM posts WHERE slug=?1"+(auth?"":" AND published=1")).bind(key).first();return r?J(r):J({error:"Không tìm thấy"},404)}
    const {results}=await db.prepare("SELECT id,slug,title,title_en,excerpt,excerpt_en,cover,cat,published,created FROM posts "+(auth?"":"WHERE published=1 ")+"ORDER BY created DESC,id DESC").all();return J(results)}
   if(!auth)return J({error:"Chưa đăng nhập"},401);
   if(m==="DELETE"){await db.prepare("DELETE FROM posts WHERE id=?1").bind(key).run();return J({ok:1})}
   const b=await request.json(),v=[b.title,b.title_en||"",b.excerpt||"",b.excerpt_en||"",b.body||"",b.body_en||"",b.cover||"",b.cat||"",b.published?1:0,b.created||new Date().toISOString().slice(0,10)];
   if(b.id){await db.prepare("UPDATE posts SET title=?1,title_en=?2,excerpt=?3,excerpt_en=?4,body=?5,body_en=?6,cover=?7,cat=?8,published=?9,created=?10 WHERE id=?11").bind(...v,b.id).run();return J({ok:1})}
   const slug=slugify(b.title)+"-"+Date.now().toString(36).slice(-4);
   await db.prepare("INSERT INTO posts(title,title_en,excerpt,excerpt_en,body,body_en,cover,cat,published,created,slug) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)").bind(...v,slug).run();return J({ok:1})}
  return J({error:"404"},404);
 }catch(e){return J({error:String(e.message||e)},500)}
}
