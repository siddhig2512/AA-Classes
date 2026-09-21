/* AA Classes public website */

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

let materials=[];
let reviews=[];
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
  return {
    ...r,
    name:r.name||'Student',
    course:r.course||'',
    rating:Number(r.rating||5),
    message:r.message||''
  };
}

async function loadData(){

  if(!supabaseClient){
    materials=SEED_MATERIALS;
    reviews=[];
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

    if(reviewError){
      console.error('Reviews error:',reviewError);
      reviews=[];
    }else{
      reviews=(reviewData||[]).map(mapReview);
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

  }catch(error){
    console.error('loadData error:',error);
    materials=SEED_MATERIALS;
    reviews=[];
  }
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


  if(mode==='signup'){

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

    options:{
      data:{
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
   REVIEWS
========================= */

function renderReviews(){

  const grid=
    document.getElementById('reviewGrid');

  if(!grid)return;


  if(!reviews.length){

    grid.innerHTML=`
      <div class="empty-state">
        <p>No approved reviews yet.</p>
      </div>
    `;

    return;
  }


  grid.innerHTML=
    reviews.map(r=>`

      <div class="review-card">

        <div class="review-stars">
          ${'★'.repeat(
            Math.max(
              1,
              Math.min(
                5,
                Number(r.rating||5)
              )
            )
          )}
        </div>

        <p class="review-message">
          “${esc(r.message)}”
        </p>

        <div class="review-person">

          <div class="review-avatar">
            ${esc(
              (r.name||'S')
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          <div>
            <strong>${esc(r.name)}</strong>
            <span>${esc(r.course||'Student')}</span>
          </div>

        </div>

      </div>

    `).join('');

}


/* =========================
   CONTACT SETTINGS
========================= */

function renderContact(){

  const rows=document.getElementById('contactInfoRows');

  if(!rows)return;

  const address=contactSettings.address||'';
  const phone=contactSettings.phone||'';
  const email=contactSettings.email||'';
  const timings=contactSettings.timings||'';

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


      const {
        error
      }=await supabaseClient
        .from('reviews')
        .insert({

          name,
          course,
          rating,
          message,
          status:'pending'

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

  const form=
    document.getElementById('enquiryForm');

  if(!form)return;


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


      const formData=
        new FormData(form);


      const payload={
        name:
          formData.get('name')?.toString().trim()||'',

        phone:
          formData.get('phone')?.toString().trim()||'',

        email:
          formData.get('email')?.toString().trim()||'',

        message:
          formData.get('message')?.toString().trim()||''
      };


      const {
        error
      }=await supabaseClient
        .from('enquiries')
        .insert(payload);


      if(error){

        console.error(
          'Enquiry error:',
          error
        );

        toast(
          'Could not submit your enquiry.',
          'error'
        );

        return;
      }


      form.reset();


      toast(
        'Thank you! We will contact you soon.',
        'success'
      );

    }
  );

}


/* =========================
   NAVIGATION
========================= */

function setupNav(){

  const toggle=
    document.getElementById('navToggle');

  const links=
    document.getElementById('navLinks');


  if(toggle&&links){

    toggle.addEventListener(
      'click',
      ()=>{

        links.classList.toggle('open');

      }
    );


    links
      .querySelectorAll('a')
      .forEach(link=>{

        link.addEventListener(
          'click',
          ()=>{
            links.classList.remove('open');
          }
        );

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

  await loadData();

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
