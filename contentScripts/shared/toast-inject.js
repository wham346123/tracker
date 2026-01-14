(()=>{let n=document.getElementById("shitter-toast-container");if(n||(n=document.createElement("div"),n.id="shitter-toast-container",n.style.cssText="position:fixed;top:11%;left:50%;transform:translateX(-50%);z-index:2147483647;display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none;width:100%;max-width:400px;padding:0 20px;transition:gap 0.3s ease",document.body.appendChild(n)),!document.getElementById("shitter-toast-styles")){const i=document.createElement("style");i.id="shitter-toast-styles",i.textContent=`
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
            @keyframes slideIn {
                from {
                    transform: translate3d(0,-120%,0);
                    opacity: 0;
                }
                to {
                    transform: translate3d(0,0,0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                0% {
                    transform: translate3d(0,0,0);
                    opacity: 1; 
                    transform: scale(1);
                }
                60% {
                    transform: translate3d(10px,0,0);
                    opacity: 0;
                    transform: scale(0.95);
                }
                100% {
                    transform: translate3d(15px,0,0);
                    opacity: 0;
                    transform: scale(0.9);
                }
            }
            @keyframes expandHeight {
                from {
                    max-height: 1.4em;
                }
                to {
                    max-height: 10em;
                }
            }
            @keyframes collapseHeight {
                from {
                    max-height: 10em;
                }
                to {
                    max-height: 1.4em;
                }
            }`,document.head.appendChild(i)}function f(i,s=!1){const e=document.createElement("div"),o=document.createElement("div");let r,l;const d=1500,u=500;e.style.cssText=`width:100%;position:relative;padding:1px;background:${s?"linear-gradient(135deg,rgba(239,68,68,.35),rgba(239,68,68,.15))":"linear-gradient(135deg,rgba(0,102,255,.2),rgba(0,102,255,.1))"};border-radius:12px;margin-bottom:4px;box-shadow:${s?"0 4px 12px rgba(239,68,68,.15),0 0 0 1px rgba(239,68,68,.1)":"0 4px 12px rgba(0,102,255,.15),0 0 0 1px rgba(0,102,255,.2)"};animation:slideIn .3s cubic-bezier(.4,0,.2,1);pointer-events:all;will-change:transform,opacity,max-height,margin;font-family:"Montserrat",-apple-system,BlinkMacSystemFont,system-ui,sans-serif;transition:all 0.3s ease;cursor:default`,o.style.cssText="padding:12px 14px;background:rgba(10,10,10,.95);border-radius:11px;position:relative;display:flex;align-items:center;gap:12px;overflow:hidden";const c=document.createElement("div");c.style.cssText=`
            position: absolute; 
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 300%;
            height: 200%;
            background: linear-gradient(
                75deg,
                transparent,
                rgba(255, 255, 255, 0.08),
                transparent
            );
            transform: translateX(-100%);
            pointer-events: none;
            z-index: 1;
            will-change: transform;
            transition: transform 0.3s ease;
        `,c.animate([{transform:"translateX(-100%)"},{transform:"translateX(33.33%)"}],{duration:2e3,easing:"cubic-bezier(0.4, 0, 0.2, 1)",delay:u,iterations:1/0,direction:"normal"}),o.appendChild(c);const m=document.createElement("div");m.style.cssText=`position:absolute;bottom:0;left:0;height:2px;width:100%;background:${s?"linear-gradient(to right,#ef4444,#f87171)":"#0066FF"};transform-origin:left;opacity:.8`,l=m.animate([{transform:"scaleX(1)"},{transform:"scaleX(0)"}],{duration:d,easing:"linear",fill:"forwards"}),o.appendChild(m);const p=document.createElement("div");p.style.cssText=`width:24px;height:24px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:${s?"rgba(239,68,68,.1)":"rgba(16,185,129,.1)"};border-radius:6px`;const g=document.createElement("div");g.innerHTML=s?'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>':'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>',g.style.cssText=`color:${s?"#ef4444":"#10B981"};display:flex;align-items:center;justify-content:center`,p.appendChild(g);const h=document.createElement("div");h.style.cssText="flex:1;min-width:0";const a=document.createElement("span");a.textContent=i,a.style.cssText="color:white;font-size:13px;font-weight:500;line-height:1.4;letter-spacing:-0.01em;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-height:1.4em;word-wrap:break-word",h.appendChild(a),o.appendChild(p),o.appendChild(h);const t=document.createElement("button");t.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',t.style.cssText="background:transparent;border:none;padding:4px;margin:-4px;border-radius:4px;cursor:pointer;color:rgba(255,255,255,0.5);transition:all 0.2s ease;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(0.9)",t.addEventListener("mouseenter",()=>{t.style.color="rgba(255,255,255,0.9)",t.style.background="rgba(255,255,255,0.1)"}),t.addEventListener("mouseleave",()=>{t.style.color="rgba(255,255,255,0.5)",t.style.background="transparent"}),t.addEventListener("click",y=>{y.stopPropagation(),r&&clearTimeout(r),e.style.animation="slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",e.style.height=e.offsetHeight+"px",setTimeout(()=>{e.style.height="0",e.style.marginBottom="0",e.style.opacity="0"},100),setTimeout(()=>{e.remove(),n.children.length===0&&(n.style.gap="0px")},400)}),o.appendChild(t),e.appendChild(o),n.appendChild(e),e.addEventListener("mouseenter",()=>{a.style.whiteSpace="normal",a.style.textOverflow="unset",a.style.animation="expandHeight 0.2s ease-out forwards",t.style.opacity="1",t.style.transform="scale(1)"}),e.addEventListener("mouseleave",()=>{a.style.animation="collapseHeight 0.2s ease-out forwards",setTimeout(()=>{a.style.whiteSpace="nowrap",a.style.textOverflow="ellipsis"},150),t.style.opacity="0",t.style.transform="scale(0.9)"}),e.addEventListener("mouseenter",()=>{l&&l.pause(),r&&clearTimeout(r)}),e.addEventListener("mouseleave",()=>{if(l){l.play();const y=Math.max(0,d-(l.currentTime||0));r=setTimeout(()=>{e.style.animation="slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",e.style.height=e.offsetHeight+"px",setTimeout(()=>{e.style.height="0",e.style.marginBottom="0",e.style.opacity="0"},100),setTimeout(()=>{e.remove(),n.children.length===0&&(n.style.gap="0px")},400)},y)}}),r=setTimeout(()=>{e.style.animation="slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",e.style.height=e.offsetHeight+"px",setTimeout(()=>{e.style.height="0",e.style.marginBottom="0",e.style.opacity="0"},100),setTimeout(()=>{e.remove(),n.children.length===0&&(n.style.gap="0px")},400)},d)}window.addEventListener("message",i=>{if(i.data&&i.data.type==="shitter-toast"){const{message:s,isError:e}=i.data;f(s,e)}})})();
