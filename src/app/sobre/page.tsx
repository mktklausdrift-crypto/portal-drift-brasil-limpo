import Link from "next/link";

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 flex flex-col gap-20 pb-10">
        {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70 text-white py-24 shadow-lg rounded-b-3xl">
        <div className="absolute inset-0 bg-black/10 rounded-b-3xl"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-6xl font-black mb-6 drop-shadow-lg">Sobre a Drift Brasil</h1>
            <p className="text-2xl text-white/90 max-w-3xl mx-auto drop-shadow">
              Expertise em peças de reposição automotiva com padrão de qualidade original
            </p>
          </div>
        </div>
      </section>

        {/* Nossa História */}
      <section className="py-20 bg-white/80">
  <div className="max-w-[1600px] mx-auto px-1 sm:px-8 lg:px-24 flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1 order-2 md:order-1">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-8 drop-shadow text-left md:text-left">Nossa História</h2>
            <div className="bg-white/90 rounded-2xl shadow-lg p-10 text-gray-700 text-lg leading-relaxed border border-gray-100 mb-0 text-left min-w-[320px] max-w-2xl">
              <span className="font-bold text-primary">A Klaüs Drift Brasil</span><br />
              Há mais de 15 anos no mercado independente de reposição de autopeças, a companhia é referência em distribuição e fabricação de autopeças originais. Atuante no setor de mobilidade, orientando-se pela tecnologia, inovação e sustentabilidade, a Drift Brasil desenvolve soluções para o segmento automotivo brasileiro em sinergia com seus parceiros nacionais e internacionais.<br /><br />
              Hoje, os negócios do qual a Drift faz parte, é composto por mais de 20 empresas de atuação global, sendo todas, referências em seus mercados. De grande importância e benefício, todas essas relações entre parceiros estão diretamente ligadas à troca de tecnologia, e correlacionam inovação, tecnologia e qualidade a todos os produtos Klaüs-Drift. No início de 2015 foi formalizada a união da Drift Brasil com a Klaüs Corporation, sendo ambas, respectivamente, referências em distribuição e fabricação de autopeças originais. Pelos respectivos históricos de sucesso, a empresa já nasce responsável por boa parte do abastecimento do mercado de reposição brasileiro. São mais de 960.000 bombas e 12.000 eletro-ventiladores vendidos anualmente, entre outros produtos. Todo seu catálogo é fabricado utilizando tecnologia europeia, cujos produtos são conhecidos como “100% originais”. Isso significa que abastece o mercado de reposição com os mesmos insumos utilizados nas grandes linhas de montagem. São todos produtos com qualidade original de fábrica.<br /><br />
              Nossa trajetória é marcada pelo investimento contínuo em tecnologia de fabricação, controle de qualidade rigoroso e parcerias duradouras. Atendemos o mercado com <span className="font-semibold">soluções confiáveis, entrega eficiente e suporte técnico especializado</span>.<br />
              Hoje, somos reconhecidos pela excelência em peças para suspensão, direção e transmissão, oferecendo produtos que atendem às especificações técnicas dos fabricantes originais, garantindo segurança, durabilidade e desempenho superior.
            </div>
          </div>
          <div className="flex-1 order-1 md:order-2 flex flex-col items-center">
            <div className="w-full flex flex-col gap-8 items-center">
              {/* Imagem da empresa */}
              <div className="relative w-full max-w-4xl">
                <div className="rounded-3xl shadow-2xl border-4 border-white overflow-hidden bg-gradient-to-br from-primary/10 to-primary/30 w-full">
                  <img src="/empresa.jpg" alt="Empresa" className="object-cover w-full aspect-[16/8] md:aspect-[16/10] lg:aspect-[16/12] max-w-full mx-auto hover:scale-105 transition-transform duration-300" />
                  <span className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center bg-primary text-white px-14 py-6 rounded-2xl shadow-xl border-4 border-white tracking-wide hover:scale-105 transition-transform duration-300" style={{minWidth:'320px'}}>
                    <span className="text-4xl font-black">+19 Anos</span>
                    <span className="text-lg font-semibold mt-1">de Experiência</span>
                  </span>
                </div>
              </div>
              {/* Imagem do estoque */}
              <div className="w-full max-w-3xl">
                <div className="rounded-3xl shadow-2xl border-4 border-white overflow-hidden bg-gradient-to-br from-primary/10 to-primary/30 w-full">
                  <img src="/estoque.jpg" alt="Estoque" className="object-cover w-full aspect-[16/8] md:aspect-[16/10] lg:aspect-[16/12] max-w-full mx-auto hover:scale-105 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Linha do Tempo Visual - Embalagens Drift */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-gray-900 mb-2">NOSSA HISTÓRIA</h2>
              <p className="text-2xl text-gray-700 font-semibold">Uma breve história de um design peculiar</p>
            </div>
            <div className="relative flex flex-col items-center">
              {/* Linha vermelha horizontal */}
              <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-600 z-0" style={{transform: 'translateY(-50%)'}}></div>
              <div className="flex flex-row justify-between w-full z-10 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100" style={{gap: '0.5rem'}}>
                {/* Evento 2007 */}
                <div className="flex flex-col items-center w-1/6">
                  <img src="/timeline/historia-2007.png" alt="Embalagem 2007" className="h-24 mb-2 object-contain" />
                  <div className="w-6 h-6 border-4 border-gray-600 bg-white rounded-full mb-2"></div>
                  <h3 className="text-xl font-bold mt-2">2007</h3>
                  <p className="text-gray-700 text-center text-base mt-2 max-w-[170px] mx-auto leading-snug">Primeira embalagem lançada, marcando o início da trajetória Drift.</p>
                </div>
                {/* Evento 2010 */}
                <div className="flex flex-col items-center w-1/6">
                  <img src="/timeline/historia-2010.png" alt="Embalagem 2010" className="h-24 mb-2 object-contain" />
                  <div className="w-6 h-6 border-4 border-gray-600 bg-white rounded-full mb-2"></div>
                  <h3 className="text-xl font-bold mt-2">2010</h3>
                  <p className="text-gray-700 text-center text-base mt-2 max-w-[170px] mx-auto leading-snug">Aumento das linhas de produtos com novas embalagens mais versáteis.</p>
                </div>
                {/* Evento 2013 */}
                <div className="flex flex-col items-center w-1/6">
                  <img src="/timeline/historia-2013.png" alt="Embalagem 2013" className="h-24 mb-2 object-contain" />
                  <div className="w-6 h-6 border-4 border-gray-600 bg-white rounded-full mb-2"></div>
                  <h3 className="text-xl font-bold mt-2">2013</h3>
                  <p className="text-gray-700 text-center text-base mt-2 max-w-[170px] mx-auto leading-snug">Introdução de embalagens com novas tecnologias e maior proteção.</p>
                </div>
                {/* Evento 2016 */}
                <div className="flex flex-col items-center w-1/6">
                  <img src="/timeline/historia-2016.png" alt="Embalagem 2016" className="h-24 mb-2 object-contain" />
                  <div className="w-6 h-6 border-4 border-gray-600 bg-white rounded-full mb-2"></div>
                  <h3 className="text-xl font-bold mt-2">2016</h3>
                  <p className="text-gray-700 text-center text-base mt-2 max-w-[170px] mx-auto leading-snug">Embalagens redesenhadas com foco em praticidade e eficiência.</p>
                </div>
                {/* Evento 2019 */}
                <div className="flex flex-col items-center w-1/6">
                  <img src="/timeline/historia-2019.png" alt="Embalagem 2019" className="h-24 mb-2 object-contain" />
                  <div className="w-6 h-6 border-4 border-gray-600 bg-white rounded-full mb-2"></div>
                  <h3 className="text-xl font-bold mt-2">2019</h3>
                  <p className="text-gray-700 text-center text-base mt-2 max-w-[170px] mx-auto leading-snug">Embalagens com design moderno, unindo estética e funcionalidade.</p>
                </div>
                {/* Evento 2023 */}
                <div className="flex flex-col items-center w-1/6">
                  <img src="/timeline/historia-2023.png" alt="Embalagem 2023" className="h-24 mb-2 object-contain" />
                  <div className="w-6 h-6 border-4 border-red-600 bg-white rounded-full mb-2"></div>
                  <h3 className="text-xl font-bold mt-2">2023</h3>
                  <p className="text-gray-700 text-center text-base mt-2 max-w-[170px] mx-auto leading-snug">Embalagens modernas e inovadoras, marcadas pela parceria com a Toyota Tsusho.</p>
                </div>
                {/* Evento 2025 */}
                <div className="flex flex-col items-center w-1/6">
                  <img src="/timeline/historia-2025.png" alt="Embalagem 2025" className="h-24 mb-2 object-contain" />
                  <div className="w-6 h-6 border-4 border-blue-600 bg-white rounded-full mb-2"></div>
                  <h3 className="text-xl font-bold mt-2">2025</h3>
                  <p className="text-gray-700 text-center text-base mt-2 max-w-[170px] mx-auto leading-snug">Nova geração de embalagens sustentáveis e inteligentes, reforçando o compromisso com inovação e meio ambiente.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TECNOLOGIA E INOVAÇÃO */}
  <section className="py-20 bg-gray-100 text-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center mb-10">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl text-primary">⚡</span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">TECNOLOGIA E INOVAÇÃO</h2>
              </div>
              <div className="w-20 h-1 bg-primary mb-6"></div>
            </div>
            <div className="text-lg md:text-xl text-gray-900 leading-relaxed space-y-6 text-center drop-shadow-md">
              <p>Klaüs Drift Brasil sempre oferece o melhor em autopeças</p>
              <p>Nossa história sempre foi construída a partir dos vetores: <span className="font-bold text-primary">Tecnologia, Inovação e Sustentabilidade</span>. Bases para diversificadas soluções desenvolvidas para o segmento automotivo mundial, em sintonia com seus parceiros nacionais e internacionais, a Klaüs Drift Brasil sempre oferece o melhor em autopeças.</p>
              <p>A junção das duas operações trouxe ao mercado brasileiro processos inovadores em termos de criação de produtos, produção em larga escala e comercialização estratégica: a Klaüs com o diferencial da tecnologia britânica aplicada à criação e produção automotiva, e a Drift com todo relacionamento e forte rede de distribuição.</p>
              <p>Uma capacidade contínua de transformar informações em inteligência em tempo real é a base da competitividade do grupo.</p>
            </div>
          </div>
        </section>

        {/* Missão, Visão e Valores */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-gray-900 mb-4">Missão, Visão e Valores</h2>
              <p className="text-xl text-gray-600">Os pilares que guiam nossa empresa</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Missão */}
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition border-t-4 border-primary">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Missão</h3>
                <p className="text-gray-700 leading-relaxed">
                  Nossa missão é oferecer aos mercados de manufatura e reposição, produtos e serviços de excelência em qualidade – com inovação e tecnologia – de forma competitiva, e ser parte da satisfação pessoal de cada um de nossos parceiros, clientes e consumidores finais.
                </p>
              </div>
              {/* Visão */}
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition border-t-4 border-primary">
                <div className="text-5xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Visão</h3>
                <p className="text-gray-700 leading-relaxed">
                  Nossa visão é tornar-se referência no mercado global, estando entre as empresas líderes do setor – por meio de seus produtos e serviços – como uma empresa parceira, profissional e de alta performance.
                </p>
              </div>
              {/* Valores */}
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition border-t-4 border-primary">
                <div className="text-5xl mb-4">⭐</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Valores</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Valorização do ser humano</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Respeito às relações comerciais e de parceria</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Empreendedorismo</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Busca por excelência</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Responsabilidade Socioambiental</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Klaüs Corporation & Klaüs Group */}
  <section className="py-20 bg-gray-50 text-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Klaüs Corporation */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-2 drop-shadow-lg bg-white/80 px-2 rounded">Klaüs Corporation</h2>
                <div className="w-16 h-1 bg-gray-600 mb-6"></div>
                <p className="text-gray-900 text-lg leading-relaxed mb-8 drop-shadow-md">
                  A Klaüs Corporation é uma empresa britânica especializada no fornecimento de manufatura e insumos para indústrias. Sediada na Inglaterra, a empresa nasceu do sucesso de sua equipe ao fornecer peças e componentes originais para diversas indústrias do mercado automotivo mundial. Com experiência de quase 20 anos de mercado, a direção da empresa preza pela excelência tecnológica para que seus produtos sejam desenvolvidos através dos mais elevados padrões de qualidade industrial e responsabilidade ambiental.
                </p>
                <img src="/Klaüs Corporation.png" alt="Klaüs Corporation" className="rounded-xl shadow-lg w-full object-cover h-56" />
              </div>
              {/* Klaüs Group */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-2 drop-shadow-lg bg-white/80 px-2 rounded">Klaüs Group</h2>
                <div className="w-16 h-1 bg-gray-600 mb-6"></div>
                <p className="text-gray-900 text-lg leading-relaxed mb-8 drop-shadow-md">
                  A Klaüs Group é a estrutura de gestão e investimento da empresa britânica Klaüs Corporation. Fundada em setembro de 2007 através do grupo de negócios KLAÜS, seu principal objetivo é a integração de recursos financeiros, humanos e tecnológicos para aplicação de excelência produtiva e desenvolvimento de negócios. Uma sociedade de participações que administra todo o conglomerado automotivo e suas respectivas marcas.
                </p>
                <img src="/Klaüs Group.png" alt="Klaüs Group" className="rounded-xl shadow-lg w-full object-cover h-56" />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
}
