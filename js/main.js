/* AA Classes public website */
const COURSES = [
  {id:'jee',accent:'',tag:'Competitive Exam',title:'JEE Preparation',
   desc:'Comprehensive preparation for JEE with strong conceptual learning, problem-solving practice, regular tests and expert guidance.',
   tags:['Physics','Chemistry','Mathematics','JEE-focused practice','Mock tests','Doubt solving'],
   eligibility:'Class 11–12 (Science stream)',subjects:'Physics, Chemistry, Mathematics',
   methodology:'Concept-first teaching, chapter-wise problem sets, and weekly mock tests calibrated to JEE difficulty and pattern.',
   testing:'Weekly topic tests, monthly full-syllabus mock exams, and detailed performance analysis after every test.'},
  {id:'olympiad',accent:'accent-gold',tag:'Classes 3–10',title:'Olympiad Preparation',
   desc:'Special preparation for students from Classes 3 to 10 who want to develop strong mathematical and logical problem-solving skills and prepare for Olympiad-level examinations.',
   tags:['Logical thinking','Advanced problem solving','Olympiad-style questions','Regular practice','Mock tests'],
   eligibility:'Classes 3–10',subjects:'Mathematics & Logical Reasoning',
   methodology:'Puzzle-based learning and layered problem sets that build from fundamentals to Olympiad-level reasoning.',
   testing:'Regular Olympiad-pattern mock tests with detailed solution walkthroughs.'},
  {id:'regular-maths',accent:'accent-green',tag:'Classes 3–10',title:'Regular Mathematics Classes',
   desc:'Build strong mathematical fundamentals with structured learning, regular practice and personal guidance.',
   tags:['Classes 3–10','School curriculum support','Concept clarification','Homework assistance','Regular tests','Doubt solving'],
   eligibility:'Classes 3–10',subjects:'Mathematics (aligned to school curriculum)',
   methodology:'Step-by-step concept building aligned with the school syllabus, paired with homework support and doubt-solving sessions.',
   testing:'Regular chapter tests plus homework review to track steady progress.'}
];

const WHY_ITEMS = [
 {title:'Experienced Faculty',text:'Educators with years of classroom experience and a track record of results.',icon:'M12 3l9 4.5-9 4.5-9-4.5L12 3z M6.5 10v5c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-5'},
 {title:'Concept-Based Teaching',text:'Every topic is taught to be understood, not memorised.',icon:'M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.5.4.8 1 .8 1.7h5.6c0-.7.3-1.3.8-1.7A6 6 0 0012 3z'},
 {title:'Personal Attention',text:'Small batches so every student gets noticed and guided.',icon:'M12 8.4a3.4 3.4 0 100-6.8 3.4 3.4 0 000 6.8zM5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5'},
 {title:'Regular Tests',text:'Frequent assessments that build real exam-day readiness.',icon:'M4 19V6a2 2 0 012-2h9l5 5v10a2 2 0 01-2 2H6a2 2 0 01-2-2z M8 13h8M8 16.5h5'},
 {title:'Doubt Solving',text:'Dedicated sessions so no question goes unanswered.',icon:'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z'},
 {title:'Quality Study Material',text:'Curated notes and practice papers built by our own faculty.',icon:'M4 6.5A2.5 2.5 0 016.5 4H20v15.5A1.5 1.5 0 0118.5 21H6.5A2.5 2.5 0 014 18.5v-12z'}
];

