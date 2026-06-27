import React, { useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene3D from './components/Scene3D'
import UIOverlay from './components/UIOverlay'
import { DICE_TYPES } from './data/constants'
import * as THREE from 'three'

/**
 * Componente principal da aplicação
 * Gerencia o estado global e integra a cena 3D com a UI 2D
 */
export default function App() {
  // Estado para o tipo de dado selecionado (padrão: d20)
  const [selectedDice, setSelectedDice] = useState(DICE_TYPES.find(d => d.type === 'd20'))
  
  // Estado para a skill ativa (null = nenhuma skill ativa)
  const [activeSkill, setActiveSkill] = useState(null)
  
  // Estado para controlar o trigger de rolagem
  const [rollTrigger, setRollTrigger] = useState(0)
  
  // Estado para saber se está rolando no momento
  const [isRolling, setIsRolling] = useState(false)
  
  // Estado para armazenar o último resultado
  const [lastResult, setLastResult] = useState(null)
  
  // Handler para rolar o dado
  const handleRoll = () => {
    if (isRolling) return
    
    setIsRolling(true)
    setLastResult(null) // Limpa resultado anterior
    setRollTrigger(prev => prev + 1) // Incrementa trigger para iniciar nova rolagem
    
    // Timeout para resetar o estado de rolagem após tempo suficiente
    setTimeout(() => {
      setIsRolling(false)
    }, 3000) // 3 segundos é tempo suficiente para o dado parar
  }
  
  return (
    <>
      {/* Canvas 3D - Renderiza a cena Three.js */}
      <Canvas
        shadows
        camera={{ position: [0, 3, 5], fov: 50 }}
        gl={{ 
          antialias: true,
          shadowMap: {
            enabled: true,
            type: THREE.PCFSoftShadowMap
          }
        }}
      >
        {/* Cena 3D com física e todos os elementos */}
        <Scene3D
          selectedDice={selectedDice}
          activeSkill={activeSkill}
          onRollTrigger={rollTrigger}
          lastResult={lastResult}
        />
      </Canvas>
      
      {/* UI Overlay 2D - Interface do usuário sobreposta */}
      <UIOverlay
        selectedDice={selectedDice}
        setSelectedDice={setSelectedDice}
        activeSkill={activeSkill}
        setActiveSkill={setActiveSkill}
        onRoll={handleRoll}
        isRolling={isRolling}
        lastResult={lastResult}
      />
    </>
  )
}
