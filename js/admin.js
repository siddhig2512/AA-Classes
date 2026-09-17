const SUPABASE_URL='https://zgrctvejgmyubhnxrlqr.supabase.co';
const SUPABASE_KEY='sb_publishable_s6UQp7nI3LPyXDJ4u6mipg_62wsb-ZW';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let materials=[], reviews=[], enquiries=[];
let settings={address:'',phone:'',email:'',timings:''};

// Get HTML elements explicitly
const stats = document.getElementById('stats');
const materialsBody = document.getElementById('materialsBody');
const pendingBody = document.getElementById('pendingBody');
const allReviewsBody = document.getElementById('allReviewsBody');
const enquiriesBody = document.getElementById('enquiriesBody');

const logout = document.getElementById('logout');

const openUpload = document.getElementById('openUpload');
const closeUpload = document.getElementById('closeUpload');
const uploadOverlay = document.getElementById('uploadOverlay');
const uploadForm = document.getElementById('uploadForm');
const uploadBtn = document.getElementById('uploadBtn');

const upTitle = document.getElementById('upTitle');
const upCategory = document.getElementById('upCategory');
const upSubject = document.getElementById('upSubject');
const upClass = document.getElementById('upClass');
const upDesc = document.getElementById('upDesc');
const upFile = document.getElementById('upFile');

const contactForm = document.getElementById('contactForm');
const setAddress = document.getElementById('setAddress');
const setPhone = document.getElementById('setPhone');
const setEmail = document.getElementById('setEmail');
const setTimings = document.getElementById('setTimings');

const toastHost = document.getElementById('toastHost');

function esc(s){
    return String(s ?? '').replace(/[&<>"']/g,m=>({
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;',
        "'":'&#39;'
    }[m]));
}

function toast(message,type=''){
    const e=document.createElement('div');
    e.className='toast '+type;
    e.textContent=message;
    toastHost.appendChild(e);
    setTimeout(()=>e.remove(),3000);
}

async function authGuard(){
    const {data,error}=await sb.auth.getSession();

    if(error || !data.session){
        location.href='login.html';
        return false;
    }

    return true;
}

async function load(){

    const [m,r,e,c]=await Promise.all([
        sb.from('study_materials')
          .select('*')
          .order('created_at',{ascending:false}),

        sb.from('reviews')
          .select('*')
          .order('created_at',{ascending:false}),

        sb.from('enquiries')
          .select('*')
          .order('created_at',{ascending:false}),

        sb.from('contact_settings')
          .select('*')
          .eq('id',1)
          .maybeSingle()
    ]);

    if(m.error || r.error || e.error || c.error){
        console.error('Load error:',m.error,r.error,e.error,c.error);
        toast('Could not load data. Check your Supabase tables and RLS policies.','error');
        return;
    }

    materials=m.data || [];
    reviews=r.data || [];
    enquiries=e.data || [];
    settings=c.data || settings;

    render();
}

