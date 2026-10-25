import DocPage from '../components/DocPage';
import Picture from '../components/Picture';
import { images } from '../site';
import beys from '../../assets/beyblades/sources.json';

export const metadata = { title: 'Créditos | Beyblade Arena' };

export default function Creditos() {
  return (
    <DocPage
      title="Créditos"
      intro="Origens das imagens e ilustrações desta página. Fontes: Dela Gothic One e Barlow (SIL Open Font License). Ícones: Lucide (ISC)."
    >
      <p>
        Os frames do anime <em>Beyblade</em> (<em>Bakuten Shoot Beyblade</em>, Nelvana / d-rights /
        Takara Tomy) foram obtidos na Beyblade Wiki (Fandom). Os direitos pertencem aos seus donos; o uso aqui é de fã e sem
        fins lucrativos. As imagens foram redimensionadas e convertidas para WebP.
      </p>
      <h2>Beyblades reais</h2>
      <p>
        As quatro beyblades são traçados de fotografias dos brinquedos originais da geração clássica,
        publicadas na Beyblade Wiki. Os SVGs usam curvas, sem fotografias embutidas; a página carrega versões
        WebP responsivas desses vetores. O traçado preserva o formato e as cores das peças, mas o detalhe
        disponível depende da fotografia de origem. As fotos e os modelos mantêm os direitos de seus titulares.
      </p>
      <ul>{beys.map((bey) => <li key={bey.id}><a href={bey.credit}>{bey.name}: fotografia de referência</a></li>)}</ul>
      <p>
        O movimento Dragoon × Dranzer é uma animação conceitual de 1152 × 648 pixels, com 48 quadros,
        gerada a partir dos mesmos vetores. Não é uma captura de gameplay.
      </p>
      <h2>Frames do anime</h2>
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
