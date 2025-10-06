import axios from 'axios';

const URL_BUSCAR_USUARIO = 'http://localhost:8098/usuariosip/busca/por-login';

// Renomeei para ser mais genérico e claro
export const obterUsuarioPorLogin = async (login) => {
    try {
        const token = localStorage.getItem('token');
        
        // 🚨 MUDANÇA CRÍTICA: Usar o objeto 'params' do Axios
        const { data } = await axios.get(URL_BUSCAR_USUARIO, {
            params: {
                // Axios monta: ?login=valorDoLogin
                login: login 
            },
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        // Retorna o objeto UsuarioSiplan encontrado
        return data; 

    } catch (erro) {
        // Se o backend retornar 404, tratamos como "Usuário não encontrado"
        if (erro.response && erro.response.status === 404) {
            throw new Error(`O login de rede '${login}' não está cadastrado.`);
        }
        // Lança outros erros (401, 500, etc.)
        throw erro;
    }
};