const SEED_MATERIALS = [
 {id:'m1',title:'Class 10 Mathematics – Algebra Notes',category:'notes',subject:'Mathematics',klass:'Class 10',desc:'Complete notes covering linear equations, quadratic equations and polynomials with solved examples.',fileType:'PDF',fileSize:'2.1 MB',date:'2026-08-02',downloads:184,hasFile:false},
 {id:'m2',title:'Class 9 Science – Motion & Force Notes',category:'notes',subject:'Science',klass:'Class 9',desc:'Concise notes on laws of motion, force and momentum with diagrams.',fileType:'PDF',fileSize:'1.6 MB',date:'2026-07-20',downloads:97,hasFile:false},
 {id:'m3',title:'JEE Physics – Kinematics Formula Sheet',category:'notes',subject:'Physics',klass:'JEE',desc:'One-page formula reference for kinematics, covering all key equations and derivations.',fileType:'PDF',fileSize:'0.8 MB',date:'2026-08-15',downloads:342,hasFile:false},
 {id:'m4',title:'Olympiad Maths – Number Theory Basics',category:'notes',subject:'Mathematics',klass:'Class 6-8',desc:'Foundational number theory concepts used frequently in Olympiad-style questions.',fileType:'DOCX',fileSize:'1.1 MB',date:'2026-06-30',downloads:65,hasFile:false},
 {id:'p1',title:'Class 10 Mathematics Practice Paper – Chapter 1',category:'papers',subject:'Mathematics',klass:'Class 10',desc:'20 practice questions on real numbers with a full solution key.',fileType:'PDF',fileSize:'1.3 MB',date:'2026-08-10',downloads:221,difficulty:'Medium',hasFile:false},
 {id:'p2',title:'JEE Chemistry Mock Test – Organic Chemistry',category:'papers',subject:'Chemistry',klass:'JEE',desc:'Full-length mock covering nomenclature, reaction mechanisms and isomerism.',fileType:'PDF',fileSize:'2.4 MB',date:'2026-08-05',downloads:158,difficulty:'Hard',hasFile:false},
 {id:'p3',title:'Olympiad Maths Practice Set – Logical Reasoning',category:'papers',subject:'Mathematics',klass:'Class 3-5',desc:'Beginner-friendly logic puzzles to build Olympiad problem-solving skills.',fileType:'PDF',fileSize:'0.9 MB',date:'2026-07-28',downloads:73,difficulty:'Easy',hasFile:false}
];
const SEED_REVIEWS = [
 {id:'r1',name:'Aarav Shah',klass:'Class 10',rating:5,text:'AA Classes helped me understand Mathematics much more clearly. The teachers explain concepts in a very simple way and the regular practice is really helpful.',status:'approved'},
 {id:'r2',name:'Meera Patel',klass:'JEE Batch',rating:5,text:'The doubt-solving sessions made all the difference for me. I could finally ask questions without hesitation and my problem-solving speed improved a lot.',status:'approved'},
 {id:'r3',name:'Kabir Mehta',klass:'Class 8',rating:4,text:'I joined for the Olympiad course and really enjoyed the logic-based problems. The regular tests kept me on track throughout the term.',status:'approved'},
 {id:'r4',name:'Ishaan Rao',klass:'Class 9',rating:5,text:'Personal attention in small batches made a huge difference. My teacher always made time to clear my doubts after class.',status:'approved'}
];

const SUPABASE_URL='https://zgrctvejgmyubhnxrlqr.supabase.co';
const SUPABASE_KEY='sb_publishable_s6UQp7nI3LPyXDJ4u6mipg_62wsb-ZW';
let supabaseClient=null, materials=[], reviews=[], settings={address:'',phone:'',email:'',timings:''};
if(window.supabase && !SUPABASE_KEY.includes('PASTE_YOUR_')) supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