function render(){

    stats.innerHTML=`
        <div class="stat-card">
            <div class="num">${materials.length}</div>
            <div class="label">Total Study Materials</div>
        </div>

        <div class="stat-card">
            <div class="num">${materials.filter(x=>x.category==='notes').length}</div>
            <div class="label">Notes</div>
        </div>

        <div class="stat-card">
            <div class="num">${materials.filter(x=>x.category==='papers').length}</div>
            <div class="label">Practice Papers</div>
        </div>

        <div class="stat-card">
            <div class="num">${reviews.filter(x=>x.status==='pending').length}</div>
            <div class="label">Reviews Awaiting Approval</div>
        </div>
    `;

    materialsBody.innerHTML=materials.map(m=>`
        <tr>
            <td>${esc(m.title)}</td>
            <td>${m.category==='notes'?'Notes':'Practice Paper'}</td>
            <td>${esc(m.subject)}</td>
            <td>${esc(m.klass)}</td>
            <td>${esc(m.file_type)}</td>
            <td>${m.downloads||0}</td>
            <td>
                <button class="icon-btn danger"
                    onclick="deleteMaterial('${m.id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join('') ||
    '<tr><td colspan="7" class="empty-mini">No materials yet.</td></tr>';

    const pending=reviews.filter(x=>x.status==='pending');

    pendingBody.innerHTML=pending.map(r=>`
        <tr>
            <td>${esc(r.name)}</td>
            <td>${esc(r.klass)}</td>
            <td>${'★'.repeat(r.rating)}</td>
            <td style="max-width:300px">${esc(r.review_text)}</td>
            <td class="row-actions">
                <button class="icon-btn"
                    onclick="setReview('${r.id}','approved')">
                    Approve
                </button>

                <button class="icon-btn danger"
                    onclick="setReview('${r.id}','rejected')">
                    Reject
                </button>
            </td>
        </tr>
    `).join('') ||
    '<tr><td colspan="5" class="empty-mini">No reviews awaiting approval.</td></tr>';

    allReviewsBody.innerHTML=reviews.map(r=>`
        <tr>
            <td>${esc(r.name)}</td>
            <td>${'★'.repeat(r.rating)}</td>
            <td style="max-width:300px">${esc(r.review_text)}</td>
            <td>
                <span class="badge ${r.status}">
                    ${r.status}
                </span>
            </td>
            <td>
                <button class="icon-btn danger"
                    onclick="deleteReview('${r.id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join('') ||
    '<tr><td colspan="5" class="empty-mini">No reviews yet.</td></tr>';

    enquiriesBody.innerHTML=enquiries.map(x=>`
        <tr>
            <td>${esc(x.student)}</td>
            <td>${esc(x.parent)}</td>
            <td>${esc(x.phone)}</td>
            <td>${esc(x.email)}</td>
            <td>${esc(x.klass)}</td>
            <td>${esc(x.course)}</td>
            <td style="max-width:240px">${esc(x.message)}</td>
        </tr>
    `).join('') ||
    '<tr><td colspan="7" class="empty-mini">No enquiries yet.</td></tr>';

    setAddress.value=settings.address || '';
    setPhone.value=settings.phone || '';
    setEmail.value=settings.email || '';
    setTimings.value=settings.timings || '';
}


// -------------------------------
// ADMIN NAVIGATION
// -------------------------------

document.querySelectorAll('.admin-nav button').forEach(button=>{

    button.onclick=()=>{

        document.querySelectorAll('.admin-nav button')
            .forEach(x=>x.classList.remove('active'));

        button.classList.add('active');

        document.querySelectorAll('.admin-panel')
            .forEach(x=>x.classList.remove('active'));

        document
            .getElementById('panel-'+button.dataset.panel)
            .classList.add('active');
    };

});


// -------------------------------
// LOGOUT
// -------------------------------

logout.onclick=async e=>{

    e.preventDefault();

    await sb.auth.signOut();

    location.href='login.html';
};


// -------------------------------
// OPEN/CLOSE UPLOAD WINDOW
// -------------------------------

openUpload.onclick=()=>{

    uploadOverlay.classList.add('open');

};

closeUpload.onclick=()=>{

    uploadOverlay.classList.remove('open');

};


// -------------------------------
// UPLOAD MATERIAL
// -------------------------------

uploadForm.onsubmit=async e=>{

    e.preventDefault();

    const f=upFile.files[0];

    if(!f){
        toast('Please select a file.','error');
        return;
    }

    const ok=/\.(pdf|doc|docx)$/i.test(f.name);

    if(!ok){
        toast('Only PDF, DOC or DOCX files are allowed.','error');
        return;
    }

    if(f.size>8*1024*1024){
        toast('Maximum file size is 8 MB.','error');
        return;
    }

    const title=upTitle.value.trim();
    const subject=upSubject.value.trim();
    const klass=upClass.value.trim();
    const description=upDesc.value.trim();
    const category=upCategory.value;

    if(!title || !subject || !klass){
        toast('Please fill all required fields.','error');
        return;
    }

    uploadBtn.disabled=true;
    uploadBtn.textContent='Uploading...';

    try{

        const id='u'+Date.now();

        const safe=f.name.replace(
            /[^a-zA-Z0-9._-]/g,
            '_'
        );

        const path=id+'/'+safe;


        // 1. Upload actual file to Storage

        const storageResult=
            await sb.storage
            .from('study-materials')
            .upload(
                path,
                f,
                {
                    upsert:false,
                    contentType:f.type || 'application/octet-stream'
                }
            );

        if(storageResult.error){

            console.error(
                'Storage upload error:',
                storageResult.error
            );

            toast(
                'Upload failed: '+storageResult.error.message,
                'error'
            );

            return;
        }


        // 2. Insert file information into database

        const databaseResult=
            await sb
            .from('study_materials')
            .insert({
                id:id,
                title:title,
                category:category,
                subject:subject,
                klass:klass,
                description:description,
                file_type:f.name.split('.').pop().toUpperCase(),
                file_size:(f.size/1024/1024).toFixed(2)+' MB',
                file_path:path,
                downloads:0
            });

        if(databaseResult.error){

            console.error(
                'Database insert error:',
                databaseResult.error
            );

            await sb.storage
                .from('study-materials')
                .remove([path]);

            toast(
                'Database insert failed: '+databaseResult.error.message,
                'error'
            );

            return;
        }


        toast(
            'Material uploaded successfully.',
            'success'
        );

        uploadForm.reset();
        uploadOverlay.classList.remove('open');

        await load();

    }catch(error){

        console.error('Upload error:',error);

        toast(
            'Upload failed: '+error.message,
            'error'
        );

    }finally{

        uploadBtn.disabled=false;
        uploadBtn.textContent='Upload Material';

    }

};


// -------------------------------
// CONTACT DETAILS
// -------------------------------

contactForm.onsubmit=async e=>{

    e.preventDefault();

    const row={
        id:1,
        address:setAddress.value.trim(),
        phone:setPhone.value.trim(),
        email:setEmail.value.trim(),
        timings:setTimings.value.trim(),
        updated_at:new Date().toISOString()
    };

    const {error}=
        await sb
        .from('contact_settings')
        .upsert(row);

    if(error){

        console.error(error);

        toast(
            'Could not save contact details: '+error.message,
            'error'
        );

        return;
    }

    settings=row;

    toast(
        'Contact details updated.',
        'success'
    );

};


// -------------------------------
// START ADMIN
// -------------------------------

(async()=>{

    if(await authGuard()){
        await load();
    }

})();
