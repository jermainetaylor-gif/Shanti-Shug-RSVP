import React, { useState } from "react";
import {
  Copy,
  Check,
  FileCode2,
  Play,
  BookOpen,
  ChevronRight,
  Download,
  Wand2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const CODE_GS = `// Code.gs
// Shanti & Shug's Baby Shower - Server Side REST API

function doGet(e) {
  try {
    var action = e.parameter.action;
    
    if (!action) {
      // Serve the HTML UI when someone visits the link directly
      return HtmlService.createHtmlOutputFromFile('Index')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
        .setTitle("Shanti & Shug's Baby Shower")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    
    // Otherwise, treat as an API request
    var result;
    if (action === 'checkPhone') {
      result = checkPhone(e.parameter.phone);
    } else if (action === 'submitRSVP') {
      var dataObj = JSON.parse(e.parameter.data);
      result = submitRSVP(dataObj);
    } else {
      result = { status: 'error', message: 'Unknown action' };
    }
    
    // Automatically sets up the JSON output which GAS properly CORS resolves
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function checkPhone(phone) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const whitelistSheet = ss.getSheetByName('Whitelist');
    const rsvpSheet = ss.getSheetByName('RSVPs');
    
    if (!whitelistSheet) {
      return { status: 'error', message: 'Whitelist sheet not found. Please make sure you named the sheet exactly "Whitelist".' };
    }
    
    const inputPhone = String(phone).replace(/\\D/g, '');

    if (rsvpSheet) {
      const rsvpData = rsvpSheet.getDataRange().getValues();
      for (let i = 1; i < rsvpData.length; i++) {
        // Phone is in Col B (index 1) of RSVP sheet
        const rsvpPhone = String(rsvpData[i][1]).replace(/\\D/g, '');
        if (rsvpPhone === inputPhone) {
          return { status: 'already' };
        }
      }
    }
    
    const data = whitelistSheet.getDataRange().getValues();

    // Iterate starting from 1 to skip the header row (Row 1)
    for (let i = 1; i < data.length; i++) {
      const rowPhone = String(data[i][0]).replace(/\\D/g, '');

      if (rowPhone === inputPhone) {
        let maxGuests = parseInt(data[i][2], 10) || 1;
        let plusOneStr = String(data[i][3] || '').trim().toLowerCase();
        let plusOneAllowed = plusOneStr === 'yes' || plusOneStr === 'true';

        return {
          status: 'found',
          name: data[i][1],
          maxGuests: maxGuests,
          plusOneAllowed: plusOneAllowed
        };
      }
    }
  } catch(e) {
    return { status: 'error', message: e.toString() };
  }
  
  return { status: 'not_found' };
}

function submitRSVP(dataPayload) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('RSVPs');
    
    if (!sheet) {
      throw new Error('RSVPs sheet not found. Please create a sheet named "RSVPs".');
    }

    sheet.appendRow([
      new Date(),
      dataPayload.phone,
      dataPayload.guestName,
      dataPayload.attending,
      dataPayload.specifiedNames || '',
      parseInt(dataPayload.maxGuests, 10) || 1,
      parseInt(dataPayload.numberAttending, 10) || 0,
      dataPayload.wordsOfWisdom || ''
    ]);
    
    return { success: true };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create our exact sheets
  let whitelistSheet = ss.getSheetByName('Whitelist');
  if (!whitelistSheet) {
    whitelistSheet = ss.insertSheet('Whitelist');
  }
  
  let rsvpSheet = ss.getSheetByName('RSVPs');
  if (!rsvpSheet) {
    rsvpSheet = ss.insertSheet('RSVPs');
  }
  
  // Clean up any default/other sheets
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    const sheetName = sheets[i].getName();
    if (sheetName !== 'Whitelist' && sheetName !== 'RSVPs') {
      ss.deleteSheet(sheets[i]);
    }
  }
  
  // Overwrite existing data
  whitelistSheet.clear();
  rsvpSheet.clear();
  
  // Setup Whitelist Tab
  const whitelistHeaders = [
    'Phone', 
    'Name / Group Name', 
    'Max Guests', 
    'Plus One Allowed'
  ];
  whitelistSheet.getRange(1, 1, 1, whitelistHeaders.length).setValues([whitelistHeaders]);
  whitelistSheet.getRange(1, 1, 1, whitelistHeaders.length).setFontWeight('bold');
  whitelistSheet.setFrozenRows(1);
  whitelistSheet.autoResizeColumns(1, whitelistHeaders.length);
  
  // Setup RSVPs Tab
  const rsvpHeaders = [
    'Timestamp', 
    'Phone', 
    'Guest Name', 
    'Attending', 
    'Specified Names', 
    'Max Guests Given',
    'Number Attending',
    'Words of Wisdom'
  ];
  rsvpSheet.getRange(1, 1, 1, rsvpHeaders.length).setValues([rsvpHeaders]);
  rsvpSheet.getRange(1, 1, 1, rsvpHeaders.length).setFontWeight('bold');
  rsvpSheet.setFrozenRows(1);
  rsvpSheet.autoResizeColumns(1, rsvpHeaders.length);
}`;

const INDEX_HTML = `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@300;400;500;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            dustypink: '#D69A9A',
            base: '#fdf6f7',
            gold: '#D4AF37'
          },
          fontFamily: {
            cursive: ['"Great Vibes"', 'cursive'],
            serif: ['"Cormorant Garamond"', 'serif'],
            sans: ['"Montserrat"', 'sans-serif'],
          },
          boxShadow: {
            'glow': '0 0 40px rgba(214, 154, 154, 0.4)',
            'card': '0 20px 40px -10px rgba(0,0,0,0.1)',
          }
        }
      }
    }
  </script>
  <style>
    /* Mobile Wrapper for Desktop */
    html, body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      min-height: 100vh;
    }

    body {
      background: linear-gradient(180deg, #f5e0d8 0%, #fae8eb 50%, #fdf6f7 100%);
      font-family: 'Cormorant Garamond', serif;
      color: #8c5a4d;
    }

    /* Perpetual Heaven Sent Animations */
    .sky-container {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    
    .heaven-sent-title {
      position: relative;
      display: inline-block;
      padding: 0 0.8em; /* Generous padding to prevent cursive swashes from clipping */
      margin: 0 -0.8em; /* Counteract padding to keep it centered */
      overflow: visible;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      transform: translateZ(0);
      color: #9c6371;
    }
    
    .heaven-sent-title::after {
      content: '✦';
      position: absolute;
      top: 10px;
      right: 15%;
      font-size: 0.15em;
      color: #eac2c2;
      -webkit-text-fill-color: #eac2c2;
      animation: titleSparkle 4s ease-in-out infinite alternate;
      opacity: 0.6;
      font-family: serif;
    }

    .heaven-sent-title::before {
      content: '✧';
      position: absolute;
      bottom: 25px;
      left: 10%;
      font-size: 0.12em;
      color: #e0c2c9;
      -webkit-text-fill-color: #e0c2c9;
      animation: titleSparkle 5s ease-in-out infinite alternate-reverse;
      opacity: 0.4;
      font-family: serif;
    }

    @keyframes titleSparkle {
      0% { transform: scale(0.8) rotate(0deg); opacity: 0.3; }
      100% { transform: scale(1.1) rotate(10deg); opacity: 0.9; }
    }
    
    @keyframes heavenlyGlow {
      0% {
        filter: drop-shadow(0 4px 12px rgba(214, 154, 154, 0.3));
      }
      100% {
        filter: drop-shadow(0 10px 20px rgba(214, 154, 154, 0.6)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
      }
    }

    .cloud {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 70%);
      pointer-events: none;
    }


    @keyframes floatForeground {
      0% { transform: translate(-3%, 3px) scaleX(var(--scale, 1)); }
      100% { transform: translate(3%, -3px) scaleX(var(--scale, 1)); }
    }
    
    @keyframes floatClouds {
      0% { transform: translate(-25vw, 4vh) scaleX(var(--scale, 1)); }
      100% { transform: translate(25vw, -4vh) scaleX(var(--scale, 1)); }
    }

    .star {
      position: absolute;
      background: white;
      border-radius: 50%;
      box-shadow: 0 0 8px 1px rgba(255,255,255,0.6);
      animation: twinkle ease-in-out infinite alternate;
    }

    @keyframes twinkle {
      0% { opacity: 0.1; transform: scale(0.7); }
      100% { opacity: 0.9; transform: scale(1.3); }
    }

    /* Sendo-style Envelope */
    .envelope-wrapper {
      perspective: 1000px;
      width: 100%;
      max-width: 450px;
      margin: 4rem auto 8rem;
      position: relative;
      z-index: 10;
      transition: opacity 0.5s ease;
    }
    
    .envelope {
      position: relative;
      width: 100%;
      padding-bottom: 80%; 
      background: #f7e2d9; /* pinkish-peach interior */
      box-shadow: 0 10px 40px rgba(0,0,0,0.12); /* Sendo subtle shadow */
      border-radius: 4px;
      transform-style: preserve-3d;
      transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    
    .envelope.open {
      transform: translateY(8rem);
    }
    
    /* Paper Texture */
    .envelope::before, .top-flap::before, .envelope-left::before, .envelope-right::before, .envelope-bottom::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: url('https://www.transparenttextures.com/patterns/cream-paper.png');
      opacity: 0.35;
      pointer-events: none;
    }

    .top-flap-wrapper {
      position: absolute;
      top: 0; left: 0; right: 0; height: 60%;
      transform-origin: top;
      transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), z-index 0s linear 0.5s;
      z-index: 6; /* Front of envelope */
      filter: drop-shadow(0 6px 8px rgba(0,0,0,0.1)) drop-shadow(0 1px 2px rgba(156, 99, 113, 0.3));
    }

    .top-flap {
      width: 100%; height: 100%;
      background: #fafafa; /* outer background almost white */
      clip-path: polygon(0 0, 50% 100%, 100% 0); /* triangle pointing down */
      transition: background 0.4s linear;
      border-radius: 4px 4px 0 0;
    }
    
    .envelope.open .top-flap-wrapper {
      transform: rotateX(180deg);
      z-index: 1; /* Back of envelope */
      transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), z-index 0s linear 0.2s;
    }
    .envelope.open .top-flap {
      background: #eacabf; /* slightly darker pinkish-peach interior for flap */
    }

    .wax-seal {
      position: absolute;
      bottom: -25px;
      left: 50%;
      transform: translateX(-50%);
      width: 50px;
      height: 50px;
      background: radial-gradient(circle at 35% 35%, #9c6371 0%, #7d4d5a 70%, #5e3742 100%);
      border-radius: 50%;
      z-index: 10;
      box-shadow: 
        inset 0 0 6px rgba(0,0,0,0.4), 
        0 4px 6px rgba(0,0,0,0.2),
        0 0 0 1px rgba(125,77,90,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: inherit;
      color: #e0c2c9;
      font-size: 20px;
      font-style: italic;
      font-family: serif;
      text-shadow: -1px -1px 1px rgba(0,0,0,0.3), 1px 1px 1px rgba(255,255,255,0.1);
      transition: opacity 0.4s ease 0.1s, transform 0.4s ease;
    }

    .envelope.open .wax-seal {
      opacity: 0;
      transform: translateX(-50%) scale(0.8);
      pointer-events: none;
    }

    .wax-seal::after {
      content: '';
      position: absolute;
      top: 4px; left: 4px; right: 4px; bottom: 4px;
      border: 1px solid rgba(224, 194, 201, 0.4);
      border-radius: 50%;
      pointer-events: none;
      box-shadow: inset 0 0 4px rgba(0,0,0,0.2);
    }
    
    .envelope-left-wrapper {
      position: absolute;
      top: 0; left: 0; bottom: 0; width: 55%;
      z-index: 4;
      filter: drop-shadow(2px 0 4px rgba(0,0,0,0.06));
    }
    .envelope-left {
      width: 100%; height: 100%;
      background: #fcfcfc;
      clip-path: polygon(0 0, 100% 50%, 0 100%);
    }

    .envelope-right-wrapper {
      position: absolute;
      top: 0; right: 0; bottom: 0; width: 55%;
      z-index: 4;
      filter: drop-shadow(-2px 0 4px rgba(0,0,0,0.06));
    }
    .envelope-right {
      width: 100%; height: 100%;
      background: #fcfcfc;
      clip-path: polygon(100% 0, 0 50%, 100% 100%);
    }

    .envelope-bottom-wrapper {
      position: absolute;
      bottom: 0; left: 0; right: 0; height: 65%;
      z-index: 5;
      filter: drop-shadow(0 -4px 10px rgba(0,0,0,0.06)) drop-shadow(0 -1px 2px rgba(156, 99, 113, 0.2));
    }

    .envelope-bottom {
      width: 100%; height: 100%;
      background: #fdfdfd;
      clip-path: polygon(0 100%, 50% 0, 100% 100%);
      border-radius: 0 0 4px 4px;
    }
    
    .magic-invite-card {
      position: absolute;
      top: 10px; left: 6%; right: 6%; bottom: 10px; /* hidden inside */
      background: #ffffff;
      border-radius: 4px;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      z-index: 3; /* Behind pocket, in front of inside flap */
      transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
      opacity: 0;
      transform: translateY(40px);
      pointer-events: none;
    }

    .envelope.open .magic-invite-card {
      opacity: 1;
      transform: translateY(-145px) scale(1.03); /* slide up out of envelope */
      z-index: 6; 
      transition: all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s, z-index 0s linear 1s;
      pointer-events: auto;
    }
    
    /* Layout for app proper */
    .app-container {
      position: relative;
      z-index: 20;
      max-width: 500px;
      margin: 0 auto;
      padding: 16px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Main RSVP Form Container */
    .main-form-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 28px;
      box-shadow: 0 10px 40px -10px rgba(214,154,154,0.3);
      width: 100%;
      padding: 2rem 1.5rem;
      opacity: 0;
      transform: translateY(40px);
      transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
      pointer-events: none;
      position: absolute;
      top: 80px;
    }

    .main-form-card.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
      position: relative;
      top: 0;
    }

    /* Smooth step transitions */
    .step-container {
      display: none;
      opacity: 0;
    }
    .step-container.active {
      display: block;
      animation: fadeIn 0.5s ease forwards;
    }

    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    .shimmer-btn {
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #D69A9A, #c28888);
      color: white;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(214,154,154,0.3);
    }
    .shimmer-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(214,154,154,0.5);
    }
    .shimmer-btn::after {
      content: '';
      position: absolute;
      top: 0; right: 100%; bottom: 0; left: -100%;
      background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
      animation: shimmer 2.5s infinite;
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      50%, 100% { transform: translateX(300%); }
    }

    .option-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
      background: #fff;
    }
    .option-card:hover {
      transform: scale(1.02);
      border-color: rgba(214,154,154,0.3);
      box-shadow: 0 10px 20px rgba(214,154,154,0.1);
    }
    .option-card.selected {
      border-color: #D69A9A;
      background: rgba(214,154,154,0.05);
      transform: scale(1.02);
      box-shadow: 0 10px 20px rgba(214,154,154,0.15);
    }

    .spinner {
      width: 50px; height: 50px;
      border: 3px solid rgba(214,154,154,0.1);
      border-top: 3px solid #D69A9A;
      border-radius: 50%;
      animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* Custom scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(214,154,154,0.3); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(214,154,154,0.5); }
    
    .gold-border { border: 1px solid #D4AF37; }
  </style>
</head>
<body>

  <!-- Perpetual Heaven Sent Sky -->
  <div class="sky-container" id="sky">
    <!-- Generated dynamically via JS to avoid huge SVG string -->
  </div>

  <div class="app-container">
    
    <div class="w-full flex flex-col items-center justify-center relative z-30 transition-all duration-1000 mt-12 mb-4" id="main-header">
      <div class="relative w-full max-w-[500px] flex justify-center mt-6">
        <!-- Soft Blurred Clouds -->
        <div class="absolute -left-10 top-[5%] w-[300px] h-[300px] bg-white/60 blur-3xl rounded-full mix-blend-screen pointer-events-none z-0"></div>
        <div class="absolute -right-20 bottom-[30%] w-[350px] h-[350px] bg-white/50 blur-[100px] rounded-full mix-blend-screen pointer-events-none z-0"></div>
        <div class="absolute left-[10%] -bottom-10 w-[200px] h-[200px] bg-white/70 blur-[80px] rounded-full mix-blend-screen pointer-events-none z-0"></div>
        <div class="absolute left-[40%] -bottom-20 w-[400px] h-[250px] bg-white/60 blur-[90px] rounded-full mix-blend-screen pointer-events-none z-0"></div>

        <h1 class="font-cursive leading-[0.85] py-2 mb-6 px-4 flex flex-col items-center w-full relative z-40 overflow-visible">
          <span class="heaven-sent-title text-[6.5rem] tracking-tight text-center pb-2 min-w-max">Heaven</span>
          <span class="heaven-sent-title text-[4rem] text-center -mt-3 pb-2 min-w-max">Sent</span>
        </h1>
      </div>
      <div class="flex items-center gap-4 my-2 opacity-80 w-full justify-center relative z-40">
        <span class="w-12 h-[1px] bg-dustypink"></span>
        <p class="font-sans text-sm font-bold tracking-widest uppercase text-dustypink text-center flex-shrink-0">a celebration of</p>
        <span class="w-12 h-[1px] bg-dustypink"></span>
      </div>
      <h2 class="font-cursive text-[2.5rem] leading-none text-[#9c6371] mt-6 text-center drop-shadow-sm whitespace-nowrap relative z-40">Shanti & Shug</h2>
    </div>

    <!-- REGISTRATION CLOSED MESSAGE -->
    <div class="main-form-card mt-12 relative" style="opacity: 1; transform: none; top: 0; pointer-events: auto;">
      <div class="text-center mb-8 pt-4">
        <h3 class="font-serif text-5xl mb-4 text-[#9c6371] uppercase tracking-[0.15em]">RSVP CLOSED</h3>
        <p class="font-serif italic text-xl mb-4">Registration has closed for this event.</p>
        <p class="font-serif text-lg text-[#b58f86] px-4">Thank you! Please contact the host directly if you have any questions or need more details.</p>
      </div>

      <!-- Registries -->
      <div class="border-t border-dustypink/20 pt-10 mt-2 text-center">
         <h2 class="font-cursive text-3xl mb-3 text-[#9c6371] tracking-tight">Registry</h2>
         <p class="font-serif text-[1rem] leading-relaxed mb-6 text-[#b58f86] px-4">You can still view the registry below.</p>
         <div class="flex flex-col gap-4">
            <a href="https://www.target.com/gift-registry/gift-giver?registryId=4f4fdc20-3375-11f1-a704-51e6a3692535&type=BABY" target="_blank" class="px-6 py-4 bg-[#fdf6f7] border border-[#e8c8c8] text-[#8c5a4d] rounded-full font-sans font-bold text-sm tracking-widest hover:border-dustypink transition">TARGET</a>
            <a href="https://www.amazon.com/baby-reg/shantinique-baker-august-2026-northville/3H404WL9D0H5O" target="_blank" class="px-6 py-4 bg-[#fdf6f7] border border-[#e8c8c8] text-[#8c5a4d] rounded-full font-sans font-bold text-sm tracking-widest hover:border-dustypink transition">AMAZON</a>
         </div>
      </div>
    </div>
  </div>

  <script>
    // --- Dynamic Sky Generation ---
    function generateSky() {
      const sky = document.getElementById('sky');
      const cloudSvg = \`
      <svg viewBox="0 0 200 120" style="width: 100%; height: 100%; filter: drop-shadow(0 15px 15px rgba(0,0,0,0.05));">
        <defs>
          <linearGradient id="cloudGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#fff5f5" stop-opacity="0.3"/>
          </linearGradient>
        </defs>
        <path fill="url(#cloudGlow)" d="M 50 90 C 20 90 20 50 45 45 C 50 20 90 10 110 35 C 130 15 170 25 175 55 C 190 60 190 90 160 90 Z"/>
      </svg>\`;
      
      // Generate pleasing clouds
      for(let i=0; i<25; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'absolute pointer-events-none z-0';
        
        const width = 150 + Math.random() * 300; 
        const top = Math.random() < 0.65 ? Math.random() * 25 : Math.random() * 70; // denser near top 0-25vh
        const duration = 35 + Math.random() * 45; // 35s to 80s
        const delay = -Math.random() * 80;
        const opacity = (top < 25) ? 0.2 + Math.random() * 0.3 : 0.5 + Math.random() * 0.5; // more subtle/transparent near top
        const scaleX = Math.random() > 0.5 ? 1 : -1;
        
        cloud.innerHTML = cloudSvg;
        cloud.style.cssText = \`
          width: \${width}px; 
          top: \${top}vh; 
          left: \${Math.random() * 100}%; 
          animation: floatClouds \${duration}s ease-in-out \${delay}s infinite alternate; 
          opacity: \${opacity};
          --scale: \${scaleX};
        \`;
        sky.appendChild(cloud);
      }

      // Generate stars
      for(let i=0; i<30; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = 1 + Math.random() * 3;
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = 2 + Math.random() * 3;
        
        star.style.cssText = \`width:\${size}px; height:\${size}px; top:\${top}vh; left:\${left}%; animation-delay:\${delay}s; animation-duration:\${duration}s;\`;
        sky.appendChild(star);
      }
    }
    generateSky();
  </script>
</body>
</html>
`;

const CodeViewerBlock = ({
  title,
  code,
  language,
  onCopy,
}: {
  title: string;
  code: string;
  language: string;
  onCopy: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-xl w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-slate-800 px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-sky-400" />
          <span className="font-mono text-base font-medium text-slate-200">
            {title}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold rounded-md transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>
      <div
        className="p-4 overflow-y-auto text-base bg-slate-900"
        style={{ maxHeight: "70vh" }}
      >
        <pre className="font-mono text-slate-300 w-full overflow-x-auto m-0 p-0 text-sm leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 🔥 YOUR GOOGLE APPS SCRIPT WEB APP URL HERE 🔥
// Paste the URL inside the quotes below to ACTIVATE your app!
// Example: "https://script.google.com/macros/s/AKfycb.../exec"
// ----------------------------------------------------
const DEPLOYED_GAS_URL =
  "https://script.google.com/macros/s/AKfycbzrbV1CvUKkpA0DkluFGy7iC2gSR4oEef0rTjJ_2lPter6rZa2RloPHBrf59EdKX5GthQ/exec";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "preview" | "guide" | "code" | "html" | "sms"
  >("preview");

  // Intercepts google.script.run for the iframe preview to hit your API backend!
  const INJECTED_SCRIPT = `
  <script>
    window.google = {
      script: {
        run: {
          withSuccessHandler: function(cb) { this.successCb = cb; return this; },
          withFailureHandler: function(cb) { this.failureCb = cb; return this; },
          checkPhone: function(phone) {
            const successCb = this.successCb;
            const failureCb = this.failureCb;
            if ("${DEPLOYED_GAS_URL}" !== "") {
              // Real Backend Request
              fetch("${DEPLOYED_GAS_URL}?action=checkPhone&phone=" + encodeURIComponent(phone), { method: "GET", redirect: "follow" })
              .then(res => res.json())
              .then(data => {
                if(successCb) successCb(data);
              })
              .catch(err => {
                if(failureCb) failureCb(err);
              });
            } else {
              // Mock Logics
              setTimeout(() => {
                const cleaned = phone.replace(/\\D/g, '');
                if (cleaned === '5551234567') {
                  if(successCb) successCb({status: 'found', name: 'The Doe Family', maxGuests: 4});
                } else if (cleaned === '5559876543') { 
                  if(successCb) successCb({status: 'found', name: 'John Smith', maxGuests: 1, plusOneAllowed: true});
                } else {
                  if(successCb) successCb({status: 'not_found'});
                }
              }, 300);
            }
          },
          submitRSVP: function(data) {
            const successCb = this.successCb;
            const failureCb = this.failureCb;
            if ("${DEPLOYED_GAS_URL}" !== "") {
              // Real Backend Request
              fetch("${DEPLOYED_GAS_URL}?action=submitRSVP&data=" + encodeURIComponent(JSON.stringify(data)), { method: "GET", redirect: "follow" })
              .then(res => res.json())
              .then(resData => {
                if(successCb) successCb(resData);
              })
              .catch(err => {
                 if(failureCb) failureCb(err);
              });
            } else {
              setTimeout(() => {
                if(successCb) successCb({success: true});
              }, 300);
            }
          }
        }
      }
    };
  </script>
  `;

  const finalHTML = INDEX_HTML.replace("</head>", INJECTED_SCRIPT + "</head>");

  if (DEPLOYED_GAS_URL !== "" && !window.location.search.includes("setup")) {
    return (
      <div className="w-full h-screen overflow-hidden bg-white relative group">
        <iframe
          srcDoc={finalHTML}
          className="w-full h-full border-none absolute inset-0"
          title="Shanti & Shug's Baby Shower App"
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col items-center py-10 px-4 md:px-8">
      {/* Configuration Header Highlight */}
      <div className="max-w-4xl w-full bg-pink-50 border border-pink-200 rounded-2xl p-6 mb-8 text-center">
        <h2 className="text-xl font-bold text-pink-700 mb-2">
          Want to remove Google Sign-In and Banners?
        </h2>
        <p className="text-slate-700 mb-2">
          We updated the code to act as an invisible API! You no longer need to
          host the UI on Apps Script.
        </p>
        <p className="text-slate-700 font-medium">To activate:</p>
        <ol className="list-decimal list-inside text-slate-700 mt-2 text-left inline-block space-y-1">
          <li>
            Follow the Setup Guide to update your Code.gs on Google Apps Script
            and deploy as a Web App.
          </li>
          <li>
            Paste the deployment URL into the chat right here so I can embed it
            into this App.
          </li>
          <li>
            Share the AI Studio URL with your guests — totally clean, no sign-in
            required!
          </li>
        </ol>
      </div>

      {/* Header */}
      <header className="mb-8 text-center max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
          Shanti & Shug's Baby Shower Dashboard
        </h1>
        <p className="text-slate-600 text-lg">
          Your complete Google Apps Script project for managing RSVPs seamlessly
          from a Google Sheet.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
        {[
          { id: "preview", icon: Play, label: "App Preview" },
          { id: "guide", icon: BookOpen, label: "Setup Guide" },
          { id: "code", icon: FileCode2, label: "Code.gs" },
          { id: "html", icon: FileCode2, label: "Index.html" },
          { id: "sms", icon: Play, label: "Text Setup" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-pink-100 text-pink-700 shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <main className="w-full max-w-5xl flex justify-center flex-grow">
        <AnimatePresence mode="wait">
          {/* SMS TEXTING TAB */}
          {activeTab === "sms" && (
            <motion.div
              key="sms"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-2xl bg-white p-8 rounded-2xl border border-slate-200 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Text Capabilities (Twilio SMS)
              </h2>
              <p className="text-slate-600 mb-4">
                We've added server-side text capabilities! To make this work:
              </p>
              <ol className="list-decimal list-inside text-slate-600 space-y-2 mb-8">
                <li>
                  Go to the App settings and set your <b>TWILIO_ACCOUNT_SID</b>{" "}
                  and <b>TWILIO_AUTH_TOKEN</b> variables.
                </li>
                <li>
                  Set your <b>TWILIO_PHONE_NUMBER</b> variable to your Twilio
                  number (e.g. +1234567890).
                </li>
                <li>Restart the Server after setting variables.</li>
              </ol>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-4 text-center">
                  Test SMS Sender
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    id="sms-to"
                    placeholder="To: (e.g. +11234567890)"
                    className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-pink-500"
                  />
                  <textarea
                    id="sms-message"
                    rows={3}
                    placeholder="Message"
                    className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-pink-500"
                  >
                    Hi! Join us for Shanti & Shug's Baby Shower! RSVP Here:{" "}
                  </textarea>
                  <button
                    onClick={async () => {
                      const to = (
                        document.getElementById("sms-to") as HTMLInputElement
                      ).value;
                      const msg = (
                        document.getElementById(
                          "sms-message",
                        ) as HTMLTextAreaElement
                      ).value;
                      try {
                        const res = await fetch("/api/sms/send", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ to, message: msg }),
                        });
                        const data = await res.json();
                        if (data.success) alert("Sent successfully!");
                        else alert("Failed: " + data.error);
                      } catch (err) {
                        alert("Error: " + err);
                      }
                    }}
                    className="w-full py-3 bg-pink-100 hover:bg-pink-200 text-pink-800 font-bold tracking-widest text-base rounded-lg transition"
                  >
                    SEND TEST SMS
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PREVIEW TAB */}
          {activeTab === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex justify-center"
            >
              <div className="w-full max-w-3xl flex items-start gap-8">
                {/* Test Accounts Aside */}
                <div className="hidden md:block w-64 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-pink-500" /> Test
                    simulator
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">
                        Group (Max 4)
                      </p>
                      <p className="text-base font-mono bg-slate-100 p-2 rounded text-slate-700">
                        555-123-4567
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">
                        Single Guest (Max 1)
                      </p>
                      <p className="text-base font-mono bg-slate-100 p-2 rounded text-slate-700">
                        555-987-6543
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">
                        Not on list
                      </p>
                      <p className="text-base font-mono bg-slate-100 p-2 rounded text-slate-700">
                        Any other number
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Device Frame */}
                <div className="w-[375px] h-[750px] bg-white border-[8px] border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative mx-auto shrink-0 relative">
                  <iframe
                    title="App Preview"
                    srcDoc={finalHTML}
                    className="w-full h-full border-0 absolute inset-0"
                    sandbox="allow-scripts allow-forms allow-same-origin"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* SETUP GUIDE TAB */}
          {activeTab === "guide" && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-12 text-slate-700"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                How to Deploy Your RSVP Web App
              </h2>

              <ol className="space-y-8">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">
                      Create the Google Sheet
                    </h3>
                    <p className="mt-1">
                      Create a new Google Sheet and create exactly two tabs at
                      the bottom:
                    </p>
                    <ul className="mt-3 space-y-4">
                      <li className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-900 inline-block mb-2">
                          Tab 1: Whitelist
                        </span>
                        <p className="text-base text-slate-600 mb-2">
                          Set up row 1 as your headers:
                        </p>
                        <ul className="text-base list-disc list-inside text-slate-600 font-mono ml-2">
                          <li>Col A: Phone</li>
                          <li>
                            Col B: Name / Group Name (e.g. 'The Doe Family')
                          </li>
                          <li>Col C: Max Guests (Number, e.g. 1, 2, 4)</li>
                          <li>
                            Col D: PlusOneAllowed (Yes/No) - used if Max Guests
                            is 1
                          </li>
                        </ul>
                      </li>
                      <li className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-900 inline-block mb-2">
                          Tab 2: RSVPs
                        </span>
                        <p className="text-base text-slate-600 mb-2">
                          Set up row 1 as your headers:
                        </p>
                        <ul className="text-base list-disc list-inside text-slate-600 font-mono ml-2">
                          <li>Col A: Timestamp</li>
                          <li>Col B: Phone</li>
                          <li>Col C: Group Name</li>
                          <li>Col D: Attending</li>
                          <li>Col E: Specified Names (Optional)</li>
                          <li>Col F: Max Guests Given</li>
                          <li>Col G: Number Attending</li>
                        </ul>
                      </li>
                    </ul>

                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <Wand2 className="w-4 h-4" />
                        Using Sheets AI? Copy & Paste this prompt:
                      </h4>
                      <div className="bg-white p-3 rounded border border-blue-200 text-base text-slate-700 font-mono select-all whitespace-pre-wrap">
                        {`Please configure this Google Sheet for a Wedding RSVP system. Please start by deleting and overwriting any existing sheets and current structure. Also, please space the columns out nicely and wrap text so they are easy to read.

1. The "Whitelist" Sheet
Name the sheet tab exactly Whitelist. Enter the following headers in Row 1:
Column A: Phone
Column B: Name / Group Name (e.g. 'Jane Doe' or 'The Smith Family')
Column C: Max Guests (Number, e.g. 1, 2, 4)
Column D: Plus One Allowed (Enter Yes or No - this only applies if Max Guests is 1. For groups > 1, the app naturally scales by number).

2. The "RSVPs" Sheet
Name the second sheet tab exactly RSVPs. Enter the following headers in Row 1:
Column A: Timestamp
Column B: Phone
Column C: Guest Name
Column D: Attending
Column E: Specified Names (Optional — it'll specify if they use their plus one, e.g. "Plus One: John Smith")
Column F: Max Guests Given
Column G: Number Attending
Column H: Words of Wisdom

Freeze the top row on both tabs and make the headers bold.`}
                      </div>
                    </div>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">
                      Open Apps Script
                    </h3>
                    <p className="mt-1">
                      In your Google Sheet, click <b>Extensions</b> &gt;{" "}
                      <b>Apps Script</b>.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">
                      Paste the Code & Create Files
                    </h3>
                    <p className="mt-1">In the Apps Script editor:</p>
                    <ul className="mt-2 space-y-2 list-disc list-inside marker:text-pink-400 border border-slate-200 p-4 rounded-xl bg-slate-50">
                      <li>
                        Select the default <code>Code.gs</code> file, delete its
                        contents, and paste the code from the <b>Code.gs</b> tab
                        above.
                      </li>
                      <li>
                        Click the <b>+</b> button to add a new file, select{" "}
                        <b>HTML</b>, and name it exactly <code>Index</code>.
                        Paste the code from the <b>Index.html</b> tab into it.
                      </li>
                      <li>
                        <b>Optional Time Saver:</b> At the top of the editor,
                        select <code>setupSpreadsheet</code> from the function
                        dropdown next to the "Run" button, and click <b>Run</b>.
                        It will ask for permissions, accept them, and it will
                        instantly format and build the exact tabs for you!
                      </li>
                    </ul>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Deploy</h3>
                    <p className="mt-1 mb-3">
                      Click the bright blue <b>Deploy</b> button at the top
                      right, and choose <b>New deployment</b>.
                    </p>
                    <ul className="mt-2 space-y-2 text-base bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <li>
                        <ChevronRight className="w-4 h-4 inline text-pink-500" />{" "}
                        Click the gear icon next to "Select type" and choose{" "}
                        <b>Web app</b>.
                      </li>
                      <li>
                        <ChevronRight className="w-4 h-4 inline text-pink-500" />{" "}
                        <b>Execute as:</b> Me
                      </li>
                      <li>
                        <ChevronRight className="w-4 h-4 inline text-pink-500" />{" "}
                        <b>Who has access:</b> Anyone
                      </li>
                    </ul>
                    <p className="mt-3 text-base font-semibold bg-blue-50 text-blue-800 p-3 rounded border border-blue-200">
                      Note: You must authorize the script the very first time
                      you deploy!
                    </p>
                  </div>
                </li>
              </ol>
            </motion.div>
          )}

          {/* CODE GS TAB */}
          {activeTab === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex justify-center"
            >
              <CodeViewerBlock
                title="Code.gs"
                code={CODE_GS}
                language="javascript"
                onCopy={() => {}}
              />
            </motion.div>
          )}

          {/* HTML TAB */}
          {activeTab === "html" && (
            <motion.div
              key="html"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex justify-center"
            >
              <CodeViewerBlock
                title="Index.html"
                code={INDEX_HTML}
                language="html"
                onCopy={() => {}}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
