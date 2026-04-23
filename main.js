/* ============================================================
   HUMYNEX — Cinematic WebGL Experience  v3
   4 Scenes: DNA → Services → AI World → Pricing
   Premium interactive experience — Active Theory level quality
   ============================================================ */
'use strict';

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import ScrollSystem from './systems/scroll.js';
import AIWorld from './scenes/aiWorld.js';
import AudioSystem from './systems/audio.js';
import Logo from './components/Logo.js';
import Drones from './components/Drones.js';

// ── DATA ──────────────────────────────────────────────────────────
const PROJECTS = [
  {
    title: 'TLD Contracting',
    tag: 'Website / Local Business',
    desc: 'Cinematic scroll-expansion website for Omaha\'s premier contracting company. Frame-by-frame canvas animation, bento grid services, GSAP scroll triggers — built to convert.',
    tech: ['GSAP', 'Lenis', 'Canvas API', 'ScrollTrigger'],
    color: '#F59E0B',
    visit: 'file:///C:/Users/nashn/xix3d-website/index.html',
    visitLabel: 'View Live Site',
    isTLD: true,
    screenshot: '/screenshots/tld-contracting.jpg',
    videoUrl: '/screenshots/tld-contracting.mp4'
  },
  {
    title: 'WebFlow Pro',
    tag: 'Custom Website / SaaS',
    desc: 'End-to-end custom website design and development. Pixel-perfect, mobile-first, built to rank. Ships with speed optimization and analytics.',
    tech: ['Custom Build', 'SEO', 'Performance', 'Analytics'],
    color: '#00b4d8',
    screenshot: '/screenshots/webflow-pro.jpg',
    videoUrl: '/screenshots/webflow-pro.mp4'
  },
  {
    title: 'AutoAgent Suite',
    tag: 'AI Automation / Bots',
    desc: 'AI agent systems and chatbots that handle customer intake, lead qualification, booking, and follow-up 24/7. Plugs into CRM, Slack, or any platform.',
    tech: ['AI Agents', 'LLM Integration', 'CRM Hooks', 'Webhooks'],
    color: '#7b2fff',
    screenshot: '/screenshots/autoagent.jpg',
    videoUrl: '/screenshots/autoagent.mp4'
  },
  {
    title: 'AppForge',
    tag: 'Web & Mobile Apps',
    desc: 'Full-stack web and mobile application development. From concept to App Store. Clean code, fast delivery, no bloat.',
    tech: ['React', 'React Native', 'Node.js', 'Supabase'],
    color: '#00d4aa',
    screenshot: '/screenshots/appforge.jpg',
    videoUrl: '/screenshots/appforge.mp4'
  }
];

const SERVICES = [
  { name: 'Websites',    sub: 'Custom Digital Experiences', color: '#00b4d8', features: ['Landing Pages', 'E-Commerce', 'Web Apps', 'CMS Integration'] },
  { name: 'Mobile Apps', sub: 'iOS & Android Native',       color: '#7b2fff', features: ['React Native', 'App Store Launch', 'Push Notifications', 'Offline Mode'] },
  { name: 'AI Agents',   sub: 'Autonomous Systems',         color: '#00d4aa', features: ['24/7 Automation', 'Lead Qualification', 'CRM Integration', 'Multi-Platform'] },
  { name: 'Branding',    sub: 'Visual Identity Systems',    color: '#f59e0b', features: ['Logo & Identity', 'Brand Guidelines', 'Motion Graphics', 'UI Systems'] },
  { name: 'Automation',  sub: 'AI-Powered Workflows',       color: '#ff6b6b', features: ['Zapier / Make', 'Custom Pipelines', 'Data Processing', 'API Hooks'] }
];

const PRICING_PLANS = [
  {
    tier: 'STARTER',
    price: '$250',
    period: 'per project',
    color: '#00b4d8',
    features: ['7–14 Day Delivery', '5-Page Custom Site', 'Mobile Responsive', 'Basic SEO Setup', '30-Day Support'],
    featured: false
  },
  {
    tier: 'GROWTH',
    price: '$2,200',
    period: 'per project',
    color: '#7b2fff',
    features: ['2–3 Week Delivery', 'Custom Design System', 'AI Integration', 'Advanced Analytics', '90-Day Support'],
    featured: true
  },
  {
    tier: 'ENTERPRISE',
    price: 'Custom',
    period: 'scope-based',
    color: '#00d4aa',
    features: ['Scope-Based Timeline', 'Unlimited Scope', 'AI Agent Suite', 'Full Brand Identity', 'Ongoing Retainer'],
    featured: false
  }
];

// Loader is self-dismissing via canvas animation in index.html

// ── AMBIENT AUDIO ─────────────────────────────────────────────────
const ambient = new Audio('/sounds/ambient.mp3');
ambient.loop   = true;
ambient.volume = 0.4;

window.addEventListener('click', () => {
  ambient.play();
}, { once: true });

const hoverSound = new Audio('/sounds/hover.mp3');
hoverSound.volume = 0.3;

// ── CHARGE SCREEN INTEGRATION ─────────────────────────────────────
let sceneReady = false;
function initScene() { if (sceneReady) return; sceneReady = true; setupScene(); }
if (window._chargeComplete) { initScene(); }
else { window.addEventListener('chargeComplete', initScene); setTimeout(initScene, 4000); }

// ── CANVAS TEXTURE BUILDERS ───────────────────────────────────────
function buildTLDTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 320;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0a0806'; ctx.fillRect(0,0,512,320);
  ctx.fillStyle='rgba(245,158,11,0.15)'; ctx.fillRect(0,0,512,48);
  ctx.strokeStyle='#F59E0B'; ctx.lineWidth=1.5;
  ctx.beginPath();
  for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2-Math.PI/6;const x=28+Math.cos(a)*14,y=24+Math.sin(a)*14;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
  ctx.closePath(); ctx.stroke();
  ctx.font='bold 13px monospace'; ctx.fillStyle='#F59E0B'; ctx.fillText('TLD CONTRACTING',56,30);
  ctx.font='9px monospace'; ctx.fillStyle='rgba(245,158,11,0.5)'; ctx.fillText('ROOFING · SIDING · PAINTING · OMAHA',56,42);
  ctx.font='bold 26px sans-serif'; ctx.fillStyle='#fff'; ctx.fillText('Built Right.',28,96);
  ctx.fillStyle='#F59E0B'; ctx.fillText('Every Time.',28,128);
  ['Roofing','Siding','Painting','Trash-Outs'].forEach((s,i)=>{
    const x=16+i*124,y=156;
    ctx.fillStyle='rgba(245,158,11,0.08)'; ctx.fillRect(x,y,110,70);
    ctx.strokeStyle='rgba(245,158,11,0.3)'; ctx.lineWidth=0.8; ctx.strokeRect(x,y,110,70);
    ctx.font='bold 11px sans-serif'; ctx.fillStyle='#F59E0B'; ctx.fillText(s,x+10,y+26);
    ctx.font='9px monospace'; ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.fillText('0'+(i+1),x+10,y+58);
  });
  ctx.fillStyle='rgba(245,158,11,0.08)'; ctx.fillRect(0,264,512,56);
  ctx.font='10px monospace'; ctx.fillStyle='rgba(245,158,11,0.5)'; ctx.fillText('(402) 451-2960  ·  Omaha, NE  ·  Free Estimate',28,296);
  return new THREE.CanvasTexture(c);
}

function buildPortfolioTexture(proj) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 320;
  const ctx = c.getContext('2d');
  ctx.fillStyle='#020c18'; ctx.fillRect(0,0,512,320);
  const grad=ctx.createLinearGradient(0,0,512,0);
  grad.addColorStop(0,'transparent'); grad.addColorStop(0.5,proj.color); grad.addColorStop(1,'transparent');
  ctx.fillStyle=grad; ctx.fillRect(0,0,512,2);
  ctx.font='10px monospace'; ctx.fillStyle=proj.color; ctx.fillText('// '+proj.tag.toUpperCase(),28,42);
  ctx.font='bold 32px sans-serif'; ctx.fillStyle='#ffffff'; ctx.fillText(proj.title,28,88);
  ctx.font='12px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.55)';
  const words=proj.desc.split(' '); let line='',lineY=126;
  for(const w of words){const test=line+w+' ';if(ctx.measureText(test).width>460&&line){ctx.fillText(line.trim(),28,lineY);line=w+' ';lineY+=18;if(lineY>220)break;}else{line=test;}}
  if(lineY<=220)ctx.fillText(line.trim(),28,lineY);
  proj.tech.forEach((t,i)=>{const px=28+i*115;ctx.strokeStyle=proj.color+'55';ctx.lineWidth=0.8;ctx.strokeRect(px,252,108,24);ctx.font='10px monospace';ctx.fillStyle=proj.color;ctx.fillText(t,px+8,268);});
  return new THREE.CanvasTexture(c);
}

function buildSvcTexture(svc, idx) {
  const c = document.createElement('canvas');
  c.width = 440; c.height = 280;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(1,8,20,0.97)'; ctx.fillRect(0,0,440,280);
  // Top accent
  const tg = ctx.createLinearGradient(0,0,440,0);
  tg.addColorStop(0,'transparent'); tg.addColorStop(0.5,svc.color+'cc'); tg.addColorStop(1,'transparent');
  ctx.fillStyle=tg; ctx.fillRect(0,0,440,2);
  // Bottom accent
  ctx.fillStyle=tg; ctx.fillRect(0,278,440,2);
  // Index
  ctx.font='700 10px monospace'; ctx.fillStyle=svc.color+'88'; ctx.textAlign='left';
  ctx.fillText('0'+(idx+1),24,34);
  // Circle deco top-right
  ctx.beginPath(); ctx.arc(406,36,18,0,Math.PI*2);
  ctx.strokeStyle=svc.color+'50'; ctx.lineWidth=1.2; ctx.stroke();
  ctx.beginPath(); ctx.arc(406,36,11,0,Math.PI*2);
  ctx.strokeStyle=svc.color+'80'; ctx.stroke();
  // Name
  ctx.font='700 30px "Space Grotesk",sans-serif'; ctx.fillStyle='#ffffff';
  ctx.fillText(svc.name,24,88);
  // Subtitle
  ctx.font='11px "Space Mono",monospace'; ctx.fillStyle=svc.color;
  ctx.fillText(svc.sub,24,114);
  // Divider
  ctx.strokeStyle=svc.color+'28'; ctx.lineWidth=0.7;
  ctx.beginPath(); ctx.moveTo(24,132); ctx.lineTo(416,132); ctx.stroke();
  // Features grid (2x2)
  svc.features.forEach((f,i)=>{
    const col=i%2, row=Math.floor(i/2);
    const x=24+col*210, y=162+row*30;
    ctx.fillStyle=svc.color+'aa'; ctx.font='11px monospace'; ctx.fillText('›',x,y);
    ctx.fillStyle='rgba(232,234,240,0.68)'; ctx.font='11px "Space Grotesk",sans-serif';
    ctx.fillText(f,x+16,y);
  });
  // CTA strip
  ctx.fillStyle=svc.color+'14'; ctx.fillRect(0,248,440,32);
  ctx.fillStyle=svc.color+'40'; ctx.fillRect(0,248,440,1);
  ctx.font='10px "Space Mono",monospace'; ctx.fillStyle=svc.color;
  ctx.textAlign='center'; ctx.fillText('→  EXPLORE SERVICE',220,268);
  return new THREE.CanvasTexture(c);
}

