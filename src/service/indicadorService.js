const URL_BASE = 'http://localhost:8098/indicador';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Token de autenticação não encontrado. Por favor, faça o login novamente.');
        throw new Error('Token não encontrado');
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};


export const buscarIndicadoresExcluidosPaginados = async (idElementoOrganizacional, pagina, tamanho) => {
    const headers = getAuthHeaders();

    const url = `${URL_BASE}/lixeira/paginados/${idElementoOrganizacional}?page=${pagina}&size=${tamanho}&sort=nomeIndicador,asc`;
    
    const resposta = await fetch(url, { headers });

    if (!resposta.ok) {
        const textoErro = await resposta.text();
        throw new Error(`Erro HTTP: ${resposta.status} - ${textoErro}`);
    }

    return await resposta.json();
};


export const restaurarIndicador = async (idIndicador) => {
    const headers = getAuthHeaders();

    const resposta = await fetch(`${URL_BASE}/restaurar`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(idIndicador)
    });

    if (!resposta.ok) {
        throw new Error('Falha ao restaurar o indicador.');
    }

};


export const excluirIndicadorPermanentemente = async (idIndicador) => {
    const headers = getAuthHeaders();

    const resposta = await fetch(`${URL_BASE}/excluirIndicador/${idIndicador}`, {
        method: 'DELETE',
        headers: headers
    });

    if (!resposta.ok) {
        const textoErro = await resposta.text();
        throw new Error(`Falha ao excluir o indicador permanentemente: ${textoErro}`);
    }

};