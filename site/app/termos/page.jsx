import DocPage from '../components/DocPage';
import { ISSUES_URL, LICENSE_URL } from '../site';

export const metadata = { title: 'Termos de uso | Beyblade Arena' };

export default function Termos() {
  return (
    <DocPage title="Termos de uso" intro="As regras para usar esta página e o jogo. São curtas porque o projeto é simples: gratuito, de fã e sem fins lucrativos.">
      <h2>Projeto de fã</h2>
      <p>
        O Beyblade Arena é um jogo feito por fã, gratuito e sem fins lucrativos. Não tem vínculo, patrocínio ou
        aprovação da Takara Tomy, Hasbro, Nelvana, d-rights ou de qualquer outro dono da franquia Beyblade.
      </p>

      <h2>Marcas e conteúdo de terceiros</h2>
      <p>
        Beyblade, os nomes dos personagens, das beyblades e das feras bit são marcas e obras dos seus donos. As imagens
        do anime nesta página são usadas como homenagem, sem venda nem publicidade, com a origem listada nos{' '}
        <a href="/creditos/">créditos</a>. Nenhum desses direitos é transferido a quem usa o site ou o jogo.
      </p>

      <h2>Pedidos de remoção</h2>
      <p>
        Se você é dono de algum direito usado aqui e quer que algo seja retirado, abra uma{' '}
        <a href={ISSUES_URL}>issue no GitHub</a> indicando o conteúdo. Ele sai do ar o quanto antes.
      </p>

      <h2>Licença do código</h2>
      <p>
        O código do jogo e desta página está sob a <a href={LICENSE_URL}>licença MIT</a>. Ela permite usar, copiar e
        modificar o código, mantendo o aviso de copyright. A licença cobre só o código e a arte original do projeto:
        não cobre as marcas e imagens de terceiros citadas acima.
      </p>

      <h2>Sem garantia</h2>
      <p>
        O jogo é oferecido &ldquo;como está&rdquo;, sem garantia de funcionamento, e está em desenvolvimento. Use por sua
        conta. Baixe o instalador só pelos links oficiais desta página ou do repositório, e confira o SHA-256 publicado
        em cada versão.
      </p>

      <h2>Lei aplicável</h2>
      <p>Estes termos seguem as leis do Brasil.</p>
    </DocPage>
  );
}
