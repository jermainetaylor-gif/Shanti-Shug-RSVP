const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');
const newHtml = `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
          },
          fontFamily: {
            cursive: ['"Great Vibes"', 'cursive'],
            serif: ['"Cormorant Garamond"', 'serif'],
            sans: ['"Montserrat"', 'sans-serif'],
          },
          boxShadow: {
            'glow': '0 0 40px rgba(214, 154, 154, 0.4)',
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: #fdf6f7;
      background-image: url('https://www.transparenttextures.com/patterns/cream-paper.png');
      overflow-x: hidden;
    }
    /* Parallax Clouds & Elements */
    .parallax-layer {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 0;
      transition: transform 0.5s ease-out;
    }
    .cloud {
      position: absolute; fill: white; opacity: 0.8;
      animation: float 30s linear infinite;
    }
    @keyframes float {
      0% { transform: translateX(-200px); }
      100% { transform: translateX(120vw); }
    }
    
    .envelope-container {
      position: relative;
      background: white;
      border-radius: 8px;
      padding: 40px 20px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      border-top: 10px solid #D69A9A;
      overflow: hidden;
      transition: all 0.5s ease;
    }
    .envelope-sleeve {
      position: absolute;
      bottom: 0; left: 0; width: 100%; height: 40%;
      background: linear-gradient(to bottom, transparent, rgba(214,154,154,0.1));
      pointer-events: none;
    }
    .paper-slide-up {
      animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }
    .paper-slide-down {
      animation: slideDown 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }
    @keyframes slideUp {
      0% { transform: translateY(50px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideDown {
      0% { transform: translateY(-50px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    
    .shimmer-btn {
      position: relative;
      overflow: hidden;
      background: #D69A9A;
      color: white;
      transition: all 0.3s ease;
    }
    .shimmer-btn:hover {
      background: #c28888;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(214,154,154,0.4);
    }
    .shimmer-btn::after {
      content: '';
      position: absolute;
      top: 0; right: 100%; bottom: 0; left: -100%;
      background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
      animation: shimmer 3s infinite;
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      50%, 100% { transform: translateX(300%); }
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }

    .option-card {
      transition: all 0.3s;
      border: 2px solid transparent;
    }
    .option-card.selected {
      border-color: #D69A9A;
      background: rgba(214,154,154,0.05);
      transform: scale(1.02);
    }
    .step-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background-color: rgba(214,154,154,0.3);
      transition: all 0.3s;
    }
    .step-dot.active {
      background-color: #D69A9A;
      transform: scale(1.3);
    }

    .spinner {
      width: 40px; height: 40px;
      border: 3px solid rgba(214,154,154,0.3);
      border-top: 3px solid #D69A9A;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  </style>
</head>
<body class="font-serif text-[#8c5a4d] antialiased">
  
  <div class="parallax-layer" id="parallax-bg">
    <svg class="cloud" style="top:5%; width:150px; animation-duration: 40s;" viewBox="0 0 100 50"><path d="M 25 35 C 15 35 15 20 25 20 C 30 10 45 10 50 18 C 55 10 70 10 75 20 C 85 20 85 35 75 35 Z" /></svg>
    <svg class="cloud" style="top:30%; width:250px; animation-duration: 60s; opacity:0.5;" viewBox="0 0 100 50"><path d="M 20 40 C 10 40 10 25 25 25 C 28 15 45 10 55 20 C 65 10 85 10 90 25 C 100 25 100 40 90 40 Z" /></svg>
    <svg class="cloud" style="top:60%; width:180px; animation-duration: 45s;" viewBox="0 0 100 50"><path d="M 15 30 C 5 30 5 15 20 15 C 25 5 45 0 55 12 C 60 5 75 5 80 15 C 95 15 95 30 85 30 Z" /></svg>
  </div>

  <div class="relative z-10 max-w-lg mx-auto w-full min-h-screen py-10 px-4 flex flex-col items-center">
    
    <!-- Hero / Unlock / Success Area container -->
    <div class="w-full glass-card shadow-glow rounded-t-[100px] rounded-b-3xl p-6 relative flex flex-col items-center">
      
      <div class="mt-8 text-center" id="main-header">
        <h1 class="font-cursive text-5xl md:text-6xl tracking-wide text-dustypink mb-2">Heaven Sent</h1>
        <svg class="w-16 h-16 mx-auto fill-dustypink opacity-80" viewBox="0 0 100 50"><path d="M 25 35 C 15 35 15 20 25 20 C 30 10 45 10 50 18 C 55 10 70 10 75 20 C 85 20 85 35 75 35 Z" /></svg>
        <p class="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-dustypink/80 mt-6 mb-2">Join us for a baby shower honoring</p>
        <h2 class="font-cursive text-4xl text-[#9c6371] mb-6 whitespace-nowrap">Shanti & Shug</h2>
      </div>

      <!-- LOAD -->
      <div id="loading" class="hidden flex flex-col items-center py-10 w-full">
        <div class="spinner"></div>
        <p class="font-sans text-xs font-bold tracking-widest mt-6 text-dustypink">VERIFYING...</p>
      </div>

      <!-- STATE A: PHONE ENTRY ENVELOPE -->
      <div id="view-landing" class="w-full envelope-container shadow-sm mt-8 relative z-20">
        <div class="text-center paper-slide-up">
          <p class="font-sans text-sm tracking-widest font-bold text-dustypink mb-6">UNLOCK YOUR INVITATION</p>
          <p class="font-serif italic text-lg mb-6">Enter your phone number to slide open your envelope.</p>
          <input type="tel" id="phone" placeholder="(555) 123-4567" maxlength="14" oninput="formatPhone(this)" class="w-full text-center p-4 border border-dustypink/30 rounded-lg font-serif text-xl focus:outline-none focus:border-dustypink transition mb-2 bg-[#fcf6f7]">
          <div id="phone-error" class="hidden text-xs font-sans tracking-wide text-red-400 mt-2">Please enter a valid 10-digit number.</div>
          <button onclick="checkPhone()" class="shimmer-btn w-full py-4 rounded-full font-sans font-bold text-sm tracking-[0.2em] uppercase mt-6">Open Envelope</button>
        </div>
        <div class="envelope-sleeve"></div>
      </div>

      <!-- STATE B & C: MULTI-STEP RSVP -->
      <div id="view-rsvp" class="hidden w-full paper-slide-up bg-white rounded-3xl p-6 md:p-8 mt-6 shadow-sm border border-dustypink/20">
        <h3 id="welcome-message" class="font-cursive text-4xl text-center text-[#9c6371] leading-tight break-words mb-2"></h3>
        <p class="italic text-center text-lg mb-8">We can't wait to celebrate with you.</p>

        <!-- Hidden input to store guest name visually -->
        <input type="hidden" id="guest-name">

        <!-- Progress Dots -->
        <div class="flex justify-center gap-3 mb-8" id="progress-dots">
          <div class="step-dot active" id="dot-1"></div>
          <div class="step-dot" id="dot-2"></div>
          <div class="step-dot" id="dot-3"></div>
        </div>

        <!-- Step 1: Attending? -->
        <div id="step-1" class="step-container">
          <label class="font-sans text-xs font-bold tracking-widest uppercase text-dustypink block text-center mb-6">Will you be attending?</label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="option-card p-6 rounded-2xl text-center cursor-pointer bg-slate-50 hover:bg-dustypink/5" onclick="selectAttending('Yes')">
              <span class="block text-2xl mb-2">🕊️</span>
              <span class="font-serif text-lg font-bold">Joyfully Accept</span>
            </div>
            <div class="option-card p-6 rounded-2xl text-center cursor-pointer bg-slate-50 hover:bg-dustypink/5" onclick="selectAttending('No')">
              <span class="block text-2xl mb-2">💌</span>
              <span class="font-serif text-lg font-bold">Regretfully Decline</span>
            </div>
          </div>
          <input type="hidden" id="attending">
          <div id="attending-error" class="hidden text-center text-xs font-sans tracking-wide text-red-400 mt-4">Please let us know if you'll attend.</div>
          <button onclick="nextStep(2)" class="shimmer-btn w-full py-4 rounded-full font-sans font-bold text-sm tracking-[0.2em] uppercase mt-8 hidden" id="btn-next-1">Next Step</button>
        </div>

        <!-- Step 2: Plus One & Group details -->
        <div id="step-2" class="step-container hidden paper-slide-up space-y-6">
          <div id="group-questions" class="hidden space-y-4 pt-2">
            <label class="font-sans text-xs font-bold tracking-widest uppercase text-dustypink block">Are all invitees attending?</label>
            <div class="flex gap-4">
               <button class="flex-1 py-3 border border-dustypink/30 rounded-xl font-serif text-lg hover:bg-dustypink/5 focus:bg-dustypink focus:text-white transition" onclick="selectGroupAttending('Yes', this)">Yes, all!</button>
               <button class="flex-1 py-3 border border-dustypink/30 rounded-xl font-serif text-lg hover:bg-dustypink/5 focus:bg-dustypink focus:text-white transition" onclick="selectGroupAttending('No', this)">Only some</button>
            </div>
            <input type="hidden" id="all-attending">
            <div id="all-attending-error" class="hidden text-xs font-sans tracking-wide text-red-400">Please choose an option.</div>
          </div>

          <div id="number-attending-group" class="hidden space-y-2">
            <label class="font-sans text-xs font-bold tracking-widest uppercase text-dustypink block">How many are attending?</label>
            <select id="number-attending" class="w-full p-4 rounded-xl border border-dustypink/30 font-serif text-lg bg-[#fcf6f7] outline-none"></select>
            <div id="number-attending-error" class="hidden text-xs font-sans tracking-wide text-red-400">Please select number.</div>
          </div>

          <div id="guest-names-group" class="hidden space-y-2">
            <label class="font-sans text-xs font-bold tracking-widest uppercase text-dustypink block">Names of those attending (Optional)</label>
            <input type="text" id="guest-names-list" placeholder="e.g. John & Jane" class="w-full p-4 rounded-xl border border-dustypink/30 font-serif text-lg bg-[#fcf6f7] outline-none">
          </div>

          <!-- Using the exact plusOne boolean logic mapped to this block -->
          <div id="plus-one-group" class="hidden space-y-4 pt-2">
            <label class="font-sans text-xs font-bold tracking-widest uppercase text-dustypink block">Bringing a plus one?</label>
            <div class="flex gap-4">
               <button class="flex-1 py-3 border border-dustypink/30 rounded-xl font-serif text-lg hover:bg-dustypink/5 focus:bg-dustypink focus:text-white transition" onclick="selectPlusOne('Yes', this)">Yes</button>
               <button class="flex-1 py-3 border border-dustypink/30 rounded-xl font-serif text-lg hover:bg-dustypink/5 focus:bg-dustypink focus:text-white transition" onclick="selectPlusOne('No', this)">No</button>
            </div>
            <input type="hidden" id="bringing-plus-one">
            <div id="bringing-plus-one-error" class="hidden text-xs font-sans tracking-wide text-red-400">Please choose an option.</div>
          </div>

          <div id="plus-one-name-group" class="hidden space-y-2">
            <label class="font-sans text-xs font-bold tracking-widest uppercase text-dustypink block">Plus One's Name</label>
            <input type="text" id="plus-one-name" placeholder="Guest Name" class="w-full p-4 rounded-xl border border-dustypink/30 font-serif text-lg bg-[#fcf6f7] outline-none focus:border-dustypink">
            <div id="plus-one-error" class="hidden text-xs font-sans tracking-wide text-red-400">Please provide their name.</div>
          </div>

          <div class="flex gap-4 mt-8">
            <button onclick="prevStep(1)" class="w-1/3 py-4 border border-dustypink/50 text-dustypink rounded-full font-sans font-bold text-sm tracking-[0.2em] uppercase hover:bg-dustypink/10 transition">BACK</button>
            <button onclick="nextStep(3)" class="shimmer-btn w-2/3 py-4 rounded-full font-sans font-bold text-sm tracking-[0.2em] uppercase">Next Step</button>
          </div>
        </div>

        <!-- Step 3: Dietary & Finalize -->
        <div id="step-3" class="step-container hidden paper-slide-up space-y-6">
          <div class="space-y-4 pt-2">
             <label class="font-sans text-xs font-bold tracking-widest uppercase text-dustypink block">Any Dietary Restrictions?</label>
             <textarea id="dietary" rows="3" placeholder="If none, just leave blank." class="w-full p-4 rounded-xl border border-dustypink/30 font-serif text-lg bg-[#fcf6f7] outline-none focus:border-dustypink resize-none"></textarea>
          </div>

          <div class="flex gap-4 mt-8">
            <button onclick="prevStep(2)" class="w-1/3 py-4 border border-dustypink/50 text-dustypink rounded-full font-sans font-bold text-sm tracking-[0.2em] uppercase hover:bg-dustypink/10 transition">BACK</button>
            <button onclick="submitRSVP()" class="shimmer-btn w-2/3 py-4 rounded-full font-sans font-bold text-sm tracking-[0.2em] uppercase">Submit RSVP</button>
          </div>
        </div>

        <!-- Step Decline: Just Submit -->
        <div id="step-decline" class="step-container hidden paper-slide-up space-y-6">
          <p class="font-serif italic text-center mb-8">We will miss you!</p>
          <div class="flex gap-4 mt-8">
            <button onclick="prevStep(1)" class="w-1/3 py-4 border border-dustypink/50 text-dustypink rounded-full font-sans font-bold text-sm tracking-[0.2em] uppercase hover:bg-dustypink/10 transition">BACK</button>
            <button onclick="submitRSVP()" class="shimmer-btn w-2/3 py-4 rounded-full font-sans font-bold text-sm tracking-[0.2em] uppercase">Confirm</button>
          </div>
        </div>

      </div>

      <!-- DENIED -->
      <div id="view-denied" class="hidden w-full text-center mt-12 mb-12">
        <h3 class="font-cursive text-5xl mb-4 text-[#9c6371]">Not Found </h3>
        <p class="font-serif italic text-xl mb-8">We couldn't find your number. Please double check or reach out to the host.</p>
        <button onclick="showView('landing')" class="px-8 py-3 border-2 border-dustypink text-dustypink rounded-full font-sans font-bold text-xs tracking-widest hover:bg-dustypink hover:text-white transition">TRY AGAIN</button>
      </div>

      <!-- ALREADY RSVPED -->
      <div id="view-already" class="hidden w-full text-center mt-12 mb-12">
        <h3 class="font-cursive text-5xl mb-4 text-[#9c6371]">Already RSVP'd</h3>
        <p class="font-serif italic text-xl mb-4">It looks like you've already submitted an RSVP for this number.</p>
      </div>

      <!-- SUCCESS -->
      <div id="view-success" class="hidden w-full text-center mt-12 mb-12 paper-slide-down">
        <h3 class="font-cursive text-6xl mb-4 text-[#9c6371]">Thank You!</h3>
        <p class="font-serif italic text-xl mb-4">Your RSVP has been securely recorded.</p>
      </div>

    </div>

    <!-- Details Section -->
    <div id="event-details" class="w-full mt-10 text-center relative z-10 glass-card p-10 rounded-3xl shadow-sm mb-10">
      
      <div class="font-sans font-bold tracking-[0.2em] uppercase text-dustypink text-lg flex items-center justify-center gap-4 mb-8">
        <span>JUNE 21</span>
        <span class="text-dustypink/50 font-light">|</span>
        <span>4-8 PM</span>
      </div>

      <p class="font-sans tracking-widest uppercase font-bold text-dustypink/80 text-sm mb-2">Location</p>
      <p class="font-serif text-2xl font-bold tracking-wide">27494 GRAND RIVER AVE<br>LIVONIA MI 48152</p>

      <div class="flex flex-col sm:flex-row gap-4 mt-8">
          <a href="https://maps.google.com/?q=27494+GRAND+RIVER+AVE,+LIVONIA+MI+48152" target="_blank" class="w-full text-center shimmer-btn py-4 rounded-full font-sans font-bold text-[11px] tracking-widest">📍 GOOGLE MAPS</a>
          <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Shanti+%26+Shug%27s+Baby+Shower&dates=20260621T200000Z/20260622T000000Z" target="_blank" class="w-full text-center bg-white text-dustypink border-2 border-dustypink py-4 rounded-full font-sans font-bold text-[11px] tracking-widest hover:bg-dustypink/10 transition">📅 ADD TO CALENDAR</a>
      </div>

      <div class="mt-16 pt-10 border-t border-dustypink/20">
         <h2 class="font-cursive text-5xl mb-6 text-[#9c6371]">Baby List</h2>
         <p class="font-serif italic text-xl mb-8 leading-relaxed">Here’s Shanti & Sean's Baby Registry. Check out their top picks to help find their perfect gift.</p>
         <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://www.target.com" target="_blank" class="px-8 py-3 bg-white border border-dustypink/30 text-dustypink rounded-xl font-sans font-bold text-xs tracking-widest hover:border-dustypink transition">TARGET</a>
            <a href="https://www.amazon.com" target="_blank" class="px-8 py-3 bg-white border border-dustypink/30 text-dustypink rounded-xl font-sans font-bold text-xs tracking-widest hover:border-dustypink transition">AMAZON</a>
         </div>
      </div>
      
      <div class="mt-16 pt-10 border-t border-dustypink/20">
         <h2 class="font-cursive text-5xl mb-6 text-[#9c6371]">Books For Baby</h2>
         <p class="font-serif italic text-xl leading-relaxed mb-4">
          Instead of a card, we have a sweet request:<br>
          bring a book for baby — it truly is the best.<br>
          New or pre-loved, whichever you choose,<br>
          a tiny note inside is something we'll never lose.
         </p>
      </div>

      <div class="mt-16 pt-10 border-t border-dustypink/20">
         <h2 class="font-cursive text-5xl mb-6 text-[#9c6371]">The Countdown</h2>
         <div class="grid grid-cols-4 gap-2 font-sans">
            <div class="flex flex-col"><span id="days" class="text-4xl text-dustypink font-medium">00</span><span class="text-[10px] font-bold tracking-widest uppercase text-dustypink/70">Days</span></div>
            <div class="flex flex-col"><span id="hours" class="text-4xl text-dustypink font-medium">00</span><span class="text-[10px] font-bold tracking-widest uppercase text-dustypink/70">Hrs</span></div>
            <div class="flex flex-col"><span id="minutes" class="text-4xl text-dustypink font-medium">00</span><span class="text-[10px] font-bold tracking-widest uppercase text-dustypink/70">Mins</span></div>
            <div class="flex flex-col"><span id="seconds" class="text-4xl text-dustypink font-medium">00</span><span class="text-[10px] font-bold tracking-widest uppercase text-dustypink/70">Secs</span></div>
         </div>
      </div>

    </div>

  </div>

  <script>
    let currentGuest = null;
    let currentStep = 1;

    // Parallax logic on scroll and mouse movement
    document.addEventListener('mousemove', (e) => {
      const parallaxBg = document.getElementById('parallax-bg');
      if (parallaxBg) {
        const x = (window.innerWidth - e.pageX * 2) / 90;
        const y = (window.innerHeight - e.pageY * 2) / 90;
        parallaxBg.style.transform = \`translate(\${x}px, \${y}px)\`;
      }
    });

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY || window.pageYOffset;
      const parallaxBg = document.getElementById('parallax-bg');
      if (parallaxBg) {
        parallaxBg.style.marginTop = \`\${scrolled * 0.3}px\`;
      }
    });

    // Countdown
    function startCountdown() {
      const target = new Date("June 21, 2026 16:00:00").getTime();
      setInterval(() => {
        const now = new Date().getTime();
        const dist = target - now;
        if(dist < 0) return;
        document.getElementById('days').innerText = String(Math.floor(dist / (1000 * 60 * 60 * 24))).padStart(2, '0');
        document.getElementById('hours').innerText = String(Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        document.getElementById('minutes').innerText = String(Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        document.getElementById('seconds').innerText = String(Math.floor((dist % (1000 * 60)) / 1000)).padStart(2, '0');
      }, 1000);
    }
    document.addEventListener('DOMContentLoaded', startCountdown);

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
    }

    function showView(viewName) {
      const views = ['landing', 'rsvp', 'denied', 'already', 'success'];
      views.forEach(v => {
        const el = document.getElementById('view-' + v);
        if(el) el.classList.add('hidden');
      });
      document.getElementById('loading').classList.add('hidden');

      if (viewName === 'loading') {
        document.getElementById('loading').classList.remove('hidden');
      } else {
        const tgt = document.getElementById('view-' + viewName);
        if(tgt) tgt.classList.remove('hidden');
      }
    }

    function checkPhone() {
      // Physical Reality Check: Front-end validation to normalize phone
      const phoneInput = document.getElementById('phone').value;
      const phone = phoneInput.replace(/\\D/g, ''); // strip spaces/dashes

      if(phone.length < 10) {
        document.getElementById('phone-error').classList.remove('hidden');
        return;
      }
      document.getElementById('phone-error').classList.add('hidden');

      showView('loading');
      
      // Use google.script.run to call the existing checkPhone backend mapped logic
      google.script.run
        .withSuccessHandler((response) => handlePhoneFound(response, phone))
        .withFailureHandler(handleError)
        .checkPhone(phone);
    }

    function handlePhoneFound(response, normalizedPhoneInput) {
      if (response.status === 'found') {
        
        // Map the boolean exactly from the whitelist response. Ensure string forms match boolean true.
        const isPlusOne = response.plusOne === true || response.plusOne === 'true' || response.plusOne === 'yes';

        currentGuest = {
          phone: normalizedPhoneInput,
          name: response.name,
          maxGuests: parseInt(response.maxGuests, 10) || 1,
          plusOne: isPlusOne
        };
        
        document.getElementById('welcome-message').innerText = 'Welcome,\\n' + response.name + '!';
        document.getElementById('guest-name').value = response.name;
        
        // Reset steps
        currentStep = 1;
        document.querySelectorAll('.step-container').forEach(el => el.classList.add('hidden'));
        document.getElementById('step-1').classList.remove('hidden');
        updateDots();

        // Reset selections
        document.querySelectorAll('.option-card').forEach(el => el.classList.remove('selected'));
        document.getElementById('attending').value = '';
        document.getElementById('btn-next-1').classList.add('hidden');

        // Populate groups
        const numSelect = document.getElementById('number-attending');
        numSelect.innerHTML = '<option value="">-- Select Number --</option>';
        for(let i = 1; i <= currentGuest.maxGuests; i++) {
           numSelect.innerHTML += '<option value="' + i + '">' + i + '</option>';
        }

        showView('rsvp');
      } else if (response.status === 'already') {
        showView('already');
      } else if (response.status === 'error') {
        alert("Server Error: " + response.message);
        showView('landing');
      } else {
        showView('denied');
      }
    }

    function updateDots() {
      for(let i=1; i<=3; i++) {
        const dot = document.getElementById('dot-' + i);
        if(dot) {
          if(i === currentStep) dot.classList.add('active');
          else dot.classList.remove('active');
        }
      }
    }

    function selectAttending(val) {
      document.getElementById('attending').value = val;
      const cards = document.querySelectorAll('#step-1 .option-card');
      cards[0].classList.toggle('selected', val === 'Yes');
      cards[1].classList.toggle('selected', val === 'No');
      document.getElementById('attending-error').classList.add('hidden');
      
      // Auto advance or show next depending on flow
      if(val === 'Yes') {
         document.getElementById('btn-next-1').classList.remove('hidden');
         toggleGroupOptions();
      } else {
         document.getElementById('btn-next-1').classList.remove('hidden');
         // Auto clear
         document.getElementById('all-attending').value = '';
         document.getElementById('bringing-plus-one').value = '';
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
        
        // Reset buttons
        poGrp.querySelectorAll('button').forEach(b => {
          b.style.background = ''; b.style.color = '';
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
      btn.parentNode.querySelectorAll('button').forEach(b => {
         b.style.background = 'transparent'; b.style.color = '';
      });
      btn.style.background = '#D69A9A'; btn.style.color = 'white';
      
      const numGrp = document.getElementById('number-attending-group');
      if (val === 'No') {
        numGrp.classList.remove('hidden');
      } else {
        numGrp.classList.add('hidden');
        document.getElementById('number-attending').value = '';
      }
      document.getElementById('all-attending-error').classList.add('hidden');
    }

    function selectPlusOne(val, btn) {
      document.getElementById('bringing-plus-one').value = val;
      btn.parentNode.querySelectorAll('button').forEach(b => {
         b.style.background = 'transparent'; b.style.color = '';
      });
      btn.style.background = '#D69A9A'; btn.style.color = 'white';
      
      const poNameGrp = document.getElementById('plus-one-name-group');
      if (val === 'Yes') {
        poNameGrp.classList.remove('hidden');
        // Add a slight parallax shift for fun interaction
        poNameGrp.classList.add('paper-slide-up');
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
      if (!attending && step === 2) {
         document.getElementById('attending-error').classList.remove('hidden');
         return;
      }
      
      // If Decline -> go straight to step decline
      if (attending === 'No') {
         document.querySelectorAll('.step-container').forEach(el => el.classList.add('hidden'));
         document.getElementById('step-decline').classList.remove('hidden');
         document.getElementById('progress-dots').classList.add('hidden');
         return;
      }

      if (step === 3) {
         if(!validateStep2()) return;
      }

      // If Attending and max guests == 1 and NO plus one, skip step 2
      if (step === 2 && currentGuest.maxGuests === 1 && !currentGuest.plusOne) {
         step = 3; 
      }

      currentStep = step;
      document.querySelectorAll('.step-container').forEach(el => el.classList.add('hidden'));
      document.getElementById('step-' + step).classList.remove('hidden');
      updateDots();
    }

    function prevStep(step) {
      document.getElementById('progress-dots').classList.remove('hidden');
      currentStep = step;
      document.querySelectorAll('.step-container').forEach(el => el.classList.add('hidden'));
      
      if(step === 1) {
         document.getElementById('step-1').classList.remove('hidden');
      } else if (step === 2) {
         // If they have no extra questions, clicking back on step 3 goes to 1
         if(currentGuest.maxGuests === 1 && !currentGuest.plusOne) {
            currentStep = 1;
            document.getElementById('step-1').classList.remove('hidden');
         } else {
            document.getElementById('step-2').classList.remove('hidden');
         }
      }
      updateDots();
    }

    function submitRSVP() {
      const attending = document.getElementById('attending').value;
      if (!attending) return; // safeguard

      let numAttending = attending === 'Yes' ? 1 : 0;
      let finalSpecifiedNames = '';
      let notes = document.getElementById('dietary') ? document.getElementById('dietary').value : '';

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

      const data = {
        phone: currentGuest.phone, // Already normalized in checkPhone
        guestName: document.getElementById('guest-name').value,
        attending: attending,
        specifiedNames: finalSpecifiedNames,
        numberAttending: numAttending,
        maxGuests: currentGuest.maxGuests,
        notes: notes // e.g. Dietary
      };

      showView('loading');
      
      // Use existing google.script.run for submitRSVP
      google.script.run
        .withSuccessHandler(function(res) { 
           if(res && res.success) {
             showView('success'); 
             fireConfetti();
           } else {
             alert("Error saving: " + (res.message || 'Unknown error'));
             showView('landing');
           }
        })
        .withFailureHandler(handleError)
        .submitRSVP(data);
    }

    function fireConfetti() {
      if(typeof confetti !== 'undefined') {
        const count = 200;
        const defaults = { origin: { y: 0.8 }, colors: ['#D69A9A', '#ffffff', '#ebd1d5'] };
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
      showView('landing');
    }
  </script>
</body>
</html>`;

const startIndex = content.indexOf('const INDEX_HTML = `');
const endIndex = content.indexOf('`;', startIndex) + 2;

const finalContent = content.substring(0, startIndex) + 'const INDEX_HTML = `' + newHtml.replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`;' + content.substring(endIndex);

fs.writeFileSync('src/App.tsx', finalContent);
