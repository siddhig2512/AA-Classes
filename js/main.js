/* AA Olympiad Classes public website */

let currentStudent = null;

const SUPABASE_URL='https://zgrctvejgmyubhnxrlqr.supabase.co';
const SUPABASE_KEY='sb_publishable_s6UQp7nI3LPyXDJ4u6mipg_62wsb-ZW';

let supabaseClient=null;
if(window.supabase && !SUPABASE_KEY.includes('PASTE_YOUR_')){
  supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
}
const SEED_MATERIALS=[
  {id:'demo1',title:'Algebra Basics',category:'notes',subject:'Mathematics',klass:'8',course:'Regular Mathematics',description:'Fundamentals of algebra for Class 8.',filePath:'',downloads:0,hasFile:false,isDemo:true},
  {id:'demo2',title:'JEE Mathematics Practice Set 1',category:'papers',subject:'Mathematics',klass:'11',course:'JEE Preparation',description:'Practice questions for JEE Mathematics.',filePath:'',downloads:0,hasFile:false,isDemo:true},
  {id:'demo3',title:'Olympiad Number System',category:'notes',subject:'Mathematics',klass:'6',course:'Olympiad Preparation',description:'Number system concepts for Olympiad preparation.',filePath:'',downloads:0,hasFile:false,isDemo:true}
];

const SEED_REVIEWS=[
  {
    id:'demo-rev1',
    name:'Vivaan Shah',
    course:'Class 6',
    rating:5,
    message:'Great learning experience. Highly recommended if you want to understand the fundamental concepts.'
  },
  {
    id:'demo-rev2',
    name:'Devendra Joshi',
    course:'Class 5',
    rating:4,
    message:'Thank you Sir for the wonderful session. The doubts were cleared with utmost patience.'
  },
  {
    id:'demo-rev3',
    name:'Nidhi Gupta',
    course:'Class 5',
    rating:5,
    message:'Ajay Sir explains the concepts in very simple language which helps understanding Maths fun and easy.'
  }
];

const SEED_LIVE_CLASSES=[];

function getStoredLiveClasses(){
  try{
    const raw=localStorage.getItem('aa_live_classes');
    if(!raw)return [];
    const parsed=JSON.parse(raw);
    if(!Array.isArray(parsed))return [];
    const cleaned=parsed.filter(item=>item && item.id!=='demo-live-1' && item.id!=='demo-live-2');
    if(cleaned.length!==parsed.length){
      localStorage.setItem('aa_live_classes',JSON.stringify(cleaned));
    }
    return cleaned;
  }catch(e){
    return [];
  }
}

let materials=[];
let reviews=[];
let liveClasses=[];
let contactSettings={};
let currentTab='notes';

function toast(message,type='success'){
  const host=document.getElementById('toastHost');
  if(!host)return;

  const el=document.createElement('div');
  el.className=`toast ${type}`;
  el.textContent=message;
  host.appendChild(el);

  setTimeout(()=>el.remove(),3500);
}

