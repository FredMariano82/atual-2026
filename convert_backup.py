
import re

def parse_val(val):
    if val == r'\N':
        return 'NULL'
    # Escape single quotes
    val = val.replace("'", "''")
    return f"'{val}'"

def main():
    with open('backup.sql', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    output = []
    
    # 1. Extract DDL for public schema tables
    # Simplification: scan for CREATE TABLE public... until );
    
    in_create = False
    buffer = []
    
    for line in lines:
        if line.startswith('CREATE TABLE public.'):
            in_create = True
            buffer.append(line)
        elif in_create:
            buffer.append(line)
            if line.strip() == ');':
                in_create = False
                output.append("".join(buffer))
                output.append("\n")
                buffer = []
    
    # 2. Extract Constraints for public schema
    # ALTER TABLE ONLY public...
    in_alter = False
    buffer = []
    for line in lines:
        if line.startswith('ALTER TABLE ONLY public.'):
            in_alter = True
            buffer.append(line)
        elif in_alter:
            buffer.append(line)
            if line.strip().endswith(';'):
                in_alter = False
                output.append("".join(buffer))
                output.append("\n")
                buffer = []

    # 3. Extract Data and Convert COPY to INSERT
    # Format: COPY public.tablename (col1, col2) FROM stdin;
    # data...
    # \.
    

    inserts = {}
    
    in_copy = False
    table_name = ""
    cols_str = ""
    
    for line in lines:
        if line.startswith('COPY public.'):
            in_copy = True
            m = re.match(r'COPY public\.(\w+) \((.+)\) FROM stdin;', line)
            if m:
                table_name = m.group(1)
                cols_str = m.group(2)
                if table_name not in inserts:
                    inserts[table_name] = []
            continue
            
        if in_copy:
            if line.strip() == r'\.':
                in_copy = False
                continue
            
            parts = line.strip().split('\t')
            vals = [parse_val(p) for p in parts]
            vals_str = ", ".join(vals)
            
            insert_stmt = f"INSERT INTO public.{table_name} ({cols_str}) VALUES ({vals_str});\n"
            inserts[table_name].append(insert_stmt)
            
    # Ordem de Inserção para respeitar FKs:
    # 1. usuarios (sem FK)
    # 2. solicitacoes (FK para usuarios)
    # 3. prestadores (FK para solicitacoes)
    # 4. logs_alteracao (FK para prestadores, solicitacoes, usuarios)
    # 5. economias_sistema (FK para solicitacoes)
    
    tables_order = ['usuarios', 'solicitacoes', 'prestadores', 'logs_alteracao', 'economias_sistema']
    
    # Write Tables Order
    for table in tables_order:
        if table in inserts:
            output.append(f"\n-- Data for {table}\n")
            output.extend(inserts[table])

    with open('restore_projeto.sql', 'w', encoding='utf-8') as f:
        f.write("-- Script de Restauração Gerado Automaticamente (Corrigido para FKs)\n")

        f.write("-- Copie e cole este conteúdo no SQL Editor do Supabase\n\n")
        f.writelines(output)

if __name__ == '__main__':
    main()
