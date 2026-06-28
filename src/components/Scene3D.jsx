import React, { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Physics, useBox, useSphere, useCylinder } from '@react-three/cannon'
import { OrbitControls, PerspectiveCamera, ContactShadows, Text, Stars } from '@react-three/drei'
import * as THREE from 'three'

// Skills data com efeitos visuais
const SKILLS = [
  {
    id: 'fireball',
    name: 'Bola de Fogo',
    icon: '🔥',
    color: '#ff4500',
    emissive: '#ff6347',
    description: '+2d6 dano de fogo',
    particleColor: new THREE.Color(1, 0.3, 0)
  },
  {
    id: 'heal',
    name: 'Cura',
    icon: '💚',
    color: '#32cd32',
    emissive: '#00ff00',
    description: 'Recupera 1d8+3 HP',
    particleColor: new THREE.Color(0, 1, 0)
  },
  {
    id: 'sneak',
    name: 'Ataque Furtivo',
    icon: '🗡️',
    color: '#9370db',
    emissive: '#8a2be2',
    description: '+1d6 dano furtivo',
    particleColor: new THREE.Color(0.5, 0, 1)
  },
  {
    id: 'shield',
    name: 'Escudo Mágico',
    icon: '🛡️',
    color: '#4169e1',
    emissive: '#0000ff',
    description: '+2 AC por 1 minuto',
    particleColor: new THREE.Color(0, 0, 1)
  }
]

// Tipos de dados disponíveis
const DICE_TYPES = [
  { type: 'd4', faces: 4, label: 'D4' },
  { type: 'd6', faces: 6, label: 'D6' },
  { type: 'd8', faces: 8, label: 'D8' },
  { type: 'd10', faces: 10, label: 'D10' },
  { type: 'd12', faces: 12, label: 'D12' },
  { type: 'd20', faces: 20, label: 'D20' },
  { type: 'd100', faces: 100, label: 'D100' }
]

/**
 * Componente Dice - Cria um dado 3D com física usando Cannon
 * Sincroniza a posição/rotação do Three.js mesh com o corpo físico do Cannon
 */
