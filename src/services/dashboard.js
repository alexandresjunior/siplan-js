
import api from './api';

const MES_POR_EXTENSO = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Formata o título da aba (Mensal ou Acumulado)
 */
export const formatarTituloAba = (cartoes, tipo) => {
    if (!cartoes || cartoes.length === 0) {
        return tipo === 'mensal' ? 'Mensal' : 'Acumulado';
    }

    const periodo = cartoes[0].periodo;
    if (!periodo) return tipo === 'mensal' ? 'Mensal' : 'Acumulado';

    return `${tipo === 'mensal' ? 'Mensal' : 'Acumulado'} (${periodo})`;
};

/**
 * Calcula o ciclo atual (1º, 2º, ..., 12º Ciclo) com base no cartão mensal
 */
export const calcularCicloAtual = (cartoes) => {
    const cartaoMensal = cartoes.find(
        c => c.tipoPeriodo?.toUpperCase() === 'MENSAL' && c.periodo
    );

    if (!cartaoMensal?.periodo) return 'Ciclo';

    const mesTexto = cartaoMensal.periodo.split('/')[0].trim(); // ex: "Novembro"

    const indice = MES_POR_EXTENSO.findIndex(
        m => m.toUpperCase() === mesTexto.toUpperCase()
    );

    if (indice === -1) return 'Ciclo';

    // CORREÇÃO: use o próprio índice + 1
    const numeroCiclo = indice + 1;
    return `${numeroCiclo}º Ciclo`;
};

/**
 * Busca e formata os cartões do backend
 */
export const buscarCartoes = async () => {
    const response = await api.get('/dashboard/listarCartoes');
    return response.data.map(cartao => {
        const ehTeto = cartao.tipoIndicador === 'TETO';
        return {
            ...cartao,
            teto: ehTeto ? cartao.valorIndicador : undefined,
            meta: !ehTeto ? cartao.valorIndicador : undefined,
        };
    });
};

/**
 * Atualiza um cartão na lista (usado após edição)
 */
export const atualizarCartaoNaLista = (cartoesAtuais, cartaoAtualizado) => {
    return cartoesAtuais.map(c =>
        c.id === cartaoAtualizado.id ? cartaoAtualizado : c
    );
};

/**
 * Separa cartões por tipoPeriodo
 */
export const separarCartoesPorTipo = (cartoes) => {
    return {
        mensal: cartoes.filter(c => c.tipoPeriodo?.toUpperCase() === 'MENSAL'),
        acumulado: cartoes.filter(c => c.tipoPeriodo?.toUpperCase() === 'ACUMULADO')
    };
};