import{r as P,a as b}from"./react-vendor.CXPvv_bO.js";(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(e=>{for(const o of e)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function p(e){const o={};return e.integrity&&(o.integrity=e.integrity),e.referrerPolicy&&(o.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?o.credentials="include":e.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(e){if(e.ep)return;e.ep=!0;const o=p(e);fetch(e.href,o)}})();var h={exports:{}},d={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var f;function v(){if(f)return d;f=1;var s=P(),r=Symbol.for("react.element"),p=Symbol.for("react.fragment"),a=Object.prototype.hasOwnProperty,e=s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,o={key:!0,ref:!0,__self:!0,__source:!0};function i(l,t,x){var n,u={},m=null,g=null;x!==void 0&&(m=""+x),t.key!==void 0&&(m=""+t.key),t.ref!==void 0&&(g=t.ref);for(n in t)a.call(t,n)&&!o.hasOwnProperty(n)&&(u[n]=t[n]);if(l&&l.defaultProps)for(n in t=l.defaultProps,t)u[n]===void 0&&(u[n]=t[n]);return{$$typeof:r,type:l,key:m,ref:g,props:u,_owner:e.current}}return d.Fragment=p,d.jsx=i,d.jsxs=i,d}var y;function w(){return y||(y=1,h.exports=v()),h.exports}var F=w(),c={},A;function k(){if(A)return c;A=1;var s=b();return c.createRoot=s.createRoot,c.hydrateRoot=s.hydrateRoot,c}var S=k();const L=[{id:"8",title:"Version 1.7",summary:"New features, fixes, optimizations and improvements",description:`
Added
- [Axiom/Photon] Added support for contract address auto buy
- [Photon] Added new sub settings for "Live PNL" allowing you to change fields and transparency
- [Axiom] Added new styling settings for quick buy buttons
- [Axiom] Added new styling settings for social icons

Fixed
- [Axiom/Photon] Fixed Auto buy box being laggy when expanded/collapsed
- [Axiom] Fixed Shitter handling on BNB mode
- [Axiom] Fixed Shitter toggle not injecting on pool page
- [Photon] Fixed wallet selector automatically selecting all wallets on refresh or page load
- [Photon] Fixed live PNL tracker not showing sometimes
- [Photon] Fixed "Style Buy Button" sub setting "Glow Effect", you can now enable/disable it
- [Extension] Fixed custom colors not allowing you to delete them

Changed / Improved
- [Photon] Completely redesigned the live PNL tracker
- [Axiom/Photon/Extension] Major clean up, optimizations and improvements
- [Extension] Removed merge funds button it is now available from the action menu on the wallet list
- [Extension] Removed regenerate wallet delay
- [Extension] Removed active wallets limits in the wallets section
- [Extension] Made it possible to choose what type of tokens to burn
`,date:"October 24, 2025",isLatest:!0},{id:"7",title:"Version 1.6",summary:"Auto-Buy, Shitter toggle, new features & fixes",description:`
Added
- [Axiom/Photon] Added Auto-Buy feature (snipes coin by Token name / Ticker)
- [Axiom/Photon] Added Shitter toggle to quickly enable / disable Shitter transactions
- [Axiom/Photon] Quick Buy presets can now be configured to affect only selected token groups (New, Graduating, Graduated)
- [Axiom/Photon] Added opacity slider for the Quick Buy button
- [Axiom/Photon] Added volume slider for notification sounds
- [Axiom/Photon] Added support for Quick Buy buttons via search menu
- [Photon] Added Live PNL tracker
- [Photon] Added override for big social icons on wallet tracker
- [Photon] Added right-click on token card to open in new tab
- [Photon] Added support for custom colors in color palettes
- [Photon] Added Quick Buy buttons to watchlist tokens
- [Axiom] Added support for 2nd Quick Buy button
- [Extension] Added Move & Split feature to the Wallets section allowing users to quickly consolidate or split balance among all imported wallets
- [Extension] Added regenerate button to the Generate Wallet modal
- [Extension] Added support for custom input values to all sliders
- [Extension] Added new sound effects

Fixed
- [Axiom/Photon] Fixed auto-open chart to trigger only once, ignoring subsequent Quick Buys
- [Axiom] Fixed Quick Trade buttons in edit mode, no longer tries to send transactions when editing amounts
- [Axiom] Fixed edit button on Quick Trade not being aligned with the buy section
- [Axiom] Fixed auto-open chart settings
- [Photon] Fixed Blacklist by Site setting
- [Photon] Fixed domain tooltip not showing up on some coins
- [Photon] Fixed migration indicator animation
- [Extension] Fixed settings import not applying correct value for fee presets

Changed / Improved
- [Axiom/Photon] Performance improvements
- [Axiom/Photon] Moved Quick Buy presets to the left side
- [Extension] Added support for changing wallet order in Wallets list
- [Extension] Minor design changes
`,date:"August 23, 2025",isLatest:!1},{id:"6",title:"Version 1.5",summary:"Axiom updates, bug fixes, design improvements",description:`
Added
- [Extension] 'Burn' button that closes unused token accounts and reclaims SOL with 0% fee
- [Extension] Added fee presets
- [Photon] Dexscreener banner
- [Axiom] Implemented Shitter fee preset syncing with Axiom presets (enabled in Platforms -> Axiom)
- [Axiom/Photon] Custom keybinds for Quick Buy presets (can be set up in Settings tab)
- [Axiom/Photon] Sound effects for transactions (custom sounds coming soon)

Fixed
- [Photon] Fixed Average Entry line disappearing on migration
- [Photon] Fixed Average Entry line not appearing after performing a Quick Buy and immediately opening the chart
- [Axiom] Fixed 'Expand social icons' setting not applying to all icons and requiring a refresh

Changed / Improved
- [Axiom/Photon] Increased Quick Buy preset limit from 3 to 5
`,date:"June 3, 2025",isLatest:!1},{id:"5",title:"Version 1.4",summary:"Consolidate supply, Quick Buy presets, Axiom improvements, bug fixes",description:`
Added
- [Axiom] Added 'Expand social icons' setting
- [Axiom/Photon] Added Quick Buy amount presets
- [Axiom/Photon] Added Consolidate supply button (revert supply split)
- [Extension] Enabled enhanced MEV protection across all transaction modes
- [Extension] Added wallet generator

Fixed
- [Photon] Fixed PNLs on Boop, Raydium Launchpad, Meteora Dynamic Curve coins (still looking into post migration PNL bug)
- [Photon] Token card layout fixes
- [Axiom] Fixed a rare 'Missing token info' error on some coins
- [Axiom] Fixed ability to use Axiom for 'Snipe', 'Limit', and 'Advanced' orders
- [Extension] Fixed Server ping check freezing when one of the servers is down
- [Extension] Fixed transactions failing when slippage is above 100%

Changed / Improved
- [Axiom] Added proper styling for quick trade
- [Photon] Quick swap can now be resized
- [Photon] Updated styling & removed 'Shitter tools' section on quick swap
- [Photon] Updated pump.fun migration indicator icon
- [Extension] Server selector works when menu is closed
- [Extension] Design tweaks and animation updates
- [Extension] Implemented the option to disable double send protection
- [Extension] Wallet limits updated: unlimited total, 5 active
- [Extension] Notification position adjusted to avoid overlapping live PNL on Photon
        `,date:"May 17, 2025"},{id:"4",title:"Version 1.3",summary:"Split supply, static tip, bug fixes",description:`
Added
- [Axiom/Photon] Added an option to force the use of a static tip for Quick Buy buttons (Transactions tab)
- [Axiom/Photon] Added a 'Split Supply' button to the Quick-Swap menu (splits supply among all selected wallets in the Multi-Wallet menu)
- [Axiom/Photon] Added a 'Utility' section that specifies fees and tips for the 'Split Supply' button (and other upcoming utility txs)
- [Photon] Added Buy button overrides for the Wallet Tracker and copied token box
- [Photon] Added site domain display on hover over the 'Website' icon
- [Axiom] Added an 'Auto Open Chart' setting for Axiom
- [Axiom] Added a 'Quick Buy Buttons' setting for Axiom (allows custom sizes for Buy buttons)

Fixed
- [Axiom/Photon] Fixed transactions showing as successful when buying into a coin that is migrating or has finished migrating
- [Photon] Fixed the Average Entry line not appearing after refresh in some cases
- [Axiom] Fixed order buttons becoming unusable after migration and requiring a refresh

Changed
- The extension popup can now be resized
        `,date:"April 20, 2025"},{id:"3",title:"Version 1.2",summary:"Axiom support, live PNL fix, design fixes",description:`
Added
- [Axiom] Added Axiom support
- [Photon] Added Photon 'Hide token' functionality with no hidden token limit
- [Photon] Added Photon balance updates in top right corner when buying/selling

Fixed
- [Photon] Fixed token card styling, the image component is now a square, not a rectangle anymore
- [Photon] Fixed gap on token cards on Photon
- [Photon] Fixed live PNL showing invalid info when buying in and immediately opening chart
- [Extension] Fixed latency checking in server selector

Changed / Improved
- [Photon] Moved notifications down to prevent overlapping with the live PNL on Photon
- [Extension] Minor design changes
- [Photon] Changed pump.fun migration indicator icon
        `,date:"April 17, 2025"},{id:"2",title:"Version 1.1",summary:"Live PNL mode on Photon, Transaction mode, bug fixes, enhanced UI, improved theme consistency.",description:`
Added
- [Photon] Added Photon Live PNL support.
- [Extension] Added 'Transaction mode' option, ability to send transactions via nodes without MEV protection.
- [Extension] Added Quick Buy slippage option, you can now adjust it in the extension menu.
- [Photon] Added 'Select all wallets' button in Quick Swap menu on Photon
- [Photon] Added Pump.fun Migration market cap indicator option.
- [Photon/Extension] Added new sub settings to set custom sizes for expand social icons.
- [Photon] Added more styling settings for social icons.
- [Photon] Added more styling for quick buy buttons.

Fixed  
- [Photon] Token cards now update properly.
- [Photon] Blacklist sites feature works & updates correctly now.
- [Extension] Fixed issues with adding wallets.
- [Photon] Fixed Quick Swap menu not changing in real-time when disabling it.
- [Photon] Fixed SOL price indicator on the LP page.
- [Extension] Fixed dashboard layout issue with the news component.
- [Photon] Fixed horizontal scrollbar when compacting token cards.

Changed / Improved 
- [Extension] Updated color palette design.  
- [Photon] Search boxes now save and restore search inputs.  
- [Photon/Extension] Improved & optimized a lot of the styling.
- [Extension] Improved styling of settings sections to better match the theme.
- [Photon] Expanded social icons now apply to all tokens, no refresh needed.
- [Extension] Improved styling of tooltips menu to better match the theme.`,date:"April 13, 2025"},{id:"1",title:"Version 1.0",summary:"Initial release",description:"",date:"March 15, 2025"}];export{L as N,S as c,F as j};