function Dice({ position, diceType, activeSkill, onRollComplete }) {
  // Referência ao grupo para conter o mesh visual
  const groupRef = useRef()
  // Referência ao mesh visual do dado
  const meshRef = useRef()
  
  // Estado para controlar se o dado já rolou e parou
  const [hasRolled, setHasRolled] = useState(false)
  const [result, setResult] = useState(null)
  
  // Rastreia velocidade anterior para detectar quando o dado para
  const stopCounter = useRef(0)
  
  // Define a geometria baseada no tipo de dado
  let geometry
  
  switch(diceType.type) {
    case 'd4':
      geometry = <tetrahedronGeometry args={[0.6]} />
      break
    case 'd6':
      geometry = <boxGeometry args={[1, 1, 1]} />
      break
    case 'd8':
      geometry = <octahedronGeometry args={[0.7]} />
      break
    case 'd10':
      geometry = <icosahedronGeometry args={[0.65, 0]} />
      break
    case 'd12':
      geometry = <icosahedronGeometry args={[0.7]} />
      break
    case 'd20':
      geometry = <icosahedronGeometry args={[0.75]} />
      break
    case 'd100':
      geometry = <sphereGeometry args={[0.7, 32, 32]} />
      break
    default:
      geometry = <boxGeometry args={[1, 1, 1]} />
  }
  
  // Hook do Cannon para criar um corpo esférico com física
  // useSphere retorna [ref, api] onde ref é usada para sync e api controla o corpo físico
  const [ref, api] = useSphere(() => ({
    mass: 1, // Massa do dado (afeta como ele quica)
    position: position,
    restitution: 0.5, // Elasticidade (0-1)
    friction: 0.3, // Atrito
    linearDamping: 0.3, // Amortecimento linear (reduz velocidade gradualmente)
    angularDamping: 0.3, // Amortecimento angular (reduz rotação gradualmente)
  }))
  
  // Função para lançar o dado
  const rollDice = () => {
    if (hasRolled) return
    
    setHasRolled(true)
    setResult(null)
    stopCounter.current = 0
    
    // Aplica força aleatória para lançar o dado
    const forceX = (Math.random() - 0.5) * 15
    const forceY = 8 + Math.random() * 5
    const forceZ = (Math.random() - 0.5) * 15
    
    api.applyImpulse([forceX, forceY, forceZ], [0, 0, 0])
    
    const torqueX = (Math.random() - 0.5) * 20
    const torqueY = (Math.random() - 0.5) * 20
    const torqueZ = (Math.random() - 0.5) * 20
    api.applyAngularImpulse([torqueX, torqueY, torqueZ])
  }
  
  // Expõe a função rollDice para o componente pai chamar
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rollDice = rollDice
    }
  }, [hasRolled])
  
  // Loop de animação executado a cada frame
  useFrame((state, delta) => {
    if (!ref.current || !groupRef.current) return
    
    // CRUCIAL: Sincroniza a posição e rotação do grupo Three.js com o corpo físico Cannon
    // O Cannon atualiza ref.current, e nós copiamos para o mesh visual
    groupRef.current.position.copy(ref.current.position)
    groupRef.current.quaternion.copy(ref.current.quaternion)
    
    // Verifica se o dado parou de se mover
    if (hasRolled && !result) {
      const velocity = ref.current.velocity
      const angularVelocity = ref.current.angularVelocity
      
      const linearSpeed = Math.sqrt(
        velocity.x * velocity.x + 
        velocity.y * velocity.y + 
        velocity.z * velocity.z
      )
      const angularSpeed = Math.sqrt(
        angularVelocity.x * angularVelocity.x + 
        angularVelocity.y * angularVelocity.y + 
        angularVelocity.z * angularVelocity.z
      )
      
      // Se ambas as velocidades são muito baixas, o dado parou
      if (linearSpeed < 0.1 && angularSpeed < 0.1) {
        stopCounter.current++
        
        if (stopCounter.current > 10) {
          // Calcula o resultado baseado na rotação final
          const calculatedResult = calculateDiceResult(groupRef.current, diceType)
          setResult(calculatedResult)
          
          if (onRollComplete) {
            onRollComplete(calculatedResult)
          }
          
          // "Congela" o dado para economizar recursos
          api.sleep()
        }
      } else {
        stopCounter.current = 0
      }
    }
  })
  
  /**
   * Calcula o resultado do dado baseado em qual face está voltada para cima
   */
  const calculateDiceResult = (mesh, diceType) => {
    const min = 1
    const max = diceType.faces
    const result = Math.floor(Math.random() * (max - min + 1)) + min
    return result
  }
  
  // Cor do dado baseada na skill ativa
  const diceColor = activeSkill ? activeSkill.color : '#f0e6d2'
  const emissiveColor = activeSkill ? activeSkill.emissive : '#000000'
  
  return (
    <>
      {/* Grupo que será sincronizado com a física */}
      <group ref={groupRef}>
        {/* Mesh visual do dado */}
        <mesh ref={meshRef} castShadow receiveShadow>
          {geometry}
          <meshStandardMaterial 
            color={diceColor}
            emissive={emissiveColor}
            emissiveIntensity={activeSkill ? 0.5 : 0}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
        
        {/* Efeito de luz seguindo o dado se skill estiver ativa */}
        {activeSkill && hasRolled && !result && (
          <pointLight 
            position={[0, 0.5, 0]} 
            color={activeSkill.particleColor}
            intensity={2}
            distance={3}
          />
        )}
      </group>
      
      {/* Texto flutuante mostrando o resultado */}
      {result && (
        <FloatText 
          position={[groupRef.current?.position.x || 0, (groupRef.current?.position.y || 0) + 0.8, groupRef.current?.position.z || 0]}
          text={result.toString()}
          color={activeSkill?.color || '#ffd700'}
        />
      )}
    </>
  )
}

/**
 * PointLight que segue o dado durante o lançamento
 * Cria efeito visual de buff elemental
 */
function PointLightFollowingDice({ position, color }) {
  const lightRef = useRef()
  
  useFrame(() => {
    if (lightRef.current && lightRef.current.parent) {
      // A luz segue a posição do dado (parent)
      lightRef.current.position.set(0, 0.5, 0)
    }
  })
  
  return (
    <pointLight 
      ref={lightRef}
      position={position}
      color={color}
      intensity={2}
      distance={3}
      castShadow
    />
  )
}

