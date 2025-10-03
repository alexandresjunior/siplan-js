// service/novoUsuarioService.js

import axios from 'axios';

// 🚨 Você deve ter um endpoint no backend para buscar usuários pelo login de rede
// Exemplo: GET /usuarios/buscar-por-login?login={loginRede}
export const buscarUsuarioPorLogin = async (loginRede, URL_BUSCAR_POR_LOGIN) => {
    try {
        const token = localStorage.getItem('token');
        
        // 💡 Assumindo que o endpoint de busca exige o login como parâmetro de query
        const urlComLogin = `${URL_BUSCAR_POR_LOGIN}?login=${loginRede}`;

        const { data } = await axios.get(urlComLogin, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        // Retorna o objeto do usuário encontrado
        return data; 

    } catch (erro) {
        console.error('Erro ao buscar usuário por login:', erro);
        // Lançar o erro para que o componente possa tratá-lo e exibir uma mensagem
        throw erro;
    }
};