function buildPricingTexture(plan) {
  const W = 640, H = 900;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // ── Background: mid-dark navy — avoids extreme contrast that feeds bloom ──
  ctx.fillStyle = '#0f1e38';
  ctx.fillRect(0, 0, W, H);

  // Subtle diagonal inner light — gives depth without brightness
  const innerLight = ctx.createRadialGradient(W * 0.5, H * 0.25, 0, W * 0.5, H * 0.25, W * 0.65);
  innerLight.addColorStop(0, 'rgba(255,255,255,0.03)');
  innerLight.addColorStop(1, 'transparent');
  ctx.fillStyle = innerLight;
  ctx.fillRect(0, 0, W, H);

  // ── Border: soft, single pixel ──
  ctx.strokeStyle = plan.featured ? plan.color + '70' : plan.color + '30';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(2, 2, W-4, H-4);

  // Inner border for depth (featured only)
  if (plan.featured) {
    ctx.strokeStyle = plan.color + '18';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 6, W-12, H-12);
  }

  // ── Top accent bar: 4px, muted — NO glow/shadow ──
  // Convert hex color to muted version by using partial opacity fill
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = plan.color;
  ctx.fillRect(0, 0, W, 4);
  ctx.globalAlpha = 1.0;

  // ── MOST POPULAR badge ──
  let topOffset = 0;
  if (plan.featured) {
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = plan.color;
    ctx.fillRect(W/2 - 92, 4, 184, 28);
    ctx.globalAlpha = 1.0;
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText('MOST POPULAR', W/2, 23);
    topOffset = 28;
  }

  // ── Tier label — color at 60%, no glow ──
  const tierY = 72 + topOffset;
  ctx.globalAlpha = 0.65;
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = plan.color;
  ctx.textAlign = 'center';
  ctx.fillText(plan.tier, W/2, tierY);
  ctx.globalAlpha = 1.0;

  // ── Divider ──
  ctx.strokeStyle = plan.color + '28';
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(90, tierY+16); ctx.lineTo(W-90, tierY+16); ctx.stroke();

  // ── Price: soft blue-white NOT pure white — lower luminance = less bloom ──
  const priceSize = plan.price === 'Custom' ? 70 : 86;
  const priceY = tierY + 118;
  ctx.font = `bold ${priceSize}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#bfccec';   // soft blue-grey-white — NOT pure #fff
  ctx.textAlign = 'center';
  ctx.fillText(plan.price, W/2, priceY);

  // ── Period ──
  ctx.font = '14px monospace';
  ctx.fillStyle = 'rgba(190,210,240,0.9)';
  ctx.fillText(plan.period, W/2, priceY + 30);

  // ── Divider under price ──
  ctx.strokeStyle = plan.color + '22';
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(90, priceY+54); ctx.lineTo(W-90, priceY+54); ctx.stroke();

  // ── Features: bright, readable ──
  ctx.textAlign = 'left';
  const featStart = priceY + 86;
  const featGap = 72;
  plan.features.forEach((f, i) => {
    const fy = featStart + i * featGap;
    // Check mark
    ctx.globalAlpha = 0.95;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = plan.color;
    ctx.fillText('✓', 96, fy);
    ctx.globalAlpha = 1.0;
    // Feature text — bright and legible
    ctx.font = '17px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(225,235,255,1.0)';
    ctx.fillText(f, 136, fy);
    // Separator
    if (i < plan.features.length - 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(88, fy+28); ctx.lineTo(W-88, fy+28); ctx.stroke();
    }
  });

  // ── BOOK NOW: muted fill, readable — avoids bloom ──
  const btnY = H - 104;
  const btnX = 80, btnW = W - 160, btnH = 58;
  if (plan.featured) {
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = plan.color;
    ctx.fillRect(btnX, btnY, btnW, btnH);
    ctx.globalAlpha = 1.0;
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText('BOOK NOW  →', W/2, btnY + 37);
  } else {
    ctx.fillStyle = plan.color + '15';
    ctx.fillRect(btnX, btnY, btnW, btnH);
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = plan.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(btnX, btnY, btnW, btnH);
    ctx.globalAlpha = 1.0;
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = 'rgba(180,200,235,0.92)';
    ctx.textAlign = 'center';
    ctx.fillText('BOOK NOW  →', W/2, btnY + 37);
  }

  return new THREE.CanvasTexture(c);
}

function buildWindowTexture(colorHex) {
  const hex = colorHex.replace('#','');
  const r = parseInt(hex.slice(0,2),16);
  const g = parseInt(hex.slice(2,4),16);
  const b = parseInt(hex.slice(4,6),16);
  const W=256, H=512;
  const c = document.createElement('canvas');
  c.width=W; c.height=H;
  const ctx = c.getContext('2d');
  ctx.fillStyle='#010810'; ctx.fillRect(0,0,W,H);
  // Structural column dividers
  for(let col=0;col<=5;col++){
    ctx.fillStyle=`rgba(${r*0.4|0},${g*0.4|0},${b*0.4|0},0.18)`;
    ctx.fillRect(col*(W/5),0,1,H);
  }
  // Window grid — randomly lit offices
  const cols=5,rows=18,gapX=W/cols,gapY=H/rows;
  const winW=gapX*0.72,winH=gapY*0.64;
  for(let row=0;row<rows;row++){
    for(let col=0;col<cols;col++){
      if(Math.random()<0.28)continue;
      const warmth=Math.random();
      const alpha=0.30+Math.random()*0.48;
      const rC=Math.min(255,r+(warmth>0.6?55:0));
      const gC=Math.min(255,g+(warmth>0.7?35:0));
      const bC=Math.min(255,b+(warmth>0.8?15:0));
      ctx.fillStyle=`rgba(${rC},${gC},${bC},${alpha})`;
      ctx.fillRect(col*gapX+(gapX-winW)/2,row*gapY+(gapY-winH)/2,winW,winH);
    }
  }
  // Floor dividers every 6 rows
  for(let row=0;row<=rows;row+=6){
    ctx.fillStyle=`rgba(${r},${g},${b},0.24)`;
    ctx.fillRect(0,row*gapY-0.6,W,1.2);
  }
  return new THREE.CanvasTexture(c);
}

function buildWorkVisualTexture(proj) {
  const hex=proj.color.replace('#','');
  const r=parseInt(hex.slice(0,2),16);
  const g=parseInt(hex.slice(2,4),16);
  const b=parseInt(hex.slice(4,6),16);
  const c=document.createElement('canvas');
  c.width=512; c.height=308;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#020c18'; ctx.fillRect(0,0,512,308);
  // Color accent bars
  const tg=ctx.createLinearGradient(0,0,512,0);
  tg.addColorStop(0,'transparent');
  tg.addColorStop(0.5,`rgba(${r},${g},${b},0.85)`);
  tg.addColorStop(1,'transparent');
  ctx.fillStyle=tg; ctx.fillRect(0,0,512,2); ctx.fillRect(0,306,512,2);
  // Browser chrome bar
  ctx.fillStyle='rgba(255,255,255,0.04)'; ctx.fillRect(0,0,512,26);
  [{c:'rgba(255,80,80,0.45)'},{c:'rgba(255,200,0,0.45)'},{c:'rgba(0,210,80,0.45)'}].forEach((d,i)=>{
    ctx.beginPath();ctx.arc(13+i*16,13,4,0,Math.PI*2);ctx.fillStyle=d.c;ctx.fill();
  });
  // Hero content block
  ctx.fillStyle=`rgba(${r},${g},${b},0.07)`; ctx.fillRect(12,34,488,82);
  ctx.fillStyle=`rgba(${r},${g},${b},0.20)`; ctx.fillRect(12,34,488,2);
  for(let i=0;i<3;i++){
    ctx.fillStyle=`rgba(255,255,255,${0.06+i*0.015})`;
    ctx.fillRect(26,44+i*18,100+Math.random()*180,8);
  }
  // 3-column card grid
  for(let col=0;col<3;col++){
    const cx=12+col*166;
    ctx.fillStyle=`rgba(${r},${g},${b},0.05)`; ctx.fillRect(cx,130,152,92);
    ctx.strokeStyle=`rgba(${r},${g},${b},0.20)`; ctx.lineWidth=0.8; ctx.strokeRect(cx,130,152,92);
    ctx.fillStyle='rgba(255,255,255,0.04)'; ctx.fillRect(cx+8,138,136,42);
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(cx+8,186,60+Math.random()*50,6);
  }
  // Play button
  ctx.strokeStyle=`rgba(${r},${g},${b},0.65)`; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(256,136,20,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle=`rgba(${r},${g},${b},0.35)`;
  ctx.beginPath(); ctx.moveTo(248,128); ctx.lineTo(266,136); ctx.lineTo(248,144); ctx.closePath(); ctx.fill();
  // Tag line
  ctx.font='9px monospace'; ctx.fillStyle=`rgba(${r},${g},${b},0.45)`;
  ctx.textAlign='center'; ctx.fillText('// '+proj.tag.toUpperCase(),256,288);
  return new THREE.CanvasTexture(c);
}

// ═══════════════════════════════════════════════════════════════
function setupScene() {
// ═══════════════════════════════════════════════════════════════

// ── RENDERER ─────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const W = () => window.innerWidth;
const H = () => window.innerHeight;

const renderer = new THREE.WebGLRenderer({
  canvas, antialias: true, alpha: false, powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
renderer.setSize(W(), H());
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ── SCENE ─────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000000, 0.008);

// ── CAMERA ────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(60, W() / H(), 0.1, 220);
camera.position.set(0, 0, 22);


// ── SCROLL SYSTEM ─────────────────────────────────────────────────
const aiWorld      = new AIWorld(scene, camera, { hover: hoverSound });
aiWorld.group.position.set(0, -40, 0); // align with AI_WORLD zone


const logo    = new Logo(scene);

const drones  = new Drones(scene);
const audio   = new AudioSystem();
// ScrollSystem disabled — Lenis + 8-section system drives camera
// const scroll = new ScrollSystem(camera, dna, aiWorld, logo, pricingWorld);

// ── SCROLL + SECTIONS ─────────────────────────────────────────────
let scrollProgress = 0, targetScroll = 0, currentSection = 0;

const SECTIONS = [
  { start: 0.00, end: 0.12 },  // 0: GENESIS     — DNA emergence
  { start: 0.12, end: 0.26 },  // 1: AWAKEN      — discovery / inner reveal
  { start: 0.26, end: 0.44 },  // 2: INTERFACE   — services carousel
  { start: 0.44, end: 0.54 },  // 3: CONVERGE    — service deep-dive
  { start: 0.54, end: 0.66 },  // 4: PORTAL      — fly through to AI world
  { start: 0.66, end: 0.78 },  // 5: ARCHITECT   — AI world environment
  { start: 0.78, end: 0.89 },  // 6: PORTFOLIO   — portfolio showcase
  { start: 0.89, end: 1.00 }   // 7: ELEVATION   — pricing world
];
const PHASES   = ['01 / GENESIS','02 / AWAKEN','03 / INTERFACE','04 / CONVERGE','05 / PORTAL','06 / ARCHITECT','07 / PORTFOLIO','08 / ELEVATION'];
const STATUSES = ['INITIALIZING','SCANNING','INTERFACE ACTIVE','PROCESSING','TRAVELLING','BUILDING','SHOWCASING','PRESENTING'];

function sP(i) {
  const s = SECTIONS[i];
  return Math.max(0, Math.min(1, (scrollProgress - s.start) / (s.end - s.start)));
}
function ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

// ── LENIS ─────────────────────────────────────────────────────────
let lenis;
try {
  lenis = new Lenis({ duration: 0.7, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on('scroll', ({ progress }) => { targetScroll = progress; });
  // lenis.raf is called inside animate() — no separate RAF loop needed
} catch(e) {
  window.addEventListener('scroll', () => {
    targetScroll = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  });
}
gsap.registerPlugin(ScrollTrigger);

// ── NAV LINKS ─────────────────────────────────────────────────────
document.querySelectorAll('#nav-links a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const idx = parseInt(a.dataset.scene ?? '0');
    if (idx < 0) {
      if (lenis) lenis.scrollTo(0, { duration: 2.4 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const sec = SECTIONS[Math.min(idx, SECTIONS.length - 1)];
    const mid = (sec.start + sec.end) / 2;
    const maxSc = document.documentElement.scrollHeight - window.innerHeight;
    if (lenis) lenis.scrollTo(mid * maxSc, { duration: 2.4 });
    else window.scrollTo({ top: mid * maxSc, behavior: 'smooth' });
  });
});

// ── LIGHTS ────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x04080f, 0.9));

const ptCyan   = new THREE.PointLight(0x00b4d8, 3.5, 35); ptCyan.position.set(3, 2, 7);    scene.add(ptCyan);
const ptBio    = new THREE.PointLight(0xfff3e0, 2.0, 30); ptBio.position.set(-3, 1, 7);     scene.add(ptBio);
const ptPurple = new THREE.PointLight(0x7b2fff, 1.5, 25); ptPurple.position.set(0, -4, 5);  scene.add(ptPurple);
const rim      = new THREE.DirectionalLight(0x0044aa, 0.6); rim.position.set(0, 8, -12);     scene.add(rim);

// Services lights (world z ≈ -10)
const svcLight1 = new THREE.PointLight(0x0099ff, 0, 28); svcLight1.position.set(0, -16, 4);  scene.add(svcLight1);
const svcLight2 = new THREE.PointLight(0x7b2fff, 0, 22); svcLight2.position.set(-5,-23, 2); scene.add(svcLight2);

// AI World lights (world z ≈ -28)
const aiLight1 = new THREE.PointLight(0x0055ff, 0, 38); aiLight1.position.set(0,  -33, 4); scene.add(aiLight1);
const aiLight2 = new THREE.PointLight(0x7b2fff, 0, 30); aiLight2.position.set(-10,-41, 2); scene.add(aiLight2);
const aiLight3 = new THREE.PointLight(0x00ccaa, 0, 24); aiLight3.position.set(8,  -46, 2); scene.add(aiLight3);

// Pricing lights (now at y=0 zone)
const priceLight = new THREE.PointLight(0x00c8ff, 0, 35); priceLight.position.set(0, 4, 4); scene.add(priceLight);

// ── STAR FIELD ────────────────────────────────────────────────────
(function buildStars() {
  const count = 2800;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 60 + Math.random() * 80;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = r * Math.cos(phi);
    const t = Math.random();
    if (t < 0.25)      { col[i*3]=0;    col[i*3+1]=0.71; col[i*3+2]=0.85; }
    else if (t < 0.45) { col[i*3]=0.48; col[i*3+1]=0.19; col[i*3+2]=1.0;  }
    else               { col[i*3]=0.92; col[i*3+1]=0.93; col[i*3+2]=1.0;  }
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.5, sizeAttenuation: true });
  scene.add(new THREE.Points(geo, mat));
})();

// ── SHARED UNIFORMS ───────────────────────────────────────────────
const UNI = { uTime: { value: 0 }, uMerge: { value: 0 } };
// Pre-allocated fog color target — reused every frame (avoids GC pressure)
const _fogTgt = new THREE.Color(0x000000);





// ── LOGO ──────────────────────────────────────────────────────────
const LOGO_GROUP = new THREE.Group();
scene.add(LOGO_GROUP);
LOGO_GROUP.position.set(0, -56.5, 4);
LOGO_GROUP.scale.setScalar(0.001);

const X_VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const X_FRAG = `
  uniform float uTime; uniform float uPurple;
  varying vec2 vUv;
  void main(){
    float fc = abs(vUv.y-0.5)*2.0; float aw = abs(vUv.x-0.5)*2.0;
    float shimmer = pow(sin(vUv.y*6.28-uTime*1.4)*.5+.5,6.0)*.35;
    vec3 ct=mix(vec3(0.04,0.28,0.72),vec3(0.22,0.06,0.70),uPurple);
    vec3 cc=mix(vec3(0.55,0.88,1.0),vec3(0.72,0.55,1.0),uPurple);
    vec3 col=mix(cc,ct,fc*.85); col=mix(col,vec3(1.0),(1.0-fc)*(1.0-fc)*.55);
    col=mix(col,vec3(0.8,0.95,1.0),step(0.82,aw)*.5);
    col+=mix(vec3(.4,.8,1.),vec3(.7,.5,1.),uPurple)*shimmer;
    float alpha=(1.0-fc*.45)*(.6+(1.0-aw)*.4);
    gl_FragColor=vec4(col,alpha);
  }
