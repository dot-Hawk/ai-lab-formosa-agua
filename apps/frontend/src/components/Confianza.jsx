import { TEXTO_CONFIANZA } from "../lib/vista.js";

/** Semáforo de confianza de la comparación, con el motivo de cada criterio. */
export default function Confianza({ confianza }) {
  if (!confianza) return null;
  const { nivel, motivos, criterios } = confianza;

  return (
    <section className="confianza" aria-labelledby="confianza-titulo">
      <h3 id="confianza-titulo" className="confianza-titulo">
        <span className={`semaforo semaforo-${nivel}`} aria-hidden="true" />
        Confianza del resultado: {TEXTO_CONFIANZA[nivel]}
      </h3>
      <ul>
        {motivos.map((m) => (
          <li key={m.texto}>
            <span className={`semaforo semaforo-${m.nivel}`} aria-hidden="true" />
            <span>
              {m.texto} <span className="visualmente-oculto">({TEXTO_CONFIANZA[m.nivel]})</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="ayuda">{criterios}</p>
    </section>
  );
}
