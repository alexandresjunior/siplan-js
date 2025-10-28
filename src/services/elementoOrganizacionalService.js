const URL_BASE = 'http://localhost:8098/elementoOrganizacional';


const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('Token de autenticação não encontrado.');
        throw new Error('Token não encontrado'); 
    }
    
    return { 'Authorization': `Bearer ${token}` };
};

export const buscarDiretoriasPorAno = async (ano) => {
    const headers = getAuthHeaders();
    
    const resposta = await fetch(`${URL_BASE}/apenasDiretorias/${ano}`, { headers });
    
    if (!resposta.ok) throw new Error('Falha ao buscar diretorias.');
    return await resposta.json();
};

export const buscarUnidadesPorDiretoria = async (ano, idDiretoria) => {
    const headers = getAuthHeaders();
    
    const resposta = await fetch(`${URL_BASE}/nome/ano/null/${ano}/${idDiretoria}`, { headers });
    
    if (!resposta.ok) throw new Error('Falha ao buscar unidades.');
    return await resposta.json();
};