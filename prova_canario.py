
import pandas as pd
import os

######################################################################
# PASSO 1: CONFIGURE SEU CAMINHO CSV AQUI (apenas mude o nome arquivo)
######################################################################
# Vou tentar achar automaticamente na pasta Downloads primeiro
CAMINHO_CSV = r'C:\Users\fredm\Downloads\RP_Operacoes.csv' 

######################################################################
# CÓDIGO AUTOMÁTICO - NÃO TOQUE ABAIXO
######################################################################

print("🔍 Analisando Relatório Profit para prova Canario...")
print("=" * 60)

# Verifica se CSV existe
if not os.path.exists(CAMINHO_CSV):
    print(f"❌ CSV não encontrado: {CAMINHO_CSV}")
    print("💡 Downloads comuns Profit:")
    possible_files = []
    if os.path.exists(r'C:\Users\fredm\Downloads'):
        for f in os.listdir(r'C:\Users\fredm\Downloads'):
           if ('RP' in f.upper() or 'OPERACOES' in f.upper() or 'PERFORMANCE' in f.upper()) and f.endswith('.csv'):
                print(f"   -> {f}")
                possible_files.append(os.path.join(r'C:\Users\fredm\Downloads', f))
    
    if possible_files:
        print(f"\n🚀 Usando automaticamente o primeiro arquivo encontrado: {possible_files[0]}")
        CAMINHO_CSV = possible_files[0]
    else:
        print("\n🔧 Altere CAMINHO_CSV com nome exato e rode novamente!")
        exit()

print(f"✅ Lendo: {CAMINHO_CSV}")

# Lê CSV Profit (encoding comum)
try:
    df = pd.read_csv(CAMINHO_CSV, encoding='latin1', low_memory=False, sep=';') # Tentar separador ; comum no Brasil
    if len(df.columns) < 2: # Se falhar, tenta virgula
        df = pd.read_csv(CAMINHO_CSV, encoding='latin1', low_memory=False, sep=',')
except Exception as e:
     print(f"Erro ao ler CSV: {e}")
     exit()

print(f"📊 Total linhas: {len(df):,}")
print("📋 Primeiras colunas:", df.columns.tolist()[:8])

# Detecta coluna data/hora automática (Profit padrões)
col_data = None
for col in df.columns:
    if any(x in col.lower() for x in ['data', 'abertura', 'hora', 'timestamp', 'time']):
        col_data = col
        break

if col_data:
    print(f"⏰ Usando coluna: {col_data}")
    # Converter para datetime, lidando com formatos brasileiros dia/mes/ano
    df['DataHora'] = pd.to_datetime(df[col_data].astype(str), dayfirst=True, errors='coerce')
    df = df.dropna(subset=['DataHora'])  # Remove inválidas
    
    # Detecta replicadas: múltiplas ops mesmo segundo (padrão copy)
    df['Segundo'] = df['DataHora'].dt.floor('S')
    df['GrupoSize'] = df.groupby('Segundo')['Segundo'].transform('size')
    replicadas = df[df['GrupoSize'] > 1].copy()
    
    print(f"\n🎯 RESULTADO ANÁLISE:")
    print(f"   Total operações: {len(df):,}")
    print(f"   🚨 Suspeitas replicadas: {len(replicadas):,}")
    print(f"   ✅ Manuais provadas: {len(df) - len(replicadas):,}")
    
    if len(replicadas) > 0:
        print(f"\n📈 Primeiras suspeitas:")
        cols_show = ['Ativo', col_data, 'Qtd', 'Resultado'] 
        cols_final = [c for c in cols_show if c in df.columns]
        if not cols_final: cols_final = df.columns[:4]
            
        print(replicadas[cols_final].head(10).to_string(index=False))
    else:
        print("\n🎉 ZERO REPLICADAS! Prova perfeita Canario.")
    
    # Salva arquivos PROVA
    output_dir = r'C:\Users\fredm\Downloads'
    file_rep = os.path.join(output_dir, 'PROVA_REPLICADAS.csv')
    file_man = os.path.join(output_dir, 'PROVA_MANUAIS.csv')
    
    replicadas.to_csv(file_rep, index=False, sep=';', encoding='utf-8-sig') # Excel friendly
    manuais = df[df['GrupoSize'] <= 1]
    manuais.to_csv(file_man, index=False, sep=';', encoding='utf-8-sig')
    
    print(f"\n💾 Arquivos salvos na pasta Downloads:")
    print(f"   📤 {file_rep} ({len(replicadas)} linhas)")
    print(f"   ✅ {file_man} ({len(manuais)} linhas)")
    print("\n🚀 ENVIE PROVA_MANUAIS.csv para Canario!")
    
else:
    print("❌ Sem coluna data/hora encontrada.")
    print("📋 Todas colunas:", list(df.columns))
