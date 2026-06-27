# 🎲 RPG Dice Roller - Three.js + React Three Fiber

Uma cena 3D interativa de um jogador de RPG rolando dados em uma bandeja, com sistema de skills integrado.

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+ instalado
- NPM ou Yarn

### Instalação

```bash
# Instalar dependências
npm install

# Rodar em modo de desenvolvimento
npm run dev

# Acessar no navegador
http://localhost:5173
```

### Build para Produção

```bash
npm run build
npm run preview
```

## 🎮 Funcionalidades

### Dados Disponíveis
- **D4** (Tetraedro)
- **D6** (Cubo)
- **D8** (Octaedro)
- **D10** (Decaedro)
- **D12** (Dodecaedro)
- **D20** (Icosaedro)
- **D100** (Esfera)

### Skills Mágicas
- 🔥 **Bola de Fogo** - Dado fica vermelho/laranja com brilho
- 💚 **Cura** - Dado fica verde com efeito mágico
- 🗡️ **Ataque Furtivo** - Dado fica roxo com partículas
- 🛡️ **Escudo Mágico** - Dado fica azul com aura

### Física Realista
- Gravidade simulada com Cannon.js
- Colisões com as paredes da bandeja
- Quiques e rolamentos naturais
- Detecção automática quando o dado para

## 📁 Estrutura do Projeto

```
/workspace
├── index.html              # HTML principal
├── package.json            # Dependências e scripts
├── vite.config.js          # Configuração do Vite
└── src/
    ├── main.jsx            # Entry point React
    ├── App.jsx             # Componente principal
    ├── index.css           # Estilos globais e UI
    ├── components/
    │   ├── Scene3D.jsx     # Cena Three.js + física
    │   └── UIOverlay.jsx   # Interface 2D sobreposta
    └── data/
        └── constants.js    # Dados das skills e tipos de dado
```

## 🔧 Como Adicionar Seus Próprios Modelos 3D

### Importando Dados Personalizados (.gltf/.glb)

1. **Coloque seus arquivos na pasta `public/models/`**

2. **Use o hook `useGLTF` do @react-three/drei:**

```jsx
import { useGLTF } from '@react-three/drei'

function CustomDice({ position }) {
  // Carrega o modelo GLTF
  const { nodes, materials } = useGLTF('/models/meu-dado.glb')
  
  return (
    <group position={position}>
      <mesh geometry={nodes.Dice.geometry} material={materials.DiceMaterial} />
    </group>
  )
}

// Pré-carregue os modelos para evitar loading
useGLTF.preload('/models/meu-dado.glb')
```

3. **Adicione colisão física ao modelo customizado:**

```jsx
import { useBox } from '@react-three/cannon'

function CustomDiceWithPhysics() {
  const [ref] = useBox(() => ({ 
    mass: 1, 
    position: [0, 2, 0],
    args: [1, 1, 1] // Caixa delimitadora aproximada
  }))
  
  const { scene } = useGLTF('/models/meu-dado.glb')
  
  return (
    <mesh ref={ref}>
      <primitive object={scene} />
    </mesh>
  )
}
```

### Importando Mãos/Skills Personalizadas

```jsx
function CustomHand({ position, rotation }) {
  const { nodes, materials } = useGLTF('/models/hand.glb')
  
  return (
    <group position={position} rotation={rotation}>
      <mesh 
        geometry={nodes.Hand.geometry} 
        material={materials.Skin} 
        castShadow
      />
    </group>
  )
}
```

### Otimizações para Modelos Customizados

1. **Use Draco compression** para reduzir tamanho dos arquivos:
```bash
# Instale gltf-pipeline
npm install -g gltf-pipeline

# Comprima seu modelo
gltf-pipeline -i modelo.glb -o modelo-compressed.glb -d
```

2. **Converta texturas para formato WebP/KTX2** para melhor performance