`;
const xMat1 = new THREE.ShaderMaterial({ vertexShader:X_VERT, fragmentShader:X_FRAG, uniforms:{ uTime:UNI.uTime, uPurple:{value:0.0} }, transparent:true, side:THREE.DoubleSide, depthWrite:false });
const xMat2 = new THREE.ShaderMaterial({ vertexShader:X_VERT, fragmentShader:X_FRAG, uniforms:{ uTime:UNI.uTime, uPurple:{value:1.0} }, transparent:true, side:THREE.DoubleSide, depthWrite:false });
const xBar1 = new THREE.Mesh(new THREE.PlaneGeometry(0.28,2.0,1,40), xMat1);
xBar1.rotation.z = Math.PI/4; LOGO_GROUP.add(xBar1);
const xBar2 = new THREE.Mesh(new THREE.PlaneGeometry(0.28,2.0,1,40), xMat2);
xBar2.rotation.z = -Math.PI/4; LOGO_GROUP.add(xBar2);

// Center glow
const glowCanvas = document.createElement('canvas');
glowCanvas.width = 256; glowCanvas.height = 256;
const gctx = glowCanvas.getContext('2d');
const gRad = gctx.createRadialGradient(128,128,0,128,128,128);
gRad.addColorStop(0.00,'rgba(255,255,255,1.0)'); gRad.addColorStop(0.08,'rgba(220,240,255,0.95)');
gRad.addColorStop(0.22,'rgba(100,190,255,0.7)'); gRad.addColorStop(0.45,'rgba(80,80,255,0.35)');
gRad.addColorStop(0.70,'rgba(60,0,180,0.12)');   gRad.addColorStop(1.00,'rgba(0,0,0,0)');
gctx.fillStyle=gRad; gctx.fillRect(0,0,256,256);
gctx.strokeStyle='rgba(255,255,255,0.25)';
for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;gctx.beginPath();gctx.moveTo(128,128);gctx.lineTo(128+Math.cos(a)*128,128+Math.sin(a)*128);gctx.lineWidth=1;gctx.stroke();}
const glowTex = new THREE.CanvasTexture(glowCanvas);
const glowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(1.4,1.4),
  new THREE.MeshBasicMaterial({ map:glowTex, transparent:true, opacity:1.0, depthWrite:false, blending:THREE.AdditiveBlending })
);
LOGO_GROUP.add(glowPlane);
LOGO_GROUP.add(new THREE.Mesh(new THREE.SphereGeometry(0.04,8,8), new THREE.MeshBasicMaterial({ color:0xffffff })));
const logoLight = new THREE.PointLight(0xffffff, 8.0, 6); logoLight.position.set(0,0,0.3); LOGO_GROUP.add(logoLight);
const haloLight = new THREE.PointLight(0x3399ff, 2.5,10); haloLight.position.set(0,0,0.5); LOGO_GROUP.add(haloLight);
// Wordmark
const textCanvas = document.createElement('canvas');
textCanvas.width=640; textCanvas.height=80;
const tctx = textCanvas.getContext('2d');
tctx.shadowColor='rgba(0,180,255,0.8)'; tctx.shadowBlur=18;
tctx.font='700 40px "Space Grotesk",sans-serif'; tctx.fillStyle='rgba(255,255,255,0.95)';
tctx.textAlign='center'; tctx.letterSpacing='12px'; tctx.fillText('HUMYNEX',320,52);
tctx.shadowBlur=0; tctx.fillStyle='rgba(255,255,255,0.92)'; tctx.fillText('HUMYNEX',320,52);
const textPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(2.8,0.38),
  new THREE.MeshBasicMaterial({ map:new THREE.CanvasTexture(textCanvas), transparent:true, opacity:0.92, depthWrite:false })
);
textPlane.position.set(0,-1.28,0); LOGO_GROUP.add(textPlane);

// Logo particles
const LP_N = 380;
const lpGeo = new THREE.BufferGeometry();
const lpCur = new Float32Array(LP_N*3), lpTgt = new Float32Array(LP_N*3);
const lpClr = new Float32Array(LP_N*3), lpPhs = new Float32Array(LP_N);
for (let i=0;i<LP_N;i++) {
  lpCur[i*3]=(Math.random()-.5)*2; lpCur[i*3+1]=(Math.random()-.5)*2; lpCur[i*3+2]=(Math.random()-.5)*1;
  lpTgt[i*3]=(Math.random()-.5)*7; lpTgt[i*3+1]=(Math.random()-.5)*14; lpTgt[i*3+2]=(Math.random()-.5)*3;
  const bc=Math.random()>.5; lpClr[i*3]=bc?0:0.48; lpClr[i*3+1]=bc?0.71:0.19; lpClr[i*3+2]=bc?0.88:1.0;
  lpPhs[i]=Math.random()*Math.PI*2;
}
lpGeo.setAttribute('position', new THREE.BufferAttribute(lpCur.slice(), 3));
lpGeo.setAttribute('color', new THREE.BufferAttribute(lpClr, 3));
const lpMat = new THREE.PointsMaterial({ size:0.07, vertexColors:true, transparent:true, opacity:0, sizeAttenuation:true });
const logoParticles = new THREE.Points(lpGeo, lpMat);
LOGO_GROUP.add(logoParticles);
let logoParticleAmt = 0;

// ═══════════════════════════════════════════════════════════════
// SCENE 2 — SERVICES INTERFACE (world z = -10)
// ═══════════════════════════════════════════════════════════════
const SVC_WORLD = new THREE.Group();
SVC_WORLD.position.set(0, -20, 0);
SVC_WORLD.visible = false;
scene.add(SVC_WORLD);

// Ambient glow sphere
SVC_WORLD.add(new THREE.Mesh(
  new THREE.SphereGeometry(20, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0x001230, transparent: true, opacity: 0.07, side: THREE.BackSide })
));

// Floating micro-particles in services zone
const svcParticleGeo = new THREE.BufferGeometry();
const svcPtPos = new Float32Array(300 * 3);
for (let i=0;i<300;i++) {
  svcPtPos[i*3]=(Math.random()-.5)*24; svcPtPos[i*3+1]=(Math.random()-.5)*12; svcPtPos[i*3+2]=(Math.random()-.5)*12;
}
svcParticleGeo.setAttribute('position', new THREE.BufferAttribute(svcPtPos,3));
const svcParticles = new THREE.Points(svcParticleGeo, new THREE.PointsMaterial({ size:0.04, color:0x0088cc, transparent:true, opacity:0.5, sizeAttenuation:true }));
SVC_WORLD.add(svcParticles);

let svcCurrentAngle = 0;
const svcPanels = [];
const svcGlassMats = [], svcContentMats = [], svcEdgeMats = [], svcGlowLights = [];

SERVICES.forEach((svc, idx) => {
  const pg = new THREE.Group();
  // Glass bg
  const gm = new THREE.MeshStandardMaterial({ color:0x001830, emissive:new THREE.Color(svc.color).multiplyScalar(0.06), emissiveIntensity:1, transparent:true, opacity:0, roughness:0.0, metalness:0.05, side:THREE.DoubleSide });
  svcGlassMats.push(gm);
  pg.add(new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.65), gm));
  // Content
  const cm = new THREE.MeshBasicMaterial({ map:buildSvcTexture(svc,idx), transparent:true, opacity:0, depthWrite:false });
  svcContentMats.push(cm);
  const cMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.65), cm);
  cMesh.position.z = 0.01; pg.add(cMesh);
  // Edge
  const em = new THREE.LineBasicMaterial({ color:new THREE.Color(svc.color), transparent:true, opacity:0 });
  svcEdgeMats.push(em);
  pg.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.6,1.65)), em));
  // Glow light
  const gl = new THREE.PointLight(new THREE.Color(svc.color), 0, 6);
  gl.position.z = 0.4; pg.add(gl); svcGlowLights.push(gl);

  pg.userData = { svc, idx };
  SVC_WORLD.add(pg);
  svcPanels.push(pg);
});
// Cache once — avoids allocating a new array every frame
const svcHitMeshes = svcPanels.map(pg => pg.children[1]);

// ═══════════════════════════════════════════════════════════════
// SCENE 3 — AI WORLD (group center world z = -28)
// ═══════════════════════════════════════════════════════════════
const AI_WORLD = new THREE.Group();
AI_WORLD.position.set(0, -40, 0);
AI_WORLD.visible = false;
scene.add(AI_WORLD);

// Grid floor
const aiGrid = new THREE.GridHelper(52, 44, 0x002244, 0x001122);
aiGrid.material.transparent = true;
aiGrid.material.opacity = 0;
aiGrid.position.y = -5;
AI_WORLD.add(aiGrid);

// ── 3D DATA WAVE GRID ────────────────────────────────────────────
// Custom LineSegments grid (horizontal + vertical only, no diagonals)
// Wave phase is synced with t so it feels locked to the holo-ring spin.
const WV_SX = 38, WV_SZ = 38, WV_SIZE = 56;
const WV_OX = -WV_SIZE / 2, WV_OZ = -WV_SIZE / 2;
const WV_DX = WV_SIZE / WV_SX, WV_DZ = WV_SIZE / WV_SZ;

// Build initial flat vertex array — (SZ+1)*SX lines along X + (SX+1)*SZ lines along Z
const _wvFlatVerts = [];
for (let z = 0; z <= WV_SZ; z++) {
  for (let x = 0; x < WV_SX; x++) {
    _wvFlatVerts.push(WV_OX + x*WV_DX, 0, WV_OZ + z*WV_DZ,
                      WV_OX + (x+1)*WV_DX, 0, WV_OZ + z*WV_DZ);
  }
}
for (let x = 0; x <= WV_SX; x++) {
  for (let z = 0; z < WV_SZ; z++) {
    _wvFlatVerts.push(WV_OX + x*WV_DX, 0, WV_OZ + z*WV_DZ,
                      WV_OX + x*WV_DX, 0, WV_OZ + (z+1)*WV_DZ);
  }
}
const waveGridGeo = new THREE.BufferGeometry();
waveGridGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(_wvFlatVerts), 3));
const waveGridMat = new THREE.LineBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0 });
const waveGridMesh = new THREE.LineSegments(waveGridGeo, waveGridMat);
waveGridMesh.position.y = -2.2;
waveGridMesh.frustumCulled = false;
SVC_WORLD.add(waveGridMesh);

// Accent lines mesh — every 6th line in each direction, brighter cyan
const _wvAccVerts = [];
for (let z = 0; z <= WV_SZ; z += 6) {
  for (let x = 0; x < WV_SX; x++) {
    _wvAccVerts.push(WV_OX + x*WV_DX, 0, WV_OZ + z*WV_DZ,
                     WV_OX + (x+1)*WV_DX, 0, WV_OZ + z*WV_DZ);
  }
}
for (let x = 0; x <= WV_SX; x += 6) {
  for (let z = 0; z < WV_SZ; z++) {
    _wvAccVerts.push(WV_OX + x*WV_DX, 0, WV_OZ + z*WV_DZ,
                     WV_OX + x*WV_DX, 0, WV_OZ + (z+1)*WV_DZ);
  }
}
const waveAccGeo = new THREE.BufferGeometry();
waveAccGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(_wvAccVerts), 3));
const waveAccMat = new THREE.LineBasicMaterial({ color: 0x00eeff, transparent: true, opacity: 0 });
const waveAccMesh = new THREE.LineSegments(waveAccGeo, waveAccMat);
waveAccMesh.position.y = -2.2;
waveAccMesh.frustumCulled = false;
SVC_WORLD.add(waveAccMesh);

function _waveY(wx, wz, phase) {
  return (
    Math.sin(wx * 0.21 + wz * 0.17 + phase)        * 1.80 +
    Math.sin(wx * 0.11 - wz * 0.13 - phase * 0.62) * 1.00 +
    Math.sin(wx * 0.34 + wz * 0.29 + phase * 1.35) * 0.50
  );
}

function updateWaveGrid(geo, phase) {
  const pos = geo.attributes.position;
  let i = 0;
  // X-direction lines
  for (let z = 0; z <= WV_SZ; z++) {
    const wz = WV_OZ + z * WV_DZ;
    for (let x = 0; x < WV_SX; x++) {
      pos.setY(i,   _waveY(WV_OX + x * WV_DX,       wz, phase)); i++;
      pos.setY(i,   _waveY(WV_OX + (x+1) * WV_DX,   wz, phase)); i++;
    }
  }
  // Z-direction lines
  for (let x = 0; x <= WV_SX; x++) {
    const wx = WV_OX + x * WV_DX;
    for (let z = 0; z < WV_SZ; z++) {
      pos.setY(i,   _waveY(wx, WV_OZ + z * WV_DZ,       phase)); i++;
      pos.setY(i,   _waveY(wx, WV_OZ + (z+1) * WV_DZ,   phase)); i++;
    }
  }
  pos.needsUpdate = true;
}

function updateWaveAccGrid(geo, phase) {
  const pos = geo.attributes.position;
  let i = 0;
  for (let z = 0; z <= WV_SZ; z += 6) {
    const wz = WV_OZ + z * WV_DZ;
    for (let x = 0; x < WV_SX; x++) {
      pos.setY(i,   _waveY(WV_OX + x * WV_DX,       wz, phase)); i++;
      pos.setY(i,   _waveY(WV_OX + (x+1) * WV_DX,   wz, phase)); i++;
    }
  }
  for (let x = 0; x <= WV_SX; x += 6) {
    const wx = WV_OX + x * WV_DX;
    for (let z = 0; z < WV_SZ; z++) {
      pos.setY(i,   _waveY(wx, WV_OZ + z * WV_DZ,       phase)); i++;
      pos.setY(i,   _waveY(wx, WV_OZ + (z+1) * WV_DZ,   phase)); i++;
    }
  }
  pos.needsUpdate = true;
}
// ── end wave grid setup ───────────────────────────────────────────

// Floating platforms
// Arc layout — 4 project stages at same height, gentle depth arc, fully visible
const platformData = [
  [-9.0, 0, -1.5, 5.2, 0.16, 3.0],  // TLD Contracting — far left
  [-3.0, 0, -3.0, 5.2, 0.16, 3.0],  // WebFlow Pro — left
  [ 3.0, 0, -3.0, 5.2, 0.16, 3.0],  // AutoAgent — right
  [ 9.0, 0, -1.5, 5.2, 0.16, 3.0],  // AppForge — far right
  [ 0.0, 5, -14,  3.0, 0.10, 1.5],  // accent platform (background)
];
const platforms = platformData.map(([px,py,pz,w,h,d], i) => {
  // Each platform glows in its project's brand color
  const pColor = new THREE.Color(i < PROJECTS.length ? PROJECTS[i].color : '#00b4d8');
  const geo = new THREE.BoxGeometry(w,h,d);
  const mat = new THREE.MeshStandardMaterial({
    color: pColor.clone().multiplyScalar(0.55),
    emissive: pColor, emissiveIntensity: 1.8,
    roughness: 0.15, metalness: 1, transparent: true, opacity: 0
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(px,py,pz);
  const edgeMat = new THREE.LineBasicMaterial({ color: pColor, transparent: true, opacity: 0 });
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat));
  AI_WORLD.add(mesh);
  return { mesh, mat, edgeMat, baseY: py, pColor };
});

// Sonar pulse rings — 3 rings per platform, expand outward and fade
const pulseRings = [];
PROJECTS.forEach((proj, i) => {
  if (i >= 4) return;
  const pd = platformData[i];
  const color = new THREE.Color(proj.color);
  for (let ri = 0; ri < 3; ri++) {
    const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.1, 32), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(pd[0], pd[1] - 0.09, pd[2]);
    AI_WORLD.add(ring);
    pulseRings.push({ ring, ringMat, phase: ri / 3 });
  }
});

// Ground reflection discs — soft color halos on the floor beneath each platform
const groundDiscs = [];
PROJECTS.forEach((proj, i) => {
  if (i >= 4) return;
  const pd = platformData[i];
  const discMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(proj.color), transparent: true, opacity: 0, side: THREE.DoubleSide });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(pd[3] * 0.26, 32), discMat);
  disc.rotation.x = -Math.PI / 2;
  disc.position.set(pd[0], -5.0, pd[2]);
  AI_WORLD.add(disc);
  groundDiscs.push({ discMat });
});

// ── PLATFORM DISPLAY PANELS — one work card per floating platform ──
const platformPanels = [];
PROJECTS.forEach((proj, i) => {
  if (i >= platforms.length) return;
  const pd = platformData[i];
  const panW = pd[3] * 0.92;
  const panH = panW * 0.60;
  const tex = proj.isTLD ? buildTLDTexture() : buildWorkVisualTexture(proj);
  const panMat = new THREE.MeshBasicMaterial({ map:tex, transparent:true, opacity:0, side:THREE.DoubleSide, depthWrite:false });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(panW, panH), panMat);
  panel.rotation.x = -0.14;
  const edgeMat2 = new THREE.LineBasicMaterial({ color: new THREE.Color(proj.color), transparent:true, opacity:0 });
  panel.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(panW, panH)), edgeMat2));
  panel.userData._hov = false;
  AI_WORLD.add(panel);

  // Downward spotlight beam cone beneath the platform
  const beamGeo = new THREE.ConeGeometry(pd[3] * 0.40, 7.0, 10, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(proj.color), transparent: true, opacity: 0, side: THREE.BackSide
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.set(pd[0], pd[1] - 3.5, pd[2]);
  AI_WORLD.add(beam);

  // Floor glow point light
  const floorLight = new THREE.PointLight(new THREE.Color(proj.color), 0, 4);
  floorLight.position.set(pd[0], pd[1] - 0.2, pd[2]);
  AI_WORLD.add(floorLight);

  platformPanels.push({ panel, panMat, edgeMat: edgeMat2, proj, platIdx: i, beamMat, floorLight });
});

// Data streams (vertical particle columns)
const dataStreams = [];
[[-9,-5],[9,-3],[-5,5],[5,7],[0,10],[-12,2],[12,-1]].forEach(([sx,sz]) => {
  const N = 80;
  const pos = new Float32Array(N*3), vel = new Float32Array(N);
  for(let i=0;i<N;i++){
    pos[i*3]=sx+(Math.random()-.5)*.35; pos[i*3+1]=-5+Math.random()*15; pos[i*3+2]=sz+(Math.random()-.5)*.35;
    vel[i]=0.025+Math.random()*.04;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos.slice(),3));
  const mat = new THREE.PointsMaterial({ size:0.045, color:0x00c8ff, transparent:true, opacity:0.65, sizeAttenuation:true });
  const pts = new THREE.Points(geo, mat);
  AI_WORLD.add(pts);
  dataStreams.push({ pts, pos, vel, geo });
});

// Holographic rings
const holoRings = [
  { r:5.5, color:0x0088ff, y:-1.5, speed: 0.003 },
  { r:9.0, color:0x7b2fff, y:-3.5, speed:-0.002 }
].map(({r,color,y,speed}) => {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(r,0.018,8,80), new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.22}));
  mesh.rotation.x = Math.PI*.5; mesh.position.y = y; mesh.userData.speed = speed;
  AI_WORLD.add(mesh);
  return mesh;
});


// ── CITY PORTFOLIO — Cyberpunk building environment ────────────────
const PANEL_GROUP = new THREE.Group();
PANEL_GROUP.visible = false;
AI_WORLD.add(PANEL_GROUP);
const panelMeshes = [];

// City base — wide ground plane
const cityGround = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({ color:0x000a14, emissive:0x000510, emissiveIntensity:1, metalness:1, roughness:0.9, transparent:true, opacity:0 })
);
cityGround.rotation.x = -Math.PI/2;
cityGround.position.y = -7;
PANEL_GROUP.add(cityGround);

// City floor grid
const cityGrid = new THREE.GridHelper(50, 40, 0x001a2e, 0x000d1a);
cityGrid.material.transparent = true; cityGrid.material.opacity = 0;
cityGrid.position.y = -7;
PANEL_GROUP.add(cityGrid);

// ── CITY SKYLINE — Massive techno megastructures filling all walls ────────
const SKYLINE_GROUP = new THREE.Group();
AI_WORLD.add(SKYLINE_GROUP);
const skylineMats = [];

// [x, z, width, height, depth, colorHex]
const SKYLINE_DATA = [
  // LEFT WALL
  [-14, -4,  4.5, 32, 2.0, 0x00b4d8], [-20, -10, 5.0, 44, 2.5, 0x7b2fff],
  [-17,  4,  3.5, 26, 1.8, 0x00d4aa], [-24, -16, 4.2, 20, 2.0, 0x00b4d8],
  [-12, -16, 3.0, 19, 1.5, 0x7b2fff], [-22,  2,  3.2, 38, 2.0, 0x00d4aa],
  [-11,  8,  2.5, 14, 1.4, 0x00b4d8], [-19, -22, 5.5, 28, 2.5, 0x7b2fff],
  [-16, -28, 3.0, 16, 1.6, 0x00d4aa], [-26, -6,  4.0, 50, 2.8, 0x00b4d8],
  // RIGHT WALL
  [ 14, -4,  4.5, 36, 2.0, 0x7b2fff], [ 20, -10, 5.0, 46, 2.5, 0x00b4d8],
  [ 17,  4,  3.5, 23, 1.8, 0x00d4aa], [ 24, -16, 4.2, 22, 2.0, 0x7b2fff],
  [ 12, -16, 3.0, 28, 1.5, 0x00b4d8], [ 22,  2,  3.2, 40, 2.0, 0x00d4aa],
  [ 11,  8,  2.5, 16, 1.4, 0x7b2fff], [ 19, -22, 5.5, 30, 2.5, 0x00b4d8],
  [ 16, -28, 3.0, 18, 1.6, 0x00d4aa], [ 26, -6,  4.0, 52, 2.8, 0x7b2fff],
  // BACK WALL — towering centerpiece
  [  0, -28, 9.0, 58, 3.8, 0x00b4d8], [ -8, -24, 5.2, 40, 2.6, 0x7b2fff],
  [  8, -24, 5.2, 44, 2.6, 0x00d4aa], [ -4, -32, 4.2, 30, 2.0, 0x00b4d8],
  [  4, -30, 4.2, 34, 2.0, 0x7b2fff], [-14, -26, 3.8, 24, 2.0, 0x00d4aa],
  [ 14, -26, 3.8, 26, 2.0, 0x00b4d8], [ -2, -36, 3.5, 20, 1.8, 0x7b2fff],
  [  2, -34, 3.5, 22, 1.8, 0x00d4aa],
];

SKYLINE_DATA.forEach(([bx, bz, w, h, d, colorHex], bi) => {
  const baseY = -7;
  const phase = bi * 0.44 + (bi % 3) * 1.1;
  const hexStr = '#' + colorHex.toString(16).padStart(6,'0');
  const winTex = buildWindowTexture(hexStr);

  // 3-tier setback structure — real skyscraper profile
  const TIERS = [
    { yFrac:0.00, hFrac:0.52, wMul:1.00 },
    { yFrac:0.52, hFrac:0.30, wMul:0.80 },
    { yFrac:0.82, hFrac:0.18, wMul:0.58 },
  ];
  TIERS.forEach(({ yFrac, hFrac, wMul }, ti) => {
    const th=h*hFrac, tw=w*wMul, td=d*wMul;
    const cy=baseY+h*yFrac+th/2;
    // Window-textured body
    const bodyMat = new THREE.MeshStandardMaterial({
      map: winTex, color:0x010812,
      emissive: new THREE.Color(colorHex), emissiveIntensity:0.05+ti*0.02,
      metalness:0.88, roughness:0.22, transparent:true, opacity:0
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(tw,th,td), bodyMat);
    body.position.set(bx,cy,bz);
    SKYLINE_GROUP.add(body);
    skylineMats.push({ mat:bodyMat, type:'body', phase });
    // Neon edge outline
    const edgeMat = new THREE.LineBasicMaterial({ color:colorHex, transparent:true, opacity:0 });
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(tw,th,td)), edgeMat);
    edges.position.set(bx,cy,bz);
    SKYLINE_GROUP.add(edges);
    skylineMats.push({ mat:edgeMat, type:'edge', phase:phase+ti*0.4 });
    // LED ledge strip at tier-top setback
    const ledgeMat = new THREE.MeshBasicMaterial({ color:colorHex, transparent:true, opacity:0 });
    const ledge = new THREE.Mesh(new THREE.PlaneGeometry(tw+0.3,0.07), ledgeMat);
    ledge.position.set(bx, cy+th/2+0.04, bz+td/2+0.02);
    SKYLINE_GROUP.add(ledge);
    skylineMats.push({ mat:ledgeMat, type:'win', phase:phase+ti*0.9 });
  });

  // Antenna / spire above crown
  const antH = h*(0.22+(bi%4)*0.06);
  const antGeo = new THREE.BufferGeometry();
  antGeo.setAttribute('position', new THREE.Float32BufferAttribute([bx,baseY+h,bz, bx,baseY+h+antH,bz],3));
  const antMat = new THREE.LineBasicMaterial({ color:colorHex, transparent:true, opacity:0 });
  SKYLINE_GROUP.add(new THREE.Line(antGeo, antMat));
  skylineMats.push({ mat:antMat, type:'edge', phase:phase+1.8 });

  // Rooftop corner beacon lights
  const crownW=w*0.58, crownD=d*0.58;
  [[-crownW/2,-crownD/2],[crownW/2,-crownD/2],[-crownW/2,crownD/2],[crownW/2,crownD/2]].forEach(([cx,cz],ci) => {
    const dotMat = new THREE.MeshBasicMaterial({ color:colorHex, transparent:true, opacity:0 });
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.08,4,4), dotMat);
    dot.position.set(bx+cx, baseY+h, bz+cz);
    SKYLINE_GROUP.add(dot);
    skylineMats.push({ mat:dotMat, type:'win', phase:phase+cx+ci });
  });
});

// Holographic pedestrians — simple stick-figure line segments
function makeHoloPerson(x, z, color) {
  const L = [];
  const add = (x1,y1,z1,x2,y2,z2) => L.push(x1,y1,z1,x2,y2,z2);
  // head
  add(x,  -6.2,z, x,  -6.0,z);
  // body
  add(x,  -6.2,z, x,  -6.7,z);
  // arms
  add(x-.15,-6.35,z, x+.15,-6.35,z);
  // legs
  add(x,  -6.7,z, x-.1,-7.0,z);
  add(x,  -6.7,z, x+.1,-7.0,z);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(L), 3));
  const mat = new THREE.LineBasicMaterial({ color, transparent:true, opacity:0 });
  const mesh = new THREE.LineSegments(geo, mat);
  PANEL_GROUP.add(mesh);
  return mat;
}
const holoPeopleMats = [];
[[-3.5,-8],[3.5,-9],[-1,-7.5],[2,-8.5],[0,-9.2],[-4.5,-7],[4,-7.2]].forEach(([hx,hz],i) => {
  const colors = [0x00ccff, 0x7b2fff, 0x00ffaa];
  holoPeopleMats.push(makeHoloPerson(hx, hz, colors[i%3]));
});

// (hologram UI panels removed — project info shown as HTML floating cards)

// Main project buildings — taller, interactive
PROJECTS.forEach((proj, i) => {
  const tex = proj.isTLD ? buildTLDTexture() : buildPortfolioTexture(proj);
  const angle = (i/PROJECTS.length)*Math.PI*1.2 - Math.PI*.6;
  const r = 5.5;
  const bx = Math.sin(angle)*r, bz = Math.cos(angle)*r - 1.5;
  const bldW = 2.8, bldH = 6.5, bldD = 0.8;

  // Building body
  const bodyMat = new THREE.MeshStandardMaterial({
    color:0x010c1a, emissive: new THREE.Color(proj.color).multiplyScalar(0.06),
    emissiveIntensity:1, metalness:0.7, roughness:0.3, transparent:true, opacity:0
  });
  const building = new THREE.Mesh(new THREE.BoxGeometry(bldW, bldH, bldD), bodyMat);
  building.position.set(bx, (i%2===0 ? 0.4 : -0.8), bz);
  building.rotation.y = -angle * 0.5;

  // Project texture on front face — as a plane slightly in front
  const faceMat = new THREE.MeshStandardMaterial({
    map:tex, color:0x020c18, emissive:0x001428, emissiveIntensity:0.4,
    metalness:0.2, roughness:0.8, transparent:true, opacity:0
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(bldW * 0.92, bldH * 0.82), faceMat);
  face.position.z = bldD/2 + 0.01;
  building.add(face);

  // LED edge strips (color of project)
  const edgeMat = new THREE.LineBasicMaterial({ color: new THREE.Color(proj.color), transparent:true, opacity:0 });
  building.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(bldW, bldH, bldD)), edgeMat));

  // Glow light on building face
  const bLight = new THREE.PointLight(new THREE.Color(proj.color), 0, 5);
  bLight.position.set(0, 0, bldD);
  building.add(bLight);

  // Window rows on building
  for (let row=0; row<4; row++) {
    for (let col=0; col<3; col++) {
      const wm = new THREE.MeshBasicMaterial({
        color: new THREE.Color(proj.color).multiplyScalar(0.8),
        transparent:true, opacity:0
      });
      const wMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.35,0.18), wm);
      wMesh.position.set(-0.55 + col*0.55, 1.5 - row*0.7, bldD/2+0.02);
      building.add(wMesh);
      building.userData['winMat_'+row+'_'+col] = wm;
    }
  }

  building.userData = {
    ...proj, index:i,
    basePos: building.position.clone(),
    baseRot: building.rotation.clone(),
    bodyMat, faceMat, edgeMat, bLight
  };

  PANEL_GROUP.add(building);
  panelMeshes.push(building);
});

// City ambient light strip at ground level
const cityStreetLight = new THREE.PointLight(0x004466, 0, 20);
cityStreetLight.position.set(0, -6, 0);
PANEL_GROUP.add(cityStreetLight);

// ═══════════════════════════════════════════════════════════════
// SCENE 4 — PRICING WORLD (group center world z = -42)
// ═══════════════════════════════════════════════════════════════
const PRICING_WORLD = new THREE.Group();
PRICING_WORLD.position.set(0, 0, 0);
PRICING_WORLD.visible = false;
scene.add(PRICING_WORLD);

// Minimal floor grid
const priceGrid = new THREE.GridHelper(44, 30, 0x001122, 0x000a15);
priceGrid.material.transparent = true;
priceGrid.material.opacity = 0;
priceGrid.position.y = -5;
PRICING_WORLD.add(priceGrid);

// Decor ring
const priceRing = new THREE.Mesh(
  new THREE.TorusGeometry(7.5, 0.014, 8, 80),
  new THREE.MeshBasicMaterial({ color:0x004466, transparent:true, opacity:0 })
);
priceRing.rotation.x = Math.PI*.5; priceRing.position.y = -1.2;
PRICING_WORLD.add(priceRing);

const pricingCards = [];
[
  { x:-5.0, z: 0.5 },
  { x: 0,   z:-0.6 }, // featured center
  { x: 5.0, z: 0.5 }
].forEach(({x,z}, i) => {
  const plan = PRICING_PLANS[i];
  // MeshBasicMaterial — not affected by scene lighting, shows texture at full brightness
  const mat = new THREE.MeshBasicMaterial({
    map: buildPricingTexture(plan),
    transparent: true, opacity: 0
  });
  const w = 4.2, h = 6.0;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  panel.position.set(x, plan.featured ? 0.6 : 0, z);
  panel.userData = { plan, baseY: plan.featured ? 0.6 : 0, baseX: x, baseZ: z, hoverScale: 1.0, expandScale: 1.0 };
  const edgeMat = new THREE.LineBasicMaterial({color:new THREE.Color(plan.color),transparent:true,opacity:0});
  panel.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h)), edgeMat));
  panel.userData.edgeMat = edgeMat;

  // Bubble glow halo — lights up on hover like Apple-style button aura
  const haloC = document.createElement('canvas'); haloC.width = 640; haloC.height = 900;
  const haloCtx = haloC.getContext('2d');
  const haloGrad = haloCtx.createRadialGradient(320, 450, 160, 320, 450, 380);
  haloGrad.addColorStop(0, 'transparent');
  haloGrad.addColorStop(0.68, 'transparent');
  haloGrad.addColorStop(0.82, plan.color + 'cc');
  haloGrad.addColorStop(0.92, plan.color + '55');
  haloGrad.addColorStop(1, 'transparent');
  haloCtx.fillStyle = haloGrad;
  haloCtx.fillRect(0, 0, 640, 900);
  const haloMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(haloC), transparent: true, opacity: 0 });
  const haloMesh = new THREE.Mesh(new THREE.PlaneGeometry(w + 1.0, h + 0.8), haloMat);
  haloMesh.position.set(x, plan.featured ? 0.6 : 0, z - 0.05);
  PRICING_WORLD.add(haloMesh);
  panel.userData.haloMat = haloMat;
  panel.userData.haloMesh = haloMesh;

  PRICING_WORLD.add(panel);
  pricingCards.push(panel);
});

// ═══════════════════════════════════════════════════════════════
// POST-PROCESSING
// ═══════════════════════════════════════════════════════════════
let composer = null, bloomPass = null;
const GrainShader = {
  uniforms: { tDiffuse:{value:null}, uTime:{value:0}, uAmt:{value:0.038} },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime; uniform float uAmt;
    varying vec2 vUv;
    float rand(vec2 p){ return fract(sin(dot(p+uTime,vec2(127.1,311.7)))*43758.5453); }
    void main(){
      vec4 col=texture2D(tDiffuse,vUv);
      col.rgb+=(rand(vUv*700.0)-.5)*uAmt;
      gl_FragColor=col;
    }
  `
};
try {
  {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(new THREE.Vector2(W() / 3, H() / 3), 0.65, 0.4, 0.3);
    composer.addPass(bloomPass);
    const grainPass = new ShaderPass(GrainShader);
    grainPass.uniforms.uTime = UNI.uTime;
    composer.addPass(grainPass);
    grainPass.renderToScreen = true;
  }
} catch(e) { composer = null; }

