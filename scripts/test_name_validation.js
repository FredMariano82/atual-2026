
function normalize(str) {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s]/g, "") // Remove special chars
        .trim();
}

function checkNameSimilarity(localName, remoteName) {
    if (!localName || !remoteName) return false;

    const n1 = normalize(localName).split(/\s+/);
    const n2 = normalize(remoteName).split(/\s+/);

    // 1. Exact First Name Match (most common/safe)
    if (n1[0] === n2[0]) return true;

    // 2. Allow if one is contained in the other (e.g. "Ana" vs "Ana Paula")
    // but ONLY if the first name matches. 
    // Wait, if n1[0] !== n2[0], it's likely a different person or a nickname.
    // "Jose" vs "Ze" -> Mismatch (safer)
    // "Maria Silva" vs "Maria Souza" -> Match on first name (True) -> Risk?
    // ID Control might have outdated info. 

    // User wants to catch "João" vs "Maria".

    // Let's count matching words
    const set1 = new Set(n1);
    const matches = n2.filter(word => set1.has(word));

    // If NO words match -> Definitely Mismatch
    if (matches.length === 0) return false;

    // If First Name is different -> High Risk of mismatch
    if (n1[0] !== n2[0]) {
        console.log(`   [Mismatch First Name] ${n1[0]} vs ${n2[0]}`);
        return false;
    }

    return true;
}

const testCases = [
    ["João Silva", "Joao Silva"], // Should Match
    ["João Silva", "João da Silva"], // Should Match
    ["Maria Oliveira", "João Oliveira"], // Should Mismatch (different first name)
    ["Ana", "Ana Paula"], // Should Match
    ["Pedro", "Paulo"], // Should Mismatch
    ["Gilson", "Gilson Patrimônio"], // Should Match
    ["Lucas", "Lucas"], // Should Match
    ["Mário", "Mario"], // Should Match
];

testCases.forEach(([a, b]) => {
    const result = checkNameSimilarity(a, b);
    console.log(`"${a}" vs "${b}" -> ${result ? "✅ Match" : "❌ Mismatch"}`);
});
