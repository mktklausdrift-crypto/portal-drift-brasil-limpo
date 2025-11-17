import { Button } from "./Button"

// Exemplo de uso do componente Button
export default function ButtonExample() {
  return (
    <div className="space-y-4 p-8">
      <h2 className="text-2xl font-bold mb-6">Exemplos do Componente Button</h2>
      
      {/* Variantes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Variantes:</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      {/* Tamanhos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tamanhos:</h3>
        <div className="flex items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🚀</Button>
        </div>
      </div>

      {/* Estados */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Estados:</h3>
        <div className="flex gap-4">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      {/* Combinações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Combinações:</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" size="sm">Small Outline</Button>
          <Button variant="destructive" size="lg">Large Destructive</Button>
          <Button variant="ghost" size="icon">👻</Button>
        </div>
      </div>

      {/* Com click handlers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Interativos:</h3>
        <div className="flex gap-4">
          <Button onClick={() => alert('Botão clicado!')}>
            Clique aqui
          </Button>
          <Button 
            variant="outline" 
            onClick={() => console.log('Log no console')}
          >
            Log no Console
          </Button>
        </div>
      </div>
    </div>
  )
}