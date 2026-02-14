// 🕵️ Script de Inspeção de Usuário ID Control (Versão 4 - Legado/SOAP/AJAX)
// Executar: node scripts/inspect-id-control-v4.js <TERMO_BUSCA>

require('dotenv').config({ path: '.env.local' });

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function loginAndInspect() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log(`🔐 Logando em ${ID_CONTROL_URL} (Modo Compatibilidade)...`);

    // Tentar login via sessão PHP (comum em sistemas antigos)
    // Muitas vezes é um POST para /login.php ou /server_requests.php com action=login

    try {
        // Tentativa A: POST para /login/ com form-data
        // Alguns sistemas usam application/x-www-form-urlencoded
        const params = new URLSearchParams();
        params.append('username', ID_CONTROL_USER);
        params.append('password', ID_CONTROL_PASS);

        console.log("   Tentando login form-urlencoded...");
        let response = await fetch(`${ID_CONTROL_URL}/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            },
            body: params
        });

        let cookie = response.headers.get("set-cookie");

        if (response.ok) {
            console.log("   ✅ Login HTTP 200. Cookie:", cookie);

            // Se tiver cookie, tentar usar para buscar
            // Busca estilo API antiga: GET /api/users

            const headers = {
                "Cookie": cookie || "",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            };

            // Tentar endpoint de listagem que funcionou parcialmente no navegador do usuário (visto no print "Pessoas Cadastradas")
            // A URL do print é .../#/persons
            // Isso sugere uma API por trás. Vamos tentar /api/persons ou /api/people

            const endpoints = [
                "/api/persons",
                "/api/people",
                "/api/users",
                "/api/search_user", // comum em alguns sistemas
                "/data/users.json"
            ];

            for (const ep of endpoints) {
                console.log(`   🔎 Testando endpoint autenticado: ${ep}`);
                const resp2 = await fetch(`${ID_CONTROL_URL}${ep}`, { headers });

                if (resp2.ok) {
                    const texto = await resp2.text();
                    try {
                        const json = JSON.parse(texto);
                        console.log(`      ✅ JSON encontrado! Tamanho: ${texto.length}`);
                        // Tentar achar Abilia
                        const termo = process.argv[2] || "Abilia";
                        console.log(`      Busca por "${termo}" no JSON...`);
                        // Logica de busca recursiva simples
                        if (texto.toLowerCase().includes(termo.toLowerCase())) {
                            console.log("      🎯 Termo encontrado no JSON! Exibindo trecho...");
                            console.log(texto.substring(0, 500) + "...");
                            // Tentar exibir objeto struturado melhor se for array
                            if (Array.isArray(json)) {
                                const alvo = json.find(u => JSON.stringify(u).toLowerCase().includes(termo.toLowerCase()));
                                if (alvo) console.log(JSON.stringify(alvo, null, 2));
                            }
                        } else {
                            console.log("      ⚠️ Termo não encontrado neste JSON.");
                        }
                    } catch (e) {
                        console.log(`      ⚠️ Retorno não é JSON (provavelmente HTML).`);
                    }
                }
            }
        } else {
            console.log(`   ❌ Login falhou: ${response.status}`);
        }

    } catch (e) {
        console.error("❌ Erro fatal:", e.message);
    }
}

loginAndInspect();
