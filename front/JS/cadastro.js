// cadastro.js - Preview de foto no cadastro

document.addEventListener('DOMContentLoaded', () => {
    const fotoInput = document.getElementById('foto_perfil');
    const fotoPreview = document.getElementById('foto-preview');
    
    // Click na preview para abrir seletor de arquivo
    if (fotoPreview) {
        fotoPreview.addEventListener('click', () => {
            fotoInput.click();
        });
    }
    
    // Preview da foto selecionada
    if (fotoInput) {
        fotoInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('A imagem deve ter no máximo 5MB');
                    return;
                }
                
                if (!file.type.startsWith('image/')) {
                    alert('Apenas arquivos de imagem são permitidos');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    fotoPreview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="Preview da foto">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});
