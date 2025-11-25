import os
import hashlib
import fnmatch
import shutil
import difflib
from collections import defaultdict

class ContentDirectoryComparator:
    def __init__(self):
        self.excluded_dirs = {'node_modules', 'dist', '.next', '.git', '__pycache__', 
                             '.vscode', '.idea', 'build', 'target', 'venv',
                             'vendor', 'bower_components', '.npm', '.cache'}
        self.current_dir = os.getcwd()

    def get_available_directories(self):
        """Obtiene la lista de directorios disponibles, excluyendo los no deseados."""
        items = os.listdir(self.current_dir)
        directories = []
        
        for item in items:
            item_path = os.path.join(self.current_dir, item)
            if os.path.isdir(item_path):
                if not any(fnmatch.fnmatch(item, pattern) for pattern in self.excluded_dirs):
                    if item not in self.excluded_dirs:
                        directories.append(item)
        
        return sorted(directories)

    def display_menu(self):
        """Muestra el menú principal."""
        print("\n" + "="*60)
        print("           COMPARADOR Y MERGE DE DIRECTORIOS")
        print("="*60)
        print(f"Directorio actual: {self.current_dir}")
        print("\nDirectorios disponibles:")
        
        directories = self.get_available_directories()
        
        if not directories:
            print("  No se encontraron directorios disponibles")
            return None
        
        for i, dir_name in enumerate(directories, 1):
            print(f"  {i}. {dir_name}")
        
        print("\nOpciones especiales:")
        print("  • 'this' - Usar el directorio actual")
        print("  • 'exit' - Salir del programa")
        
        return directories

    def get_directory_input(self, prompt, available_dirs):
        """Obtiene y valida la entrada del usuario para seleccionar un directorio."""
        while True:
            user_input = input(f"\n{prompt} ").strip()
            
            if user_input.lower() == 'exit':
                return None
            elif user_input.lower() == 'this':
                return self.current_dir
            elif user_input.isdigit():
                index = int(user_input) - 1
                if 0 <= index < len(available_dirs):
                    return os.path.join(self.current_dir, available_dirs[index])
                else:
                    print(f"❌ Error: Por favor ingresa un número entre 1 y {len(available_dirs)}")
            elif user_input in available_dirs:
                return os.path.join(self.current_dir, user_input)
            else:
                print("❌ Error: Entrada no válida")
                print("   Usa 'this', 'exit', un número de la lista, o el nombre de un directorio")

    def is_excluded(self, path):
        """Verifica si una ruta debe ser excluida de la comparación."""
        parts = path.split(os.sep)
        return any(part in self.excluded_dirs for part in parts)

    def get_file_hash(self, filepath):
        """Calcula el hash MD5 de un archivo para comparar contenido."""
        try:
            hasher = hashlib.md5()
            with open(filepath, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hasher.update(chunk)
            return hasher.hexdigest()
        except (IOError, OSError) as e:
            print(f"⚠️  Error leyendo archivo {filepath}: {e}")
            return None

    def scan_directory_content(self, directory):
        """Escanea un directorio y crea un mapa de contenido -> archivos."""
        content_map = defaultdict(list)
        file_count = 0
        
        try:
            for root, dirnames, filenames in os.walk(directory):
                # Excluir directorios no deseados
                dirnames[:] = [d for d in dirnames if d not in self.excluded_dirs]
                
                for filename in filenames:
                    full_path = os.path.join(root, filename)
                    if not self.is_excluded(full_path):
                        relative_path = os.path.relpath(full_path, directory)
                        file_hash = self.get_file_hash(full_path)
                        
                        if file_hash:
                            content_map[file_hash].append(relative_path)
                            file_count += 1
            
            return content_map, file_count
        except PermissionError:
            print(f"⚠️  Advertencia: Sin permisos para acceder a {directory}")
            return {}, 0

    def compare_by_content(self, dir1, dir2):
        """Compara dos directorios basándose en el contenido de los archivos."""
        print(f"\n🔍 Escaneando contenido del primer directorio...")
        content_map1, count1 = self.scan_directory_content(dir1)
        print(f"   ✅ Escaneados {count1} archivos en el primer directorio")
        
        print(f"\n🔍 Escaneando contenido del segundo directorio...")
        content_map2, count2 = self.scan_directory_content(dir2)
        print(f"   ✅ Escaneados {count2} archivos en el segundo directorio")
        
        # Encontrar archivos únicos en cada directorio
        unique_in_dir1 = {}
        unique_in_dir2 = {}
        
        all_hashes = set(content_map1.keys()) | set(content_map2.keys())
        
        for file_hash in all_hashes:
            files1 = content_map1.get(file_hash, [])
            files2 = content_map2.get(file_hash, [])
            
            if files1 and not files2:
                unique_in_dir1[file_hash] = files1
            elif files2 and not files1:
                unique_in_dir2[file_hash] = files2
        
        # Encontrar archivos con mismo nombre pero diferente contenido
        same_name_diff_content = []
        
        # Crear mapa nombre -> hash para cada directorio
        name_to_hash1 = {}
        for file_hash, files in content_map1.items():
            for file in files:
                name_to_hash1[file] = file_hash
        
        name_to_hash2 = {}
        for file_hash, files in content_map2.items():
            for file in files:
                name_to_hash2[file] = file_hash
        
        # Comparar archivos con mismo nombre
        common_names = set(name_to_hash1.keys()) & set(name_to_hash2.keys())
        for filename in common_names:
            if name_to_hash1[filename] != name_to_hash2[filename]:
                same_name_diff_content.append(filename)
        
        return unique_in_dir1, unique_in_dir2, same_name_diff_content, name_to_hash1, name_to_hash2, content_map1, content_map2

    def show_diff(self, file1_path, file2_path):
        """Muestra las diferencias entre dos archivos al estilo git diff."""
        try:
            with open(file1_path, 'r', encoding='utf-8') as f1:
                lines1 = f1.readlines()
        except UnicodeDecodeError:
            try:
                with open(file1_path, 'r', encoding='latin-1') as f1:
                    lines1 = f1.readlines()
            except:
                print("    No se puede mostrar diff - archivo binario o codificación no soportada")
                return
        except Exception as e:
            print(f"    Error leyendo {file1_path}: {e}")
            return
        
        try:
            with open(file2_path, 'r', encoding='utf-8') as f2:
                lines2 = f2.readlines()
        except UnicodeDecodeError:
            try:
                with open(file2_path, 'r', encoding='latin-1') as f2:
                    lines2 = f2.readlines()
            except:
                print("    No se puede mostrar diff - archivo binario o codificación no soportada")
                return
        except Exception as e:
            print(f"    Error leyendo {file2_path}: {e}")
            return
        
        print(f"\n    ┌─ Diferencias encontradas ─┐")
        print(f"    │ Directorio 1: {os.path.basename(file1_path)}")
        print(f"    │ Directorio 2: {os.path.basename(file2_path)}")
        print(f"    └{'─' * (max(len(os.path.basename(file1_path)), len(os.path.basename(file2_path))) + 18)}┘")
        
        diff = difflib.unified_diff(
            lines1, lines2,
            fromfile=os.path.basename(file1_path),
            tofile=os.path.basename(file2_path),
            lineterm=''
        )
        
        diff_displayed = False
        for line in diff:
            if line.startswith('---') or line.startswith('+++'):
                continue
            if line.startswith('@@'):
                print(f"    {line}")
            elif line.startswith('+'):
                print(f"    \033[92m{line}\033[0m")  # Verde para adiciones
            elif line.startswith('-'):
                print(f"    \033[91m{line}\033[0m")  # Rojo para eliminaciones
            else:
                print(f"    {line}")
            diff_displayed = True
        
        if not diff_displayed:
            print("    (No hay diferencias visibles en texto)")

    def show_file_preview(self, file_path, max_lines=10):
        """Muestra una vista previa del contenido de un archivo."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                print(f"\n    Vista previa de {os.path.basename(file_path)}:")
                print("    " + "─" * 50)
                for i, line in enumerate(lines[:max_lines]):
                    print(f"    {i+1:3}: {line.rstrip()}")
                if len(lines) > max_lines:
                    print(f"    ... y {len(lines) - max_lines} líneas más")
        except UnicodeDecodeError:
            try:
                with open(file_path, 'r', encoding='latin-1') as f:
                    lines = f.readlines()
                    print(f"\n    Vista previa de {os.path.basename(file_path)} (latin-1):")
                    print("    " + "─" * 50)
                    for i, line in enumerate(lines[:max_lines]):
                        print(f"    {i+1:3}: {line.rstrip()}")
                    if len(lines) > max_lines:
                        print(f"    ... y {len(lines) - max_lines} líneas más")
            except:
                print(f"    No se puede mostrar vista previa - archivo binario")
        except Exception as e:
            print(f"    Error mostrando vista previa: {e}")

    def merge_directories(self, dir1, dir2, merge_dir, unique1, unique2, same_name_diff, name_to_hash1, name_to_hash2, content_map1, content_map2):
        """Crea un directorio mergeado permitiendo elegir qué archivos conservar."""
        print(f"\n🔄 Iniciando proceso de merge...")
        print(f"   Directorio de merge: {merge_dir}")
        
        if os.path.exists(merge_dir):
            response = input(f"   ⚠️  El directorio {merge_dir} ya existe. ¿Sobrescribir? (s/n): ").lower()
            if response not in ['s', 'si', 'sí', 'y', 'yes']:
                print("   Merge cancelado")
                return
            shutil.rmtree(merge_dir)
        
        os.makedirs(merge_dir)
        
        # Procesar archivos únicos del directorio 1
        print(f"\n📁 Procesando archivos únicos del primer directorio...")
        files_to_process = []
        for file_hash, files in unique1.items():
            for file in files:
                files_to_process.append(('dir1', file, file_hash))
        
        for source, filename, file_hash in files_to_process:
            src_path = os.path.join(dir1, filename)
            dst_path = os.path.join(merge_dir, filename)
            
            print(f"\n   📄 Archivo único: {filename}")
            print(f"   📍 Solo existe en el primer directorio")
            
            self.show_file_preview(src_path)
            
            while True:
                print(f"\n    ¿Qué deseas hacer con este archivo?")
                print(f"    1. Copiar al directorio mergeado")
                print(f"    2. Omitir (no copiar)")
                print(f"    3. Ver vista previa otra vez")
                
                choice = input("\n    Tu elección (1-3): ").strip()
                
                if choice == '1':
                    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
                    shutil.copy2(src_path, dst_path)
                    print(f"    ✅ Archivo copiado")
                    break
                elif choice == '2':
                    print(f"    ⏭️  Archivo omitido")
                    break
                elif choice == '3':
                    self.show_file_preview(src_path)
                else:
                    print("    ❌ Opción no válida")
        
        # Procesar archivos únicos del directorio 2
        print(f"\n📁 Procesando archivos únicos del segundo directorio...")
        files_to_process = []
        for file_hash, files in unique2.items():
            for file in files:
                files_to_process.append(('dir2', file, file_hash))
        
        for source, filename, file_hash in files_to_process:
            src_path = os.path.join(dir2, filename)
            dst_path = os.path.join(merge_dir, filename)
            
            print(f"\n   📄 Archivo único: {filename}")
            print(f"   📍 Solo existe en el segundo directorio")
            
            self.show_file_preview(src_path)
            
            while True:
                print(f"\n    ¿Qué deseas hacer con este archivo?")
                print(f"    1. Copiar al directorio mergeado")
                print(f"    2. Omitir (no copiar)")
                print(f"    3. Ver vista previa otra vez")
                
                choice = input("\n    Tu elección (1-3): ").strip()
                
                if choice == '1':
                    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
                    shutil.copy2(src_path, dst_path)
                    print(f"    ✅ Archivo copiado")
                    break
                elif choice == '2':
                    print(f"    ⏭️  Archivo omitido")
                    break
                elif choice == '3':
                    self.show_file_preview(src_path)
                else:
                    print("    ❌ Opción no válida")
        
        # Procesar archivos con mismo nombre pero diferente contenido
        print(f"\n🔄 Procesando archivos con mismo nombre pero contenido diferente...")
        for filename in same_name_diff:
            file1_path = os.path.join(dir1, filename)
            file2_path = os.path.join(dir2, filename)
            merge_path = os.path.join(merge_dir, filename)
            
            print(f"\n   📄 Archivo conflictivo: {filename}")
            print(f"   ⚠️  Existe en ambos directorios con contenido diferente")
            
            # Mostrar diferencias
            self.show_diff(file1_path, file2_path)
            
            # Preguntar al usuario
            while True:
                print(f"\n    ¿Qué versión deseas conservar?")
                print(f"    1. Versión del primer directorio")
                print(f"    2. Versión del segundo directorio")
                print(f"    3. Ver diferencias otra vez")
                print(f"    4. Ver vista previa del primer directorio")
                print(f"    5. Ver vista previa del segundo directorio")
                print(f"    6. Saltar este archivo (no copiar)")
                
                choice = input("\n    Tu elección (1-6): ").strip()
                
                if choice == '1':
                    os.makedirs(os.path.dirname(merge_path), exist_ok=True)
                    shutil.copy2(file1_path, merge_path)
                    print(f"    ✅ Conservada versión del primer directorio")
                    break
                elif choice == '2':
                    os.makedirs(os.path.dirname(merge_path), exist_ok=True)
                    shutil.copy2(file2_path, merge_path)
                    print(f"    ✅ Conservada versión del segundo directorio")
                    break
                elif choice == '3':
                    self.show_diff(file1_path, file2_path)
                elif choice == '4':
                    self.show_file_preview(file1_path)
                elif choice == '5':
                    self.show_file_preview(file2_path)
                elif choice == '6':
                    print(f"    ⏭️  Archivo saltado")
                    break
                else:
                    print("    ❌ Opción no válida")
        
        # Copiar archivos idénticos (mismo nombre y mismo contenido)
        print(f"\n📁 Copiando archivos idénticos en ambos directorios...")
        common_files = set(name_to_hash1.keys()) & set(name_to_hash2.keys())
        identical_files = [f for f in common_files if name_to_hash1[f] == name_to_hash2[f]]
        
        for filename in identical_files:
            src = os.path.join(dir1, filename)  # Podría ser de dir1 o dir2, son iguales
            dst = os.path.join(merge_dir, filename)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)
            print(f"   ✅ {filename} (idéntico en ambos directorios)")
        
        print(f"\n🎉 Merge completado en: {merge_dir}")

    def display_content_results(self, unique1, unique2, same_name_diff, dir1, dir2):
        """Muestra los resultados de la comparación por contenido."""
        print("\n" + "="*60)
        print("           RESULTADOS DE COMPARACIÓN POR CONTENIDO")
        print("="*60)
        
        total_unique1 = sum(len(files) for files in unique1.values())
        total_unique2 = sum(len(files) for files in unique2.values())
        
        print(f"\n📊 ESTADÍSTICAS:")
        print(f"   • Archivos con contenido único en directorio 1: {total_unique1}")
        print(f"   • Archivos con contenido único en directorio 2: {total_unique2}")
        print(f"   • Archivos con mismo nombre pero contenido diferente: {len(same_name_diff)}")
        
        if total_unique1 > 0:
            print(f"\n📁 CONTENIDO ÚNICO EN PRIMER DIRECTORIO ({total_unique1} archivos):")
            for file_hash, files in unique1.items():
                for file in sorted(files):
                    print(f"     • {file}")
        
        if total_unique2 > 0:
            print(f"\n📁 CONTENIDO ÚNICO EN SEGUNDO DIRECTORIO ({total_unique2} archivos):")
            for file_hash, files in unique2.items():
                for file in sorted(files):
                    print(f"     • {file}")
        
        if same_name_diff:
            print(f"\n🔄 ARCHIVOS CON MISMO NOMBRE PERO CONTENIDO DIFERENTE ({len(same_name_diff)}):")
            for file in sorted(same_name_diff):
                print(f"   • {file}")

    def run(self):
        """Ejecuta el programa principal."""
        print("🚀 Iniciando comparador y merge de directorios...")
        
        while True:
            available_dirs = self.display_menu()
            
            if available_dirs is None:
                break
            
            dir1 = self.get_directory_input("Selecciona el primer directorio:", available_dirs)
            if dir1 is None:
                break
                
            dir2 = self.get_directory_input("Selecciona el segundo directorio:", available_dirs)
            if dir2 is None:
                break
            
            if dir1 == dir2:
                print("❌ Error: No puedes comparar el mismo directorio")
                continue
            
            try:
                print(f"\n🔄 Iniciando comparación por contenido...")
                unique1, unique2, same_name_diff, name_to_hash1, name_to_hash2, content_map1, content_map2 = self.compare_by_content(dir1, dir2)
                self.display_content_results(unique1, unique2, same_name_diff, dir1, dir2)
                
                # Ofrecer opción de merge
                print(f"\n{'='*60}")
                print("           OPCIÓN DE MERGE")
                print("="*60)
                merge_choice = input("\n¿Deseas crear un directorio mergeado? (s/n): ").strip().lower()
                
                if merge_choice in ['s', 'si', 'sí', 'y', 'yes']:
                    merge_name = input("Nombre del directorio mergeado (default: 'merged_result'): ").strip()
                    if not merge_name:
                        merge_name = "merged_result"
                    
                    merge_dir = os.path.join(self.current_dir, merge_name)
                    self.merge_directories(dir1, dir2, merge_dir, unique1, unique2, same_name_diff, name_to_hash1, name_to_hash2, content_map1, content_map2)
                
            except Exception as e:
                print(f"❌ Error durante la comparación: {e}")
            
            # Preguntar si desea realizar otra comparación
            another = input("\n¿Deseas realizar otra comparación? (s/n): ").strip().lower()
            if another not in ['s', 'si', 'sí', 'y', 'yes']:
                print("👋 ¡Hasta luego!")
                break

def main():
    comparator = ContentDirectoryComparator()
    comparator.run()

if __name__ == "__main__":
    main()