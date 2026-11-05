  /* Ultron icon + Download app (Nov 5, Brody's red mask). */
  var ULTRON_SVG="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\"><rect width=\"64\" height=\"64\" rx=\"12\" fill=\"#000\"/><g fill=\"#D4111B\"><polygon points=\"9,4 16,5 30,24 28,27\"/><polygon points=\"55,4 48,5 34,24 36,27\"/><path fill-rule=\"evenodd\" d=\"M12 22 L26 33 L38 33 L52 22 L52 39 L46 49 L39 57 L32 52.5 L25 57 L18 49 L12 39 Z M17 30 L28 37.5 L19 39.5 Z M47 30 L36 37.5 L45 39.5 Z M20 43.5 L44 43.5 L41 49.5 L37 46.5 L32 50.5 L27 46.5 L23 49.5 Z\"/></g></svg>";
  var BOARD_URL="https://claude.ai/code/artifact/eef4aeae-7777-45e8-9eca-9b231c65b9c7";
  (function(){try{var u="data:image/svg+xml,"+encodeURIComponent(ULTRON_SVG);["icon","apple-touch-icon"].forEach(function(rel){var l=document.querySelector('link[rel="'+rel+'"]');if(!l){l=document.createElement("link");l.rel=rel;document.head.appendChild(l);}l.href=u;});}catch(e){}})();
  function launcherHTML(){
    var ico="data:image/svg+xml,"+encodeURIComponent(ULTRON_SVG);
    return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Ultron</title>'
      +'<link rel="icon" href="'+ico+'"><link rel="apple-touch-icon" href="'+ico+'">'
      +'<style>html,body{margin:0;height:100%;background:#000;color:#eee;font:15px system-ui,-apple-system,"Segoe UI",sans-serif}main{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:24px;text-align:center}main svg{width:140px;height:140px}a{display:inline-block;padding:11px 22px;border-radius:8px;background:#D4111B;color:#fff;font-weight:600;text-decoration:none}p{margin:0;color:#999;font-size:13px;max-width:420px}</style></head>'
      +'<body><main>'+ULTRON_SVG+'<a href="'+BOARD_URL+'">Open Ultron</a><p>Opening your board… Keep this file on your desktop or pin it to your taskbar to get back to Ultron in one click.</p></main>'
      +'<script>setTimeout(function(){location.href='+JSON.stringify(BOARD_URL)+';},400);<\/script></body></html>\n';
  }
  function dlApp(){
    if(!(window.claude&&window.claude.use)){chip("Downloads aren’t available in this view.",true);return;}
    window.claude.use("downloads").then(function(d){
      if(!d){chip("Downloads aren’t available in this view.",true);return;}
      return d.save({filename:"Ultron.html",data:launcherHTML()}).then(function(){chip("Saved Ultron.html. Open it to get back here.");},function(e){
        var c=e&&e.code;if(c==="declined")return;
        chip(c==="rate_limited"?"A download is already waiting for you. Try again in a moment.":"Couldn’t download it here"+(c?" ("+c+")":"")+".",true);});
    },function(){chip("Downloads aren’t available in this view.",true);});
  }
  document.addEventListener("click",function(e){if(e.target.closest("[data-dlapp]")){e.preventDefault();dlApp();}});
  function getAppHTML(){
    return '<section class="panel getapp"><span class="ga-ico" aria-hidden="true">'+ULTRON_SVG+'</span><div><h2>Get the Ultron app</h2><p class="hint">Downloads a small Ultron.html with this icon. Open it any time to land back on this board. Pin it to your taskbar or keep it on your desktop.</p></div><button type="button" class="btn" data-dlapp>Download app</button></section>';
  }
