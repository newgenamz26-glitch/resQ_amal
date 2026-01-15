<script>
/* =========================
   RESQ-LINK v1.5 CORE LOGIC
   ========================= */

/* ---------- Helpers ---------- */
const f = id => document.getElementById(id)?.value || "";
const nowISO = () => new Date().toISOString();

/* ---------- LocalStorage ---------- */
const loadSess   = () => JSON.parse(localStorage.getItem('resq_v5_current_session')) || null;
const loadShifts = () => JSON.parse(localStorage.getItem('resq_v5_all_shifts')) || [];
const loadCases  = () => JSON.parse(localStorage.getItem('resq_v5_all_cases')) || [];

let session   = loadSess();
let allShifts = loadShifts();
let allCases  = loadCases();

const saveAll = () => {
  localStorage.setItem('resq_v5_current_session', JSON.stringify(session));
  localStorage.setItem('resq_v5_all_shifts', JSON.stringify(allShifts));
  localStorage.setItem('resq_v5_all_cases', JSON.stringify(allCases));
};

/* =========================
   🔁 MIGRATION (AUTO)
   ========================= */
const migrateCasesIfNeeded = () => {
  if (!allCases.length) return;

  const legacyDetected = allCases.some(
    c => c.patientName || c.complaint
  );

  if (!legacyDetected) return;

  console.warn("🔁 Migrating legacy cases…");

  // Backup
  localStorage.setItem(
    'resq_v5_cases_backup_' + Date.now(),
    JSON.stringify(allCases)
  );

  allCases = allCases.map(c => {
    if (c.patient && c.program) return c;

    return {
      id: c.id || 'C-' + Date.now(),
      schemaVersion: 2,

      program: {
        responderName: c.responderName || 'UNKNOWN',
        programName: c.programName || '-',
        checkpoint: c.checkpoint || '-',
        datetime: c.timeStr || ''
      },

      patient: {
        name: c.patientName || '-',
        age: '',
        gender: '',
        phone: '',
        guardian: ''
      },

      medical: {
        consciousness: '',
        mainComplaint: c.complaint || '',
        symptom: '',
        injury: '',
        history: '',
        allergy: ''
      },

      vitals: {
        bp: c.vitals?.bp || '',
        pr: c.vitals?.pr || '',
        spo2: '',
        rr: ''
      },

      treatment: {
        caregiver: '',
        startTime: '',
        endTime: '',
        duration: '',
        note: ''
      },

      finalStatus: c.status || 'Selesai di Lokasi',
      createdAt: c.createdAt || nowISO()
    };
  });

  saveAll();
  console.warn("✅ Migration selesai:", allCases.length, "kes");
};

migrateCasesIfNeeded();

/* =========================
   SAVE CASE (FIXED)
   ========================= */
window.saveCase = () => {
  const patientName = f('f-patient-name');
  if (!patientName) return window.showToast("Nama Pesakit Wajib");

  const data = {
    id: 'C-' + Date.now(),
    schemaVersion: 2,

    program: {
      responderName: f('f-responder-name'),
      programName: f('f-program'),
      checkpoint: f('f-checkpoint'),
      datetime: f('f-datetime')
    },

    patient: {
      name: patientName,
      age: f('f-patient-age'),
      gender: f('f-patient-gender'),
      phone: f('f-patient-phone'),
      guardian: f('f-patient-guardian')
    },

    medical: {
      consciousness: f('f-consciousness'),
      mainComplaint: f('f-main-complaint'),
      symptom: f('f-symptom'),
      injury: f('f-injury'),
      history: f('f-history'),
      allergy: f('f-allergy')
    },

    vitals: {
      bp: f('f-bp'),
      pr: f('f-pr'),
      spo2: f('f-spo2'),
      rr: f('f-rr')
    },

    treatment: {
      caregiver: f('f-caregiver'),
      startTime: f('f-treatment-start'),
      endTime: f('f-treatment-end'),
      duration: f('f-treatment-duration'),
      note: f('f-treatment')
    },

    finalStatus: f('f-status'),
    createdAt: nowISO()
  };

  allCases.unshift(data);
  saveAll();
  window.showToast("Laporan Kes Disimpan");
  window.render();
};

/* =========================
   VIEW CASE DETAIL (FIXED)
   ========================= */
window.viewCaseDetail = (id) => {
  const c = allCases.find(x => x.id === id);
  if (!c) return;

  document.getElementById('detail-modal-title').innerText = "DETAIL KES";

  document.getElementById('detail-content-ui').innerHTML = `
    <div class="space-y-5 text-sm">

      <div class="bg-slate-50 p-4 rounded-2xl">
        <p class="text-[9px] font-black uppercase text-slate-400">Pesakit</p>
        <p class="font-extrabold text-lg">${c.patient.name}</p>
        <p class="text-xs mt-1">
          Umur: ${c.patient.age || '-'} |
          Jantina: ${c.patient.gender || '-'}
        </p>
      </div>

      <div class="bg-white border p-4 rounded-2xl">
        <p class="text-[9px] font-black uppercase text-slate-400">Aduan Utama</p>
        <p>${c.medical.mainComplaint || '-'}</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="bg-blue-50 p-3 rounded-xl">
          <p class="text-[8px] font-black uppercase text-blue-400">BP</p>
          <p class="font-bold">${c.vitals.bp || '--'}</p>
        </div>
        <div class="bg-blue-50 p-3 rounded-xl">
          <p class="text-[8px] font-black uppercase text-blue-400">PR</p>
          <p class="font-bold">${c.vitals.pr || '--'}</p>
        </div>
        <div class="bg-blue-50 p-3 rounded-xl">
          <p class="text-[8px] font-black uppercase text-blue-400">SpO₂</p>
          <p class="font-bold">${c.vitals.spo2 || '--'}</p>
        </div>
        <div class="bg-blue-50 p-3 rounded-xl">
          <p class="text-[8px] font-black uppercase text-blue-400">RR</p>
          <p class="font-bold">${c.vitals.rr || '--'}</p>
        </div>
      </div>

      <div class="bg-slate-900 text-white p-4 rounded-2xl">
        <p class="text-[9px] uppercase font-black text-slate-400">Petugas</p>
        <p class="font-bold">${c.program.responderName}</p>
        <p class="text-xs mt-1">
          ${c.program.programName} • ${c.program.checkpoint}
        </p>
      </div>

    </div>
  `;

  document.getElementById('detail-modal').classList.add('show');
};

/* =========================
   LOG KES RESPONDER (FIX)
   ========================= */
window.renderResponderCases = () => {
  const list = document.getElementById('responder-case-list');

  const myCases = allCases.filter(
    c => c.program.responderName === session.responderName
  );

  list.innerHTML = myCases.map(c => `
    <div class="bg-white p-5 rounded-3xl border shadow-sm flex justify-between">
      <div>
        <p class="text-[9px] font-black text-blue-500 uppercase">
          ${c.program.datetime || ''}
        </p>
        <h5 class="font-extrabold uppercase">
          ${c.patient.name}
        </h5>
      </div>
      <button onclick="viewCaseDetail('${c.id}')"
        class="bg-blue-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase">
        Detail
      </button>
    </div>
  `).join('') || `
    <div class="text-center p-10 text-slate-400 font-bold uppercase text-[10px]">
      Tiada rekod kes
    </div>
  `;
};
</script>
