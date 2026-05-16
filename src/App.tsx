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
// Baby Shower RSVP - Server Side REST API

function doGet(e) {
  try {
    var action = e.parameter.action;
    
    if (!action) {
      // Serve the HTML UI when someone visits the link directly
      return HtmlService.createHtmlOutputFromFile('Index')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
        .setTitle('Baby Shower RSVP')
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
        <p class="font-sans text-sm font-bold tracking-widest uppercase text-dustypink text-center flex-shrink-0">Join us to celebrate</p>
        <span class="w-12 h-[1px] bg-dustypink"></span>
      </div>
      <h2 class="font-cursive text-[2.5rem] leading-none text-[#9c6371] mt-6 text-center drop-shadow-sm whitespace-nowrap relative z-40">Shanti & Shug</h2>
    </div>

    <!-- INITIAL ENVELOPE INTRO -->
    <div class="envelope-wrapper" id="envelope-stage">
      <div class="envelope cursor-pointer" id="envelope" onclick="openEnvelopeFlap()">
        <div class="top-flap-wrapper">
          <div class="flap top-flap"></div>
          <div class="wax-seal">S&S</div>
        </div>
        <div class="envelope-left-wrapper"><div class="envelope-left"></div></div>
        <div class="envelope-right-wrapper"><div class="envelope-right"></div></div>
        <div class="envelope-bottom-wrapper">
          <div class="envelope-bottom"></div>
        </div>
        <div class="absolute bottom-6 left-0 right-0 z-[7] flex justify-center pointer-events-none">
          <p class="font-sans text-sm tracking-widest text-[#a87b70] uppercase opacity-70">Tap to open</p>
        </div>
        
        <div class="magic-invite-card" onclick="event.stopPropagation()">
          <p class="font-serif italic text-[28px] text-[#8c5a4d] mb-2 mt-0">you're invited</p>
          <input type="tel" id="intro-phone" placeholder="(555) 123-4567" maxlength="14" oninput="formatPhone(this)" class="w-[85%] text-center py-2 px-2 border-b border-dustypink/30 font-serif text-xl focus:outline-none focus:border-dustypink transition bg-transparent mb-1 mt-2">
          <div id="intro-phone-error" class="hidden text-sm font-sans tracking-wide text-red-500 mt-1 text-center">Please enter 10 digits</div>
          <button id="unlock-btn" onclick="checkGuestList()" class="shimmer-btn w-[85%] py-3 rounded font-sans font-bold text-sm tracking-widest uppercase mt-4 shadow-sm bg-[#f5e0d8] text-[#a87b70] opacity-90 border-none transition-all duration-300">Unlock Invitation</button>
          <p class="font-sans text-sm uppercase tracking-widest text-[#c2a39d] mt-3">RSVP by June 7</p>
        </div>
      </div>
    </div>

    <!-- MAIN RSVP FORM (Hidden initially) -->
    <div class="main-form-card" id="rsvp-stage">
      
      <!-- LOADING STATE -->
      <div id="view-loading" class="step-container py-12">
        <div class="flex flex-col items-center">
          <div class="spinner"></div>
          <p class="font-sans text-sm font-bold tracking-widest mt-8 text-dustypink animate-pulse">FINDING YOUR INVITATION...</p>
        </div>
      </div>

      <!-- SUCCESS / DENIED / ALREADY -->
      <div id="view-denied" class="step-container text-center py-8">
        <h3 class="font-cursive text-5xl mb-4 text-[#9c6371]">Oh dear...</h3>
        <p class="font-serif italic text-xl mb-8">We couldn't find your number on our guest list. Please reach out to the host!</p>
        <button onclick="resetFlow()" class="px-8 py-3 border border-dustypink text-dustypink rounded-full font-sans font-bold text-sm tracking-widest hover:bg-dustypink hover:text-white transition">TRY AGAIN</button>
      </div>

      <div id="view-already" class="step-container text-center py-8">
        <h3 class="font-cursive text-5xl mb-4 text-[#9c6371]">Already RSVP'd</h3>
        <p class="font-serif italic text-xl mb-4">You have already submitted an RSVP for this heavenly occasion.</p>
      </div>

      <div id="view-success" class="step-container text-center py-10">
        <h3 class="font-cursive text-6xl mb-4 text-[#9c6371] drop-shadow-sm">Thank You!</h3>
        <p class="font-serif italic text-xl mb-4">Your response has been securely recorded.</p>
        <p class="text-base uppercase tracking-widest font-sans text-dustypink mt-8">See you there!</p>
      </div>

      <!-- RSVP FORM -->
      <div id="view-rsvp" class="step-container">
        <div class="text-center mb-6">
          <p class="font-sans text-sm uppercase tracking-widest text-[#9c6371] font-semibold opacity-70 mb-1">Welcome</p>
          <h3 id="welcome-message" class="font-cursive text-[2.5rem] leading-none text-[#9c6371]"></h3>
        </div>

        <input type="hidden" id="guest-name">
        <input type="hidden" id="attending">

        <!-- Progress Indicator -->
        <div class="flex justify-center gap-2 mb-8" id="dots">
           <div class="w-8 h-1 bg-dustypink/30 rounded-full transition-all duration-300" id="dot-1"></div>
           <div class="w-8 h-1 bg-dustypink/30 rounded-full transition-all duration-300" id="dot-2"></div>
           <div class="w-8 h-1 bg-dustypink/30 rounded-full transition-all duration-300" id="dot-3"></div>
        </div>

        <!-- RSVP STEP 1 -->
        <div id="step-1" class="hidden">
          <label class="font-sans text-sm font-bold tracking-widest uppercase text-dustypink block text-center mb-6">Will you be attending?</label>
          <div class="grid grid-cols-1 gap-4">
            <div class="option-card p-6 rounded-2xl text-center cursor-pointer shadow-sm" onclick="selectAttending('Yes')">
              <span class="block text-3xl mb-3">🕊️</span>
              <span class="font-serif text-lg font-bold text-[#8c5a4d]">Joyfully Accept</span>
            </div>
            <div class="option-card p-6 rounded-2xl text-center cursor-pointer shadow-sm" onclick="selectAttending('No')">
              <span class="block text-3xl mb-3">💌</span>
              <span class="font-serif text-lg font-bold text-[#8c5a4d]">Regretfully Decline</span>
            </div>
          </div>
          <div id="attending-error" class="hidden text-center text-sm font-sans tracking-wide text-red-400 mt-4">Please let us know if you'll attend.</div>
          <button onclick="nextStep(2)" class="shimmer-btn w-full py-4 rounded-full font-sans font-bold text-base tracking-widest uppercase mt-8 hidden transition-all duration-500 opacity-0 translate-y-4" id="btn-next-1">Continue</button>
        </div>

        <!-- RSVP STEP 2: DETAILS -->
        <div id="step-2" class="hidden space-y-6">
          <div id="group-questions" class="hidden space-y-4">
            <label class="font-sans text-sm font-bold tracking-[0.15em] uppercase text-dustypink block">Are all invitees attending?</label>
            <div class="flex gap-4">
               <button class="flex-1 py-3 border border-dustypink/30 rounded-xl font-serif text-lg text-[#a87b70] hover:bg-dustypink/10 transition group-btn" onclick="selectGroupAttending('Yes', this)">Yes, all!</button>
               <button class="flex-1 py-3 border border-dustypink/30 rounded-xl font-serif text-lg text-[#a87b70] hover:bg-dustypink/10 transition group-btn" onclick="selectGroupAttending('No', this)">Only some</button>
            </div>
            <input type="hidden" id="all-attending">
            <div id="all-attending-error" class="hidden text-sm font-sans tracking-wide text-red-400">Please choose an option.</div>
          </div>

          <div id="number-attending-group" class="hidden space-y-2">
            <label class="font-sans text-sm font-bold tracking-[0.15em] uppercase text-dustypink block">How many are attending?</label>
            <select id="number-attending" class="w-full p-4 rounded-xl border border-dustypink/30 text-[#8c5a4d] focus:border-dustypink focus:outline-none focus:ring-1 focus:ring-dustypink/50 bg-white shadow-inner"></select>
            <div id="number-attending-error" class="hidden text-sm font-sans tracking-wide text-red-400">Please select number.</div>
          </div>

          <div id="guest-names-group" class="hidden space-y-2">
            <label id="guest-names-label" class="font-sans text-sm font-bold tracking-[0.15em] uppercase text-dustypink block">Names of those attending (Optional)</label>
            <input type="text" id="guest-names-list" placeholder="e.g. John, Jane" class="w-full p-4 rounded-xl border border-dustypink/30 text-[#8c5a4d] focus:border-dustypink focus:outline-none focus:ring-1 focus:ring-dustypink/50 bg-white shadow-inner">
            <div id="guest-names-error" class="hidden text-sm font-sans tracking-wide text-red-400">Please enter exactly N names.</div>
          </div>

          <!-- Plus One Logic -->
          <div id="plus-one-group" class="hidden space-y-4">
            <label class="font-sans text-sm font-bold tracking-[0.15em] uppercase text-dustypink block">Bringing a plus one?</label>
            <div class="flex gap-4">
               <button class="flex-1 py-3 border border-dustypink/30 rounded-xl font-serif text-lg text-[#a87b70] hover:bg-dustypink/10 transition po-btn" onclick="selectPlusOne('Yes', this)">Yes</button>
               <button class="flex-1 py-3 border border-dustypink/30 rounded-xl font-serif text-lg text-[#a87b70] hover:bg-dustypink/10 transition po-btn" onclick="selectPlusOne('No', this)">No</button>
            </div>
            <input type="hidden" id="bringing-plus-one">
            <div id="bringing-plus-one-error" class="hidden text-sm font-sans tracking-wide text-red-400">Please choose an option.</div>
          </div>

          <div id="plus-one-name-group" class="hidden space-y-2 transition-all duration-300 transform">
            <label class="font-sans text-sm font-bold tracking-[0.15em] uppercase text-dustypink block">Plus One's Name</label>
            <input type="text" id="plus-one-name" placeholder="Guest Name" class="w-full p-4 rounded-xl border border-dustypink/30 text-[#8c5a4d] focus:border-dustypink focus:outline-none focus:ring-1 focus:ring-dustypink/50 bg-white shadow-inner">
            <div id="plus-one-error" class="hidden text-sm font-sans tracking-wide text-red-400">Please provide their name.</div>
          </div>

          <div class="flex gap-4 pt-6">
            <button onclick="prevStep(1)" class="w-1/3 py-4 border border-dustypink bg-transparent text-dustypink rounded-full font-sans font-bold text-sm tracking-widest uppercase hover:bg-dustypink/10 transition">BACK</button>
            <button onclick="nextStep(3)" class="shimmer-btn w-2/3 py-4 rounded-full font-sans font-bold text-sm tracking-widest uppercase shadow-glow">Continue</button>
          </div>
        </div>

        <!-- RSVP STEP 3: WORDS OF WISDOM -->
        <div id="step-3" class="hidden space-y-6">
          <div class="text-center">
            <h4 class="font-cursive text-4xl mb-4 text-[#9c6371]">Words of Wisdom</h4>
            <p class="font-serif italic text-base text-[#b58f86] mb-6">Leave a quick note for the parents-to-be! (Optional)</p>
            <textarea id="words-of-wisdom" rows="4" placeholder="Wishing you all the best..." class="w-full p-4 rounded-xl border border-dustypink/30 text-[#8c5a4d] focus:border-dustypink focus:outline-none focus:ring-1 focus:ring-dustypink/50 bg-white shadow-inner"></textarea>
          </div>

          <div class="flex gap-4 pt-4">
            <button onclick="prevStep(2)" id="btn-back-3" class="w-1/3 py-4 border border-dustypink bg-transparent text-dustypink rounded-full font-sans font-bold text-sm tracking-widest uppercase hover:bg-dustypink/10 transition">BACK</button>
            <button onclick="submitRSVP()" class="shimmer-btn w-2/3 py-4 rounded-full font-sans font-bold text-sm tracking-widest uppercase shadow-glow">Submit RSVP</button>
          </div>
        </div>

        <!-- DECLINE STEP -->
        <div id="step-decline" class="hidden space-y-6 text-center py-6">
          <p class="font-serif italic text-2xl mb-8">We will miss you dearly!</p>
          <div class="text-left mb-6">
            <label class="font-sans text-sm font-bold tracking-[0.15em] uppercase text-dustypink block">Words of Wisdom (Optional)</label>
            <textarea id="words-of-wisdom-decline" rows="3" placeholder="Leave a note for the parents-to-be..." class="mt-2 w-full p-4 rounded-xl border border-dustypink/30 text-[#8c5a4d] focus:border-dustypink focus:outline-none focus:ring-1 focus:ring-dustypink/50 bg-white shadow-inner"></textarea>
          </div>
          <div class="flex gap-4">
            <button onclick="prevStep(1)" class="w-1/3 py-4 border border-dustypink bg-transparent text-dustypink rounded-full font-sans font-bold text-sm tracking-widest uppercase hover:bg-dustypink/10 transition">BACK</button>
            <button onclick="submitRSVP()" class="shimmer-btn w-2/3 py-4 rounded-full font-sans font-bold text-sm tracking-widest uppercase shadow-glow">Confirm</button>
          </div>
        </div>
      </div>
    </div>

      <!-- EVENT DETAILS SCROLL REVEAL -->
    <div id="event-details" class="main-form-card mt-12 relative" style="display: none; opacity: 1; transform: none; top: 0; pointer-events: auto;">
      
      <div class="flex flex-col items-center justify-center mb-8">
        <div class="flex items-center justify-center gap-4">
          <span class="w-12 h-[1px] bg-dustypink/50"></span>
          <span class="font-cursive text-5xl text-[#9c6371]">June 21</span>
          <span class="w-12 h-[1px] bg-dustypink/50"></span>
        </div>
        <span class="font-sans font-bold tracking-widest uppercase text-dustypink text-base mt-3">4 - 8 PM</span>
        <span class="font-sans font-bold tracking-[0.15em] uppercase text-[#c2a39d] text-sm mt-2 border border-[#e8c8c8] px-3 py-1 rounded-full">RSVP by June 7</span>
      </div>

      <div class="text-center mb-10">
        <p class="font-sans tracking-[0.15em] uppercase font-bold text-dustypink/80 text-sm mb-3">Location</p>
        <p class="font-serif text-[1.6rem] text-[#8c5a4d] leading-snug mb-1 px-4">27494 Grand River Ave</p>
        <p class="font-serif italic text-lg text-[#a87b70]">Livonia, MI 48152</p>
      </div>

      <div class="flex flex-col gap-4 mb-10">
          <a href="https://maps.google.com/?q=27494+GRAND+RIVER+AVE,+LIVONIA+MI+48152" target="_blank" class="w-full flex items-center justify-center gap-2 text-center shimmer-btn py-4 rounded-full font-sans font-bold text-sm tracking-widest shadow-glow">📍 DIRECTIONS</a>
          <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Shanti+%26+Shug%27s+Baby+Shower&dates=20260621T200000Z/20260622T000000Z" target="_blank" class="w-full flex items-center justify-center gap-2 text-center bg-white text-dustypink border border-dustypink/50 py-4 rounded-full font-sans font-bold text-sm tracking-widest hover:bg-dustypink/5 transition">📅 CALENDAR</a>
      </div>

      <!-- Countdown -->
      <div class="border-t border-dustypink/20 pt-10 pb-4">
         <h2 class="font-cursive text-4xl mb-6 text-center text-[#9c6371] tracking-tight">The Countdown</h2>
         <div class="grid grid-cols-4 gap-2 font-sans max-w-sm mx-auto text-center">
            <div class="flex flex-col"><span id="days" class="text-4xl text-dustypink font-light">00</span><span class="text-sm mt-1 font-bold tracking-widest uppercase text-dustypink/70">Days</span></div>
            <div class="flex flex-col"><span id="hours" class="text-4xl text-dustypink font-light">00</span><span class="text-sm mt-1 font-bold tracking-widest uppercase text-dustypink/70">Hrs</span></div>
            <div class="flex flex-col"><span id="minutes" class="text-4xl text-dustypink font-light">00</span><span class="text-sm mt-1 font-bold tracking-widest uppercase text-dustypink/70">Mins</span></div>
            <div class="flex flex-col"><span id="seconds" class="text-4xl text-dustypink font-light">00</span><span class="text-sm mt-1 font-bold tracking-widest uppercase text-dustypink/70">Secs</span></div>
         </div>
      </div>

      <!-- Registries & Books -->
      <div class="border-t border-dustypink/20 pt-10 mt-6 grid grid-cols-1 gap-10 text-center">
         <div>
           <h2 class="font-cursive text-3xl mb-3 text-[#9c6371] tracking-tight">Registry</h2>
           <p class="font-serif text-[1rem] leading-relaxed mb-6 text-[#b58f86] px-4">Help them find their perfect gift.</p>
           <div class="flex flex-col gap-4">
              <a href="https://www.target.com/gift-registry/gift-giver?registryId=4f4fdc20-3375-11f1-a704-51e6a3692535&type=BABY" target="_blank" class="px-6 py-4 bg-[#fdf6f7] border border-[#e8c8c8] text-[#8c5a4d] rounded-full font-sans font-bold text-sm tracking-widest hover:border-dustypink transition">TARGET</a>
              <a href="https://www.amazon.com/baby-reg/shantinique-baker-august-2026-northville/3H404WL9D0H5O" target="_blank" class="px-6 py-4 bg-[#fdf6f7] border border-[#e8c8c8] text-[#8c5a4d] rounded-full font-sans font-bold text-sm tracking-widest hover:border-dustypink transition">AMAZON</a>
           </div>
         </div>
         <div class="border-t border-dustypink/20 pt-10 pl-0">
           <h2 class="font-cursive text-3xl mb-3 text-[#9c6371] tracking-tight">Books for Baby</h2>
           <p class="font-serif text-[1rem] leading-relaxed text-[#b58f86] px-2">
            Instead of a card, we have a sweet request: bring a book for baby — it truly is the best.
            A tiny note inside is something we'll never lose.
           </p>
         </div>
      </div>
    </div>
  </div>

  <script>
    let currentGuest = null;
    let currentStep = 1;

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

    // --- Countdown ---
    function startCountdown() {
      const target = new Date("June 21, 2026 16:00:00").getTime();
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const dist = target - now;
        if(dist < 0) {
          clearInterval(interval);
          return;
        }
        document.getElementById('days').innerText = String(Math.floor(dist / (1000 * 60 * 60 * 24))).padStart(2, '0');
        document.getElementById('hours').innerText = String(Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        document.getElementById('minutes').innerText = String(Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        document.getElementById('seconds').innerText = String(Math.floor((dist % (1000 * 60)) / 1000)).padStart(2, '0');
      }, 1000);
    }
    startCountdown();

    // --- Phone Formatter ---
    function formatPhone(input) {
      let val = input.value.replace(/\\D/g, '');
      if (val.length > 10) val = val.substring(0, 10);
      let formatted = val;
      if (val.length > 3 && val.length <= 6) {
        formatted = val.replace(/^(\\d{3})(\\d+)/, '($1) $2');
      } else if (val.length > 6) {
        formatted = val.replace(/^(\\d{3})(\\d{3})(\\d+)/, '($1) $2-$3');
      }
      input.value = formatted;
      
      const btn = document.getElementById('unlock-btn');
      if (val.length === 10) {
        btn.className = "shimmer-btn w-[85%] py-3 rounded font-sans font-bold text-sm tracking-widest uppercase mt-4 shadow-xl bg-[#9c6371] text-white border-none transition-all duration-300 transform hover:scale-[1.02] active:scale-95";
        btn.innerHTML = "Open Envelope";
      } else {
        btn.className = "shimmer-btn w-[85%] py-3 rounded font-sans font-bold text-sm tracking-widest uppercase mt-4 shadow-sm bg-[#f5e0d8] text-[#a87b70] opacity-90 border-none transition-all duration-300";
        btn.innerHTML = "Unlock Invitation";
      }
    }

    // --- Core Animations & Views ---
    function switchActive(selector, idToShow) {
      document.querySelectorAll(selector).forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
      });
      const tgt = document.getElementById(idToShow);
      if(tgt) {
        tgt.classList.remove('hidden');
        // Force reflow for animation
        void tgt.offsetWidth;
        tgt.classList.add('active');
      }
    }

    function openEnvelopeFlap() {
      // Envelope opens!
      const env = document.getElementById('envelope');
      env.classList.add('open');
      
      // Focus on the input after animation
      setTimeout(() => {
        const input = document.getElementById('intro-phone');
        if (input) input.focus();
      }, 1000);
    }

    function checkGuestList() {
      const inputEl = document.getElementById('intro-phone');
      const p = inputEl.value.replace(/\\D/g, '');
      if(p.length < 10) {
        document.getElementById('intro-phone-error').classList.remove('hidden');
        return;
      }
      document.getElementById('intro-phone-error').classList.add('hidden');
      
      // Wait for envelope card to slide up before hiding it and showing RSVP system
      document.getElementById('envelope-stage').style.transition = "opacity 0.3s ease";
      document.getElementById('envelope-stage').style.opacity = '0';

      setTimeout(() => {
        document.getElementById('envelope-stage').style.display = 'none';
        document.getElementById('rsvp-stage').classList.add('visible');
        
        // Show loading inside main UI
        switchActive('#rsvp-stage > div', 'view-loading');
        
        // Fire GAS API
        google.script.run
          .withSuccessHandler((res) => handlePhoneFound(res, p))
          .withFailureHandler(handleError)
          .checkPhone(p);

      }, 300); 
    }

    function resetFlow() {
      document.getElementById('event-details').style.display = 'none';
      document.getElementById('rsvp-stage').classList.remove('visible');
      const env = document.getElementById('envelope');
      document.getElementById('intro-phone').value = '';
      env.classList.remove('open');
      const envStage = document.getElementById('envelope-stage');
      envStage.style.display = 'block';
      setTimeout(() => {
        envStage.style.opacity = '1';
      }, 50);
    }

    // --- RSVP Logic ---
    function handlePhoneFound(response, normalizedPhoneInput) {
      if (response.status === 'found') {
        const isPlusOne = response.plusOneAllowed === true || String(response.plusOneAllowed).toLowerCase().trim() === 'true' || String(response.plusOneAllowed).toLowerCase().trim() === 'yes';

        currentGuest = {
          phone: normalizedPhoneInput,
          name: response.name,
          maxGuests: parseInt(response.maxGuests, 10) || 1,
          plusOne: isPlusOne
        };
        
        document.getElementById('welcome-message').innerText = response.name;
        document.getElementById('guest-name').value = response.name;
        
        currentStep = 1;
        switchActive('#rsvp-stage > div', 'view-rsvp');
        switchActive('#view-rsvp > div[id^="step-"]', 'step-1');
        updateDots();

        // Reset forms
        document.querySelectorAll('.option-card').forEach(el => el.classList.remove('selected'));
        document.getElementById('attending').value = '';
        const btnNext = document.getElementById('btn-next-1');
        btnNext.classList.add('hidden');
        btnNext.classList.remove('opacity-100', 'translate-y-0');

        const numSelect = document.getElementById('number-attending');
        numSelect.innerHTML = '<option value="">-- Select Number --</option>';
        for(let i = 1; i <= currentGuest.maxGuests; i++) {
           numSelect.innerHTML += '<option value="' + i + '">' + i + '</option>';
        }
        document.getElementById('event-details').style.display = 'block';
      } else if (response.status === 'already') {
        switchActive('#rsvp-stage > div', 'view-already');
        document.getElementById('event-details').style.display = 'block';
      } else if (response.status === 'error') {
        alert("Server Error: " + response.message);
        resetFlow();
      } else {
        switchActive('#rsvp-stage > div', 'view-denied');
      }
    }

    function updateDots() {
      [1, 2, 3].forEach(i => {
        const dot = document.getElementById('dot-' + i);
        if(dot) dot.style.background = (i <= currentStep) ? '#D69A9A' : 'rgba(214,154,154,0.3)';
      });
    }

    function selectAttending(val) {
      document.getElementById('attending').value = val;
      const cards = document.querySelectorAll('#step-1 .option-card');
      cards[0].classList.toggle('selected', val === 'Yes');
      cards[1].classList.toggle('selected', val === 'No');
      document.getElementById('attending-error').classList.add('hidden');
      
      document.getElementById('all-attending').value = '';
      document.getElementById('bringing-plus-one').value = '';

      const btn = document.getElementById('btn-next-1');
      btn.classList.remove('hidden');
      setTimeout(() => btn.classList.add('opacity-100', 'translate-y-0'), 10);

      if(val === 'Yes') {
         if (currentGuest.maxGuests === 1 && !currentGuest.plusOne) {
            btn.innerText = "Continue";
            btn.onclick = function() {
               document.getElementById('btn-back-3').onclick = function() { prevStep(1); };
               nextStep(3);
            };
         } else {
            btn.innerText = "Continue";
            btn.onclick = function() {
               document.getElementById('btn-back-3').onclick = function() { prevStep(2); };
               nextStep(2);
            };
            toggleGroupOptions();
         }
      } else {
         btn.innerText = "Continue";
         btn.onclick = function() { nextStep(2); };
      }
    }

    function toggleGroupOptions() {
      const grpQ = document.getElementById('group-questions');
      const numGrp = document.getElementById('number-attending-group');
      const nameGrp = document.getElementById('guest-names-group');
      const poGrp = document.getElementById('plus-one-group');
      const poNameGrp = document.getElementById('plus-one-name-group');

      if (currentGuest.maxGuests > 1) {
        grpQ.classList.remove('hidden');
        nameGrp.classList.remove('hidden');
        poGrp.classList.add('hidden');
        poNameGrp.classList.add('hidden');
      } else if (currentGuest.maxGuests === 1 && currentGuest.plusOne) {
        grpQ.classList.add('hidden');
        numGrp.classList.add('hidden');
        nameGrp.classList.add('hidden');
        poGrp.classList.remove('hidden');
        poNameGrp.classList.add('hidden');
        document.getElementById('bringing-plus-one').value = '';
        
        document.querySelectorAll('.po-btn').forEach(b => {
          b.style.background = ''; b.style.color = ''; b.style.borderColor = '';
        });
      } else {
        grpQ.classList.add('hidden');
        numGrp.classList.add('hidden');
        nameGrp.classList.add('hidden');
        poGrp.classList.add('hidden');
        poNameGrp.classList.add('hidden');
      }
    }

    function selectGroupAttending(val, btn) {
      document.getElementById('all-attending').value = val;
      document.querySelectorAll('.group-btn').forEach(b => {
         b.style.background = ''; b.style.color = ''; b.style.borderColor = '';
      });
      btn.style.background = 'rgba(214,154,154,0.1)'; 
      btn.style.color = '#D69A9A';
      btn.style.borderColor = '#D69A9A';
      
      const numGrp = document.getElementById('number-attending-group');
      const nameLabel = document.getElementById('guest-names-label');
      if (val === 'No') {
        numGrp.classList.remove('hidden');
        if (nameLabel) nameLabel.innerText = 'Names of those attending (Required)';
      } else {
        numGrp.classList.add('hidden');
        document.getElementById('number-attending').value = '';
        if (nameLabel) nameLabel.innerText = 'Names of those attending (Optional)';
        document.getElementById('guest-names-error').classList.add('hidden');
      }
      document.getElementById('all-attending-error').classList.add('hidden');
    }

    function selectPlusOne(val, btn) {
      document.getElementById('bringing-plus-one').value = val;
      document.querySelectorAll('.po-btn').forEach(b => {
         b.style.background = ''; b.style.color = ''; b.style.borderColor = '';
      });
      btn.style.background = 'rgba(214,154,154,0.1)'; 
      btn.style.color = '#D69A9A';
      btn.style.borderColor = '#D69A9A';
      
      const poNameGrp = document.getElementById('plus-one-name-group');
      if (val === 'Yes') {
        poNameGrp.classList.remove('hidden');
      } else {
        poNameGrp.classList.add('hidden');
        document.getElementById('plus-one-name').value = '';
      }
      document.getElementById('bringing-plus-one-error').classList.add('hidden');
    }

    function validateStep2() {
      if (currentGuest.maxGuests > 1) {
        const allAttending = document.getElementById('all-attending').value;
        if (!allAttending) {
          document.getElementById('all-attending-error').classList.remove('hidden');
          return false;
        }
        if (allAttending === 'No') {
           const specNum = parseInt(document.getElementById('number-attending').value, 10);
           if (!specNum || isNaN(specNum)) {
             document.getElementById('number-attending-error').classList.remove('hidden');
             return false;
           }
           document.getElementById('number-attending-error').classList.add('hidden');
           
           const namesText = document.getElementById('guest-names-list').value;
           const names = namesText.split(/,|\\band\\b|&/i).map(s => s.trim()).filter(s => s.length > 0);
           if (names.length !== specNum) {
               const errorEl = document.getElementById('guest-names-error');
               errorEl.innerText = "Please enter exactly " + specNum + " name" + (specNum > 1 ? "s" : "") + " (separated by commas or &).";
               errorEl.classList.remove('hidden');
               return false;
           } else {
               document.getElementById('guest-names-error').classList.add('hidden');
           }
        }
      } else if (currentGuest.maxGuests === 1 && currentGuest.plusOne) {
        const bringingPlusOne = document.getElementById('bringing-plus-one').value;
        if (!bringingPlusOne) {
          document.getElementById('bringing-plus-one-error').classList.remove('hidden');
          return false;
        }
        if (bringingPlusOne === 'Yes') {
           const poName = document.getElementById('plus-one-name').value;
           if (!poName || poName.trim() === '') {
             document.getElementById('plus-one-error').classList.remove('hidden');
             return false;
           }
        }
      }
      return true;
    }

    function nextStep(step) {
      const attending = document.getElementById('attending').value;
      if (!attending && (step === 2 || step === 3)) {
         document.getElementById('attending-error').classList.remove('hidden');
         return;
      }
      
      if (attending === 'No') {
         document.getElementById('dots').classList.add('hidden');
         switchActive('#view-rsvp > div[id^="step-"]', 'step-decline');
         return;
      }

      if (step === 3 && (currentGuest.maxGuests > 1 || currentGuest.plusOne)) {
         if (!validateStep2()) return;
      }

      currentStep = step;
      document.getElementById('dots').classList.remove('hidden');
      switchActive('#view-rsvp > div[id^="step-"]', 'step-' + step);
      updateDots();
    }

    function prevStep(step) {
      document.getElementById('dots').classList.remove('hidden');
      currentStep = step;
      
      if(step === 1) {
         switchActive('#view-rsvp > div[id^="step-"]', 'step-1');
      } else if (step === 2) {
         if(currentGuest.maxGuests === 1 && !currentGuest.plusOne) {
            currentStep = 1;
            switchActive('#view-rsvp > div[id^="step-"]', 'step-1');
         } else {
            switchActive('#view-rsvp > div[id^="step-"]', 'step-2');
         }
      }
      updateDots();
    }

    function submitRSVP() {
      const attending = document.getElementById('attending').value;
      if (!attending) return;

      if (attending === 'Yes') {
         if (currentGuest.maxGuests === 1 && !currentGuest.plusOne) {
            // Check step 1 only
         } else if (!validateStep2()) {
            return;
         }
      }

      let numAttending = attending === 'Yes' ? 1 : 0;
      let finalSpecifiedNames = '';

      if (attending === 'Yes') {
         if (currentGuest.maxGuests > 1) {
           const allAttending = document.getElementById('all-attending').value;
           if (allAttending === 'Yes') {
              numAttending = currentGuest.maxGuests;
           } else {
              numAttending = parseInt(document.getElementById('number-attending').value, 10);
           }
           finalSpecifiedNames = document.getElementById('guest-names-list').value;
         } else if (currentGuest.maxGuests === 1 && currentGuest.plusOne) {
           const bringingPlusOne = document.getElementById('bringing-plus-one').value;
           if (bringingPlusOne === 'Yes') {
              numAttending = 2;
              const poName = document.getElementById('plus-one-name').value;
              finalSpecifiedNames = "Plus One: " + poName;
           }
         }
      }

      let wordsOfWisdom = attending === 'Yes' ? document.getElementById('words-of-wisdom').value : document.getElementById('words-of-wisdom-decline').value;

      const data = {
        phone: currentGuest.phone,
        guestName: document.getElementById('guest-name').value,
        attending: attending,
        specifiedNames: finalSpecifiedNames,
        numberAttending: numAttending,
        maxGuests: currentGuest.maxGuests,
        wordsOfWisdom: wordsOfWisdom
      };

      switchActive('#rsvp-stage > div', 'view-loading');
      
      google.script.run
        .withSuccessHandler(function(res) { 
           if(res && res.success) {
             switchActive('#rsvp-stage > div', 'view-success');
             fireConfetti();
           } else {
             alert("Error saving: " + (res.message || 'Unknown error'));
             resetFlow();
           }
        })
        .withFailureHandler(handleError)
        .submitRSVP(data);
    }

    function fireConfetti() {
      if(typeof confetti !== 'undefined') {
        const count = 300;
        const defaults = { origin: { y: 0.8 }, colors: ['#D69A9A', '#ffffff', '#ebd1d5', '#9c6371'] };
        function fire(particleRatio, opts) {
          confetti(Object.assign({}, defaults, opts, { particleCount: Math.floor(count * particleRatio) }));
        }
        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      }
    }

    function handleError(error) {
      alert('A connection error occurred. Please try again.');
      resetFlow();
    }
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
  "https://script.google.com/macros/s/AKfycbwXzcQYNlnBXD8Efkp1i9wwU10cLXQzVX2vHPxJSgCpbBoCxGJkXoH0Ji65UIe8S-HJpg/exec";

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
      <div className="w-full h-screen overflow-hidden bg-white relative">
        <iframe
          srcDoc={finalHTML}
          className="w-full h-full border-none absolute inset-0"
          title="Baby Shower RSVP App"
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
          Baby Shower RSVP Dashboard
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
