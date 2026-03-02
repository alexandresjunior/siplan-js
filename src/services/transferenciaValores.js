import api from './api';

const TransferenciaService = {

    buscarUnidades: async (texto) => {
        const response = await api.get(`/elementoOrganizacional/nome/${encodeURIComponent(texto.trim())}`);
        return Array.from(response.data || []);
    },


    buscarIndicadoresPorUnidade: async (unidadeId) => {
        const response = await api.get(`/indicador/valores/${unidadeId}`);
        return response.data || [];
    },


    realizarTransferencia: async (deId, paraId, indicadorId) => {
        // PAYLOAD CORRETO → Mantido idêntico ao original
        const payload = [
            {
                indicadorDe: { id: indicadorId },
                indicadorPara: { id: indicadorId },
                elementoOrganizacionalDe: { id: deId },
                elementoOrganizacionalPara: { id: paraId }
            }
        ];

        await api.post('/indicador/transferir', payload);
    }
};

export default TransferenciaService;