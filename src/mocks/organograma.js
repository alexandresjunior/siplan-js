// Simula os serviços: ElementoOrganizacionalService, ComiteService, etc.
const allDiretorias = [
    { id: 101, sigla: 'PRE', descricao: 'PRESIDÊNCIA', tipo: 'D' },
    { id: 102, sigla: 'DTE', descricao: 'DIRETORIA TÉCNICA', tipo: 'D' },
    { id: 103, sigla: 'DFI', descricao: 'DIRETORIA FINANCEIRA', tipo: 'D' },
    { id: 104, sigla: 'DCO', descricao: 'DIRETORIA COMERCIAL', tipo: 'D' },
];

const allElementos = [
    { id: 201, diretoriaId: 102, descricao: 'Gerência de Obras' },
    { id: 202, diretoriaId: 102, descricao: 'Coordenação de Saneamento' },
    { id: 203, diretoriaId: 103, descricao: 'Gerência de Contas a Pagar' },
    { id: 204, diretoriaId: 103, descricao: 'Tesouraria' },
    { id: 205, diretoriaId: 104, descricao: 'Coordenação de Atendimento ao Cliente' },
    { id: 206, diretoriaId: 104, descricao: 'Gerência de Faturamento' },
];

const allComites = [
    { id: 901, descricao: 'Comitê de Ética', tipo: 'COMITE' },
    { id: 902, descricao: 'Comitê de Investimentos', tipo: 'COMITE' },
];

// Funções que simulam chamadas de API assíncronas
export const organogramaApi = {
    obterDiretorias: async (ano) => {
        console.log(`Buscando diretorias para o ano: ${ano}`);
        // Em um app real, o ano seria usado no filtro da API
        await new Promise(resolve => setTimeout(resolve, 200)); // Simula latência
        return [...allDiretorias];
    },

    filtrarElementos: async (texto, ano, diretoriaId) => {
        console.log(`Filtrando elementos com: texto=${texto}, ano=${ano}, diretoriaId=${diretoriaId}`);
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!diretoriaId) return [];

        return allElementos.filter(el =>
            el.diretoriaId === diretoriaId &&
            el.descricao.toLowerCase().includes(texto.toLowerCase())
        );
    },

    obterComites: async () => {
        console.log('Buscando comitês');
        await new Promise(resolve => setTimeout(resolve, 200));
        return [...allComites];
    }
};