function esc(value){
  return String(value??'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

function mapMaterial(r){
  return {
    ...r,
    klass:r.klass||'',
    filePath:r.file_path||r.filePath||'',
    hasFile:!!(r.file_path||r.filePath),
    downloads:Number(r.downloads||0)
  };
}


function mapReview(r){
  let rawCourse = String(r.klass || r.course || '').trim();
  let course = 'Student';
  if (/^\d+$/.test(rawCourse)) {
    course = 'Class ' + rawCourse;
  } else if (/^class\s*\d+/i.test(rawCourse)) {
    course = rawCourse.replace(/^class\s*/i, 'Class ');
  } else if (rawCourse) {
    course = rawCourse;
  }
  return {
    ...r,
    name: r.name || 'Student',
    course: course,
    rating: Math.max(1, Math.min(5, Number(r.rating || 5))),
    message: r.review_text || r.message || ''
  };
}


async function loadData(){

  if(!supabaseClient){
    materials=SEED_MATERIALS;
    reviews=SEED_REVIEWS;
    liveClasses=getStoredLiveClasses();
    return;
  }

  try{

    const {data:matData,error:matError}=await supabaseClient
      .from('study_materials')
      .select('*')
      .order('created_at',{ascending:false});

    if(matError){
      console.error('Materials error:',matError);
      materials=SEED_MATERIALS;
    }else{
      materials=(matData&&matData.length)
        ? matData.map(mapMaterial)
        : SEED_MATERIALS;
    }

    const {data:reviewData,error:reviewError}=await supabaseClient
      .from('reviews')
      .select('*')
      .eq('status','approved')
      .order('created_at',{ascending:false});

    if(reviewError || !reviewData || !reviewData.length){
      if (reviewError) console.error('Reviews error:',reviewError);
      reviews=SEED_REVIEWS;
    }else{
      reviews=reviewData.map(mapReview);
    }

    const {data:settingsData,error:settingsError}=await supabaseClient
      .from('contact_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if(settingsError){
      console.error('Contact settings error:',settingsError);
      contactSettings={};
    }else{
      contactSettings=settingsData||{};
    }

    /* Load Live Classes */
    try{
      const {data:liveData,error:liveError}=await supabaseClient
        .from('live_classes')
        .select('*')
        .order('class_date',{ascending:true});

      if(!liveError && Array.isArray(liveData)){
        liveClasses=liveData.filter(item=>item && item.id!=='demo-live-1' && item.id!=='demo-live-2');
      }else{
        liveClasses=getStoredLiveClasses();
      }
    }catch(e){
      console.warn('Live classes load error:',e);
      liveClasses=getStoredLiveClasses();
    }

  }catch(error){
    console.error('loadData error:',error);
    materials=SEED_MATERIALS;
    reviews=[];
    liveClasses=getStoredLiveClasses();
  }
}

function formatClassDate(dateStr){
  if(!dateStr)return '';
  try{
    if(isNaN(Date.parse(dateStr)))return dateStr;
    const parts=dateStr.split('-');
    if(parts.length===3){
      const year=parseInt(parts[0],10);
      const month=parseInt(parts[1],10)-1;
      const day=parseInt(parts[2],10);
      const d=new Date(year,month,day);
      return d.toLocaleDateString('en-IN',{
        weekday:'short',
        day:'numeric',
        month:'short',
        year:'numeric'
      });
    }
    const d=new Date(dateStr);
    return d.toLocaleDateString('en-IN',{
      weekday:'short',
      day:'numeric',
      month:'short',
      year:'numeric'
    });
  }catch(e){
    return dateStr;
  }
}

function formatClassTime(timeStr){
  if(!timeStr)return '';
  if(/^\d{1,2}:\d{2}$/.test(timeStr)){
    const [h,m]=timeStr.split(':').map(Number);
    const ampm=h>=12?'PM':'AM';
    const hour12=h%12||12;
    return `${String(hour12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm} IST`;
  }
  return timeStr;
}

function renderLiveClasses(){
  const grid=document.getElementById('liveClassesGrid');
  const countText=document.getElementById('liveStatusText');
  const counterPill=document.getElementById('liveCounterPill');
  if(!grid)return;

  const count=(liveClasses && Array.isArray(liveClasses)) ? liveClasses.length : 0;

  if(counterPill){
    if(count===0){
      counterPill.innerHTML=`
        <span style="width:8px;height:8px;border-radius:50%;background:#94a3b8;display:inline-block;"></span>
        <span id="liveStatusText">No Upcoming Classes</span>
      `;
    }else{
      counterPill.innerHTML=`
        <span class="live-dot-pulse"></span>
        <span id="liveStatusText">${count} Live Session${count===1?'':'s'} Scheduled</span>
      `;
    }
  }

  if(count===0){
    grid.innerHTML=`
      <div class="live-empty-state">
        <div class="live-empty-icon-wrap">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon>
          </svg>
        </div>
        <h3>No Upcoming Classes</h3>
        <p>There are no live classes scheduled right now. Ajay Sir regularly conducts interactive problem-solving sessions, Olympiad masterclasses, and revision batches. Check back soon or contact our counselling team!</p>
        <div class="live-empty-actions">
          <a href="contact.html" class="btn btn-primary btn-sm">Enquire About Next Live Batch</a>
          <a href="study-material.html" class="btn btn-outline btn-sm">Browse Free Study Notes</a>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML=liveClasses.map(c=>{
    const formattedDate=formatClassDate(c.class_date);
    const formattedTime=formatClassTime(c.class_time);
    const target=c.target_class||'All Batches';
    const link=c.class_link||'#';

    return `
      <article class="live-card">
        <div class="live-card-top">
          <span class="live-status-pill">
            <span class="live-dot-pulse"></span> Upcoming Live
          </span>
          <span class="live-target-badge">${esc(target)}</span>
        </div>

        <h3 class="live-card-title">${esc(c.topic)}</h3>

        ${c.description?`<p class="live-card-desc">${esc(c.description)}</p>`:''}

        <div class="live-schedule-box">
          <div class="live-schedule-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span><strong>Date:</strong> ${esc(formattedDate)}</span>
          </div>

          <div class="live-schedule-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span><strong>Time:</strong> ${esc(formattedTime)}</span>
          </div>

          <div class="live-schedule-item instructor">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span><strong>Faculty:</strong> Ajay Sir (Expert Educator)</span>
          </div>
        </div>

        <a href="${esc(link)}" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-live-join" id="joinLive-${esc(c.id)}">
          <span>Join Live Class</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </article>
    `;
  }).join('');
}

function renderCourses(){

  const courseGrid=document.getElementById('courseGrid');
  if(!courseGrid)return;

  const courses=[
    {
      title:'JEE Preparation',
      tag:'For Classes 11–12',
      text:'Focused preparation with concepts, problem solving and regular practice.',
      icon:'🎯'
    },
    {
      title:'Olympiad Preparation',
      tag:'For Classes 3–10',
      text:'Build strong mathematical thinking and problem-solving skills.',
      icon:'🏆'
    },
    {
      title:'Regular Mathematics Classes',
      tag:'For Classes 3–10',
      text:'Clear concepts, regular practice and exam-oriented learning.',
      icon:'📐'
    }
  ];

  courseGrid.innerHTML=courses.map(c=>`
    <div class="course-card">
      <div class="course-icon">${c.icon}</div>
      <span class="course-tag">${esc(c.tag)}</span>
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.text)}</p>
    </div>
  `).join('');
}

function renderWhy(){

  const grid=document.getElementById('whyGrid');
  if(!grid)return;

  const items=[
    {
      icon:'🎓',
      title:'Concept Focused',
      text:'We focus on understanding concepts instead of only memorising answers.'
    },
    {
      icon:'📝',
      title:'Regular Practice',
      text:'Practice questions and papers help students improve step by step.'
    },
    {
      icon:'👨‍🏫',
      title:'Personal Attention',
      text:'Students get guidance according to their learning needs.'
    },
    {
      icon:'📈',
      title:'Better Preparation',
      text:'A structured approach helps students prepare with confidence.'
    }
  ];

  grid.innerHTML=items.map(item=>`
    <div class="why-card">
      <div class="why-icon">${item.icon}</div>
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.text)}</p>
    </div>
  `).join('');
}

function populateFilters(){

  const classSelect=document.getElementById('filterClass');
  const courseSelect=document.getElementById('filterCourse');
  const subjectSelect=document.getElementById('filterSubject');

  if(!classSelect||!courseSelect||!subjectSelect)return;

  const classes=[...new Set(
    materials
      .map(m=>String(m.klass||'').trim())
      .filter(Boolean)
  )].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));

  const courses=[...new Set(
    materials
      .map(m=>String(m.course||'').trim())
      .filter(Boolean)
  )].sort();

  const subjects=[...new Set(
    materials
      .map(m=>String(m.subject||'').trim())
      .filter(Boolean)
  )].sort();

  classSelect.innerHTML='<option value="">All Classes</option>'+
    classes.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');

  courseSelect.innerHTML='<option value="">All Courses</option>'+
    courses.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');

  subjectSelect.innerHTML='<option value="">All Subjects</option>'+
    subjects.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
}

function renderMaterials(){

  const grid=document.getElementById('materialGrid');
  if(!grid)return;

  const search=(document.getElementById('smSearch')?.value||'')
    .trim()
    .toLowerCase();

  const classFilter=document.getElementById('filterClass')?.value||'';
  const courseFilter=document.getElementById('filterCourse')?.value||'';
  const subjectFilter=document.getElementById('filterSubject')?.value||'';

  let list=materials.filter(m=>
    currentTab==='papers'
      ? (m.category==='papers'||m.category==='paper')
      : m.category===currentTab
  );

  list=list.filter(m=>{

    const searchable=[
      m.title,
      m.subject,
      m.course,
      m.klass,
      m.description
    ].join(' ').toLowerCase();

    return (!search||searchable.includes(search)) &&
      (!classFilter||String(m.klass)===String(classFilter)) &&
      (!courseFilter||String(m.course)===String(courseFilter)) &&
      (!subjectFilter||String(m.subject)===String(subjectFilter));
  });

  if(!list.length){
    grid.innerHTML=`
      <div class="empty-state">
        <h3>No study material found</h3>
        <p>Try changing the search or filters.</p>
      </div>`;
    return;
  }

  grid.innerHTML=list.map(m=>{

    const isDemo=m.isDemo||!m.filePath;

    return `
      <article class="material-card">
        <div class="material-icon">
          ${currentTab==='papers'?'📝':'📚'}
        </div>

        <div class="material-body">
          <span class="material-type">
            ${currentTab==='papers'?'Practice Paper':'Notes'}
          </span>

          <h3>${esc(m.title)}</h3>

          <p>${esc(m.description||'Study material for students.')}</p>

          <div class="material-meta">
            ${m.subject?`<span>${esc(m.subject)}</span>`:''}
            ${m.klass?`<span>Class ${esc(m.klass)}</span>`:''}
            ${m.course?`<span>${esc(m.course)}</span>`:''}
          </div>

          <button
            class="btn btn-gold btn-sm material-download-btn"
            data-material-id="${esc(m.id)}"
            ${isDemo?'disabled':''}>
            ${isDemo?'Demo Material':'Download'}
          </button>
        </div>
      </article>
    `;

  }).join('');

  grid.querySelectorAll('.material-download-btn').forEach(btn=>{
    if(btn.disabled)return;

    btn.addEventListener('click',()=>{
      downloadMaterial(btn.dataset.materialId);
    });
  });
}
function injectStudentAuthUI(){

  if(document.getElementById('studentAuthModal'))return;

  const navCta=document.querySelector('.nav-cta');

  if(navCta){

    const btn=document.createElement('button');

    btn.id='studentAuthBtn';
    btn.className='btn btn-outline btn-sm';
    btn.type='button';
    btn.textContent='Student Login';

    btn.onclick=()=>openStudentAuth('login');

    navCta.insertBefore(btn,navCta.firstChild);
  }

  const style=document.createElement('style');

  style.textContent=`

  #studentAuthModal{
    position:fixed;
    inset:0;
    background:rgba(11,37,69,.62);
    display:none;
    align-items:center;
    justify-content:center;
    padding:20px;
    z-index:9999;
  }

  #studentAuthModal.open{
    display:flex;
  }

  .student-auth-box{
    width:min(440px,100%);
    background:#fff;
    border-radius:18px;
    padding:28px;
    box-shadow:0 20px 60px rgba(0,0,0,.2);
    position:relative;
  }

  .student-auth-box h3{
    margin:0 0 8px;
    color:#0B2545;
  }

  .student-auth-box p{
    margin:0 0 18px;
    color:#64748b;
    font-size:14px;
  }

  .student-auth-box label{
    display:block;
    margin:12px 0 6px;
    font-size:13px;
    font-weight:700;
    color:#0B2545;
  }

  .student-auth-box input{
    width:100%;
    box-sizing:border-box;
    padding:11px 13px;
    border:1px solid #d7dce3;
    border-radius:9px;
    font:inherit;
  }

  .student-auth-box .auth-actions{
    display:flex;
    gap:10px;
    margin-top:18px;
  }

  .student-auth-box .auth-actions button{
    flex:1;
  }

  .student-auth-close{
    position:absolute;
    right:15px;
    top:10px;
    border:0;
    background:none;
    font-size:28px;
    cursor:pointer;
    color:#64748b;
  }

  .student-auth-switch{
    margin-top:16px;
    text-align:center;
    font-size:13px;
    color:#64748b;
  }

  .student-auth-switch button{
    border:0;
    background:none;
    color:#0B2545;
    font-weight:700;
    cursor:pointer;
  }

  #studentAuthMessage{
    margin-top:12px;
    font-size:13px;
    font-weight:600;
    line-height:1.5;
  }

  `;

  document.head.appendChild(style);

  const modal=document.createElement('div');

  modal.id='studentAuthModal';

  modal.innerHTML=`

    <div class="student-auth-box">

      <button
        class="student-auth-close"
        type="button"
        aria-label="Close">
        ×
      </button>

      <div id="studentAuthContent"></div>

    </div>

  `;

  document.body.appendChild(modal);

  modal.querySelector('.student-auth-close').onclick=closeStudentAuth;

  modal.addEventListener('click',e=>{
    if(e.target===modal){
      closeStudentAuth();
    }
  });
}


function openStudentAuth(mode='login'){

  const modal=document.getElementById('studentAuthModal');

  if(!modal)return;

  renderStudentAuthForm(mode);

  modal.classList.add('open');
}


function closeStudentAuth(){

  document
    .getElementById('studentAuthModal')
    ?.classList.remove('open');

}


function renderStudentAuthForm(mode='login'){

  const box=document.getElementById('studentAuthContent');

  if(!box)return;


  if(currentStudent){

    box.innerHTML=`

      <h3>Student Account</h3>

      <p>
        Welcome, ${esc(currentStudent.name||'Student')}.
      </p>

      <div
        style="
          background:#f7f4ec;
          border-radius:10px;
          padding:14px;
          margin:14px 0;
          font-size:14px;
          line-height:1.7;
        ">

        <strong>Downloads used:</strong>

        ${
          currentStudent.unlimited_access
            ? 'Unlimited'
            : Number(currentStudent.downloads_used||0)+'/3'
        }

        ${
          currentStudent.unlimited_access
            ? '<br><strong>Access:</strong> Unlimited'
            : ''
        }

      </div>

      <div class="auth-actions">

        <button
          class="btn btn-navy btn-block"
          type="button"
          id="studentLogoutBtn">
          Logout
        </button>

      </div>

    `;

    box.querySelector('#studentLogoutBtn').onclick=studentLogout;

    return;
  }


  if(mode==='forgot'){

    box.innerHTML=`
      <h3>Reset Password</h3>
      <p>Enter your registered email address to receive a password reset link.</p>

      <form id="studentForgotPasswordForm">
        <label for="studentEmail">Email ID</label>
        <input id="studentEmail" type="email" required>

        <div class="auth-actions">
          <button class="btn btn-gold btn-block" type="submit">
            Send Reset Link
          </button>
        </div>

        <div id="studentAuthMessage"></div>

        <div class="student-auth-switch">
          Remember your password?
          <button type="button" id="backToLoginBtn">Back to Login</button>
        </div>
      </form>
    `;

    box.querySelector('#studentForgotPasswordForm').onsubmit=studentForgotPassword;
    box.querySelector('#backToLoginBtn').onclick=()=>renderStudentAuthForm('login');

  }else if(mode==='signup'){
    box.innerHTML=`

      <h3>Create Student Account</h3>

      <p>
        Create an account to download study material.
        Each account gets 3 lifetime downloads.
      </p>

      <form id="studentSignupForm">

        <label for="studentName">
          Name
        </label>

        <input
          id="studentName"
          type="text"
          required>


        <label for="studentKlass">
          Class
        </label>

        <input
          id="studentKlass"
          type="text"
          required
          placeholder="Example: Class 8">


        <label for="studentEmail">
          Email ID
        </label>

        <input
          id="studentEmail"
          type="email"
          required>


        <label for="studentPassword">
          Password
        </label>

        <input
          id="studentPassword"
          type="password"
          minlength="6"
          required>


        <div class="auth-actions">

          <button
            class="btn btn-gold btn-block"
            type="submit">
            Create Account
          </button>

        </div>


        <div id="studentAuthMessage"></div>


        <div class="student-auth-switch">

          Already have an account?

          <button
            type="button"
            id="showLoginBtn">
            Login
          </button>

        </div>

      </form>

    `;


    box
      .querySelector('#studentSignupForm')
      .onsubmit=studentSignup;


    box
      .querySelector('#showLoginBtn')
      .onclick=()=>renderStudentAuthForm('login');

  }else{

    box.innerHTML=`

      <h3>Student Login</h3>

      <p>
        Login to download study material.
      </p>

      <form id="studentLoginForm">

        <label for="studentEmail">
          Email ID
        </label>

        <input
          id="studentEmail"
          type="email"
          required>


        <label for="studentPassword">
          Password
        </label>

        <input
          id="studentPassword"
          type="password"
          required>


        <div class="auth-actions">

          <button
            class="btn btn-gold btn-block"
            type="submit">
            Login
          </button>

        </div>

        <div style="text-align:right;margin-top:10px;">
          <button
            type="button"
            id="forgotPasswordBtn"
            style="border:0;background:none;color:#0B2545;font-weight:700;cursor:pointer;">
            Forgot Password?
          </button>
        </div>

        <div id="studentAuthMessage"></div>
        <div class="student-auth-switch">

          Don't have an account?

          <button
            type="button"
            id="showSignupBtn">
            Create Account
          </button>

        </div>

      </form>

    `;


    box
      .querySelector('#studentLoginForm')
      .onsubmit=studentLogin;


       box
      .querySelector('#showSignupBtn')
      .onclick=()=>renderStudentAuthForm('signup');

    box
      .querySelector('#forgotPasswordBtn')
      .onclick=()=>renderStudentAuthForm('forgot');

  }

}


function setStudentMessage(message,type=''){

  const el=document.getElementById('studentAuthMessage');

  if(el){

    el.textContent=message;

    el.style.color=
      type==='error'
        ? '#b42318'
        : '#16794a';

  }

}


async function studentForgotPassword(e) {
  e.preventDefault();

  const form = e.currentTarget;
  const button = form.querySelector('button[type="submit"]');

  // Prevent duplicate submissions
  if (button.disabled) return;

  if (!supabaseClient) {
    setStudentMessage(
      'Website is not connected to Supabase.',
      'error'
    );
    return;
  }

  const email = document
    .getElementById('studentEmail')
    .value
    .trim()
    .toLowerCase();

  button.disabled = true;
  button.textContent = 'Sending...';

  try {
    const { error } = await supabaseClient.auth
      .resetPasswordForEmail(email, {
        redirectTo:
          window.location.origin + '/reset-password.html'
      });

    if (error) {
  setStudentMessage(
    error.message,
    'error'
  );
  return;
}
    setStudentMessage(
      'If an account exists with this email, a password reset link will be sent. Please check your inbox.',
      'success'
    );

  } catch (error) {
    setStudentMessage(
      'Something went wrong. Please try again.',
      'error'
    );
  } finally {
    button.disabled = false;
    button.textContent = 'Send Reset Link';
  }
}


async function loadStudentSession(){

  if(!supabaseClient)return;

  const {
    data:{session}
  }=await supabaseClient.auth.getSession();


  if(session){

    await loadStudentProfile(session.user.id);

  }


  updateStudentAuthButton();


  supabaseClient.auth.onAuthStateChange(
    async(event,session)=>{

      if(session){

        await loadStudentProfile(session.user.id);

      }else{

        currentStudent=null;

      }

      updateStudentAuthButton();

    }
  );

}


async function loadStudentProfile(userId){

  if(!supabaseClient)return;

  const {
    data,
    error
  }=await supabaseClient
    .from('student_profiles')
    .select('*')
    .eq('id',userId)
    .maybeSingle();


  if(error){

    console.error(
      'Student profile error:',
      error
    );

    currentStudent=null;

    return;
  }


  currentStudent=data||null;

}


function updateStudentAuthButton(){

  const btn=document.getElementById('studentAuthBtn');

  if(!btn)return;


  if(currentStudent){

    btn.textContent='My Account';

    btn.onclick=()=>openStudentAuth('login');

  }else{

    btn.textContent='Student Login';

    btn.onclick=()=>openStudentAuth('login');

  }

}


async function studentSignup(e){

  e.preventDefault();

  if(!supabaseClient){

    setStudentMessage(
      'Website is not connected to Supabase.',
      'error'
    );

    return;
  }

  const name =
    document
      .getElementById('studentName')
      .value
      .trim();

  const klass =
    document
      .getElementById('studentKlass')
      .value
      .trim();

  const email =
    document
      .getElementById('studentEmail')
      .value
      .trim()
      .toLowerCase();

  const password =
    document
      .getElementById('studentPassword')
      .value;

  if(!name || !klass || !email || !password){

    setStudentMessage(
      'Please fill in all fields.',
      'error'
    );

    return;
  }

  if(password.length < 6){

    setStudentMessage(
      'Password must be at least 6 characters.',
      'error'
    );

    return;
  }

  const {
    data,
    error
  
  } = await supabaseClient.auth.signUp({

    email,

    password,

    options: {
      emailRedirectTo: 'https://aa-classes.vercel.app/',
      data: {
        name,
        klass
      }
    }

  });

  if(error){

    setStudentMessage(
      error.message,
      'error'
    );

    return;
  }

  /*
   * Supabase may return a successful response for an
   * already-registered email when email confirmation
   * is enabled. Check identities to detect that case.
   */

  if(
    data?.user &&
    Array.isArray(data.user.identities) &&
    data.user.identities.length === 0
  ){

    setStudentMessage(
      'An account with this email already exists. Please login instead.',
      'error'
    );

    return;
  }

  if(data.session){

    await loadStudentProfile(
      data.user.id
    );

    updateStudentAuthButton();

    closeStudentAuth();

    toast(
      'Account created successfully. You can now download study material.',
      'success'
    );

  }else{

    setStudentMessage(
      'Account created. Please verify your email if Supabase asks for email confirmation.',
      'success'
    );

  }

}
async function studentLogin(e){

  e.preventDefault();


  if(!supabaseClient){

    setStudentMessage(
      'Website is not connected to Supabase.',
      'error'
    );

    return;
  }


  const email=
    document
      .getElementById('studentEmail')
      .value
      .trim();


  const password=
    document
      .getElementById('studentPassword')
      .value;


  const {
    data,
    error
  }=await supabaseClient.auth.signInWithPassword({

    email,

    password

  });


  if(error){

    setStudentMessage(
      error.message,
      'error'
    );

    return;
  }


  await loadStudentProfile(
    data.user.id
  );


  if(!currentStudent){

    await supabaseClient.auth.signOut();

    setStudentMessage(
      'Student profile not found. Please contact Admin.',
      'error'
    );

    return;
  }


  updateStudentAuthButton();

  closeStudentAuth();

  toast(
    'Login successful.',
    'success'
  );

}


async function studentLogout(){

  if(supabaseClient){

    await supabaseClient.auth.signOut();

  }

  currentStudent=null;

  updateStudentAuthButton();

  closeStudentAuth();

  toast(
    'You have been logged out.',
    'success'
  );

}
async function downloadMaterial(id){

  const m=materials.find(x=>x.id===id);

  if(!m)return;


  if(!supabaseClient||!m.filePath){

    toast(
      'This material does not have a downloadable file yet.',
      'error'
    );

    return;
  }


  /* Student must be logged in */

  if(!currentStudent){

    openStudentAuth('login');

    toast(
      'Please login as a student before downloading.',
      'error'
    );

    return;
  }


  /* Check lifetime download limit */

  const {
    data:limitData,
    error:limitError
  }=await supabaseClient.rpc(
    'use_download'
  );


  if(limitError){

    console.error(
      'Download limit error:',
      limitError
    );

    toast(
      'Could not verify your download access. Please try again.',
      'error'
    );

    return;
  }


  if(!limitData?.success){

    toast(
      limitData?.message ||
      'Download limit reached. Please contact Admin to continue downloading study materials.',
      'error'
    );

    return;
  }


  /* Download actual file from Supabase */

  const {
    data,
    error
  }=await supabaseClient
    .storage
    .from('study-materials')
    .download(m.filePath);


  if(error){

    console.error(
      'File download error:',
      error
    );

    toast(
      'Could not download the file.',
      'error'
    );

    return;
  }


  const a=document.createElement('a');

  a.href=URL.createObjectURL(data);

  a.download=
    m.filePath.split('/').pop() ||
    m.title;

  a.click();


  setTimeout(
    ()=>URL.revokeObjectURL(a.href),
    1500
  );


  /* Update material download count */

  const next=
    Number(m.downloads||0)+1;


  await supabaseClient
    .from('study_materials')
    .update({
      downloads:next
    })
    .eq('id',id);


  m.downloads=next;


  /* Update student's local download count */

  if(
    currentStudent &&
    !currentStudent.unlimited_access
  ){

    currentStudent.downloads_used=
      Number(
        limitData.downloads_used ||
        currentStudent.downloads_used
      );

  }


  renderMaterials();


  if(
    document
      .getElementById('studentAuthModal')
      ?.classList
      .contains('open')
  ){

    renderStudentAuthForm('login');

  }


  toast(
    currentStudent?.unlimited_access
      ? 'Download successful.'
      : `Download successful. ${limitData.downloads_remaining} download(s) remaining.`,
    'success'
  );

}


/* =========================
   REVIEWS & TESTIMONIALS SLIDER
========================= */

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #0B2545 0%, #1E5296 100%)',
  'linear-gradient(135deg, #134E5E 0%, #2E7D4F 100%)',
  'linear-gradient(135deg, #7A3E16 0%, #D9A441 100%)',
  'linear-gradient(135deg, #3D1F5A 0%, #764BA2 100%)',
  'linear-gradient(135deg, #1C3B57 0%, #0083B0 100%)',
  'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)'
];

function getAvatarBg(name){
  let hash = 0;
  const str = String(name || 'S');
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function renderStarsHtml(rating){
  let html = '';
  for(let i = 1; i <= 5; i++){
    if(i <= rating){
      html += `<svg class="star filled" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    } else {
      html += `<svg class="star empty" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    }
  }
  return html;
}

let currentReviewIndex = 0;
let reviewSliderInitialized = false;
let reviewAutoplayTimer = null;

function getCardsPerView() {
  if (window.innerWidth <= 640) return 1;
  if (window.innerWidth <= 992) return 2;
  return 3;
}

function updateReviewSlider() {
  const track = document.getElementById('reviewTrack');
  const prevBtn = document.getElementById('revPrev');
  const nextBtn = document.getElementById('revNext');
  const dotsContainer = document.getElementById('revDots');
  const nav = document.getElementById('reviewNav');
  if (!track || !reviews.length) return;

  const cardsPerView = getCardsPerView();
  const maxIndex = Math.max(0, reviews.length - cardsPerView);

  if (currentReviewIndex > maxIndex) currentReviewIndex = maxIndex;
  if (currentReviewIndex < 0) currentReviewIndex = 0;

  const firstCard = track.querySelector('.review-card');
  if (firstCard) {
    const cardRect = firstCard.getBoundingClientRect();
    const gap = window.innerWidth <= 640 ? 16 : 24;
    const shift = currentReviewIndex * (cardRect.width + gap);
    track.style.transform = `translateX(-${shift}px)`;
  }

  if (reviews.length <= cardsPerView) {
    if (nav) nav.style.display = 'none';
  } else {
    if (nav) nav.style.display = 'flex';
  }

  if (prevBtn) prevBtn.disabled = currentReviewIndex === 0;
  if (nextBtn) nextBtn.disabled = currentReviewIndex >= maxIndex;

  if (dotsContainer) {
    const totalPages = maxIndex + 1;
    if (totalPages <= 1) {
      dotsContainer.innerHTML = '';
    } else {
      dotsContainer.innerHTML = Array.from({ length: totalPages }).map((_, i) => `
        <button class="review-dot ${i === currentReviewIndex ? 'active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>
      `).join('');

      dotsContainer.querySelectorAll('.review-dot').forEach(dot => {
        dot.onclick = () => {
          currentReviewIndex = Number(dot.dataset.index);
          updateReviewSlider();
          restartReviewAutoplay();
        };
      });
    }
  }
}

function startReviewAutoplay() {
  if (reviewAutoplayTimer) clearInterval(reviewAutoplayTimer);
  reviewAutoplayTimer = setInterval(() => {
    const cardsPerView = getCardsPerView();
    const maxIndex = Math.max(0, reviews.length - cardsPerView);
    if (maxIndex <= 0) return;

    if (currentReviewIndex >= maxIndex) {
      currentReviewIndex = 0;
    } else {
      currentReviewIndex++;
    }
    updateReviewSlider();
  }, 6000);
}

function restartReviewAutoplay() {
  startReviewAutoplay();
}

function setupReviewSlider() {
  updateReviewSlider();

  if (reviewSliderInitialized) return;
  reviewSliderInitialized = true;

  const prevBtn = document.getElementById('revPrev');
  const nextBtn = document.getElementById('revNext');
  const trackOuter = document.querySelector('.review-track-outer');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentReviewIndex > 0) {
        currentReviewIndex--;
        updateReviewSlider();
        restartReviewAutoplay();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const cardsPerView = getCardsPerView();
      const maxIndex = Math.max(0, reviews.length - cardsPerView);
      if (currentReviewIndex < maxIndex) {
        currentReviewIndex++;
        updateReviewSlider();
        restartReviewAutoplay();
      }
    });
  }

  let touchStartX = 0;
  if (trackOuter) {
    trackOuter.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    trackOuter.addEventListener('touchend', e => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      const cardsPerView = getCardsPerView();
      const maxIndex = Math.max(0, reviews.length - cardsPerView);

      if (diff > 40 && currentReviewIndex < maxIndex) {
        currentReviewIndex++;
        updateReviewSlider();
        restartReviewAutoplay();
      } else if (diff < -40 && currentReviewIndex > 0) {
        currentReviewIndex--;
        updateReviewSlider();
        restartReviewAutoplay();
      }
    }, { passive: true });

    trackOuter.addEventListener('mouseenter', () => {
      if (reviewAutoplayTimer) clearInterval(reviewAutoplayTimer);
    });

    trackOuter.addEventListener('mouseleave', () => {
      startReviewAutoplay();
    });
  }

  window.addEventListener('resize', () => {
    updateReviewSlider();
  });

  startReviewAutoplay();
}

function renderReviews(){

  const grid = document.getElementById('reviewTrack');
  if (!grid) return;

  if (!reviews.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <p>No approved reviews yet.</p>
      </div>
    `;
    const nav = document.getElementById('reviewNav');
    if (nav) nav.style.display = 'none';
    return;
  }

  grid.innerHTML = reviews.map(r => {
    const rating = Math.max(1, Math.min(5, Number(r.rating || 5)));
    const initial = (r.name || 'S').trim().charAt(0).toUpperCase();
    const avatarBg = getAvatarBg(r.name);

    return `
      <div class="review-card">
        <div class="review-card-top">
          <div class="review-stars-wrap">
            <div class="review-stars" aria-label="${rating} out of 5 stars">
              ${renderStarsHtml(rating)}
            </div>
            <span class="review-rating-num">${rating}.0</span>
          </div>
          <div class="review-quote-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
          </div>
        </div>

        <p class="review-message">“${esc(r.message)}”</p>

        <div class="review-footer">
          <div class="review-avatar" style="background:${avatarBg}">
            ${esc(initial)}
          </div>
          <div class="review-person-info">
            <strong class="review-name">${esc(r.name)}</strong>
            <div class="review-meta">
              <span class="review-course">${esc(r.course)}</span>
              <span class="review-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  setupReviewSlider();
}

/* =========================
   CONTACT SETTINGS
========================= */

function renderContact(){

  const rows=document.getElementById('contactInfoRows');

  if(!rows)return;

  const address = contactSettings.address || 'Nyati Elysia, Kharadi, Pune - 411014';
  const phone = contactSettings.phone || '9766410096';
  const email = contactSettings.email || 'info@aaclasses.com';
  const timings = contactSettings.timings || 'Monday – Saturday: 9:00 AM – 8:00 PM';

  rows.innerHTML=`

    ${
      address
      ? `
        <div class="contact-row">
          <div class="contact-row-icon">📍</div>
          <div class="contact-row-text">
            <strong>Address</strong>
            <span>${esc(address)}</span>
          </div>
        </div>
      `
      : ''
    }

    ${
      phone
      ? `
        <div class="contact-row">
          <div class="contact-row-icon">📞</div>
          <div class="contact-row-text">
            <strong>Phone</strong>
            <span>${esc(phone)}</span>
          </div>
        </div>
      `
      : ''
    }

    ${
      email
      ? `
        <div class="contact-row">
          <div class="contact-row-icon">✉️</div>
          <div class="contact-row-text">
            <strong>Email</strong>
            <span>${esc(email)}</span>
          </div>
        </div>
      `
      : ''
    }

    ${
      timings
      ? `
        <div class="contact-row">
          <div class="contact-row-icon">🕒</div>
          <div class="contact-row-text">
            <strong>Office Hours</strong>
            <span>${esc(timings)}</span>
          </div>
        </div>
      `
      : ''
    }

  `;

  const whatsappBtn=document.getElementById('whatsappBtn');

  if(whatsappBtn){

    if(phone){

      const cleanPhone=phone.replace(/\D/g,'');

      whatsappBtn.disabled=false;

      whatsappBtn.textContent='WhatsApp / Call Now';

      whatsappBtn.onclick=()=>{

        window.open(
          `https://wa.me/${cleanPhone}`,
          '_blank'
        );

      };

    }else{

      whatsappBtn.disabled=true;

      whatsappBtn.textContent=
        'WhatsApp / Call Now — add number to enable';

      whatsappBtn.onclick=null;

    }

  }

}

