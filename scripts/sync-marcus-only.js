
// Clone do Sync SOMENTE para Marcus
// Executar: node scripts/sync-marcus-only.js
require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { createClient } = require('@supabase/supabase-js');
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
let sessionToken = null;

async function loginIdControl() {
    try {
        console.log("🔐 Autenticando no ID Control...");
        const response = await fetch(`${ID_CONTROL_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
        });
        const data = await response.json();
        sessionToken = data.accessToken || data.token;
        return true;
    } catch (e) {
        console.error("❌ Erro no login:", e.message);
        return false;
    }
}

async function toIdControlDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString + 'T12:00:00');
    return `/Date(${date.getTime()}-0300)/`;
}

async function updateUser(id, payload) {
    try {
        console.log(`\n📤 Enviando Update via PUT para ID ${id}...`);
        const response = await fetch(`${ID_CONTROL_URL}/api/user/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionToken}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const txt = await response.text();
            console.log(`❌ Erro ${response.status}: ${txt}`);
        } else {
            console.log("✅ Update SUCESSO!");
        }
    } catch (e) {
        console.error("❌ Erro update:", e.message);
    }
}

async function run() {
    if (!await loginIdControl()) return;

    const { data: prestador } = await supabase
        .from('prestadores')
        .select('*')
        .eq('id_control_id', 10023166) // Marcus
        .single();

    if (!prestador) {
        console.log("❌ Marcus não encontrado no Supabase com ID 10023166");
        return;
    }

    console.log(`🔍 Prestador: ${prestador.nome} (ID Control: ${prestador.id_control_id})`);

    // Payload Hardcoded para Teste MÁXIMO
    const payload = {
        name: "Marcus Sync Only Test",
        comments: "checagem válida até 01/01/2030", // Data futura absurda para testar
        dateStartLimit: `/Date(${Date.now()}-0300)/`,
        dateLimit: `/Date(${Date.now() + 86400000}-0300)/`,
        expireOnDateLimit: true
    };

    await updateUser(prestador.id_control_id, payload);

    // Check
    const r2 = await fetch(`${ID_CONTROL_URL}/api/user/${prestador.id_control_id}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${sessionToken}` }
    });
    const u = await r2.json();
    console.log(`🔎 Start: ${u.dateStartLimit}`);
    console.log(`🔎 End:   ${u.dateLimit}`);
    console.log(`🔎 Comments: ${u.comments}`);
}

run();
