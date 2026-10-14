export function onRequestGet({request}){
 const O=new URL(request.url).origin;
 return new Response(`User-agent: *\nAllow: /\nAllow: /api/img/\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${O}/sitemap.xml\n`,{headers:{"content-type":"text/plain;charset=utf-8"}});
}