/* =========================
   REVIEW FORM
========================= */

function setupReviewForm(){

  const form=
    document.getElementById('reviewForm');

  if(!form)return;
const openButton =
  document.getElementById('openReviewForm');

const overlay =
  document.getElementById('reviewFormOverlay');

if (openButton && overlay) {
  openButton.addEventListener('click', () => {
    overlay.classList.add('open');
  });
}
  const closeButton =
  document.getElementById('closeReviewForm');

if (closeButton && overlay) {
  closeButton.addEventListener('click', () => {
    overlay.classList.remove('open');
  });
}

if (overlay) {
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      overlay.classList.remove('open');
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && overlay) {
    overlay.classList.remove('open');
  }
});

  form.addEventListener(
    'submit',
    async e=>{

      e.preventDefault();


      if(!supabaseClient){

        toast(
          'Website is not connected to Supabase.',
          'error'
        );

        return;
      }


      const name=
        document
          .getElementById('reviewName')
          ?.value
          .trim();


      const course=
        document
          .getElementById('reviewCourse')
          ?.value
          .trim();


      const rating=
        Number(
          document
            .getElementById('reviewRating')
            ?.value || 5
        );


      const message=
        document
          .getElementById('reviewMessage')
          ?.value
          .trim();


      if(!name||!message){

        toast(
          'Please fill in your name and review.',
          'error'
        );

        return;
      }


      
const { error } = await supabaseClient
  .from('reviews')
  .insert({
    name,
    klass: course || null,
    rating,
    review_text: message,
    status: 'pending'
  });


      if(error){

        console.error(
          'Review submit error:',
          error
        );

        toast(
          'Could not submit your review.',
          'error'
        );

        return;
      }


      form.reset();


      toast(
        'Thank you! Your review has been submitted for approval.',
        'success'
      );

    }
  );

}