// ═══════════════════════════════════════════════════════════════
// RAYCASTER + INTERACTIONS
// ═══════════════════════════════════════════════════════════════
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredPanel = null, hoveredSvcPanel = null, hoveredPriceCard = null, selectedCard = null;

canvas.addEventListener('mousemove', e => {
  mouse.x = (e.clientX/W())*2-1;
  mouse.y = -(e.clientY/H())*2+1;
});

// ── CUSTOM CURSOR ─────────────────────────────────────────────────
const cursor = document.querySelector('.cursor');

window.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

window.addEventListener('mousedown', () => cursor.classList.add('active'));
window.addEventListener('mouseup',   () => cursor.classList.remove('active'));
canvas.addEventListener('click', () => {
  if (hoveredPanel && hoveredPanel.userData.bodyMat && hoveredPanel.userData.bodyMat.opacity > 0.2 && hoveredPanel.userData.isTLD) openModal(hoveredPanel.userData);
  platformPanels.forEach(({ panel, proj }) => { if (panel.userData._hov && proj.isTLD) openModal(proj); });
});
function openModal(d) {
  document.getElementById('modal-title').textContent=d.title;
  document.getElementById('modal-tag').textContent=d.tag;
  document.getElementById('modal-desc').textContent=d.desc;
  document.getElementById('modal-tech').innerHTML=d.tech.map(t=>`<span class="tech-pill">${t}</span>`).join('');
  const ve=document.getElementById('modal-visit');
  ve.innerHTML=d.visit?`<a href="${d.visit}" target="_blank">→ ${d.visitLabel||'View Project'}</a>`:'';
  if (window._patchModal) window._patchModal(d);
  document.getElementById('project-modal').classList.add('open');
}
document.getElementById('modal-close').addEventListener('click', ()=>document.getElementById('project-modal').classList.remove('open'));

