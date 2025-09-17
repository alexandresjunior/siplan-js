const MAX_BUTTONS = 5;

const Pagination = ({
  styles,
  page,
  setPage,
  size,
  setSize,
  totalPages,
  totalElements,
  pageOptions = [10, 20, 40]
}) => {
  const startPage = Math.max(
    0,
    Math.min(page - Math.floor(MAX_BUTTONS / 2), totalPages - MAX_BUTTONS)
  );

  const endPage = Math.min(totalPages, startPage + MAX_BUTTONS);

  const visiblePages = Array.from(
    { length: endPage - startPage },
    (_, i) => startPage + i + 1
  );

  return (
    <div className={styles}>
      <nav aria-label="page navigation">
        <ul className="pagination me-2">
          {visiblePages.length >= 1 &&
            visiblePages.map((pageNumber) => (
              <li key={pageNumber} className="page-item">
                <button
                  className={`page-link ${pageNumber === page + 1 && "active"}`}
                  onClick={() => setPage(pageNumber - 1)}
                  style={{
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 2px",
                    backgroundColor: pageNumber === page + 1 ? "var(--azul-compesa)" : "transparent", // Aplica a cor apenas no ativo
                    color: pageNumber === page + 1 ? "#ffffffff" : "var(--azul-compesa)", // Texto branco no ativo, azul no inativo
                    border: "1px solid var(--azul-compesa)"
                  }}
                >
                  {pageNumber}
                </button>
              </li>
            ))}
        </ul>
      </nav>

      <h6 className="d-flex align-items-center text-dark mb-3">
        Exibir
        <select
          className="form-select text-body-primary mx-2"
          onChange={(event) => setSize(event.target.value)}
          defaultValue={size}
        >
          <option className="form-select-item text-body-primary" value={pageOptions[0]}>
            {pageOptions[0]}
          </option>
          <option className="form-select-item text-body-primary" value={pageOptions[1]}>
            {pageOptions[1]}
          </option>
          <option className="form-select-item text-body-primary" value={pageOptions[2]}>
            {pageOptions[2]}
          </option>
        </select>
        de {totalElements} resultados
      </h6>
    </div>
  );
};

export default Pagination;
