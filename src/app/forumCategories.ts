export type Category = {
  slug: string;
  nome: string;
  descricao: string;
};

export const categories: Category[] = [
  {
    slug: "duvidas-tecnicas",
    nome: "Dúvidas Técnicas",
    descricao: "Tire dúvidas sobre manutenção, peças, instalação e funcionamento dos produtos Klaus Drift Brasil."
  },
  {
    slug: "projetos",
    nome: "Projetos & Customizações",
    descricao: "Compartilhe seu projeto, upgrades, swaps e customizações automotivas."
  },
  {
    slug: "eventos",
    nome: "Eventos & Encontros",
    descricao: "Divulgue ou encontre eventos, encontros e campeonatos de drift e performance."
  },
  {
    slug: "classificados",
    nome: "Classificados",
    descricao: "Compre, venda ou troque peças, carros e acessórios entre entusiastas."
  },
  {
    slug: "novidades",
    nome: "Novidades Klaus Drift",
    descricao: "Fique por dentro dos lançamentos, comunicados e novidades da marca."
  },
  {
    slug: "off-topic",
    nome: "Off-topic",
    descricao: "Converse sobre qualquer assunto, faça networking e troque experiências."
  }
];