// Price expand overlay close
const _pboClose = document.getElementById('pbo-close');
if (_pboClose) _pboClose.addEventListener('click', () => {
  selectedCard = null;
  document.getElementById('price-book-overlay').classList.remove('visible');
});

// HTML portfolio cards fire this to open the same modal
window.addEventListener('openProjectModal', e => {
  const proj = PROJECTS[e.detail];
  if (proj && proj.isTLD) openModal(proj);
});

// ═══════════════════════════════════════════════════════════════
// CAMERA RIG
// ═══════════════════════════════════════════════════════════════
const cam   = { x:0, y:2, z:14 };
const look  = { x:0, y:2, z:0  };
const mouseP = { x:0, y:0 };
window.addEventListener('mousemove', e => {
  mouseP.x = (e.clientX/W()-.5)*2;
  mouseP.y = -(e.clientY/H()-.5)*2;
});

// ═══════════════════════════════════════════════════════════════
// UI ELEMENTS
// ═══════════════════════════════════════════════════════════════
const heroText    = document.getElementById('hero-text');
const servicesText = document.getElementById('services-text');
const aiworldText  = document.getElementById('aiworld-text');
const pricingText  = document.getElementById('pricing-text');
const bookingCta   = document.getElementById('booking-cta');
const projectsUI   = document.getElementById('projects-ui');
const scrollHint   = document.getElementById('scroll-hint');
const dots         = document.querySelectorAll('.progress-dot');

