import CSS from "./_css.js";
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const strip=h=>String(h||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
const cut=(s,n)=>s.length>n?s.slice(0,s.lastIndexOf(" ",n-1))+"…":s;
const SEC={"tin-tuc":{t:"news",vi:"Tin tức",en:"News"},"san-pham":{t:"product",vi:"Sản phẩm",en:"Products"},"ung-dung":{t:"application",vi:"Ứng dụng",en:"Applications"}};
export const SECOF={news:"tin-tuc",product:"san-pham",pgroup:"san-pham",application:"ung-dung"};
const T={vi:{home:"Trang chủ",about:"Giới thiệu",contact:"Liên hệ",all:"Tất cả",more:"Xem thêm »",rel:"Bài viết liên quan",relp:"Sản phẩm cùng nhóm",cta:"Cần tư vấn lựa chọn thiết bị?",ctab:"Liên hệ ngay",lang:"🌐 English",cat:"Danh mục",adv:"Tư vấn ngay",nf:"Không tìm thấy trang",qk:"Liên kết nhanh",pc:"Danh mục sản phẩm",grp:"Nhóm sản phẩm",hrs:"Giờ làm việc",mail:"Gửi email cho chúng tôi"},
en:{home:"Home",about:"About Us",contact:"Contact Us",all:"All",more:"Read More »",rel:"Related articles",relp:"More products in this group",cta:"Need help choosing equipment?",ctab:"Contact us",lang:"🌐 Tiếng Việt",cat:"Categories",adv:"Find Advisor",nf:"Page not found",qk:"Quick Links",pc:"Product Category",grp:"Product group",hrs:"Working Hours",mail:"Send Your Mail At"}};
export async function render({request,env,params},sec){
 const url=new URL(request.url),O=url.origin,en=url.searchParams.get("lang")=="en",x=T[en?"en":"vi"],db=env.DB;
 const slug=[].concat(params.slug||[]).join("/"),muc=url.searchParams.get("muc")||"";
 const sr=await db.prepare("SELECT v FROM settings WHERE k='main'").first(),S=sr?JSON.parse(sr.v):{};
 const pk=(r,k)=>(en?(r[k+"_en"]||r[k]):(r[k]||r[k+"_en"]))||"";
 const br=S.brand||"KENFLO",Q=p=>p+(en?(p.includes("?")?"&":"?")+"lang=en":"");
 const all=(await db.prepare("SELECT id,slug,type,title,title_en,excerpt,excerpt_en,cover,cat,cat_en,created,sort FROM posts WHERE published=1 ORDER BY sort ASC,created DESC,id DESC").all()).results;
 const G=t=>all.filter(r=>r.type==t),groups=G("pgroup"),U=r=>Q("/"+SECOF[r.type]+"/"+r.slug);
 const fg=p=>groups.find(g=>g.slug==p.cat||g.title==p.cat),CT=t=>[...new Map(G(t).filter(r=>r.cat).map(r=>[r.cat,r])).values()];
 const im=r=>r.cover?`<img src="${esc(r.cover)}" alt="${esc(pk(r,"title"))}" loading="lazy">`:esc(pk(r,"title"));
 const card=r=>`<a class="card" href="${U(r)}"><div class="im">${im(r)}</div><h3>${esc(pk(r,"title"))}</h3><p>${esc(cut(strip(pk(r,"excerpt")),110))}</p></a>`;
 const nw=r=>`<a class="nw card" href="${U(r)}"><div class="im">${r.cover?`<img src="${esc(r.cover)}" alt="${esc(pk(r,"title"))}" loading="lazy">`:""}</div><div class="b"><small>${esc(r.created)}</small><h3>${esc(pk(r,"title"))}</h3><p style="font-size:14px">${esc(cut(strip(pk(r,"excerpt")),150))}</p></div><div class="m">${x.more}</div></a>`;
 const abs=u=>!u?"":u.startsWith("http")?u:O+u;
 const lk=(href,t)=>`<a href="${href}">${esc(t)}</a>`;
 function shell(o){
  const canon=O+o.path,alt=en?O+o.path:O+o.path+(o.path.includes("?")?"&":"?")+"lang=en",viU=O+o.path;
  const dd=(l,f)=>l.length?`<div class="dd">${l.map(f).join("")}</div>`:"";
  const li=(k,h,d)=>`<li><a href="${h}" class="${o.sec==k?"on":""}">${esc(x[k]||(SEC[k]&&SEC[k][en?"en":"vi"]))}</a>${d||""}</li>`;
  const nav=`<li><a href="${Q("/")}">${x.home}</a></li><li><a href="${Q("/")}#about">${x.about}</a></li>`+li("san-pham",Q("/san-pham"),dd(groups,g=>`<a href="${Q("/san-pham/"+g.slug)}">${esc(pk(g,"title"))}</a>`))+li("ung-dung",Q("/ung-dung"),dd(CT("application"),c=>`<a href="${Q("/ung-dung?muc="+encodeURIComponent(c.cat))}">${esc(pk(c,"cat"))}</a>`))+li("tin-tuc",Q("/tin-tuc"),dd(CT("news"),c=>`<a href="${Q("/tin-tuc?muc="+encodeURIComponent(c.cat))}">${esc(pk(c,"cat"))}</a>`))+`<li><a href="${Q("/")}#contact">${x.contact}</a></li>`;
  const logo=S.logo_img?`<img src="${esc(S.logo_img)}" alt="${esc(br)}">`:esc(br);
  const flogo=S.footer_logo?`<img src="${esc(S.footer_logo)}" style="height:64px" alt="${esc(br)}">`:S.logo_img?`<img src="${esc(S.logo_img)}" style="height:56px;background:#fff;padding:6px;border-radius:4px" alt="${esc(br)}">`:esc(br);
  const crumbs=[[x.home,Q("/")],...(o.crumbs||[])];
  const ld=[{"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:crumbs.map((c,i)=>({"@type":"ListItem",position:i+1,name:c[0],item:O+c[1]}))},...(o.ld||[])];
  const contact=Array.isArray(S.contacts)&&S.contacts.length?S.contacts.map(r=>`<p>${esc(pk(r,"l"))}: ${esc(r.v)}</p>`).join(""):`<p>${esc(S.phone)}</p><p>${esc(S.email)}</p>`;
  return `<!DOCTYPE html><html lang="${en?"en":"vi"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(o.title)}</title><meta name="description" content="${esc(o.desc)}"><link rel="canonical" href="${canon}"><link rel="alternate" hreflang="vi" href="${viU}"><link rel="alternate" hreflang="en" href="${en?canon:alt}"><link rel="alternate" hreflang="x-default" href="${viU}"><meta property="og:type" content="${o.og||"website"}"><meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.desc)}"><meta property="og:url" content="${canon}"><meta property="og:site_name" content="${esc(br)}">${o.img?`<meta property="og:image" content="${esc(abs(o.img))}">`:""}<meta name="twitter:card" content="summary_large_image">${o.noindex?'<meta name="robots" content="noindex">':""}${S.favicon?`<link rel="icon" href="${esc(S.favicon)}">`:""}<style>${CSS}</style><script type="application/ld+json">${JSON.stringify(ld.length>1?ld:ld[0]).replace(/</g,"\\u003c")}</script></head><body>
<div class="top"><div class="wrap">${esc(pk(S,"welcome"))}</div><div class="hot">${esc(pk(S,"hotline"))} ${esc(S.phone)}</div></div>
<div class="hdr"><div class="wrap"><a class="logo" href="${Q("/")}">${logo}</a><div class="info"><b>${x.mail}</b><span>${esc(S.email)}</span></div><div class="info"><b>${x.hrs}</b><span>${esc(pk(S,"hours"))}</span></div></div></div>
<nav><div class="wrap"><button class="burger" style="display:none" onclick="document.getElementById('mn').classList.toggle('open')" aria-label="menu">☰</button><ul id="mn">${nav}</ul><button onclick="location.href='${en?viU:alt}'">${x.lang}</button><a class="cta" href="${Q("/")}#contact">${x.adv} →</a></div></nav>
<main>${o.body}</main>
<footer><div class="wrap"><div class="cols"><div><div class="logo">${flogo}</div><p style="margin-top:12px">${esc(pk(S,"intro"))}</p></div><div><h4>${x.pc}</h4><ul>${groups.map(g=>`<li><a href="${Q("/san-pham/"+g.slug)}">▸ ${esc(pk(g,"title"))}</a></li>`).join("")}</ul></div><div><h4>${x.qk}</h4><ul><li><a href="${Q("/san-pham")}">${SEC["san-pham"][en?"en":"vi"]}</a></li><li><a href="${Q("/ung-dung")}">${SEC["ung-dung"][en?"en":"vi"]}</a></li><li><a href="${Q("/tin-tuc")}">${SEC["tin-tuc"][en?"en":"vi"]}</a></li><li><a href="${Q("/")}#contact">${x.contact}</a></li></ul></div><div><h4>${x.contact}</h4>${contact}</div></div><div class="cp">© ${new Date().getFullYear()} ${esc(br)}</div></div></footer>
<script>(function(){try{var q=new URLSearchParams(location.search).get("lang"),l=localStorage.lang;if(q&&q!=l)localStorage.lang=q;else if(!q&&l=="en"&&!${o.noindex?"true":"false"})location.replace(location.pathname+location.search+(location.search?"&":"?")+"lang=en")}catch(e){}})()</script></body></html>`}
 const secN=SEC[sec][en?"en":"vi"],secPath="/"+sec;
 const ban=(a,c)=>`<div class="ban"><div class="wrap">${esc(a)}</div></div><div class="crumb"><div class="wrap">${c}</div></div>`;
 const crumb=(items)=>[`<a href="${Q("/")}">${x.home}</a>`,...items].join(" › ");
 const html=(b,s)=>new Response(b,{status:s||200,headers:{"content-type":"text/html;charset=utf-8","cache-control":"public, max-age=300"}});
 const cta=`<div style="background:var(--grey);padding:26px;margin-top:36px;text-align:center"><p style="font-size:20px;color:#000;margin-bottom:12px">${x.cta}</p><a class="btn" href="${Q("/")}#contact">${x.ctab}</a></div>`;
 /* ---- trang danh sách ---- */
 if(!slug){
  let body,title,desc=cut(strip(pk(S,"seo_desc")||pk(S,"products_intro")),155),path=secPath+(muc?"?muc="+encodeURIComponent(muc):"");
  if(sec=="san-pham"){
   title=`${secN} ${br}: ${groups.map(g=>pk(g,"title")).join(", ")}`;
   const used=new Set();
   body=ban(secN,crumb([esc(secN)]))+`<section class="sec"><div class="wrap"><p class="c" style="margin-bottom:30px">${esc(pk(S,"products_intro"))}</p>`+groups.map(g=>{const l=G("product").filter(p=>p.cat==g.slug||p.cat==g.title);l.forEach(p=>used.add(p.id));return `<h2 style="text-align:left;margin:30px 0 20px"><a href="${Q("/san-pham/"+g.slug)}">${esc(pk(g,"title"))}</a></h2><div class="grid">${l.map(card).join("")}</div>`}).join("")+(G("product").filter(p=>!used.has(p.id)).length?`<div class="grid" style="margin-top:30px">${G("product").filter(p=>!used.has(p.id)).map(card).join("")}</div>`:"")+`</div></section>`;
  }else{
   const t=SEC[sec].t,cats=CT(t),list=G(t).filter(r=>!muc||r.cat==muc);
   title=`${secN} ${br}${muc?" – "+muc:""} | ${br}`;
   body=ban(secN,crumb([esc(secN)]))+`<section class="sec"><div class="wrap"><div class="tabs"><a href="${Q(secPath)}"><button class="${muc?"":"on"}"><span>${x.all}</span></button></a>${cats.map(c=>`<a href="${Q(secPath+"?muc="+encodeURIComponent(c.cat))}"><button class="${c.cat==muc?"on":""}"><span>${esc(pk(c,"cat"))}</span></button></a>`).join("")}</div><div class="grid">${list.map(nw).join("")}</div></div></section>`;
  }
  return html(shell({title:sec=="san-pham"?title:title,desc:desc||title,path,body,sec,crumbs:[[secN,Q(secPath)]]}));
 }
 /* ---- trang chi tiết ---- */
 const r=await db.prepare("SELECT * FROM posts WHERE slug=?1 AND published=1").bind(slug).first();
 if(!r){return html(shell({title:x.nf+" | "+br,desc:x.nf,path:secPath+"/"+slug,sec,noindex:1,body:ban(secN,crumb([]))+`<section class="sec"><div class="wrap"><h1>${x.nf}</h1><p><a href="${Q("/")}">${x.home}</a></p></div></section>`}),404)}
 if(!SECOF[r.type])return Response.redirect(O+Q("/"),301);
 if(SECOF[r.type]!=sec)return Response.redirect(O+Q("/"+SECOF[r.type]+"/"+r.slug),301);
 const title=pk(r,"title"),desc=cut(strip(pk(r,"excerpt"))||strip(pk(r,"body")),155),path=secPath+"/"+r.slug,body0=pk(r,"body");
 const org={"@type":"Organization",name:br,url:O+"/",...(S.logo_img?{logo:abs(S.logo_img)}:{})};
 if(r.type=="pgroup"){
  const prods=G("product").filter(p=>p.cat==r.slug||p.cat==r.title);
  const gt=`${title} ${br} – ${secN}`;
  const body=ban(title,crumb([lk(Q(secPath),secN),esc(title)]))+`<section class="sec"><div class="wrap"><h1 style="font-size:34px;color:#000;text-align:center;margin-bottom:24px">${esc(title)}</h1><div class="grid">${prods.map(card).join("")}</div><div class="c" style="margin-top:46px">${body0}</div>${cta}</div></section>`;
  return html(shell({title:gt,desc:desc||gt,path,body,sec,img:r.cover,crumbs:[[secN,Q(secPath)],[title,Q(path)]],ld:[{"@context":"https://schema.org","@type":"CollectionPage",name:title,url:O+path,description:desc,hasPart:prods.map(p=>({"@type":"Product",name:pk(p,"title"),url:O+Q("/san-pham/"+p.slug)}))}]}));
 }
 const g=r.type=="product"?fg(r):null;
 const rel=(r.type=="product"?G("product").filter(p=>p.id!=r.id&&g&&(p.cat==g.slug||p.cat==g.title)):G(r.type).filter(p=>p.id!=r.id&&(!r.cat||p.cat==r.cat))).slice(0,r.type=="news"?6:8);
 const ldItem=r.type=="product"?{"@context":"https://schema.org","@type":"Product",name:title,description:desc,image:r.cover?[abs(r.cover)]:undefined,url:O+path,sku:r.slug,brand:{"@type":"Brand",name:br},category:g?pk(g,"title"):undefined}:{"@context":"https://schema.org","@type":"Article",headline:cut(title,110),description:desc,image:r.cover?[abs(r.cover)]:undefined,datePublished:r.created,dateModified:r.created,inLanguage:en?"en":"vi",author:org,publisher:org,mainEntityOfPage:O+path};
 const body=ban(secN,crumb([lk(Q(secPath),secN),...(g?[lk(Q("/san-pham/"+g.slug),pk(g,"title"))]:[]),esc(cut(title,50))]))+`<section class="sec"><div class="wrap art"><h1>${esc(title)}</h1><small>${esc(g?pk(g,"title"):pk(r,"cat"))} ${["news","application"].includes(r.type)?"· "+esc(r.created):""}</small>${r.cover?`<img src="${esc(r.cover)}" style="width:100%;margin:20px 0" alt="${esc(title)}">`:""}<div class="c">${body0}</div>${cta}</div></section>${rel.length?`<section class="sec rel"><div class="wrap"><h2><em>${r.type=="product"?x.relp:x.rel}</em></h2><div class="bar"></div><div class="grid">${rel.map(r.type=="product"?card:nw).join("")}</div></div></section>`:""}`;
 return html(shell({title:`${title} | ${br}`,desc:desc||title,path,body,sec,og:r.type=="product"?"website":"article",img:r.cover,crumbs:[[secN,Q(secPath)],[title,Q(path)]],ld:[ldItem]}));
}
