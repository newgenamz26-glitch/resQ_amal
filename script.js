// Helper ambil value
const f = id => document.getElementById(id)?.value || "";

// Auto kira tempoh rawatan
window.calculateTreatmentDuration = () => {
    const start = f('f-treatment-start');
    const end = f('f-treatment-end');
    if (!start || !end) return;

    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);

    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;

    if (endMin < startMin) endMin += 24 * 60; // lintas tengah malam

    const diff = endMin - startMin;
    const h = Math.floor(diff / 60);
    const m = diff % 60;

    document.getElementById('f-treatment-duration').value =
        `${h} jam ${m} minit`;
};

// Simpan laporan kes
window.saveCase = () => {
    const data = {
        id: 'C-' + Date.now(),

        program: {
            responderIC: f('f-responder-ic'),
            responderName: f('f-responder-name'),
            programName: f('f-program'),
            checkpoint: f('f-checkpoint'),
            datetime: f('f-datetime')
        },

        patient: {
            name: f('f-patient-name'),
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
        createdAt: new Date().toISOString()
    };

    allCases.unshift(data);
    saveAll();
    window.showToast("Laporan Kes Disimpan");
    window.render();
};

// Share ke WhatsApp
window.shareCaseWhatsApp = () => {
    const msg = `
🆘 *LAPORAN KES RESPONDER AMAL *

👮 Responder: ${f('f-responder-name')} (${f('f-responder-ic')})
📍 Program: ${f('f-program')} | CP ${f('f-checkpoint')}
⏰ Masa: ${f('f-datetime')}

🧍 Pesakit: ${f('f-patient-name')}
Umur: ${f('f-patient-age')} | Jantina: ${f('f-patient-gender')}

🩺 Aduan: ${f('f-main-complaint')}

❤️ Vital:
BP ${f('f-bp')} | PR ${f('f-pr')}
SpO2 ${f('f-spo2')} | RR ${f('f-rr')}

🩹 Rawatan:
Perawat: ${f('f-caregiver')}
Mula: ${f('f-treatment-start')}
Tamat: ${f('f-treatment-end')}
Tempoh: ${f('f-treatment-duration')}
Rawatan: ${f('f-treatment')}

📌 Status: ${f('f-status')}

— Resq-Link
`.trim();

    window.open(
        `https://wa.me/?text=${encodeURIComponent(msg)}`,
        '_blank'
    );
};
