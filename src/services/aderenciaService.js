const URL_BASE = 'http://localhost:8098/aderencia';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token não encontrado');
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
};

export const buscarCalendarioPaginado = async (pagina, tamanho) => {
    const headers = getAuthHeaders();
    const url = `${URL_BASE}/diretoriasPaginada?page=${pagina}&linesPerPage=${tamanho}`;
    
    const resposta = await fetch(url, { headers });
    if (!resposta.ok) throw new Error('Falha ao buscar o calendário de reuniões.');
    return await resposta.json();
};


export const salvarCalendario = async (dadosCalendario) => {
    const headers = getAuthHeaders();
    
    const resposta = await fetch(`${URL_BASE}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(dadosCalendario)
    });
    if (!resposta.ok) {
        const erro = await resposta.text();
        throw new Error(`Falha ao salvar o registro do calendário: ${erro}`);
    }
    const text = await resposta.text();
    return text ? JSON.parse(text) : Promise.resolve(); 
};

export const excluirCalendario = async (id) => {
    const headers = getAuthHeaders();
    const resposta = await fetch(`${URL_BASE}/${id}`, {
        method: 'DELETE',
        headers: headers
    });
    if (!resposta.ok) {
        const erro = await resposta.text();
        throw new Error(`Falha ao excluir o registro do calendário: ${erro}`);
    }
    return await resposta.json();
}