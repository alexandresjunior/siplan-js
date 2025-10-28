import api from './api'

const URL_BUSCAR_USUARIO = 'http://localhost:8098/usuariosip/busca/por-login';


export const obterUsuarioPorLogin = async (login) => {
    try {
        const token = localStorage.getItem('token');
        
        const { data } = await api.get(URL_BUSCAR_USUARIO, {
            params: {
                login: login 
            },
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        return data; 

    } catch (erro) {
        if (erro.response && erro.response.status === 404) {
            throw new Error(`O login de rede '${login}' não está cadastrado.`);
        }
        throw erro;
    }
};