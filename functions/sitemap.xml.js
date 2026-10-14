const SECOF={news:"tin-tuc",product:"san-pham",pgroup:"san-pham",application:"ung-dung"};
export async function onRequestGet({request,env}){
 const O=new URL(request.url).origin,{results}=await env.DB.prepare("SELECT slug,type,created FROM posts WHERE published=1 AND type IN ('news','product','application','pgroup') ORDER BY created DESC").all();
 const u=(p,d)=>`<url><loc>${O}${p}</loc>${/^\d{4}-\d{2}-\d{2}/.test(d||"")?`<lastmod>${d.slice(0,10)}</lastmod>`:""}</url>`;
 const xml=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["/","/san-pham","/ung-dung","/tin-tuc"].map(p=>u(p)).join("")}${results.map(r=>u("/"+SECOF[r.type]+"/"+r.slug,r.created)).join("")}</urlset>`;
 return new Response(xml,{headers:{"content-type":"application/xml;charset=utf-8","cache-control":"public, max-age=600"}});
}
