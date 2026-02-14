// 🕵️ Script de Inspeção de Usuário ID Control (Versão 6 - PHP Legacy)
// Executar: node scripts/inspect-id-control-v6.js <ID_USUARIO>

require('dotenv').config({ path: '.env.local' });

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function loginAndInspect() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Ignorar erro de certificado (comum em IPs locais)

    // 1. Tentar LOGIN estilo formulário PHP
    console.log(`🔐 Logando em ${ID_CONTROL_URL} (Modo PHP Legacy)...`);

    // Muitos sistemas legados usam um POST para login.php e retornam um cookie PHPSESSID
    const params = new URLSearchParams();
    params.append('username', ID_CONTROL_USER);
    params.append('password', ID_CONTROL_PASS);
    params.append('login', 'Log In'); // Campo comum em submit buttons

    let cookie = null;

    try {
        const response = await fetch(`${ID_CONTROL_URL}/login.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            body: params,
            redirect: 'manual' // Para capturar cookie antes do redirect
        });

        // Tentar pegar cookie do header Set-Cookie
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
            cookie = setCookie.split(';')[0];
            console.log(`   ✅ Cookie obtido: ${cookie}`);
        } else {
            console.log(`   ⚠️ Nenhum cookie recebido no login.php. Status: ${response.status}`);
            // Pode ser que o login seja em outro endpoint, vamos tentar /server_requests.php?action=login
            return tryLoginServerRequests();
        }

        if (cookie) {
            await inspectWithCookie(cookie);
        }

    } catch (e) {
        console.error("❌ Erro no login:", e.message);
    }
}

async function tryLoginServerRequests() {
    console.log("   🔄 Tentando login via server_requests.php...");
    // Não implementado nesta versão, vamos focar no login.php primeiro ou avisar o usuário
    console.log("   ❌ Login via login.php falhou. Sistema pode usar API proprietária não-standard.");
}

async function inspectWithCookie(cookie) {
    const usuarioId = process.argv[2];
    if (!usuarioId) {
        console.log("⚠️ ID do usuário não fornecido. Tentando listar...");
    }

    const headers = {
        "Cookie": cookie,
        "User-Agent": "Mozilla/5.0"
    };

    // Tentar endpoints que podem retornar o JSON do usuário
    // Baseado na URL #/edit_user/10023165, o frontend deve chamar algo como:
    // /api/users/10023165
    // /data/user?id=10023165
    // /get_user.php?id=10023165

    const endpoints = [
        `/api/users/${usuarioId}`,
        `/api/user/${usuarioId}`,
        `/api/usuarios/${usuarioId}`,
        `/user/get/${usuarioId}`,
        `/data/users.json`, // Se for um arquivo estático gigante
        `/get_user_data.php?id=${usuarioId}`
    ];

    for (const ep of endpoints) {
        console.log(`   🔎 Testando GET ${ep}...`);
        try {
            const resp = await fetch(`${ID_CONTROL_URL}${ep}`, { headers });
            if (resp.ok) {
                const text = await resp.text();
                try {
                    const json = JSON.parse(text);
                    console.log(`      ✅ JSON VÁLIDO ENCONTRADO!`);
                    console.log(JSON.stringify(json, null, 2).substring(0, 2000)); // Mostrar primeiros 2000 chars
                    return; // Sucesso
                } catch {
                    console.log(`      ⚠️ Retorno não é JSON.`);
                }
            } else {
                console.log(`      ❌ Status: ${resp.status}`);
            }
        } catch (e) {
            console.log(`      ❌ Erro conexão: ${e.message}`);
        }
    }
}

loginAndInspect();
