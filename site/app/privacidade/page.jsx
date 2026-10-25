import DocPage from '../components/DocPage';
import { ISSUES_URL } from '../site';

export const metadata = { title: 'Privacidade | Beyblade Arena' };

export default function Privacidade() {
  return (
    <DocPage title="Privacidade" intro="Esta página não coleta seus dados. Aqui está o que acontece de fato quando você a visita e quando baixa o jogo.">
      <h2>O que esta página não faz</h2>
      <ul>
        <li>Não usa cookies, nem de análise, nem de publicidade.</li>
        <li>Não tem formulários, cadastro, login ou newsletter.</li>
        <li>Não usa Google Analytics, pixels de redes sociais ou ferramentas parecidas.</li>
        <li>
          Não carrega nada de terceiros no seu navegador: fontes, imagens e scripts são servidos pelo próprio site.
        </li>
      </ul>

      <h2>Registros técnicos da hospedagem</h2>
      <p>
        O site é hospedado pela Vercel. Como qualquer servidor, ela recebe dados técnicos da conexão (como endereço IP,
        navegador e página pedida) para entregar o site e proteger contra abusos. Nós não acessamos esses registros
        para identificar visitantes. O tratamento segue a{' '}
        <a href="https://vercel.com/legal/privacy-policy">política de privacidade da Vercel</a>.
      </p>

      <h2>Download do jogo</h2>
      <p>
        O botão Baixar leva ao GitHub, onde o instalador fica hospedado. A partir dali vale a{' '}
        <a href="https://docs.github.com/pt/site-policy/privacy-policies/github-general-privacy-statement">
          declaração de privacidade do GitHub
        </a>
        . O mesmo vale para os links de código, versões e issues.
      </p>

      <h2>O jogo</h2>
      <p>
        O Beyblade Arena roda offline. Configurações de controle e histórico de partidas ficam salvos só no seu
        computador e não são enviados para nenhum servidor.
      </p>

      <h2>Seus direitos</h2>
      <p>
        A Lei Geral de Proteção de Dados (Lei 13.709/2018) garante, entre outros, o direito de saber se dados seus são
        tratados, de acessá-los e de pedir correção ou exclusão. Como este projeto não coleta dados pessoais, não temos
        dados seus guardados. Dúvidas ou pedidos podem ser feitos pelas <a href={ISSUES_URL}>issues do GitHub</a>.
      </p>

      <h2>Mudanças</h2>
      <p>
        Se a página passar a coletar qualquer dado, esta política será atualizada antes, com a data no topo.
      </p>
    </DocPage>
  );
}