/* =========================
   ENQUIRY FORM
========================= */

function setupEnquiry(){

  const form = document.getElementById('enquiryForm');
  if (!form) return;

  const studentInput = document.getElementById('enqStudent');
  const parentInput = document.getElementById('enqParent');
  const phoneInput = document.getElementById('enqPhone');
  const emailInput = document.getElementById('enqEmail');
  const classSelect = document.getElementById('enqClass');
  const courseSelect = document.getElementById('enqCourse');
  const messageInput = document.getElementById('enqMessage');
  const submitBtn = document.getElementById('enquirySubmitBtn');

  // Clear validation error when user interacts
  [studentInput, phoneInput, emailInput, classSelect, courseSelect].forEach(input => {
    if (!input) return;
    const clearError = () => {
      const field = input.closest('.form-field');
      if (field) field.classList.remove('invalid');
    };
    input.addEventListener('input', clearError);
    input.addEventListener('change', clearError);
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    let isValid = true;
    let firstInvalid = null;

    function markField(input, isFieldValid) {
      if (!input) return;
      const field = input.closest('.form-field');
      if (!field) return;
      if (!isFieldValid) {
        field.classList.add('invalid');
        isValid = false;
        if (!firstInvalid) firstInvalid = input;
      } else {
        field.classList.remove('invalid');
      }
    }

    const studentVal = (studentInput?.value || '').trim();
    const parentVal = (parentInput?.value || '').trim();
    const phoneVal = (phoneInput?.value || '').trim();
    const emailVal = (emailInput?.value || '').trim();
    const classVal = (classSelect?.value || '').trim();
    const courseVal = (courseSelect?.value || '').trim();
    const messageVal = (messageInput?.value || '').trim();

    // Validations
    markField(studentInput, studentVal.length >= 2);
    markField(phoneInput, /^[0-9+() -]{7,16}$/.test(phoneVal) && phoneVal.replace(/\D/g, '').length >= 7);
    markField(emailInput, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal));
    markField(classSelect, classVal.length > 0);
    markField(courseSelect, courseVal.length > 0);

    if (!isValid) {
      if (firstInvalid) firstInvalid.focus();
      toast('Please fill in all required fields correctly.', 'error');
      return;
    }

    if (!supabaseClient) {
      toast('Website is not connected to Supabase.', 'error');
      return;
    }

    const origBtnText = submitBtn ? submitBtn.textContent : 'Submit Enquiry';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting Enquiry...';
    }

    try {
      const generatedId = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'enq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

      const payload = {
        id: generatedId,
        student: studentVal,
        parent: parentVal || '',
        phone: phoneVal,
        email: emailVal,
        klass: classVal,
        course: courseVal,
        message: messageVal || ''
      };

      const { error } = await supabaseClient
        .from('enquiries')
        .insert([payload]);

      if (error) {
        console.error('Enquiry error:', error);
        toast('Could not submit enquiry: ' + (error.message || 'Database error'), 'error');
        return;
      }

      form.reset();
      toast('Thank you! We will contact you soon.', 'success');

    } catch (err) {
      console.error('Submission exception:', err);
      toast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = origBtnText;
      }
    }
  });
}