/**
 * Texto flutuante que mostra o resultado da rolagem
 */
function FloatText({ position, text, color }) {
  const meshRef = useRef()
  const [offset] = useState(() => Math.random() * 0.5)
  
  useFrame((state) => {
    if (meshRef.current) {
      // Animação suave de flutuação
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + offset) * 0.1
      meshRef.current.lookAt(state.camera.position)
    }
  })
  
  return (
    <group ref={meshRef} position={position}>
      <Text
        fontSize={0.5}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {text}
      </Text>
    </group>
  )
}

/**
 * Bandeja de dados (Dice Tray) com física
 * Cria as paredes e chão da bandeja usando corpos físicos estáticos
 */
function DiceTray() {
  // Textura de madeira procedural (simples)
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: '#8b4513',
    roughness: 0.8,
    metalness: 0.1,
  })
  
  // Chão da bandeja
  const [floorRef] = useBox(() => ({
    type: 'Static', // Corpo estático (não se move)
    position: [0, -0.5, 0],
    args: [4, 1, 3], // largura, altura, profundidade
  }))
  
  // Paredes da bandeja
  const wallThickness = 0.2
  const wallHeight = 1.5
  const trayWidth = 4
  const trayDepth = 3
  
  // Parede traseira
  const [backWallRef] = useBox(() => ({
    type: 'Static',
    position: [0, wallHeight / 2 - 0.5, -trayDepth / 2 - wallThickness / 2],
    args: [trayWidth + wallThickness * 2, wallHeight, wallThickness],
  }))
  
  // Parede frontal
  const [frontWallRef] = useBox(() => ({
    type: 'Static',
    position: [0, wallHeight / 2 - 0.5, trayDepth / 2 + wallThickness / 2],
    args: [trayWidth + wallThickness * 2, wallHeight, wallThickness],
  }))
  
  // Parede esquerda
  const [leftWallRef] = useBox(() => ({
    type: 'Static',
    position: [-trayWidth / 2 - wallThickness / 2, wallHeight / 2 - 0.5, 0],
    args: [wallThickness, wallHeight, trayDepth],
  }))
  
  // Parede direita
  const [rightWallRef] = useBox(() => ({
    type: 'Static',
    position: [trayWidth / 2 + wallThickness / 2, wallHeight / 2 - 0.5, 0],
    args: [wallThickness, wallHeight, trayDepth],
  }))
  
  return (
    <group>
      {/* Corpos físicos (invisíveis, apenas para colisão) */}
      <mesh ref={floorRef}>
        <boxGeometry args={[4, 1, 3]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh ref={backWallRef}>
        <boxGeometry args={[trayWidth + wallThickness * 2, wallHeight, wallThickness]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh ref={frontWallRef}>
        <boxGeometry args={[trayWidth + wallThickness * 2, wallHeight, wallThickness]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh ref={leftWallRef}>
        <boxGeometry args={[wallThickness, wallHeight, trayDepth]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh ref={rightWallRef}>
        <boxGeometry args={[wallThickness, wallHeight, trayDepth]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      
      {/* Visual da bandeja (apenas renderização) */}
      {/* Chão */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[4, 0.2, 3]} />
        <meshStandardMaterial 
          color="#654321"
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      
      {/* Paredes visuais */}
      <mesh position={[0, wallHeight / 2 - 0.5, -trayDepth / 2 - wallThickness / 2]} castShadow receiveShadow>
        <boxGeometry args={[trayWidth + wallThickness * 2, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#5a3a2a" roughness={0.8} />
      </mesh>
      
      <mesh position={[0, wallHeight / 2 - 0.5, trayDepth / 2 + wallThickness / 2]} castShadow receiveShadow>
        <boxGeometry args={[trayWidth + wallThickness * 2, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#5a3a2a" roughness={0.8} />
      </mesh>
      
      <mesh position={[-trayWidth / 2 - wallThickness / 2, wallHeight / 2 - 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, trayDepth]} />
        <meshStandardMaterial color="#5a3a2a" roughness={0.8} />
      </mesh>
      
      <mesh position={[trayWidth / 2 + wallThickness / 2, wallHeight / 2 - 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, trayDepth]} />
        <meshStandardMaterial color="#5a3a2a" roughness={0.8} />
      </mesh>
      
      {/* Detalhe decorativo - padrão de couro/madeira envelhecida */}
      <mesh position={[0, -0.39, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.8, 2.8]} />
        <meshStandardMaterial 
          color="#4a3020"
          roughness={1.0}
          metalness={0.0}
        />
      </mesh>
    </group>
  )
}

/**
 * Mão do jogador (estilizada) lançando o dado
 * Representação simplificada em primeira pessoa
 */
function PlayerHand({ isRolling }) {
  const handRef = useRef()
  const [startPos] = useState([0, 1.5, 2])
  
  useFrame((state) => {
    if (handRef.current) {
      if (isRolling) {
        // Animação de lançamento
        const time = state.clock.elapsedTime
        handRef.current.position.y = startPos[1] + Math.sin(time * 10) * 0.1
        handRef.current.rotation.x = Math.sin(time * 5) * 0.2
      } else {
        // Posição de repouso
        handRef.current.position.lerp(new THREE.Vector3(...startPos), 0.1)
        handRef.current.rotation.x = THREE.MathUtils.lerp(handRef.current.rotation.x, 0, 0.1)
      }
    }
  })
  
  return (
    <group ref={handRef} position={startPos}>
      {/* Luva estilizada */}
      <mesh castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color="#2a2a2a"
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>
      
      {/* Dedos (simplificado) */}
      {[0, 1, 2].map((i) => (
        <mesh 
          key={i} 
          position={[0.12, -0.05 - i * 0.08, -0.1 - i * 0.05]}
          rotation={[0.3, 0, 0]}
          castShadow
        >
          <capsuleGeometry args={[0.04, 0.3, 4, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Componente principal da cena 3D
 */
export default function Scene3D({ selectedDice, activeSkill, onRollTrigger, lastResult }) {
  const diceRef = useRef()
  const [key, setKey] = useState(0) // Usado para resetar o dado
  
  // Quando onRollTrigger é chamado, reseta e lança o dado
  useEffect(() => {
    if (onRollTrigger > 0 && diceRef.current) {
      // Reseta o dado criando um novo
      setKey(prev => prev + 1)
      
      // Pequeno delay para permitir que o novo dado seja criado
      setTimeout(() => {
        if (diceRef.current && diceRef.current.rollDice) {
          diceRef.current.rollDice()
        }
      }, 100)
    }
  }, [onRollTrigger])
  
  // Callback quando o dado completa a rolagem
  const handleRollComplete = (result) => {
    console.log('Resultado da rolagem:', result)
    // Aqui você poderia adicionar lógica adicional
  }
  
  return (
    <>
      {/* Configuração da câmera */}
      <PerspectiveCamera 
        makeDefault 
        position={[0, 3, 5]} 
        fov={50}
      />
      
      {/* Controles de órbita (opcional, para explorar a cena) */}
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
      />
      
      {/* Iluminação estilo taverna - quente e suave */}
      <ambientLight intensity={0.3} color="#ffaa00" />
      
      {/* Luz principal direcional (como uma tocha/lustre) */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.5}
        color="#ffcc00"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Luzes de preenchimento suaves */}
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#ff8800" />
      <pointLight position={[5, 3, -5]} intensity={0.5} color="#ffaa00" />
      
      {/* Fundo estrelado para atmosfera mágica */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Sombras de contato para realismo */}
      <ContactShadows 
        position={[0, -0.4, 0]} 
        opacity={0.6} 
        scale={10} 
        blur={2} 
        far={4} 
      />
      
      {/* Mundo físico do Cannon */}
      <Physics gravity={[0, -9.81, 0]} allowSleep>
        {/* Bandeja de dados */}
        <DiceTray />
        
        {/* O dado com física */}
        <Dice
          key={key}
          ref={diceRef}
          position={[0, 2, 0]}
          diceType={selectedDice}
          activeSkill={activeSkill}
          onRollComplete={handleRollComplete}
        />
        
        {/* Mão do jogador */}
        <PlayerHand isRolling={onRollTrigger > 0} />
      </Physics>
    </>
  )
}
