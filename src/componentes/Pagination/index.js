import "../Pagination/estilos.css";

const MAX_BOTOES = 5;

const Pagination = ({
  estilos,
  pagina,
  definirPagina,
  tamanho,
  definirTamanho,
  totalPaginas,
  totalElementos,
  opcoesPagina = [10, 20, 40]
}) => {
  const paginaInicial = Math.max(
    0,
    Math.min(pagina - Math.floor(MAX_BOTOES / 2), totalPaginas - MAX_BOTOES)
  );

  const paginaFinal = Math.min(totalPaginas, paginaInicial + MAX_BOTOES);

  const paginasVisiveis = Array.from(
    { length: paginaFinal - paginaInicial },
    (_, i) => paginaInicial + i + 1
  );

  return (
    <div className={estilos}>
      <nav aria-label="navegação de página">
        <ul className="pagination me-2">
          {paginasVisiveis.length >= 1 &&
            paginasVisiveis.map((numeroPagina) => (
              <li key={numeroPagina} className="page-item">
                <button
                  className={`page-link ${numeroPagina === pagina + 1 && "active"} custom-page-link`}
                  onClick={() => definirPagina(numeroPagina - 1)}
                  style={{
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 2px",
                    backgroundColor: numeroPagina === pagina + 1 ? "var(--azul-compesa)" : "transparent",
                    color: numeroPagina === pagina + 1 ? "#ffffff" : "var(--azul-compesa)",
                    border: "1px solid var(--azul-compesa)"
                  }}
                >
                  {numeroPagina}
                </button>
              </li>
            ))}
        </ul>
      </nav>

      <h6 className="d-flex align-items-center text-dark mb-3">
        Exibir
        <select
          id="tamanho-pagina"
          name="tamanho-pagina"
          className="form-select text-body-primary mx-2"
          onChange={(evento) => definirTamanho(evento.target.value)}
          value={tamanho} 
        >
          <option value={opcoesPagina[0]}>{opcoesPagina[0]}</option>
          <option value={opcoesPagina[1]}>{opcoesPagina[1]}</option>
          <option value={opcoesPagina[2]}>{opcoesPagina[2]}</option>
        </select>
        de {totalElementos} resultados
      </h6>
    </div>
  );
};

export default Pagination;