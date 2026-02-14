// Script de Teste - Conexão ID Control
// Para rodar: node scripts/test-id-control.js

// ⚠️ IGNORAR ERROS DE CERTIFICADO SSL (Necessário para IP local)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function testLogin() {
    console.log("🔄 1. Tentando conectar ao ID Control (https://192.168.100.20:30443)...");

    const loginUrl = "https://192.168.100.20:30443/api/login/";

    // Credenciais descobertas
    const payload = {
        username: "mariano",
        password: "hebraica"
    };

    try {
        const start = Date.now();
        const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const time = Date.now() - start;
        console.log(`⏱️ Tempo de resposta: ${time}ms`);
        console.log(`📡 Status HTTP: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Erro no login. Resposta do servidor:", errorText);
            return;
        }

        const data = await response.json();
        console.log("\n✅ SUCESSO! Login realizado.");
        console.log("==========================================");
        console.log("🔑 Resposta do Servidor (Token provável):");
        console.log(JSON.stringify(data, null, 2));
        console.log("==========================================");

        // Verificando se recebemos um token
        if (data.token || data.access_token || (data.data && data.data.token)) {
            console.log("🤖 Token identificado com sucesso! Podemos prosseguir com o robô.");
        } else {
            console.log("⚠️ Atenção: Não vi um campo explícito 'token'. Verifique o JSON acima.");
            console.log("Dica: O token pode estar dentro de um objeto 'data' ou ter outro nome.");
        }

    } catch (error) {
        console.error("\n❌ FALHA GRAVE NA CONEXÃO:");
        console.error(`Erro: ${error.message}`);

        if (error.cause) console.error("Causa:", error.cause);

        console.log("\nDiagnóstico:");
        console.log("1. O servidor ID Control está ligado?");
        console.log("2. Este computador tem acesso à rede 192.168.100.x?");
        console.log("3. A porta 30443 está correta?");
    }
}

testLogin();
