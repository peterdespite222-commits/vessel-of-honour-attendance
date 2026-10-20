(() => {
'use strict';
const KEY='voh_attendance_app_v1';
const $=id=>document.getElementById(id);
const todayISO=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const uid=()=> 's_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);
const defaultState=()=>({version:1,school:{name:'Vessel of Honour',location:'Kumasi Abijan Nkwanta'},students:[],attendance:{}});
let state=loadState();
function loadState(){try{const raw=localStorage.getItem(KEY);if(!raw)return defaultState();const x=JSON.parse(raw);if(!x||!Array.isArray(x.students)||!x.attendance)return defaultState();return {...defaultState(),...x,school:{...defaultState().school,...x.school}}}catch(e){return defaultState()}}
function saveState(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch(e){toast('Could not save. Export a backup and free browser storage.');return false}}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2600)}
function fmtDate(s){if(!s)return '';const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}
function getDay(date){if(!state.attendance[date])state.attendance[date]={};return state.attendance[date]}
function statusesFor(date){return getDay(date)}
function allClasses(){return [...new Set(state.students.map(s=>s.className.trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'}))}
function statusCounts(date, students=state.students){const day=state.attendance[date]||{};return students.reduce((a,s)=>{const v=day[s.id];if(v==='present')a.present++;else if(v==='absent')a.absent++;else if(v==='late')a.late++;else a.unmarked++;return a},{present:0,absent:0,late:0,unmarked:0})}
function setHeader(){ $('todayChip').textContent='📅 '+fmtDate(todayISO());$('schoolNameSetting').value=state.school.name;$('schoolLocationSetting').value=state.school.location;document.querySelector('.brand h1').textContent=state.school.name;document.querySelector('.brand p').textContent='Student Attendance Management · '+state.school.location;document.title=state.school.name+' | Attendance';}
function setSelectOptions(id,allLabel='All classes'){const el=$(id),old=el.value;el.innerHTML=`<option value="all">${allLabel}</option>`+allClasses().map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');if([...el.options].some(o=>o.value===old))el.value=old}
function updateClassControls(){['attClass','studentClassFilter','reportClass'].forEach(id=>setSelectOptions(id));$('classSuggestions').innerHTML=allClasses().map(c=>`<option value="${esc(c)}"></option>`).join('')}
function renderDashboard(){
 const c=statusCounts(todayISO());$('statTotal').textContent=state.students.length;$('statPresent').textContent=c.present;$('statAbsent').textContent=c.absent;$('statLate').textContent=c.late;$('presentSub').textContent=`${c.unmarked} not yet marked`;$('dashDate').textContent=fmtDate(todayISO());
 const marked=c.present+c.absent+c.late, total=state.students.length, pct=total?Math.round(marked/total*100):0;
 $('dashProgress').innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:9px;font-size:13px"><b>Register completion</b><strong>${pct}%</strong></div><div class="progress"><span style="width:${pct}%"></span></div><p class="muted" style="font-size:12px;margin:9px 0 0">${marked} of ${total} learners marked today</p>`;
 $('dashSummary').innerHTML=[['Present',c.present,'present'],['Absent',c.absent,'absent'],['Late',c.late,'late'],['Not marked',c.unmarked,'unmarked']].map(([l,n,k])=>`<div class="quick-row"><span class="quick-label"><span class="pill ${k}">${l}</span></span><span class="quick-value">${n}</span></div>`).join('');
}
function statusPill(v){return `<span class="pill ${v||'unmarked'}">${v?({present:'Present',absent:'Absent',late:'Late'}[v]):'Not marked'}</span>`}
function renderAttendance(){
 const date=$('attDate').value||todayISO(),cl=$('attClass').value,q=$('attSearch').value.trim().toLowerCase(),day=statusesFor(date);
 const list=state.students.filter(s=>(cl==='all'||s.className===cl)&&(!q||[s.name,s.studentCode,s.className].some(x=>x.toLowerCase().includes(q)))).sort((a,b)=>a.name.localeCompare(b.name));
 $('registerTitle').textContent=cl==='all'?'All classes':cl;$('registerSub').textContent=`${list.length} learner${list.length===1?'':'s'} · ${fmtDate(date)}`;
 $('attendanceRows').innerHTML=list.map(s=>{const v=day[s.id]||'';return `<tr><td><span class="student-name">${esc(s.name)}</span><span class="subtext">${esc(s.studentCode)}</span></td><td>${esc(s.className)}</td><td><div class="attendance-actions">${['present','absent','late'].map(k=>`<button class="status-btn ${v===k?'sel-'+k:''}" data-status="${k}" data-student="${esc(s.id)}" aria-pressed="${v===k}">${k==='present'?'✓ Present':k==='absent'?'✕ Absent':'◷ Late'}</button>`).join('')}</div></td></tr>`}).join('');
 $('attendanceEmpty').classList.toggle('hidden',list.length>0);$('saveStatus').textContent='Changes save automatically · '+fmtDate(date);
}
function renderStudents(){
 const q=$('studentSearch').value.trim().toLowerCase(),cl=$('studentClassFilter').value;
 const list=state.students.filter(s=>(cl==='all'||s.className===cl)&&[s.name,s.studentCode,s.className,s.gender||''].some(x=>x.toLowerCase().includes(q))).sort((a,b)=>a.name.localeCompare(b.name));
 $('studentRows').innerHTML=list.map(s=>`<tr><td><span class="student-name">${esc(s.name)}</span><span class="subtext">${esc(s.studentCode)}</span></td><td>${esc(s.className)}</td><td>${esc(s.gender||'—')}</td><td><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-light" data-edit="${esc(s.id)}">Edit</button><button class="btn btn-danger" data-delete="${esc(s.id)}">Delete</button></div></td></tr>`).join('');
 $('studentEmpty').classList.toggle('hidden',list.length>0);
}
function reportData(){
 const from=$('reportFrom').value||'0000-01-01',to=$('reportTo').value||'9999-12-31',cl=$('reportClass').value;
 const students=state.students.filter(s=>cl==='all'||s.className===cl);
 return students.map(s=>{const r={student:s,present:0,absent:0,late:0};Object.entries(state.attendance).forEach(([date,day])=>{if(date>=from&&date<=to){const v=day[s.id];if(v==='present'||v==='absent'||v==='late')r[v]++}});r.marked=r.present+r.absent+r.late;r.rate=r.marked?Math.round(r.present/r.marked*100):null;return r}).filter(r=>r.marked>0).sort((a,b)=>a.student.name.localeCompare(b.student.name));
}
function renderReport(){
 const rows=reportData(),marks=rows.reduce((n,r)=>n+r.marked,0),present=rows.reduce((n,r)=>n+r.present,0);
 $('repMarks').textContent=marks;$('repPresent').textContent=present;$('repRate').textContent=marks?Math.round(present/marks*100)+'%':'—';
 $('reportRows').innerHTML=rows.map(r=>`<tr><td><span class="student-name">${esc(r.student.name)}</span><span class="subtext">${esc(r.student.studentCode)}</span></td><td>${esc(r.student.className)}</td><td>${r.present}</td><td>${r.absent}</td><td>${r.late}</td><td>${r.marked}</td><td>${r.rate}%</td></tr>`).join('');$('reportEmpty').classList.toggle('hidden',rows.length>0);
}
function renderAll(){setHeader();updateClassControls();renderDashboard();renderAttendance();renderStudents();renderReport()}
function showPage(name){document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));$('page-'+name).classList.remove('hidden');document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===name));if(name==='dashboard')renderDashboard();if(name==='attendance')renderAttendance();if(name==='students')renderStudents();if(name==='reports')renderReport();window.scrollTo({top:0,behavior:'smooth'})}
function openStudentForm(s=null){$('studentForm').reset();$('editStudentId').value=s?.id||'';$('studentId').value=s?.studentCode||'';$('studentName').value=s?.name||'';$('studentClass').value=s?.className||'';$('studentGender').value=s?.gender||'';$('studentGuardian').value=s?.guardian||'';$('studentId').disabled=!!s;$('studentFormTitle').textContent=s?'Edit learner details':'Register a learner';$('saveStudentBtn').textContent=s?'Save changes':'Save learner';$('studentFormPanel').classList.remove('hidden');$('studentFormPanel').scrollIntoView({behavior:'smooth',block:'start'});$('studentName').focus()}
function download(filename,content,type='text/plain;charset=utf-8'){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function csvCell(v){return '"'+String(v??'').replace(/"/g,'""')+'"'}
function exportStudents(){const data=[['Student ID','Full name','Class','Gender','Parent/guardian contact'],...state.students.map(s=>[s.studentCode,s.name,s.className,s.gender,s.guardian])];download('vessel-of-honour-learners-'+todayISO()+'.csv','\ufeff'+data.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');toast('Learner CSV downloaded')}
function exportAttendance(){const data=[['Date','Student ID','Full name','Class','Status'],...Object.entries(state.attendance).sort(([a],[b])=>a.localeCompare(b)).flatMap(([date,day])=>state.students.filter(s=>day[s.id]).map(s=>[date,s.studentCode,s.name,s.className,day[s.id]]))];download('vessel-of-honour-attendance-'+todayISO()+'.csv','\ufeff'+data.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');toast('Attendance CSV downloaded')}
function exportReport(){const rows=reportData(),data=[['Student ID','Full name','Class','Present','Absent','Late','Marked days','Attendance rate'],...rows.map(r=>[r.student.studentCode,r.student.name,r.student.className,r.present,r.absent,r.late,r.marked,(r.rate??0)+'%'])];download('vessel-of-honour-report-'+todayISO()+'.csv','\ufeff'+data.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');toast('Report CSV downloaded')}
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.goto)));
$('attDate').value=todayISO();$('reportTo').value=todayISO();const monthStart=todayISO().slice(0,8)+'01';$('reportFrom').value=monthStart;
['attDate','attClass','attSearch'].forEach(id=>$(id).addEventListener(id==='attSearch'?'input':'change',renderAttendance));
$('attendanceRows').addEventListener('click',e=>{const b=e.target.closest('[data-status]');if(!b)return;const date=$('attDate').value||todayISO(),id=b.dataset.student,st=b.dataset.status,day=getDay(date);if(day[id]===st)delete day[id];else day[id]=st;saveState();renderAttendance();renderDashboard()});
$('markAllPresent').addEventListener('click',()=>{const date=$('attDate').value||todayISO(),cl=$('attClass').value;const list=state.students.filter(s=>cl==='all'||s.className===cl);if(!list.length){toast('No learners to mark');return}if(!confirm(`Mark all ${list.length} visible-class learners PRESENT on ${fmtDate(date)}?`))return;const day=getDay(date);list.forEach(s=>day[s.id]='present');saveState();renderAll();toast('Selected learners marked present')});
$('clearMarks').addEventListener('click',()=>{const date=$('attDate').value||todayISO(),cl=$('attClass').value;if(!confirm('Clear attendance marks for '+(cl==='all'?'all classes':cl)+' on '+fmtDate(date)+'?'))return;const day=getDay(date);state.students.filter(s=>cl==='all'||s.className===cl).forEach(s=>delete day[s.id]);saveState();renderAll();toast('Attendance marks cleared')});
$('finishAttendance').addEventListener('click',()=>{const c=statusCounts($('attDate').value||todayISO(),state.students.filter(s=>$('attClass').value==='all'||s.className===$('attClass').value));toast(`Register saved: ${c.present} present, ${c.absent} absent, ${c.late} late, ${c.unmarked} unmarked`);renderDashboard()});
$('showStudentForm').addEventListener('click',()=>openStudentForm());$('closeStudentForm').addEventListener('click',()=>$('studentFormPanel').classList.add('hidden'));$('cancelStudentForm').addEventListener('click',()=>$('studentFormPanel').classList.add('hidden'));
$('studentForm').addEventListener('submit',e=>{e.preventDefault();const editId=$('editStudentId').value,studentCode=$('studentId').value.trim(),name=$('studentName').value.trim(),className=$('studentClass').value.trim();if(!studentCode||!name||!className){toast('Please fill in all required fields');return}const duplicate=state.students.find(s=>s.studentCode.toLowerCase()===studentCode.toLowerCase()&&s.id!==editId);if(duplicate){toast('That student ID is already in use');$('studentId').focus();return}if(editId){const s=state.students.find(x=>x.id===editId);if(s)Object.assign(s,{name,className,gender:$('studentGender').value,guardian:$('studentGuardian').value.trim()});toast('Learner updated')}else{state.students.push({id:uid(),studentCode,name,className,gender:$('studentGender').value,guardian:$('studentGuardian').value.trim(),createdAt:new Date().toISOString()});toast('Learner registered successfully')}saveState();$('studentFormPanel').classList.add('hidden');renderAll()});
$('studentRows').addEventListener('click',e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(edit){const s=state.students.find(x=>x.id===edit.dataset.edit);if(s)openStudentForm(s)}if(del){const s=state.students.find(x=>x.id===del.dataset.delete);if(!s)return;if(!confirm(`Delete ${s.name} and all attendance records for this learner?`))return;state.students=state.students.filter(x=>x.id!==s.id);Object.values(state.attendance).forEach(day=>delete day[s.id]);saveState();renderAll();toast('Learner deleted')}})
$('studentSearch').addEventListener('input',renderStudents);$('studentClassFilter').addEventListener('change',renderStudents);
$('exportStudents').addEventListener('click',exportStudents);$('quickExport').addEventListener('click',exportAttendance);
$('runReport').addEventListener('click',renderReport);['reportFrom','reportTo','reportClass'].forEach(id=>$(id).addEventListener('change',renderReport));$('exportReport').addEventListener('click',exportReport);
$('printReport').addEventListener('click',()=>{showPage('reports');window.print()});$('printAttendance').addEventListener('click',()=>window.print());
$('saveSettings').addEventListener('click',()=>{const name=$('schoolNameSetting').value.trim(),location=$('schoolLocationSetting').value.trim();if(!name||!location){toast('School name and location are required');return}state.school={name,location};saveState();setHeader();toast('School details saved')});
$('backupJson').addEventListener('click',()=>{download('vessel-of-honour-backup-'+todayISO()+'.json',JSON.stringify({...state,backupCreatedAt:new Date().toISOString()},null,2),'application/json');toast('Full backup downloaded')});
$('restoreJsonBtn').addEventListener('click',()=>$('restoreJsonFile').click());
$('restoreJsonFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(!Array.isArray(parsed.students)||!parsed.attendance||typeof parsed.attendance!=='object')throw new Error('Invalid backup');if(!confirm('Restore this backup? Current records on this device will be replaced.'))return;state={...defaultState(),...parsed,school:{...defaultState().school,...parsed.school}};saveState();renderAll();toast('Backup restored successfully')}catch(err){toast('Could not restore: invalid backup file')}finally{e.target.value=''}});
$('resetApp').addEventListener('click',()=>{if(!confirm('This permanently deletes all learners and attendance records from this browser. Continue?'))return;if(!confirm('Final confirmation: delete all local school records?'))return;state=defaultState();saveState();renderAll();toast('Local records deleted')});
window.addEventListener('storage',e=>{if(e.key===KEY){state=loadState();renderAll();toast('Data refreshed from this browser storage')}});
renderAll();
})();

// PWA offline support: service workers require HTTPS or localhost.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(err => {
      console.warn('Offline support could not be enabled:', err);
    });
  });
}
