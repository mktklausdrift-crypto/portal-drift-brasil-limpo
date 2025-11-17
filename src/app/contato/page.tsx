export default function ContatoPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-4xl md:text-5xl font-black text-primary mb-8">Contato</h1>
      <form className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col gap-6">
        <div>
          <label htmlFor="nome" className="block text-sm font-bold mb-2 text-black">Nome</label>
          <input id="nome" name="nome" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-bold mb-2 text-black">E-mail</label>
          <input id="email" name="email" type="email" required className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label htmlFor="mensagem" className="block text-sm font-bold mb-2 text-black">Mensagem</label>
          <textarea id="mensagem" name="mensagem" rows={5} required className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <button type="submit" className="px-6 py-3 rounded bg-brand-yellow text-black font-bold hover:bg-brand-yellow-hover transition self-end">Enviar</button>
      </form>
      <div className="mt-8 text-gray-600 text-sm">
        <p>Ou, se preferir, envie um e-mail para <a href="mailto:contato@klausdrift.com.br" className="text-primary font-semibold hover:underline">contato@klausdrift.com.br</a></p>
      </div>
    </div>
  );
}