/* =========================
   NAVIGATION
========================= */

function setupNav(){

  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  if(toggle && links){
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', (e)=>{
      e.stopPropagation();
      const isOpen = links.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach(link=>{
      link.addEventListener('click', ()=>{
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e)=>{
      if(links.classList.contains('open') && !links.contains(e.target) && !toggle.contains(e.target)){
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape' && links.classList.contains('open')){
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }


  const adminEntry=
    document.getElementById(
      'adminEntryLink'
    );


  if(adminEntry){

    adminEntry.addEventListener(
      'click',
      e=>{

        e.preventDefault();

        window.location.href=
          'admin/login.html';

      }
    );

  }

}


/* =========================
   INITIALIZATION
========================= */

async function init(){

  setupNav();

  injectStudentAuthUI();

  renderCourses();

  renderWhy();

  renderLiveClasses();

  await loadData();

  renderLiveClasses();

  populateFilters();

  renderMaterials();

  renderReviews();

  renderContact();

  setupReviewForm();

  setupEnquiry();

  await loadStudentSession();


  /* Study Material tabs */

  document
    .querySelectorAll('.sm-tab')
    .forEach(t=>{

      t.onclick=()=>{

        document
          .querySelectorAll('.sm-tab')
          .forEach(x=>
            x.classList.remove('active')
          );

        t.classList.add('active');

        currentTab=
          t.dataset.tab;

        renderMaterials();

      };

    });


  /* Search */

  document
    .getElementById('smSearch')
    ?.addEventListener(
      'input',
      renderMaterials
    );


  /* Class filter */

  document
    .getElementById('filterClass')
    ?.addEventListener(
      'change',
      renderMaterials
    );


  /* Course filter */

  document
    .getElementById('filterCourse')
    ?.addEventListener(
      'change',
      renderMaterials
    );


  /* Subject filter */

  document
    .getElementById('filterSubject')
    ?.addEventListener(
      'change',
      renderMaterials
    );


  /* Reveal sections */

  document
    .querySelectorAll('.reveal')
    .forEach(x=>
      x.classList.add('in')
    );

}


init();