function showText(el, show) {
  if (!el) return;
  el.classList.toggle('visible', show);
}

function updateUI(sp) {
  // Section tracking
  let sec = 0;
  for (let i=SECTIONS.length-1;i>=0;i--) { if(sp>=SECTIONS[i].start){sec=i;break;} }
  if (sec !== currentSection) {
    currentSection = sec;
    dots.forEach((d,i)=>d.classList.toggle('active',i===sec));
    document.getElementById('hud-status').textContent  = STATUSES[sec];
  }
  document.getElementById('hud-coherence').textContent = sp.toFixed(3);
  scrollHint.style.opacity = sp<0.03?'1':'0';

  const s0=sP(0), s1=sP(1), s2=sP(2), s3=sP(3), s7=sP(7);

  // Hero text (sections 0-1) — guarded null-check
  if (heroText) {
    if(s0>0.1&&sp<0.22){heroText.classList.add('visible');heroText.style.opacity='';}
    else if(sp>=0.22&&sp<0.26){heroText.style.opacity=String(1-(sp-0.22)/0.04);}
    else{heroText.classList.remove('visible');}
  }

  // Services text — covers gap after hero AND portal void (0.22–0.64)
  showText(servicesText, sp>0.22&&sp<0.64);
  showText(aiworldText, false);
  // Pricing text — starts early to eliminate gap before pricing
  showText(pricingText, s7>0.05&&sp>0.86);
  bookingCta.classList.toggle('visible', s7>0.2&&sp>0.86);
  // Portfolio UI label
  showText(projectsUI, sp>0.29&&sp<0.50);
}

