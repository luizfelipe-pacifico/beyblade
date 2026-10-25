import DocPage from '../components/DocPage';
import Picture from '../components/Picture';
import { images } from '../site';

export const metadata = { title: 'Créditos | Beyblade Arena' };

export default function Creditos() {
  return (
    <DocPage
      title="Créditos"
      intro="Os frames do anime usados nesta página, com o episódio e a origem de cada um. Fontes: Dela Gothic One e Barlow (SIL Open Font License). Ícones: Lucide (ISC)."
    >
      <p>
        Os frames do anime <em>Beyblade</em> (<em>Bakuten Shoot Beyblade</em>, Nelvana / d-rights /
        Takara Tomy) foram obtidos na Beyblade Wiki (Fandom). Os direitos pertencem aos seus donos; o uso aqui é de fã e sem
        fins lucrativos. As imagens foram redimensionadas e convertidas para WebP.
      </p>
      <p>
        A Dragoon S da abertura e a animação Dragoon × Dranzer são ilustrações vetoriais próprias, geradas a partir
        do catálogo de peças do projeto. O movimento na arena é ilustrativo, não uma captura do jogo. Os vetores
        preservam a nitidez em qualquer tamanho; a demonstração usa WebP animado de 768 × 432 pixels, com 48 quadros.
      </p>
      <ul className="credits">
        {images.map((img) => (
          <li key={img.id}>
            <Picture id={img.id} sizes="200px" />
            <div>
              <p>
                <strong>{img.alt}</strong>
              </p>
              <p className="small">{img.episode}</p>
              <p className="small">
                <a href={img.page}>{img.title}</a>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </DocPage>
  );
}