function toast(msg,type=''){const h=document.getElementById('toastHost');if(!h)return;const e=document.createElement('div');e.className='toast '+type;e.textContent=msg;h.appendChild(e);setTimeout(()=>e.remove(),3200);}
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function mapMaterial(r){return {id:r.id,title:r.title,category:r.category,subject:r.subject,klass:r.klass,desc:r.description||'',fileType:r.file_type||'PDF',fileSize:r.file_size||'',date:r.created_at?.slice(0,10)||'',downloads:Number(r.downloads||0),difficulty:r.difficulty||'',hasFile:!!r.file_path,filePath:r.file_path||''};}
function mapReview(r){return {id:r.id,name:r.name,klass:r.klass,rating:Number(r.rating),text:r.review_text,status:r.status};}
async function loadData(){
 if(!supabaseClient){materials=SEED_MATERIALS.slice();reviews=SEED_REVIEWS.slice();return;}
 try{
  const [m,r,s]=await Promise.all([
   supabaseClient.from('study_materials').select('*').order('created_at',{ascending:false}),
   supabaseClient.from('reviews').select('*').eq('status','approved').order('created_at',{ascending:false}),
   supabaseClient.from('contact_settings').select('*').eq('id',1).maybeSingle()
  ]);
  if(m.error||r.error||s.error) throw(m.error||r.error||s.error);
  materials=(m.data||[]).map(mapMaterial);reviews=(r.data||[]).map(mapReview);
  if(s.data)settings={address:s.data.address||'',phone:s.data.phone||'',email:s.data.email||'',timings:s.data.timings||''};
 }catch(e){console.error(e);materials=SEED_MATERIALS.slice();reviews=SEED_REVIEWS.slice();}
}
function renderCourses(){
 const g=document.getElementById('courseGrid');if(!g)return;
 g.innerHTML=COURSES.map(c=>`<div class="course-card ${c.accent}"><span class="course-tag">${c.tag}</span><h3>${c.title}</h3><p class="course-desc">${c.desc}</p><div class="course-tags">${c.tags.map(t=>`<span class="pill">${t}</span>`).join('')}</div><button class="btn btn-navy btn-block" data-course="${c.id}">View Course</button></div>`).join('');
 g.querySelectorAll('[data-course]').forEach(b=>b.onclick=()=>openCourseModal(b.dataset.course));
}
function openCourseModal(id){
 const c=COURSES.find(x=>x.id===id);if(!c)return;
 const overlay=document.getElementById('courseModalOverlay');if(!overlay)return;
 const box=document.getElementById('courseModalBox');box.innerHTML=`<button class="modal-close" data-close>×</button><div class="modal-eyebrow">${c.tag}</div><h3>${c.title}</h3><p class="modal-sub">${c.desc}</p><div class="modal-section"><h5>Eligibility</h5><p>${c.eligibility}</p></div><div class="modal-section"><h5>Subjects Covered</h5><p>${c.subjects}</p></div><div class="modal-section"><h5>Course Features</h5><ul class="check-list">${c.tags.map(t=>`<li>✓ ${t}</li>`).join('')}</ul></div><div class="modal-section"><h5>Learning Methodology</h5><p>${c.methodology}</p></div><div class="modal-section"><h5>Practice & Testing</h5><p>${c.testing}</p></div><div class="modal-actions"><a href="contact.html" class="btn btn-gold" style="flex:1;">Enquire About This Course</a></div>`;
 overlay.classList.add('open');box.querySelector('[data-close]').onclick=()=>overlay.classList.remove('open');
}
function renderWhy(){const g=document.getElementById('whyGrid');if(g)g.innerHTML=WHY_ITEMS.map(w=>`<div class="why-item"><div class="why-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke="currentColor"><path d="${w.icon}"/></svg></div><h4>${w.title}</h4><p>${w.text}</p></div>`).join('');}
let currentTab='notes';
function populateFilters(){
 const c=document.getElementById('filterClass'),s=document.getElementById('filterSubject');if(!c||!s)return;
 c.innerHTML='<option value="">All Classes</option>'+[...new Set(materials.map(x=>x.klass).filter(Boolean))].sort().map(x=>`<option>${esc(x)}</option>`).join('');
 s.innerHTML='<option value="">All Subjects</option>'+[...new Set(materials.map(x=>x.subject).filter(Boolean))].sort().map(x=>`<option>${esc(x)}</option>`).join('');
}
function renderMaterials(){
 const g=document.getElementById('materialGrid');if(!g)return;
 const q=(document.getElementById('smSearch')?.value||'').toLowerCase(),fc=document.getElementById('filterClass')?.value||'',fs=document.getElementById('filterSubject')?.value||'';
 let list=materials.filter(m=>
  currentTab==='papers'
    ? (m.category==='papers' || m.category==='paper')
    : m.category===currentTab
);if(q)list=list.filter(m=>(m.title+' '+m.subject).toLowerCase().includes(q));if(fc)list=list.filter(m=>m.klass===fc);if(fs)list=list.filter(m=>m.subject===fs);
 g.innerHTML=list.length?list.map(m=>`<div class="material-card"><div class="mc-top"><h4>${esc(m.title)}</h4><span class="mc-filetype">${esc(m.fileType)}</span></div><div class="mc-meta"><span>${esc(m.subject)}</span><span>·</span><span>${esc(m.klass)}</span>${m.difficulty?`<span class="difficulty ${m.difficulty.toLowerCase()}">${esc(m.difficulty)}</span>`:''}</div><p class="mc-desc">${esc(m.desc)}</p><div class="mc-meta"><span>${esc(m.fileSize)}</span><span>·</span><span>Uploaded ${esc(m.date)}</span></div><div class="mc-bottom"><span class="mc-downloads">${m.downloads} downloads</span><button class="btn btn-gold btn-sm" data-download="${m.id}">Download</button></div></div>`).join(''):`<div class="empty-state"><p>No study material available yet. Check back soon!</p></div>`;
 g.querySelectorAll('[data-download]').forEach(b=>b.onclick=()=>downloadMaterial(b.dataset.download));
}
async function downloadMaterial(id){
 const m=materials.find(x=>x.id===id);if(!m)return;
 if(!supabaseClient||!m.filePath){toast('This material does not have a downloadable file yet.','error');return;}
 const {data,error}=await supabaseClient.storage.from('study-materials').download(m.filePath);
 if(error){toast('Could not download the file.','error');return;}
 const a=document.createElement('a');a.href=URL.createObjectURL(data);a.download=m.filePath.split('/').pop()||m.title;a.click();
 setTimeout(()=>URL.revokeObjectURL(a.href),1500);
 const next=Number(m.downloads||0)+1;await supabaseClient.from('study_materials').update({downloads:next}).eq('id',id);m.downloads=next;renderMaterials();
}
function renderReviews(){
 const t=document.getElementById('reviewTrack'),d=document.getElementById('revDots');if(!t||!d)return;
 const list=reviews.filter(r=>r.status==='approved');
 if(!list.length){t.innerHTML='<div class="review-slide"><div class="review-card"><p style="color:var(--slate)">No reviews yet — be the first to share your experience!</p></div></div>';d.innerHTML='';return;}
 t.innerHTML=list.map(r=>`<div class="review-slide"><div class="review-card"><div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div><p class="review-quote">"${esc(r.text)}"</p><div class="review-person"><div class="review-avatar">${esc(r.name.charAt(0))}</div><div class="review-person-info"><strong>${esc(r.name)}</strong><span>${esc(r.klass)}</span></div></div></div></div>`).join('');
 let i=0;d.innerHTML=list.map((_,n)=>`<button class="review-dot ${n===0?'active':''}" data-i="${n}" aria-label="Go to review ${n+1}"></button>`).join('');
 const update=()=>{t.style.transform=`translateX(-${i*100}%)`;d.querySelectorAll('.review-dot').forEach((x,n)=>x.classList.toggle('active',n===i));};
 d.querySelectorAll('button').forEach(b=>b.onclick=()=>{i=+b.dataset.i;update();});
 document.getElementById('revPrev')?.addEventListener('click',()=>{i=(i-1+list.length)%list.length;update();});
 document.getElementById('revNext')?.addEventListener('click',()=>{i=(i+1)%list.length;update();});
 update();
}
function renderContact(){
 const h=document.getElementById('contactInfoRows');if(!h)return;
 const rows=[['Address',settings.address],['Phone',settings.phone],['Email',settings.email],['Office Timings',settings.timings]];
 h.innerHTML=rows.map(([l,v])=>`<div class="info-row"><div class="icon">•</div><div><h5>${l}</h5><p>${esc(v||'Not updated yet')}</p></div></div>`).join('');
 const b=document.getElementById('whatsappBtn'),digits=(settings.phone||'').replace(/\D/g,'');
 if(b&&digits.length>=7){b.disabled=false;b.textContent='WhatsApp / Call Now';b.onclick=()=>window.open('https://wa.me/'+digits,'_blank');}
}
function setupReviewForm(){
 const o=document.getElementById('reviewFormOverlay'),f=document.getElementById('reviewForm');if(!o||!f)return;
 document.getElementById('openReviewForm')?.addEventListener('click',()=>o.classList.add('open'));o.querySelectorAll('[data-close]').forEach(x=>x.onclick=()=>o.classList.remove('open'));
 let stars=0;o.querySelectorAll('[data-star]').forEach(b=>b.onclick=()=>{stars=+b.dataset.star;o.querySelectorAll('[data-star]').forEach(x=>x.classList.toggle('filled',+x.dataset.star<=stars));});
 f.onsubmit=async e=>{e.preventDefault();if(!supabaseClient){toast('The website is not connected to Supabase yet.','error');return;}const name=revName.value.trim(),klass=revClass.value.trim(),text=revText.value.trim();if(!name||!klass||!text||!stars){toast('Please fill in every field and select a rating.','error');return;}const {error}=await supabaseClient.from('reviews').insert({id:'r'+Date.now(),name,klass,rating:stars,review_text:text,status:'pending'});if(error){toast('Could not submit your review.','error');return;}f.reset();stars=0;o.classList.remove('open');toast('Thank you! Your review has been submitted for approval.','success');};
}
function setupEnquiry(){
 const f=document.getElementById('enquiryForm');if(!f)return;
 f.onsubmit=async e=>{e.preventDefault();if(!supabaseClient){toast('The website is not connected to Supabase yet.','error');return;}const payload={id:'e'+Date.now(),student:enqStudent.value.trim(),parent:enqParent.value.trim(),phone:enqPhone.value.trim(),email:enqEmail.value.trim(),klass:enqClass.value,course:enqCourse.value,message:enqMessage.value.trim()};if(!payload.student||!payload.phone||!payload.email||!payload.klass||!payload.course){toast('Please complete the required fields.','error');return;}const {error}=await supabaseClient.from('enquiries').insert(payload);if(error){toast('Could not submit your enquiry.','error');return;}f.reset();toast("Thanks! Your enquiry has been received — we'll be in touch soon.",'success');};
}
function setupNav(){const t=document.getElementById('navToggle'),n=document.getElementById('navLinks');if(t&&n)t.onclick=()=>n.classList.toggle('open');n?.querySelectorAll('a').forEach(a=>a.onclick=()=>n.classList.remove('open'));}
async function init(){
 setupNav();renderCourses();renderWhy();await loadData();populateFilters();renderMaterials();renderReviews();renderContact();setupReviewForm();setupEnquiry();
 document.querySelectorAll('.sm-tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.sm-tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');currentTab=t.dataset.tab;renderMaterials();});
 document.getElementById('smSearch')?.addEventListener('input',renderMaterials);document.getElementById('filterClass')?.addEventListener('change',renderMaterials);document.getElementById('filterSubject')?.addEventListener('change',renderMaterials);
 document.querySelectorAll('.reveal').forEach(x=>x.classList.add('in'));
}
init();