// ═══════════════════════════════════════════════════════════════
// ANIMATE LOOP
// ═══════════════════════════════════════════════════════════════
const clock = new THREE.Clock();
let frame = 0;

function animate(ts) {
  requestAnimationFrame(animate);
  if (lenis) lenis.raf(ts);
  const t = clock.getElapsedTime();
  const time = performance.now() * 0.001;
  frame++;

  // Smooth scroll
  scrollProgress += (targetScroll - scrollProgress) * 0.11;
  const sp = scrollProgress;
  UNI.uTime.value = t;

  const s0=sP(0), s1=sP(1), s2=sP(2), s3=sP(3), s4=sP(4), s5=sP(5), s6=sP(6), s7=sP(7);

  // LOGO hidden — removed per user request
  LOGO_GROUP.visible = false;

  // ── SERVICES WORLD ──
  const svcRawVis = clamp01((sp<0.44 ? (sp-0.30)/0.14 : (0.55-sp)/0.11));
  const svcVis = ease(svcRawVis);
  SVC_WORLD.visible = svcVis > 0.005;

  if (SVC_WORLD.visible) {
    svcParticles.material.opacity = svcVis * 0.45;

    // Carousel rotation driven by scroll through sections 2-3
    const carouselTarget = -(s2 * 0.5 + s3 * 0.35) * Math.PI * 1.2;
    svcCurrentAngle += (carouselTarget - svcCurrentAngle) * 0.04;

    // Hover detection for service panels
    raycaster.setFromCamera(mouse, camera);
    const svcHits = raycaster.intersectObjects(svcHitMeshes);
    let hovSvcIdx = -1;
    if (svcHits.length > 0) {
      const hitChild = svcHits[0].object;
      hovSvcIdx = svcHitMeshes.indexOf(hitChild);
    }

    svcPanels.forEach((pg, i) => {
      const angle = (i / SERVICES.length) * Math.PI * 2 + svcCurrentAngle;
      const r = 3.8;
      const isHov = (i === hovSvcIdx && svcVis > 0.3);
      const hoverScale = isHov ? lerp(pg.scale.x, 1.06, 0.12) : lerp(pg.scale.x, 1.0, 0.10);
      pg.scale.setScalar(hoverScale);

      pg.position.set(
        Math.sin(angle) * r,
        Math.sin(t * .4 + i * 1.1) * .18 + (isHov ? 0.08 : 0),
        Math.cos(angle) * r
      );
      pg.rotation.y = -angle + Math.PI;

      // Visibility: panels facing camera (+z side of SVC_WORLD) are more visible
      const facing = (Math.cos(angle) + 1) * 0.5;
      const finalVis = facing * svcVis;
      const glowBoost = isHov ? 1.4 : 1.0;

      svcGlassMats[i].opacity    = finalVis * 0.18 * glowBoost;
      svcContentMats[i].opacity  = finalVis * 0.90;
      svcEdgeMats[i].opacity     = finalVis * (isHov ? 0.85 : 0.52);
      svcGlowLights[i].intensity = finalVis * (isHov ? 1.8 : 0.7);

      if (isHov) canvas.style.cursor = 'pointer';
    });
    if (hovSvcIdx === -1) canvas.style.cursor = '';

    // Services lights
    svcLight1.intensity = svcVis * 2.5;
    svcLight2.intensity = svcVis * 1.8;

    // 3D wave grid — synced with services carousel rotation via t
    waveGridMat.opacity = svcVis * 0.35;
    waveAccMat.opacity  = svcVis * 0.85;
    if (svcVis > 0.02) {
      const wPhase = t * 0.38;
      updateWaveGrid(waveGridGeo, wPhase);
      updateWaveAccGrid(waveAccGeo, wPhase);
    }
  }

  // ── AI WORLD — hidden ──
  AI_WORLD.visible = false;
  aiWorld.hide();

  if (AI_WORLD.visible) {
    // Data streams
    dataStreams.forEach(ds => {
      const attr = ds.geo.attributes.position;
      for (let i=0;i<80;i++) {
        ds.pos[i*3+1] += ds.vel[i];
        if (ds.pos[i*3+1] > 10) ds.pos[i*3+1] = -5;
        attr.array[i*3+1] = ds.pos[i*3+1];
      }
      attr.needsUpdate=true;
      ds.pts.material.opacity = 0;
    });

    // Platforms fade + float
    platforms.forEach((p,i) => {
      const delay = i * 0.06;
      const pv = ease(clamp01((aiVis - delay) * 2));
      p.mat.opacity = pv * 0.92;
      p.edgeMat.opacity = pv * 0.65;
      p.mesh.position.y = p.baseY + Math.sin(t*.4+i*1.1)*.16;
    });

    // Platform panels — float in sync with platform, beams + floor lights
    raycaster.setFromCamera(mouse, camera);
    let platHover = false;
    platformPanels.forEach(({ panel, panMat, edgeMat, platIdx, beamMat, floorLight }) => {
      const p = platforms[platIdx];
      const panH = panel.geometry.parameters.height;
      const pd = platformData[platIdx];
      // Panel floats above platform, stays synced to bob
      panel.position.set(p.mesh.position.x, p.mesh.position.y + panH / 2 + 0.52, p.mesh.position.z);
      // Beam stays fixed at platform base position (no bob — it grounds the beam)
      panMat.opacity  += (aiVis * 0.93 - panMat.opacity)  * 0.05;
      edgeMat.opacity += (aiVis * 0.72 - edgeMat.opacity) * 0.05;
      beamMat.opacity += (aiVis * 0.045 - beamMat.opacity) * 0.04;
      floorLight.intensity += (aiVis * 1.4 - floorLight.intensity) * 0.04;
      // Hover
      const hits = raycaster.intersectObject(panel, false);
      if (hits.length > 0 && panMat.opacity > 0.12) {
        canvas.style.cursor = 'pointer';
        panel.userData._hov = true;
        platHover = true;
        beamMat.opacity += (aiVis * 0.16 - beamMat.opacity) * 0.1; // beam brightens on hover
        floorLight.intensity = Math.min(floorLight.intensity * 1.6, 6.0);
      } else {
        panel.userData._hov = false;
      }
    });
    if (!platHover && canvas.style.cursor === 'pointer') canvas.style.cursor = '';

    // Holographic rings — hidden (replaced by sonar pulse rings)
    holoRings.forEach(ring => { ring.material.opacity = 0; });

    // Sonar pulse rings — expand outward from each platform and fade
    pulseRings.forEach(({ ring, ringMat, phase }) => {
      const cycle = (t * 0.45 + phase) % 1;
      ring.scale.setScalar(lerp(1.0, 5.5, ease(cycle)));
      ringMat.opacity = aiVis * (1 - cycle) * 0.22;
    });

    // Ground reflection discs
    groundDiscs.forEach(({ discMat }) => {
      discMat.opacity = aiVis * 0.14;
    });

    // Grid and lights
    aiGrid.material.opacity = aiVis * 0.38;
    aiLight1.intensity = aiVis * 4.0;
    aiLight2.intensity = aiVis * 3.0;
    aiLight3.intensity = aiVis * 2.0;
  }

  // ── CITY SKYLINE opacity (visible through full AI world section) ──
  if (AI_WORLD.visible) {
    skylineMats.forEach(({ mat, type, phase }) => {
      const tgt = type === 'body' ? aiVis * 0.90
                : type === 'edge' ? aiVis * (0.55 + Math.sin(t * 1.3 + phase) * 0.10)
                :                   aiVis * (0.28 + Math.sin(t * 0.85 + phase) * 0.15);
      mat.opacity += (tgt - mat.opacity) * 0.05;
    });
  } else {
    skylineMats.forEach(({ mat }) => { mat.opacity = 0; });
  }

  // ── CITY PORTFOLIO (in AI World) ──
  const portVis = 0; // city portfolio buildings removed
  const cityActive = portVis > 0.005;

  // City ground + grid
  if (cityGround.material) { cityGround.material.opacity = portVis * 0.55; }
  if (cityGrid.material) { cityGrid.material.opacity = portVis * 0.42; }
  cityStreetLight.intensity = portVis * 3.0;

  // Hologram pedestrians — walk left/right, flicker
  holoPeopleMats.forEach((m, i) => {
    const flicker = 0.6 + Math.sin(t*3.5 + i*1.7) * 0.35;
    m.opacity = portVis * flicker * 0.65;
  });

  let foundHover = false;
  if (cityActive) {
    raycaster.setFromCamera(mouse, camera);
    panelMeshes.forEach((b, i) => {
      const ud = b.userData;
      const targetOp = portVis * 0.9;
      ud.bodyMat.opacity += (targetOp - ud.bodyMat.opacity) * 0.08;
      ud.faceMat.opacity += (targetOp * 0.92 - ud.faceMat.opacity) * 0.08;

      const hits = raycaster.intersectObject(b, false);
      const hov = hits.length > 0 && ud.bodyMat.opacity > 0.2;
      if (hov) { hoveredPanel = b; foundHover = true; }

      if (hov) {
        canvas.style.cursor = 'pointer';
        ud.bodyMat.emissiveIntensity = 0.35 + Math.sin(t*3)*0.12;
        ud.edgeMat.opacity = portVis * 0.95;
        ud.bLight.intensity = 2.5 + Math.sin(t*3)*0.5;
        b.scale.setScalar(1.04);
        // Windows brighten on hover
        for(let r=0;r<4;r++) for(let c=0;c<3;c++) {
          const wm = ud['winMat_'+r+'_'+c];
          if (wm) wm.opacity = portVis * (0.4 + Math.sin(t*2+r*c)*0.2);
        }
      } else {
        ud.bodyMat.emissiveIntensity = 0.06;
        ud.edgeMat.opacity = portVis * 0.35;
        ud.bLight.intensity = portVis * 0.5;
        b.scale.setScalar(1.0);
        for(let r=0;r<4;r++) for(let c=0;c<3;c++) {
          const wm = ud['winMat_'+r+'_'+c];
          if (wm) wm.opacity = portVis * (0.08 + Math.sin(t*1.2+r*1.5+c)*0.04);
        }
      }

      // Building subtle sway
      b.position.y = ud.basePos.y + Math.sin(t*0.3+i*0.9)*0.06;
      b.rotation.y = ud.baseRot.y + Math.sin(t*0.2+i)*0.01;
    });
  } else {
    panelMeshes.forEach(b => {
      b.userData.bodyMat.opacity = 0;
      b.userData.faceMat.opacity = 0;
      b.userData.edgeMat.opacity = 0;
      b.userData.bLight.intensity = 0;
    });
  }
  if (!foundHover) { hoveredPanel = null; }

  // ── PRICING WORLD — replaced by HTML glassy overlay ──
  PRICING_WORLD.visible = false;
  hoveredPriceCard = null;
  if (bloomPass) {
    bloomPass.strength += (0.75 - bloomPass.strength) * 0.06;
  }

  // ── CURSOR ──
  if (hoveredPriceCard) { canvas.style.cursor = 'pointer'; }
  else if (!foundHover) { canvas.style.cursor = ''; }

  // ── CAMERA — Y-AXIS DESCENT ──
  // Camera descends vertically through stacked environments.
  // Z stays constant (~11). Primary scroll axis is Y.
  let tZ = 11, tX = mouseP.x * 0.12, tY = 0;
  let tLZ = 0, tLX = mouseP.x * 0.15, tLY = 0;

  if (sp < 0.12) {
    // GENESIS: ease in from high above the DNA origin
    const p = ease(s0);
    tY = lerp(2, 0, p);
    tLY = lerp(2, 0, p);
    tZ = lerp(14, 11, p);
  } else if (sp < 0.26) {
    // AWAKEN: subtle arc while centered on DNA
    const orb = s1 * Math.PI * 0.35;
    tX += Math.sin(orb) * 0.4;
    tZ = 11 + Math.cos(orb) * 0.3;
    tY = 0; tLY = 0;
    tLX += mouseP.x * 0.06;
  } else if (sp < 0.44) {
    // INTERFACE: descend to services floor at y=-20
    const p = ease(s2);
    tY = lerp(0, -20, p);
    tLY = lerp(0, -20, p);
    tZ = 11;
    tLX += mouseP.x * lerp(0.15, 0.35, p);
  } else if (sp < 0.54) {
    // CONVERGE: breathe and drift deeper in services zone
    const p = ease(s3);
    tY = lerp(-20, -26, p);
    tLY = lerp(-20, -26, p);
    tZ = 10.5 + Math.sin(t * 0.18) * 0.5;
    tX += Math.sin(t * 0.15) * 0.6;
    tLX += mouseP.x * 0.45;
  } else if (sp < 0.66) {
    // PORTAL: freefall descent, pull camera back as AI world approaches
    const p = ease(s4);
    tY = lerp(-26, -36, p);
    tLY = lerp(-26, -41, p);
    tZ = lerp(10.5, 15, p);
    tLX += mouseP.x * 0.4;
  } else if (sp < 0.89) {
    // ARCHITECT: pulled back + looking DOWN at floating platforms
    const blend = s5 * 0.5 + s6 * 0.5;
    tY = lerp(-36, -40, ease(blend));
    tLY = lerp(-41, -44, ease(blend));
    tZ = 15;
    tX += Math.sin(t * 0.14) * 0.2;
    tLX += mouseP.x * 0.22;
  } else {
    // ELEVATION: final descent to DNA/pricing floor
    const p = ease(s7);
    tY = lerp(-40, -58, p);
    tLY = lerp(-44, -55, p);
    tZ = lerp(15, 11, p);
    tX += Math.sin(t * 0.12) * 0.5;
    tLX += mouseP.x * 0.3;
  }

  // Subtle vertical mouse parallax layered on top of scroll-driven Y
  tY  += mouseP.y * 0.28;
  tLY += mouseP.y * 0.14;

  const LERP = 0.075;
  cam.x += (tX - cam.x) * LERP;
  cam.y += (tY - cam.y) * LERP;
  cam.z += (tZ - cam.z) * LERP;
  look.x += (tLX - look.x) * LERP;
  look.y += (tLY - look.y) * LERP;
  look.z += (tLZ - look.z) * LERP;

  camera.position.set(cam.x, cam.y, cam.z);
  camera.lookAt(look.x, look.y, look.z);

  // ── SCENE UPDATES ──
  aiWorld.update(t);
  logo.update(time);
  drones.update(time);

  // ── LIGHTS PULSE ──
  ptCyan.intensity   = 3.0 + Math.sin(t*1.7)*.5;
  ptBio.intensity    = 1.8 + Math.sin(t*1.3+1)*.4;
  ptPurple.intensity = 1.2 + Math.sin(t*2.1+2)*.4;

  // ── ENVIRONMENT TRANSITIONS ──
  // Each zone has distinct fog density + color tint (pre-allocated, no per-frame alloc)
  let fogDensTarget;
  if (sp < 0.26) {
    fogDensTarget = 0.007;  _fogTgt.setHex(0x000c18);
  } else if (sp < 0.54) {
    fogDensTarget = 0.016;  _fogTgt.setHex(0x050010);
  } else if (sp < 0.66) {
    fogDensTarget = 0.022;  _fogTgt.setHex(0x000000);
  } else if (sp < 0.89) {
    fogDensTarget = 0.013;  _fogTgt.setHex(0x001008);
  } else {
    fogDensTarget = 0.010;  _fogTgt.setHex(0x04000c);
  }
  scene.fog.density += (fogDensTarget - scene.fog.density) * 0.025;
  scene.fog.color.lerp(_fogTgt, 0.025);

  // ── UI UPDATE (every 2 frames) ──
  if (frame % 2 === 0) updateUI(sp);

  // ── RENDER ──
  if (composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

// ── RESIZE ────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = W() / H();
  camera.updateProjectionMatrix();
  renderer.setSize(W(), H());
  if (composer) composer.setSize(W(), H());
});

// ── KICKSTART ─────────────────────────────────────────────────────
setTimeout(() => { if (heroText) heroText.classList.add('visible'); }, 200);
animate();

} // end setupScene