3. **Use LOD (Level of Detail)** para modelos complexos:
```jsx
import { LOD } from '@react-three/drei'

<LOD>
  <mesh distance={0}><highDetailModel /></mesh>
  <mesh distance={10}><mediumDetailModel /></mesh>
  <mesh distance={20}><lowDetailModel /></mesh>
</LOD>
```

## 🎨 Personalização

### Mudar Cores da Bandeja

No componente `DiceTray` em `Scene3D.jsx`:

```jsx
<meshStandardMaterial 
  color="#SUA_COR"  // Ex: '#2a2a2a' para preto
  roughness={0.8}
  metalness={0.2}
/>
```

### Adicionar Novas Skills

Edite `src/data/constants.js`:

```javascript
export const SKILLS = [
  // ... skills existentes
  {
    id: 'nova_skill',
    name: 'Nome da Skill',
    icon: '🌟',
    color: '#COR_PRINCIPAL',
    emissive: '#COR_BRILHO',
    description: 'Descrição do efeito',
    particleColor: new THREE.Color(r, g, b)
  }
]
```

### Ajustar Física

No componente `Dice`, ajuste os parâmetros do `useSphere`:

```javascript
const [ref, api] = useSphere(() => ({
  mass: 1.5,              // Mais pesado = menos quique
  restitution: 0.7,       // Mais elástico = mais quique
  friction: 0.5,          // Mais atrito = para mais rápido
  linearDamping: 0.5,     // Amortecimento linear
  angularDamping: 0.5,    // Amortecimento angular
}))
```

## 📚 Tecnologias Usadas

- **[Three.js](https://threejs.org/)** - Renderização 3D
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)** - React renderer for Three.js
- **[React Three Cannon](https://github.com/pmndrs/use-cannon)** - Hooks de física baseados em Cannon.js
- **[React Three Drei](https://github.com/pmndrs/drei)** - Helpers úteis para R3F
- **[Vite](https://vitejs.dev/)** - Build tool ultra-rápida

## 🎯 Próximos Passos Sugeridos

1. **Adicionar sons** de rolagem e colisão
2. **Implementar sistema de histórico** de rolagens
3. **Adicionar múltiplos dados** rolando simultaneamente
4. **Criar animações de partículas** mais elaboradas
5. **Integrar com API de RPG** (D&D Beyond, Roll20, etc.)
6. **Adicionar texturas reais** de madeira/couro
7. **Implementar detecção precisa** da face virada para cima

## 📝 Notas Importantes

### Integração Three.js + Cannon.js

A parte mais crucial é a sincronização entre o mundo físico (Cannon) e o mundo visual (Three.js):

```javascript
// No useFrame, sincronize a cada frame:
useFrame(() => {
  // Copia posição do corpo físico para o mesh visual
  meshRef.current.position.copy(ref.current.position)
  // Copia rotação (quaternion) do corpo físico para o mesh visual
  meshRef.current.quaternion.copy(ref.current.quaternion)
})
```

### Detecção de Quando o Dado Para

```javascript
// Calcula velocidades linear e angular
const linearSpeed = Math.sqrt(vx*vx + vy*vy + vz*vz)
const angularSpeed = Math.sqrt(avx*avx + avy*avy + avz*avz)

// Se ambas forem próximas de zero, o dado parou
if (linearSpeed < 0.1 && angularSpeed < 0.1) {
  // Resultado determinado
  api.sleep() // "Congela" o corpo para economizar CPU
}
```

## 🐛 Solução de Problemas

### O dado não aparece
- Verifique se as imports estão corretas
- Confira se o Canvas tem altura definida

### Física não funciona
- Certifique-se de que `<Physics>` envolve os objetos com física
- Verifique se `allowSleep` está habilitado

### Performance ruim
- Reduza `shadow-mapSize-width/height`
- Diminua a geometria dos dados
- Use `dpr={[1, 2]}` no Canvas para limitar pixel ratio

## 📄 Licença

MIT - Sinta-se livre para usar em seus projetos!

---

**Divirta-se rolando dados! 🎲✨**
